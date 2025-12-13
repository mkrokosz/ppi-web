"""
Shared email utilities for Lambda functions.
"""

import os

# Test email address that triggers test mode routing
TEST_EMAIL = 'mattkrokosz@gmail.com'


def get_destination(email):
    """
    Determine email destination based on test mode.

    If submitter email matches TEST_EMAIL, only send to them (test mode).
    Otherwise, route to configured recipients with optional CC/BCC.

    Args:
        email: The submitter's email address

    Returns:
        dict with ToAddresses, and optionally CcAddresses and BccAddresses
    """
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
