// Index file for Congenital Diseases
import { CONGENITAL_DISEASES } from './congenitalDiseases';

export const ALL_CONGENITAL_DISEASES = {
  ...CONGENITAL_DISEASES
};

export const CONGENITAL_CATEGORIES = {
  chromosomal: {
    label: "Chromosomal Disorders",
    diseases: ["Q90_9", "Q96_9", "Q98_4"]
  },
  connectiveTissue: {
    label: "Connective Tissue Disorders",
    diseases: ["Q87_4", "Q79_6"]
  },
  coagulopathies: {
    label: "Hereditary Coagulopathies",
    diseases: ["D66", "D68_0"]
  },
  metabolicGenetic: {
    label: "Metabolic Genetic Disorders",
    diseases: ["E80_2"]
  },
  neurocutaneous: {
    label: "Neurocutaneous Disorders",
    diseases: ["Q85_0"]
  }
};

export default ALL_CONGENITAL_DISEASES;
