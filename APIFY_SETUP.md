# Apify Actor Setup Guide — Field-by-Field

This document maps every field on the Apify actor development page to what you should put in it. It distinguishes between **internal/technical names** (for URLs and code) and **marketing names** (for the Store).

---

## Actor Page Tabs

Apify Console → Development → [Your Actor] → Settings / Source / Input / Publication

---

## 1. Settings Tab

### Actor Name (internal identifier)
**Field:** `Name` (at the top, usually pre-filled when you created the actor)
**What it is:** The technical slug. This becomes part of the URL.
**What to put:**
```
seoreport-dev-ai-seo-auditor-free
```
**Rules:**
- Lowercase only
- No spaces (use hyphens)
- This is **NOT** what users see in the Store title
- Changing this later breaks existing integrations

### Title (Store title — what users see)
**Field:** `Title` (also shown as "Store title" in the Publication tab)
**What it is:** The marketing headline. This appears in search results, the Store, and actor listings.
**What to put:**
```
SEOReport.dev – Free AI SEO Auditor | Website Audit, Scores & Agent Ready
```
**Rules:**
- 60–80 characters ideal
- Lead with brand name for trust
- Include "Free" for conversion
- Include keywords for search: "SEO Auditor", "Website Audit"

### Description (short description)
**Field:** `Short description` (max 160 characters)
**What it is:** The subtitle under the title in Store listings and search results.
**What to put:**
```
Official free actor from SEOReport.dev. Get instant 0-100 SEO, Security & Performance scores for any website. Built for agents, scheduling & bulk audits.
```
**Character count:** 159/160 ✅

### Source Code
**Field:** `Source type` → `Git repository`
**Git URL:**
```
https://github.com/light-merlin-dark/seoreport-ai-seo-auditor-free.git
```
**Branch:** `master`

### Build & Run
**Field:** `Base image` — leave as default (our Dockerfile handles this)
**Field:** `Environment variables` (secrets)
| Variable | Value | Notes |
|----------|-------|-------|
| `SEOREPORT_API_BASE_URL` | `https://seoreport.dev` | Production API endpoint |
| `SEOREPORT_ACTOR_TOKEN` | `apify-actor-e4f1a040-c97c-4c7f-bdc4-01e9428bd188` | From 1Password / Kimi handoff |

**Critical:** Never commit the raw token to GitHub. It lives only in Apify secrets.

---

## 2. Input Tab

**Field:** `Input schema` (JSON editor)
**What to paste:**
```json
{
  "title": "SEOReport.dev Free Report",
  "type": "object",
  "schemaVersion": 1,
  "properties": {
    "url": {
      "title": "Target URL or Domain",
      "type": "string",
      "description": "The website to analyze, e.g. https://example.com or example.com",
      "editor": "textfield",
      "prefill": "https://example.com"
    }
  },
  "required": ["url"]
}
```

This gives users a clean one-field input form.

---

## 3. Publication Tab (Store Listing)

This is where you publish to the Apify Store. Fill everything before hitting "Publish to Store".

### Display Information

| Field | What to put | Notes |
|-------|-------------|-------|
| **Title** | `SEOReport.dev – Free AI SEO Auditor \| Website Audit, Scores & Agent Ready` | Same as Settings tab |
| **Short description** | `Official free actor from SEOReport.dev. Get instant 0-100 SEO, Security & Performance scores for any website. Built for agents, scheduling & bulk audits.` | Same as Settings tab |
| **Description** | Copy-paste from `README.md` | This is the full Store page content |
| **Categories** | `SEO_TOOLS`, `AI`, `AUTOMATION` | Check all three |
| **Icon** | Upload `logo-clean.png` from `seoreport/assets/` | 256x256px ideal |

### Pricing
**Model:** `Pay per Usage` (free for users — they only pay Apify compute)
**Do NOT set `Pay per Event` for the free actor.**

### Monetization
Skip this section. The free actor funnels users to seoreport.dev for the $14 PDF and subscriptions.

---

## Naming Cheat Sheet

| Context | Type | Exact Value |
|---------|------|-------------|
| **Internal slug** (URL, code, API calls) | Technical | `seoreport-dev-ai-seo-auditor-free` |
| **Store title** (what users see) | Marketing | `SEOReport.dev – Free AI SEO Auditor \| Website Audit, Scores & Agent Ready` |
| **Repo name** (GitHub) | Technical | `seoreport-ai-seo-auditor-free` |
| **Package name** (package.json) | Technical | `seoreport-ai-seo-auditor-free` |
| **README H1** (Store description title) | Marketing | `SEOReport.dev – Free AI SEO Auditor \| Website Audit, Scores & Agent Ready` |

### Why the difference?
- **Technical names** are for machines: URLs, Git repos, API endpoints. They are short, lowercase, no spaces.
- **Marketing names** are for humans: Store listings, search results, social posts. They include branding, benefits, and keywords.

---

## Quick Copy-Paste Block

If you're filling out the Apify form right now, here's everything in one place:

**Name:**
```
seoreport-dev-ai-seo-auditor-free
```

**Title:**
```
SEOReport.dev – Free AI SEO Auditor | Website Audit, Scores & Agent Ready
```

**Short description:**
```
Official free actor from SEOReport.dev. Get instant 0-100 SEO, Security & Performance scores for any website. Built for agents, scheduling & bulk audits.
```

**Categories:** `SEO_TOOLS`, `AI`, `AUTOMATION`

**Pricing model:** `Pay per Usage`

---

## Post-Launch Checklist

- [ ] Actor builds successfully in Apify Console
- [ ] Test run with `https://example.com` returns JSON report
- [ ] Dataset tab shows the report output
- [ ] Publication tab is 100% filled
- [ ] "Publish to Store" button is green
- [ ] Click "Publish to Store"
- [ ] Share Store URL on X (@EnchantedRobot)
- [ ] Add banner on seoreport.dev: "Now on Apify for agents & automation"
