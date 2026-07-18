import type { coachRow, seasonRow } from "@/types/coaches";

export type sortkey = "name" | "team" | "prob" | "fired" | "year" | "delta";

export interface Mode {
  by: "year" | "team" | "heat";
}

/** YoY heat change when the coach was on the same team last year; else null. */
export function heatDelta(
  history: coachRow | undefined,
  rowData: seasonRow,
): number | null {
  if (
    !history?.years?.length ||
    !history.teams?.length ||
    !history.heat?.length
  ) {
    return null;
  }
  const prevIdx = history.years.findIndex((y) => y === rowData.year - 1);
  if (prevIdx < 0) return null;
  if (history.teams[prevIdx] !== rowData.team) return null;
  const prevHeat = history.heat[prevIdx];
  if (typeof prevHeat !== "number" || Number.isNaN(prevHeat)) return null;
  return rowData.prob - prevHeat;
}

/** Sortable heat delta; missing / N/A values sort as 0. */
export function heatDeltaSortValue(
  history: coachRow | undefined,
  rowData: seasonRow,
): number {
  return heatDelta(history, rowData) ?? 0;
}

export function formatHeatDelta(delta: number | null): string {
  if (delta === null) return "--";
  const abs = Math.abs(delta).toFixed(2);
  if (delta > 0) return `+${abs}`;
  if (delta < 0) return `-${abs}`;
  return abs;
}

export function maxYear(rows: { year: number }[]): number {
  if (!rows.length) return 0;
  return Math.max(...rows.map((r) => r.year));
}

export function filterCoachRowByYear(coach: coachRow, year: number): coachRow {
  const lastIndex = coach.years.findIndex((y) => y > year);
  const endIndex = lastIndex === -1 ? coach.years.length : lastIndex;

  const sliceArray = <T>(arr: T[]) => arr.slice(0, endIndex);

  return {
    ...coach,
    years: sliceArray(coach.years),
    teams: sliceArray(coach.teams),
    heat: sliceArray(coach.heat),
    wins: sliceArray(coach.wins),
    losses: sliceArray(coach.losses),
    rounds: sliceArray(coach.rounds),
    wins_plyf: sliceArray(coach.wins_plyf),
    losses_plyf: sliceArray(coach.losses_plyf),
    win_pcts: sliceArray(coach.win_pcts),
    coy_ranks: sliceArray(coach.coy_ranks),
    coy_shares: sliceArray(coach.coy_shares),
    outcomes: sliceArray(coach.outcomes),
    colors_1: sliceArray(coach.colors_1),
    colors_2: sliceArray(coach.colors_2),
  };
}

/**
 * Resume view of a coach career for the expanded row.
 *
 * Completed seasons keep earned stats. The prediction season is incomplete:
 * - incumbents: omit it (resume ends at history_end)
 * - tenure-1 new hires: keep the year slot for identity/chart, but zero earned
 *   outcome fields so stuffed predecessor round / playoff wins never count
 */
export function toResumeHistory(
  coach: coachRow,
  currentYear: number,
  row: Pick<seasonRow, "tenure" | "year">,
): coachRow {
  const completedThrough = currentYear - 1;
  const keepProjectionYear = row.tenure === 1 && row.year === currentYear;

  const indices = coach.years
    .map((year, i) => {
      if (year <= completedThrough) return i;
      if (keepProjectionYear && year === currentYear) return i;
      return -1;
    })
    .filter((i) => i >= 0);

  const pick = <T>(arr: T[]) => indices.map((i) => arr[i]);
  const earned = <T>(arr: T[], zero: T) =>
    indices.map((i) => (coach.years[i] >= currentYear ? zero : arr[i]));

  return {
    ...coach,
    years: pick(coach.years),
    teams: pick(coach.teams),
    heat: pick(coach.heat),
    wins: earned(coach.wins, 0),
    losses: earned(coach.losses, 0),
    rounds: earned(coach.rounds, 0),
    wins_plyf: earned(coach.wins_plyf, 0),
    losses_plyf: earned(coach.losses_plyf, 0),
    win_pcts: earned(coach.win_pcts, 0),
    coy_ranks: earned(coach.coy_ranks, 0),
    coy_shares: earned(coach.coy_shares, 0),
    outcomes: earned(coach.outcomes, 0),
    colors_1: pick(coach.colors_1),
    colors_2: pick(coach.colors_2),
  };
}

interface sortingHelper {
  data: seasonRow[];
  setData: (rows: seasonRow[]) => void;
  sorted: { key: sortkey; dir: "asc" | "desc" };
  setSorted: (sorted: { key: sortkey; dir: "asc" | "desc" }) => void;
  key: sortkey;
  natural: "asc" | "desc";
  coachRows?: coachRow[];
}

export function handleSort(helper: sortingHelper) {
  let dir = helper.natural;
  if (helper.sorted.key == helper.key && helper.sorted.dir == helper.natural) {
    dir = helper.natural == "desc" ? "asc" : "desc";
  }
  helper.setSorted({ key: helper.key, dir: dir });
  let i = dir == "asc" ? 1 : -1;

  if (helper.key === "delta") {
    const byId = new Map(
      (helper.coachRows ?? []).map((coach) => [coach.id, coach]),
    );
    helper.setData(
      [...helper.data].sort((a, b) => {
        const av = heatDeltaSortValue(byId.get(a.id), a);
        const bv = heatDeltaSortValue(byId.get(b.id), b);
        return av < bv ? i : av > bv ? -i : 0;
      }),
    );
    return;
  }

  helper.setData(
    [...helper.data].sort((a: seasonRow, b: seasonRow) =>
      a[helper.key] < b[helper.key] ? i : -i,
    ),
  );
}
