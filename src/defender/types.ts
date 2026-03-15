export const DEFENDER_SEVERITIES = ["critical", "high", "medium", "low", "info"] as const;
export const DEFENDER_ANALYZERS = [
  "auth-bypass",
  "authorization-idor",
  "rls-alignment",
  "admin-boundary",
  "otp-abuse",
  "webhook-verification",
  "xss-rendering",
  "data-exposure",
  "rate-limiting",
  "input-validation",
] as const;
export const OUTPUT_MODES = ["markdown", "json"] as const;

export type DefenderSeverity = (typeof DEFENDER_SEVERITIES)[number];
export type DefenderAnalyzerName = (typeof DEFENDER_ANALYZERS)[number];
export type DefenderOutputMode = (typeof OUTPUT_MODES)[number];

export type DefenderFinding = {
  finding: string;
  severity: DefenderSeverity;
  affectedArea: string;
  preconditions: string[];
  whyItMatters: string;
  evidence: string[];
  recommendedFix: string[];
  regressionTestIdea: string;
};

export type DefenderAnalysisConfig = {
  minimumSeverity: DefenderSeverity;
  enabledAnalyzers: DefenderAnalyzerName[];
  outputMode: DefenderOutputMode;
  productContextOverrides?: Record<string, unknown>;
};

export type DefenderArtifact = {
  kind: "code-snippet" | "file" | "route" | "sql-policy" | "threat-model";
  name: string;
  content: string;
  language?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

export type DefenderAnalysisResult = {
  requestId: string;
  mode: DefenderOutputMode;
  summary: {
    totalFindings: number;
    bySeverity: Record<DefenderSeverity, number>;
  };
  findings: DefenderFinding[];
  unverified: string[];
};
