import DatabaseClient from '../client.ts';
import { dbConfig } from '../../config/index.ts';
import axios from 'axios';
import bcrypt from 'bcryptjs';

const dbClient = new DatabaseClient(dbConfig);

const fillSchedulesTimeTable = async (
  doctorId: number,
  scheduleId: number,
  date: string,
  startTime: string,
  endTime: string,
) => {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

  const intervals = [];
  while (start < end) {
    const endInterval = new Date(start.getTime() + 30 * 60000);
    if (endInterval > end) break;

    intervals.push({
      doctor_id: doctorId,
      schedule_id: scheduleId,
      date,
      start_schedule: start.toTimeString().split(' ')[0],
      end_schedule: endInterval.toTimeString().split(' ')[0],
      is_available: true,
    });

    start.setTime(start.getTime() + 30 * 60000);
  }

  const queryText = `
    INSERT INTO schedules_time (doctor_id, schedule_id, date, start_schedule, end_schedule, is_available)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  try {
    for (const interval of intervals) {
      const values = [
        interval.doctor_id,
        interval.schedule_id,
        interval.date,
        interval.start_schedule,
        interval.end_schedule,
        interval.is_available,
      ];
      await dbClient.query(queryText, values);
    }
    console.log(
      `Time slots for doctor ID ${doctorId} on date ${date} created successfully`,
    );
  } catch (err) {
    console.error(`Error creating time slots for doctor ID ${doctorId}:`, err);
    throw err;
  }
};

const createWeeklySchedule = async (doctorId: number) => {
  const daysOfWeek = 7;
  const today = new Date();
  const schedules = [];

  for (let i = 0; i < daysOfWeek; i++) {
    const availableDate = new Date(today);
    availableDate.setDate(today.getDate() + i);
    const dayOfWeek = availableDate.getDay();

    if (dayOfWeek === 6 || dayOfWeek === 0) {
      continue;
    }

    let startAppointment: string;
    let endAppointment: string;

    if (doctorId % 2 === 0) {
      if (i % 2 === 0) {
        startAppointment = '14:00:00';
        endAppointment = '19:00:00';
      } else {
        startAppointment = '09:00:00';
        endAppointment = '13:00:00';
      }
    } else {
      if (i % 2 === 0) {
        startAppointment = '09:00:00';
        endAppointment = '13:00:00';
      } else {
        startAppointment = '14:00:00';
        endAppointment = '19:00:00';
      }
    }

    schedules.push({
      doctor_id: doctorId,
      available_date: availableDate.toISOString().split('T')[0],
      start_appointment: startAppointment,
      end_appointment: endAppointment,
      is_available: true,
    });
  }

  const queryText = `
    INSERT INTO schedules (doctor_id, available_date, start_appointment, end_appointment)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;

  try {
    for (const schedule of schedules) {
      const values = [
        schedule.doctor_id,
        schedule.available_date,
        schedule.start_appointment,
        schedule.end_appointment,
      ];
      const result = await dbClient.query(queryText, values);
      const scheduleId = result.rows[0].id;
      await fillSchedulesTimeTable(
        schedule.doctor_id,
        scheduleId,
        schedule.available_date,
        schedule.start_appointment,
        schedule.end_appointment,
      );
    }
    console.log(`Schedules for doctor ID ${doctorId} created successfully`);
  } catch (err) {
    console.error(`Error creating schedules for doctor ID ${doctorId}:`, err);
    throw err;
  }
};

const fetchAndCreateDoctors = async () => {
  try {
    await dbClient.query('DELETE FROM doctors');
    const response = await axios.get('https://randomuser.me/api/', {
      params: { results: 50, nat: 'EN' },
    });

    const doctorsData = response.data.results;
    const specializations = [
      'Cardiology',
      'Neurology',
      'Dermatology',
      'Oncology',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Gastroenterology',
      'Endocrinology',
      'Rheumatology',
      'Hematology',
      'Nephrology',
      'Pulmonology',
      'Urology',
      'Allergology',
    ];

    const doctorIds: number[] = [];

    const insertPromises = doctorsData.map((user: any, index: number) => {
      const specialization = specializations[index % specializations.length];
      const passwordHash = bcrypt.hashSync(
        user.login.password,
        bcrypt.genSaltSync(10),
      );

      const queryText = `
        INSERT INTO doctors (first_name, last_name, specialization, contact_number, email, password, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `;

      const values = [
        user.name.first,
        user.name.last,
        specialization,
        user.phone,
        user.email,
        passwordHash,
        'doctor',
      ];

      return dbClient.query(queryText, values).then(res => {
        doctorIds.push(res.rows[0].id);
      });
    });
    await Promise.all(insertPromises);
    for (const doctorId of doctorIds) {
      await createWeeklySchedule(doctorId);
    }
  } catch (err) {
    console.log(err);
  }
};

export const seedDatabase = async () => {
  try {
    await dbClient.query('BEGIN');
    console.log('Removed all doctors');
    await fetchAndCreateDoctors();
    await dbClient.query(`
      INSERT INTO patients (first_name, last_name, birthday, gender, contact_number, email, address, password, role)
      VALUES
      ('John', 'Doe', '1980-01-01', 'male', '1234567890', 'john.doe@example.com', '123 Main St', 'hashed_password_1', 'patient'),
      ('Jane', 'Smith', '1990-02-02', 'female', '0987654321', 'jane.smith@example.com', '456 Elm St', 'hashed_password_2', 'patient');
    `);

    await dbClient.query(`
      INSERT INTO appointments (appointment_date, time, doctor_id, patient_id, reason, status)
      VALUES 
      ('2023-07-10', '2023-07-10 09:00:00', 1, 1, 'Routine checkup', 'scheduled'),
      ('2023-07-11', '2023-07-11 10:00:00', 2, 2, 'Follow-up visit', 'completed');
    `);

    await dbClient.query(`
      INSERT INTO medical_cards (diagnosis, treatment, notes, patient_id, appointment_id)
      VALUES 
      ('Hypertension', 'Medication', 'Patient needs regular checkups', 1, 1),
      ('Migraine', 'Painkillers', 'Avoid stress and monitor symptoms', 2, 2);
    `);

    await dbClient.query('COMMIT');
    console.log('Database seeded successfully');
  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('Error seeding database:', error);
  }
};

// (async function () {
//   await main();
//   await seedDatabase();
// })();
