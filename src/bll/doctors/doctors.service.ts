import DoctorRepository from '../../dal/doctors/doctors.repository.ts';
import { Service } from 'typedi';
import { Doctor } from '../../types/doctor.interface.ts';
import { Params } from '../../types/params.interface.ts';
import { AppError } from '../../server/utils/customErrors.ts';

@Service()
class DoctorsService {
  constructor(private doctorRepository: DoctorRepository) {}

  getDoctorById = async (id: string): Promise<Doctor | AppError> => {
    return this.doctorRepository.getDoctorById(id);
  };

  getDoctors = async (params: Params): Promise<Doctor[] | AppError> => {
    return this.doctorRepository.getDoctors(params);
  };
}

export default DoctorsService;
