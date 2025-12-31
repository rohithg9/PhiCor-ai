// Index file for Dermatological Diseases
import { DERMATOLOGICAL_DISEASES } from './dermatologicalDiseases';

export const ALL_DERMATOLOGICAL_DISEASES = {
  ...DERMATOLOGICAL_DISEASES
};

export const DERMATOLOGICAL_CATEGORIES = {
  inflammatory: {
    label: "Inflammatory Dermatoses",
    diseases: ["L40_0", "L20_9", "L50_9"]
  },
  infectious: {
    label: "Skin Infections",
    diseases: ["L03_9", "B02_9"]
  },
  neoplastic: {
    label: "Skin Neoplasms",
    diseases: ["C43_9"]
  },
  pigmentary: {
    label: "Pigmentary Disorders",
    diseases: ["L80"]
  },
  follicular: {
    label: "Follicular Disorders",
    diseases: ["L70_0"]
  }
};

export default ALL_DERMATOLOGICAL_DISEASES;
