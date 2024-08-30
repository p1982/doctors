import request from 'supertest';
import express from 'express';
import DoctorController from '../src/server/doctors/doctors.controller.ts';
import DoctorsService from '../src/bll/doctors/doctors.service.ts';
import DoctorRepository from '../src/dal/doctors/doctors.repository.ts';
import { jest } from '@jest/globals';
import { Doctor } from '../src/types/doctor.interface.ts';

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

jest.mock('../src/dal/doctors/doctors.repository.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getDoctors: jest.fn(),
      getDoctorById: jest.fn(),
    };
  });
});

describe('DoctorController', () => {
  let app: express.Application;
  let doctorRepository: jest.Mocked<DoctorRepository>;
  let doctorsService: DoctorsService;
  const mockDoctor: Doctor = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    specialization: 'Cardiology',
    contactNumber: '1234567890',
    email: 'john.doe@example.com',
  };
  const mockDoctors: Doctor[] = [mockDoctor];

  beforeAll(() => {
    app = express();
    app.use(express.json());

    doctorRepository = new DoctorRepository() as jest.Mocked<DoctorRepository>;
    doctorsService = new DoctorsService(doctorRepository);

    const doctorController = new DoctorController(doctorsService);
    app.use('/api/doctors', doctorController.router);
  });

  it('should respond with a list of doctors on GET /api/doctors', async () => {
    doctorRepository.getDoctors.mockResolvedValue(mockDoctors);

    const response = await request(app).get('/api/doctors');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDoctors);
  });

  it('should respond with a single doctor on GET /api/doctors/:id', async () => {
    doctorRepository.getDoctorById.mockResolvedValue(mockDoctor);

    const response = await request(app).get('/api/doctors/1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockDoctor);
  });
});
