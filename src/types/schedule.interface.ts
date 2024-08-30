export interface Schedule {
  id?: number;
  doctorId: number;
  availableDate: string;
  startAppointment: string;
  endAppointment: string;
  isAvailable: boolean;
}
