import DoctorRepository from '../src/dal/doctors/doctors.repository.ts';
import DoctorsService from '../src/bll/doctors/doctors.service.ts';
import { Doctor } from '../src/types/doctor.interface.ts';
import { Params } from '../src/types/params.interface.ts';

jest.mock('../src/dal/doctors/doctors.repository.ts');

jest.mock('../src/server/utils/customErrors.ts', () => {
  return {
    AppError: jest.fn().mockImplementation(({ message, httpCode }) => ({
      message,
      httpCode,
    })),
  };
});

describe('DoctorsService', () => {
  let service: DoctorsService;
  let repository: jest.Mocked<DoctorRepository>;

  const mockDoctor: Doctor = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    specialization: 'Cardiology',
    contactNumber: '1234567890',
    email: 'john.doe@example.com',
    role: 'Doctor',
  };

  const mockParams: Params = {
    size: 10,
    page: 1,
    filter: {},
  };

  beforeEach(() => {
    repository = new DoctorRepository() as jest.Mocked<DoctorRepository>;
    repository.getDoctorById = jest.fn();
    repository.getDoctors = jest.fn();

    service = new DoctorsService(repository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('It should call getDoctorById in the repository when getDoctorById is invoked.', async () => {
    repository.getDoctorById.mockResolvedValueOnce(mockDoctor);

    const result = await service.getDoctorById('1');

    expect(repository.getDoctorById).toHaveBeenCalledWith('1');
    expect(result).toBe(mockDoctor);
  });

  it('It should call getDoctors in the repository when getDoctors is invoked.', async () => {
    const mockDoctors = [mockDoctor];
    repository.getDoctors.mockResolvedValueOnce(mockDoctors);

    const result = await service.getDoctors(mockParams);

    expect(repository.getDoctors).toHaveBeenCalledWith(mockParams);
    expect(result).toBe(mockDoctors);
  });
});
