import DoctorsService from '../../bll/doctors/doctors.service.ts';
import { Service } from 'typedi';
import express from 'express';
import { rolesValidation } from '../../server/middleware/roles.middleware.ts';
import { isAuthenticated } from '../../server/middleware/auth.middleware.ts';
import { AppError, HttpCode } from '../../server/utils/customErrors.ts';

@Service()
class DoctorController {
  public path = '/doctors';
  public router = express.Router();

  constructor(private doctorsService: DoctorsService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/', this.getDoctors);
    this.router.get(
      '/:id',
      isAuthenticated,
      rolesValidation(['admin', 'patient', 'doctor']),
      this.getDoctorById,
    );
  }

  getDoctors = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    try {
      const params = {
        size: request.query.size ? Number(request.query.size) : null,
        page: request.query.page ? Number(request.query.page) : null,
        filter: { specialization: request.query.specialization || null },
      };
      const doctors = await this.doctorsService.getDoctors(params);
      response.status(HttpCode.OK).json(doctors);
    } catch (error) {
      console.error('Error retrieving doctors:', error);
      response.status(HttpCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to retrieve doctors',
        error: (error as Error).message,
      });
    }
  };

  getDoctorById = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    try {
      const id = request.params.id;
      const doctor = await this.doctorsService.getDoctorById(id);

      if (!doctor) {
        throw new AppError({
          message: 'Doctor not found',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      response.status(HttpCode.OK).json(doctor);
    } catch (error) {
      console.error('Error retrieving doctor by ID:', error);
      if (error instanceof AppError) {
        response.status(error.httpCode).json({ message: error.message });
      } else {
        response.status(HttpCode.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to retrieve doctor',
          error: (error as Error).message,
        });
      }
    }
  };
}

export default DoctorController;
