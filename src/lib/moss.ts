import { CORPUS, STORM_T0, ageLabel } from "./corpus";
import type { StormDoc } from "./types";

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9.\-]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

export type MossHit = StormDoc & { score: number; age: string };

/** Local hybrid search: keyword overlap + feeder/zone boost + recency. */
export function mossSearch(query: string, opts?: { feeder?: string; k?: number }): MossHit[] {
  const q = tokens(query);
  if (!q.length) return [];
  const feeder = opts?.feeder;
  const scored = CORPUS.map((doc) => {
    const hay = tokens(`${doc.title} ${doc.body} ${doc.feeder_id} ${doc.zone} ${doc.kind}`);
    let overlap = 0;
    for (const t of q) if (hay.includes(t)) overlap += 1;
    const phrase = query.toLowerCase();
    if (doc.title.toLowerCase().includes(phrase) || doc.body.toLowerCase().includes(phrase)) overlap += 3;
    let score = overlap;
    if (feeder && (doc.feeder_id === feeder || doc.feeder_id === "ALL")) score += 2;
    const ageMin = (STORM_T0 - new Date(doc.timestamp).getTime()) / 60000;
    if (ageMin < 30) score += 1.5;
    else if (ageMin < 120) score += 0.5;
    if (doc.confirmation_status === "confirmed") score += 0.4;
    return { ...doc, score, age: ageLabel(doc.timestamp) };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, opts?.k ?? 5);
}

export function docsByFeeder(feeder: string): StormDoc[] {
  return CORPUS.filter((d) => d.feeder_id === feeder || d.feeder_id === "ALL");
}
