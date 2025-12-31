// Index file for Infectious Diseases
import { INFECTIOUS_DISEASES } from './infectiousDiseases';

export const ALL_INFECTIOUS_DISEASES = {
  ...INFECTIOUS_DISEASES
};

export const INFECTIOUS_CATEGORIES = {
  respiratory: {
    label: "Respiratory Infections",
    diseases: ["J10_1", "U07_1", "A15_0"]
  },
  systemic: {
    label: "Systemic Infections",
    diseases: ["A41_9", "B20", "A02_1"]
  },
  cns: {
    label: "CNS Infections",
    diseases: ["A87_9", "B00_4"]
  },
  tropical: {
    label: "Tropical/Vector-Borne",
    diseases: ["B50_9", "A90"]
  },
  hepatitis: {
    label: "Viral Hepatitis",
    diseases: ["B15_9", "B16_9"]
  }
};

export default ALL_INFECTIOUS_DISEASES;
