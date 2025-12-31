// Index file for Oncology Diseases
import { ONCOLOGY_DISEASES } from './oncologyDiseases';

export const ALL_ONCOLOGY_DISEASES = {
  ...ONCOLOGY_DISEASES
};

export const ONCOLOGY_CATEGORIES = {
  acuteLeukemia: {
    label: "Acute Leukemias",
    diseases: ["C91_0", "C92_0"]
  },
  chronicLeukemia: {
    label: "Chronic Leukemias",
    diseases: ["C91_1", "C92_1"]
  },
  lymphoma: {
    label: "Lymphomas",
    diseases: ["C81_9", "C85_9"]
  },
  plasmaCellNeoplasm: {
    label: "Plasma Cell Neoplasms",
    diseases: ["C90_0"]
  },
  solidTumors: {
    label: "Solid Tumors",
    diseases: ["C34_9", "C50_9", "C18_9", "C61"]
  }
};

export default ALL_ONCOLOGY_DISEASES;
