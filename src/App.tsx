import { useMemo, useState } from 'react'
import './App.css'
import modelArtifact from './model/no-etiology-logistic.json'

type RiskState = 'low' | 'high'
type Language = 'en' | 'fr' | 'es'

type FeatureItem = {
  label: string
  valueLow: string
  valueHigh: string
  scale?: string
}

type LocationOption = 'Head and neck' | 'Torso' | 'Upper extremity' | 'Lower extremity' | 'Genitalia'

type LocaleStrings = {
  appTitle: string
  appEyebrow: string
  languageLabel: string
  languages: Record<Language, string>
  statusLabel: string
  patientData: string
  anatomicalLocation: string
  selected: string
  selectAll: string
  clearAll: string
  calculate: string
  back: string
  examples: string
  lowRiskExample: string
  highRiskExample: string
  shareData: string
  shareApp: string
  sharedCopied: string
  figureShareOpened: string
  appShareOpened: string
  disclosureTitle: string
  disclosureBody1: string
  disclosureBody2: string
  disclosureButton: string
  citationFooter: string
  selectedPatientVariables: string
  scoreLabel: string
  lowRisk: string
  highRisk: string
  readyTitle: string
  riskScreenLabel: string
  calculationTitle: string
  calculationBaseline: string
  calculationTbsa: string
  calculationAnatomy: string
  calculationFormula: string
  calculationUsed: string
  calculationNotUsed: string
  calculationContribution: string
  calculationThreshold: string
  calculationNote: string
  calculationFormulaText: string
  calculationFieldsText: string
  medianIfBlank: string
  noneSelected: string
  faqTitle: string
  faqContact: string
  faqItems: Array<{ question: string; answer: string }>
  featureLabels: Record<string, string>
  locationOptions: Record<LocationOption, string>
  locationLabels: Record<string, string>
}

const githubAppUrl = 'https://github.com/jpg123/MEMBA'
const githubReadmeUrl = `${githubAppUrl}/blob/main/README.md`

function deriveRurality(fsa: string) {
  const normalized = fsa.replace(/\s/g, '').toUpperCase().slice(0, 3)
  if (normalized.length < 3) return 'Unknown'
  return normalized[1] === '0' ? 'Yes' : 'No'
}

const locationOptions: LocationOption[] = [
  'Head and neck',
  'Torso',
  'Upper extremity',
  'Lower extremity',
  'Genitalia',
]

const numericFields = new Set(['Age', 'TBSA', 'Days ICU', 'Length of stay', 'Procedures', 'Total PRBC'])
const choiceFields = new Set(['Sex', 'ICU', 'Unhoused', 'Inhalation injury'])

function modelProbability(values: Record<string, string>, selectedLocations: LocationOption[]) {
  const raw: Record<string, number> = {
    Sex_male: values.Sex === 'Male' ? 1 : 0,
    Rural: values.FSA ? (deriveRurality(values.FSA) === 'Yes' ? 1 : 0) : Number.NaN,
    // ICU use is defined by the cleaned ICU duration: Yes only when Days ICU > 0.
    ICU_yes: Number.parseFloat(values['Days ICU']) > 0 ? 1 : 0,
    Unhoused: values.Unhoused === 'Yes' ? 1 : 0,
    TBSA_final: Number.parseFloat(values.TBSA), Length_of_stay: Number.parseFloat(values['Length of stay']),
    Procedures: Number.parseFloat(values.Procedures), Total_PRBC: Number.parseFloat(values['Total PRBC']),
    Days_ICU: Number.parseFloat(values['Days ICU']), inh_injury: values['Inhalation injury'] === 'Yes' ? 1 : 0,
    location_head_neck: selectedLocations.includes('Head and neck') ? 1 : 0,
    location_torso: selectedLocations.includes('Torso') ? 1 : 0,
    location_upper_extremity: selectedLocations.includes('Upper extremity') ? 1 : 0,
    location_lower_extremity: selectedLocations.includes('Lower extremity') ? 1 : 0,
    location_genitalia: selectedLocations.includes('Genitalia') ? 1 : 0,
  }
  const age = Number.parseFloat(values.Age)
  const ageIndex = Number.isFinite(age) ? Math.min(modelArtifact.age_grid.length - 1, Math.max(0, Math.round(age * 10))) : 0
  const vector: Record<string, number> = { ...raw }
  modelArtifact.features.filter((f) => f.startsWith('Age_rcs_')).forEach((f) => { vector[f] = (modelArtifact.age_basis_grid as Record<string, number[]>)[f][ageIndex] })
  let logit = modelArtifact.intercept
  modelArtifact.features.forEach((f) => { logit += (modelArtifact.coefficients as Record<string, number>)[f] * (Number.isFinite(vector[f]) ? vector[f] : (modelArtifact.medians as Record<string, number>)[f]) })
  return 1 / (1 + Math.exp(-logit))
}

const localeStrings: Record<Language, LocaleStrings> = {
  en: {
    appTitle: 'Manitoba Estimated Mortality in Burn App',
    appEyebrow: 'Research application',
    languageLabel: 'Language',
    languages: { en: 'English', fr: 'French', es: 'Spanish' },
    statusLabel: 'Status',
    patientData: 'Patient factor data',
    anatomicalLocation: 'Anatomical location',
    selected: 'Selected',
    selectAll: 'Select all',
    clearAll: 'Clear all',
    calculate: 'Calculate risk',
    back: 'Back',
    examples: 'Examples',
    lowRiskExample: 'Low risk example',
    highRiskExample: 'High risk example',
    shareData: 'Share Data',
    shareApp: 'Share App',
    sharedCopied: 'Copied to clipboard',
    figureShareOpened: 'Figure share opened',
    appShareOpened: 'App share opened',
    disclosureTitle: 'Research Use Disclosure',
    disclosureBody1: 'This burn mortality predictor is for research, education and manuscript figure generation only. It does not replace clinician judgment or institutional protocols.',
    disclosureBody2: 'This application loads the fitted research model. The displayed value is an estimated mortality risk.',
    disclosureButton: 'I Understand',
    citationFooter: 'Gawaziuk et al. (2026), under peer review',
    selectedPatientVariables: 'Selected patient variables',
    scoreLabel: 'Estimated mortality risk',
    lowRisk: 'Low Risk',
    highRisk: 'High Risk',
    readyTitle: 'Ready to calculate',
    riskScreenLabel: 'risk screen',
    calculationTitle: 'How this prediction is calculated',
    calculationBaseline: 'Model intercept',
    calculationTbsa: 'Continuous TBSA value',
    calculationAnatomy: 'Anatomical location indicators',
    calculationFormula: 'Logistic equation',
    calculationUsed: 'Used by the fitted model',
    calculationNotUsed: 'Displayed but not used by the fitted model',
    calculationContribution: 'Contribution',
    calculationThreshold: 'High-risk state at a predicted probability of 50% or greater',
    calculationNote: 'This is the fitted logistic-regression model output using the available app inputs. It is an estimated mortality risk, not a clinical decision rule.',
    calculationFormulaText: 'Predicted risk = 1 / (1 + exp(−linear predictor)); the linear predictor is the fitted intercept plus the coefficient-weighted processed inputs. Missing numeric values use training-cohort medians.',
    calculationFieldsText: 'Model inputs: age, sex, rurality, ICU use, housing status, TBSA, procedures, transfusion, ICU days and inhalation injury. Length of stay and anatomical location are displayed for context but are not used by the fitted model.',
    medianIfBlank: 'Training median if blank',
    noneSelected: 'None selected',
    faqTitle: 'FAQ/README',
    faqContact: 'Project README:',
    faqItems: [
      { question: 'What does the displayed risk mean?', answer: 'It is the estimated mortality risk from the fitted no-etiology logistic-regression model.' },
      { question: 'How does age differ from the Baux score?', answer: 'The Baux score adds age as a linear value. MEMBA models age with a flexible nonlinear function, so the estimated effect of age can change across the age range. This is a modeling distinction, not a claim that the Baux score is invalid; see Osler et al. (2010) for the modified Baux score.' },
      { question: 'How is the estimated risk calculated?', answer: 'The app combines the model inputs entered, including age, burn size, inhalation injury, intensive care and selected hospital-course variables. Length of stay and anatomical location remain displayed for context but are not used by the fitted model. The model combines the weighted inputs and converts the result into an estimated percentage. Blank numeric fields are replaced with the median value from the training cohort.' },
      { question: 'Which inputs change the current risk?', answer: 'Age, sex, FSA-derived rurality, TBSA, inhalation injury, ICU use, ICU days, procedures, transfusion and housing status are used by the model. Length of stay and anatomical location are displayed but are not used by the fitted model.' },
      { question: 'Can TBSA include a decimal?', answer: 'Yes. Enter one decimal place, such as 12.3%. The model uses the entered TBSA value.' },
      { question: 'What does Share App send?', answer: 'Share App sends a link that opens MEMBA at rest in English. Share Data sends the selected figure example. On iPhone or iPad, the native share sheet can send the link through Messages or iMessage. On Android, native sharing depends on the browser and device; if it is unavailable, the app copies the link so it can be pasted into a message.' },
    ],
    featureLabels: {
      Age: 'Age',
      Sex: 'Sex',
      TBSA: 'TBSA',
      FSA: 'FSA (First three of postal code)',
      ICU: 'ICU',
      'Days ICU': 'Days ICU',
      Unhoused: 'Unhoused',
      'Length of stay': 'Length of stay',
      Procedures: 'Procedures',
      'Total PRBC': 'Total PRBC',
      'Inhalation injury': 'Inhalation injury',
    },
    locationOptions: {
      'Head and neck': 'Head and neck',
      Torso: 'Torso',
      'Upper extremity': 'Upper extremity',
      'Lower extremity': 'Lower extremity',
      Genitalia: 'Genitalia',
    },
    locationLabels: { FSA: 'FSA (First three of postal code)', Inhalation: 'Inhalation', Rurality: 'Rurality', Mechanism: 'Mechanism', 'Anatomical location': 'Anatomical location' },
  },
  fr: {
    appTitle: 'Application de mortalité des brûlures',
    appEyebrow: 'Application de recherche',
    languageLabel: 'Langue',
    languages: { en: 'Anglais', fr: 'Français', es: 'Espagnol' },
    statusLabel: 'État',
    patientData: 'Données des facteurs du patient',
    anatomicalLocation: 'Localisation anatomique',
    selected: 'Sélectionné',
    selectAll: 'Tout sélectionner',
    clearAll: 'Tout effacer',
    calculate: 'Calculer le risque',
    back: 'Retour',
    examples: 'Exemples',
    lowRiskExample: 'Exemple à faible risque',
    highRiskExample: 'Exemple à risque élevé',
    shareData: 'Partager les données',
    shareApp: "Partager l'application",
    sharedCopied: 'Copié dans le presse-papiers',
    figureShareOpened: 'Partage de la figure ouvert',
    appShareOpened: "Partage de l'application ouvert",
    disclosureTitle: "Divulgation d'usage de recherche",
    disclosureBody1: 'Cette application de prédiction de la mortalité des brûlures est réservée à la recherche, à l’enseignement et à la préparation de figures de manuscrit. Elle ne remplace pas le jugement clinique ni les protocoles institutionnels.',
    disclosureBody2: 'Cette application utilise le modèle de recherche ajusté. La valeur affichée est une estimation du risque de mortalité.',
    disclosureButton: 'Je comprends',
    citationFooter: 'Gawaziuk et al. (2026), en cours d’évaluation par les pairs',
    selectedPatientVariables: 'Variables patient sélectionnées',
    scoreLabel: 'Risque estimé de mortalité',
    lowRisk: 'Faible risque',
    highRisk: 'Risque élevé',
    readyTitle: 'Prêt à calculer',
    riskScreenLabel: 'écran de risque',
    calculationTitle: 'Calcul du risque estimé',
    calculationBaseline: 'Interception du modèle',
    calculationTbsa: 'Valeur continue de TBSA',
    calculationAnatomy: 'Indicateurs de localisation anatomique',
    calculationFormula: 'Règle exacte',
    calculationUsed: 'Utilisé par le modèle ajusté',
    calculationNotUsed: 'Affiché mais non utilisé par le modèle ajusté',
    calculationContribution: 'Contribution',
    calculationThreshold: 'État à risque élevé à partir d’une probabilité prédite de 50 %',
    calculationNote: 'Il s’agit de la sortie du modèle de régression logistique ajusté et d’une estimation du risque de mortalité.',
    calculationFormulaText: 'Risque prédit = 1 / (1 + exp(−prédicteur linéaire)); le prédicteur linéaire est l’interception ajustée plus les valeurs traitées pondérées par les coefficients. Les valeurs numériques manquantes utilisent les médianes de la cohorte d’entraînement.',
    calculationFieldsText: 'Variables du modèle : âge, sexe, ruralité, utilisation des soins intensifs, situation de logement, TBSA, interventions, transfusion, jours aux soins intensifs et lésion par inhalation. La durée de séjour et la localisation anatomique restent affichées à titre descriptif, mais ne sont pas utilisées par le modèle ajusté.',
    medianIfBlank: 'Médiane d’entraînement si vide',
    noneSelected: 'Aucune sélection',
    faqTitle: 'FAQ/README',
    faqContact: 'README du projet :',
    faqItems: [
      { question: 'Que signifie le risque affiché ?', answer: 'Il s’agit du risque estimé de mortalité calculé par le modèle de régression logistique ajusté sans étiologie.' },
      { question: 'Comment l’âge diffère-t-il du score de Baux ?', answer: 'Le score de Baux ajoute l’âge comme une valeur linéaire. MEMBA modélise l’âge avec une fonction non linéaire flexible, de sorte que son effet estimé peut varier selon l’âge. Il s’agit d’une différence de modélisation et non d’une affirmation que le score de Baux est invalide; voir Osler et al. (2010) pour le score de Baux modifié.' },
      { question: 'Comment le risque estimé est-il calculé ?', answer: 'L’application combine les variables incluses dans le modèle, notamment l’âge, la taille de la brûlure, la lésion par inhalation, les soins intensifs et certaines variables du séjour hospitalier. La durée de séjour et la localisation anatomique restent affichées à titre descriptif, mais ne sont pas utilisées par le modèle ajusté. Les champs numériques vides sont remplacés par la valeur médiane de la cohorte d’entraînement.' },
      { question: 'Quelles entrées modifient le risque actuel ?', answer: 'Les variables affichées sont traitées par le modèle de régression logistique ajusté.' },
      { question: 'La TBSA peut-elle contenir une décimale ?', answer: 'Oui. Entrez une décimale, par exemple 12,3 %. Le modèle utilise la valeur de TBSA saisie.' },
      { question: 'Que partage le bouton Partager l’application ?', answer: 'Le bouton Partager l’application envoie un lien qui ouvre MEMBA au repos en anglais. Le bouton Partager les données envoie l’exemple illustré sélectionné. Sur iPhone ou iPad, la feuille de partage peut envoyer le lien par Messages ou iMessage. Sur Android, le partage dépend du navigateur et de l’appareil; s’il n’est pas disponible, l’application copie le lien pour qu’il soit collé dans un message.' },
    ],
    featureLabels: {
      Age: 'Âge',
      Sex: 'Sexe',
      TBSA: 'TBSA',
      FSA: 'FSA (3 du code postal)',
      ICU: 'USI',
      'Days ICU': 'Jours en USI',
      Unhoused: 'Sans logement',
      'Length of stay': 'Durée de séjour',
      Procedures: 'Procédures',
      'Total PRBC': 'CGR totaux',
      'Inhalation injury': 'Lésion par inhalation',
    },
    locationOptions: {
      'Head and neck': 'Tête et cou',
      Torso: 'Tronc',
      'Upper extremity': 'Membre supérieur',
      'Lower extremity': 'Membre inférieur',
      Genitalia: 'Génitales',
    },
    locationLabels: { FSA: 'FSA (3 du code postal)', Inhalation: 'Inhalation', Rurality: 'Ruralité', Mechanism: 'Mécanisme', 'Anatomical location': 'Localisation anatomique' },
  },
  es: {
    appTitle: 'Aplicación de mortalidad por quemaduras',
    appEyebrow: 'Prototipo de investigación',
    languageLabel: 'Idioma',
    languages: { en: 'Inglés', fr: 'Francés', es: 'Español' },
    statusLabel: 'Estado',
    patientData: 'Datos de factores del paciente',
    anatomicalLocation: 'Localización anatómica',
    selected: 'Seleccionado',
    selectAll: 'Seleccionar todo',
    clearAll: 'Borrar todo',
    calculate: 'Calcular riesgo',
    back: 'Atrás',
    examples: 'Ejemplos',
    lowRiskExample: 'Ejemplo de bajo riesgo',
    highRiskExample: 'Ejemplo de alto riesgo',
    shareData: 'Compartir datos',
    shareApp: 'Compartir aplicación',
    sharedCopied: 'Copiado al portapapeles',
    figureShareOpened: 'Compartir figura abierto',
    appShareOpened: 'Compartir aplicación abierto',
    disclosureTitle: 'Divulgación para uso en investigación',
    disclosureBody1: 'Este prototipo de predicción de mortalidad por quemaduras es solo para investigación, educación y generación de figuras de manuscrito. No sustituye el juicio clínico ni los protocolos institucionales.',
    disclosureBody2: 'Esta aplicación utiliza el modelo de investigación ajustado. El valor mostrado es una estimación del riesgo de mortalidad.',
    disclosureButton: 'Entiendo',
    citationFooter: 'Gawaziuk et al. (2026), en revisión por pares',
    selectedPatientVariables: 'Variables del paciente seleccionadas',
    scoreLabel: 'Riesgo estimado de mortalidad',
    lowRisk: 'Bajo riesgo',
    highRisk: 'Alto riesgo',
    readyTitle: 'Listo para calcular',
    riskScreenLabel: 'pantalla de riesgo',
    calculationTitle: 'Cómo se calcula el riesgo estimado',
    calculationBaseline: 'Intercepto del modelo',
    calculationTbsa: 'Valor continuo de TBSA',
    calculationAnatomy: 'Indicadores de localización anatómica',
    calculationFormula: 'Regla exacta',
    calculationUsed: 'Usado por el modelo ajustado',
    calculationNotUsed: 'Mostrado pero no usado por el modelo ajustado',
    calculationContribution: 'Contribución',
    calculationThreshold: 'Estado de alto riesgo con una probabilidad predicha de 50% o más',
    calculationNote: 'Es el resultado del modelo de regresión logística ajustado y una estimación del riesgo de mortalidad.',
    calculationFormulaText: 'Riesgo predicho = 1 / (1 + exp(−predictor lineal)); el predictor lineal es la intersección ajustada más los valores procesados ponderados por los coeficientes. Los valores numéricos faltantes usan las medianas de la cohorte de entrenamiento.',
    calculationFieldsText: 'Variables del modelo: edad, sexo, ruralidad, uso de UCI, situación de vivienda, TBSA, procedimientos, transfusión, días en UCI y lesión por inhalación. La duración de la estancia y la localización anatómica se muestran como contexto pero no se utilizan en el modelo ajustado.',
    medianIfBlank: 'Mediana de entrenamiento si está vacío',
    noneSelected: 'Ninguno seleccionado',
    faqTitle: 'FAQ/README',
    faqContact: 'README del proyecto:',
    faqItems: [
      { question: '¿Qué significa el riesgo mostrado?', answer: 'Es el riesgo estimado de mortalidad calculado por el modelo de regresión logística ajustado sin etiología.' },
      { question: '¿Cómo difiere la edad del puntaje de Baux?', answer: 'El puntaje de Baux suma la edad como un valor lineal. MEMBA modela la edad con una función no lineal flexible, por lo que su efecto estimado puede variar según la edad. Esto es una diferencia de modelización y no afirma que el puntaje de Baux sea inválido; consulte Osler et al. (2010) para el puntaje de Baux modificado.' },
      { question: '¿Cómo se calcula el riesgo estimado?', answer: 'La aplicación combina la información introducida sobre el paciente, incluida la edad, el tamaño de la quemadura, la lesión por inhalación, los cuidados intensivos, el curso hospitalario y la localización anatómica. El modelo ajustado asigna un peso a cada dato según su relación con la mortalidad en este estudio, combina la información ponderada y convierte el resultado en un porcentaje estimado. Los campos numéricos vacíos se reemplazan por la mediana de la cohorte de entrenamiento.' },
      { question: '¿Qué entradas cambian el riesgo actual?', answer: 'Las variables mostradas son procesadas por el modelo de regresión logística ajustado.' },
      { question: '¿TBSA puede incluir un decimal?', answer: 'Sí. Introduzca un decimal, por ejemplo 12.3 %. El modelo utiliza el valor de TBSA introducido.' },
      { question: '¿Qué comparte Compartir aplicación?', answer: 'Compartir aplicación envía un enlace que abre MEMBA en reposo y en inglés. Compartir datos envía el ejemplo ilustrado seleccionado. En iPhone o iPad, la hoja de compartir puede enviar el enlace mediante Mensajes o iMessage. En Android, el uso compartido depende del navegador y del dispositivo; si no está disponible, la aplicación copia el enlace para pegarlo en un mensaje.' },
    ],
    featureLabels: {
      Age: 'Edad',
      Sex: 'Sexo',
      TBSA: 'TBSA',
      FSA: 'FSA (3 del código postal)',
      ICU: 'UCI',
      'Days ICU': 'Días en UCI',
      Unhoused: 'Sin vivienda',
      'Length of stay': 'Estancia',
      Procedures: 'Procedimientos',
      'Total PRBC': 'GR totales',
      'Inhalation injury': 'Lesión por inhalación',
    },
    locationOptions: {
      'Head and neck': 'Cabeza y cuello',
      Torso: 'Tronco',
      'Upper extremity': 'Extremidad superior',
      'Lower extremity': 'Extremidad inferior',
      Genitalia: 'Genitales',
    },
    locationLabels: { FSA: 'FSA', Inhalation: 'Inhalación', Rurality: 'Ruralidad', Mechanism: 'Mecanismo', 'Anatomical location': 'Localización anatómica' },
  },
}

const featureRows: FeatureItem[] = [
  { label: 'Age', valueLow: '34', valueHigh: '67', scale: 'Years' },
  { label: 'Sex', valueLow: 'Female', valueHigh: 'Male', scale: 'Binary' },
  // Rule-of-Nines-compatible capture examples: 9% for one upper extremity
  // and 81% for head/neck (9%) + torso (18%) + both upper (18%) and lower (36%) extremities.
  { label: 'TBSA', valueLow: '9', valueHigh: '81', scale: 'Percent burned' },
  // FSA is used only to derive Rurality and is not an independent model feature.
  { label: 'FSA', valueLow: 'R3B', valueHigh: 'R0A', scale: '3 characters' },
  { label: 'ICU', valueLow: 'No', valueHigh: 'Yes' },
  { label: 'Inhalation injury', valueLow: 'No', valueHigh: 'Yes' },
  { label: 'Days ICU', valueLow: '0', valueHigh: '9', scale: 'Days' },
  { label: 'Procedures', valueLow: '1', valueHigh: '6', scale: 'Count' },
  { label: 'Total PRBC', valueLow: '0', valueHigh: '8', scale: 'Units' },
  { label: 'Unhoused', valueLow: 'No', valueHigh: 'Yes' },
  { label: 'Length of stay', valueLow: '5', valueHigh: '19', scale: 'Days' },
]

const stateMeta = {
  low: {
    title: 'Low Risk',
    tone: 'stable',
    score: '8%',
    scoreLabel: 'Estimated mortality risk',
    accent: 'teal',
    gradient:
      'radial-gradient(120% 140% at 20% 0%, rgba(45, 212, 191, 0.18) 0%, rgba(255, 255, 255, 0) 58%), linear-gradient(180deg, #f8fffd 0%, #ffffff 100%)',
    ring: '#166534',
    ringSoft: 'rgba(22, 101, 52, 0.14)',
    summary: [
      ['Age', '34 years'],
      ['TBSA', '9%'],
      ['Sex', 'Female'],
      ['Rural', 'No'],
      ['Inhalation', 'No'],
      ['Mechanism', 'Scald'],
      ['ICU', 'No'],
    ],
  },
  high: {
    title: 'High Risk',
    tone: 'alert',
    score: '74%',
    scoreLabel: 'Estimated mortality risk',
    accent: 'crimson',
    gradient:
      'radial-gradient(120% 140% at 20% 0%, rgba(251, 146, 60, 0.16) 0%, rgba(255, 255, 255, 0) 58%), linear-gradient(180deg, #fffaf9 0%, #ffffff 100%)',
    ring: '#fb7185',
    ringSoft: 'rgba(251, 113, 133, 0.14)',
    summary: [
      ['Age', '67 years'],
      ['TBSA', '45%'],
      ['Sex', 'Male'],
      ['Rural', 'Yes'],
      ['Inhalation', 'Yes'],
      ['Mechanism', 'Flame'],
      ['ICU', 'Yes'],
    ],
  },
} as const

const disclosureKey = 'burnml-app-disclosure-acknowledged'

function App() {
  const query = new URLSearchParams(window.location.search)
  const [language, setLanguage] = useState<Language>(() => {
    const requested = query.get('lang')
    return requested === 'fr' || requested === 'es' ? requested : 'en'
  })
  const strings = localeStrings[language]
  const [showDisclosure, setShowDisclosure] = useState(() => (
    query.get('capture') !== '1' && !window.localStorage.getItem(disclosureKey)
  ))
  const [shareStatus, setShareStatus] = useState<string | null>(null)
  const [hasCalculated, setHasCalculated] = useState(() => query.has('state'))
  const state: RiskState = query.get('state') === 'high'
    ? 'high'
    : 'low'
  const [selectedLocations, setSelectedLocations] = useState<LocationOption[]>(() => {
    const requested = query.get('locations')?.split(',') ?? []
    const valid = requested.filter((item): item is LocationOption => locationOptions.includes(item as LocationOption))
    if (valid.length) return valid
    if (!query.has('state')) return []
    return state === 'low' ? ['Upper extremity'] : ['Head and neck', 'Torso', 'Upper extremity', 'Lower extremity']
  })
  const [featureValues, setFeatureValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(featureRows.map((item) => [
      item.label,
      query.has('state') ? state === 'low' ? item.valueLow : item.valueHigh : item.label === 'Sex' ? 'Male' : '',
    ])),
  )
  const figureUrl = useMemo(
    () => `${window.location.origin}/${state === 'high' ? 'high-example' : 'low-example'}.png`,
    [state],
  )
  const appUrl = useMemo(() => `${window.location.origin}/`, [])
  const locationImpact = useMemo(() => {
    const hasPatientData = Object.values(featureValues).some(Boolean) || selectedLocations.length > 0
    const probability = modelProbability(featureValues, selectedLocations)
    const derivedState: RiskState = probability >= 0.5 ? 'high' : 'low'
    const riskScore = !hasCalculated || !hasPatientData ? null : Math.round(probability * 100)

    return {
      state: derivedState,
      riskScore,
      score: riskScore === null ? '' : `${riskScore}%`,
      baselinePoints: 0, tbsaPoints: 0, anatomyPoints: 0, riskPoints: 0,
      formula: 'Predicted mortality = 1 / (1 + exp(−linear predictor)); missing inputs use training-cohort medians.',
      contributions: [
        [`Fitted model probability`, `${Math.round(probability * 100)}%`],
      ],
      unusedFeatures: featureRows.map((item) => item.label).filter((label) => label !== 'TBSA' && !locationOptions.includes(label as LocationOption)),
      summary: [
        ['Age', featureValues.Age],
        ['TBSA', featureValues.TBSA ? `${featureValues.TBSA}%` : ''],
        ['Sex', featureValues.Sex],
        ['FSA', featureValues.FSA],
        ['Rurality', featureValues.FSA ? deriveRurality(featureValues.FSA) : ''],
        ['Inhalation', featureValues['Inhalation injury']],
        ['ICU', featureValues.ICU],
        ['Anatomical location', selectedLocations.length ? selectedLocations.join(', ') : 'None selected'],
      ].filter(([, value]) => value),
    }
  }, [featureValues, hasCalculated, selectedLocations])

  const localizedLocationSummary = selectedLocations.length
    ? selectedLocations.map((item) => strings.locationOptions[item]).join(', ')
    : language === 'fr' ? 'Aucune sélection' : language === 'es' ? 'Ninguno seleccionado' : 'None selected'

  async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
    setShareStatus(strings.sharedCopied)
    window.setTimeout(() => setShareStatus(null), 1800)
  }

  async function handleShare(kind: 'data' | 'app') {
    const payload =
      kind === 'data'
        ? `${strings.appTitle} figure export (${locationImpact.state === 'low' ? strings.lowRisk : strings.highRisk}): ${figureUrl}`
        : `${strings.appTitle}: ${appUrl}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: strings.appTitle,
          text: payload,
          url: kind === 'data' ? figureUrl : appUrl,
        })
        setShareStatus(kind === 'data' ? strings.figureShareOpened : strings.appShareOpened)
        window.setTimeout(() => setShareStatus(null), 1800)
        return
      } catch {
        // Fall back to copy below.
      }
    }

    await copyText(payload)
  }

  const allLocationsSelected = selectedLocations.length === locationOptions.length

  function toggleLocation(option: LocationOption) {
    setSelectedLocations((current) =>
      current.includes(option) ? current.filter((item) => item !== option) : [...current, option],
    )
  }

  function toggleAllLocations() {
    setSelectedLocations((current) =>
      current.length === locationOptions.length ? [] : [...locationOptions],
    )
  }

  return (
    <main className={`shell shell--${locationImpact.state}`}>
      <section className="device">
        <section className="phone" aria-label={`${!hasCalculated ? strings.readyTitle : strings[locationImpact.state === 'low' ? 'lowRisk' : 'highRisk']} ${strings.riskScreenLabel}`}>
          <div className="topbar">
            <div>
              <h1>MEMBA</h1>
              <p className="app-name-expansion">Manitoba Estimated Mortality in Burn App</p>
            </div>
            <div className="topbar__controls">
              <span className="topbar__eyebrow">{strings.languageLabel}</span>
              <div className="mode-toggle" role="group" aria-label={strings.languageLabel}>
                {(['en', 'fr', 'es'] as Language[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={language === item ? 'mode-toggle__item is-active' : 'mode-toggle__item'}
                    onClick={() => setLanguage(item)}
                  >
                    {strings.languages[item]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hasCalculated ? <div className="hero-card" style={{ background: stateMeta[locationImpact.state].gradient }}>
            <div className="hero-card__ambient" />
            <h2 className="hero-card__title">{locationImpact.state === 'low' ? strings.lowRisk : strings.highRisk}</h2>
            <div
              className="score-ring"
              aria-label={`${locationImpact.score} risk`}
                style={{ ['--ring' as string]: locationImpact.riskScore === null ? '#d1d5db' : locationImpact.riskScore > 50 ? '#dc2626' : stateMeta[locationImpact.state].ring }}
              >
              <div className="score-ring__inner" style={{ borderColor: locationImpact.riskScore === null ? 'rgba(17, 17, 17, 0.08)' : locationImpact.riskScore > 50 ? 'rgba(220, 38, 38, 0.14)' : stateMeta[locationImpact.state].ringSoft }}>
                <span className="score-ring__value">{locationImpact.score || '—'}</span>
                <span className="score-ring__label">{hasCalculated ? strings.scoreLabel : ''}</span>
              </div>
            </div>
          </div> : null}

          <section className="feature-panel" aria-label={strings.patientData}>
            <div className="feature-list">
              {featureRows.map((item) => {
                const value = featureValues[item.label] ?? (locationImpact.state === 'low' ? item.valueLow : item.valueHigh)
                return (
                  <article className="feature-row" key={item.label}>
                    <div className="feature-row__label">
                      <span>{strings.featureLabels[item.label] ?? item.label}</span>
                    </div>
                    {choiceFields.has(item.label) ? (
                      <div className="choice-selector" role="radiogroup" aria-label={item.label}>
                        {(item.label === 'Sex' ? [['Male', 'M'], ['Female', 'F']] : [['', 'No'], ['Yes', 'Yes']]).map(([optionValue, optionLabel]) => (
                          <button
                            key={optionLabel}
                            type="button"
                            role="radio"
                            aria-checked={value === optionValue}
                            className={value === optionValue ? 'choice-selector__option is-selected' : 'choice-selector__option'}
                            onClick={() => setFeatureValues((current) => ({ ...current, [item.label]: optionValue }))}
                          >
                            {optionLabel}
                          </button>
                        ))}
                      </div>
                    ) : <input
                      className="feature-row__input"
                      aria-label={item.label}
                      type={numericFields.has(item.label) ? 'number' : 'text'}
                      min={numericFields.has(item.label) ? 0 : undefined}
                        max={item.label === 'TBSA' ? 100 : item.label === 'Procedures' ? 15 : undefined}
                      step={item.label === 'TBSA' ? 0.1 : numericFields.has(item.label) ? 1 : undefined}
                      maxLength={item.label === 'FSA' ? 3 : undefined}
                      placeholder={item.label === 'FSA' ? 'e.g. R3B' : undefined}
                      title={item.label === 'FSA' ? 'Enter any Manitoba FSA, using the first 3 characters of the postal code' : undefined}
                      value={value}
                      onChange={(event) => {
                        const nextValue = item.label === 'FSA'
                          ? event.target.value.replace(/\s/g, '').toUpperCase().slice(0, 3)
                          : item.label === 'TBSA'
                            ? event.target.value.replace(/[^0-9.]/g, '').replace(/^(\d+\.\d?).*$/, '$1')
                          : event.target.value
                        setFeatureValues((current) => ({ ...current, [item.label]: nextValue }))
                      }}
                      onBlur={(event) => {
                        if (item.label !== 'TBSA' || event.target.value === '') return
                        const rounded = Math.min(100, Math.max(0, Math.round(Number.parseFloat(event.target.value) * 10) / 10))
                        setFeatureValues((current) => ({ ...current, TBSA: `${rounded}` }))
                      }}
                    />}
                  </article>
                )
              })}
            </div>
          </section>

          {hasCalculated && locationImpact.summary.length ? (
            <section className="summary-panel" aria-label={strings.selectedPatientVariables}>
              <dl className="summary-grid">
                {locationImpact.summary.map(([label, value]) => (
                  <div className="summary-grid__item" key={label}>
                    <dt>{strings.locationLabels[label] ?? label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section className="location-panel" aria-label={strings.anatomicalLocation}>
            <div className="summary-panel__heading">
              <h3>{strings.anatomicalLocation}</h3>
            </div>
            <button type="button" className="location-panel__select-all" onClick={toggleAllLocations}>
              {allLocationsSelected ? strings.clearAll : strings.selectAll}
            </button>
            <div className="location-panel__grid">
              {locationOptions.map((option) => {
                const checked = selectedLocations.includes(option)
                return (
                  <label className={checked ? 'location-chip is-checked' : 'location-chip'} key={option}>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={checked}
                      onChange={() => toggleLocation(option)}
                    />
                    <span>{strings.locationOptions[option]}</span>
                    <strong>{checked ? 'Yes' : 'No'}</strong>
                  </label>
                )
              })}
            </div>
            <p className="location-panel__summary">{strings.selected}: {localizedLocationSummary}</p>
          </section>

          {!hasCalculated ? (
            <section className="example-panel" aria-label={strings.patientData}>
              <button type="button" className="action-row__button" onClick={() => setHasCalculated(true)}>
                {strings.calculate}
              </button>
              <button type="button" className="action-row__button action-row__button--secondary" onClick={() => handleShare('app')}>
                {strings.shareApp}
              </button>
              {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}
            </section>
          ) : null}

          {hasCalculated ? (
          <section className="note-panel">
            <div className="action-row">
              <button type="button" className="action-row__button action-row__button--secondary" onClick={() => setHasCalculated(false)}>
                {strings.back}
              </button>
              <button type="button" className="action-row__button" onClick={() => handleShare('data')}>
                {strings.shareData}
              </button>
              <button type="button" className="action-row__button action-row__button--secondary" onClick={() => handleShare('app')}>
                {strings.shareApp}
              </button>
            </div>
            {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}
          </section>
          ) : null}

          <section className="faq-link-panel" aria-label={strings.faqTitle}>
            <a className="faq-link" href={githubReadmeUrl} target="_blank" rel="noreferrer">{strings.faqTitle}</a>
            <a className="faq-contact" href={githubAppUrl} target="_blank" rel="noreferrer">GitHub: jpg123/MEMBA</a>
          </section>

          <footer className="citation-footer">{strings.citationFooter}</footer>

        </section>
      </section>
      {showDisclosure ? (
        <div className="disclosure" role="dialog" aria-modal="true" aria-labelledby="disclosure-title">
          <div className="disclosure__card">
            <h2 id="disclosure-title">{strings.disclosureTitle}</h2>
            <p>{strings.disclosureBody1}</p>
            <p>{strings.disclosureBody2}</p>
            <button
              type="button"
              className="disclosure__button"
              onClick={() => {
                window.localStorage.setItem(disclosureKey, 'true')
                setShowDisclosure(false)
              }}
            >
              {strings.disclosureButton}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

export default App
