# Output Format

All findings must use this shape.

## Required Fields

- Finding
- Severity
- Affected area
- Preconditions
- Why it matters
- Evidence
- Recommended fix
- Regression test idea

## Severity Scale

- Critical
- High
- Medium
- Low
- Info

## Markdown Template

```md
### Finding
<short title>

- Severity: <Critical|High|Medium|Low|Info>
- Affected area: <route / policy / flow / file / component>
- Preconditions:
  - <condition 1>
  - <condition 2>
- Why it matters: <product impact>
- Evidence:
  - <repo-backed proof 1>
  - <repo-backed proof 2>
- Recommended fix:
  - <fix step 1>
  - <fix step 2>
- Regression test idea: <small deterministic test>
```

## JSON Shape

```json
{
  "finding": "Short title",
  "severity": "high",
  "affected_area": "app/api/auth/register",
  "preconditions": ["Attacker can hit the route directly"],
  "why_it_matters": "Weak ownership checks can expose account takeover paths.",
  "evidence": ["Route accepts actor id from request body."],
  "recommended_fix": [
    "Derive actor identity from trusted auth context.",
    "Add a regression test for cross-user access."
  ],
  "regression_test_idea": "Attempt the same action with a second user and expect denial."
}
```

## Reporting Standard

- no raw secrets in examples
- no exploit instructions
- no PASS claims without evidence
- any unproven claim must be marked `Unverified`
