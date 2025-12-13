"""
Shared email utilities for Lambda functions.
"""

import os
import html as html_lib

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


def build_html_email(
    email_header_title,
    fields,
    message=None,
    security_info=None,
    warning_message=None,
    attachments=None,
    has_preview=False,
    extra_sections=None,
    submitted_at=None
):
    """
    Build a branded HTML email with Pro Plastics header.

    Args:
        email_header_title: Title shown in header (e.g., "Request for Information (RFI)")
        fields: List of (label, value) tuples for form fields
        message: Optional message content (will be HTML-escaped and line breaks preserved)
        security_info: Optional dict with 'recaptcha_score', 'client_ip', 'client_ip_location'
        warning_message: Optional warning text to display
        attachments: Optional list of attachment filenames
        has_preview: Whether to include preview image placeholder (cid:preview_image)
        extra_sections: Optional list of (header, content) tuples for additional sections
        submitted_at: Optional submission date string (format: YYYY-MM-DD)

    Returns:
        HTML string for email body
    """
    # Build fields HTML with inline styles for email client compatibility
    fields_html = ''
    for label, value in fields:
        escaped_value = html_lib.escape(str(value)) if value else 'Not provided'
        # Make email fields clickable
        if label.lower() == 'email' and value:
            escaped_value = f'<a href="mailto:{html_lib.escape(value)}">{html_lib.escape(value)}</a>'
        fields_html += f'<div style="margin-bottom: 12px;"><span style="font-weight: bold; color: #555;">{html_lib.escape(label)}:</span> {escaped_value}</div>\n            '

    # Build message HTML if provided
    message_html = ''
    if message:
        escaped_message = html_lib.escape(message).replace('\n', '<br>')
        message_html = f'''
            <div style="margin-bottom: 12px;">
                <span style="font-weight: bold; color: #555;">Message:</span>
                <div style="background-color: white; padding: 15px; border: 1px solid #ddd; margin-top: 10px;">{escaped_message}</div>
            </div>
        '''

    # Build preview section
    preview_html = ''
    if has_preview:
        preview_html = '''
            <div style="margin-top: 15px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Part Preview:</p>
                <img src="cid:preview_image" alt="Part Preview" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;">
            </div>
        '''

    # Build attachments section
    attachments_html = ''
    if attachments:
        attachment_names = ', '.join(html_lib.escape(a) for a in attachments)
        attachments_html = f'''
            <div style="margin-top: 15px;">
                <span style="font-weight: bold; color: #555;">Attachments:</span> {attachment_names}
            </div>
        '''

    # Build warning section
    warning_html = ''
    if warning_message:
        warning_html = f'''
            <div style="margin-top: 15px; padding: 15px; background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
                <strong>⚠️ Warning:</strong> {html_lib.escape(warning_message)}
            </div>
        '''

    # Build extra sections (for Google Ads lead details, etc.)
    extra_html = ''
    if extra_sections:
        for header, content in extra_sections:
            escaped_content = html_lib.escape(content).replace('\n', '<br>')
            extra_html += f'''
            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
                <div style="font-size: 12px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 4px;">{html_lib.escape(header)}</div>
                <div style="font-size: 12px; color: #666;">{escaped_content}</div>
            </div>
            '''

    # Build security section with inline styles
    security_html = ''
    if security_info:
        recaptcha_score = security_info.get('recaptcha_score', 'N/A')
        client_ip = html_lib.escape(str(security_info.get('client_ip', 'Unknown')))
        client_ip_location = html_lib.escape(str(security_info.get('client_ip_location', 'Unknown')))
        security_html = f'''
            <div style="margin-top: 12px; padding-top: 6px; border-top: 1px solid #ddd;">
                <div style="font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; margin-bottom: 1px;">Security Check</div>
                <div style="font-size: 10px; color: #888; line-height: 1.3;">reCAPTCHA Score: {recaptcha_score}</div>
                <div style="font-size: 10px; color: #888; line-height: 1.3;">Source IP: {client_ip} / {client_ip_location}</div>
            </div>
        '''

    html_content = f'''<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; font-size: 14px; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; }}
        .header {{ background-color: #1a365d; color: white; padding: 20px; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .field {{ margin-bottom: 12px; }}
        .label {{ font-weight: bold; color: #555; }}
        .message-box {{ background-color: white; padding: 15px; border: 1px solid #ddd; margin-top: 10px; }}
        .security {{ margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; }}
        .security-header {{ font-size: 12px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 4px; }}
        .security-item {{ font-size: 12px; color: #666; margin-bottom: 2px; }}
    </style>
</head>
<body style="font-family: Arial, sans-serif; font-size: 14px; color: #333; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div class="header" style="background-color: #1a365d; color: white; padding: 6px 0 8px 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="vertical-align: middle; padding: 0 8px 0 16px;">
                        <img src="https://www.proplasticsinc.com/images/ppi-logo.png" alt="Pro Plastics Inc." width="64" height="64" style="display: block;">
                    </td>
                    <td style="vertical-align: middle; padding: 0;">
                        <div style="font-size: 24px; font-weight: bold; color: #ed8936; line-height: 1.1;">Pro Plastics Inc.</div>
                        <div style="font-size: 13px; color: #a0aec0; font-style: italic;">Precision Manufacturing Since 1968</div>
                    </td>
                    <td style="vertical-align: top; text-align: right; padding: 0 16px 0 0;">{f'<div style="font-size: 11px; color: #a0aec0;">Submitted: {html_lib.escape(submitted_at)}</div>' if submitted_at else ''}</td>
                </tr>
            </table>
            <div style="font-size: 14px; color: #e2e8f0; border-top: 1px solid #2d4a6f; padding: 6px 0 0 16px;">{html_lib.escape(email_header_title)}</div>
        </div>
        <div class="content" style="padding: 20px; background-color: #f9f9f9;">
            {fields_html}
            {message_html}
            {preview_html}
            {attachments_html}
            {warning_html}
            {extra_html}
            {security_html}
        </div>
    </div>
</body>
</html>'''

    return html_content
