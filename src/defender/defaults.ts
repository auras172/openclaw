import {
  DEFENDER_ANALYZERS,
  DEFENDER_SEVERITIES,
  type DefenderAnalysisConfig,
  type DefenderSeverity,
} from "./types.ts";

export const RADAR_CLAW_DEFENDER_NAME = "radar-claw-defender";

export const DEFAULT_DEFENDER_CONFIG: DefenderAnalysisConfig = {
  minimumSeverity: "medium",
  enabledAnalyzers: [...DEFENDER_ANALYZERS],
  outputMode: "markdown",
  productContextOverrides: {
    productName: "Radar Meseriași",
    stack: ["nextjs", "react", "tailwind", "supabase-auth", "postgres", "rls", "twilio", "vercel"],
  },
};

export const EMPTY_SEVERITY_COUNTS: Record<DefenderSeverity, number> = Object.fromEntries(
  DEFENDER_SEVERITIES.map((severity) => [severity, 0]),
) as Record<DefenderSeverity, number>;
