"""
Quote Processor Lambda

Triggered by EventBridge when GuardDuty Malware Protection completes scanning
a file uploaded to the quote attachments S3 bucket.

Sends the quote request email with or without the attachment based on scan results.
"""

import json
import boto3
import os
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from botocore.exceptions import ClientError

s3 = boto3.client('s3')
ses = boto3.client('ses', region_name='us-east-1')
lambda_client = boto3.client('lambda')

DWG_CONVERTER_FUNCTION = os.environ.get('DWG_CONVERTER_FUNCTION', '')


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

            # If DWG file, also convert to DXF and attach both
            if original_filename.lower().endswith('.dwg'):
                print("DWG file detected, attempting conversion to DXF")
                dxf_content, dxf_filename = convert_dwg_to_dxf(bucket, key)
                if dxf_content:
                    attachments.append((dxf_content, dxf_filename, 'application/dxf'))
                    print(f"Will attach both DWG and DXF to email")
                else:
                    print("DXF conversion failed, will attach DWG only")

            send_email_with_attachment(form_data, attachments)

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


def get_destination(email):
    """
    Determine email destination based on test mode.
    If submitter email is test email, only send to them.
    """
    TEST_EMAIL = 'mattkrokosz@gmail.com'

    if email.lower() == TEST_EMAIL.lower():
        print(f'Test mode: routing email only to {TEST_EMAIL}')
        return {'ToAddresses': [TEST_EMAIL]}

    # Support comma-separated recipient emails
    recipient_emails = [e.strip() for e in os.environ['RECIPIENT_EMAIL'].split(',') if e.strip()]
    destination = {'ToAddresses': recipient_emails}

    cc_email = os.environ.get('CC_EMAIL', '')
    if cc_email:
        destination['CcAddresses'] = [e.strip() for e in cc_email.split(',') if e.strip()]

    bcc_email = os.environ.get('BCC_EMAIL', '')
    if bcc_email:
        destination['BccAddresses'] = [e.strip() for e in bcc_email.split(',') if e.strip()]

    return destination


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


def send_email_with_attachment(form_data, attachments):
    """
    Send quote request email with file attachment(s).

    Args:
        form_data: Form submission data dict
        attachments: List of (content_bytes, filename, content_type) tuples
    """
    name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
    email = form_data.get('email', '')
    subject_text = form_data.get('subject_text', 'Quote Request')

    from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'
    destination = get_destination(email)

    # Build MIME message
    msg = MIMEMultipart()
    msg['Subject'] = f'[Pro Plastics Contact] {subject_text}'
    msg['From'] = from_address
    msg['To'] = ', '.join(destination['ToAddresses'])
    msg['Reply-To'] = email

    if destination.get('CcAddresses'):
        msg['Cc'] = ', '.join(destination['CcAddresses'])

    # Add body text
    email_body = form_data.get('email_body', 'No message body')
    msg.attach(MIMEText(email_body, 'plain'))

    # Add all attachments
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
    print(f"Email sent with {len(attachments)} attachment(s) to {destinations}: {attachment_names}")


def send_email_without_attachment(form_data, threat_detected=False, scan_failed=False, scan_result=None):
    """Send quote request email without file attachment."""
    name = f"{form_data.get('firstName', '')} {form_data.get('lastName', '')}".strip()
    email = form_data.get('email', '')
    subject_text = form_data.get('subject_text', 'Quote Request')

    from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'
    destination = get_destination(email)

    email_body = form_data.get('email_body', 'No message body')

    # Add warning if threat was detected or scan failed
    if threat_detected:
        email_body += "\n\n---\n⚠️ SECURITY WARNING: The attached file was flagged as potentially malicious and has been removed."
    elif scan_failed:
        email_body += f"\n\n---\n⚠️ NOTE: The attached file could not be scanned (result: {scan_result}) and has been removed for security."

    ses.send_email(
        Source=from_address,
        Destination=destination,
        ReplyToAddresses=[email],
        Message={
            'Subject': {'Data': f'[Pro Plastics Contact] {subject_text}'},
            'Body': {'Text': {'Data': email_body}}
        }
    )

    print(f"Email sent without attachment to {destination['ToAddresses']}")
