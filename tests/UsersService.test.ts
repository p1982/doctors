import UsersService from '../src/bll/users/users.service.ts';
import UsersRepository from '../src/dal/users/users.repository.ts';
import { User } from '../src/types/users.interface.ts';

jest.mock('../src/dal/users/users.repository.ts'); // Mock the UsersRepository

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    birthday: '1990-01-01',
    role: 'patient',
    gender: 'male', // Add the gender property
    contactNumber: '123-456-7890', // Add the contactNumber property
    address: '123 Main St, Springfield', // Add the address property
    medicalHistory: 'No known allergies', // Add the medicalHistory property
  };

  beforeEach(() => {
    repository = new UsersRepository() as jest.Mocked<UsersRepository>;
    repository.getByEmail = jest.fn();
    repository.createAUser = jest.fn();

    service = new UsersService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      repository.getByEmail.mockResolvedValueOnce(mockUser);

      const result = await service.getUserByEmail('john.doe@example.com');

      expect(repository.getByEmail).toHaveBeenCalledWith(
        'john.doe@example.com',
      );
      expect(result).toBe(mockUser);
    });

    it('should return null when no user is found by email', async () => {
      repository.getByEmail.mockResolvedValueOnce(null);

      const result = await service.getUserByEmail('notfound@example.com');

      expect(repository.getByEmail).toHaveBeenCalledWith(
        'notfound@example.com',
      );
      expect(result).toBeNull();
    });
  });

  describe('createAUser', () => {
    it('should create a user and return the formatted user', async () => {
      const mockCreatedUser = { ...mockUser, id: 2 };
      repository.createAUser.mockResolvedValueOnce(mockCreatedUser);

      const result = await service.createAUser(mockUser);

      expect(repository.createAUser).toHaveBeenCalledWith({
        ...mockUser,
        birthday: '1990-01-01', // normalized date
      });
      expect(result).toEqual(mockCreatedUser);
    });
  });
});
