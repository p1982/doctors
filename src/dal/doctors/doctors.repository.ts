import { Doctor } from '../../types/doctor.interface.ts';
import { Service } from 'typedi';
import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';
import { Params } from '../../types/params.interface.ts';
import { AppError, HttpCode } from '../../server/utils/customErrors.ts';

@Service()
class DoctorRepository {
  private dbClient: DatabaseClient;

  constructor() {
    this.dbClient = new DatabaseClient(dbConfig);
  }

  getDoctorById = async (id: string): Promise<Doctor | AppError> => {
    const queryText = `
      SELECT d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email, 
             json_agg(json_build_object(
               'date', st.date,
               'start_schedule', st.start_schedule,
               'end_schedule', st.end_schedule,
               'is_available', st.is_available
             )) as schedules
      FROM doctors d
      JOIN schedules_time st ON d.id = st.doctor_id
      WHERE d.id = $1
      GROUP BY d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email;
    `;

    try {
      const result = await this.dbClient.query(queryText, [id]);

      if (result.rows.length === 0) {
        throw new AppError({
          message: 'Doctor not found',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      return result.rows[0];
    } catch (err) {
      console.error('Error executing query:', err);
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError({
        message: 'Error retrieving doctor',
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      });
    }
  };

  getDoctors = async (params: Params): Promise<Doctor[] | AppError> => {
    try {
      const { size, page, filter } = params;
      const { specialization } = filter;

      let queryText = `
        SELECT d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email, 
               json_agg(json_build_object(
                 'available_date', s.available_date, 
                 'start_appointment', s.start_appointment, 
                 'end_appointment', s.end_appointment
               )) as schedules,
               COUNT(a.id) as appointment_count
        FROM doctors d
        LEFT JOIN schedules s ON d.id = s.doctor_id
        LEFT JOIN appointments a ON d.id = a.doctor_id
      `;

      const queryParams: any[] = [];

      if (specialization) {
        queryText += ' WHERE d.specialization = $1';
        queryParams.push(specialization);
      }

      queryText += `
        GROUP BY d.id, d.first_name, d.last_name, d.specialization, d.contact_number, d.email
        ORDER BY appointment_count ASC
        LIMIT 2
      `;

      if (size) {
        queryParams.push(size);
        queryText += ` LIMIT $${queryParams.length}`;
      }

      if (page) {
        queryParams.push((page - 1) * (size || 10));
        queryText += ` OFFSET $${queryParams.length}`;
      }

      const result = await this.dbClient.query(queryText, queryParams);

      if (result.rows.length === 0) {
        throw new AppError({
          message: 'No doctors found',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      return result.rows;
    } catch (err) {
      console.error('Error executing query:', err);
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError({
        message: 'Error retrieving doctors',
        httpCode: HttpCode.INTERNAL_SERVER_ERROR,
      });
    }
  };
}

export default DoctorRepository;
