import { useState, type ReactNode } from "react";

const SIGNALS = [
  { label: "Model", value: "LightGBM classifier" },
  { label: "Features", value: "54 season-sequence & context factors" },
  { label: "Output", value: "Heat score 0–1 (fire if > 0.5)" },
] as const;

const USE_STEPS = [
  "Browse standings by year, team, or across all seasons.",
  "Expand a coach for resume context, awards, and heat history.",
  "Use What If? to explore potential next season heat index.",
] as const;

const DETAILS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "drivers",
    title: "What drives the prediction?",
    body: "The model scores a coach-season from a last-5-season sequence (age, win%, playoff round, Coach of the Year share/rank, tenure index) plus career context: prior head-coaching stops, Super Bowl history, years since last HC job, and the team’s three pre-hire seasons. What If writes the next season token and scores live.",
  },
  {
    id: "limits",
    title: "How accurate is it?",
    body: "It's honestly more informative as a risk score than predictive. What adds complexity is that the dataset contains dozens of questionable firings that the model then trains on. Season results alone struggle to capture external factors: locker-room issues, poor public perception, etc.",
  },
  {
    id: "stack",
    title: "How is this built?",
    body: (
      <>
        Historical data comes from Pro Football Reference. Training, feature
        engineering, and the LightGBM classifier live in{" "}
        <a
          href="https://github.com/nhford/hot-seat-backend"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline underline-offset-2 decoration-white/50 hover:decoration-green-500"
        >
          this sibling repo
        </a>
        ; the model is served as an API on Render (called live by What If).
      </>
    ),
  },
];

export default function HowItWorks() {
  const [openId, setOpenId] = useState<string | null>("drivers");

  return (
    <div className="space-y-5">
      <p className="text-sm md:text-base text-white/85 text-center md:text-left leading-relaxed">
        Predict whether an NFL head coach is at risk of being fired and output
        that probability as a comparable heat score for peer and historical
        evaluation.
      </p>

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/20 rounded border border-white/25 overflow-hidden">
        {SIGNALS.map(({ label, value }) => (
          <div
            key={label}
            className="bg-neutral-800 px-3 py-3 text-center sm:text-left"
          >
            <dt className="text-xs uppercase tracking-wide text-white/50">
              {label}
            </dt>
            <dd className="mt-1 text-sm md:text-base font-semibold text-white">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div>
        <h3 className="text-sm md:text-base font-semibold text-white mb-2">
          How to read this page
        </h3>
        <ol className="space-y-1.5 text-sm md:text-base text-white/80 list-decimal list-inside">
          {USE_STEPS.map((step) => (
            <li key={step} className="leading-snug">
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-white/20">
        {DETAILS.map(({ id, title, body }) => {
          const open = openId === id;
          return (
            <div key={id} className="border-b border-white/20">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : id)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm md:text-base font-semibold text-white transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <span>{title}</span>
                <span
                  className="shrink-0 text-white/55 text-lg leading-none"
                  aria-hidden
                >
                  {open ? "−" : "+"}
                </span>
              </button>
              {open ? (
                <p className="pb-3 text-sm md:text-base text-white/75 leading-relaxed">
                  {body}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
