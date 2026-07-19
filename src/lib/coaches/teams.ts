const Fix_Abbrevs: Map<string, string> = new Map<string, string>([
  ["CLT", "IND"],
  ["CRD", "ARI"],
  ["GNB", "GB"],
  ["HTX", "HOU"],
  ["NWE", "NE"],
  ["OTI", "TEN"],
  ["RAI", "LV"],
  ["RAM", "LAR"],
  ["RAV", "BAL"],
  ["SDG", "LAC"],
  ["SFO", "SF"],
  ["TAM", "TB"],
]);

export const Team_Abbrevs: Map<string, string> = new Map<string, string>([
  ["BUF", "Buffalo Bills"],
  ["MIA", "Miami Dolphins"],
  ["NYJ", "New York Jets"],
  ["NWE", "New England Patriots"],
  ["RAV", "Baltimore Ravens"],
  ["PIT", "Pittsburgh Steelers"],
  ["CIN", "Cincinnati Bengals"],
  ["CLE", "Cleveland Browns"],
  ["HTX", "Houston Texans"],
  ["CLT", "Indianapolis Colts"],
  ["JAX", "Jacksonville Jaguars"],
  ["OTI", "Tennessee Titans"],
  ["KAN", "Kansas City Chiefs"],
  ["SDG", "Los Angeles Chargers"],
  ["DEN", "Denver Broncos"],
  ["RAI", "Las Vegas Raiders"],
  ["PHI", "Philadelphia Eagles"],
  ["WAS", "Washington Commanders"],
  ["DAL", "Dallas Cowboys"],
  ["NYG", "New York Giants"],
  ["DET", "Detroit Lions"],
  ["MIN", "Minnesota Vikings"],
  ["GNB", "Green Bay Packers"],
  ["CHI", "Chicago Bears"],
  ["TAM", "Tampa Bay Buccaneers"],
  ["ATL", "Atlanta Falcons"],
  ["CAR", "Carolina Panthers"],
  ["NOR", "New Orleans Saints"],
  ["RAM", "Los Angeles Rams"],
  ["SEA", "Seattle Seahawks"],
  ["CRD", "Arizona Cardinals"],
  ["SFO", "San Francisco 49ers"],
]);

const Fix_Abbrevs_Reverse: Map<string, string> = new Map<string, string>(
  Array.from(Fix_Abbrevs.entries()).map(([key, value]) => [value, key]),
);

export function get_abbrev(team: string, rev = false) {
  return rev
    ? Fix_Abbrevs_Reverse.has(team)
      ? Fix_Abbrevs_Reverse.get(team)
      : team
    : Fix_Abbrevs.has(team)
      ? Fix_Abbrevs.get(team)
      : team;
}

export const teams: string[] = [
  "ATL",
  "BUF",
  "CAR",
  "CHI",
  "CIN",
  "CLE",
  "CLT",
  "CRD",
  "DAL",
  "DEN",
  "DET",
  "GNB",
  "HTX",
  "JAX",
  "KAN",
  "MIA",
  "MIN",
  "NOR",
  "NWE",
  "NYG",
  "NYJ",
  "OTI",
  "PHI",
  "PIT",
  "RAI",
  "RAM",
  "RAV",
  "SDG",
  "SEA",
  "SFO",
  "TAM",
  "WAS",
];
