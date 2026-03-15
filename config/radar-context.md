# Radar Meseriași Context

## Product Summary

Radar Meseriași is a local marketplace platform for homeowners and craftsmen. It helps property owners publish work, helps nearby craftsmen discover relevant jobs, and supports bids, messaging, verification, and future payments.

## User Roles

- Homeowner: creates jobs, reviews bids, messages craftsmen, manages property-side profile data
- Craftsman: maintains profile, discovers jobs, sends bids, responds to messages, manages verification state
- Admin / support operator: manages moderation, escalations, abuse review, and privileged settings
- System integrations: Supabase Auth, PostgreSQL, Twilio, Vercel, and future Stripe workflows

## Core Flows

### Jobs

- homeowner creates a job
- system stores job details, ownership, and location scope
- nearby craftsmen discover or are matched to the job

### Bids / Quotes

- craftsmen submit bids or quotes for a job
- totals and state transitions must be enforced server-side
- owners can review but must not modify contractor-owned quote content

### Messages

- owners and craftsmen exchange messages tied to a job or relationship context
- conversation visibility must stay limited to legitimate participants

### Profiles and Reviews

- both sides maintain identity and reputation signals
- profile ownership must be enforced across reads and writes
- reviews affect trust and must resist impersonation or duplicate submission abuse

### Notifications and OTP

- signup and verification rely on phone/email delivery
- OTP flows must resist replay, enumeration, brute force, and delivery confusion
- notification handlers must avoid sensitive data leakage

## Architecture Summary

- Frontend: Next.js App Router, React, TailwindCSS
- Backend: server routes + Supabase Auth + PostgreSQL
- Authorization model: Row Level Security (RLS) + server-side ownership checks
- Messaging / verification: Twilio SMS OTP, email fallback paths
- Hosting: Vercel
- Planned or partial payments: Stripe

## Known Security Priorities

1. Auth bypass
2. Authorization / IDOR
3. RLS policy gaps
4. Admin privilege escalation
5. OTP abuse / replay / enumeration
6. Webhook verification issues
7. XSS / unsafe rendering
8. Sensitive data exposure
9. Rate limiting gaps
10. Input validation issues
