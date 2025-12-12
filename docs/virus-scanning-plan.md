# Virus Scanning Implementation Plan
## S3 + GuardDuty Malware Protection

### Overview

When a user uploads a file with their quote request, the file is first uploaded to S3 for malware scanning before being attached to the email. This provides enterprise-grade security using AWS-native services.

---

## Architecture

### Flow A: Without Attachment (Synchronous)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Lambda     │────▶│    SES      │
│  (Submit)   │     │ (Contact)   │     │  (Email)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Flow:**
1. User submits quote form **without** file attachment
2. Contact Form Lambda sends email directly via SES (existing behavior)
3. Returns success to user immediately

### Flow B: With Attachment (Async with Virus Scan)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Lambda     │────▶│     S3      │────▶│  GuardDuty  │
│  (Upload)   │     │ (Contact)   │     │  (Staging)  │     │  (Scan)     │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                    ┌─────────────┐     ┌─────────────┐            │
                    │    SES      │◀────│  Lambda     │◀───────────┘
                    │  (Email)    │     │ (Process)   │      EventBridge
                    └─────────────┘     └─────────────┘
```

**Flow:**
1. User submits quote form **with** file attachment
2. Contact Form Lambda:
   - Validates file type/size (existing logic)
   - Uploads file to S3 staging bucket with form data in metadata
   - Returns success to user immediately ("Your quote request has been received")
3. GuardDuty Malware Protection automatically scans the uploaded file
4. EventBridge receives scan completion event
5. Quote Processor Lambda (new) is triggered:
   - If **CLEAN**: Retrieves file from S3, sends email with attachment, deletes file
   - If **MALICIOUS**: Logs threat, sends email WITHOUT attachment (with warning note), deletes file
   - If **SCAN FAILED**: Sends email without attachment, alerts admin

---

## Components to Create/Modify

### 1. S3 Bucket (New)
- **Name**: `proplastics.us-quote-attachments`
- **Lifecycle rule**: Auto-delete objects after 30 days (safety net for failed scans)
- **Encryption**: SSE-S3 (default)
- **Public access**: Blocked

### 2. GuardDuty Malware Protection (New)
- Enable Malware Protection for S3 on the staging bucket
- Configure to scan all new objects

### 3. Contact Form Lambda (Modify)
- **Without attachment**: Send email directly via SES (existing behavior, no changes)
- **With attachment**: Upload file to S3 instead of attaching directly
- Store form data in S3 object metadata or DynamoDB
- Return success immediately (async processing for attachments)

### 4. Quote Processor Lambda (New)
- Triggered by EventBridge (GuardDuty scan complete)
- Retrieves scan result and file
- Sends email via SES (with or without attachment based on scan)
- Deletes file from S3

### 5. EventBridge Rule (New)
- Pattern: GuardDuty Malware Protection scan complete events
- Target: Quote Processor Lambda

### 6. IAM Permissions (Update)
- Contact Form Lambda: S3 PutObject
- Quote Processor Lambda: S3 GetObject, S3 DeleteObject, SES SendRawEmail

---

## Detailed Implementation

### S3 Object Structure

```
s3://ppi-quote-attachments-staging/
  └── quotes/
      └── {uuid}.{ext}
```

**Object Metadata:**
```json
{
  "x-amz-meta-form-data": "{base64 encoded form JSON}",
  "x-amz-meta-original-filename": "drawing.pdf",
  "x-amz-meta-content-type": "application/pdf",
  "x-amz-meta-submitted-at": "2024-01-15T10:30:00Z"
}
```

### Contact Form Lambda Changes

```python
# Decision logic in handler:

attachment = body.get('attachment')

if attachment:
    # FLOW B: With attachment - async processing via S3 + GuardDuty
    return handle_attachment_submission(form_data, attachment)
else:
    # FLOW A: No attachment - send email directly (existing behavior)
    send_email_without_attachment(form_data)
    return {'message': 'Message sent successfully'}


def handle_attachment_submission(form_data, attachment):
    """
    Upload file to S3 for virus scanning.
    Email will be sent by Quote Processor Lambda after scan completes.
    """
    submission_id = str(uuid.uuid4())
    filename = attachment['filename']
    ext = filename.rsplit('.', 1)[-1].lower()
    s3_key = f"quotes/{submission_id}.{ext}"

    # Store form data in metadata (or DynamoDB for large payloads)
    metadata = {
        'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
        'original-filename': filename,
        'content-type': attachment['contentType'],
        'submitted-at': datetime.utcnow().isoformat()
    }

    s3.put_object(
        Bucket='ppi-quote-attachments-staging',
        Key=s3_key,
        Body=base64.b64decode(attachment['content']),
        Metadata=metadata
    )

    # Return success - email will be sent after scan completes
    return {'message': 'Quote request received. You will receive a confirmation email shortly.'}
```

### Quote Processor Lambda (New)

```python
import json
import boto3
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

s3 = boto3.client('s3')
ses = boto3.client('ses')

def handler(event, context):
    """
    Triggered by EventBridge when GuardDuty scan completes.

    Event structure:
    {
        "detail-type": "GuardDuty Malware Protection Object Scan Result",
        "detail": {
            "s3ObjectDetails": {
                "bucketName": "ppi-quote-attachments-staging",
                "objectKey": "quotes/abc123.pdf"
            },
            "scanResultDetails": {
                "scanResult": "NO_THREATS_FOUND" | "THREATS_FOUND" | ...
            }
        }
    }
    """
    detail = event['detail']
    bucket = detail['s3ObjectDetails']['bucketName']
    key = detail['s3ObjectDetails']['objectKey']
    scan_result = detail['scanResultDetails']['scanResult']

    # Get object and metadata
    obj = s3.get_object(Bucket=bucket, Key=key)
    metadata = obj['Metadata']
    form_data = json.loads(base64.b64decode(metadata['form-data']))

    if scan_result == 'NO_THREATS_FOUND':
        # Clean file - send email with attachment
        file_content = obj['Body'].read()
        send_email_with_attachment(
            form_data,
            file_content,
            metadata['original-filename'],
            metadata['content-type']
        )
    elif scan_result == 'THREATS_FOUND':
        # Malicious file - send email WITHOUT attachment, log threat
        print(f"THREAT DETECTED in {key}")
        send_email_without_attachment(
            form_data,
            threat_warning=True
        )
    else:
        # Scan failed/unsupported - send without attachment
        send_email_without_attachment(form_data, scan_failed=True)

    # Clean up - delete from S3
    s3.delete_object(Bucket=bucket, Key=key)
```

### EventBridge Rule

```yaml
# In SAM template
QuoteScanCompleteRule:
  Type: AWS::Events::Rule
  Properties:
    Name: ppi-quote-scan-complete
    EventPattern:
      source:
        - aws.guardduty
      detail-type:
        - "GuardDuty Malware Protection Object Scan Result"
      detail:
        s3ObjectDetails:
          bucketName:
            - !Ref QuoteAttachmentsBucket
    Targets:
      - Id: QuoteProcessorLambda
        Arn: !GetAtt QuoteProcessorFunction.Arn
```

### SAM Template Additions

```yaml
# S3 Bucket for staging attachments
QuoteAttachmentsBucket:
  Type: AWS::S3::Bucket
  Properties:
    BucketName: ppi-quote-attachments-staging
    LifecycleConfiguration:
      Rules:
        - Id: DeleteOldFiles
          Status: Enabled
          ExpirationInDays: 1
    PublicAccessBlockConfiguration:
      BlockPublicAcls: true
      BlockPublicPolicy: true
      IgnorePublicAcls: true
      RestrictPublicBuckets: true

# Quote Processor Lambda
QuoteProcessorFunction:
  Type: AWS::Serverless::Function
  Properties:
    Handler: quote_processor.handler
    Runtime: python3.11
    Timeout: 30
    Environment:
      Variables:
        FROM_EMAIL: !Ref FromEmail
        RECIPIENT_EMAIL: !Ref RecipientEmail
        CC_EMAIL: !Ref CcEmail
    Policies:
      - S3ReadPolicy:
          BucketName: !Ref QuoteAttachmentsBucket
      - S3CrudPolicy:
          BucketName: !Ref QuoteAttachmentsBucket
      - SESCrudPolicy:
          IdentityName: !Ref FromEmail
```

---

## Cost Estimate

### GuardDuty Malware Protection for S3
| Volume | GB Scanned | Cost |
|--------|-----------|------|
| 100 files/month @ 5MB avg | 0.5 GB | $0.50 |
| 500 files/month @ 5MB avg | 2.5 GB | $2.50 |
| 1000 files/month @ 5MB avg | 5 GB | $5.00 |
| 1000 files/month @ 10MB avg | 10 GB | $10.00 |

**Pricing**: $1.00 per GB scanned (first 500 GB/month)

### S3 Storage
- Negligible (files deleted within minutes/hours)
- ~$0.01/month even with 1000 files

### Lambda
- Negligible additional cost
- Quote Processor adds ~100ms per invocation
- ~$0.01/month for 1000 invocations

### EventBridge
- Free for AWS service events

### Total Estimated Monthly Cost

| Scenario | Files/Month | Avg Size | Monthly Cost |
|----------|-------------|----------|--------------|
| Low | 50 | 2MB | ~$0.10 |
| Medium | 200 | 5MB | ~$1.00 |
| High | 500 | 5MB | ~$2.50 |
| Very High | 1000 | 10MB | ~$10.00 |

---

## Implementation Steps

### Phase 1: Deploy CloudFormation Stack
The following resources are created automatically via CloudFormation:
- [x] S3 bucket (`proplastics.us-quote-attachments`) with 30-day lifecycle rule
- [x] Quote Processor Lambda function
- [x] EventBridge rule for GuardDuty scan completion
- [x] IAM roles and permissions
- [x] Contact Form Lambda updated to upload to S3

**Deploy command:**
```bash
cd infrastructure
aws cloudformation deploy \
  --template-file cloudformation.yaml \
  --stack-name proplastics-website \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    HostedZoneId=YOUR_HOSTED_ZONE_ID \
    RecaptchaSecretKey=YOUR_RECAPTCHA_KEY
```

### Phase 2: Manual GuardDuty Setup (Required)
GuardDuty Malware Protection for S3 cannot be configured via CloudFormation.
You must complete these steps manually in the AWS Console:

1. **Enable GuardDuty** (if not already enabled):
   - Go to AWS Console → GuardDuty
   - Click "Get Started" → "Enable GuardDuty"

2. **Enable Malware Protection for S3**:
   - In GuardDuty, go to "Protection plans" → "Malware Protection"
   - Click "Configure" under "Malware Protection for S3"
   - Click "Enable"

3. **Add the S3 Bucket for Protection**:
   - Click "Add bucket"
   - Select `proplastics.us-quote-attachments`
   - For "Object prefix", enter: `quotes/`
   - Choose "Scan all objects" or keep defaults
   - Click "Add bucket"

4. **Verify EventBridge Integration**:
   - GuardDuty automatically sends scan results to EventBridge
   - The EventBridge rule (`proplastics-website-quote-scan-complete`) will trigger the Quote Processor Lambda

### Phase 3: Testing
**Flow A (No Attachment):**
1. [ ] Test quote submission without attachment → email sent immediately
2. [ ] Test contact form submission → email sent immediately (unchanged behavior)

**Flow B (With Attachment):**
3. [ ] Test clean file upload → email with attachment after scan
4. [ ] Test malicious file upload → email without attachment (use EICAR test file)
   - EICAR test file: `X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`
5. [ ] Test oversized file rejection (client-side and server-side)
6. [ ] Test invalid file type rejection (client-side and server-side)
7. [ ] Verify S3 cleanup after processing (check bucket is empty)

**Both Flows:**
8. [ ] Test email routing (mattkrokosz@gmail.com test mode)

### Phase 4: Monitoring
1. [ ] Check CloudWatch Logs for `quote-processor` Lambda
2. [ ] Check GuardDuty findings for any detected threats
3. [ ] Verify S3 bucket objects are being cleaned up

---

## Considerations & Trade-offs

### Pros
- AWS-native, no third-party dependencies
- Enterprise-grade scanning
- Automatic updates to malware signatures
- Async processing = faster response for user
- Audit trail via CloudWatch/GuardDuty

### Cons
- More complex architecture
- Slight delay in email delivery (scan takes 5-30 seconds typically)
- Additional AWS services to manage
- Cost scales with volume (though minimal for typical usage)

### Alternative: Synchronous Scanning
If you prefer the user to wait and know immediately if their file was rejected:
- Use a Step Functions workflow with a wait loop
- Poll GuardDuty for scan result (typically completes in 5-30 seconds)
- More complex, but immediate feedback

---

## Security Notes

1. **S3 bucket is private** - No public access
2. **Files auto-delete** - 30-day lifecycle rule as safety net
3. **Malicious files never reach email** - Blocked before attachment
4. **Audit logging** - GuardDuty findings logged for security review
5. **Test email routing** - Still works (mattkrokosz@gmail.com logic preserved)

---

## Questions for Review

1. Is async processing acceptable? (User sees "received" immediately, email sent after scan)
2. Should we notify the user differently if their file was flagged as malicious?
3. Do you want SNS alerts when malware is detected?
4. Should we store scan results/logs in DynamoDB for reporting?
