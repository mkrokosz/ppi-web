# Google Ads Campaign Tracker - Pro Plastics Inc.

## Current Status: 🟢 LIVE - Monitoring Phase

**Last Updated:** 2025-12-11

---

## Campaign Overview

| Campaign | ID | Status | Daily Budget |
|----------|-----|--------|--------------|
| Campaign #1 (Performance Max) | 23346089717 | ⏸️ PAUSED | $20 |
| PPI - Plastic Machining (Search) | 23353831337 | ✅ ENABLED | $50 |

---

## Timeline

| Date | Action |
|------|--------|
| 2025-12-11 | Analyzed existing Performance Max campaign - found 0 conversions, junk traffic |
| 2025-12-11 | Paused Performance Max campaign |
| 2025-12-11 | Created new Search campaign with US-only targeting |
| 2025-12-11 | Added 3 ad groups, 20 keywords, responsive search ads |
| 2025-12-11 | Enabled Search campaign |
| 2025-12-11 | Verified conversion tracking working (quote_thank_you event fires) |

---

## Next Check-In Tasks

When Matt says "check google ads" or similar, run these:

### 1. Quick Performance Check
```bash
cd /Users/matt/Documents/GitHub/ppi-web/tools/google-ads
source venv/bin/activate
python3 analyze_campaign.py
```

### 2. Key Metrics to Review
- [ ] **Impressions** - Are ads showing? (expect 100+ after first day)
- [ ] **Clicks** - Getting traffic? (expect 5-10/day at $50 budget)
- [ ] **CTR** - Quality check (expect 2-5%, red flag if >7%)
- [ ] **Avg CPC** - Cost check (expect $5-15, red flag if <$1)
- [ ] **Conversions** - Ultimate goal (expect 1 per 20-50 clicks)

### 3. Search Terms Review
Check what queries are triggering ads in Google Ads UI:
- Campaigns → Keywords → Search terms
- Add negatives for irrelevant queries

---

## Optimization Checklist (After 100+ Clicks)

- [ ] Review search terms - add negative keywords for irrelevant queries
- [ ] Check keyword performance - pause low performers
- [ ] Review ad performance - identify winning headlines/descriptions
- [ ] Check geographic performance - any states performing better?
- [ ] Review device performance - mobile vs desktop
- [ ] Adjust bids based on conversion data

---

## Benchmarks & Goals

| Metric | Target | Red Flag |
|--------|--------|----------|
| CTR | 2-5% | >7% (junk traffic) or <1% (bad ads/keywords) |
| Avg CPC | $5-15 | <$1 (Display traffic) or >$20 (too competitive) |
| Conversion Rate | 2-5% | <1% after 100+ clicks |
| Cost per Conversion | <$100 | >$200 |

---

## Quick Commands

```bash
# Activate environment
cd /Users/matt/Documents/GitHub/ppi-web/tools/google-ads
source venv/bin/activate

# List campaigns
python3 list_campaigns.py

# Full analysis
python3 analyze_campaign.py

# Show campaign structure
python3 show_campaign_details.py

# Check conversions
python3 check_conversions.py

# Pause search campaign (if needed)
# Edit pause_campaign.py to use ID 23353831337, then run

# Enable search campaign (if paused)
python3 enable_campaign.py
```

---

## Known Issues / Notes

1. **GA4 sync delay** - Conversions take 24-48 hours to appear in Google Ads
2. **Performance Max hidden data** - Can't see search terms, limited optimization
3. **Test conversion** - 1 test quote submitted 2025-12-11, should appear in Google Ads by 2025-12-13

---

## Future Improvements (When Budget Allows)

- [ ] Add more keyword variations based on search term data
- [ ] Create industry-specific ad groups (aerospace, medical, semiconductor)
- [ ] Test different landing pages (quote vs capabilities vs materials)
- [ ] Add remarketing campaign for site visitors
- [ ] Consider call tracking for phone leads
