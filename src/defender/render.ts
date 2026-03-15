import type { DefenderAnalysisResult, DefenderFinding } from "./types.ts";

export function renderFindingMarkdown(finding: DefenderFinding): string {
  return [
    `### Finding`,
    finding.finding,
    ``,
    `- Severity: ${finding.severity}`,
    `- Affected area: ${finding.affectedArea}`,
    `- Preconditions:`,
    ...finding.preconditions.map((item) => `  - ${item}`),
    `- Why it matters: ${finding.whyItMatters}`,
    `- Evidence:`,
    ...finding.evidence.map((item) => `  - ${item}`),
    `- Recommended fix:`,
    ...finding.recommendedFix.map((item) => `  - ${item}`),
    `- Regression test idea: ${finding.regressionTestIdea}`,
  ].join("\n");
}

export function renderAnalysisResult(result: DefenderAnalysisResult): string {
  return [
    `## Summary`,
    `- Request ID: ${result.requestId}`,
    `- Total findings: ${result.summary.totalFindings}`,
    `- Unverified: ${result.unverified.length ? result.unverified.join("; ") : "none"}`,
    ``,
    ...result.findings.map(renderFindingMarkdown),
  ].join("\n");
}
