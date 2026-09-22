import type { FieldReport } from "./types";
import { CORPUS } from "./corpus";

const HIGH = /\b(primary|energized|wire down|downed|gas|explosion|fire|injury|live wire)\b/i;

export function classifyRisk(summary: string, kind: FieldReport["kind"]): "low" | "high" {
  if (kind === "hazard") return "high";
  if (kind === "inventory") return "low";
  return HIGH.test(summary) ? "high" : "low";
}

export function detectConflict(summary: string, feeder_id: string): string | undefined {
  const low = summary.toLowerCase();
  const related = CORPUS.filter((d) => d.feeder_id === feeder_id || d.feeder_id === "ALL");
  for (const d of related) {
    if (d.kind === "hazard" && /clear|no hazard|all clear/.test(low) && /downed|gas/.test(d.body.toLowerCase())) {
      return `Conflicts with ${d.title} (${d.id}).`;
    }
  }
  return undefined;
}

export function routeReport(input: Omit<FieldReport, "id" | "createdAt" | "status" | "risk" | "conflict">): FieldReport {
  const risk = classifyRisk(input.summary, input.kind);
  const conflict = detectConflict(input.summary, input.feeder_id);
  const high = risk === "high" || Boolean(conflict);
  return {
    ...input,
    id: `rpt-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
    risk: high ? "high" : "low",
    conflict,
    status: high ? "held" : "auto_published",
  };
}
