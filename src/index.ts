import 'reflect-metadata';
import App from './server/app.ts';
import { Container } from 'typedi';
import config from './config/index.ts';
import AuthController from './server/auth/auth.controller.ts';
import DoctorController from './server/doctors/doctors.controller.ts';
import AppointmentController from './server/appointment/appointment.controller.ts';
import TestController from './server/test/test.controller.ts';
import { checkIfTablesExist, main } from './dal/tables/index.ts';
import { seedDatabase } from './dal/seeds/index.ts';

const PORT = config.get('PORT');
const HOST = config.get('HOST');

const init = async (PORT: number, HOST: string) => {
  const tablesExist = await checkIfTablesExist();

  if (!tablesExist) {
    console.log('No tables found, initializing database...');
    await main();
    await seedDatabase();
  }
  const app = await new App(
    [
      Container.get(AuthController),
      Container.get(DoctorController),
      Container.get(AppointmentController),
      Container.get(TestController),
    ],
    PORT,
    HOST,
  );
  app.listen();
};

init(PORT, HOST);
