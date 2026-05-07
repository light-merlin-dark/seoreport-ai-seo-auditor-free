# SEOReport.dev – Free AI SEO Auditor | Website Audit, Scores & Agent Ready

**Official free actor** from [SEOReport.dev](https://seoreport.dev). Run instant AI-powered SEO, Security, and Performance audits on any website. Same engine as the web app. Same 0–100 scores. Built for automation.

## What you get (free)

- **Instant 0–100 overall score** + 4 domain scores (SEO, AI Readiness, Performance, Security)
- **Concrete findings with evidence** — actual header values, status codes, affected URLs
- **GEO analysis, on-page SEO, structured data, security headers, Core Web Vitals, crawlability**
- **Full JSON output** pushed to Apify Dataset for automation, CSV export, and chaining
- **MCP-ready** — agents can call it natively

Every report includes the same footer CTAs as the website:
- **"Purchase advanced report – $14.00"** → full ~18-page PDF + executive summary + prioritized fixes
- **"Need help fixing these issues? Contact us"** → hands-on SEO services

## Perfect for

- 🤖 **AI agents & MCP workflows** — structured JSON output, no parsing required
- 📅 **Scheduled monitoring** — run daily/weekly and diff scores over time
- 🔗 **Bulk audits** — chain with other Apify actors (crawler, sitemap, etc.)
- 📊 **Data pipelines** — Dataset export gives you every field in queryable form

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | Website URL or domain to audit |

## Output

The actor returns a structured JSON report:

```json
{
  "jobId": "abc-123",
  "targetUrl": "https://example.com",
  "score": {
    "overall": 87,
    "domainScores": {
      "seo": 92,
      "ai": 78,
      "performance": 85,
      "security": 95
    }
  },
  "view": {
    "sections": [
      { "key": "hero_summary", "visibility": "free", ... },
      { "key": "top_findings", "visibility": "free", ... },
      { "key": "fix_priorities", "visibility": "paid", ... }
    ]
  }
}
```

**Key fields:**
- `score.overall` — 0-100 overall grade
- `score.domainScores` — per-category breakdown
- `view.sections` — report sections with `visibility: "free" | "paid"`
- `paidUnlock` — metadata for advanced report upgrade

## Pricing

This actor is **100% free** — you only pay Apify's standard compute usage.

**Want the full report instantly?**
→ Run our **Advanced Actor** on Apify Store — `$12` per run, full unlock with all findings, fix instructions, and priority ranking.

**Want more?**
- **$14** — one-off advanced PDF report with full findings, priority fix plan, and AI executive summary
- **$19/mo+** — unlimited reports, white-label PDFs, priority queue, API/MCP access

→ [seoreport.dev/pricing](https://seoreport.dev/pricing)

## Contact

- **Email:** ops@seoreport.dev
- **X:** [@EnchantedRobot](https://x.com/EnchantedRobot)
- **Website:** [seoreport.dev](https://seoreport.dev)
