import type { seasonRow, whatIfRow } from "@/types/coaches";
import { maxYear } from "@/lib/coaches/sort";

export const Games = 17;
export const Records: string[] = Array.from({ length: 18 }).map(
  (_, i) => `${i}-${Games - i}`,
);

export const Plyf_Round: string[] = [
  "Misses Playoffs",
  "Loses WC Round",
  "Loses Div Round",
  "Loses Title Game",
  "Loses Super Bowl",
  "Wins Super Bowl",
];

/** Grid published by the backend: scores[coachId][record][round]. */
export type WhatIfScores = Record<string, number[][]>;

export type WhatIfCoach = {
  display: seasonRow;
};

const RECORD_MAX = Records.length - 1;
const ROUND_MAX = Plyf_Round.length - 1;

/**
 * What-If coach list for the prediction season. Every current-season row is
 * included; record and playoff heat come from the precomputed grid.
 */
export function buildWhatIfCoaches(rows: seasonRow[]): WhatIfCoach[] {
  const predictionSeason = maxYear(rows);
  return rows
    .filter((row) => row.year === predictionSeason)
    .map((display) => ({ display }))
    .sort((a, b) => a.display.name.localeCompare(b.display.name));
}

export function buildWhatIfScores(
  rows: readonly whatIfRow[] | null | undefined,
): WhatIfScores {
  const scores: WhatIfScores = {};
  if (!rows) return scores;
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || row.id.length === 0) continue;
    const record =
      typeof row.record === "number" ? row.record : Number(row.record);
    const round = typeof row.round === "number" ? row.round : Number(row.round);
    const prob = typeof row.prob === "number" ? row.prob : Number(row.prob);
    if (!Number.isInteger(record) || record < 0 || record > RECORD_MAX) {
      continue;
    }
    if (!Number.isInteger(round) || round < 0 || round > ROUND_MAX) continue;
    if (!Number.isFinite(prob)) continue;
    const byRecord = scores[row.id] ?? [];
    const rounds = byRecord[record] ?? [];
    rounds[round] = prob;
    byRecord[record] = rounds;
    scores[row.id] = byRecord;
  }
  return scores;
}

/** Missing coach, record, or round returns null instead of throwing. */
export function lookupWhatIfScore(
  scores: WhatIfScores | null | undefined,
  id: string,
  record: number,
  round: number,
): number | null {
  const value = scores?.[id]?.[record]?.[round];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

const What_If_Init: Map<
  string,
  { record: number; round: number; seed: number }
> = new Map([
  ["BowlTo0", { record: 7, round: 0, seed: 0.54 }],
  ["CallBr0", { record: 4, round: 0, seed: 0.47 }],
  ["CampDa1", { record: 10, round: 1, seed: 0.11 }],
  ["CanaDa0", { record: 3, round: 0, seed: 0.66 }],
  ["CarrPe0", { record: 5, round: 0, seed: 0.45 }],
  ["CoenLi0", { record: 4, round: 0, seed: 0.36 }],
  ["DaboBr0", { record: 9, round: 1, seed: 0.1 }],
  ["GannJo0", { record: 8, round: 0, seed: 0.48 }],
  ["GlenAa0", { record: 4, round: 0, seed: 0.43 }],
  ["HarbJi0", { record: 7, round: 0, seed: 0.25 }],
  ["HarbJo0", { record: 11, round: 1, seed: 0.21 }],
  ["JohnBe0", { record: 4, round: 0, seed: 0.42 }],
  ["LaFlMa0", { record: 8, round: 0, seed: 0.19 }],
  ["MacdMi0", { record: 4, round: 0, seed: 0.49 }],
  ["McDaMi0", { record: 4, round: 0, seed: 0.59 }],
  ["McDeSe0", { record: 10, round: 1, seed: 0.08 }],
  ["McVaSe0", { record: 5, round: 0, seed: 0.32 }],
  ["MoorKe0", { record: 5, round: 0, seed: 0.15 }],
  ["MorrRa0", { record: 5, round: 0, seed: 0.58 }],
  ["OConKe0", { record: 6, round: 0, seed: 0.46 }],
  ["PaytSe0", { record: 7, round: 0, seed: 0.2 }],
  ["QuinDa0", { record: 9, round: 1, seed: 0.09 }],
  ["ReidAn0", { record: 11, round: 2, seed: 0.26 }],
  ["RyanDe0", { record: 6, round: 0, seed: 0.33 }],
  ["SchoBr0", { record: 10, round: 1, seed: 0.07 }],
  ["ShanKy0", { record: 7, round: 0, seed: 0.26 }],
  ["SiriNi0", { record: 7, round: 0, seed: 0.26 }],
  ["StefKe0", { record: 5, round: 0, seed: 0.63 }],
  ["SteiSh0", { record: 5, round: 0, seed: 0.59 }],
  ["TaylZa0", { record: 9, round: 1, seed: 0.19 }],
  ["TomlMi0", { record: 9, round: 1, seed: 0.38 }],
  ["VrabMi0", { record: 11, round: 2, seed: 0.1 }],
]);

export function get_what_if_init(id: string): {
  record: number;
  round: number;
  seed: number;
} {
  return What_If_Init.has(id)
    ? (What_If_Init.get(id) as { record: number; round: number; seed: number })
    : { record: 6, round: 0, seed: 0.2 };
}
