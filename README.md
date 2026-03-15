# radar-claw-defender

Defensive MCP server for Radar Meseriași, built on top of the OpenClaw runtime.

## What this fork is

`radar-claw-defender` is a Radar-first defensive review server. It accepts supplied artifacts and returns structured findings for the product risks that matter most to Radar Meseriași:

- auth bypass
- authorization / IDOR
- RLS gaps
- admin escalation
- OTP abuse
- webhook verification mistakes
- XSS / unsafe rendering
- sensitive data exposure
- rate limiting gaps
- input validation issues

The primary integration boundary is MCP, not a generic REST API.

## What this fork is not

This fork is not an offensive toolkit and must not be used for:

- unauthorized targeting
- exploit execution
- credential theft
- phishing or impersonation
- malware, persistence, or stealth
- browser automation against third-party targets
- shell-driven attack workflows

## MCP-first design

The local server exposes a small set of defensive tools:

- `analyze_code_snippet`
- `analyze_route`
- `analyze_sql_policy`
- `threat_model_flow`
- `summarize_finding`
- `review_auth_boundary`
- `review_rls_assumptions`

Each tool:

- accepts caller-supplied artifacts only
- returns structured JSON-safe output
- avoids filesystem crawling, URL fetching, and user-code execution

The first version runs over stdio MCP only. Remote MCP is a later step.

## Radar-specific context

Radar Meseriași is a marketplace for homeowners and craftsmen built on:

- Next.js App Router
- React
- Tailwind
- Supabase Auth
- PostgreSQL + RLS
- Twilio OTP
- Vercel
- planned or partial Stripe flows

This fork is opinionated around reviewing the security boundaries of that stack rather than acting as a generic AI utility platform.

## Adjacent subsystem: skill security pipeline

This repo also contains a defensive skill security pipeline for:

- deterministic packaging
- SHA-256 hashing
- scanner abstraction
- verdict-based policy gating
- scan metadata and audit history

That pipeline stays separate from the MCP tool surface in v1.

## Key files

- `docs/mcp-server-architecture.md`
- `docs/mcp-tools.md`
- `docs/mcp-transport-notes.md`
- `docs/chatgpt-mcp-integration-plan.md`
- `config/system-role.md`
- `config/radar-context.md`
- `config/security-guardrails.md`
- `config/review-checklist.md`
- `config/output-format.md`

## Run locally

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Start the stdio MCP server:

```bash
pnpm mcp:defender
```

Use a custom config:

```bash
pnpm mcp:defender --config ./config/radar-defender.example.json
```

## Design principles

- MCP-first
- defensive only
- deterministic outputs
- Radar-specific relevance
- no cyber theater
- no feature bloat

## Current focus

Future work should improve:

1. rule precision
2. MCP test coverage
3. Radar-specific review heuristics
4. remote MCP deployment readiness without widening the tool surface
