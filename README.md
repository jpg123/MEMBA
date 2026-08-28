# MEMBER

**MEMBER** means **Manitoba Estimated Burn Mortality Risk**. It is a research application for displaying an estimated inpatient burn mortality risk.

Repository: https://github.com/jpg123/burn-mortality-MEMBER

## Purpose

The app presents the output of the fitted no-etiology logistic-regression model developed from the Manitoba burn registry analysis. It is intended for research, education and manuscript figure preparation. It does not replace clinical judgment or institutional protocols.

## Model calculation

The app combines the entered patient information and applies the fitted model coefficients. The resulting linear predictor is converted to an estimated risk using:

`Estimated risk = 1 / (1 + exp(-linear predictor))`

The model uses age with restricted cubic spline terms, sex, FSA-derived rurality, ICU use, housing status, TBSA, length of stay, procedures, total PRBC units, ICU days, inhalation injury and anatomical location indicators. Etiology is not included.

Blank numeric fields use the corresponding training-cohort median. Missing Total PRBC values are treated as zero because most patients did not receive transfusion. A separate transfusion yes/no variable is not used.

## Languages

The interface can be selected in English, French or Spanish. MEMBER remains the app name in every language. The FAQ/README content is currently maintained in English.

## Sharing

**Share App** opens MEMBER at rest in English. **Share Data** shares the selected figure example. iPhone and iPad can use Messages or iMessage. Android native sharing depends on the browser and device; when it is unavailable, the app copies the link for pasting into a message.

## Validation

The manuscript reports nested stratified cross-validation as internal validation within the study cohort. External validation at another burn centre remains outstanding.

## Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Run the production build:

```bash
npm run build
```

The fitted model artifact is stored at `src/model/no-etiology-logistic.json`. The main interface is in `src/App.tsx` and styling is in `src/App.css`.
