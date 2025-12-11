import json
import boto3
import os
import re
import urllib.request
import urllib.parse
from botocore.exceptions import ClientError

ses = boto3.client('ses', region_name='us-east-1')

RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'


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
        destination = {'ToAddresses': [os.environ['RECIPIENT_EMAIL']]}

        cc_email = os.environ.get('CC_EMAIL', '')
        if cc_email:
            destination['CcAddresses'] = [cc_email]

        bcc_email = os.environ.get('BCC_EMAIL', '')
        if bcc_email:
            destination['BccAddresses'] = [bcc_email]

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
