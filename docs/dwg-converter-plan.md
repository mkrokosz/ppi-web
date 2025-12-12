# DWG-to-DXF Converter Implementation Plan

## Overview

Add a containerized Lambda function to convert DWG files to DXF during the quote submission process. The converter will be invoked synchronously by the quote processor after virus scanning completes, and both the original DWG and converted DXF will be attached to the email.

## Current Flow (Before)

```
User uploads DWG → S3 → GuardDuty Scan → EventBridge → Quote Processor → Email with DWG
```

## New Flow (After)

```
User uploads DWG → S3 → GuardDuty Scan → EventBridge → Quote Processor
                                                            ↓
                                                   Is file .dwg?
                                                    ↓ YES    ↓ NO
                                          Invoke DWG Converter  │
                                                    ↓           │
                                          Get DXF back          │
                                                    ↓           │
                                          Email with DWG + DXF ←┘
```

## Implementation Tasks

### 1. Create DWG Converter Lambda (Container Image)

**Files to create:**

#### `infrastructure/lambda/dwg-converter/Dockerfile`
```dockerfile
FROM public.ecr.aws/lambda/python:3.12

# Install build dependencies
RUN dnf install -y gcc make tar xz && dnf clean all

# Download and build LibreDWG
RUN curl -L https://github.com/LibreDWG/libredwg/releases/download/0.12.5/libredwg-0.12.5.tar.xz | tar -xJ && \
    cd libredwg-0.12.5 && \
    ./configure --prefix=/opt && \
    make -j$(nproc) && \
    make install && \
    cd .. && rm -rf libredwg-0.12.5

# Add LibreDWG to path
ENV PATH="/opt/bin:${PATH}"
ENV LD_LIBRARY_PATH="/opt/lib:${LD_LIBRARY_PATH}"

# Install Python dependencies
RUN pip install boto3

# Copy handler
COPY handler.py ${LAMBDA_TASK_ROOT}

CMD ["handler.lambda_handler"]
```

#### `infrastructure/lambda/dwg-converter/handler.py`
```python
"""
DWG to DXF Converter Lambda

Converts DWG files to DXF format using LibreDWG.
Invoked synchronously by the quote processor when a DWG file is uploaded.
"""
import subprocess
import tempfile
import os
import boto3
import base64

s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Convert a DWG file from S3 to DXF.

    Input event:
    {
        "bucket": "bucket-name",
        "key": "quotes/file.dwg"
    }

    Returns:
    {
        "success": true,
        "dxf_content": "<base64-encoded DXF>",
        "dxf_filename": "file.dxf"
    }
    """
    bucket = event['bucket']
    key = event['key']

    print(f"Converting s3://{bucket}/{key}")

    with tempfile.TemporaryDirectory() as tmpdir:
        dwg_path = os.path.join(tmpdir, 'input.dwg')
        dxf_path = os.path.join(tmpdir, 'output.dxf')

        # Download DWG from S3
        s3.download_file(bucket, key, dwg_path)
        print(f"Downloaded {key} ({os.path.getsize(dwg_path)} bytes)")

        # Convert DWG to DXF using LibreDWG
        result = subprocess.run(
            ['dwg2dxf', dwg_path, '-o', dxf_path],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            print(f"Conversion failed: {result.stderr}")
            return {
                'success': False,
                'error': result.stderr or 'Conversion failed'
            }

        # Read converted DXF
        with open(dxf_path, 'rb') as f:
            dxf_content = f.read()

        # Generate DXF filename from original
        original_filename = os.path.basename(key)
        dxf_filename = os.path.splitext(original_filename)[0] + '.dxf'

        print(f"Conversion successful: {dxf_filename} ({len(dxf_content)} bytes)")

        return {
            'success': True,
            'dxf_content': base64.b64encode(dxf_content).decode('utf-8'),
            'dxf_filename': dxf_filename
        }
```

### 2. Create ECR Repository and Build Pipeline

#### Add to `cloudformation.yaml`:

```yaml
# ===========================================
# DWG Converter Lambda (Container Image)
# ===========================================

# ECR Repository for DWG Converter
DwgConverterRepository:
  Type: AWS::ECR::Repository
  Properties:
    RepositoryName: !Sub '${AWS::StackName}-dwg-converter'
    ImageScanningConfiguration:
      ScanOnPush: true
    LifecyclePolicy:
      LifecyclePolicyText: |
        {
          "rules": [
            {
              "rulePriority": 1,
              "description": "Keep only 3 images",
              "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 3
              },
              "action": {
                "type": "expire"
              }
            }
          ]
        }
    Tags:
      - Key: Project
        Value: ProPlasticsWebsite

# IAM Role for DWG Converter Lambda
DwgConverterLambdaRole:
  Type: AWS::IAM::Role
  Properties:
    RoleName: !Sub '${AWS::StackName}-dwg-converter-role'
    AssumeRolePolicyDocument:
      Version: '2012-10-17'
      Statement:
        - Effect: Allow
          Principal:
            Service: lambda.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    Policies:
      - PolicyName: S3ReadPermissions
        PolicyDocument:
          Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - s3:GetObject
              Resource: !Sub '${QuoteAttachmentsBucket.Arn}/*'
    Tags:
      - Key: Project
        Value: ProPlasticsWebsite

# DWG Converter Lambda Function (Container Image)
DwgConverterFunction:
  Type: AWS::Lambda::Function
  Properties:
    FunctionName: !Sub '${AWS::StackName}-dwg-converter'
    PackageType: Image
    Code:
      ImageUri: !Sub '${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/${DwgConverterRepository}:latest'
    Role: !GetAtt DwgConverterLambdaRole.Arn
    Timeout: 60
    MemorySize: 512
    Architectures:
      - x86_64
    Tags:
      - Key: Project
        Value: ProPlasticsWebsite
```

### 3. Update Quote Processor Lambda

#### Modify `infrastructure/lambda/quote_processor.py`:

Add at top:
```python
lambda_client = boto3.client('lambda')
DWG_CONVERTER_FUNCTION = os.environ.get('DWG_CONVERTER_FUNCTION', '')
```

Add new function:
```python
def convert_dwg_to_dxf(bucket, key):
    """
    Invoke DWG converter Lambda to convert file to DXF.
    Returns (dxf_content_bytes, dxf_filename) or (None, None) on failure.
    """
    if not DWG_CONVERTER_FUNCTION:
        print("DWG converter function not configured")
        return None, None

    try:
        response = lambda_client.invoke(
            FunctionName=DWG_CONVERTER_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps({
                'bucket': bucket,
                'key': key
            })
        )

        result = json.loads(response['Payload'].read())

        if result.get('success'):
            dxf_content = base64.b64decode(result['dxf_content'])
            dxf_filename = result['dxf_filename']
            print(f"DWG converted successfully: {dxf_filename}")
            return dxf_content, dxf_filename
        else:
            print(f"DWG conversion failed: {result.get('error', 'Unknown error')}")
            return None, None

    except Exception as e:
        print(f"Error invoking DWG converter: {e}")
        return None, None
```

Modify `send_email_with_attachment()` to accept multiple attachments:
```python
def send_email_with_attachment(form_data, attachments):
    """
    Send quote request email with file attachment(s).

    attachments: list of (content_bytes, filename, content_type) tuples
    """
    # ... existing setup code ...

    # Add all attachments
    for file_content, filename, content_type in attachments:
        att = MIMEApplication(file_content)
        att.add_header('Content-Disposition', 'attachment', filename=filename)
        att.add_header('Content-Type', content_type)
        msg.attach(att)

    # ... rest of function ...
```

Modify handler to check for DWG and convert:
```python
if scan_result == 'NO_THREATS_FOUND':
    file_content = obj['Body'].read()
    attachments = [(file_content, original_filename, content_type)]

    # If DWG file, also convert to DXF and attach both
    if original_filename.lower().endswith('.dwg'):
        dxf_content, dxf_filename = convert_dwg_to_dxf(bucket, key)
        if dxf_content:
            attachments.append((dxf_content, dxf_filename, 'application/dxf'))
            print(f"Attaching both DWG and DXF to email")

    send_email_with_attachment(form_data, attachments)
```

### 4. Update CloudFormation for Quote Processor

Add environment variable to `QuoteProcessorFunction`:
```yaml
Environment:
  Variables:
    # ... existing vars ...
    DWG_CONVERTER_FUNCTION: !Ref DwgConverterFunction
```

Add Lambda invoke permission to `QuoteProcessorLambdaRole`:
```yaml
- Effect: Allow
  Action:
    - lambda:InvokeFunction
  Resource: !GetAtt DwgConverterFunction.Arn
```

### 5. Update GitHub Actions Workflow

#### Modify `.github/workflows/deploy.yaml`:

Add ECR login and Docker build steps:
```yaml
- name: Login to Amazon ECR
  id: login-ecr
  uses: aws-actions/amazon-ecr-login@v2

- name: Build and push DWG converter image
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    ECR_REPOSITORY: ${{ github.event.repository.name }}-dwg-converter
    IMAGE_TAG: ${{ github.sha }}
  run: |
    cd infrastructure/lambda/dwg-converter
    docker build --platform linux/amd64 -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
    docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
```

### 6. Add IAM Permissions for GitHub Actions

Update OIDC role to allow ECR push:
```yaml
- Effect: Allow
  Action:
    - ecr:GetAuthorizationToken
  Resource: '*'
- Effect: Allow
  Action:
    - ecr:BatchCheckLayerAvailability
    - ecr:GetDownloadUrlForLayer
    - ecr:BatchGetImage
    - ecr:PutImage
    - ecr:InitiateLayerUpload
    - ecr:UploadLayerPart
    - ecr:CompleteLayerUpload
  Resource: !Sub 'arn:aws:ecr:${AWS::Region}:${AWS::AccountId}:repository/${AWS::StackName}-dwg-converter'
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `infrastructure/lambda/dwg-converter/Dockerfile` | CREATE | Container image with LibreDWG |
| `infrastructure/lambda/dwg-converter/handler.py` | CREATE | DWG converter Lambda handler |
| `infrastructure/lambda/quote_processor.py` | MODIFY | Add DWG detection and converter invocation |
| `infrastructure/cloudformation.yaml` | MODIFY | Add ECR repo, Lambda function, IAM roles |
| `.github/workflows/deploy.yaml` | MODIFY | Add Docker build/push steps |

## Deployment Order

1. **First deployment** (creates ECR repo):
   - Deploy CloudFormation with ECR repository
   - Lambda function will fail initially (no image yet)

2. **Build and push image**:
   - Build Docker image locally or via GitHub Actions
   - Push to ECR repository

3. **Second deployment** (or automatic via CI):
   - Lambda function now has valid image
   - Full functionality available

## Testing Plan

1. **Unit test converter locally**:
   ```bash
   cd infrastructure/lambda/dwg-converter
   docker build -t dwg-converter .
   docker run --rm -v /path/to/test.dwg:/tmp/test.dwg dwg-converter \
     python -c "import handler; print(handler.lambda_handler({'bucket':'test','key':'test.dwg'}, None))"
   ```

2. **Integration test**:
   - Upload a DWG file via the quote form
   - Verify email received with both DWG and DXF attachments

3. **Error handling test**:
   - Upload a corrupted DWG file
   - Verify email sent with original DWG only (graceful degradation)

## Estimated Costs

- **ECR Storage**: ~$0.10/GB/month (image ~500MB = $0.05/month)
- **Lambda execution**: ~$0.0001 per conversion (512MB, 10-30 sec)
- **Negligible for occasional quote submissions**

## Rollback Plan

If issues arise:
1. Set `DWG_CONVERTER_FUNCTION` env var to empty string
2. Quote processor will skip conversion and attach DWG only
3. No user-facing impact (DXF is a nice-to-have)
