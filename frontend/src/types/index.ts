// ─── Auth ──────────────────────────────────────────────────────────────────
export interface AuthTokens {
  access: string
  refresh: string
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

// ─── Person (Demographics) ─────────────────────────────────────────────────
export interface Person {
  id: number
  user: number
  first_name: string
  last_name: string
  date_of_birth: string | null
  gender: string
  phone: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  blood_type: string
  created_at: string
  updated_at: string
}

// ─── Problem ───────────────────────────────────────────────────────────────
export type ProblemSeverity = 'mild' | 'moderate' | 'severe'
export type ProblemStatus = 'active' | 'resolved' | 'inactive'

export interface Problem {
  id: number
  person: number
  problem_name: string
  snomed_ct: string
  icd10: string
  severity: ProblemSeverity
  status: ProblemStatus
  onset_date: string | null
  resolved_date: string | null
  clinical_notes: string
  created_at: string
  updated_at: string
}

// ─── Medication ────────────────────────────────────────────────────────────
export type MedicationStatus = 'active' | 'stopped' | 'on-hold' | 'completed'

export interface Medication {
  id: number
  person: number
  medication_name: string
  generic_name: string
  route: string
  dose: string
  frequency: string
  start_date: string | null
  end_date: string | null
  status: MedicationStatus
  prescriber: string
  indication: string
  notes: string
  created_at: string
  updated_at: string
}

// ─── Reaction (Allergy / Adverse Reaction) ──────────────────────────────────
export type ReactionCriticality = 'high' | 'low' | 'unable-to-assess'
export type VerificationStatus = 'confirmed' | 'unconfirmed' | 'refuted' | 'entered-in-error'

export interface Reaction {
  id: number
  person: number
  substance: string
  substance_type: string
  reaction_type: string
  manifestation: string
  severity: string
  criticality: ReactionCriticality
  verification_status: VerificationStatus
  onset_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

// ─── Vital Sign ─────────────────────────────────────────────────────────────
export type VitalType =
  | 'blood_pressure'
  | 'heart_rate'
  | 'weight'
  | 'height'
  | 'temperature'
  | 'oxygen_saturation'
  | 'blood_glucose'
  | 'respiratory_rate'

export interface VitalSign {
  id: number
  person: number
  vital_type: VitalType
  value: number
  value2: number | null  // for systolic/diastolic
  unit: string
  recorded_at: string
  notes: string
  created_at: string
}

// ─── Pathology Report ────────────────────────────────────────────────────────
export type AnalyteFlag = 'N' | 'L' | 'LL' | 'H' | 'HH' | 'A'

export interface PathologyAnalyte {
  id: number
  report: number
  analyte_name: string
  value: string
  unit: string
  reference_range_low: number | null
  reference_range_high: number | null
  flag: AnalyteFlag
  notes: string
}

export interface PathologyReport {
  id: number
  person: number
  report_date: string
  lab_name: string
  requesting_provider: string
  report_type: string
  pdf_file: string | null
  notes: string
  analytes: PathologyAnalyte[]
  created_at: string
  updated_at: string
}

// ─── Immunisation ────────────────────────────────────────────────────────────
export interface Immunisation {
  id: number
  person: number
  vaccine_name: string
  disease_targeted: string
  administration_date: string
  batch_number: string
  dose_number: number | null
  next_due_date: string | null
  administered_by: string
  site: string
  notes: string
  created_at: string
  updated_at: string
}

// ─── Encounter ───────────────────────────────────────────────────────────────
export interface Encounter {
  id: number
  person: number
  encounter_type: string
  encounter_date: string
  provider_name: string
  provider_specialty: string
  facility: string
  chief_complaint: string
  assessment: string
  plan: string
  notes: string
  created_at: string
  updated_at: string
}

// ─── Document ────────────────────────────────────────────────────────────────
export interface Document {
  id: number
  person: number
  document_name: string
  document_type: string
  file: string | null
  file_size: number | null
  notes: string
  uploaded_at: string
  created_at: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface DashboardSummary {
  active_medications_count: number
  active_problems_count: number
  last_pathology_date: string | null
  flagged_results_count: number
  immunisations_due_count: number
  last_encounter_date: string | null
  last_encounter_provider: string | null
}

// ─── Timeline Event ──────────────────────────────────────────────────────────
export interface TimelineEvent {
  id: string
  event_type: string
  title: string
  description: string
  date: string
  icon?: string
}

// ─── Pagination ─────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
