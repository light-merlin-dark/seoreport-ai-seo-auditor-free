# Apify Actor Strategy — Historical Reference

**Date:** 2026-05-07  
**Status:** ✅ IMPLEMENTED — This document is kept for historical reference. Current state is in the workspace root `README.md`.  
**Author:** Kimi (synthesized from Grok conversation + project architecture review)  
**Scope:** repo topology, auth contract, deployment model, actor shape, and launch sequence for SEOReport's Apify Store presence.

> ⚠️ **Historical Document:** All phases described below are complete. The free actor and advanced actor are both published and operational. See workspace `README.md` for current state.

---

## 1. Executive Summary

The goal is to publish one **free Apify actor** that returns the same free-tier SEO report users already get on `seoreport.dev`. The actor is a thin proxy (~30–50 lines) that calls our existing API. It is **not** a new compute surface — it is a **distribution channel wrapper**.

This document answers the architectural questions:
1. Where do the actor repos live relative to the monorepo?
2. Which GitHub account/org should own them?
3. How does the actor authenticate with our API without breaking Turnstile, rate limits, or billing boundaries?
4. What is the build/deploy model (hint: *not* `prod-control`)?
5. What is the exact launch sequence?

---

## 2. Repo Topology Decision

### 2.1 The Monorepo Constraint

`AGENTS.md` constitutional rule:
> "Keep repo topology explicit. The repo root owns docs, lab direction, and the Stack bootstrap envelope. The engine implementation lives in `seoreport-engine/`. The hosted product lives in `seoreport-web/` and `seoreport-api/`. Do not let temporary root scripts or package files grow into a shadow application topology."

The Apify actor:
- Does **not** import from `seoreport-engine`
- Does **not** use Stack plugins, `@stack/*` packages, or the dev-runtime
- Does **not** share the monorepo's `bun.lock` or build pipeline
- Is a **standalone Node.js/Bun script** that runs inside Apify's Docker container

**Conclusion:** The actor must **not** live inside the `seoreport` monorepo. Adding it there would create a shadow topology — a foreign build system inside our canonical repo.

### 2.2 Recommended Topology

```
/Users/merlin/_dev/
├── seoreport/              ← canonical monorepo (existing)
│   ├── seoreport-web/
│   ├── seoreport-api/
│   ├── seoreport-engine/
│   └── docs/specs/apify-actor-strategy.md   ← this document
│
└── seoreport-apify/        ← NEW: workspace directory (not a git repo itself)
    ├── seoreport-ai-seo-auditor-free/     ← git repo #1
    └── seoreport-ai-seo-auditor-advanced/ ← git repo #2 (future)
```

**Why this shape:**
- Actors are "nearby" in the workspace — easy to find, edit, and reason about
- Each actor is an **independent git repo** — required by Apify's Git integration
- No risk of polluting the monorepo's lockfile, topology, or deploy pipeline
- `_dev/seoreport-apify/` itself is **not** a git repo — it's just a directory

### 2.3 Apify's Git Preference

Apify Console → Actor → Settings → Source type → Git repository:
- One Git URL per actor
- Apify clones the repo, builds a Docker image, and runs it
- There is no "monorepo" mode where one repo feeds multiple actors cleanly

While Apify *can* use subdirectories, the official recommendation and cleanest UX is **one repo per actor**.

---

## 3. GitHub Account Decision

### 3.1 Current State

- Personal GitHub: `github.com/light-merlin-dark`
- Existing private repos: `seoreport`, `ldis-merged`, `prod-server`, `sphinxcap`, `hyper-garden`
- `gh` CLI is authenticated with scopes: `admin:public_key`, `delete_repo`, `read:org`, `repo`

### 3.2 Options

| Option | Repo path | Pros | Cons |
|--------|-----------|------|------|
| A. Personal repo now | `light-merlin-dark/seoreport-ai-seo-auditor-free` | Fastest. No org setup. `gh` already auth'd. Can go live today. | Less "official" branding. Actor page shows personal handle. |
| B. New org now | `seoreport-dev/seoreport-ai-seo-auditor-free` | Clean branding. Professional appearance on Apify Store. | Takes 5–10 min to create org, move repos later if needed. |
| C. Personal now, org later | Start with A, migrate to B after launch | Best of both. Ship today, rebrand after validation. | Requires repo migration + Apify Git URL update later. |

### 3.3 Recommendation

**Option C — Personal now, org later.**

Rationale:
- Speed to market matters more than branding perfection for a thin wrapper
- The actor code is ~30 lines — not a flagship open-source project
- If the actor gets traction, creating `seoreport-dev` org and transferring takes 2 minutes
- Apify makes Git URL changes trivial (Settings → Source → update URL)

**Action:** Create `light-merlin-dark/seoreport-ai-seo-auditor-free` as a **public** repo. The actor code contains zero secrets (API key lives in Apify secrets).

---

## 4. The Hard Problem: API Authentication

### 4.1 Current API Boundaries

Our `POST /api/v1/reports/` endpoint has three authentication paths:

| Path | Auth | Turnstile | Rate Limit | Queue Cap | Billing |
|------|------|-----------|------------|-----------|---------|
| Anonymous | None | Required | IP-based | Checked | Free |
| Web authenticated | Cookie/session | Skipped | Relaxed | Checked | Subscription or one-off |
| MCP/API | API key + subscription | N/A | 30/hr/user | Checked | 1 credit/report |

### 4.2 The Actor's Requirements

The Apify actor is **server-to-server** calling our API on behalf of **anonymous Apify users**. It needs:
1. ✅ No Turnstile (impossible to solve programmatically in a server context)
2. ✅ No subscription requirement (the actor is a free discovery funnel)
3. ✅ Free report output (same as anonymous web user)
4. ✅ Respect queue capacity (don't crash our infra)
5. ✅ Abuse protection (the actor is a single IP/key hitting us repeatedly)
6. ✅ Usage attribution (we need to know Apify traffic vs organic)

### 4.3 The Gap

There is **no existing auth path** that satisfies all six requirements. The MCP path requires subscription. The anonymous path requires Turnstile.

### 4.4 Required API Change (Before Actor Launch)

We need a **new authentication lane**: `Actor Token`.

**Contract:**
- A new secret env var on the API: `SEOREPORT_ACTOR_TOKENS` (comma-separated list of SHA-256 hashes)
- Apify actor sends header: `X-SEOReport-Actor-Token: <token>`
- API middleware checks:
  1. Token matches one of the configured hashes
  2. If valid: treat as `entitlementState: "anonymous"`, `requestKind: "actor"`, skip Turnstile
  3. Rate limit: per-actor-token bucket (e.g., 60 req/hour per token) + global actor queue capacity reservation
  4. Report attribution: `requested_by_account_id = null`, `source = "apify"` (new column or telemetry tag)

**Why SHA-256 hashes, not plaintext:**
- The API config stores hashes only
- Apify secrets store the raw token
- If Apify secrets leak, we rotate without changing API env

**Why not reuse API keys (`@stack/plugin-api-keys`):**
- API keys are user-scoped and require subscription
- The actor represents *our* infrastructure talking to *our* API, not a user
- Mixing actor auth with user API keys conflates two different trust boundaries

### 4.5 Rate Limiting for Actor Traffic

Current anonymous rate limit: IP-based, ~3 reports/hour.

Actor traffic will funnel many users through one Apify container IP. We need:
- **Per-actor-token limit:** 60 req/hour (generous but bounded)
- **Global actor reserve:** Cap actor submissions at e.g., 20% of interactive queue depth
- **Telemetry:** Tag all actor-generated jobs so we can monitor volume

If the actor hits limits, it should return a clean error to the Apify user:
```json
{
  "error": "SEOReport is at capacity. Please try again in a few minutes."
}
```

---

## 5. Actor Code Shape

### 5.1 File Layout (Repo `seoreport-ai-seo-auditor-free`)

```
seoreport-ai-seo-auditor-free/
├── .actor/
│   ├── actor.json          ← Apify actor manifest
│   └── input_schema.json   ← URL input field
├── src/
│   └── main.js             ← ~40 lines of core logic
├── package.json            ← Depends on `apify` SDK only
├── Dockerfile              ← Apify base image
└── README.md               ← Store listing copy
```

### 5.2 Core Logic Pseudocode

```js
import { Actor } from 'apify';

await Actor.init();
const { url } = await Actor.getInput();

const API_BASE = process.env.SEOREPORT_API_BASE_URL || 'https://api.seoreport.dev';
const ACTOR_TOKEN = process.env.SEOREPORT_ACTOR_TOKEN;

if (!ACTOR_TOKEN) {
  throw new Error('SEOReport actor token is not configured');
}

const res = await fetch(`${API_BASE}/api/v1/reports/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-SEOReport-Actor-Token': ACTOR_TOKEN,
  },
  body: JSON.stringify({ url }),
});

const data = await res.json();

if (!data.success) {
  console.error('SEOReport API error:', data.error);
  await Actor.setValue('OUTPUT', { success: false, error: data.error });
  await Actor.exit(1);
}

// Poll until ready (or return immediately with jobId for async)
const report = await pollUntilReady(data.report.jobId);

await Actor.pushData(report);           // Apify Dataset
await Actor.setValue('OUTPUT', report); // Apify key-value store

console.log(`✅ Free SEO report for ${url} — ${report.score.overall}/100`);
console.log(`💡 Upgrade: https://seoreport.dev/pricing`);

await Actor.exit();
```

### 5.3 Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Sync or async? | **Sync with timeout** | Apify users expect a result, not a job ID. Poll for up to 90s. |
| Poll interval | 2s | Matches web frontend timing. |
| Timeout | 90s | Apify free tier has limits; 90s is the pragmatic ceiling. |
| Output format | Exact API JSON | Keeps actor dumb. All formatting lives in our API. |
| Dataset push | Yes | Required for Apify automation users (CSV/JSON export). |
| Upsell footer | Included in report JSON | Our API already returns this. No extra actor code needed. |

---

## 6. Deployment Model (Not `prod-control`)

### 6.1 How Apify Builds Run

Apify actors are **not** deployed to our production server. They are:
1. Built by Apify's infrastructure from our GitHub repo
2. Run inside Apify's Docker containers on Apify's cloud
3. Billed to the Apify user (compute units) or to us (if we choose)
4. Managed through Apify Console, not `prod-control`

### 6.2 Our Deploy Flow for the Actor

```
Local edit → git push → Apify auto-builds → Test in Apify Console → Publish to Store
```

No `prod service deploy`. No systemd. No Traefik. No host bus.

### 6.3 Environment Variables (Apify Secrets)

Set in Apify Console → Actor → Settings → Environment variables:

| Secret | Value | Notes |
|--------|-------|-------|
| `SEOREPORT_API_BASE_URL` | `https://api.seoreport.dev` | Prod API endpoint |
| `SEOREPORT_ACTOR_TOKEN` | `<raw-token>` | Rotatable without code change |

**Critical:** These are Apify secrets, not in our `prod-control` manifest system. They are managed through Apify Console.

---

## 7. Launch Sequence

### Phase 0: API Preparation ✅ COMPLETE

- [x] Implement `X-SEOReport-Actor-Token` auth lane in `seoreport-api`
- [x] Add actor token hash to `prod env` for API service
- [x] Add `source = "apify"` telemetry tag to report jobs
- [x] Deploy API with actor auth support
- [x] Generate actor token, store raw in 1Password/Bitwarden, store hash in prod env

### Phase 1: Actor Repo ✅ COMPLETE

- [x] `gh repo create light-merlin-dark/seoreport-ai-seo-auditor-free --public --add-readme`
- [x] Scaffold `.actor/actor.json`, `src/main.js`, `package.json`, `README.md`
- [x] Push to GitHub

### Phase 2: Apify Setup ✅ COMPLETE

- [x] Apify Console → New Actor → Source = Git repository
- [x] Paste GitHub URL
- [x] Add secrets (`SEOREPORT_API_BASE_URL`, `SEOREPORT_ACTOR_TOKEN`)
- [x] Build & test with 3–5 real domains

### Phase 3: Store Listing ✅ COMPLETE

- [x] Fill Publication tab (title, description, categories: SEO_TOOLS, AI, AUTOMATION)
- [x] Upload logo
- [x] Paste README.md as Store description
- [x] Enable MCP in Actor settings
- [x] Publish to Store

### Phase 4: Funnel Wiring

- [ ] Add banner on `seoreport.dev`: "Now on Apify for agents & automation"
- [ ] Post on X (@EnchantedRobot)
- [ ] Monitor Analytics tab for 48h

---

## 8. Risk Analysis

| Risk | Severity | Mitigation |
|------|----------|------------|
| API abused via leaked actor token | High | Token is Apify-secret only. Rotate monthly. Per-token rate limits. |
| Apify actor overwhelms queue | Medium | Global actor cap at 20% of interactive queue. Monitor telemetry. |
| User confusion: "Why is this free on Apify but not the site?" | Low | Same free report on both. Actor returns identical JSON. No feature gap. |
| Apify platform changes pricing/breaks build | Low | Actor is 30 lines. Rewrite for any platform takes <1 hour. |
| Competitor scrapes our API via actor | Medium | Actor token auth required. Token is not in repo. Rate limits apply. |
| GitHub personal account looks unprofessional | Low | Create `seoreport-dev` org after 30 days if traction warrants it. |

---

## 9. Billing & Revenue Impact

### 9.1 Cost to Us

The actor calls our free report endpoint. Each call:
- Consumes queue capacity (same as anonymous web user)
- Runs the full engine (same compute cost)
- Does **not** generate revenue directly

**This is intentional.** The actor is a **customer acquisition channel**, not a revenue channel.

### 9.2 Revenue Funnel

Every report includes:
- "Purchase advanced report – $14.00" (link to pricing)
- "Need help fixing these issues? Contact us"

Conversion path:
```
Apify user runs free actor → sees score & findings → clicks upsell → lands on seoreport.dev → buys $14 PDF or subscribes
```

### 9.3 Paid Actor (Advanced)

✅ **IMPLEMENTED.** The advanced actor `seoreport-ai-seo-auditor-advanced` is published on the Apify Store with:
- Pay per Event: $12.00 per run (we net ~$9.60)
- Returns full unlocked report via paid actor token auth lane
- Separate token pool from free actor for security isolation

---

## 10. Open Questions

1. **Actor token auth:** Do we implement a new `X-SEOReport-Actor-Token` header, or is there an existing Stack/plugin mechanism we can reuse?
2. **Queue reservation:** Should actor submissions get their own scheduling class (e.g., `"actor"`) or reuse `"interactive"`?
3. **Telemetry:** Do we want a dedicated `report_events` event_code for actor-generated reports?
4. **Org migration trigger:** What metric (runs/day, revenue, Store ranking) triggers creating `seoreport-dev` GitHub org?

---

## 11. Decision Log

| Decision | Choice | Date | Rationale |
|----------|--------|------|-----------|
| Repo location | `_dev/seoreport-apify/` sibling dir | 2026-05-07 | Avoids monorepo topology pollution |
| GitHub account | `light-merlin-dark` personal | 2026-05-07 | Ship today, org later |
| Actor count | 2 actors (free + advanced) | 2026-05-07 | Free for discovery, paid for full unlock |
| Auth mechanism | New `X-SEOReport-Actor-Token` | 2026-05-07 | No existing lane satisfies requirements |
| Deploy method | Apify Console + GitHub | 2026-05-07 | Not a `prod-control` service |
| Output format | Exact API JSON | 2026-05-07 | Keep actor thin, formatting in API |
| Sync behavior | Poll up to 90s | 2026-05-07 | Apify UX expectation |
