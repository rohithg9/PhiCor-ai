// Index file for Autoimmune Diseases
import { AUTOIMMUNE_DISEASES } from './autoimmuneDiseases';

export const ALL_AUTOIMMUNE_DISEASES = {
  ...AUTOIMMUNE_DISEASES
};

export const AUTOIMMUNE_CATEGORIES = {
  connective: {
    label: "Connective Tissue Diseases",
    diseases: ["M32_9", "M35_9", "M34_9", "M33_2"]
  },
  inflammatory: {
    label: "Inflammatory Arthritis",
    diseases: ["M05_9", "M45_9", "M07_3"]
  },
  vasculitis: {
    label: "Vasculitis",
    diseases: ["M31_3", "M31_5", "M30_0"]
  },
  organ_specific: {
    label: "Organ-Specific Autoimmune",
    diseases: ["K50_9", "K51_9", "G70_0", "E10_9"]
  }
};

export default ALL_AUTOIMMUNE_DISEASES;
