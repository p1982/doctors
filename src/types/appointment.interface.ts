export interface Appointment {
  id?: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  reason?: string;
  time?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
