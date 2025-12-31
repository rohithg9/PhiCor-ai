// Index file for Hematological Diseases
import { HEMATOLOGICAL_DISEASES } from './hematologicalDiseases';

export const ALL_HEMATOLOGICAL_DISEASES = {
  ...HEMATOLOGICAL_DISEASES
};

export const HEMATOLOGICAL_CATEGORIES = {
  ironDeficiency: {
    label: "Iron Deficiency/Microcytic",
    diseases: ["D50_9"]
  },
  macrocytic: {
    label: "Macrocytic Anemias",
    diseases: ["D51_0", "D52_9"]
  },
  hemolytic: {
    label: "Hemolytic Anemias",
    diseases: ["D57_1", "D56_1", "D59_1"]
  },
  marrowFailure: {
    label: "Bone Marrow Failure",
    diseases: ["D61_9"]
  },
  platelet: {
    label: "Platelet Disorders",
    diseases: ["D69_3"]
  },
  coagulation: {
    label: "Coagulation Disorders",
    diseases: ["D65"]
  }
};

export default ALL_HEMATOLOGICAL_DISEASES;
