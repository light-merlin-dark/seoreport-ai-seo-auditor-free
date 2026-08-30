# Get a free website SEO score

Official free Actor from [SEOReport.dev](https://seoreport.dev). Same engine as the website. One URL in, flattened scores out. Built for automation and MCP.

## What you get (free)

- Instant 0–100 overall score plus SEO, AI readiness, performance, and security
- The same free findings the hosted report shows
- One dataset row per run (`overview` view) plus the full JSON on the `OUTPUT` key

This is the trial. The [advanced Actor](https://apify.com/seoreport.dev/seoreport-dev-ai-seo-auditor-advanced) unlocks all 139 checks, the priority fix plan, and the AI executive narrative at **$12 per report**.

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | Website URL or domain. Prefill is `https://example.com`. |

## Output (dataset `overview`)

```json
{
  "targetUrl": "https://example.com",
  "jobId": "abc-123",
  "overallScore": 87,
  "seoScore": 92,
  "aiScore": 78,
  "performanceScore": 85,
  "securityScore": 95,
  "paidUnlocked": false
}
```

The full report JSON is stored on the run's `OUTPUT` key-value record. Dataset rows stay flattened so Store testers and MCP callers see scores without parsing nested objects.

## Pricing

This Actor is free. You only pay Apify compute.

Want the unlocked report? Run **SEOReport.dev AI SEO Auditor Advanced** — **$12 per report**. Subscribe at [seoreport.dev/pricing](https://seoreport.dev/pricing) for unlimited hosted reports.

## Contact

- Email: ops@seoreport.dev
- X: [@EnchantedRobot](https://x.com/EnchantedRobot)
- Website: [seoreport.dev](https://seoreport.dev)
