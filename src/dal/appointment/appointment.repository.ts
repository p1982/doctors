import { Appointment } from '../../types/appointment.interface.ts';
import { Service } from 'typedi';
import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';
import { AppError, HttpCode } from '../../server/utils/customErrors.ts';

@Service()
class AppointmentRepository {
  private dbClient: DatabaseClient;

  constructor() {
    this.dbClient = new DatabaseClient(dbConfig);
  }

  createAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment | AppError> => {
    const queryText = `
      INSERT INTO appointments (patient_id, doctor_id, appointment_date, reason, time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
                reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
    `;

    const values = [
      appointment.patientId,
      appointment.doctorId,
      appointment.appointmentDate,
      appointment.reason,
      appointment.time,
      appointment.status,
    ];

    try {
      await this.dbClient.query('BEGIN');

      const checkAvailabilityQuery = `
        SELECT id FROM schedules_time 
        WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3 AND is_available = TRUE
        FOR UPDATE;
      `;
      const checkAvailabilityValues = [
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.time,
      ];

      const availabilityResult = await this.dbClient.query(
        checkAvailabilityQuery,
        checkAvailabilityValues,
      );

      if (availabilityResult.rows.length === 0) {
        throw new AppError({
          message: 'The time slot is not available',
          httpCode: HttpCode.BAD_REQUEST,
        });
      }

      const result = await this.dbClient.query(queryText, values);
      if (result.rows.length > 0) {
        const appointmentData = result.rows[0];
        const patientId = appointmentData.patientId;
        const doctorId = appointmentData.doctorId;

        const patientQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email FROM patients WHERE id = $1`;
        const doctorQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email, specialization FROM doctors WHERE id = $1`;

        const patientResult = await this.dbClient.query(patientQuery, [
          patientId,
        ]);
        const doctorResult = await this.dbClient.query(doctorQuery, [doctorId]);

        const patientData =
          patientResult.rows.length > 0 ? patientResult.rows[0] : null;
        const doctorData =
          doctorResult.rows.length > 0 ? doctorResult.rows[0] : null;

        const scheduleTimeId = availabilityResult.rows[0].id;
        const updateScheduleTimeQuery = `
          UPDATE schedules_time
          SET is_available = FALSE, updated_at = NOW()
          WHERE id = $1;
        `;
        await this.dbClient.query(updateScheduleTimeQuery, [scheduleTimeId]);

        await this.dbClient.query('COMMIT');

        return {
          ...appointmentData,
          patient: patientData,
          doctor: doctorData,
        };
      } else {
        throw new AppError({
          message: 'Appointment not created',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    } catch (err) {
      await this.dbClient.query('ROLLBACK');
      if (err instanceof AppError) {
        throw err; // Re-throw known errors
      } else {
        throw new AppError({
          message: 'Error creating appointment',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    }
  };

  updateAppointment = async (
    appointment: Appointment,
  ): Promise<Appointment | AppError> => {
    const queryText = `
      UPDATE appointments
      SET patient_id = $1, doctor_id = $2, appointment_date = $3, reason = $4, time = $5, status = $6
      WHERE id = $7
      RETURNING id, patient_id AS "patientId", doctor_id AS "doctorId", appointment_date AS "appointmentDate",
                reason, time, status, created_at AS "createdAt", updated_at AS "updatedAt";
    `;

    const values = [
      appointment.patientId,
      appointment.doctorId,
      appointment.appointmentDate,
      appointment.reason,
      appointment.time,
      appointment.status,
      appointment.id,
    ];

    try {
      await this.dbClient.query('BEGIN');

      // Lock the appointment record to prevent changes during the transaction
      const checkAppointmentQuery = `SELECT * FROM appointments WHERE id = $1 FOR UPDATE;`;
      const checkAppointmentResult = await this.dbClient.query(
        checkAppointmentQuery,
        [appointment.id],
      );

      if (checkAppointmentResult.rows.length === 0) {
        throw new AppError({
          message: 'Appointment not found',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      const originalAppointment = checkAppointmentResult.rows[0];

      // Free the old slot
      const freeOldSlotQuery = `
        UPDATE schedules_time
        SET is_available = TRUE
        WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3;
      `;
      await this.dbClient.query(freeOldSlotQuery, [
        originalAppointment.doctor_id,
        originalAppointment.appointment_date,
        originalAppointment.time,
      ]);

      // Check if the new slot is available
      const checkAvailabilityQuery = `
        SELECT id FROM schedules_time 
        WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3 AND is_available = TRUE
        FOR UPDATE;
      `;
      const checkAvailabilityValues = [
        appointment.doctorId,
        appointment.appointmentDate,
        appointment.time,
      ];

      const availabilityResult = await this.dbClient.query(
        checkAvailabilityQuery,
        checkAvailabilityValues,
      );

      if (availabilityResult.rows.length === 0) {
        throw new AppError({
          message: 'The time slot is not available',
          httpCode: HttpCode.BAD_REQUEST,
        });
      }

      // Update the appointment
      const result = await this.dbClient.query(queryText, values);

      if (result.rows.length > 0) {
        const appointmentData = result.rows[0];
        const patientId = appointmentData.patientId;
        const doctorId = appointmentData.doctorId;

        const patientQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email FROM patients WHERE id = $1`;
        const doctorQuery = `SELECT id, first_name AS "firstName", last_name AS "lastName", email, specialization FROM doctors WHERE id = $1`;

        const patientResult = await this.dbClient.query(patientQuery, [
          patientId,
        ]);
        const doctorResult = await this.dbClient.query(doctorQuery, [doctorId]);

        const patientData =
          patientResult.rows.length > 0 ? patientResult.rows[0] : null;
        const doctorData =
          doctorResult.rows.length > 0 ? doctorResult.rows[0] : null;

        // Reserve the new slot
        const scheduleTimeId = availabilityResult.rows[0].id;
        const updateScheduleTimeQuery = `
          UPDATE schedules_time
          SET is_available = FALSE
          WHERE id = $1;
        `;
        await this.dbClient.query(updateScheduleTimeQuery, [scheduleTimeId]);

        await this.dbClient.query('COMMIT');

        return {
          ...appointmentData,
          patient: patientData,
          doctor: doctorData,
        };
      } else {
        throw new AppError({
          message: 'Appointment not updated',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    } catch (err) {
      await this.dbClient.query('ROLLBACK');
      if (err instanceof AppError) {
        throw err; // Re-throw known errors
      } else {
        throw new AppError({
          message: 'Error updating appointment',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    }
  };

  deleteAppointment = async (id: string): Promise<string | AppError> => {
    const queryText = `DELETE FROM appointments WHERE id = $1 RETURNING id, doctor_id, appointment_date AS date, time`;

    try {
      await this.dbClient.query('BEGIN'); // Start transaction

      const result = await this.dbClient.query(queryText, [id]);

      if (result.rowCount === 0) {
        throw new AppError({
          message: 'Appointment not found',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      const { doctor_id, date, time } = result.rows[0];

      // Mark the corresponding slot as available in the schedules_time table
      const updateSlotQuery = `
        UPDATE schedules_time 
        SET is_available = TRUE 
        WHERE doctor_id = $1 AND date = $2 AND start_schedule <= $3 AND end_schedule > $3;
      `;

      await this.dbClient.query(updateSlotQuery, [doctor_id, date, time]);

      await this.dbClient.query('COMMIT'); // Commit transaction

      return `Appointment deleted successfully and doctor's slot is now available`;
    } catch (err) {
      await this.dbClient.query('ROLLBACK'); // Rollback transaction in case of error
      console.error('Error executing delete query:', err);
      if (err instanceof AppError) {
        throw err; // Re-throw known errors
      } else {
        throw new AppError({
          message: 'Error deleting appointment',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    }
  };

  getAppointments = async (
    patientId: string,
  ): Promise<Appointment[] | AppError> => {
    const queryText = `
      SELECT *
      FROM appointments
      WHERE patient_id = $1
    `;

    try {
      const result = await this.dbClient.query(queryText, [patientId]);

      if (result.rowCount === 0) {
        throw new AppError({
          message: 'No appointments found for this patient',
          httpCode: HttpCode.NOT_FOUND,
        });
      }

      return result.rows;
    } catch (err) {
      console.error('Error retrieving appointments:', err);
      if (err instanceof AppError) {
        throw err; // Re-throw known errors
      } else {
        throw new AppError({
          message: 'Error retrieving appointments',
          httpCode: HttpCode.INTERNAL_SERVER_ERROR,
        });
      }
    }
  };
}

export default AppointmentRepository;
