export type seasonRow = {
  // IDENTIFIERS
  id: string;
  year: number;
  name: string;
  team: string; // image path team abbrev
  tm: string; // display team abbrev

  // PREDICTION
  prob: number; // heat index score
  fired: number; // actual result 1 if fired
  pred: number; // ML prediction, 1 if fired

  // FEATURES (legacy RF columns still present on coach_year_v2)
  age: number;
  poc: boolean; // person of color

  round: number; // playoff round 1 to 5
  win_pct: number;
  w_plyf: number;
  coy_share: number; // % of coach of year vote received
  coy_rank: number; // rank of coach of year vote
  srs: number; // simple rating system, approx strength of team
  gm: number; // how many gms in current tenure
  owner: number; // how many owners in current tenure
  ou: number; // how much team outperformed over/under

  exp: number; // total years coaching
  tenure: number; // exp with this team
  tenure_over_500: number; // mimics career win pct
  tenure_w_plyf: number;
  tenure_coy_share: number;
  exp_coy_share: number;

  delta_1yr_win_pct: number;
  delta_2yr_win_pct: number;
  delta_3yr_win_pct: number;
  delta_1yr_plyf: number; // change in playoff round from this year to 1 yr ago
  delta_2yr_plyf: number;
  delta_3yr_plyf: number;

  // MISC
  wins: number;
  losses: number;
  l_plyf: number;
  color1: string;
  color2: string;
  ou_line: number;
  win_pct_proj: number;
};

/** One cell of the precomputed What If grid. `record` is wins (0–17). */
export type whatIfRow = {
  id: string;
  record: number;
  round: number;
  prob: number;
};

export type coachRow = {
  id: string;
  name: string;
  years: number[];
  teams: string[];
  heat: number[];
  wins: number[];
  losses: number[];
  rounds: number[];
  wins_plyf: number[];
  losses_plyf: number[];
  win_pcts: number[];
  coy_ranks: number[];
  coy_shares: number[];
  outcomes: number[];
  colors_1: string[];
  colors_2: string[];
};
