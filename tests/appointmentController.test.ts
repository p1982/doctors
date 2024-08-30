import request from 'supertest';
import express from 'express';
import AppointmentController from '../src/server/appointment/appointment.controller.ts';
import AppointmentsService from '../src/bll/appointment/appointment.service.ts';
import AppointmentRepository from '../src/dal/appointment/appointment.repository.ts';
import { jest } from '@jest/globals';
import { Appointment } from '../src/types/appointment.interface.ts';

// Mocking the authentication and role validation middleware
jest.mock('../src/server/middleware/auth.middleware.ts', () => ({
  isAuthenticated: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => next(),
}));

jest.mock('../src/server/middleware/roles.middleware.ts', () => ({
  rolesValidation:
    (roles: any) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) =>
      next(),
}));

jest.mock('../src/dal/appointment/appointment.repository.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getAppointments: jest.fn(),
      createAppointment: jest.fn(),
      updateAppointment: jest.fn(),
      deleteAppointment: jest.fn(),
    };
  });
});

describe('AppointmentController', () => {
  let app: express.Application;
  let appointmentRepository: jest.Mocked<AppointmentRepository>;
  let appointmentsService: AppointmentsService;
  const mockAppointment: Appointment = {
    id: 1,
    doctorId: 1,
    patientId: 1,
    appointmentDate: '2024-08-01T10:00:00.000Z',
    reason: 'check up',
    time: '9:00',
    status: 'available',
  };
  const mockAppointments: Appointment[] = [mockAppointment];

  beforeAll(() => {
    app = express();
    app.use(express.json());

    appointmentRepository =
      new AppointmentRepository() as jest.Mocked<AppointmentRepository>;
    appointmentsService = new AppointmentsService(appointmentRepository);

    const appointmentController = new AppointmentController(
      appointmentsService,
    );
    app.use('/api/appointments', appointmentController.router);
  });

  it('should respond with a list of appointments for a specific patient on GET /api/appointments/:id', async () => {
    appointmentRepository.getAppointments.mockResolvedValue(mockAppointments);

    const response = await request(app).get('/api/appointments/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAppointments);
  });

  it('should create a new appointment on POST /api/appointments', async () => {
    appointmentRepository.createAppointment.mockResolvedValue(mockAppointment);

    const response = await request(app)
      .post('/api/appointments')
      .send(mockAppointment);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockAppointment);
  });

  it('should update an existing appointment on PUT /api/appointments/:id', async () => {
    const updatedAppointment: Appointment = {
      ...mockAppointment,
      reason: 'follow-up',
    };

    appointmentRepository.updateAppointment.mockResolvedValue(
      updatedAppointment,
    );

    const response = await request(app)
      .put(`/api/appointments/${mockAppointment.id}`)
      .send(updatedAppointment);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedAppointment);
  });

  it('should delete an appointment on DELETE /api/appointments/:id', async () => {
    const message = 'Appointment deleted successfully';
    appointmentRepository.deleteAppointment.mockResolvedValue(message);

    const response = await request(app).delete(
      `/api/appointments/${mockAppointment.id}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message });
  });

  // it('should respond with a single appointment on GET /api/appointments/:id', async () => {
  //   appointmentRepository.getAppointmentById.mockResolvedValue(mockAppointment);

  //   const response = await request(app).get('/api/appointments/1');
  //   expect(response.status).toBe(200);
  //   expect(response.body).toEqual(mockAppointment);
  // });
});
