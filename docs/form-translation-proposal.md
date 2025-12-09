# Contact/Quote Form Translation Proposal

## Problem

When users submit Contact or Request Quote forms in non-English languages, the receiving team needs the content translated to English for processing.

## Recommended Approach: Hybrid

Pass the locale from the frontend as a hint, then translate on the backend when locale is non-English.

### Why Hybrid?

| Approach | Pros | Cons |
|----------|------|------|
| **Frontend locale only** | Reliable, no detection needed | Requires API changes |
| **Auto-detect only** | No API changes | Detection can fail for short/mixed text |
| **Hybrid (recommended)** | Best of both - reliable hint + fallback | Slightly more complex |

### Implementation

1. Frontend passes current locale in API call (already available from URL/context)
2. Backend checks if locale is non-English
3. If non-English, translate the message fields
4. Email includes both original and translated text

### Email Format

```
Message (translated from Spanish):
[English translation here]

---
Original message:
[Spanish original here]
```

## Translation Service Options

| Service | Pricing | Quality | Notes |
|---------|---------|---------|-------|
| **Google Cloud Translation** | $20/1M chars | Excellent | Simple API key setup |
| **AWS Translate** | $15/1M chars | Very good | Requires IAM setup |
| **DeepL API** | $25/1M chars | Best for European languages | Free tier: 500K chars/month |
| **OpenAI/Claude** | ~$0.50-3/1M chars | Excellent + context-aware | Likely already have API keys |

### Recommendation: LLM (Claude or OpenAI)

For short form submissions, using an LLM makes sense because:

1. **Existing infrastructure** - likely already have API keys configured
2. **Context-aware** - understands manufacturing/plastics terminology
3. **Single API call** - can translate all fields at once
4. **Cost-effective** - contact form messages are ~500 chars, pennies at any volume
5. **No additional service** - one less dependency to manage

### Example Prompt

```
Translate the following form submission from {locale} to English.
Preserve the original meaning and any technical terms related to plastics manufacturing.

Name: {name}
Company: {company}
Message: {message}

Return as JSON:
{
  "name": "...",
  "company": "...",
  "message": "..."
}
```

## API Changes Required

### Contact Form API

```typescript
// Current
{ name, email, phone, company, message }

// Proposed
{ name, email, phone, company, message, locale }
```

### Quote Request API

```typescript
// Current
{ name, email, phone, company, material, quantity, description }

// Proposed
{ name, email, phone, company, material, quantity, description, locale }
```

## Status

**Tabled** - To be implemented in a future iteration.
