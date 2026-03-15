# ChatGPT Integration Plan

## Objective

Expose `radar-claw-defender` through a narrow HTTP API that ChatGPT can call later through OpenAPI-based Actions, while preserving the defensive-only scope.

## Phase 1: Internal Contract First

- finalize request and response schemas
- keep analyzers local and deterministic
- validate findings against Radar Meseriași context files
- avoid coupling the service directly to ChatGPT-specific SDK code

## Phase 2: Protected Internal API

- host a small HTTPS service behind authenticated access
- expose only review endpoints from `openapi/radar-claw-openapi.yaml`
- add request size limits, auth, and audit logging
- keep outputs free of secrets and raw sensitive artifacts

## Phase 3: ChatGPT Actions / Custom GPT

- import the OpenAPI schema into GPT Actions
- bind Actions to the protected public endpoint
- map each action to one of the safe review surfaces
- disable any future endpoints that introduce execution or live probing

## Authentication Considerations

- use a dedicated server-to-server API key or OAuth layer
- do not reuse operator shell tokens or local credentials
- separate gateway auth from model-provider auth
- rotate public integration credentials independently

## Safety Scope

Must remain enabled:

- code/config review
- route review
- SQL/RLS review
- threat modeling
- finding summarization

Must remain disabled unless there is a separate explicit design and approval:

- live scanning
- URL fetching outside allowlisted docs or provided artifacts
- browser automation
- shell execution
- patch application in production targets
- any endpoint that increases offensive capability

## Operational Notes

- the model-facing API should be stateless
- product context should be injected through versioned config files, not hidden prompts
- response schemas should remain stable for downstream tooling
