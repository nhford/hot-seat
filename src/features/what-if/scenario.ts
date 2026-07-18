import type { inputData, seasonRow } from "@/types/coaches";
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

const K = 5;

type SeasonToken = {
  age: number;
  playoff_round: number;
  win_pct: number;
  w_plyf: number;
  coy_share: number;
  coy_rank: number | null;
  tenure_idx: number;
};

type LgbmContext = {
  poc: number;
  prior_hc_stops: number;
  prior_hc_seasons: number;
  prior_win_pct: number | null;
  prior_w_plyf: number;
  prior_sb_wins: number;
  prior_sb_apps: number;
  prior_coy_share: number;
  /** SB totals through base year (before the What-If season). */
  career_sb_wins_base: number;
  career_sb_apps_base: number;
  years_since_last_hc: number | null;
  prehire_win_pct_1: number | null;
  prehire_round_1: number | null;
  prehire_win_pct_2: number | null;
  prehire_round_2: number | null;
  prehire_win_pct_3: number | null;
  prehire_round_3: number | null;
  exp_base: number;
  tenure_base: number;
};

/** roll = synthesize next season from a completed year; inplace = score the prediction season itself (new hires). */
export type WhatIfMode = "roll" | "inplace";

export type WhatIfCoach = {
  display: seasonRow;
  base: seasonRow;
  mode: WhatIfMode;
  /** Current-stop seasons through base year, oldest → newest. */
  stopTokens: SeasonToken[];
  context: LgbmContext;
};

function toToken(row: seasonRow): SeasonToken {
  const coyRank = row.coy_rank;
  return {
    age: row.age,
    playoff_round: row.round,
    win_pct: row.win_pct,
    w_plyf: row.w_plyf,
    coy_share: row.coy_share,
    coy_rank:
      coyRank == null || Number.isNaN(coyRank) || coyRank === 0 ? null : coyRank,
    tenure_idx: row.tenure,
  };
}

function assignStops(
  seasons: seasonRow[],
): { row: seasonRow; stopId: number }[] {
  let stopId = 0;
  return seasons.map((row, i) => {
    if (i > 0) {
      const prev = seasons[i - 1];
      if (row.team !== prev.team || row.year !== prev.year + 1) stopId += 1;
    }
    return { row, stopId };
  });
}

function teamYearLookup(
  rows: seasonRow[],
  team: string,
  year: number,
): { win_pct: number | null; round: number | null } {
  const hit = rows.find((r) => r.team === team && r.year === year);
  if (!hit) return { win_pct: null, round: null };
  return { win_pct: hit.win_pct, round: hit.round };
}

function prehireContext(
  rows: seasonRow[],
  team: string,
  hireYear: number,
): Pick<
  LgbmContext,
  | "prehire_win_pct_1"
  | "prehire_round_1"
  | "prehire_win_pct_2"
  | "prehire_round_2"
  | "prehire_win_pct_3"
  | "prehire_round_3"
> {
  const y1 = teamYearLookup(rows, team, hireYear - 1);
  const y2 = teamYearLookup(rows, team, hireYear - 2);
  const y3 = teamYearLookup(rows, team, hireYear - 3);
  return {
    prehire_win_pct_1: y1.win_pct,
    prehire_round_1: y1.round,
    prehire_win_pct_2: y2.win_pct,
    prehire_round_2: y2.round,
    prehire_win_pct_3: y3.win_pct,
    prehire_round_3: y3.round,
  };
}

function priorContext(prior: seasonRow[]): Pick<
  LgbmContext,
  | "prior_hc_stops"
  | "prior_hc_seasons"
  | "prior_win_pct"
  | "prior_w_plyf"
  | "prior_sb_wins"
  | "prior_sb_apps"
  | "prior_coy_share"
> {
  if (!prior.length) {
    return {
      prior_hc_stops: 0,
      prior_hc_seasons: 0,
      prior_win_pct: null,
      prior_w_plyf: 0,
      prior_sb_wins: 0,
      prior_sb_apps: 0,
      prior_coy_share: 0,
    };
  }
  const wins = prior.reduce((s, r) => s + r.wins, 0);
  const losses = prior.reduce((s, r) => s + r.losses, 0);
  const games = wins + losses;
  const stops = assignStops(prior);
  const stopCount = new Set(stops.map((s) => s.stopId)).size;
  return {
    prior_hc_stops: stopCount,
    prior_hc_seasons: prior.length,
    prior_win_pct: games > 0 ? wins / games : null,
    prior_w_plyf: prior.reduce((s, r) => s + r.w_plyf, 0),
    prior_sb_wins: prior.filter((r) => r.round === 5).length,
    prior_sb_apps: prior.filter((r) => r.round >= 4).length,
    prior_coy_share: prior.reduce((s, r) => s + r.coy_share, 0),
  };
}

function careerSb(rows: seasonRow[]): {
  career_sb_wins_base: number;
  career_sb_apps_base: number;
} {
  return {
    career_sb_wins_base: rows.filter((r) => r.round === 5).length,
    career_sb_apps_base: rows.filter((r) => r.round >= 4).length,
  };
}

function buildCoachContext(
  allRows: seasonRow[],
  display: seasonRow,
  base: seasonRow,
  mode: WhatIfMode,
): Pick<WhatIfCoach, "stopTokens" | "context"> {
  const seasons = allRows
    .filter((r) => r.id === display.id)
    .sort((a, b) => a.year - b.year);
  const labeled = assignStops(seasons);

  const baseLabeled = labeled.find((x) => x.row.year === base.year);
  const currentStopId = baseLabeled?.stopId ?? labeled[labeled.length - 1]?.stopId ?? 0;

  const stopRows = labeled
    .filter((x) => x.stopId === currentStopId && x.row.year <= base.year)
    .map((x) => x.row);

  // For new-hire inplace, the prediction-season row is the scenario itself — not history.
  const stopTokens =
    mode === "inplace" && display.tenure === 1
      ? []
      : stopRows.map(toToken);

  const priorRows = labeled
    .filter((x) => x.stopId < currentStopId)
    .map((x) => x.row);

  const hireYear =
    mode === "inplace" && display.tenure === 1
      ? display.year
      : (stopRows[0]?.year ?? display.year);
  const hireTeam =
    mode === "inplace" && display.tenure === 1 ? display.team : base.team;

  const careerThrough = seasons.filter((r) => r.year <= base.year);
  const yearsSince =
    priorRows.length === 0
      ? null
      : Math.max(
          0,
          hireYear - Math.max(...priorRows.map((r) => r.year)) - 1,
        );

  return {
    stopTokens,
    context: {
      poc: display.poc ? 1 : 0,
      ...priorContext(priorRows),
      ...careerSb(
        mode === "inplace" && display.tenure === 1 ? priorRows : careerThrough,
      ),
      years_since_last_hc: yearsSince,
      ...prehireContext(allRows, hireTeam, hireYear),
      exp_base: mode === "inplace" ? display.exp : base.exp,
      tenure_base: mode === "inplace" ? display.tenure : base.tenure,
    },
  };
}

/**
 * What-If coach list for the prediction season:
 * - incumbents: roll forward from history_end (completed season)
 * - tenure-1 (new hire / new stop): score in place on the prediction-season row
 */
export function buildWhatIfCoaches(rows: seasonRow[]): WhatIfCoach[] {
  const predictionSeason = maxYear(rows);
  const historyEnd = predictionSeason - 1;
  const byIdYear = new Map<string, seasonRow>();
  for (const r of rows) byIdYear.set(`${r.id}:${r.year}`, r);

  return rows
    .filter((r) => r.year === predictionSeason)
    .map((display) => {
      if (display.tenure === 1) {
        const { stopTokens, context } = buildCoachContext(
          rows,
          display,
          display,
          "inplace",
        );
        return {
          display,
          base: display,
          mode: "inplace" as const,
          stopTokens,
          context,
        };
      }

      const priorRow = byIdYear.get(`${display.id}:${historyEnd}`);
      if (priorRow) {
        const { stopTokens, context } = buildCoachContext(
          rows,
          display,
          priorRow,
          "roll",
        );
        return {
          display,
          base: priorRow,
          mode: "roll" as const,
          stopTokens,
          context,
        };
      }

      const { stopTokens, context } = buildCoachContext(
        rows,
        display,
        display,
        "inplace",
      );
      return {
        display,
        base: display,
        mode: "inplace" as const,
        stopTokens,
        context,
      };
    })
    .sort((a, b) => a.display.name.localeCompare(b.display.name));
}

function flattenTokens(sequence: SeasonToken[]): Record<string, number | null> {
  const recent = [...sequence].reverse().slice(0, K);
  const out: Record<string, number | null> = {};
  for (let lag = 0; lag < K; lag++) {
    const tok = recent[lag];
    const s = `_t${lag}`;
    if (tok) {
      out[`age${s}`] = tok.age;
      out[`playoff_round${s}`] = tok.playoff_round;
      out[`win_pct${s}`] = tok.win_pct;
      out[`w_plyf${s}`] = tok.w_plyf;
      out[`coy_share${s}`] = tok.coy_share;
      out[`coy_rank${s}`] = tok.coy_rank;
      out[`tenure_idx${s}`] = tok.tenure_idx;
    } else {
      out[`age${s}`] = null;
      out[`playoff_round${s}`] = null;
      out[`win_pct${s}`] = null;
      out[`w_plyf${s}`] = null;
      out[`coy_share${s}`] = null;
      out[`coy_rank${s}`] = null;
      out[`tenure_idx${s}`] = null;
    }
  }
  return out;
}

export function buildWhatIfInputs(
  coach: WhatIfCoach,
  record: number,
  round: number,
): inputData {
  const wins = parseInt(Records[record].split("-")[0], 10);
  const win_pct = wins / Games;
  const w_plyf = Math.max(round - 1, 0);
  const { mode, display, base, stopTokens, context } = coach;

  const exp = mode === "inplace" ? context.exp_base : context.exp_base + 1;
  const tenure =
    mode === "inplace" ? context.tenure_base : context.tenure_base + 1;
  const age = mode === "inplace" ? display.age : base.age + 1;

  const t0: SeasonToken = {
    age,
    playoff_round: round,
    win_pct,
    w_plyf,
    coy_share: 0,
    coy_rank: null,
    tenure_idx: tenure,
  };

  const sequence = [...stopTokens, t0];
  const flat = flattenTokens(sequence);

  const sbWin = round === 5 ? 1 : 0;
  const sbApp = round >= 4 ? 1 : 0;

  return {
    exp,
    tenure,
    poc: context.poc,
    prior_hc_stops: context.prior_hc_stops,
    prior_hc_seasons: context.prior_hc_seasons,
    prior_win_pct: context.prior_win_pct,
    prior_w_plyf: context.prior_w_plyf,
    prior_sb_wins: context.prior_sb_wins,
    prior_sb_apps: context.prior_sb_apps,
    prior_coy_share: context.prior_coy_share,
    career_sb_wins: context.career_sb_wins_base + sbWin,
    career_sb_apps: context.career_sb_apps_base + sbApp,
    years_since_last_hc: context.years_since_last_hc,
    prehire_win_pct_1: context.prehire_win_pct_1,
    prehire_round_1: context.prehire_round_1,
    prehire_win_pct_2: context.prehire_win_pct_2,
    prehire_round_2: context.prehire_round_2,
    prehire_win_pct_3: context.prehire_win_pct_3,
    prehire_round_3: context.prehire_round_3,
    age_t0: flat.age_t0,
    playoff_round_t0: flat.playoff_round_t0,
    win_pct_t0: flat.win_pct_t0,
    w_plyf_t0: flat.w_plyf_t0,
    coy_share_t0: flat.coy_share_t0,
    coy_rank_t0: flat.coy_rank_t0,
    tenure_idx_t0: flat.tenure_idx_t0,
    age_t1: flat.age_t1,
    playoff_round_t1: flat.playoff_round_t1,
    win_pct_t1: flat.win_pct_t1,
    w_plyf_t1: flat.w_plyf_t1,
    coy_share_t1: flat.coy_share_t1,
    coy_rank_t1: flat.coy_rank_t1,
    tenure_idx_t1: flat.tenure_idx_t1,
    age_t2: flat.age_t2,
    playoff_round_t2: flat.playoff_round_t2,
    win_pct_t2: flat.win_pct_t2,
    w_plyf_t2: flat.w_plyf_t2,
    coy_share_t2: flat.coy_share_t2,
    coy_rank_t2: flat.coy_rank_t2,
    tenure_idx_t2: flat.tenure_idx_t2,
    age_t3: flat.age_t3,
    playoff_round_t3: flat.playoff_round_t3,
    win_pct_t3: flat.win_pct_t3,
    w_plyf_t3: flat.w_plyf_t3,
    coy_share_t3: flat.coy_share_t3,
    coy_rank_t3: flat.coy_rank_t3,
    tenure_idx_t3: flat.tenure_idx_t3,
    age_t4: flat.age_t4,
    playoff_round_t4: flat.playoff_round_t4,
    win_pct_t4: flat.win_pct_t4,
    w_plyf_t4: flat.w_plyf_t4,
    coy_share_t4: flat.coy_share_t4,
    coy_rank_t4: flat.coy_rank_t4,
    tenure_idx_t4: flat.tenure_idx_t4,
  };
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
