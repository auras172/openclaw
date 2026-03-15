# API Design: radar-claw-defender

## Goal

Expose a small, safe analysis API that can later be connected to ChatGPT Actions or another thin client without turning the system into an execution engine.

## Design Principles

- accept review artifacts only
- never execute arbitrary code from requests
- return structured findings only
- keep endpoints narrow and predictable
- prefer deterministic output and explicit `unverified` states

## Endpoint Surface

| Endpoint | Purpose | Input | Output |
| --- | --- | --- | --- |
| `POST /analyze/code-snippet` | Review a small snippet for defensive risks | language, snippet, optional file path | structured findings |
| `POST /analyze/file` | Review a file artifact supplied by the caller | path, content, optional language | structured findings |
| `POST /analyze/route` | Review a route handler in product context | method, path, handler code, optional context | structured findings |
| `POST /analyze/sql-policy` | Review SQL or RLS policy text | table, policy name, sql | structured findings |
| `POST /threat-model/flow` | Threat-model a described product flow | actors, assets, steps, trust boundaries | structured findings |
| `POST /summarize/finding` | Rewrite one finding for a target audience | finding object + audience | summary text + same structure |

## Shared Request Rules

- text artifacts only
- bounded payload size
- no live URLs fetched by the service
- no shell commands, browser automation, or remote execution
- caller supplies context explicitly

## Shared Response Rules

Every analysis response returns:

- `request_id`
- `mode`
- `summary`
- `findings`
- `unverified`

## Safety Controls

- API authentication required for all endpoints
- per-endpoint rate limiting
- request logging without sensitive payload retention
- output restricted to defensive review and remediation language
- no access to filesystem paths outside supplied artifacts

## Recommended Deployment Shape

1. Internal-only service first
2. Gateway/API key in front of OpenAI/ChatGPT Actions later
3. Strict allowlist of endpoints exposed publicly
4. Separate operator auth from model-provider auth

## Non-Goals

- offensive assessment APIs
- remote scanning or crawling
- secret extraction
- arbitrary command execution
- automatic patch application without human approval
