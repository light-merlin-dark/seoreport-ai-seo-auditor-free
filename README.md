# SEOReport.dev AI SEO Auditor – Free Reports + Agent Ready

**Official free actor** from [SEOReport.dev](https://seoreport.dev).
Same powerful engine. Same 0-100 scores. Same comprehensive checks.

## What you get

- Instant free SEO report (exactly like the website)
- GEO, on-page SEO, structured data, security headers, Core Web Vitals, crawlability
- Full evidence + anchors
- Automatic Dataset export for bulk/automation workflows
- MCP-ready for agent integrations

## Footer & Upsells (identical to website)

Every report includes:
- **"Purchase advanced report – $14.00"** (full ~18-page PDF + executive summary + prioritized fixes)
- **"Need help fixing these issues? Contact us"** for paid SEO services

## Perfect for

- AI agents & MCP workflows
- Scheduled monitoring
- Bulk audits & chaining with other Apify actors

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | Target website URL or domain |

## Output

The actor returns a JSON object containing the full SEO report with:
- `jobId` — unique report identifier
- `targetUrl` — normalized target URL
- `score.overall` — 0-100 overall score
- `score.domainScores` — breakdown by category (SEO, AI, Performance, Security)
- `view.sections` — report sections including findings, coverage summary, and upsell CTAs
- `paidUnlock` — locked/paid section metadata

## Example usage

```json
{
  "url": "https://example.com"
}
```

## Pricing

This actor is **free** — you only pay Apify's standard compute usage.

**Want unlimited reports, white-label PDFs, priority runs, or 15–150 credits/month?**
→ Subscribe at [seoreport.dev/pricing](https://seoreport.dev/pricing) (starts at $19/mo)

## Contact

- Email: ops@seoreport.dev
- X: [@EnchantedRobot](https://x.com/EnchantedRobot)
- Website: [seoreport.dev](https://seoreport.dev)
