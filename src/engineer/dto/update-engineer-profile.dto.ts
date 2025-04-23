export interface UpdateEngineerProfileDto {
  poste?: string;
  totalExperienceYear?: number;
  languages?: string[];
  formations?: string[];
  skills?: { category: string; skills: string[] }[];
  experience?: {
    entreprise: string;
    poste: string;
    periode: string;
    responsabilities: string[];
  }[];
}