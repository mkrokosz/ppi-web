"""
Unit tests for contact_form Lambda function.

Tests handler validation, honeypot detection, reCAPTCHA verification,
email routing, attachment validation, and CORS handling.
"""

import base64
import json
import os
import sys
from unittest.mock import patch, MagicMock
import importlib

import boto3
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
    os.environ['RECIPIENT_EMAIL'] = 'test@example.com'
    os.environ['FROM_EMAIL'] = 'noreply@example.com'
    os.environ['ALLOWED_ORIGIN'] = 'https://example.com'
    yield
    # Cleanup
    for key in ['RECIPIENT_EMAIL', 'FROM_EMAIL', 'ALLOWED_ORIGIN', 'CC_EMAIL', 'ATTACHMENTS_BUCKET']:
        os.environ.pop(key, None)


class TestHandlerValidation:
    """Tests for handler input validation."""

    def _create_event(self, body):
        """Helper to create a Lambda event with given body."""
        return {
            'body': json.dumps(body),
            'requestContext': {'http': {'method': 'POST'}}
        }

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    @patch('contact_form.ses')
    def test_rejects_missing_required_fields(self, mock_ses, mock_recaptcha):
        """Test that missing required fields return 400 error."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Missing email
        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'subject': 'quote',
            'message': 'Test message'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body
        assert 'email' in body['error'].lower()

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    @patch('contact_form.ses')
    def test_rejects_invalid_email_format(self, mock_ses, mock_recaptcha):
        """Test that invalid email addresses return 400 error."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'not-an-email',
            'subject': 'quote',
            'message': 'Test message'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'error' in body
        assert 'email' in body['error'].lower()

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_accepts_valid_submission(self, mock_recaptcha):
        """Test that valid submissions are accepted."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Replace SES client with mock after reload
        mock_ses = MagicMock()
        contact_form.ses = mock_ses

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'capabilities',
            'message': 'What materials do you work with?'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 200
        mock_ses.send_email.assert_called_once()


class TestHoneypot:
    """Tests for honeypot bot detection."""

    def _create_event(self, body):
        """Helper to create a Lambda event with given body."""
        return {
            'body': json.dumps(body),
            'requestContext': {'http': {'method': 'POST'}}
        }

    @patch('contact_form.verify_recaptcha')
    @patch('contact_form.ses')
    def test_honeypot_triggered_returns_success_silently(self, mock_ses, mock_recaptcha):
        """Test that honeypot submissions appear successful but don't send email."""
        import contact_form
        importlib.reload(contact_form)

        event = self._create_event({
            'firstName': 'Bot',
            'lastName': 'User',
            'email': 'bot@spam.com',
            'subject': 'quote',
            'message': 'Buy our stuff!',
            'website': 'http://spam-link.com'  # Honeypot field filled = bot
        })

        response = contact_form.handler(event, None)

        # Should return success to not alert the bot
        assert response['statusCode'] == 200
        # But should NOT call any services
        mock_recaptcha.assert_not_called()
        mock_ses.send_email.assert_not_called()

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_empty_honeypot_proceeds_normally(self, mock_recaptcha):
        """Test that empty honeypot field allows normal processing."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Replace SES client with mock after reload
        mock_ses = MagicMock()
        contact_form.ses = mock_ses

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'materials',
            'message': 'Question about materials',
            'website': ''  # Empty honeypot = human
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 200
        mock_ses.send_email.assert_called_once()


class TestRecaptcha:
    """Tests for reCAPTCHA verification."""

    def _create_event(self, body):
        """Helper to create a Lambda event with given body."""
        return {
            'body': json.dumps(body),
            'requestContext': {'http': {'method': 'POST'}}
        }

    @mock_aws
    def test_rejects_failed_recaptcha(self):
        """Test that failed reCAPTCHA verification returns 400."""
        import contact_form
        importlib.reload(contact_form)

        # Mock verify_recaptcha after reload
        contact_form.verify_recaptcha = MagicMock(return_value=(False, 0.0))

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'quote',
            'message': 'Test'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'security' in body['error'].lower() or 'verification' in body['error'].lower()

    @mock_aws
    def test_rejects_low_recaptcha_score(self):
        """Test that low reCAPTCHA score returns 400."""
        os.environ['RECAPTCHA_SCORE_THRESHOLD'] = '0.5'

        import contact_form
        importlib.reload(contact_form)

        # Mock verify_recaptcha after reload - returns low score
        contact_form.verify_recaptcha = MagicMock(return_value=(True, 0.2))

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'quote',
            'message': 'Test'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400


class TestEmailRouting:
    """Tests for email destination routing."""

    def _create_event(self, body):
        """Helper to create a Lambda event with given body."""
        return {
            'body': json.dumps(body),
            'requestContext': {'http': {'method': 'POST'}}
        }

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_test_mode_routes_to_test_email_only(self, mock_recaptcha):
        """Test that test email address only sends to itself."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Replace SES client with mock after reload
        mock_ses = MagicMock()
        contact_form.ses = mock_ses

        event = self._create_event({
            'firstName': 'Matt',
            'lastName': 'Test',
            'email': 'mattkrokosz@gmail.com',  # Test email triggers test mode
            'subject': 'capabilities',
            'message': 'Test submission'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 200
        # Verify email was sent to test address only
        call_args = mock_ses.send_email.call_args
        destination = call_args[1]['Destination']
        assert destination['ToAddresses'] == ['mattkrokosz@gmail.com']
        assert 'CcAddresses' not in destination
        assert 'BccAddresses' not in destination

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_production_routes_to_configured_recipients(self, mock_recaptcha):
        """Test that production emails go to configured recipients."""
        mock_recaptcha.return_value = (True, 0.9)

        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com,support@example.com'
        os.environ['CC_EMAIL'] = 'manager@example.com'

        import contact_form
        importlib.reload(contact_form)

        # Replace SES client with mock after reload
        mock_ses = MagicMock()
        contact_form.ses = mock_ses

        event = self._create_event({
            'firstName': 'Customer',
            'lastName': 'User',
            'email': 'customer@company.com',
            'subject': 'quote',
            'message': 'Need a quote'
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 200
        call_args = mock_ses.send_email.call_args
        destination = call_args[1]['Destination']
        assert 'sales@example.com' in destination['ToAddresses']
        assert 'support@example.com' in destination['ToAddresses']
        assert destination['CcAddresses'] == ['manager@example.com']


class TestAttachmentValidation:
    """Tests for file attachment validation."""

    def _create_event(self, body):
        """Helper to create a Lambda event with given body."""
        return {
            'body': json.dumps(body),
            'requestContext': {'http': {'method': 'POST'}}
        }

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_rejects_invalid_file_extension(self, mock_recaptcha):
        """Test that invalid file extensions are rejected."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'quote',
            'message': 'Test',
            'attachment': {
                'filename': 'malware.exe',
                'content': base64.b64encode(b'fake content').decode(),
                'contentType': 'application/octet-stream'
            }
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'file type' in body['error'].lower() or 'not allowed' in body['error'].lower()

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_accepts_valid_file_extensions(self, mock_recaptcha):
        """Test that valid CAD file extensions are accepted."""
        mock_recaptcha.return_value = (True, 0.9)

        os.environ['ATTACHMENTS_BUCKET'] = 'test-bucket'

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        import contact_form
        importlib.reload(contact_form)

        valid_extensions = ['.pdf', '.step', '.stp', '.dxf', '.stl']

        for ext in valid_extensions:
            event = self._create_event({
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'subject': 'quote',
                'message': 'Test',
                'attachment': {
                    'filename': f'part{ext}',
                    'content': base64.b64encode(b'fake cad content').decode(),
                    'contentType': 'application/octet-stream'
                }
            })

            response = contact_form.handler(event, None)
            assert response['statusCode'] == 200, f"Failed for extension {ext}"

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_rejects_oversized_files(self, mock_recaptcha):
        """Test that files over 10MB are rejected."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Create content larger than 10MB
        large_content = b'x' * (11 * 1024 * 1024)

        event = self._create_event({
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'subject': 'quote',
            'message': 'Test',
            'attachment': {
                'filename': 'large_file.step',
                'content': base64.b64encode(large_content).decode(),
                'contentType': 'application/octet-stream'
            }
        })

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert 'size' in body['error'].lower() or '10mb' in body['error'].lower()


class TestCorsHandling:
    """Tests for CORS and OPTIONS handling."""

    def test_options_request_returns_cors_headers(self):
        """Test that OPTIONS requests return proper CORS headers."""
        import contact_form
        importlib.reload(contact_form)

        event = {
            'requestContext': {'http': {'method': 'OPTIONS'}}
        }

        response = contact_form.handler(event, None)

        assert response['statusCode'] == 200
        assert 'Access-Control-Allow-Origin' in response['headers']
        assert 'Access-Control-Allow-Methods' in response['headers']
        assert 'POST' in response['headers']['Access-Control-Allow-Methods']

    @mock_aws
    @patch('contact_form.verify_recaptcha')
    def test_response_includes_cors_headers(self, mock_recaptcha):
        """Test that all responses include CORS headers."""
        mock_recaptcha.return_value = (True, 0.9)

        import contact_form
        importlib.reload(contact_form)

        # Replace SES client with mock after reload
        mock_ses = MagicMock()
        contact_form.ses = mock_ses

        event = {
            'body': json.dumps({
                'firstName': 'John',
                'lastName': 'Doe',
                'email': 'john@example.com',
                'subject': 'other',
                'message': 'Test'
            }),
            'requestContext': {'http': {'method': 'POST'}}
        }

        response = contact_form.handler(event, None)

        assert 'headers' in response
        assert 'Access-Control-Allow-Origin' in response['headers']
