import { useState } from "react";
import type { coachRow, seasonRow } from "@/types/coaches";
import { filterCoachRowByYear } from "@/lib/coaches/sort";
import { hexToRgba } from "@/lib/coaches/images";
import { get_abbrev, Team_Abbrevs } from "@/lib/coaches/teams";
import CoachAwards from "./CoachAwards";
import CoachHistory from "./CoachHistory";
import CoachImage from "@/ui/CoachImage";
import SelectInput from "@/ui/Select";
import CoachChart from "./CoachChart";

interface Props {
  history: coachRow;
  rowData: seasonRow;
  currentYear: number;
}

function space_labels_helper<X>(
  years: number[],
  teams: string[]
): (target_array: X[]) => (X | null)[] {
  return (target_array: X[]) => space_labels(target_array, years, teams);
}

function space_labels<X>(
  target_array: X[],
  years: number[],
  teams: string[]
): (X | null)[] {
  const acc: (X | null)[] = [];

  for (let i = 0; i < years.length; i++) {
    if (i > 0 && (years[i] !== years[i - 1] + 1 || teams[i] !== teams[i - 1])) {
      acc.push(null);
    }
    acc.push(target_array[i]);
  }

  return acc;
}

export default function ExpandedRow({
  history,
  rowData,
  currentYear,
}: Props) {
  const [filter, setFilter] = useState({
    filter: false,
    year: rowData.year,
    index: history.years.length - 1,
  });
  const coachData = filter.filter
    ? filterCoachRowByYear(history, filter.year)
    : history;

  const space_labels_num = space_labels_helper<number>(
    coachData.years,
    coachData.teams
  );
  const space_labels_str = space_labels_helper<string>(
    coachData.years,
    coachData.teams
  );

  const heat_spaced: (number | null)[] = space_labels_num(coachData.heat);

  const outcomes_spaced: (number | null)[] = space_labels_num(
    coachData.outcomes
  );

  // TODO: sus
  const win_pcts_spaced: (number | null)[] = space_labels_num(
    rowData.tenure > 1 ? coachData.win_pcts : [rowData.win_pct_proj]
  );

  const labels_spaced: (string | null)[] = space_labels_num(
    coachData.years
  ).map((year) =>
    year != null ? `'${(year % 100).toString().padStart(2, "0")}` : year
  );

  const records_spaced: string[] = space_labels_str(
    coachData.wins.map((w, i) => `${w}-${coachData.losses[i]}`)
  ).map((record) => (record != null ? record : ""));

  const most_wins = Math.max(...coachData.win_pcts);
  const least_wins = Math.min(...coachData.win_pcts);

  const records_labels =
    records_spaced.length <= 5
      ? records_spaced
      : records_spaced.map((label, i) => {
          if (outcomes_spaced[i] == 1) {
            return label;
          } else if (label != "" && win_pcts_spaced[i] == most_wins) {
            return label;
          } else if (label != "" && win_pcts_spaced[i] == least_wins) {
            return label;
          } else if (i == records_spaced.length - 1) {
            return label;
          }
          return "";
        });

  const colors_1__rgb = space_labels_str(coachData.colors_1).map((color) =>
    color != null ? hexToRgba(color, 0.5) : "000000"
  );

  const colors_2__rgb = space_labels_str(coachData.colors_2).map((color) =>
    color != null ? hexToRgba(color, 0.5) : "000000"
  );

  return (
    <tr className="w-full">
      <td colSpan={6} className="p-2.5 bg-neutral-100">
        <div className="relative">
          <div className="flex flex-row text-center justify-center items-center text relative">
            <div className="absolute w-full h-0.5 bg-gray-500"></div>
            <div className="z-10 flex flex-row items-center gap-2 bg-neutral-100 px-4">
              <p className="text-sm sm:text-base 2xl:text-lg">{`Showing Resume`}</p>
              {/* TODO: highlight year for rowData.year */}
              <SelectInput
                name=""
                value={
                  !filter.filter || filter.index === history.years.length - 1
                    ? 0
                    : filter.index + 1
                }
                id="resume_filter"
                options={[
                  "All Time",
                  ...history.years
                    .slice(0, -1)
                    .map((yr: number) => `in ${yr.toString()}`),
                ]}
                border_color="black"
                text_color="black"
                font_size="0.75rem"
                minWidth="5rem"
                helper=""
                onChange={(event) => {
                  setFilter(() => {
                    const value = parseInt(event.target.value);
                    const isAll = value === 0;
                    return {
                      filter: !isAll,
                      year: isAll ? currentYear - 1 : history.years[value - 1],
                      index: isAll ? history.years.length - 1 : value - 1,
                    };
                  });
                }}
              />
            </div>
          </div>
          <div className="flex flex-col expand:flex-row gap-2">
            <div className="w-full expand:w-1/5 flex flex-row expand:flex-col justify-center items-center text-center">
              {/* Coach Image */}
              <div className="order-2 expand:order-1 w-2/5 expand:w-full">
                <div className="w-full expand:flex expand:justify-center">
                  <CoachImage
                    rowData={rowData}
                    className="w-full max-w-[12rem]"
                  />
                </div>
              </div>
              {/* Coach Info */}
              <div className="order-1 expand:order-2 w-3/5 expand:w-full">
                <div className="flex flex-row expand:flex-col 2xl:flex-row gap-2 expand:gap-0 2xl:gap-2 justify-center">
                  <p>{`Age: ${rowData.age - (currentYear - 1 - history["years"][filter.index])}`}</p>
                  <p>{`Exp: ${filter.index + 1} ${filter.index > 0 ? "yrs." : "yr."}`}</p>
                </div>
                <p>
                  <span className="expand:hidden 2xl:inline">
                    {`Team: ${Team_Abbrevs.get(history["teams"][filter.index])}`}
                  </span>
                  <span className="hidden expand:inline 2xl:hidden">
                    {`Team: ${get_abbrev(history["teams"][filter.index])}`}
                  </span>
                </p>
                <p className="text-xs italic">{`(in ${history["years"][filter.index]})`}</p>
              </div>
            </div>
            <div className="expand:hidden my-2 border-b border-gray-500" />
            <div className="w-full expand:w-2/5 text-center">
              <p className="text-sm expand:text-sm 2xl:text-base font-bold mb-1">
                Statistics
              </p>
              <div className="flex flex-col gap-x-2">
                <CoachHistory history={coachData} />
                <CoachAwards history={coachData} />
              </div>
              {/* TODO: "Similar Coaches" */}
            </div>
            {/* TODO: plot Vegas wins not .500 record */}
            <div className="expand:hidden my-2 border-b border-gray-500" />
            <div className="w-full expand:w-2/5">
              <p className="text-sm expand:text-sm 2xl:text-base font-bold my-1 text-center">
                <span className="expand:hidden 2xl:inline">Heat Index over Time</span>
                <span className="hidden expand:inline 2xl:hidden">Heat over Time</span>
              </p>
              <div className="w-full flex flex-col items-center">
                <CoachChart
                  heat={heat_spaced}
                  labels={labels_spaced}
                  win_pcts={win_pcts_spaced}
                  records={records_labels}
                  records_all={records_spaced}
                  outcomes={outcomes_spaced}
                  colors_1={colors_1__rgb}
                  colors_2={colors_2__rgb}
                />
                <div className="flex expand:hidden 2xl:flex flex-col gap-2 items-center">
                  <p className="text-xs text-gray-800">
                    dotted line indicates ML prediction threshold
                  </p>
                  {records_spaced.length > 5 ? (
                    <p className="text-xs text-gray-800">
                      {`records for best, worst, ${coachData.outcomes.includes(1) ? "current, and firing" : "and current"} year labeled`}
                    </p>
                  ) : null}
                  {coachData.outcomes.includes(1) ? (
                    <p className="text-xs text-gray-800">
                      black filling indicates fired
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="my-2 expand:my-3 2xl:my-4 border-b border-gray-500" />
        </div>
      </td>
    </tr>
  );
}
