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

/** Named features for the LightGBM What-If /predict API (54 columns). */
export type inputData = {
  exp: number;
  tenure: number;
  poc: number;
  prior_hc_stops: number;
  prior_hc_seasons: number;
  prior_win_pct: number | null;
  prior_w_plyf: number;
  prior_sb_wins: number;
  prior_sb_apps: number;
  prior_coy_share: number;
  career_sb_wins: number;
  career_sb_apps: number;
  years_since_last_hc: number | null;
  prehire_win_pct_1: number | null;
  prehire_round_1: number | null;
  prehire_win_pct_2: number | null;
  prehire_round_2: number | null;
  prehire_win_pct_3: number | null;
  prehire_round_3: number | null;
  age_t0: number | null;
  playoff_round_t0: number | null;
  win_pct_t0: number | null;
  w_plyf_t0: number | null;
  coy_share_t0: number | null;
  coy_rank_t0: number | null;
  tenure_idx_t0: number | null;
  age_t1: number | null;
  playoff_round_t1: number | null;
  win_pct_t1: number | null;
  w_plyf_t1: number | null;
  coy_share_t1: number | null;
  coy_rank_t1: number | null;
  tenure_idx_t1: number | null;
  age_t2: number | null;
  playoff_round_t2: number | null;
  win_pct_t2: number | null;
  w_plyf_t2: number | null;
  coy_share_t2: number | null;
  coy_rank_t2: number | null;
  tenure_idx_t2: number | null;
  age_t3: number | null;
  playoff_round_t3: number | null;
  win_pct_t3: number | null;
  w_plyf_t3: number | null;
  coy_share_t3: number | null;
  coy_rank_t3: number | null;
  tenure_idx_t3: number | null;
  age_t4: number | null;
  playoff_round_t4: number | null;
  win_pct_t4: number | null;
  w_plyf_t4: number | null;
  coy_share_t4: number | null;
  coy_rank_t4: number | null;
  tenure_idx_t4: number | null;
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
