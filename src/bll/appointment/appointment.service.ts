import AppointmentRepository from '../../dal/appointment/appointment.repository.ts';
import { Service } from 'typedi';
import { Appointment } from '../../types/appointment.interface';
import { AppError } from '../../server/utils/customErrors.ts';

@Service()
class AppointmentsService {
  constructor(private appointmentRepository: AppointmentRepository) {}

  deleteAppointment = async (id: string) => {
    return this.appointmentRepository.deleteAppointment(id);
  };

  updateAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment | AppError> => {
    return this.appointmentRepository.updateAppointment(appointment);
  };

  createAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment | AppError> => {
    return this.appointmentRepository.createAppointment(appointment);
  };

  getAppointments = async (
    patientId: string,
  ): Promise<Appointment[] | AppError> => {
    return this.appointmentRepository.getAppointments(patientId);
  };
}

export default AppointmentsService;
