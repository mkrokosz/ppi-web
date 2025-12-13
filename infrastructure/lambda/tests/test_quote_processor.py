"""
Unit tests for quote_processor Lambda function.

Tests the GuardDuty scan result handling, email sending with/without attachments,
file extension utilities, and email routing functionality.
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
    os.environ['ATTACHMENTS_BUCKET'] = 'test-attachments-bucket'
    yield
    # Cleanup
    for key in ['RECIPIENT_EMAIL', 'FROM_EMAIL', 'ATTACHMENTS_BUCKET',
                'CC_EMAIL', 'BCC_EMAIL', 'DWG_CONVERTER_FUNCTION', 'PREVIEW_GENERATOR_FUNCTION']:
        os.environ.pop(key, None)


def create_guardduty_event(bucket, key, scan_result='NO_THREATS_FOUND'):
    """Create a mock GuardDuty scan completion event."""
    return {
        'detail-type': 'GuardDuty Malware Protection Object Scan Result',
        'detail': {
            's3ObjectDetails': {
                'bucketName': bucket,
                'objectKey': key
            },
            'scanResultDetails': {
                'scanResultStatus': scan_result
            }
        }
    }


def create_form_data():
    """Create sample form data for testing."""
    return {
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john@example.com',
        'phone': '555-1234',
        'company': 'Acme Inc',
        'email_subject': 'RFQ - CNC Machined Part',
        'body_subject_text': 'CNC Machined Part',
        'email_header_title': 'Request for Quote (RFQ)',
        'email_body': 'New quote request from Pro Plastics website:\n\nName: John Doe\nEmail: john@example.com'
    }


class TestGetFileExtension:
    """Tests for the get_file_extension utility function."""

    def test_returns_lowercase_extension(self):
        """Test that extension is returned in lowercase."""
        import quote_processor
        importlib.reload(quote_processor)

        assert quote_processor.get_file_extension('file.PDF') == '.pdf'
        assert quote_processor.get_file_extension('file.STEP') == '.step'
        assert quote_processor.get_file_extension('file.DXF') == '.dxf'

    def test_handles_multiple_dots(self):
        """Test files with multiple dots in name."""
        import quote_processor
        importlib.reload(quote_processor)

        assert quote_processor.get_file_extension('my.part.v2.step') == '.step'
        assert quote_processor.get_file_extension('drawing.2024.01.pdf') == '.pdf'

    def test_returns_empty_for_no_extension(self):
        """Test that empty string is returned for files without extension."""
        import quote_processor
        importlib.reload(quote_processor)

        assert quote_processor.get_file_extension('filename') == ''
        assert quote_processor.get_file_extension('Makefile') == ''


class TestGetDestination:
    """Tests for email destination routing."""

    def test_test_mode_routes_to_test_email(self):
        """Test that test email address only sends to itself."""
        import quote_processor
        importlib.reload(quote_processor)

        result = quote_processor.get_destination('mattkrokosz@gmail.com')

        assert result == {'ToAddresses': ['mattkrokosz@gmail.com']}

    def test_test_mode_case_insensitive(self):
        """Test that test email check is case-insensitive."""
        import quote_processor
        importlib.reload(quote_processor)

        result = quote_processor.get_destination('MATTKROKOSZ@GMAIL.COM')

        assert result == {'ToAddresses': ['mattkrokosz@gmail.com']}

    def test_production_routes_to_recipients(self):
        """Test that production emails go to configured recipients."""
        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com,support@example.com'
        os.environ['CC_EMAIL'] = 'manager@example.com'

        import quote_processor
        importlib.reload(quote_processor)

        result = quote_processor.get_destination('customer@company.com')

        assert 'sales@example.com' in result['ToAddresses']
        assert 'support@example.com' in result['ToAddresses']
        assert result['CcAddresses'] == ['manager@example.com']

    def test_production_with_bcc(self):
        """Test that BCC addresses are included."""
        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com'
        os.environ['BCC_EMAIL'] = 'archive@example.com'

        import quote_processor
        importlib.reload(quote_processor)

        result = quote_processor.get_destination('customer@company.com')

        assert result['BccAddresses'] == ['archive@example.com']


class TestBuildHtmlEmailBody:
    """Tests for HTML email creation."""

    def test_escapes_html_characters(self):
        """Test that HTML characters are escaped."""
        import quote_processor
        importlib.reload(quote_processor)

        form_data = {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'message': 'Test <script>alert("xss")</script>',
            'body_subject_text': 'Quote Request',
        }
        result = quote_processor.build_html_email_body(form_data)

        assert '<script>' not in result
        assert '&lt;script&gt;' in result

    def test_includes_attachment_list(self):
        """Test that attachment names are listed."""
        import quote_processor
        importlib.reload(quote_processor)

        form_data = {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'message': 'Test body',
            'body_subject_text': 'Quote Request',
        }
        attachments = [
            (b'content1', 'part.step', 'application/step'),
            (b'content2', 'drawing.pdf', 'application/pdf')
        ]
        result = quote_processor.build_html_email_body(form_data, attachments=attachments, has_preview=False)

        assert 'part.step' in result
        assert 'drawing.pdf' in result
        assert 'Attachments:' in result

    def test_includes_preview_when_requested(self):
        """Test that preview image is included when has_preview is True."""
        import quote_processor
        importlib.reload(quote_processor)

        form_data = {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'message': 'Test body',
            'body_subject_text': 'Quote Request',
        }
        result = quote_processor.build_html_email_body(form_data, has_preview=True)

        assert 'cid:preview_image' in result
        assert 'Part Preview' in result

    def test_no_preview_when_not_requested(self):
        """Test that preview image is not included when has_preview is False."""
        import quote_processor
        importlib.reload(quote_processor)

        form_data = {
            'firstName': 'John',
            'lastName': 'Doe',
            'email': 'john@example.com',
            'message': 'Test body',
            'body_subject_text': 'Quote Request',
        }
        result = quote_processor.build_html_email_body(form_data, has_preview=False)

        assert 'cid:preview_image' not in result


class TestHandlerEventParsing:
    """Tests for handler event parsing and validation."""

    @mock_aws
    def test_rejects_missing_bucket(self):
        """Test that missing bucket returns 400."""
        import quote_processor
        importlib.reload(quote_processor)

        event = {
            'detail': {
                's3ObjectDetails': {'objectKey': 'test.pdf'},
                'scanResultDetails': {'scanResultStatus': 'NO_THREATS_FOUND'}
            }
        }

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 400
        assert 'Missing bucket' in response['body']

    @mock_aws
    def test_rejects_missing_key(self):
        """Test that missing key returns 400."""
        import quote_processor
        importlib.reload(quote_processor)

        event = {
            'detail': {
                's3ObjectDetails': {'bucketName': 'test-bucket'},
                'scanResultDetails': {'scanResultStatus': 'NO_THREATS_FOUND'}
            }
        }

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 400
        assert 'Missing' in response['body']

    @mock_aws
    def test_handles_missing_object_gracefully(self):
        """Test that missing S3 object returns 200 (already processed)."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        import quote_processor
        importlib.reload(quote_processor)

        event = create_guardduty_event('test-bucket', 'nonexistent.pdf')

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 200
        assert 'not found' in response['body']

    @mock_aws
    def test_rejects_missing_form_data(self):
        """Test that missing form data in metadata returns 400."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'file content',
            Metadata={}  # No form-data
        )

        import quote_processor
        importlib.reload(quote_processor)

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf')

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 400
        assert 'form data' in response['body'].lower()


class TestCleanFileFlow:
    """Tests for NO_THREATS_FOUND scan result handling."""

    @mock_aws
    def test_sends_email_with_clean_file(self):
        """Test that clean files are sent as attachments."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        file_content = b'PDF file content'

        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=file_content,
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'drawing.pdf',
                'content-type': 'application/pdf'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        # Mock SES after reload
        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 200
        mock_ses.send_raw_email.assert_called_once()

        # Verify attachment was included
        call_args = mock_ses.send_raw_email.call_args
        raw_message = call_args[1]['RawMessage']['Data']
        assert 'drawing.pdf' in raw_message

    @mock_aws
    def test_deletes_file_after_processing(self):
        """Test that S3 file is deleted after successful processing."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'test.pdf',
                'content-type': 'application/pdf'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)
        quote_processor.ses = MagicMock()

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Verify file was deleted
        with pytest.raises(s3.exceptions.NoSuchKey):
            s3.get_object(Bucket='test-bucket', Key='quotes/test.pdf')

    @mock_aws
    def test_extracts_submission_id_from_metadata(self):
        """Test that form data is extracted from S3 metadata."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'test.pdf',
                'content-type': 'application/pdf',
            }
        )

        import quote_processor
        importlib.reload(quote_processor)
        quote_processor.ses = MagicMock()

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')

        # Capture print output to verify form data is logged
        with patch('builtins.print') as mock_print:
            quote_processor.handler(event, None)

            # Check that form data was logged (includes email_subject from form data)
            print_calls = [str(call) for call in mock_print.call_args_list]
            assert any('RFQ - CNC Machined Part' in call for call in print_calls)


class TestThreatDetectedFlow:
    """Tests for THREATS_FOUND scan result handling."""

    @mock_aws
    def test_sends_email_without_attachment_when_threat_found(self):
        """Test that threats result in email without attachment."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/malware.exe',
            Body=b'malicious content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'malware.exe',
                'content-type': 'application/octet-stream'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/malware.exe', 'THREATS_FOUND')

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 200
        # Should use send_email (not send_raw_email) since no attachment
        mock_ses.send_email.assert_called_once()
        mock_ses.send_raw_email.assert_not_called()

    @mock_aws
    def test_includes_security_warning_for_threat(self):
        """Test that threat warning is included in email body."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/malware.exe',
            Body=b'malicious content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'malware.exe',
                'content-type': 'application/octet-stream'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/malware.exe', 'THREATS_FOUND')
        quote_processor.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Html']['Data']
        assert 'SECURITY WARNING' in email_body
        assert 'malicious' in email_body.lower()


class TestScanFailedFlow:
    """Tests for scan failure handling."""

    @mock_aws
    def test_handles_unsupported_file_type(self):
        """Test that unsupported file types send email without attachment."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/file.xyz',
            Body=b'some content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'file.xyz',
                'content-type': 'application/octet-stream'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/file.xyz', 'UNSUPPORTED')

        response = quote_processor.handler(event, None)

        assert response['statusCode'] == 200
        mock_ses.send_email.assert_called_once()

    @mock_aws
    def test_includes_scan_result_in_warning(self):
        """Test that scan result is included in warning message."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/file.bin',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'file.bin',
                'content-type': 'application/octet-stream'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/file.bin', 'ACCESS_DENIED')
        quote_processor.handler(event, None)

        call_args = mock_ses.send_email.call_args
        email_body = call_args[1]['Message']['Body']['Html']['Data']
        assert 'ACCESS_DENIED' in email_body
        assert 'could not be scanned' in email_body.lower()


class TestDwgConversion:
    """Tests for DWG to DXF conversion."""

    @mock_aws
    def test_skips_conversion_when_not_configured(self):
        """Test that DWG conversion is skipped when function not configured."""
        os.environ.pop('DWG_CONVERTER_FUNCTION', None)

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/part.dwg',
            Body=b'DWG content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'part.dwg',
                'content-type': 'application/acad'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/part.dwg', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Email should still be sent with original DWG only
        mock_ses.send_raw_email.assert_called_once()
        raw_message = mock_ses.send_raw_email.call_args[1]['RawMessage']['Data']
        assert 'part.dwg' in raw_message
        assert 'part.dxf' not in raw_message

    @mock_aws
    def test_attaches_both_dwg_and_dxf_on_successful_conversion(self):
        """Test that both DWG and DXF are attached when conversion succeeds."""
        os.environ['DWG_CONVERTER_FUNCTION'] = 'dwg-converter-function'

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/part.dwg',
            Body=b'DWG content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'part.dwg',
                'content-type': 'application/acad'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        # Mock Lambda client for converter
        mock_lambda = MagicMock()
        mock_lambda.invoke.return_value = {
            'Payload': MagicMock(read=lambda: json.dumps({
                'success': True,
                'dxf_content': base64.b64encode(b'DXF content').decode(),
                'dxf_filename': 'part.dxf'
            }).encode())
        }
        quote_processor.lambda_client = mock_lambda

        event = create_guardduty_event('test-bucket', 'quotes/part.dwg', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Verify both files attached
        raw_message = mock_ses.send_raw_email.call_args[1]['RawMessage']['Data']
        assert 'part.dwg' in raw_message
        assert 'part.dxf' in raw_message


class TestPreviewGeneration:
    """Tests for preview image generation."""

    @mock_aws
    def test_skips_preview_when_not_configured(self):
        """Test that preview generation is skipped when function not configured."""
        os.environ.pop('PREVIEW_GENERATOR_FUNCTION', None)

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/part.step',
            Body=b'STEP content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'part.step',
                'content-type': 'application/step'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/part.step', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Email sent but without preview
        mock_ses.send_raw_email.assert_called_once()
        raw_message = mock_ses.send_raw_email.call_args[1]['RawMessage']['Data']
        assert 'cid:preview_image' not in raw_message

    @mock_aws
    def test_includes_preview_when_generated_successfully(self):
        """Test that preview is included when generation succeeds."""
        os.environ['PREVIEW_GENERATOR_FUNCTION'] = 'preview-generator-function'

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/part.step',
            Body=b'STEP content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'part.step',
                'content-type': 'application/step'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        # Mock Lambda client for preview generator
        mock_lambda = MagicMock()
        # Create a simple 1x1 PNG
        png_content = base64.b64encode(b'\x89PNG\r\n\x1a\n' + b'x' * 100).decode()
        mock_lambda.invoke.return_value = {
            'Payload': MagicMock(read=lambda: json.dumps({
                'success': True,
                'preview_content': png_content
            }).encode())
        }
        quote_processor.lambda_client = mock_lambda

        event = create_guardduty_event('test-bucket', 'quotes/part.step', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Verify preview is included
        raw_message = mock_ses.send_raw_email.call_args[1]['RawMessage']['Data']
        assert 'cid:preview_image' in raw_message
        assert 'preview.png' in raw_message


class TestEmailSubjectFormat:
    """Tests for email subject formatting."""

    @mock_aws
    def test_includes_pro_plastics_prefix(self):
        """Test that email subject includes [Pro Plastics] prefix."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        form_data['email_subject'] = 'RFQ - CNC Machined Part'

        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'test.pdf',
                'content-type': 'application/pdf'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        raw_message = mock_ses.send_raw_email.call_args[1]['RawMessage']['Data']
        assert '[Pro Plastics] RFQ - CNC Machined Part' in raw_message

    @mock_aws
    def test_subject_in_email_without_attachment(self):
        """Test email subject when sending without attachment."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        form_data['email_subject'] = 'RFI - Capabilities Question'

        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/malware.exe',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'malware.exe',
                'content-type': 'application/octet-stream'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/malware.exe', 'THREATS_FOUND')
        quote_processor.handler(event, None)

        call_args = mock_ses.send_email.call_args
        subject = call_args[1]['Message']['Subject']['Data']
        assert subject == '[Pro Plastics] RFI - Capabilities Question'


class TestEmailRouting:
    """Tests for email routing in quote_processor."""

    @mock_aws
    def test_test_mode_sends_only_to_test_email(self):
        """Test that test email address only sends to itself."""
        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        form_data['email'] = 'mattkrokosz@gmail.com'

        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'test.pdf',
                'content-type': 'application/pdf'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        # Verify only sent to test email
        destinations = mock_ses.send_raw_email.call_args[1]['Destinations']
        assert destinations == ['mattkrokosz@gmail.com']

    @mock_aws
    def test_production_sends_to_all_recipients(self):
        """Test that production emails go to all configured recipients."""
        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com,support@example.com'
        os.environ['CC_EMAIL'] = 'manager@example.com'

        s3 = boto3.client('s3', region_name='us-east-1')
        s3.create_bucket(Bucket='test-bucket')

        form_data = create_form_data()
        form_data['email'] = 'customer@company.com'

        s3.put_object(
            Bucket='test-bucket',
            Key='quotes/test.pdf',
            Body=b'content',
            Metadata={
                'form-data': base64.b64encode(json.dumps(form_data).encode()).decode(),
                'original-filename': 'test.pdf',
                'content-type': 'application/pdf'
            }
        )

        import quote_processor
        importlib.reload(quote_processor)

        mock_ses = MagicMock()
        quote_processor.ses = mock_ses

        event = create_guardduty_event('test-bucket', 'quotes/test.pdf', 'NO_THREATS_FOUND')
        quote_processor.handler(event, None)

        destinations = mock_ses.send_raw_email.call_args[1]['Destinations']
        assert 'sales@example.com' in destinations
        assert 'support@example.com' in destinations
        assert 'manager@example.com' in destinations
