import request from 'supertest';
import express from 'express';
import AuthController from '../src/server/auth/auth.controller.ts';
import UsersService from '../src/bll/users/users.service.ts';
import UsersRepository from '../src/dal/users/users.repository.ts';
import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { User } from '../src/types/users.interface.ts';

jest.mock('../src/dal/users/users.repository.ts', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getByEmail: jest.fn(),
      createAUser: jest.fn(),
    };
  });
});

describe('AuthController', () => {
  let app: express.Application;
  let usersRepository: jest.Mocked<UsersRepository>;
  let usersService: UsersService;
  let authController: AuthController;
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    gender: 'male',
    birthday: '1990-01-01',
    contactNumber: '1234567890',
    address: '123 Main St',
    medicalHistory: 'none',
  };

  beforeAll(() => {
    app = express();
    app.use(express.json());

    usersRepository = new UsersRepository() as jest.Mocked<UsersRepository>;
    usersService = new UsersService(usersRepository);
    authController = new AuthController(usersService);
    app.use('/api/auth', authController.router);

    // Log all registered routes
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        // Routes registered directly on the app
        console.log(middleware.route);
      } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler: any) => {
          const route = handler.route;
          route && console.log(route);
        });
      }
    });
  });

  it('should respond with a token on successful login', async () => {
    mockUser.password = await bcrypt.hash('password', 10);
    usersRepository.getByEmail.mockResolvedValue(mockUser);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('should respond with 400 on invalid login credentials', async () => {
    mockUser.password = await bcrypt.hash('password', 10);
    usersRepository.getByEmail.mockResolvedValue(mockUser);

    const response = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid Credentials');
  });

  it('should respond with 200 and token on successful registration', async () => {
    mockUser.password = await bcrypt.hash('password', 10);
    usersRepository.getByEmail.mockResolvedValue(null);
    usersRepository.createAUser.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send(mockUser);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should respond with 409 if user already exists on registration', async () => {
    usersRepository.getByEmail.mockResolvedValue(mockUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send(mockUser);

    expect(response.status).toBe(409);
    expect(response.text).toBe('User Already Exist. Please Login');
  });

  it('should respond with a new token on successful refresh', async () => {
    usersRepository.getByEmail.mockResolvedValue(mockUser);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    const { token, refreshToken } = loginResponse.body;

    const refreshResponse = await request(app).post('/api/auth/refresh').send({
      email: 'test@example.com',
      token,
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('token');
  });
});
