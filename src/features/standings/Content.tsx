import { Fragment, useState } from "react";
import type { seasonRow } from "@/types/coaches";
import HeatTable from "./HeatTable";
import ControlButton from "@/ui/ControlButton";
import ScrollHintStrip from "@/ui/ScrollHintStrip";
import { get_abbrev } from "@/lib/coaches/teams";
import { maxYear, type Mode } from "@/lib/coaches/sort";

interface Props {
  source: seasonRow[];
  coaches: any;
}

type filterKey = "year" | "team" | "heat";
type heatOutcome = "all" | "fired" | "not_fired";

const HEAT_OUTCOMES: { key: heatOutcome; label: string }[] = [
  { key: "all", label: "All" },
  { key: "fired", label: "Fired" },
  { key: "not_fired", label: "Not Fired" },
];

export default function Content({ source, coaches }: Props) {
  const currentYear = maxYear(source);
  const minYear = source.length
    ? Math.min(...source.map((row) => row.year))
    : currentYear;
  const numYears = Math.max(1, currentYear - minYear + 1);

  const [mode, setMode] = useState<Mode>({ by: "year" });
  const [year, setYear] = useState(Math.max(minYear, currentYear - 1));
  const [team, setTeam] = useState("CRD");
  const [heatOutcome, setHeatOutcome] = useState<heatOutcome>("all");

  const filteredSource = source
    .filter((row) => {
      if (mode.by === "year") return row.year === year;
      if (mode.by === "team") return row.team === team;
      if (heatOutcome === "fired") return row.fired === 1;
      if (heatOutcome === "not_fired") return row.fired === 0;
      return true;
    })
    .sort((row1, row2) =>
      mode.by !== "heat"
        ? row1[mode.by === "year" ? "prob" : "year"] <
          row2[mode.by === "year" ? "prob" : "year"]
          ? 1
          : -1
        : row2.prob - row1.prob,
    );

  return (
    <div className="h-full">
      {/* Toggle: By Year vs By Team vs By Heat */}
      <div className="flex flex-wrap py-2 gap-2 justify-center items-center">
        <p className="text-sm md:text-base mr-1">group by:</p>
        {(["year", "team", "heat"] as filterKey[]).map((filterKey) => (
          <ControlButton
            key={filterKey}
            active={mode.by === filterKey}
            size="sm"
            className="w-20"
            onClick={() => {
              if (mode.by === filterKey) return;
              setMode({ by: filterKey });
            }}
          >
            {filterKey === "heat"
              ? "All"
              : `${filterKey.charAt(0).toUpperCase()}${filterKey.slice(1)}`}
          </ControlButton>
        ))}
      </div>
      {/* Menu of Choices */}
      <div className="flex items-center gap-2 py-2">
        <p className="shrink-0 text-sm md:text-base">filter by:</p>
        {mode.by === "heat" ? (
          <div className="flex flex-wrap gap-2">
            {HEAT_OUTCOMES.map(({ key, label }) => (
              <ControlButton
                key={key}
                size="sm"
                active={heatOutcome === key}
                className="w-[6.5rem] shrink-0"
                onClick={() => setHeatOutcome(key)}
              >
                {label}
              </ControlButton>
            ))}
          </div>
        ) : (
          <ScrollHintStrip
            className="min-w-0 flex-1"
            label={
              mode.by == "year"
                ? "Scroll for more years"
                : "Scroll for more teams"
            }
          >
            {(mode.by == "year"
              ? Array.from({ length: numYears }, (_, i) => currentYear - i)
              : source
                  .filter((row) => row.year == currentYear)
                  .map((row) => get_abbrev(row.team))
                  .sort()
            ).map((item, index, items) => {
              const active =
                mode.by == "year"
                  ? item == year
                  : get_abbrev(item as string, true) == team;
              const prev = items[index - 1];
              const showDecadeLine =
                mode.by == "year" &&
                typeof prev === "number" &&
                typeof item === "number" &&
                Math.floor(prev / 10) !== Math.floor(item / 10);

              return (
                <Fragment key={`button_${item}`}>
                  {showDecadeLine ? (
                    <div
                      aria-hidden
                      className="mx-0.5 h-7 w-px shrink-0 self-center bg-white/55"
                    />
                  ) : null}
                  <ControlButton
                    size="sm"
                    active={active}
                    className={
                      mode.by == "team" ? "w-14 shrink-0" : "shrink-0"
                    }
                    onClick={() =>
                      mode.by == "year"
                        ? setYear(item as number)
                        : setTeam(get_abbrev(item as string, true) as string)
                    }
                  >
                    {item}
                  </ControlButton>
                </Fragment>
              );
            })}
          </ScrollHintStrip>
        )}
      </div>
      <HeatTable
        mode={mode}
        coachRows={coaches}
        currentYear={currentYear}
        source={filteredSource}
      />
    </div>
  );
}
