import type { Study } from "./Study";

export interface Patient {
  userId: string;
  mrn: string;
  name: string;
  dob: string;
  lastStudy: Study;
  numOfStudies: number;
  gender: string
}