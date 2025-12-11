# Google Ads Tools for Pro Plastics Inc.

Tools for managing Google Ads campaigns via the API.

## Setup

```bash
cd tools/google-ads
source venv/bin/activate
```

## Credentials

Credentials are stored in `google-ads.yaml` (gitignored). Required fields:
- `developer_token` - From Google Ads API Center
- `client_id` / `client_secret` - OAuth 2.0 credentials
- `refresh_token` - Generated via `get_refresh_token.py`
- `login_customer_id` - Manager account ID (no dashes)

## Account Info

| Account | ID | Description |
|---------|-----|-------------|
| Manager | 122-993-2348 | API access / developer token |
| Target | 524-195-9874 | Advertiser account with campaigns |

## Scripts

### Campaign Management

| Script | Description |
|--------|-------------|
| `list_campaigns.py` | List all campaigns with basic metrics |
| `analyze_campaign.py` | Comprehensive campaign analysis |
| `show_campaign_details.py` | Show structure of PPI Search campaign |
| `pause_campaign.py` | Pause the Performance Max campaign |
| `enable_campaign.py` | Enable the Search campaign |
| `create_search_campaign.py` | Create new Search campaign (already run) |
| `add_ads.py` | Add responsive search ads |

### Authentication

| Script | Description |
|--------|-------------|
| `get_refresh_token.py` | One-time OAuth flow to get refresh token |

## Current Campaigns

### 1. Campaign #1 (Performance Max) - PAUSED
- **ID:** 23346089717
- **Status:** Paused (was generating low-quality traffic)
- **Issues:** $0.02 CPC, 0 conversions, international traffic

### 2. PPI - Plastic Machining (Search) - PAUSED (awaiting review)
- **ID:** 23353831337
- **Budget:** $50/day
- **Targeting:** United States only
- **Networks:** Google Search only (no Display, no Partners)

**Ad Groups:**

1. **CNC Plastic Machining** ($8 max CPC)
   - Keywords: custom plastic machining, CNC plastic parts, precision plastic machining, etc.

2. **High Performance Plastics** ($10 max CPC)
   - Keywords: PEEK machining, Ultem machining, Delrin machining, Torlon machining, etc.

3. **Plastic Fabrication** ($6 max CPC)
   - Keywords: custom plastic fabrication, UHMW fabrication, HDPE fabrication, etc.

## Enable the Campaign

When ready to go live:

```bash
source venv/bin/activate
python3 enable_campaign.py
```

## Monitoring

After enabling, monitor:
1. **Impressions** - Should see search traffic within hours
2. **CTR** - Expect 2-5% for B2B search (not 7% like the old campaign)
3. **CPC** - Expect $5-15 for quality traffic
4. **Conversions** - Should see quote form submissions

## Conversion Tracking

Existing conversion actions:
- `SUBMIT_LEAD_FORM` - GA4 custom event
- `quote_thank_you` - GA4 custom event
- `contact_thank_you` - GA4 custom event
- `Lead form - Submit` - Google lead form
- `Click to call` - Phone calls

Verify tracking is working by submitting a test quote and checking Google Ads.
