# Developer setup

## Requirements

- Node.js
- npm

## Install and run locally

From the `mobile-app` directory:

```bash
npm install
npm run dev
```

The development server will provide a local URL for the app.

## Verify the app

Run the lint and production build checks:

```bash
npm run lint
npm run build
```

The production build includes the single-file distribution step defined in `scripts/inline-dist.mjs`.

## Main files

- `src/App.tsx` — interface, translations, model wiring and sharing behavior
- `src/App.css` — app styling
- `src/model/no-etiology-logistic.json` — fitted logistic-regression model artifact
- `public/` — static assets
- `scripts/inline-dist.mjs` — production distribution helper

## Model implementation

The app loads the fitted model artifact and calculates the logistic probability from the entered inputs. Age uses the exported restricted cubic spline basis. Missing numeric inputs use the stored training-cohort medians. Missing Total PRBC values are represented as zero in the source analysis.

Etiology is intentionally excluded from the model, app, tables and figures.

## Repository

The repository is private:

https://github.com/jpg123/MEMBA
