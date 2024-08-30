import DoctorRepository from '../src/dal/doctors/doctors.repository.ts';
import { Doctor } from '../src/types/doctor.interface.ts';
import DatabaseClient from '../src/dal/client.ts';
import { Params } from '../src/types/params.interface.ts';

jest.mock('../src/dal/client.ts'); // Mock the DatabaseClient

describe('DoctorRepository', () => {
  let repository: DoctorRepository;
  let mockDbClient: jest.Mocked<DatabaseClient>;

  const mockDoctor: Doctor = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    specialization: 'Cardiology',
    contactNumber: '1234567890',
    email: 'john.doe@example.com',
    schedules: [
      {
        doctorId: 1,
        availableDate: '2024-08-20',
        startAppointment: '09:00:00',
        endAppointment: '17:00:00',
        isAvailable: true,
      },
    ],
  };

  const mockParams: Params = {
    size: 10,
    page: 1,
    filter: { specialization: 'Cardiology' },
  };

  beforeEach(() => {
    mockDbClient = new DatabaseClient({} as any) as jest.Mocked<DatabaseClient>;
    repository = new DoctorRepository();
    (repository as any).dbClient = mockDbClient; // Inject mock client into repository
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDoctorById', () => {
    it('should return a doctor when found by ID', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockDoctor],
        rowCount: 1,
      });

      const result = await repository.getDoctorById('1');

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        '1',
      ]);
      expect(result).toEqual(mockDoctor);
    });
  });

  describe('getDoctors', () => {
    it('should return doctors when found by specialization', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [mockDoctor],
        rowCount: 1,
      });

      const result = await repository.getDoctors(mockParams);

      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), [
        'Cardiology',
        10,
        0,
      ]);
      expect(result).toEqual([mockDoctor]);
    });
  });
});
