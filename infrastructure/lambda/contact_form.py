import json
import boto3
import os
import re
import html
import urllib.request
import urllib.parse
import base64
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from botocore.exceptions import ClientError

from email_utils import get_destination

ses = boto3.client('ses', region_name='us-east-1')
s3 = boto3.client('s3')

RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
IP_GEOLOCATION_URL = 'http://ip-api.com/json/'

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


def lookup_ip_location(ip):
    """Look up geographic location for an IP address."""
    if not ip or ip == 'unknown':
        return 'Unknown'

    try:
        req = urllib.request.Request(f'{IP_GEOLOCATION_URL}{ip}?fields=status,city,regionName,country')
        with urllib.request.urlopen(req, timeout=3) as response:
            result = json.loads(response.read().decode('utf-8'))

        if result.get('status') == 'success':
            city = result.get('city', '')
            region = result.get('regionName', '')
            country = result.get('country', '')
            parts = [p for p in [city, region, country] if p]
            return ', '.join(parts) if parts else 'Unknown'
        return 'Unknown'
    except Exception as e:
        print(f'IP geolocation lookup failed: {e}')
        return 'Unknown'


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

        # Log client IP and user agent for security tracking
        headers_in = event.get('headers', {})
        # x-forwarded-for contains client IP when behind CloudFront/proxy (first IP in chain is the client)
        forwarded_for = headers_in.get('x-forwarded-for', headers_in.get('X-Forwarded-For', ''))
        client_ip = forwarded_for.split(',')[0].strip() if forwarded_for else 'unknown'
        user_agent = headers_in.get('user-agent', headers_in.get('User-Agent', 'unknown'))
        client_ip_location = lookup_ip_location(client_ip)
        print(f'Request from IP: {client_ip} ({client_ip_location}) | User-Agent: {user_agent}')

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
            email_header_title = "Request for Quote (RFQ)"
        else:
            # For contact form, format as "Contact - [Subject]"
            subject_text = f"Contact - {subject_text}"
            email_header_title = "Request for Information (RFI)"

        name = f"{body['firstName'].strip()} {body['lastName'].strip()}"
        company = body.get('company', '').strip()
        phone = body.get('phone', '').strip()

        # Escape message for HTML and preserve line breaks
        message_html = html.escape(body['message'].strip()).replace('\n', '<br>')

        email_body = f"""<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; font-size: 14px; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .header {{ background-color: #1a365d; color: white; padding: 20px; }}
        .logo-row {{ display: flex; align-items: center; margin-bottom: 15px; }}
        .logo {{ width: 50px; height: 50px; margin-right: 12px; }}
        .brand-text {{ }}
        .brand-name {{ font-size: 22px; font-weight: bold; color: white; margin: 0; }}
        .brand-tagline {{ font-size: 13px; color: #a0aec0; margin: 0; font-style: italic; }}
        .header-title {{ font-size: 14px; color: #e2e8f0; border-top: 1px solid #2d4a6f; padding-top: 12px; margin-top: 5px; }}
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
        <div class="header" style="padding: 6px 16px 8px 16px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 2px;">
                <tr>
                    <td style="vertical-align: middle; padding-right: 4px;">
                        <img src="https://www.proplasticsinc.com/images/ppi-logo.png" alt="Pro Plastics Inc." width="64" height="64" style="display: block;">
                    </td>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 24px; font-weight: bold; color: #ed8936; line-height: 1.1;">Pro Plastics Inc.</div>
                        <div style="font-size: 13px; color: #a0aec0; font-style: italic;">Precision Manufacturing Since 1968</div>
                    </td>
                </tr>
            </table>
            <div style="font-size: 14px; color: #e2e8f0; border-top: 1px solid #2d4a6f; padding-top: 6px;">{email_header_title}</div>
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
            <div class="security">
                <div class="security-header">Security Check</div>
                <div class="security-item">reCAPTCHA Score: {score}</div>
                <div class="security-item">Source IP: {html.escape(client_ip)} / {html.escape(client_ip_location)}</div>
            </div>
        </div>
    </div>
</body>
</html>"""

        # Send email with user's name as the From display name
        from_address = f'"{name}" <{os.environ["FROM_EMAIL"]}>'
        destination = get_destination(email)

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
                'email_header_title': email_header_title,
                'message': body['message'].strip(),
                'recaptcha_score': score,
                'client_ip': client_ip,
                'client_ip_location': client_ip_location,
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
                    'Subject': {'Data': f'[Pro Plastics] {subject_text}'},
                    'Body': {'Html': {'Data': email_body}}
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
