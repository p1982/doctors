import AppointmentsService from '../../bll/appointment/appointment.service.ts';
import { Service } from 'typedi';
import express from 'express';
import { rolesValidation } from '../../server/middleware/roles.middleware.ts';
import { isAuthenticated } from '../../server/middleware/auth.middleware.ts';
import { Appointment } from '../../types/appointment.interface.ts';

@Service()
class AppointmentController {
  public path = '/appointments';
  public router = express.Router();

  constructor(private appointmentsService: AppointmentsService) {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.get('/:id', isAuthenticated, this.getAppointments);
    this.router.post('/', isAuthenticated, this.createAppointment);
    this.router.put('/:id', isAuthenticated, this.updateAppointment);
    this.router.delete(
      '/:id',
      isAuthenticated,
      rolesValidation(['admin', 'patient']),
      this.deleteAppointment,
    );
  }

  getAppointments = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    try {
      const patientId: string = request.params.id;
      const appointments =
        await this.appointmentsService.getAppointments(patientId);
      response.status(200).json(appointments);
    } catch (err) {
      console.error('Error creating appointment:', err);
      response.status(400).send((err as Error).message);
    }
  };

  deleteAppointment = async (
    request: express.Request,
    response: express.Response,
  ) => {
    try {
      const appointmentId: string = request.params.id;
      const message =
        await this.appointmentsService.deleteAppointment(appointmentId);
      response.status(200).json({ message });
    } catch (err) {
      console.error('Error creating appointment:', err);
      response.status(400).send((err as Error).message);
    }
  };

  updateAppointment = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    try {
      const appointment: Appointment = request.body;
      const updatedAppointment =
        await this.appointmentsService.updateAppointment(appointment);
      response.status(200).json(updatedAppointment);
    } catch (err) {
      console.error('Error creating appointment:', err);
      response.status(400).send((err as Error).message);
    }
  };

  createAppointment = async (
    request: express.Request,
    response: express.Response,
  ): Promise<void> => {
    try {
      const appointment: Appointment = request.body;
      const newAppointment =
        await this.appointmentsService.createAppointment(appointment);
      response.status(201).json(newAppointment);
    } catch (err) {
      console.error('Error creating appointment:', err);
      response.status(400).send((err as Error).message);
    }
  };
}

export default AppointmentController;
