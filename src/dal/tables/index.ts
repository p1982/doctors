import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';
import {
  createPatientsTable,
  createPatientsUpdatedAtTrigger,
  dropPatientsTable,
} from './patients.ts';
import {
  createDoctorsTable,
  createDoctorsUpdatedAtTrigger,
  dropDoctorsTable,
} from './doctors.ts';
import {
  createAppointmentsTable,
  createAppointmentsUpdatedAtTrigger,
  dropAppointmentsTable,
} from './appointments.ts';
import {
  createSchedulesTable,
  createSchedulesUpdatedAtTrigger,
  dropSchedulesTable,
} from './schedule.ts';
import {
  createMedicalCardsTable,
  createMedicalCardsUpdatedAtTrigger,
  dropMedicalCardsTable,
} from './medicalCard.ts';
import {
  createSchedulesTimeTable,
  createSchedulesTimeUpdatedAtTrigger,
  createUpdateUpdatedAtFunction,
  dropSchedulesTimeTable,
} from './schedules_time.ts';

const dbClient = new DatabaseClient(dbConfig);

const createUpdatedAtTriggerFunction = `
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

export async function main() {
  try {
    // Удаление таблиц
    await dbClient.query(dropDoctorsTable);
    await dbClient.query(dropPatientsTable);
    await dbClient.query(dropAppointmentsTable);
    await dbClient.query(dropMedicalCardsTable);
    await dbClient.query(dropSchedulesTable);
    await dbClient.query(dropSchedulesTimeTable);

    await dbClient.query(createPatientsTable);
    await dbClient.query(createDoctorsTable);
    await dbClient.query(createAppointmentsTable);
    await dbClient.query(createSchedulesTable);
    await dbClient.query(createMedicalCardsTable);
    await dbClient.query(createSchedulesTimeTable);

    await dbClient.query(createUpdatedAtTriggerFunction);
    await dbClient.query(createPatientsUpdatedAtTrigger);
    await dbClient.query(createDoctorsUpdatedAtTrigger);
    await dbClient.query(createAppointmentsUpdatedAtTrigger);
    await dbClient.query(createSchedulesUpdatedAtTrigger);
    await dbClient.query(createUpdateUpdatedAtFunction);
    await dbClient.query(createSchedulesTimeUpdatedAtTrigger);
    await dbClient.query(createMedicalCardsUpdatedAtTrigger);

    console.log('Tables created successfully');
  } catch (err) {
    console.error('Database operation failed:', err);
  }
}

export async function checkIfTablesExist(): Promise<boolean> {
  try {
    const result = await dbClient.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN (
          'patients', 
          'doctors', 
          'appointments', 
          'medical_cards', 
          'schedules',
          'schedules_time'
        )
      ) AS "exists";
    `);

    // Если хотя бы одна из таблиц существует, возвращаем true
    return result.rows[0].exists;
  } catch (err) {
    console.error('Error checking for existing tables:', err);
    throw err;
  }
}
