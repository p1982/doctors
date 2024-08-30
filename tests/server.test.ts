import request from 'supertest';
import 'reflect-metadata';
import App from '../src/server/app.ts';
import { Container } from 'typedi';
import AuthController from '../src/server/auth/auth.controller.ts';
import DoctorController from '../src/server/doctors/doctors.controller.ts';
import AppointmentController from '../src/server/appointment/appointment.controller.ts';
import TestController from '../src/server/test/test.controller.ts';

describe('App Integration Tests', () => {
  let appInstance: App;

  beforeAll(() => {
    appInstance = new App(
      [
        Container.get(AuthController),
        Container.get(DoctorController),
        Container.get(AppointmentController),
        Container.get(TestController),
      ],
      3000,
      'localhost',
    );
    appInstance.listen(); // Start the app before tests
  });

  afterAll(async () => {
    await appInstance.close(); // Close the server after tests
  });

  it('should respond with 200 on the base URL', async () => {
    const response = await request(appInstance.app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });

  // Add more tests for other routes and controllers
});
