# Hot Seat

**Live:** [hot-seat.netlify.app](https://hot-seat.netlify.app/)

Interactive dashboard + counterfactual engine for an NFL head-coach firing model. Built by Noah Ford (MSCS, Carnegie Mellon ’26) as a sports-analytics portfolio project: predictive modeling, feature design, and a UI meant for non-technical stakeholders.

## What it does

- **Standings** — Browse historical and current coach-seasons by year, team, or across the full panel. Each row shows a **heat** score (model probability of firing), year-over-year Δ, and outcome (Fired / Safe / TBD). Expand a row for resume context, awards, and heat history.
- **What If?** — Change next-season record and playoff depth for a coach; the app builds the model’s feature vector and calls a live scoring API.
- **How It Works** — Short project brief: problem framing, feature summary, and how to read the page.

Heat is a calibrated risk score in \([0, 1]\); above **0.5** the model predicts a firing-like outcome. Treat it as directional decision support, not a guarantee.

## Model (brief)

- **Task:** Binary classification — does this coach-season resemble seasons that ended in a firing?
- **Algorithm:** LightGBM on a last-5-season sequence plus career/context features (**54** inputs), e.g. win%, playoff round, Coach of the Year signals, tenure index, prior HC stops, Super Bowl history, and the franchise’s three pre-hire seasons.
- **Data:** Season and playoff history sourced from [Pro Football Reference](https://www.pro-football-reference.com/); training and batch scoring live in [`hot-seat-backend`](https://github.com/nhford/hot-seat-backend); the fitted model is served on Render for interactive What If calls.
- **Serving:** `POST /predict` with `named_features` → class probabilities; the UI uses \(P(\text{fired})\).

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Astro + React + TypeScript, Tailwind CSS |
| Data | Supabase (`coach_year_v2`, coach aggregates) |
| Viz | Chart.js (expanded coach history) |
| Model API | FastAPI on Render (`coaches-svfw`) |
| Hosting | Netlify |

## Local development

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev            # or: netlify dev
```

Required env (server-side Astro) — see [`.env.example`](.env.example):

- `SUPABASE_DATABASE_URL`
- `SUPABASE_ANON_KEY`

## Project layout (frontend)

```
src/
  features/standings/   # heat table, filters, expanded resume
  features/what-if/     # counterfactual UI + feature assembly
  features/how-it-works/
  lib/coaches/          # sorting, teams, images
  layout/               # shell, header, footer
```

## Notes for recruiters

- End-to-end path: scrape/assemble data → train LightGBM → store season scores → ship an interactive UI that rescores counterfactuals against the same model.
- Emphasis on **communicating risk** (heat index, fired highlighting, resume drill-down) as much as on raw accuracy.
- Honest limits: season stats miss locker-room / media dynamics; the training labels include historically debatable firings.

## Possible next work

- Media sentiment / market and salary features
- Stronger evaluation reporting (calibration, year holdouts)
- Historical team logos and richer H2H / trophy-case views

## License

MIT — see [LICENSE](LICENSE).
