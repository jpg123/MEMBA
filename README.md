# MEMBA v1.0

## Manitoba Estimated Burn Mortality Risk

MEMBA is a research app that estimates inpatient mortality risk after a burn injury. It is designed to organize information in a consistent way and display the result as an estimated percentage.

It is for research, education and discussion. It does not replace clinical judgment, consultation with a burn team or local hospital protocols.

## Using the app

1. Select a language: English, French or Spanish. The app name remains MEMBA.
2. Enter the patient information available at the time of assessment.
3. Enter the available model inputs. Length of stay is displayed as context but does not affect the estimated risk. Anatomical-location fields are not included in the app.
4. Select **Calculate risk**.
5. Review the estimated mortality risk and the information entered.

The demonstration figures use %TBSA values compatible with the Rule of Nines: 9% for the low-risk example and 81% for the high-risk example. The calculated-risk summary displays %TBSA. The model and interface do not use anatomical location. Length of stay is displayed for context but is not a model input.

## Submission examples

The following examples are the same image files used for the journal submission figures.

### Figure 2A-C MEMBA at-rest panels

A horizontal three-panel black-and-white composite shows the MEMBA application before a risk calculation: English in panel A, French in panel B and Spanish in panel C. Each panel has a border and shows the input fields and the GitHub: jpg123/MEMBA link. Anatomical-location fields are not present.

![Figure 2A-C MEMBA at-rest panels](at-rest-panels.png)

### Figure 3A-B MEMBA risk examples

Low-risk and high-risk MEMBA examples with the selected model covariates shown in panels A and B, respectively. They use 9% and 81% TBSA, respectively, and the summary panel displays %TBSA. No anatomical-location fields are present; length of stay is displayed for context but is not a model covariate.

![Figure 3A-B MEMBA risk examples](risk-panels.png)

## Information used

The estimate uses:

- Age
- Sex
- Rurality derived from the first three characters of the postal code
- %TBSA
- ICU use and ICU days
- Inhalation injury
- Housing status
- Procedures (enter 0 when no procedure has occurred)
- Total packed red blood cell units

Anatomical location is not collected by the app. Length of stay is displayed as contextual information but is excluded from the fitted model.

## How the estimate is produced

MEMBA uses a fitted logistic-regression model from the Manitoba burn registry study. The model combines the entered information, applies the weights estimated during model fitting and converts the combined result into an estimated mortality percentage.

The estimate is calculated as:

`Estimated mortality risk = 1 / (1 + exp(-combined model value))`

The combined model value starts with the model intercept and adds the contribution from each fitted model input. Each contribution is calculated by multiplying the processed patient value by its fitted coefficient. Positive contributions increase the estimated risk, while negative contributions decrease it. Age is represented using the model’s spline terms rather than a single straight-line age effect. The logistic conversion changes the combined value, which is on a log-odds scale, into a number between 0 and 1; this number is displayed as a percentage. Anatomical-location selections and length of stay do not contribute to the calculation.

Blank numeric fields use the median value from the model training cohort. A procedure value of 0 is a true zero and is different from leaving the field blank. Missing total packed red blood cell values are treated as zero because most patients did not receive transfusion.

## Sharing

- **Share App** opens MEMBA at rest in English.
- **Share Data** shares the selected low-risk or high-risk figure.
- On iPhone or iPad, the native share sheet can send the link through Messages or iMessage.
- On Android, native sharing depends on the browser and device. If it is unavailable, the app copies the link so it can be pasted into a message.

## What validation means here

The study used nested stratified cross-validation. This is internal validation, meaning that model performance was tested using repeated training and testing divisions within the study cohort.

External validation at another burn centre remains outstanding. The displayed estimate should therefore be interpreted in the context of the study cohort and not as a universal mortality probability.

## Project information

The application, fitted model and project documentation are maintained in the [MEMBA GitHub repository](https://github.com/jpg123/MEMBA).

The in-app **FAQ/README** provides the same user-facing information in a popup. Its content is currently maintained in English and will be translated after the English version is finalized.
