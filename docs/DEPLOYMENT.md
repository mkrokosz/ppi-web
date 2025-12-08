# Pro Plastics Inc. Website - AWS Deployment Guide

This guide covers deploying the website to AWS using CloudFront, S3, and GitHub Actions.

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │ proplastics.us  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │
                    │  Distribution   │
                    │  (HTTPS + CDN)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    S3 Bucket    │
                    │ (Static Files)  │
                    └─────────────────┘
```

## Prerequisites

1. AWS Account with appropriate permissions
2. Domain `proplastics.us` with Route 53 Hosted Zone
3. GitHub repository with Actions enabled

## Initial Setup

### Step 1: Create IAM Role for GitHub Actions

Create an IAM role that GitHub Actions can assume using OIDC:

1. Go to IAM → Identity Providers → Add Provider
2. Select "OpenID Connect"
3. Provider URL: `https://token.actions.githubusercontent.com`
4. Audience: `sts.amazonaws.com`

Then create a role with this trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/ppi-web:*"
        }
      }
    }
  ]
}
```

Attach this policy to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::proplastics.us-website",
        "arn:aws:s3:::proplastics.us-website/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "cloudfront:ListInvalidations"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*"
      ],
      "Resource": "arn:aws:cloudformation:us-east-1:*:stack/proplastics-website/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:ValidateTemplate",
        "cloudformation:DescribeStacks"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketPolicy",
        "s3:PutBucketPublicAccessBlock",
        "s3:PutEncryptionConfiguration",
        "s3:PutBucketTagging"
      ],
      "Resource": "arn:aws:s3:::proplastics.us-website"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "acm:RequestCertificate",
        "acm:DescribeCertificate",
        "acm:DeleteCertificate",
        "acm:AddTagsToCertificate"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:GetHostedZone",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "arn:aws:route53:::hostedzone/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ListHostedZonesByName"
      ],
      "Resource": "*"
    }
  ]
}
```

### Step 2: Configure GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add this secret:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ROLE_ARN` | The ARN of the IAM role created in Step 1 |

**That's it!** All other values are automatically discovered:
- **Hosted Zone ID** - Looked up from Route 53 by domain name
- **S3 Bucket Name** - Retrieved from CloudFormation stack outputs
- **CloudFront Distribution ID** - Retrieved from CloudFormation stack outputs

### Step 3: Create GitHub Environment

Go to Settings → Environments → New environment

- Name: `production`
- Add any required reviewers if desired

## Deployment

### Deploy Infrastructure (First Time Only)

1. Go to Actions → "Deploy Infrastructure"
2. Click "Run workflow"
3. Select `preview` to see what will be created
4. Run again with `deploy` to create the resources

**Note:** Certificate validation may take up to 30 minutes as DNS propagates.

### Deploy Website

The website automatically deploys when you push to the `main` branch.

To manually deploy:
1. Go to Actions → "Deploy to AWS"
2. Click "Run workflow"

## Infrastructure Resources Created

The CloudFormation stack creates:

- **S3 Bucket**: Stores website files (private, accessed via CloudFront OAC)
- **CloudFront Distribution**: CDN with HTTPS, HTTP/2, HTTP/3
- **ACM Certificate**: SSL certificate for `proplastics.us` and `www.proplastics.us`
- **Route 53 Records**: A and AAAA records pointing to CloudFront
- **CloudFront Function**: URL rewriting for Next.js static export

## URLs

After deployment:
- https://proplastics.us
- https://www.proplastics.us

Both URLs redirect to HTTPS and serve from CloudFront.

## Troubleshooting

### Certificate Stuck in "Pending Validation"

1. Check Route 53 for CNAME validation records
2. They should be auto-created by CloudFormation
3. If missing, manually create them from ACM console
4. Wait up to 30 minutes for DNS propagation

### 403 Errors After Deployment

1. Check S3 bucket policy allows CloudFront OAC
2. Verify CloudFront distribution has correct S3 origin
3. Run CloudFront invalidation: `/*`

### Changes Not Appearing

1. CloudFront cache may need invalidation
2. Check GitHub Actions logs for deployment errors
3. Verify files exist in S3 bucket

## Cost Estimate

Monthly costs (approximate):
- S3: ~$0.50 (storage + requests)
- CloudFront: ~$1-5 (depends on traffic)
- Route 53: $0.50/hosted zone + $0.40/million queries
- ACM Certificate: Free

**Total: ~$2-10/month for a low-traffic site**

## Manual Deployment (Without GitHub Actions)

If needed, you can deploy manually:

```bash
# Build the site
npm run build

# Deploy infrastructure
aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yaml \
  --stack-name proplastics-website \
  --parameter-overrides \
    DomainName=proplastics.us \
    HostedZoneId=YOUR_HOSTED_ZONE_ID \
  --capabilities CAPABILITY_IAM \
  --region us-east-1

# Sync to S3
aws s3 sync out/ s3://proplastics.us-website/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```
