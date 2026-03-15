import { DEFAULT_DEFENDER_CONFIG, EMPTY_SEVERITY_COUNTS, RADAR_CLAW_DEFENDER_NAME } from "./defaults.ts";
import { renderAnalysisResult } from "./render.ts";
import type {
  DefenderAnalysisConfig,
  DefenderAnalysisResult,
  DefenderArtifact,
  DefenderFinding,
  DefenderOutputMode,
} from "./types.ts";

type PatternRule = {
  id: string;
  analyzer: DefenderAnalysisConfig["enabledAnalyzers"][number];
  severity: DefenderFinding["severity"];
  affectedArea: string;
  pattern: RegExp;
  finding: string;
  whyItMatters: string;
  recommendedFix: string[];
  regressionTestIdea: string;
};

const PATTERN_RULES: PatternRule[] = [
  {
    id: "service-role",
    analyzer: "auth-bypass",
    severity: "high",
    affectedArea: "auth / data access boundary",
    pattern: /service_role|SUPABASE_SERVICE_ROLE|createServerClient/iu,
    finding: "Privileged Supabase or service-role usage detected in supplied artifact",
    whyItMatters:
      "Privileged data access in the wrong layer can bypass actor scoping and turn small mistakes into full data exposure.",
    recommendedFix: [
      "Move privileged access behind explicit admin-only boundaries.",
      "Use least-privilege client construction for user-facing flows.",
    ],
    regressionTestIdea:
      "Add a route-level test that proves a normal user path cannot read or mutate another actor's records through the privileged code path.",
  },
  {
    id: "error-message",
    analyzer: "data-exposure",
    severity: "medium",
    affectedArea: "response shaping",
    pattern: /error\.message/iu,
    finding: "Raw error.message exposure detected",
    whyItMatters:
      "Raw exception messages can leak provider details, stack hints, or sensitive implementation context that helps attackers enumerate the system.",
    recommendedFix: [
      "Replace raw exception output with stable, product-safe error messages.",
      "Log sensitive internals separately in protected observability surfaces.",
    ],
    regressionTestIdea:
      "Assert that the route returns a fixed public error string even when the underlying dependency throws a detailed exception.",
  },
  {
    id: "dangerous-html",
    analyzer: "xss-rendering",
    severity: "high",
    affectedArea: "rendering / XSS",
    pattern: /dangerouslySetInnerHTML|innerHTML\s*=/iu,
    finding: "Unsafe HTML rendering primitive detected",
    whyItMatters:
      "Unsafe rendering can expose users or admins to stored or reflected XSS through messages, profiles, reviews, or job descriptions.",
    recommendedFix: [
      "Prefer escaped rendering paths.",
      "If rich content is required, sanitize to a strict allowlist before render.",
    ],
    regressionTestIdea:
      "Render attacker-controlled content containing script-like payloads and assert that the UI outputs inert escaped text.",
  },
  {
    id: "rls-allow-all",
    analyzer: "rls-alignment",
    severity: "critical",
    affectedArea: "RLS / policy enforcement",
    pattern: /using\s*\(\s*true\s*\)|with\s+check\s*\(\s*true\s*\)/iu,
    finding: "Overly broad SQL / RLS policy detected",
    whyItMatters:
      "Policies that devolve to TRUE can silently break ownership boundaries and turn the database into an allow-all layer.",
    recommendedFix: [
      "Replace permissive policy clauses with actor- and ownership-aware predicates.",
      "Align API assumptions with policy-level checks for both read and write paths.",
    ],
    regressionTestIdea:
      "Create a second actor in tests and verify that cross-user reads and writes are denied by the database, not only by API logic.",
  },
];

const SEVERITY_RANK: Record<DefenderFinding["severity"], number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  info: 0,
};

function buildRequestId(artifact: DefenderArtifact): string {
  const compactName = artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${RADAR_CLAW_DEFENDER_NAME}:${artifact.kind}:${compactName || "artifact"}:${artifact.content.length}`;
}

function normalizeConfig(overrides?: Partial<DefenderAnalysisConfig>): DefenderAnalysisConfig {
  return {
    ...DEFAULT_DEFENDER_CONFIG,
    ...overrides,
    enabledAnalyzers: overrides?.enabledAnalyzers ?? DEFAULT_DEFENDER_CONFIG.enabledAnalyzers,
    productContextOverrides:
      overrides?.productContextOverrides ?? DEFAULT_DEFENDER_CONFIG.productContextOverrides,
  };
}

function makeResult(
  requestId: string,
  mode: DefenderOutputMode,
  findings: DefenderFinding[],
  unverified: string[] = [],
): DefenderAnalysisResult {
  const bySeverity = { ...EMPTY_SEVERITY_COUNTS };
  for (const finding of findings) {
    bySeverity[finding.severity] += 1;
  }
  return {
    requestId,
    mode,
    summary: {
      totalFindings: findings.length,
      bySeverity,
    },
    findings,
    unverified,
  };
}

function scanArtifact(artifact: DefenderArtifact, config?: Partial<DefenderAnalysisConfig>): DefenderAnalysisResult {
  const normalized = normalizeConfig(config);
  const findings = PATTERN_RULES.flatMap((rule) => {
    if (!normalized.enabledAnalyzers.includes(rule.analyzer)) {
      return [];
    }
    if (!rule.pattern.test(artifact.content)) {
      return [];
    }
    const finding: DefenderFinding = {
      finding: rule.finding,
      severity: rule.severity,
      affectedArea: `${artifact.name} (${rule.affectedArea})`,
      preconditions: ["Reviewer supplied an artifact containing the matched pattern."],
      whyItMatters: rule.whyItMatters,
      evidence: [`Pattern matched: ${rule.pattern}`],
      recommendedFix: rule.recommendedFix,
      regressionTestIdea: rule.regressionTestIdea,
    };
    return [finding];
  }).filter(
    (finding) => SEVERITY_RANK[finding.severity] >= SEVERITY_RANK[normalized.minimumSeverity],
  );

  return makeResult(buildRequestId(artifact), normalized.outputMode, findings, [
    "Pattern-based heuristics only; no full semantic execution performed.",
  ]);
}

export function analyzeCodeSnippet(
  snippet: string,
  options?: { language?: string; path?: string; config?: Partial<DefenderAnalysisConfig> },
): DefenderAnalysisResult {
  return scanArtifact(
    {
      kind: "code-snippet",
      name: options?.path ?? "snippet",
      language: options?.language,
      content: snippet,
    },
    options?.config,
  );
}

export function analyzeFileArtifact(
  path: string,
  content: string,
  options?: { language?: string; config?: Partial<DefenderAnalysisConfig> },
): DefenderAnalysisResult {
  return scanArtifact(
    {
      kind: "file",
      name: path,
      language: options?.language,
      content,
    },
    options?.config,
  );
}

export function analyzeRouteArtifact(
  routePath: string,
  handler: string,
  options?: { method?: string; config?: Partial<DefenderAnalysisConfig> },
): DefenderAnalysisResult {
  return scanArtifact(
    {
      kind: "route",
      name: `${options?.method ?? "GET"} ${routePath}`,
      content: handler,
    },
    options?.config,
  );
}

export function analyzeSqlPolicy(
  sql: string,
  options?: { table?: string; policyName?: string; config?: Partial<DefenderAnalysisConfig> },
): DefenderAnalysisResult {
  return scanArtifact(
    {
      kind: "sql-policy",
      name: options?.policyName ?? options?.table ?? "sql-policy",
      content: sql,
    },
    options?.config,
  );
}

export function threatModelFlow(input: {
  flowName: string;
  actors: string[];
  assets: string[];
  steps: string[];
  trustBoundaries?: string[];
  config?: Partial<DefenderAnalysisConfig>;
}): DefenderAnalysisResult {
  const combined = [
    `Flow: ${input.flowName}`,
    `Actors: ${input.actors.join(", ")}`,
    `Assets: ${input.assets.join(", ")}`,
    `Steps: ${input.steps.join(" -> ")}`,
    `Trust boundaries: ${(input.trustBoundaries ?? []).join(", ")}`,
  ].join("\n");
  return scanArtifact(
    {
      kind: "threat-model",
      name: input.flowName,
      content: combined,
    },
    input.config,
  );
}

export function summarizeFindingForAudience(
  finding: DefenderFinding,
  audience: "engineer" | "founder" | "support" | "auditor",
): string {
  const prefix =
    audience === "founder"
      ? "Business risk:"
      : audience === "support"
        ? "Support note:"
        : audience === "auditor"
          ? "Audit summary:"
          : "Engineering summary:";
  return `${prefix} ${finding.finding} (${finding.severity}) affects ${finding.affectedArea}. ${finding.whyItMatters}`;
}

export function renderResult(result: DefenderAnalysisResult): string {
  return result.mode === "json" ? JSON.stringify(result, null, 2) : renderAnalysisResult(result);
}
