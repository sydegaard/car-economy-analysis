# Bilfinansieringsanalyse

Interactive car-financing calculator for the Norwegian market. Compares 7 financing
options (cash, several car loans, green loan, mortgage, consumer loan, leasing),
computes opportunity cost, and gives tailored advice — all client-side, no backend.

Originally prototyped on base44 and since decoupled into a standalone
Vite + React app.

## Tech stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Build    | Vite 6                         |
| UI       | React 18 + React Router        |
| Styling  | Tailwind CSS 3 + shadcn/ui     |
| Icons    | lucide-react                   |
| Backend  | None — 100% client-side        |

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Production build to `dist/`          |
| `npm run preview`   | Preview the production build         |
| `npm run lint`      | Lint (`--fix` variant: `lint:fix`)   |
| `npm run typecheck` | Type-check via `jsconfig.json`       |

## Project structure

```
src/
├── App.jsx                     # Router
├── main.jsx                    # Entry point
├── index.css                   # Design tokens (dark neon theme)
├── pages/
│   ├── Calculator.jsx          # Main page
│   └── NotFound.jsx            # 404
├── components/
│   ├── calculator/             # Feature components
│   └── ui/                     # shadcn/ui primitives
├── hooks/
│   └── useCalculations.js      # All calculation logic
├── lib/                        # utils (cn helper)
└── utils/                      # createPageUrl helper
```

> ⚠️ Disclaimer: This is an indicative analysis. Interest rates are based on the
> 2026 market. Contact your bank for exact offers.
