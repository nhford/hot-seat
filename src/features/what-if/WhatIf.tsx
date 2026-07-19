import { useEffect, useRef, useState } from "react";
import {
  get_what_if_init,
  buildWhatIfInputs,
  type WhatIfCoach,
} from "./scenario";
import WhatIfScenario, { type WhatIfSnapshot } from "./WhatIfScenario";

interface Props {
  source: WhatIfCoach[];
}

const HISTORY_LIMIT = 3;
const PREDICT_URL = "https://coaches-svfw.onrender.com/predict";

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

export default function WhatIf({ source }: Props) {
  const [row_index, setRow_Index] = useState(() =>
    source.length ? Math.floor(Math.random() * source.length) : 0,
  );
  const coach = source[row_index];
  const init = get_what_if_init(coach?.display.id ?? "");
  const [record, setRecord] = useState(init.record);
  const [round, setRound] = useState(init.round);

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<WhatIfSnapshot[]>([]);
  const isFirstRender = useRef(true);
  const lastCompleted = useRef<WhatIfSnapshot | null>(null);
  const requestId = useRef(0);

  // Initial seed for the randomly selected coach (once on mount)
  useEffect(() => {
    if (!coach) return;
    const snapshot: WhatIfSnapshot = {
      coach,
      record: init.record,
      round: init.round,
      result: init.seed,
    };
    const seedRequest = ++requestId.current;
    const timeout = setTimeout(() => {
      if (requestId.current !== seedRequest) return;
      setResult(snapshot.result);
      lastCompleted.current = snapshot;
    }, 1000);
    return () => clearTimeout(timeout);
    // intentionally mount-only; coach/init captured from first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runPrediction = (
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
      lastCompleted.current = null;
    }

    setLoading(true);
    const timeout = 1000;
    const startTime = Date.now();
    const id = ++requestId.current;

    fetch(PREDICT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        named_features: buildWhatIfInputs(nextCoach, nextRecord, nextRound),
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Predict failed: ${response.status}`);
        return response.json();
      })
      .then((response) => {
        if (id !== requestId.current) return;

        const prediction = response?.prediction?.[0]?.[1];
        if (typeof prediction !== "number") {
          throw new Error("Unexpected predict response");
        }

        setResult(prediction);
        lastCompleted.current = {
          coach: nextCoach,
          record: nextRecord,
          round: nextRound,
          result: prediction,
        };
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, timeout - elapsedTime);

        setTimeout(() => {
          if (id === requestId.current) setLoading(false);
        }, remainingTime);
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setLoading(false);
      });
  };

  // coach / source changes — reset scenario defaults for that coach
  useEffect(() => {
    if (!source[row_index]) return;
    const next = source[row_index];
    const nextInit = get_what_if_init(next.display.id);
    setRecord(nextInit.record);
    setRound(nextInit.round);
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      runPrediction(next, nextInit.record, nextInit.round);
    }
  }, [row_index, source]);

  if (!coach) return null;

  return (
    <div className="flex flex-col gap-4">
      <WhatIfScenario
        coach={coach}
        record={record}
        round={round}
        result={result}
        loading={loading}
        coachOptions={source.map((c) => c.display.name)}
        rowIndex={row_index}
        idPrefix="what-if"
        onCoachChange={(index) => {
          if (Number.isFinite(index) && index >= 0 && index < source.length) {
            setRow_Index(index);
          }
        }}
        onRecordChange={(rec) => {
          if (!Number.isFinite(rec)) return;
          setRecord(rec);
          runPrediction(coach, rec, round);
        }}
        onRoundChange={(rnd) => {
          if (!Number.isFinite(rnd)) return;
          setRound(rnd);
          runPrediction(coach, record, rnd);
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
