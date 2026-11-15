import { useRef, useState } from "react";
import {
  get_what_if_init,
  lookupWhatIfScore,
  type WhatIfCoach,
  type WhatIfScores,
} from "./scenario";
import WhatIfScenario, { type WhatIfSnapshot } from "./WhatIfScenario";

interface Props {
  source: WhatIfCoach[];
  scores?: WhatIfScores;
}

const HISTORY_LIMIT = 3;

function sameSnapshot(
  a: WhatIfSnapshot,
  coach: WhatIfCoach,
  record: number,
  round: number,
) {
  return (
    a.coach.display.id === coach.display.id &&
    a.record === record &&
    a.round === round
  );
}

export default function WhatIf({ source, scores = {} }: Props) {
  const [row_index, setRow_Index] = useState(() =>
    source.length ? Math.floor(Math.random() * source.length) : 0,
  );
  const coach = source[row_index];
  const init = get_what_if_init(coach?.display.id ?? "");
  const [record, setRecord] = useState(init.record);
  const [round, setRound] = useState(init.round);
  const [history, setHistory] = useState<WhatIfSnapshot[]>([]);
  const lastCompleted = useRef<WhatIfSnapshot | null>(null);
  const seeded = useRef(false);

  if (!seeded.current) {
    seeded.current = true;
    if (coach) {
      const value = lookupWhatIfScore(
        scores,
        coach.display.id,
        init.record,
        init.round,
      );
      if (value != null) {
        lastCompleted.current = {
          coach,
          record: init.record,
          round: init.round,
          result: value,
        };
      }
    }
  }

  const result = coach
    ? lookupWhatIfScore(scores, coach.display.id, record, round)
    : null;

  const remember = (
    nextCoach: WhatIfCoach,
    nextRecord: number,
    nextRound: number,
  ) => {
    const completed = lastCompleted.current;
    if (
      completed &&
      !sameSnapshot(completed, nextCoach, nextRecord, nextRound)
    ) {
      setHistory((prev) => [completed, ...prev].slice(0, HISTORY_LIMIT));
    }
    const value = lookupWhatIfScore(
      scores,
      nextCoach.display.id,
      nextRecord,
      nextRound,
    );
    lastCompleted.current =
      value == null
        ? null
        : {
            coach: nextCoach,
            record: nextRecord,
            round: nextRound,
            result: value,
          };
  };

  if (!coach) return null;

  return (
    <div className="flex flex-col gap-4">
      <WhatIfScenario
        coach={coach}
        record={record}
        round={round}
        result={result}
        coachOptions={source.map((c) => c.display.name)}
        rowIndex={row_index}
        idPrefix="what-if"
        onCoachChange={(index) => {
          if (!Number.isFinite(index) || index < 0 || index >= source.length) {
            return;
          }
          if (index === row_index) return;
          const next = source[index];
          const nextInit = get_what_if_init(next.display.id);
          remember(next, nextInit.record, nextInit.round);
          setRow_Index(index);
          setRecord(nextInit.record);
          setRound(nextInit.round);
        }}
        onRecordChange={(rec) => {
          if (!Number.isFinite(rec)) return;
          setRecord(rec);
          remember(coach, rec, round);
        }}
        onRoundChange={(rnd) => {
          if (!Number.isFinite(rnd)) return;
          setRound(rnd);
          remember(coach, record, rnd);
        }}
      />

      <div className="flex flex-col gap-4">
        <div className="border-t border-white/40 pt-3">
          <h2 className="text-base md:text-lg font-semibold text-center">
            Previous Scenarios
          </h2>
        </div>
        {history.length === 0 ? (
          <p className="text-center text-sm md:text-base text-white/70">
            none yet, try a new scenario!
          </p>
        ) : (
          history.map((snap, i) => (
            <div
              key={`${snap.coach.display.id}-${snap.record}-${snap.round}-${snap.result}-${i}`}
            >
              {i > 0 ? <div className="border-t border-white/25 mb-4" /> : null}
              <WhatIfScenario
                coach={snap.coach}
                record={snap.record}
                round={snap.round}
                result={snap.result}
                readOnly
                idPrefix={`what-if-prev-${i}`}
              />
            </div>
          ))
        )}
        <div className="border-t border-white/40" />
      </div>
    </div>
  );
}
