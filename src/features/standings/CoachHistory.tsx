import type { coachRow } from "@/types/coaches";
import { imgPath } from "@/lib/coaches/images";

interface Props {
  history: coachRow;
}

interface tableRow {
  team: string;
  start: number;
  stop: number;
  duration: number;
  wins: number;
  losses: number;
  wins_plyf: number;
  losses_plyf: number;
  // super_bowls: number; // TODO
}

export default function CoachHistory({ history }: Props) {
  let prev = {
    team: "",
    start: 0,
    stop: 0,
    duration: 0,
    wins: 0,
    losses: 0,
    wins_plyf: 0,
    losses_plyf: 0,
  };
  let min_start = 0;
  const wins = [];
  const rows: tableRow[] = history.teams.reduce(
    (acc: tableRow[], team: string, i: number) => {
      if (i == 0) {
        prev.start = min_start = history.years[i];
      } else if (team != prev.team && prev.team != "") {
        acc.push(prev);
        prev = {
          team: team,
          start: history.years[i],
          stop: history.years[i],
          duration: 0,
          wins: 0,
          losses: 0,
          wins_plyf: 0,
          losses_plyf: 0,
        };
      }
      prev.team = team;
      prev.duration += 1;
      prev.wins += history.wins[i];
      prev.losses += history.losses[i];
      prev.wins_plyf += history.wins_plyf[i];
      prev.losses_plyf += history.losses_plyf[i];
      prev.stop = history.years[i];

      // push new row
      if (i == history.teams.length - 1) {
        prev.stop = history.years[i];
        acc.push(prev);
        acc.push({
          team: "N/A",
          start: min_start,
          stop: prev.stop,
          duration: acc.reduce(
            (acc: number, row: tableRow) => row.duration + acc,
            1
          ),
          wins: acc.reduce((acc: number, row: tableRow) => row.wins + acc, 0),
          losses: acc.reduce(
            (acc: number, row: tableRow) => row.losses + acc,
            0
          ),
          wins_plyf: acc.reduce(
            (acc: number, row: tableRow) => row.wins_plyf + acc,
            0
          ),
          losses_plyf: acc.reduce(
            (acc: number, row: tableRow) => row.losses_plyf + acc,
            0
          ),
        });
      }
      return acc;
    },
    []
  );

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full border-collapse text-center text-xs md:text-sm lg:text-base">
        <thead>
          <tr className="py-0 my-0">
            {[
              { span: 3, text: "", range: false },
              { span: 2, text: "Playoffs", range: false },
              { span: 2, text: "", range: true },
            ].map((header, index) => (
              <th
                className={`text-xs md:text-sm py-0 my-0 text-center font-normal ${
                  index === 1 ? "border border-black" : ""
                } ${header.range ? "expand:hidden 2xl:table-cell" : ""}`}
                key={`header_${index}`}
                colSpan={header.span}
              >
                {header.text}
              </th>
            ))}
          </tr>
          <tr>
            {(
              [
                { col: "Team", range: false },
                { col: "W", range: false },
                { col: "L", range: false },
                { col: "W", range: false },
                { col: "L", range: false },
                { col: "from", range: true },
                { col: "to", range: true },
              ] as const
            ).map(({ col, range }, index) => (
              <th
                className={`border border-black p-1 md:px-2 md:py-1 ${
                  range ? "expand:hidden 2xl:table-cell" : ""
                }`}
                key={`${col}_${index}`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              className={`border border-black ${index === rows.length - 1 ? "my-0 py-0" : ""}`}
              key={index}
            >
              <td
                className={`border border-black px-1 ${index === rows.length - 1 ? "my-0 py-0" : "my-1 py-1"}`}
              >
                {index == rows.length - 1 ? (
                  "Total"
                ) : (
                  <div className="flex flex-row items-center gap-1 justify-center">
                    <img
                      src={imgPath("nfl", row.team)}
                      className="w-4 lg:w-6"
                      alt={row.team}
                    />
                    <p className="text-xs md:text-sm">
                      {`${row.duration} yr${row.duration <= 1 ? "" : "s"}.`}
                    </p>
                  </div>
                )}
              </td>
              {[
                { value: row.wins, range: false },
                { value: row.losses, range: false },
                { value: row.wins_plyf, range: false },
                { value: row.losses_plyf, range: false },
                { value: row.start, range: true },
                { value: row.stop, range: true },
              ].map(({ value, range }, i) => (
                <td
                  className={`${index === rows.length - 1 ? "my-0 py-0" : "my-1 py-1"} ${
                    range ? "expand:hidden 2xl:table-cell" : ""
                  }`}
                  key={`row_${value}_${i}`}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
