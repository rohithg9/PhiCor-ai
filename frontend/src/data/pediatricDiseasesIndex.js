// Index file for Pediatric Diseases
import { PEDIATRIC_DISEASES } from './pediatricDiseases';

export const ALL_PEDIATRIC_DISEASES = {
  ...PEDIATRIC_DISEASES
};

export const PEDIATRIC_CATEGORIES = {
  inflammatory: {
    label: "Inflammatory/Vasculitis",
    diseases: ["M30_3", "D69_0"]
  },
  respiratory: {
    label: "Respiratory",
    diseases: ["J21_9", "J05_0"]
  },
  neurological: {
    label: "Neurological",
    diseases: ["R56_0"]
  },
  gastrointestinal: {
    label: "Gastrointestinal",
    diseases: ["K56_1", "Q40_0"]
  },
  infectious: {
    label: "Infectious",
    diseases: ["A38"]
  }
};

export default ALL_PEDIATRIC_DISEASES;
