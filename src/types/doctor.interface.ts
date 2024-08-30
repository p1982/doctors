import { Schedule } from './schedule.interface.ts';

export interface Doctor {
  id?: number;
  firstName: string;
  lastName: string;
  specialization: string;
  contactNumber: string;
  email: string;
  password?: string;
  role?: string;
  schedules?: Schedule[];
  createdAt?: Date;
  updatedAt?: Date;
}
