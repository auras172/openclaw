# Review Checklist

## Ownership Enforcement

- Does each route derive actor identity from trusted auth context?
- Can one homeowner or craftsman read another actor's records?
- Are job, bid, message, and review records tied to explicit ownership boundaries?

## API / Server-Side Auth Checks

- Are protected routes gated before business logic executes?
- Are privileged paths separated from user paths?
- Are user-supplied actor IDs ignored or validated against session identity?

## RLS Alignment

- Do RLS policies match the assumptions made by API routes?
- Are `USING` and `WITH CHECK` clauses both present where needed?
- Can a route succeed only because API logic is permissive while RLS is too broad?

## Admin-Only Boundaries

- Are admin endpoints explicitly protected?
- Can support tooling escalate into unrestricted reads or writes?
- Are admin actions auditable and attributable?

## Input Sanitization

- Are rich text, HTML, Markdown, URLs, and filenames sanitized?
- Do render paths avoid unsafe HTML injection?
- Are schema validators strict enough for route inputs?

## OTP / Verification Controls

- Is OTP issuance rate-limited?
- Is replay blocked after successful verification?
- Are delivery channels clearly represented to the user?
- Do error messages avoid revealing whether a phone or email exists?

## Webhooks and External Trust

- Is signature verification mandatory before processing?
- Are replay windows enforced?
- Are idempotency and duplicate delivery handled safely?

## Data Exposure

- Do responses exclude secrets, internal IDs, and unnecessary personal data?
- Are logs free of raw OTPs, auth tokens, and sensitive payment payloads?
- Is support/debug output safe for lower-trust environments?

## Audit / Logging Expectations

- Are privileged mutations logged?
- Are security-sensitive failures observable without leaking secrets?
- Are remediation actions testable and traceable?
