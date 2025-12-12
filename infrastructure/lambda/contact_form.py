import json
import boto3
import os
import re
import urllib.request
import urllib.parse
import base64
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from botocore.exceptions import ClientError

ses = boto3.client('ses', region_name='us-east-1')
s3 = boto3.client('s3')

RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

# Allowed file extensions for attachments
ALLOWED_EXTENSIONS = {
    '.pdf',
    '.step', '.stp',      # STEP files
    '.iges', '.igs',      # IGES files
    '.dxf', '.dwg',       # AutoCAD files
    '.stl',               # 3D printing
    '.sldprt', '.sldasm', # SolidWorks
    '.ipt', '.iam',       # Inventor
    '.prt',               # Various CAD
    '.x_t', '.sat',       # Parasolid/ACIS
    '.png', '.jpg', '.jpeg', '.tif', '.tiff',  # Images
}

MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10MB


def verify_recaptcha(token):
    """Verify reCAPTCHA token with Google and return score."""
    secret_key = os.environ.get('RECAPTCHA_SECRET_KEY')

    if not secret_key:
        print('Warning: RECAPTCHA_SECRET_KEY not configured, skipping verification')
        return True, 1.0  # Pass through if not configured

    if not token:
        print('Warning: No reCAPTCHA token provided')
        return False, 0.0

    try:
        data = urllib.parse.urlencode({
            'secret': secret_key,
            'response': token
        }).encode('utf-8')

        req = urllib.request.Request(RECAPTCHA_VERIFY_URL, data=data, method='POST')
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))

        success = result.get('success', False)
        score = result.get('score', 0.0)

        print(f'reCAPTCHA verification: success={success}, score={score}')

        if not success:
            error_codes = result.get('error-codes', [])
            print(f'reCAPTCHA errors: {error_codes}')
            return False, 0.0

        return True, score

    except Exception as e:
        print(f'reCAPTCHA verification error: {e}')
        # On error, allow submission but log it (fail open to not block legitimate users)
        return True, 0.5


def handler(event, context):
    # CORS headers
    allowed_origin = os.environ.get('ALLOWED_ORIGIN', '*')
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowed_origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    # Handle preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    try:
        body = json.loads(event.get('body', '{}'))

        # Honeypot check - if filled, silently succeed (bot trap)
        if body.get('website', ''):
            print('Honeypot triggered - bot detected')
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Message sent successfully'})
            }

        # Verify reCAPTCHA token
        recaptcha_token = body.get('recaptchaToken')
        is_valid, score = verify_recaptcha(recaptcha_token)

        score_threshold = float(os.environ.get('RECAPTCHA_SCORE_THRESHOLD', '0.5'))

        if not is_valid:
            print(f'reCAPTCHA verification failed')
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Security verification failed. Please try again.'})
            }

        if score < score_threshold:
            print(f'reCAPTCHA score {score} below threshold {score_threshold}')
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Security verification failed. Please try again.'})
            }

        # Validate required fields
        required = ['firstName', 'lastName', 'email', 'subject', 'message']
        for field in required:
            if not body.get(field, '').strip():
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': f'Missing required field: {field}'})
                }

        # Basic email validation
        email = body['email'].strip()
        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid email address'})
            }

        # Build email
        subject_map = {
            'quote': 'Quote Request',
            'capabilities': 'Capabilities Question',
            'materials': 'Material Information',
            'order': 'Order Status',
            'other': 'General Inquiry'
        }
        subject_text = subject_map.get(body['subject'], body['subject'])

        # For quote requests, append part type to subject
        if body['subject'] == 'quote' and body.get('partType'):
            part_type_map = {
                'machined': 'CNC Machined Part',
                'fabricated': 'Fabricated Component',
                'sheet': 'Cut Sheet/Panel',
                'rod-tube': 'Rod/Tube Stock',
                'other': 'Other'
            }
            part_type_text = part_type_map.get(body['partType'], body['partType'])
            subject_text = f"Quote Request - {part_type_text}"
        else:
            # For contact form, format as "Contact - [Subject]"
            subject_text = f"Contact - {subject_text}"

        name = f"{body['firstName'].strip()} {body['lastName'].strip()}"
        company = body.get('company', '').strip()
        phone = body.get('phone', '').strip()

        email_body = f"""New contact form submission from Pro Plastics website:

Name: {name}
Email: {email}
Phone: {phone if phone else 'Not provided'}
Company: {company if company else 'Not provided'}
Subject: {subject_text}
reCAPTCHA Score: {score}

Message:
{body['message'].strip()}
"""

        # Send email with user's name as the From display name
        from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'

        # Test mode: if submitter email is test email, only send to them
        TEST_EMAIL = 'mattkrokosz@gmail.com'
        if email.lower() == TEST_EMAIL.lower():
            destination = {'ToAddresses': [TEST_EMAIL]}
            print(f'Test mode: routing email only to {TEST_EMAIL}')
        else:
            # Support comma-separated recipient emails
            recipient_emails = [e.strip() for e in os.environ['RECIPIENT_EMAIL'].split(',') if e.strip()]
            destination = {'ToAddresses': recipient_emails}

            cc_email = os.environ.get('CC_EMAIL', '')
            if cc_email:
                destination['CcAddresses'] = [e.strip() for e in cc_email.split(',') if e.strip()]

            bcc_email = os.environ.get('BCC_EMAIL', '')
            if bcc_email:
                destination['BccAddresses'] = [e.strip() for e in bcc_email.split(',') if e.strip()]

        # Check for file attachment
        attachment = body.get('attachment')

        if attachment:
            # FLOW B: With attachment - upload to S3 for virus scanning
            # Email will be sent by quote_processor Lambda after scan completes

            # Validate attachment
            filename = attachment.get('filename', '')
            if filename:
                # Check file extension
                ext = '.' + filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
                if ext not in ALLOWED_EXTENSIONS:
                    print(f'Rejected file with extension: {ext}')
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': f'File type not allowed: {ext}'})
                    }

            # Decode and check size
            try:
                file_content = base64.b64decode(attachment.get('content', ''))
                if len(file_content) > MAX_ATTACHMENT_SIZE:
                    print(f'Rejected file: size {len(file_content)} exceeds max {MAX_ATTACHMENT_SIZE}')
                    return {
                        'statusCode': 400,
                        'headers': headers,
                        'body': json.dumps({'error': 'File size exceeds 10MB limit'})
                    }
            except Exception as decode_err:
                print(f'Failed to decode attachment: {decode_err}')
                return {
                    'statusCode': 400,
                    'headers': headers,
                    'body': json.dumps({'error': 'Invalid file attachment'})
                }

            # Upload to S3 for virus scanning
            attachments_bucket = os.environ.get('ATTACHMENTS_BUCKET')
            if not attachments_bucket:
                print('Error: ATTACHMENTS_BUCKET not configured')
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'Server configuration error'})
                }

            submission_id = str(uuid.uuid4())
            file_ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else 'bin'
            s3_key = f"quotes/{submission_id}.{file_ext}"

            # Store form data in S3 metadata for quote_processor to use
            form_data_for_processor = {
                'firstName': body['firstName'].strip(),
                'lastName': body['lastName'].strip(),
                'email': email,
                'phone': phone,
                'company': company,
                'subject_text': subject_text,
                'email_body': email_body,
            }

            metadata = {
                'form-data': base64.b64encode(json.dumps(form_data_for_processor).encode()).decode(),
                'original-filename': filename,
                'content-type': attachment.get('contentType', 'application/octet-stream'),
                'submitted-at': datetime.utcnow().isoformat(),
            }

            try:
                s3.put_object(
                    Bucket=attachments_bucket,
                    Key=s3_key,
                    Body=file_content,
                    Metadata=metadata
                )
                print(f'Uploaded attachment to s3://{attachments_bucket}/{s3_key} ({len(file_content)} bytes)')
            except ClientError as s3_err:
                print(f'Failed to upload to S3: {s3_err}')
                return {
                    'statusCode': 500,
                    'headers': headers,
                    'body': json.dumps({'error': 'Failed to process attachment. Please try again.'})
                }

            # Return success - email will be sent after virus scan completes
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Quote request received. You will receive a confirmation email shortly.'})
            }

        else:
            # FLOW A: No attachment - send email directly
            ses.send_email(
                Source=from_address,
                Destination=destination,
                ReplyToAddresses=[email],
                Message={
                    'Subject': {'Data': f'[Pro Plastics Contact] {subject_text}'},
                    'Body': {'Text': {'Data': email_body}}
                }
            )

            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'Message sent successfully'})
            }

    except ClientError as e:
        print(f'SES Error: {e}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to send email. Please try again later.'})
        }
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'An unexpected error occurred.'})
        }
