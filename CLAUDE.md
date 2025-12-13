# Pro Plastics Website - Claude Code Instructions

## Project Structure

```
ppi-web/
├── infrastructure/
│   ├── lambda/           # Lambda functions
│   │   ├── tests/        # Pytest tests
│   │   ├── contact_form.py
│   │   ├── quote_processor.py
│   │   └── ...
│   └── cloudformation.yaml
├── src/                  # Frontend source
└── tools/                # Development tools
```

## Mandatory Development Workflow

### 1. Always Run CI Tests Before Committing

**Before committing ANY code changes, run the test suite:**

```bash
cd infrastructure/lambda
python -m pytest tests/ -v
```

- All tests must pass before committing
- If tests fail, fix the issues before proceeding
- Do not commit code with failing tests

### 2. Never Commit or Push Without Explicit Permission

**CRITICAL: Never perform git commit or push operations unless the user explicitly instructs you to do so.**

**DO NOT commit or push if the user:**
- Says "looks good" or "that's great"
- Accepts file changes
- Appears satisfied with the work
- Has not explicitly said to commit or push

**ONLY commit/push when the user gives explicit commands like:**
- "commit and push"
- "commit this"
- "push the changes"

### 3. Deployment

Pushing to `main` branch triggers automatic deployment via GitHub Actions.

## Common Commands

```bash
# Run tests
cd infrastructure/lambda
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/test_contact_form.py -v

# Check AWS logs
aws logs tail "/aws/lambda/proplastics-website-contact-form" --region us-east-1 --since 1h
```

## Lambda Functions

| Function | Purpose |
|----------|---------|
| `contact_form` | Handles contact/quote form submissions |
| `quote_processor` | Processes attachments after virus scan |
| `google_lead_webhook` | Receives Google Ads lead notifications |
| `dwg_converter` | Converts DWG files to DXF |
| `preview_generator` | Generates preview images for CAD files |
