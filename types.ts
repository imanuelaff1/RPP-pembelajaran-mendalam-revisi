// FIX: Define enums, types, and interfaces instead of constants. This file should only contain type definitions.
export enum PedagogyModel {
  PJBL = 'Project Based Learning (PjBL)',
  PBL = 'Problem Based Learning (PBL)',
  INQUIRY = 'Inquiry Learning',
  DISCOVERY = 'Discovery Learning',
  CONTEXTUAL = 'Contextual Teaching & Learning',
}

export enum GraduateProfileDimension {
  IMAN_TAKWA = 'Beriman, Bertakwa, & Berakhlak Mulia',
  KEWARGAAN = 'Berkebinekaan Global',
  PENALARAN_KRITIS = 'Bernalar Kritis',
  KREATIVITAS = 'Kreatif',
  KOLABORASI = 'Kolaborasi/Gotong Royong',
  KEMANDIRIAN = 'Mandiri',
  KESEHATAN = 'Sehat Jasmani & Rohani',
  KOMUNIKASI = 'Komunikatif & Interaktif',
}

export type EducationUnitType = 'Umum' | 'SLB/ABK';

export interface RppSectionItem {
  konteks: string;
  deskripsi: string;
}

export interface KktpItem {
  tujuan: string;
  kriteria: string;
}

export interface RppFormData {
  schoolName: string;
  teacherName: string;
  nip: string;
  city: string;
  academicYear: string;
  educationUnitType: EducationUnitType;
  class: string;
  phase: string;
  semester: string;
  subject: string;
  topicTheme: string;
  learningOutcomes: string;
  kktp: string;
  facilities: string;
  studentCharacteristics: string;
  learningInterests: string;
  learningMotivation: string;
  learningAchievement: string;
  schoolEnvironment: string;
  graduateProfileDimensions: GraduateProfileDimension[];
  pedagogyModel: PedagogyModel;
  learningContext: string;
  timeAllocation: string;
  meetings: string;
  slbCategory: string;
  iepTargets: string;
  sensoryProfile: string;
  communicationMode: string;
  assistiveTools: string;
  assistantRole: string;
}

export interface GeneratedRpp {
  A_identitasKonteks: RppSectionItem[];
  B_capaianTujuanPembelajaran: KktpItem[];
  C_dimensiProfilLulusan: RppSectionItem[];
  D_lintasDisiplinTopik: RppSectionItem[];
  E_praktikPedagogisUtama: RppSectionItem[];
  F_lingkunganPembelajaran: RppSectionItem[];
  G_pemanfaatanDigital: RppSectionItem[];
  H_kemitraanPembelajaran: RppSectionItem[];
  I_langkahLangkahPembelajaran: RppSectionItem[];
  J_asesmenInstrumen: RppSectionItem[];
  K_diferensiasiAkomodasi: RppSectionItem[];
  L_tindakLanjutRefleksi: RppSectionItem[];
  M_daftarRujukanInternal: string[];
}