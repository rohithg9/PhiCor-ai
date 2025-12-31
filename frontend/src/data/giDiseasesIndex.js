// Index file for Gastrointestinal Diseases
import { GI_DISEASES } from './giDiseases';

export const ALL_GI_DISEASES = {
  ...GI_DISEASES
};

export const GI_CATEGORIES = {
  esophageal: {
    label: "Esophageal Disorders",
    diseases: ["K21_0", "K22_0", "C15_9"]
  },
  gastric: {
    label: "Gastric Disorders",
    diseases: ["K25_9", "K29_7", "C16_9"]
  },
  intestinal: {
    label: "Intestinal Disorders",
    diseases: ["K56_6", "K57_3", "K58_9"]
  },
  pancreatic: {
    label: "Pancreatic Disorders",
    diseases: ["K85_9", "K86_1", "C25_9"]
  },
  biliary: {
    label: "Biliary Disorders",
    diseases: ["K80_2", "K81_0"]
  }
};

export default ALL_GI_DISEASES;
