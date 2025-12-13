import json
import boto3
import os
from botocore.exceptions import ClientError

from email_utils import get_destination, build_html_email

ses = boto3.client('ses', region_name='us-east-1')


def handler(event, context):
    """
    Handle Google Ads lead form webhook submissions.

    Google sends leads in this format:
    {
        "lead_id": "...",
        "campaign_id": 123456,
        "adgroup_id": 0,
        "gcl_id": "...",
        "user_column_data": [
            {"column_id": "FULL_NAME", "string_value": "John Doe", "column_name": "Full Name"},
            {"column_id": "EMAIL", "string_value": "john@example.com", "column_name": "User Email"},
            {"column_id": "PHONE_NUMBER", "string_value": "555-1234", "column_name": "User Phone"}
        ],
        "api_version": "1.0",
        "form_id": 123456789,
        "google_key": "your-configured-key",
        "is_test": false
    }
    """
    headers = {
        'Content-Type': 'application/json'
    }

    try:
        body = json.loads(event.get('body', '{}'))

        # Log the incoming request for debugging
        is_test = body.get('is_test', False)
        lead_id = body.get('lead_id', 'unknown')
        print(f"Received Google lead: lead_id={lead_id}, is_test={is_test}")

        # Verify the google_key matches our configured key
        expected_key = os.environ.get('GOOGLE_WEBHOOK_KEY', '')
        received_key = body.get('google_key', '')

        if expected_key and received_key != expected_key:
            print(f"Invalid google_key received")
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Unauthorized'})
            }

        # Extract user data from user_column_data array
        user_data = {}
        for column in body.get('user_column_data', []):
            column_id = column.get('column_id', '')
            value = column.get('string_value', '')
            column_name = column.get('column_name', '')

            # Map known column IDs
            if column_id == 'FULL_NAME':
                user_data['full_name'] = value
            elif column_id == 'EMAIL':
                user_data['email'] = value
            elif column_id == 'PHONE_NUMBER':
                user_data['phone'] = value
            elif column_id == 'COMPANY_NAME':
                user_data['company'] = value
            elif column_id == 'CITY':
                user_data['city'] = value
            elif column_id == 'POSTAL_CODE':
                user_data['postal_code'] = value
            else:
                # Store any custom fields with their column_name or column_id
                key = column_name if column_name else column_id
                if key and value:
                    user_data[key] = value

        # Validate we have minimum required data
        full_name = user_data.get('full_name', 'Not provided')
        email = user_data.get('email', '')

        if not email:
            print('No email provided in lead')
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing email address'})
            }

        # Build email
        phone = user_data.get('phone', '')
        company = user_data.get('company', '')

        # Get the custom "Your Requirement" field specifically
        requirement = user_data.get('Your Requirement', '')

        # Include any other additional fields (excluding known fields)
        additional_fields = []
        known_fields = ['full_name', 'email', 'phone', 'company', 'Your Requirement']
        for key, value in user_data.items():
            if key not in known_fields:
                additional_fields.append(f"{key}: {value}")

        test_indicator = "[TEST LEAD] " if is_test else ""

        # Build fields for HTML email
        fields = [
            ('Name', full_name),
            ('Email', email),
            ('Phone', phone),
            ('Company', company),
        ]

        # Build lead details for extra section
        lead_details = f"""Lead ID: {lead_id}
Campaign ID: {body.get('campaign_id', 'N/A')}
Ad Group ID: {body.get('adgroup_id', 'N/A')}
Form ID: {body.get('form_id', 'N/A')}
GCL ID: {body.get('gcl_id', 'N/A')}"""

        extra_sections = [('Lead Details', lead_details)]

        # Add additional info section only if there are other custom fields
        if additional_fields:
            extra_sections.append(('Additional Information', '\n'.join(additional_fields)))

        # Build HTML email using shared template
        email_header_title = f"{test_indicator}Google Ads Lead"
        email_body = build_html_email(
            email_header_title=email_header_title,
            fields=fields,
            message=requirement if requirement else None,
            extra_sections=extra_sections
        )

        # Send email
        from_email = os.environ.get('FROM_EMAIL', 'noreply@proplastics.us')
        recipient_email = os.environ.get('RECIPIENT_EMAIL', '')

        if not recipient_email:
            print('RECIPIENT_EMAIL not configured')
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'Server configuration error'})
            }

        subject = f"{test_indicator}[Pro Plastics] Google Ads Lead - {full_name}"

        # Use the lead's name as the display name in From address
        from_address = f'"{full_name}" <{from_email}>'
        destination = get_destination(email)

        ses.send_email(
            Source=from_address,
            Destination=destination,
            ReplyToAddresses=[email] if email else [],
            Message={
                'Subject': {'Data': subject},
                'Body': {'Html': {'Data': email_body}}
            }
        )

        print(f"Successfully processed lead {lead_id}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'Lead received successfully'})
        }

    except ClientError as e:
        print(f'SES Error: {e}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to send email'})
        }
    except Exception as e:
        print(f'Error: {e}')
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'An unexpected error occurred'})
        }
