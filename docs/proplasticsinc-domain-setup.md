# Adding www.proplasticsinc.com Domain

This document outlines the plan to add `www.proplasticsinc.com` as an additional domain pointing to the Pro Plastics website hosted on AWS.

## Current State

- **Primary domain**: proplastics.us (DNS managed in AWS Route 53)
- **Current aliases**: proplastics.us, www.proplastics.us
- **Infrastructure**: S3 + CloudFront + ACM Certificate

## Goal

Add `www.proplasticsinc.com` to serve the same website content, while keeping DNS for proplasticsinc.com at GoDaddy.

## Changes Required

### 1. AWS CloudFormation Updates

#### ACM Certificate
Add `www.proplasticsinc.com` as a Subject Alternative Name (SAN):

```yaml
Certificate:
  Type: AWS::CertificateManager::Certificate
  Properties:
    DomainName: !Ref DomainName
    SubjectAlternativeNames:
      - !Sub 'www.${DomainName}'
      - !Sub 'api.${DomainName}'
      - 'www.proplasticsinc.com'  # NEW
```

**Note**: DNS validation for this domain must be done manually at GoDaddy since DNS is not in Route 53.

#### CloudFront Distribution
Add `www.proplasticsinc.com` to the Aliases:

```yaml
CloudFrontDistribution:
  Properties:
    DistributionConfig:
      Aliases:
        - !Ref DomainName
        - !Sub 'www.${DomainName}'
        - 'www.proplasticsinc.com'  # NEW
```

### 2. API Gateway CORS

**Already configured** - The following origins are already in the CORS allowed list:
- `https://proplasticsinc.com`
- `https://www.proplasticsinc.com`

No changes needed for contact/quote form submissions.

### 3. GoDaddy DNS Configuration

Two DNS records need to be added at GoDaddy:

#### A. Certificate Validation Record (Temporary)
ACM will provide a CNAME record for domain validation:
- **Type**: CNAME
- **Name**: `_xxxx.www.proplasticsinc.com` (ACM will provide exact value)
- **Value**: `_yyyy.acm-validations.aws` (ACM will provide exact value)

#### B. www CNAME Record (Permanent)
- **Type**: CNAME
- **Name**: `www`
- **Value**: CloudFront distribution domain (e.g., `d1234abcd.cloudfront.net`)

## Deployment Steps

### Step 1: Update CloudFormation Template
Modify `infrastructure/cloudformation.yaml` to add:
- `www.proplasticsinc.com` to Certificate SANs
- `www.proplasticsinc.com` to CloudFront Aliases

### Step 2: Deploy Infrastructure
Run the "Deploy Infrastructure" workflow. The stack will:
1. Start updating the ACM certificate
2. **Pause** waiting for DNS validation of `www.proplasticsinc.com`

### Step 3: Add DNS Validation Record at GoDaddy
1. Go to AWS Certificate Manager console
2. Find the certificate and expand the validation details
3. Copy the CNAME name and value for `www.proplasticsinc.com`
4. Add this CNAME record in GoDaddy DNS management

### Step 4: Wait for Certificate Validation
- Typically 5-30 minutes after DNS record is added
- ACM console will show "Issued" status when complete
- CloudFormation stack will automatically continue

### Step 5: Get CloudFront Distribution Domain
After stack completes, get the CloudFront domain:
```bash
aws cloudformation describe-stacks \
  --stack-name proplastics-website \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" \
  --output text
```

### Step 6: Update www CNAME at GoDaddy
In GoDaddy DNS management for proplasticsinc.com, **edit the existing www CNAME record**:
- **Type**: CNAME
- **Name**: www
- **Current Value**: `proplasticsinc.com` ← Change this
- **New Value**: `d29hg6x7rc6bxh.cloudfront.net` (our CloudFront distribution)
- **TTL**: 1 hour (or default)

### Step 7: Verify
Test that `https://www.proplasticsinc.com` loads the website correctly.

## Apex Domain Handling (proplasticsinc.com without www)

This plan only covers `www.proplasticsinc.com`. The apex domain (`proplasticsinc.com` without www) requires special handling because:
- CNAME records cannot be used for apex domains (DNS limitation)
- GoDaddy doesn't support ALIAS/ANAME records that could point to CloudFront

### Why This Matters

| User types... | Without apex handling | With apex forwarding |
|---------------|----------------------|---------------------|
| `www.proplasticsinc.com` | ✅ New site | ✅ New site |
| `proplasticsinc.com` | ❌ Old site/broken | ✅ Redirects to new site |

### Option A: GoDaddy Domain Forwarding (Recommended)

This is the simplest approach - redirect apex to www at the GoDaddy level.

#### Step-by-Step Instructions

1. **Log into GoDaddy** at https://dcc.godaddy.com/

2. **Navigate to your domain**
   - Go to "My Products" → "Domains"
   - Click on `proplasticsinc.com`

3. **Find the Forwarding section**
   - Scroll down to "Additional Settings"
   - Click "Manage DNS"
   - Look for "Forwarding" section (may be under a separate tab or at bottom of DNS page)
   - Or go directly to: Domain Settings → Forwarding

4. **Add a domain forward**
   - Click "Add Forwarding" or "Forward Domain"
   - Configure:
     - **Forward to**: `https://www.proplasticsinc.com`
     - **Redirect type**: `Permanent (301)` ← Important for SEO
     - **Forward settings**: `Forward only` (not masking)

5. **Save and wait**
   - Changes typically take effect within minutes
   - Full propagation can take up to 48 hours

#### How It Works

```
User visits: proplasticsinc.com
     ↓
GoDaddy returns: HTTP 301 Redirect to https://www.proplasticsinc.com
     ↓
Browser follows redirect
     ↓
www.proplasticsinc.com resolves via CNAME → CloudFront
     ↓
User sees: Pro Plastics website
```

#### Benefits of 301 Redirect
- **SEO preserved** - Search engines transfer ranking to www version
- **Bookmarks work** - Old bookmarks automatically redirect
- **No SSL issues** - GoDaddy handles the initial HTTP redirect

#### Current GoDaddy DNS Records

Based on current configuration:
```
A     @                → 160.153.0.69      (will be overridden by forwarding)
NS    @                → ns57.domaincontrol.com
NS    @                → ns58.domaincontrol.com
CNAME dkim._domainkey  → cur.dkim.v.eigmail.net (keep for email)
CNAME www              → proplasticsinc.com (CHANGE to CloudFront domain)
```

**Note**: When you set up forwarding, GoDaddy may automatically modify the A record. The DKIM record for email should remain unchanged.

### Option B: Migrate DNS to Route 53 (Full AWS Control)

This gives complete control but is more complex:

1. Create a hosted zone in Route 53 for proplasticsinc.com
2. Add all existing records (including DKIM for email)
3. Add ALIAS record for apex → CloudFront
4. Add ALIAS record for www → CloudFront
5. Update nameservers at GoDaddy to point to Route 53
6. Wait for propagation (24-48 hours)

**When to choose this option:**
- You want everything in AWS
- You need advanced DNS features (health checks, latency routing)
- You plan to sunset the GoDaddy relationship

**Not recommended if:**
- You want minimal changes
- Email DNS (DKIM) is managed at GoDaddy
- You want to keep options open for future changes

## Rollback Plan

If issues occur:
1. Remove the `www` CNAME record at GoDaddy
2. Revert CloudFormation changes (remove proplasticsinc.com from certificate and aliases)
3. Redeploy infrastructure

## Timeline Estimate

- CloudFormation updates: 5 minutes
- Infrastructure deployment: 5-10 minutes
- Certificate validation: 5-30 minutes
- GoDaddy DNS propagation: Up to 48 hours (usually faster)

**Total**: ~1 hour active work, plus DNS propagation time
