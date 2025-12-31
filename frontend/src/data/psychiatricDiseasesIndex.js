// Index file for Psychiatric/Mental Health Diseases
import { PSYCHIATRIC_DISEASES } from './psychiatricDiseases';

export const ALL_PSYCHIATRIC_DISEASES = {
  ...PSYCHIATRIC_DISEASES
};

export const PSYCHIATRIC_CATEGORIES = {
  mood: {
    label: "Mood Disorders",
    diseases: ["F32_9", "F31_9"]
  },
  anxiety: {
    label: "Anxiety Disorders",
    diseases: ["F41_1", "F43_1", "F42_9"]
  },
  psychotic: {
    label: "Psychotic Disorders",
    diseases: ["F20_9"]
  },
  neurodevelopmental: {
    label: "Neurodevelopmental Disorders",
    diseases: ["F90_9"]
  }
};

export default ALL_PSYCHIATRIC_DISEASES;
