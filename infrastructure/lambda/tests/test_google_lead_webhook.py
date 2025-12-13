"""
Unit tests for google_lead_webhook Lambda function.

Tests the Google Ads lead form webhook handling, authentication,
lead data extraction, and email sending functionality.
"""

import json
import os
import sys
from unittest.mock import MagicMock
import importlib

import pytest
from moto import mock_aws

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(autouse=True)
def aws_credentials():
    """Mock AWS credentials for moto."""
    os.environ['AWS_ACCESS_KEY_ID'] = 'testing'
    os.environ['AWS_SECRET_ACCESS_KEY'] = 'testing'
    os.environ['AWS_SECURITY_TOKEN'] = 'testing'
    os.environ['AWS_SESSION_TOKEN'] = 'testing'
    os.environ['AWS_DEFAULT_REGION'] = 'us-east-1'


@pytest.fixture(autouse=True)
def env_vars():
    """Set up environment variables for Lambda."""
    os.environ['RECIPIENT_EMAIL'] = 'sales@example.com'
    os.environ['FROM_EMAIL'] = 'noreply@example.com'
    yield
    # Cleanup
    for key in ['RECIPIENT_EMAIL', 'FROM_EMAIL', 'CC_EMAIL', 'BCC_EMAIL', 'GOOGLE_WEBHOOK_KEY']:
        os.environ.pop(key, None)


def create_google_lead_event(user_column_data=None, is_test=False, google_key='', lead_id='lead123'):
    """Create a mock Google Ads lead webhook event."""
    if user_column_data is None:
        user_column_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Full Name'},
            {'column_id': 'EMAIL', 'string_value': 'john@example.com', 'column_name': 'User Email'},
            {'column_id': 'PHONE_NUMBER', 'string_value': '555-1234', 'column_name': 'User Phone'},
        ]

    body = {
        'lead_id': lead_id,
        'campaign_id': 123456,
        'adgroup_id': 789,
        'gcl_id': 'gclid_abc123',
        'user_column_data': user_column_data,
        'api_version': '1.0',
        'form_id': 987654321,
        'google_key': google_key,
        'is_test': is_test
    }

    return {'body': json.dumps(body)}


class TestAuthentication:
    """Tests for Google webhook key authentication."""

    def test_accepts_request_when_no_key_configured(self):
        """Test that requests are accepted when GOOGLE_WEBHOOK_KEY is not set."""
        os.environ.pop('GOOGLE_WEBHOOK_KEY', None)

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event(google_key='any_key')
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 200

    def test_accepts_matching_key(self):
        """Test that matching google_key is accepted."""
        os.environ['GOOGLE_WEBHOOK_KEY'] = 'secret-key-123'

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event(google_key='secret-key-123')
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 200

    def test_rejects_invalid_key(self):
        """Test that invalid google_key returns 401."""
        os.environ['GOOGLE_WEBHOOK_KEY'] = 'secret-key-123'

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = create_google_lead_event(google_key='wrong-key')
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert body['error'] == 'Unauthorized'

    def test_rejects_missing_key_when_configured(self):
        """Test that missing key returns 401 when key is configured."""
        os.environ['GOOGLE_WEBHOOK_KEY'] = 'secret-key-123'

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = create_google_lead_event(google_key='')
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 401


class TestUserDataExtraction:
    """Tests for extracting user data from column_data."""

    def test_extracts_standard_fields(self):
        """Test that standard Google lead fields are extracted correctly."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Jane Smith', 'column_name': 'Full Name'},
            {'column_id': 'EMAIL', 'string_value': 'jane@company.com', 'column_name': 'Email'},
            {'column_id': 'PHONE_NUMBER', 'string_value': '555-9876', 'column_name': 'Phone'},
            {'column_id': 'COMPANY_NAME', 'string_value': 'Acme Corp', 'column_name': 'Company'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'Jane Smith' in email_body
        assert 'jane@company.com' in email_body
        assert '555-9876' in email_body
        assert 'Acme Corp' in email_body

    def test_extracts_location_fields(self):
        """Test that city and postal code are extracted."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'john@example.com', 'column_name': 'Email'},
            {'column_id': 'CITY', 'string_value': 'Chicago', 'column_name': 'City'},
            {'column_id': 'POSTAL_CODE', 'string_value': '60601', 'column_name': 'Zip'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'Chicago' in email_body
        assert '60601' in email_body

    def test_extracts_custom_fields(self):
        """Test that custom fields are extracted with their column_name."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'john@example.com', 'column_name': 'Email'},
            {'column_id': 'CUSTOM_1', 'string_value': 'CNC machined parts', 'column_name': 'Your Requirement'},
            {'column_id': 'CUSTOM_2', 'string_value': '100 units', 'column_name': 'Quantity Needed'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'CNC machined parts' in email_body
        assert 'Quantity Needed' in email_body
        assert '100 units' in email_body

    def test_handles_empty_user_column_data(self):
        """Test handling when email is missing."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = create_google_lead_event(user_column_data=[
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Name'}
        ])
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'email' in body['error'].lower()


class TestValidation:
    """Tests for input validation."""

    def test_rejects_missing_email(self):
        """Test that missing email returns 400."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Name'},
            {'column_id': 'PHONE_NUMBER', 'string_value': '555-1234', 'column_name': 'Phone'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'email' in body['error'].lower()

    def test_rejects_missing_recipient_email_config(self):
        """Test that missing RECIPIENT_EMAIL returns 500."""
        os.environ.pop('RECIPIENT_EMAIL', None)

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = create_google_lead_event()
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'configuration' in body['error'].lower()

    def test_handles_empty_body(self):
        """Test handling of empty request body."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = {'body': '{}'}
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 400


class TestTestLeadIndicator:
    """Tests for test lead handling."""

    def test_includes_test_indicator_for_test_leads(self):
        """Test that test leads include [TEST LEAD] indicator."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event(is_test=True)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        subject = call_args[1]['Message']['Subject']['Data']
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert '[TEST LEAD]' in subject
        assert '[TEST LEAD]' in email_body

    def test_no_test_indicator_for_real_leads(self):
        """Test that real leads don't have [TEST LEAD] indicator."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event(is_test=False)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        subject = call_args[1]['Message']['Subject']['Data']
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert '[TEST LEAD]' not in subject
        assert '[TEST LEAD]' not in email_body


class TestEmailSubjectFormat:
    """Tests for email subject formatting."""

    def test_subject_includes_pro_plastics_prefix(self):
        """Test that subject includes [Pro Plastics] prefix."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Jane Smith', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'jane@example.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        subject = call_args[1]['Message']['Subject']['Data']

        assert '[Pro Plastics]' in subject
        assert 'Google Ads Lead' in subject
        assert 'Jane Smith' in subject

    def test_subject_format_with_test_lead(self):
        """Test subject format for test leads."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Test User', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'test@example.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data, is_test=True)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        subject = call_args[1]['Message']['Subject']['Data']

        assert subject == '[TEST LEAD] [Pro Plastics] Google Ads Lead - Test User'


class TestEmailBodyContent:
    """Tests for email body content."""

    def test_includes_lead_details(self):
        """Test that lead details are included in email body."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event(lead_id='lead_xyz_789')
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'Lead ID: lead_xyz_789' in email_body
        assert 'Campaign ID: 123456' in email_body
        assert 'Ad Group ID: 789' in email_body
        assert 'Form ID: 987654321' in email_body
        assert 'GCL ID: gclid_abc123' in email_body

    def test_includes_requirement_field(self):
        """Test that 'Your Requirement' field is prominently displayed."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'John Doe', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'john@example.com', 'column_name': 'Email'},
            {'column_id': 'CUSTOM', 'string_value': 'Need custom plastic parts', 'column_name': 'Your Requirement'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'Requirement:' in email_body
        assert 'Need custom plastic parts' in email_body

    def test_handles_missing_optional_fields(self):
        """Test that missing optional fields show 'Not provided'."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'EMAIL', 'string_value': 'minimal@example.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Text']['Data']

        assert 'Name: Not provided' in email_body
        assert 'Phone: Not provided' in email_body
        assert 'Company: Not provided' in email_body


class TestEmailRouting:
    """Tests for email destination routing."""

    def test_test_mode_routes_to_test_email(self):
        """Test that test email address only sends to itself."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Matt Test', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'mattkrokosz@gmail.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        destination = call_args[1]['Destination']

        assert destination['ToAddresses'] == ['mattkrokosz@gmail.com']
        assert 'CcAddresses' not in destination
        assert 'BccAddresses' not in destination

    def test_production_routes_to_recipients(self):
        """Test that production leads go to configured recipients."""
        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com,leads@example.com'
        os.environ['CC_EMAIL'] = 'manager@example.com'
        os.environ['BCC_EMAIL'] = 'archive@example.com'

        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event()
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        destination = call_args[1]['Destination']

        assert 'sales@example.com' in destination['ToAddresses']
        assert 'leads@example.com' in destination['ToAddresses']
        assert destination['CcAddresses'] == ['manager@example.com']
        assert destination['BccAddresses'] == ['archive@example.com']

    def test_reply_to_set_to_lead_email(self):
        """Test that Reply-To is set to the lead's email."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Customer', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'customer@company.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        reply_to = call_args[1]['ReplyToAddresses']

        assert reply_to == ['customer@company.com']


class TestFromAddress:
    """Tests for From address formatting."""

    def test_from_address_uses_lead_name(self):
        """Test that From address uses the lead's name as display name."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        user_data = [
            {'column_id': 'FULL_NAME', 'string_value': 'Alice Johnson', 'column_name': 'Name'},
            {'column_id': 'EMAIL', 'string_value': 'alice@example.com', 'column_name': 'Email'},
        ]

        event = create_google_lead_event(user_column_data=user_data)
        google_lead_webhook.handler(event, None)

        call_args = mock_ses.send_email.call_args
        from_address = call_args[1]['Source']

        assert from_address == '"Alice Johnson" <noreply@example.com>'


class TestErrorHandling:
    """Tests for error handling."""

    def test_handles_malformed_json(self):
        """Test handling of malformed JSON body."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        event = {'body': 'not valid json'}
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 500

    def test_handles_ses_error(self):
        """Test handling of SES errors."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        from botocore.exceptions import ClientError
        mock_ses = MagicMock()
        mock_ses.send_email.side_effect = ClientError(
            {'Error': {'Code': 'MessageRejected', 'Message': 'Email rejected'}},
            'SendEmail'
        )
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event()
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 500
        body = json.loads(response['body'])
        assert 'email' in body['error'].lower()

    def test_returns_success_for_valid_lead(self):
        """Test that valid leads return 200."""
        import google_lead_webhook
        importlib.reload(google_lead_webhook)

        mock_ses = MagicMock()
        google_lead_webhook.ses = mock_ses

        event = create_google_lead_event()
        response = google_lead_webhook.handler(event, None)

        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['message'] == 'Lead received successfully'
