import AppointmentRepository from '../src/dal/appointment/appointment.repository.ts';
import AppointmentsService from '../src/bll/appointment/appointment.service.ts'; // Adjust the import path as needed
import { Appointment } from '../src/types/appointment.interface';

jest.mock('../src/server/utils/customErrors.ts', () => {
  return {
    AppError: jest.fn().mockImplementation(({ message, httpCode }) => ({
      message,
      httpCode,
    })),
  };
});

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let repository: jest.Mocked<AppointmentRepository>;

  const mockAppointment: Appointment = {
    id: 1,
    patientId: 1,
    doctorId: 1,
    appointmentDate: '2024-08-20',
    time: '10:00:00',
    reason: 'Regular checkup',
    status: 'Scheduled',
  };

  beforeEach(() => {
    repository =
      new AppointmentRepository() as jest.Mocked<AppointmentRepository>;
    repository.deleteAppointment = jest.fn();
    repository.updateAppointment = jest.fn();
    repository.createAppointment = jest.fn();
    repository.getAppointments = jest.fn();

    service = new AppointmentsService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call deleteAppointment on the repository when deleteAppointment is called', async () => {
    repository.deleteAppointment.mockResolvedValueOnce(
      'Appointment deleted successfully',
    );

    const result = await service.deleteAppointment('1');

    expect(repository.deleteAppointment).toHaveBeenCalledWith('1');
    expect(result).toBe('Appointment deleted successfully');
  });

  it('should call updateAppointment on the repository when updateAppointment is called', async () => {
    repository.updateAppointment.mockResolvedValueOnce(mockAppointment);

    const result = await service.updateAppointment(mockAppointment);

    expect(repository.updateAppointment).toHaveBeenCalledWith(mockAppointment);
    expect(result).toBe(mockAppointment);
  });

  it('should call createAppointment on the repository when createAppointment is called', async () => {
    repository.createAppointment.mockResolvedValueOnce(mockAppointment);

    const result = await service.createAppointment(mockAppointment);

    expect(repository.createAppointment).toHaveBeenCalledWith(mockAppointment);
    expect(result).toBe(mockAppointment);
  });

  it('should call getAppointments on the repository when getAppointments is called', async () => {
    const appointments = [mockAppointment];
    repository.getAppointments.mockResolvedValueOnce(appointments);

    const result = await service.getAppointments('123');

    expect(repository.getAppointments).toHaveBeenCalledWith('123');
    expect(result).toBe(appointments);
  });
});
