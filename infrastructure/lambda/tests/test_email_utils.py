"""
Unit tests for email_utils shared module.
"""

import os
import sys

import pytest

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture(autouse=True)
def env_vars():
    """Set up environment variables."""
    os.environ['RECIPIENT_EMAIL'] = 'sales@example.com'
    yield
    for key in ['RECIPIENT_EMAIL', 'CC_EMAIL', 'BCC_EMAIL']:
        os.environ.pop(key, None)


class TestGetDestination:
    """Tests for the get_destination function."""

    def test_test_mode_routes_to_test_email(self):
        """Test that test email address only sends to itself."""
        from email_utils import get_destination

        result = get_destination('mattkrokosz@gmail.com')

        assert result == {'ToAddresses': ['mattkrokosz@gmail.com']}

    def test_test_mode_case_insensitive(self):
        """Test that test email check is case-insensitive."""
        from email_utils import get_destination

        result = get_destination('MATTKROKOSZ@GMAIL.COM')

        assert result == {'ToAddresses': ['mattkrokosz@gmail.com']}

    def test_production_routes_to_recipient(self):
        """Test that production emails go to configured recipient."""
        from email_utils import get_destination

        result = get_destination('customer@example.com')

        assert result['ToAddresses'] == ['sales@example.com']

    def test_production_supports_multiple_recipients(self):
        """Test that comma-separated recipients are parsed."""
        os.environ['RECIPIENT_EMAIL'] = 'sales@example.com, support@example.com'

        from email_utils import get_destination
        import importlib
        import email_utils
        importlib.reload(email_utils)

        result = get_destination('customer@example.com')

        assert 'sales@example.com' in result['ToAddresses']
        assert 'support@example.com' in result['ToAddresses']

    def test_production_includes_cc(self):
        """Test that CC addresses are included."""
        os.environ['CC_EMAIL'] = 'manager@example.com'

        from email_utils import get_destination

        result = get_destination('customer@example.com')

        assert result['CcAddresses'] == ['manager@example.com']

    def test_production_includes_bcc(self):
        """Test that BCC addresses are included."""
        os.environ['BCC_EMAIL'] = 'archive@example.com'

        from email_utils import get_destination

        result = get_destination('customer@example.com')

        assert result['BccAddresses'] == ['archive@example.com']

    def test_production_no_cc_when_empty(self):
        """Test that empty CC is not included."""
        os.environ['CC_EMAIL'] = ''

        from email_utils import get_destination

        result = get_destination('customer@example.com')

        assert 'CcAddresses' not in result

    def test_production_no_bcc_when_not_set(self):
        """Test that BCC is not included when not set."""
        os.environ.pop('BCC_EMAIL', None)

        from email_utils import get_destination

        result = get_destination('customer@example.com')

        assert 'BccAddresses' not in result


class TestTestEmailConstant:
    """Tests for the TEST_EMAIL constant."""

    def test_test_email_is_correct(self):
        """Test that TEST_EMAIL constant is correct."""
        from email_utils import TEST_EMAIL

        assert TEST_EMAIL == 'mattkrokosz@gmail.com'
