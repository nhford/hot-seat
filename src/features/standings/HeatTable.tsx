import { useEffect, useState } from "react";
import type { coachRow, seasonRow } from "@/types/coaches";
import Row from "./Row";
import ControlButton from "@/ui/ControlButton";
import { handleSort, type Mode, type sortkey } from "@/lib/coaches/sort";

const PAGE_SIZE = 10;

interface Props {
  mode: Mode;
  coachRows: coachRow[];
  source: seasonRow[];
  currentYear: number;
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= total) pages.add(i);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("…");
    result.push(sorted[i]);
  }
  return result;
}

function PaginationControls({
  showing,
  total,
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: {
  showing: number;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (total <= 0) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <p className="text-sm md:text-base text-white/80">
        Showing {showing} of {total} results
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap justify-center items-center gap-1.5">
          {pageNumbers(currentPage, totalPages).map((item, index) =>
            item === "…" ? (
              <span
                key={`ellipsis_${index}`}
                className="px-1 text-white/50"
                aria-hidden
              >
                …
              </span>
            ) : (
              <ControlButton
                key={`page_${item}`}
                size="sm"
                active={item === currentPage}
                className="min-w-9 !px-2"
                onClick={() => onPageChange(item)}
              >
                {item}
              </ControlButton>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function HeatTable({
  mode,
  coachRows,
  source,
  currentYear,
}: Props) {
  const [coaches, setCoaches] = useState<seasonRow[]>(source);
  const [sorted, setSorted] = useState<{ key: sortkey; dir: "asc" | "desc" }>({
    key: "prob",
    dir: "desc",
  });
  const [expanded, setExpanded] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setCoaches(source);
    const key = mode.by == "team" ? "year" : "prob";
    const dir = "asc";
    setSorted({ key: key, dir: dir });
    setPage(1);
    setExpanded("");
  }, [mode.by, source]);

  const total = coaches.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = coaches.slice(start, start + PAGE_SIZE);
  const showing = pageRows.length;

  const paginationProps = {
    showing,
    total,
    currentPage,
    totalPages,
    onPageChange: setPage,
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <table className="heat-table w-full table-fixed text-left bg-white text-black rounded-lg">
          <colgroup>
            <col className="w-12 md:w-16 lg:w-20" />
            <col className="w-10 md:w-16 lg:w-20" />
            <col />
            <col className="w-12 md:w-20" />
            <col className="w-11 md:w-20" />
            <col className="w-14 md:w-20" />
          </colgroup>
          <thead>
            <tr className="text-base md:text-lg border-b">
              {(
                [
                  { key: "year", label: "Year" },
                  { key: "team", label: "Team" },
                  { key: "name", label: "Coach" },
                  { key: "prob", label: "Heat" },
                  { key: "delta", label: "Δ" },
                  { key: "fired", label: "Result" },
                ] as const
              ).map((col) => (
                <th
                  key={`label_${col.key}`}
                  className={`px-1 py-4 whitespace-nowrap text-center cursor-pointer transition-colors hover:bg-neutral-100 hover:underline decoration-black underline-offset-2 ${
                    sorted.key === col.key
                      ? "bg-neutral-200 hover:bg-neutral-300"
                      : ""
                  }`}
                  onClick={() => {
                    handleSort({
                      data: coaches,
                      setData: setCoaches,
                      sorted: sorted,
                      setSorted: setSorted,
                      key: col.key,
                      natural: col.key == "name" ? "desc" : "asc",
                      coachRows,
                    });
                    setPage(1);
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <Row
                history={
                  coachRows.find((coach) => coach.id == row.id) ??
                  ({} as coachRow)
                }
                key={`${row.id}_${row.year}`}
                rowData={row}
                currentYear={currentYear}
                sortKey={sorted.key}
                expanded={expanded}
                setExpanded={setExpanded}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center text-sm md:text-base text-white/70">
        <span className="rounded px-1.5 py-0.5 text-white bg-[rgba(220,20,60,0.5)]">
          red shading
        </span>
        {" indicates coach fired"}
      </p>
      <PaginationControls {...paginationProps} className="mt-2" />
    </div>
  );
}
