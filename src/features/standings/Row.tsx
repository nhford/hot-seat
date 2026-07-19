import { Fragment } from "react";
import type { coachRow, seasonRow } from "@/types/coaches";
import { imgPath } from "@/lib/coaches/images";
import {
  formatHeatDelta,
  heatDelta,
  toResumeHistory,
  type sortkey,
} from "@/lib/coaches/sort";
import ExpandedRow from "./ExpandedRow";

interface Props {
  history: coachRow;
  rowData: seasonRow;
  currentYear: number;
  sortKey: sortkey;
  expanded: string;
  setExpanded: (rowId: string) => void;
}

function cellClass(
  sortKey: sortkey,
  key: sortkey,
  fired: boolean,
  extra = "",
) {
  const sorted = sortKey === key;
  return [
    "py-4",
    sorted && !fired ? "bg-neutral-200" : "",
    sorted && fired ? "bg-[rgba(220,20,60,0.54)]" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Row({
  history,
  rowData,
  currentYear,
  sortKey,
  expanded,
  setExpanded,
}: Props) {
  const fired = Boolean(rowData.fired);
  const rowId = `${rowData.id}_${rowData.year}`;
  const isExpanded = expanded === rowId;

  const toggleExpanded = () =>
    setExpanded(isExpanded ? "" : rowId);

  return (
    <Fragment key={rowId}>
      <tr
        className={`group border-b border-neutral-600 cursor-pointer transition-colors ${
          fired
            ? "bg-[rgba(220,20,60,0.5)] hover:bg-[rgba(220,20,60,0.68)]"
            : "bg-inherit hover:bg-neutral-100"
        }`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} details for ${rowData.name}`}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <td
          className={cellClass(
            sortKey,
            "year",
            fired,
            "text-center text-base md:text-lg font-bold",
          )}
        >
          <span className="md:hidden">
            {`'${(rowData.year % 100).toString().padStart(2, "0")}`}
          </span>
          <span className="hidden md:block">{rowData.year}</span>
        </td>
        <td className={cellClass(sortKey, "team", fired, "px-0.5 text-center")}>
          <img
            src={imgPath("nfl", rowData.team)}
            className="mx-auto w-8 lg:w-16"
            alt={rowData.team}
          />
        </td>
        <td
          className={cellClass(
            sortKey,
            "name",
            fired,
            "max-w-0 px-1 text-center text-sm md:text-lg font-bold group-hover:underline decoration-black underline-offset-2",
          )}
          title={rowData.name}
        >
          <span className="block truncate">{rowData.name}</span>
        </td>
        <td
          className={cellClass(
            sortKey,
            "prob",
            fired,
            "text-center text-base md:text-lg",
          )}
        >
          {rowData.prob.toFixed(2)}
        </td>
        <td
          className={cellClass(
            sortKey,
            "delta",
            fired,
            "text-center text-base md:text-lg",
          )}
        >
          {formatHeatDelta(heatDelta(history, rowData))}
        </td>
        <td
          className={cellClass(
            sortKey,
            "fired",
            fired,
            "heat-col-mobile-hide text-center text-base md:text-lg",
          )}
        >
          {rowData.year != currentYear
            ? rowData.fired
              ? "Fired"
              : "Safe"
            : "TBD"}
        </td>
      </tr>
      {isExpanded && (
        <ExpandedRow
          rowData={rowData}
          currentYear={currentYear}
          history={toResumeHistory(history, currentYear, rowData)}
        />
      )}
    </Fragment>
  );
}
