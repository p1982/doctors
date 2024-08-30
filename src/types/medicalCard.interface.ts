export interface MedicalCard {
  id?: number;
  patientId: number;
  appointmentId: number;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  createdAt?: Date;
}
