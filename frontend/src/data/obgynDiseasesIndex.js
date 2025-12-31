// Index file for OB/GYN Diseases
import { OBGYN_DISEASES } from './obgynDiseases';

export const ALL_OBGYN_DISEASES = {
  ...OBGYN_DISEASES
};

export const OBGYN_CATEGORIES = {
  obstetric: {
    label: "Obstetric Conditions",
    diseases: ["O14_9", "O00_9", "O24_4"]
  },
  gynecologic: {
    label: "Gynecologic Conditions",
    diseases: ["E28_2", "N80_9", "D25_9", "C53_9"]
  }
};

export default ALL_OBGYN_DISEASES;
