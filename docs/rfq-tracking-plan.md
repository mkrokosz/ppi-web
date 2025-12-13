# RFQ/RFI Tracking System - Phase 1 Implementation Plan

## Overview

Add DynamoDB tracking for all form submissions with auto-incrementing IDs in email subjects.

**ID Format:** `RFQ-YYMMXXX` (quotes) and `RFI-YYMMXXX` (contact inquiries)
- YYMM = 2-digit year + month (e.g., 2412 for Dec 2024)
- XXX = shared auto-incrementing counter per month
- Example: RFQ-2412001, RFI-2412002, RFQ-2412003

**Email Subject Change:**
- Before: `[Pro Plastics] Quote Request - CNC Machined Part`
- After: `[Pro Plastics] RFQ-2412001: CNC Machined Part`

**Table Naming:** `ppi-{name}-prod` (or `-dev` for dev environment)

---

## Files to Modify

| File | Changes |
|------|---------|
| `infrastructure/cloudformation.yaml` | Add 2 DynamoDB tables, IAM policies, env vars |
| `infrastructure/lambda/contact_form.py` | ID generation, save to DDB, update subjects |
| `infrastructure/lambda/quote_processor.py` | Read ID from metadata, update subjects |

---

## 1. DynamoDB Tables

### Submissions Table (`ppi-submissions-prod`)

Stores all RFQ and RFI records.

```
Primary Key: pk (String) + sk (String)
- pk: "SUBMISSION#RFQ-2412001"
- sk: "METADATA"

Attributes:
- id, type (RFQ/RFI), status, createdAt, updatedAt
- firstName, lastName, email, phone, company, message
- RFQ-specific: partType, quantity, material, materialOther, timeline
- RFI-specific: subject
- hasAttachment, attachmentFilename, recaptchaScore, source

GSIs (for future dashboard):
- GSI1-ByType: TYPE#RFQ or TYPE#RFI → createdAt
- GSI2-ByStatus: STATUS#pending → createdAt
- GSI3-ByMonth: MONTH#2412 → id
```

### Counters Table (`ppi-counters-prod`)

Atomic counter for ID generation.

```
Primary Key: pk (String)
- pk: "COUNTER#2412" (YYMM format)
- counter: Number (incremented atomically)
```

---

## 2. CloudFormation Changes

Add to `infrastructure/cloudformation.yaml`:

### Resources
- `SubmissionsTable` - DynamoDB table (`ppi-submissions-prod`) with 3 GSIs, PAY_PER_REQUEST billing
- `CountersTable` - Simple DynamoDB table (`ppi-counters-prod`) for atomic counters

### IAM Policy Updates
- `ContactFormLambdaRole`: Add `dynamodb:PutItem`, `UpdateItem`, `GetItem` on both tables
- `QuoteProcessorLambdaRole`: Add `dynamodb:UpdateItem`, `GetItem` on submissions table

### Environment Variables
- `ContactFormFunction`: Add `SUBMISSIONS_TABLE`, `COUNTERS_TABLE`
- `QuoteProcessorFunction`: Add `SUBMISSIONS_TABLE`

---

## 3. contact_form.py Changes

### New Functions

```python
def get_next_id(id_type):
    """Generate next ID using atomic counter. Returns 'RFQ-2412001' or 'RFI-2412001'"""
    # Use UpdateItem with ADD for atomic increment
    # Key: COUNTER#YYMM, increment counter attribute
    # Return: {id_type}-{yymm}{counter:03d}

def save_submission(submission_id, submission_type, form_data, ...):
    """Save submission record to DynamoDB"""
    # Create item with all form fields + GSI keys
    # Status starts as 'pending'
```

### Handler Modifications

1. Determine type early: `submission_type = 'RFQ' if body['subject'] == 'quote' else 'RFI'`
2. Generate ID: `submission_id = get_next_id(submission_type)`
3. Build display subject (e.g., "CNC Machined Part" from partType, or "Capabilities Question" from subject)
4. Update email subject: `f'[Pro Plastics] {submission_id}: {display_subject}'`
5. For attachment flow: Add `submission-id` to S3 metadata
6. Save to DynamoDB after successful processing

---

## 4. quote_processor.py Changes

### New Function

```python
def update_submission_status(submission_id, status, additional_updates=None):
    """Update submission status in DynamoDB after processing"""
```

### Handler Modifications

1. Extract `submission_id` from S3 object metadata
2. Include in `form_data` for email functions
3. Update email subject format in `send_email_with_attachment()` and `send_email_without_attachment()`
4. Update DynamoDB status after email sent

---

## 5. Implementation Order

1. **CloudFormation** - Add tables, policies, env vars
2. **contact_form.py** - ID generation + DDB save + subject update
3. **quote_processor.py** - Extract ID from metadata + subject update
4. **Deploy & Test** - Test both RFQ and RFI flows

---

## 6. Error Handling

- If DynamoDB fails, log warning but still send email (fail-open)
- If ID generation fails, fall back to current behavior (no ID in subject)
- Counter resets each month automatically (new COUNTER#YYMM key)

---

## 7. Future Dashboard Queries (enabled by GSIs)

- All RFQs this month: `GSI3PK = MONTH#2412, begins_with(sk, 'RFQ')`
- All pending: `GSI2PK = STATUS#pending`
- Customer history: Query by email (could add GSI4 later)
- Single lookup: `pk = SUBMISSION#RFQ-2412001`
