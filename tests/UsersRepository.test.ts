import UsersRepository from '../src/dal/users/users.repository.ts';
import { User } from '../src/types/users.interface.ts';
import { AppError, HttpCode } from '../src/server/utils/customErrors.ts';
import DatabaseClient from '../src/dal/client.ts';

jest.mock('../src/dal/client.ts'); // Mock the DatabaseClient

// Mock console.error to suppress error output during tests
const consoleErrorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockDbClient: jest.Mocked<DatabaseClient>;

  const mockConfig = {
    host: 'localhost',
    port: 5432,
    user: 'testuser',
    password: 'testpassword',
    database: 'testdb',
    url: 'postgres://testuser:testpassword@localhost:5432/testdb',
  };

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    birthday: '1990-01-01',
    gender: 'male',
    contactNumber: '123-456-7890',
    address: '123 Main St, Springfield',
    role: 'patient',
    medicalHistory: 'No known allergies',
  };

  beforeEach(() => {
    mockDbClient = new DatabaseClient(
      mockConfig,
    ) as jest.Mocked<DatabaseClient>;
    repository = new UsersRepository(mockDbClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByEmail', () => {
    it('should return a user if found by email', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await repository.getByEmail('john.doe@example.com');

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        'john.doe@example.com',
      ]);
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const result = await repository.getByEmail('notfound@example.com');

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        'notfound@example.com',
      ]);
      expect(result).toBeNull();
    });

    it('should return an AppError if there is a database error', async () => {
      const errorMessage = 'Database error';
      mockDbClient.query.mockRejectedValueOnce(new Error(errorMessage));

      const result = await repository.getByEmail('error@example.com');

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        'error@example.com',
      ]);
      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).message).toBe(
        'Error retrieving user by email',
      );
      expect((result as AppError).httpCode).toBe(
        HttpCode.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('createAUser', () => {
    it('should create a user and return the user object', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await repository.createAUser(mockUser);

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        mockUser.firstName,
        mockUser.lastName,
        mockUser.birthday,
        mockUser.gender,
        mockUser.contactNumber,
        mockUser.email,
        mockUser.address,
        mockUser.password,
        'patient',
      ]);
      expect(result).toEqual(mockUser);
    });

    it('should return an AppError if there is a database error during creation', async () => {
      const errorMessage = 'Database error';
      mockDbClient.query.mockRejectedValueOnce(new Error(errorMessage));

      const result = await repository.createAUser(mockUser);

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        mockUser.firstName,
        mockUser.lastName,
        mockUser.birthday,
        mockUser.gender,
        mockUser.contactNumber,
        mockUser.email,
        mockUser.address,
        mockUser.password,
        'patient',
      ]);
      expect(result).toBeInstanceOf(AppError);
      expect((result as AppError).message).toBe('Error creating user');
      expect((result as AppError).httpCode).toBe(
        HttpCode.INTERNAL_SERVER_ERROR,
      );
    });
  });
});

// Restore console.error after tests
afterAll(() => {
  consoleErrorSpy.mockRestore();
});
