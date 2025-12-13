"""
Quote Processor Lambda

Triggered by EventBridge when GuardDuty Malware Protection completes scanning
a file uploaded to the quote attachments S3 bucket.

Sends the quote request email with or without the attachment based on scan results.
Includes inline preview images for supported file types.
"""

import json
import boto3
import os
import base64
import html
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.mime.image import MIMEImage
from botocore.exceptions import ClientError

from email_utils import get_destination

s3 = boto3.client('s3')
ses = boto3.client('ses', region_name='us-east-1')
lambda_client = boto3.client('lambda')

DWG_CONVERTER_FUNCTION = os.environ.get('DWG_CONVERTER_FUNCTION', '')
PREVIEW_GENERATOR_FUNCTION = os.environ.get('PREVIEW_GENERATOR_FUNCTION', '')

# File extensions that support preview generation
PREVIEW_SUPPORTED_EXTENSIONS = {
    '.dxf', '.stl', '.step', '.stp', '.iges', '.igs',
    '.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.tif'
}


def handler(event, context):
    """
    Handle GuardDuty Malware Protection scan completion events.

    Event structure:
    {
        "detail-type": "GuardDuty Malware Protection Object Scan Result",
        "detail": {
            "s3ObjectDetails": {
                "bucketName": "bucket-name",
                "objectKey": "quotes/abc123.pdf"
            },
            "scanResultDetails": {
                "scanResult": "NO_THREATS_FOUND" | "THREATS_FOUND" | "UNSUPPORTED" | "ACCESS_DENIED" | "FAILED"
            }
        }
    }
    """
    print(f"Received event: {json.dumps(event)}")

    try:
        detail = event.get('detail', {})
        s3_details = detail.get('s3ObjectDetails', {})
        scan_details = detail.get('scanResultDetails', {})

        bucket = s3_details.get('bucketName')
        key = s3_details.get('objectKey')
        scan_result = scan_details.get('scanResultStatus', 'UNKNOWN')

        if not bucket or not key:
            print("Missing bucket or key in event")
            return {'statusCode': 400, 'body': 'Missing bucket or key'}

        print(f"Processing scan result for s3://{bucket}/{key}: {scan_result}")

        # Get object and metadata
        try:
            obj = s3.get_object(Bucket=bucket, Key=key)
            metadata = obj['Metadata']
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                print(f"Object {key} not found - may have been deleted already")
                return {'statusCode': 200, 'body': 'Object not found'}
            raise

        # Decode form data from metadata
        form_data_b64 = metadata.get('form-data', '')
        if not form_data_b64:
            print("No form data in metadata")
            return {'statusCode': 400, 'body': 'No form data in metadata'}

        form_data = json.loads(base64.b64decode(form_data_b64).decode('utf-8'))
        original_filename = metadata.get('original-filename', 'attachment')
        content_type = metadata.get('content-type', 'application/octet-stream')

        print(f"Form data: {json.dumps({k: v for k, v in form_data.items() if k != 'message'})}")

        # Process based on scan result
        if scan_result == 'NO_THREATS_FOUND':
            # Clean file - send email with attachment
            file_content = obj['Body'].read()
            print(f"File is clean: {original_filename} ({len(file_content)} bytes)")

            # Build list of attachments (original file first)
            attachments = [(file_content, original_filename, content_type)]

            # Track if we have a DXF for preview (converted from DWG)
            dxf_content_for_preview = None

            # If DWG file, also convert to DXF and attach both
            if original_filename.lower().endswith('.dwg'):
                print("DWG file detected, attempting conversion to DXF")
                dxf_content, _ = convert_dwg_to_dxf(bucket, key)
                if dxf_content:
                    # Use original filename with .dxf extension
                    dxf_filename = original_filename.rsplit('.', 1)[0] + '.dxf'
                    attachments.append((dxf_content, dxf_filename, 'application/dxf'))
                    dxf_content_for_preview = dxf_content
                    print(f"Will attach both {original_filename} and {dxf_filename} to email")
                else:
                    print("DXF conversion failed, will attach DWG only")

            # Generate preview image
            preview_content = None
            file_ext = get_file_extension(original_filename)

            if original_filename.lower().endswith('.dwg') and dxf_content_for_preview:
                # For DWG, generate preview from the converted DXF
                print("Generating preview from converted DXF")
                preview_content = generate_preview_from_content(
                    dxf_content_for_preview,
                    original_filename.rsplit('.', 1)[0] + '.dxf'
                )
            elif file_ext in PREVIEW_SUPPORTED_EXTENSIONS:
                # Generate preview directly from the file
                print(f"Generating preview for {file_ext} file")
                preview_content = generate_preview(bucket, key)

            send_email_with_attachment(form_data, attachments, preview_content)

        elif scan_result == 'THREATS_FOUND':
            # Malicious file - send email WITHOUT attachment
            print(f"THREAT DETECTED in {key}! Sending email without attachment.")
            send_email_without_attachment(form_data, threat_detected=True)

        else:
            # Scan failed, unsupported, or other issue - send without attachment
            print(f"Scan result: {scan_result}. Sending email without attachment.")
            send_email_without_attachment(form_data, scan_failed=True, scan_result=scan_result)

        # Clean up - delete from S3
        try:
            s3.delete_object(Bucket=bucket, Key=key)
            print(f"Deleted {key} from {bucket}")
        except Exception as del_err:
            print(f"Warning: Failed to delete {key}: {del_err}")

        return {'statusCode': 200, 'body': 'Processed successfully'}

    except Exception as e:
        print(f"Error processing event: {e}")
        raise


def get_file_extension(filename):
    """Get lowercase file extension including the dot."""
    if '.' in filename:
        return '.' + filename.rsplit('.', 1)[1].lower()
    return ''


def convert_dwg_to_dxf(bucket, key):
    """
    Invoke DWG converter Lambda to convert file to DXF.
    Returns (dxf_content_bytes, dxf_filename) or (None, None) on failure.
    """
    if not DWG_CONVERTER_FUNCTION:
        print("DWG converter function not configured, skipping conversion")
        return None, None

    try:
        print(f"Invoking DWG converter for s3://{bucket}/{key}")
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
            print(f"DWG converted successfully: {dxf_filename} ({len(dxf_content)} bytes)")
            return dxf_content, dxf_filename
        else:
            print(f"DWG conversion failed: {result.get('error', 'Unknown error')}")
            return None, None

    except Exception as e:
        print(f"Error invoking DWG converter: {e}")
        return None, None


def generate_preview(bucket, key):
    """
    Invoke preview generator Lambda to create a preview image.
    Returns preview_content_bytes or None on failure.
    """
    if not PREVIEW_GENERATOR_FUNCTION:
        print("Preview generator function not configured, skipping preview")
        return None

    try:
        print(f"Invoking preview generator for s3://{bucket}/{key}")
        response = lambda_client.invoke(
            FunctionName=PREVIEW_GENERATOR_FUNCTION,
            InvocationType='RequestResponse',
            Payload=json.dumps({
                'bucket': bucket,
                'key': key
            })
        )

        result = json.loads(response['Payload'].read())

        if result.get('success'):
            preview_content = base64.b64decode(result['preview_content'])
            print(f"Preview generated successfully ({len(preview_content)} bytes)")
            return preview_content
        else:
            print(f"Preview generation failed: {result.get('error', 'Unknown error')}")
            return None

    except Exception as e:
        print(f"Error invoking preview generator: {e}")
        return None


def generate_preview_from_content(file_content, filename):
    """
    Generate preview by uploading content to S3 temporarily and invoking preview generator.
    Used for DXF content converted from DWG.
    Returns preview_content_bytes or None on failure.
    """
    if not PREVIEW_GENERATOR_FUNCTION:
        print("Preview generator function not configured, skipping preview")
        return None

    bucket = os.environ.get('ATTACHMENTS_BUCKET', '')
    if not bucket:
        print("ATTACHMENTS_BUCKET not configured")
        return None

    # Upload to a temporary key
    import uuid
    temp_key = f"temp-preview/{uuid.uuid4()}/{filename}"

    try:
        # Upload the content
        s3.put_object(Bucket=bucket, Key=temp_key, Body=file_content)
        print(f"Uploaded temp file for preview: s3://{bucket}/{temp_key}")

        # Generate preview
        preview_content = generate_preview(bucket, temp_key)

        # Clean up temp file
        try:
            s3.delete_object(Bucket=bucket, Key=temp_key)
        except Exception:
            pass

        return preview_content

    except Exception as e:
        print(f"Error generating preview from content: {e}")
        return None


def send_email_with_attachment(form_data, attachments, preview_content=None):
    """
    Send quote request email with file attachment(s) and optional inline preview.

    Args:
        form_data: Form submission data dict
        attachments: List of (content_bytes, filename, content_type) tuples
        preview_content: Optional PNG bytes for inline preview image
    """
    name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
    email = form_data.get('email', '')
    subject_text = form_data.get('subject_text', 'Quote Request')

    from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'
    destination = get_destination(email)

    # Build MIME message
    # Structure: multipart/mixed
    #   ├── multipart/alternative
    #   │   ├── text/plain (fallback)
    #   │   └── multipart/related (if preview)
    #   │       ├── text/html
    #   │       └── image/png (inline)
    #   └── attachments...

    msg = MIMEMultipart('mixed')
    msg['Subject'] = f'[Pro Plastics] {subject_text}'
    msg['From'] = from_address
    msg['To'] = ', '.join(destination['ToAddresses'])
    msg['Reply-To'] = email

    if destination.get('CcAddresses'):
        msg['Cc'] = ', '.join(destination['CcAddresses'])

    # Create alternative part for text/html
    msg_alternative = MIMEMultipart('alternative')

    # Plain text version (always included as fallback)
    plain_text = f"""New contact form submission from Pro Plastics website:

Name: {name}
Email: {email}
Phone: {form_data.get('phone') or 'Not provided'}
Company: {form_data.get('company') or 'Not provided'}
Subject: {subject_text}
Message:
{form_data.get('message', '')}

reCAPTCHA Score: {form_data.get('recaptcha_score', 'N/A')}
Source IP: {form_data.get('client_ip', 'Unknown')} / {form_data.get('client_ip_location', 'Unknown')}
"""
    msg_alternative.attach(MIMEText(plain_text, 'plain'))

    # HTML version with optional preview
    if preview_content:
        # Create related part for HTML + inline image
        msg_related = MIMEMultipart('related')

        html_body = build_html_email_body(form_data, attachments, has_preview=True)
        msg_related.attach(MIMEText(html_body, 'html'))

        # Add inline preview image
        preview_image = MIMEImage(preview_content, _subtype='png')
        preview_image.add_header('Content-ID', '<preview_image>')
        preview_image.add_header('Content-Disposition', 'inline', filename='preview.png')
        msg_related.attach(preview_image)

        msg_alternative.attach(msg_related)
    else:
        # HTML version without preview
        html_body = build_html_email_body(form_data, attachments, has_preview=False)
        msg_alternative.attach(MIMEText(html_body, 'html'))

    msg.attach(msg_alternative)

    # Add all file attachments
    for file_content, filename, content_type in attachments:
        att = MIMEApplication(file_content)
        att.add_header('Content-Disposition', 'attachment', filename=filename)
        att.add_header('Content-Type', content_type)
        msg.attach(att)

    # Build recipient list for send_raw_email
    destinations = destination['ToAddresses'][:]
    if destination.get('CcAddresses'):
        destinations.extend(destination['CcAddresses'])
    if destination.get('BccAddresses'):
        destinations.extend(destination['BccAddresses'])

    ses.send_raw_email(
        Source=from_address,
        Destinations=destinations,
        RawMessage={'Data': msg.as_string()}
    )

    attachment_names = [a[1] for a in attachments]
    preview_status = "with preview" if preview_content else "without preview"
    print(f"Email sent {preview_status} with {len(attachments)} attachment(s) to {destinations}: {attachment_names}")


def build_html_email_body(form_data, attachments=None, has_preview=False, warning_message=None):
    """
    Build HTML email body from form data.

    Args:
        form_data: Form submission data dict
        attachments: Optional list of attachment tuples
        has_preview: Whether to include preview image placeholder
        warning_message: Optional warning message to display
    """
    name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
    email = form_data.get('email', '')
    phone = form_data.get('phone', '')
    company = form_data.get('company', '')
    subject_text = form_data.get('subject_text', 'Quote Request')
    message = form_data.get('message', '')
    recaptcha_score = form_data.get('recaptcha_score', 'N/A')
    client_ip = form_data.get('client_ip', 'Unknown')
    client_ip_location = form_data.get('client_ip_location', 'Unknown')

    # Escape message for HTML and preserve line breaks
    message_html = html.escape(message).replace('\n', '<br>')

    # Build preview section
    preview_html = ''
    if has_preview:
        preview_html = '''
            <div style="margin-top: 15px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Part Preview:</p>
                <img src="cid:preview_image" alt="Part Preview" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        '''

    # Build attachments section
    attachments_html = ''
    if attachments:
        attachment_names = [a[1] for a in attachments]
        attachments_html = f'''
            <div style="margin-top: 15px;">
                <span style="font-weight: bold; color: #555;">Attachments:</span> {html.escape(', '.join(attachment_names))}
            </div>
        '''

    # Build warning section if needed
    warning_html = ''
    if warning_message:
        warning_html = f'''
            <div style="margin-top: 15px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                <strong>⚠️ Warning:</strong> {html.escape(warning_message)}
            </div>
        '''

    html_content = f'''<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; font-size: 14px; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .header {{ background-color: #1a365d; color: white; padding: 20px; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .field {{ margin-bottom: 12px; }}
        .label {{ font-weight: bold; color: #555; }}
        .message-box {{ background-color: white; padding: 15px; border: 1px solid #ddd; margin-top: 10px; }}
        .security {{ margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }}
        .security-header {{ font-size: 12px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 8px; }}
        .security-item {{ font-size: 12px; color: #666; margin-bottom: 4px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header" style="padding: 15px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 10px;">
                <tr>
                    <td style="vertical-align: middle; padding-right: 8px;">
                        <img src="https://www.proplasticsinc.com/images/ppi-logo.png" alt="Pro Plastics Inc." width="70" height="70" style="display: block;">
                    </td>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 26px; font-weight: bold; color: #ed8936; line-height: 1.2;">Pro Plastics Inc.</div>
                        <div style="font-size: 14px; color: #a0aec0; font-style: italic;">Precision Manufacturing Since 1968</div>
                    </td>
                </tr>
            </table>
            <div style="font-size: 14px; color: #e2e8f0; border-top: 1px solid #2d4a6f; padding-top: 10px;">New Contact Form Submission</div>
        </div>
        <div class="content">
            <div class="field"><span class="label">Name:</span> {html.escape(name)}</div>
            <div class="field"><span class="label">Email:</span> <a href="mailto:{html.escape(email)}">{html.escape(email)}</a></div>
            <div class="field"><span class="label">Phone:</span> {html.escape(phone) if phone else 'Not provided'}</div>
            <div class="field"><span class="label">Company:</span> {html.escape(company) if company else 'Not provided'}</div>
            <div class="field"><span class="label">Subject:</span> {html.escape(subject_text)}</div>
            <div class="field">
                <span class="label">Message:</span>
                <div class="message-box">{message_html}</div>
            </div>
            {preview_html}
            {attachments_html}
            {warning_html}
            <div class="security">
                <div class="security-header">Security Check</div>
                <div class="security-item">reCAPTCHA Score: {recaptcha_score}</div>
                <div class="security-item">Source IP: {html.escape(client_ip)} / {html.escape(client_ip_location)}</div>
            </div>
        </div>
    </div>
</body>
</html>'''

    return html_content


def send_email_without_attachment(form_data, threat_detected=False, scan_failed=False, scan_result=None):
    """Send quote request email without file attachment."""
    name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
    email = form_data.get('email', '')
    subject_text = form_data.get('subject_text', 'Quote Request')

    from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'
    destination = get_destination(email)

    # Build warning message if needed
    warning_message = None
    if threat_detected:
        warning_message = "SECURITY WARNING: The attached file was flagged as potentially malicious and has been removed."
    elif scan_failed:
        warning_message = f"The attached file could not be scanned (result: {scan_result}) and has been removed for security."

    # Build HTML email
    html_body = build_html_email_body(form_data, warning_message=warning_message)

    ses.send_email(
        Source=from_address,
        Destination=destination,
        ReplyToAddresses=[email],
        Message={
            'Subject': {'Data': f'[Pro Plastics] {subject_text}'},
            'Body': {'Html': {'Data': html_body}}
        }
    )

    print(f"Email sent without attachment to {destination['ToAddresses']}")
