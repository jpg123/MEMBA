# MEMBER v1.0

## Manitoba Estimated Burn Mortality Risk

MEMBER is a research app that estimates inpatient mortality risk after a burn injury. It is designed to organize information in a consistent way and display the result as an estimated percentage.

It is for research, education and discussion. It does not replace clinical judgment, consultation with a burn team or local hospital protocols.

## Using the app

1. Select a language: English, French or Spanish. The app name remains MEMBER.
2. Enter the patient information available at the time of assessment.
3. Select the relevant anatomical locations.
4. Select **Calculate risk**.
5. Review the estimated mortality risk and the information entered.

The app can be used with information available near admission. Information such as ICU use, ICU days, procedures, transfusion and length of stay may become available later during hospitalization and can support reassessment.

## Information used

The estimate uses:

- Age
- Sex
- Rurality derived from the first three characters of the postal code
- TBSA
- ICU use and ICU days
- Inhalation injury
- Anatomical location
- Housing status
- Procedures
- Length of stay
- Total packed red blood cell units

## How the estimate is produced

MEMBER uses a fitted logistic-regression model from the Manitoba burn registry study. The model combines the entered information, applies the weights estimated during model fitting and converts the combined result into an estimated mortality percentage.

The estimate is calculated as:

`Estimated mortality risk = 1 / (1 + exp(-combined model value))`

Blank numeric fields use the median value from the model training cohort. Missing total packed red blood cell values are treated as zero because most patients did not receive transfusion. A separate transfusion yes/no field is not used.

## Sharing

- **Share App** opens MEMBER at rest in English.
- **Share Data** shares the selected low-risk or high-risk figure.
- On iPhone or iPad, the native share sheet can send the link through Messages or iMessage.
- On Android, native sharing depends on the browser and device. If it is unavailable, the app copies the link so it can be pasted into a message.

## What validation means here

The study used nested stratified cross-validation. This is internal validation, meaning that model performance was tested using repeated training and testing divisions within the study cohort.

External validation at another burn centre remains outstanding. The displayed estimate should therefore be interpreted in the context of the study cohort and not as a universal mortality probability.

## Project information

The application, fitted model and project documentation are maintained in the [MEMBER GitHub repository](https://github.com/jpg123/burn-mortality-MEMBER).

The in-app **FAQ/README** provides the same user-facing information in a popup. Its content is currently maintained in English and will be translated after the English version is finalized.
