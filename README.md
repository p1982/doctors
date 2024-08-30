# Personal Projects

**Hospital Appointment Scheduler**
## Table of Contents

- [Introduction](#introduction)
- [SQL diagram for projectures](#SQL-diagram-for-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Doctors](#doctors)
  - [Patients](#patients)
  - [Appointments](#appointments)
- [Appointment Scheduling Logic](#appointment-scheduling-logic)
- [Usage](#usage)


##Introduction

**Hospital Appointment Scheduler Documentation**

The Hospital Appointment Scheduler is a web application built using TypeScript, Express, and PostgreSQL. It allows patients to register, log in, view doctors, and manage their appointments. The application provides secure authentication and authorization to ensure that only authenticated patients can perform certain actions.
The system consider doctor availability, patient load, and appointment duration.


## SQL diagram for project
![](https://res.cloudinary.com/dkdsf8hw3/image/upload/v1721829864/diagrama_ianwec.png)


## Features
- Patient registration and authentication
- Doctor listing and specialization-based search
- Appointment scheduling and updating
- Patient-specific appointment retrieval
- Appointment cancellation
- Role-based access control


## Technologies Used
- Node.js
- Express.js
- TypeScript
- PostgreSQL
- bcryptjs (for password hashing)

**Description**
This application manages a hospital appointment scheduling system with functionalities to add, update, delete, and retrieve information about appointments. Can get information about doctors, schedules

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/p1982/Hospital-Appointment-Scheduler
    cd hospital-appointment-scheduler
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables (see [Environment Variables](#environment-variables)).

4. Initialize the database and seed data:
    ```sh
    npm run seed
    ```

5. Start the server:
    ```sh
    npm run dev 
    ```

## Environment Variables

`env` file is in config folder. The following variables:

```env
PORT=8000
HOST=localhost
DATABASE_URL=postgresql://username:password@localhost:5432/yourdatabase
SECRET_KEY=your_jwt_secret_key
```


## Database Schema
The database schema includes the following tables:

patients
doctors
appointments
schedules
schedules_time
medical_cards
Refer to the src/dal/tables/index.ts for table definitions.


## API Endpoints
Authentication
Register a patient

```sh
POST /auth/register
Request Body: { "email": "string", "password": "string", "fullName": "string" }
Login
```

```sh
POST /auth/login
Request Body: { "email": "string", "password": "string" }
```

Doctors
Get all doctors

```sh
GET /api/doctors
Get doctor by ID
```

```sh
GET /api/doctors/:id
Authorization: Bearer Token
```

Get doctors by specialization

```sh
GET /api/doctors?specialization=specialization_name
Authorization: Bearer Token
```

Patients
Get patient by ID

```sh
GET /api/patients/:id
Authorization: Bearer Token
```

Appointments
Create an appointment

```sh
POST /api/appointments
Authorization: Bearer Token
Request Body: { "patientId": "number", "doctorId": "number", "appointmentDate": "YYYY-MM-DD", "time": "HH:MM:SS", "reason": "string" }
```

Update an appointment

```sh
PUT /api/appointments/:id
Authorization: Bearer Token
Request Body: { "patientId": "number", "doctorId": "number", "appointmentDate": "YYYY-MM-DD", "time": "HH:MM:SS", "reason": "string", "status": "string" }
```

Get appointments by patient I

```sh
GET /api/appointments?patientId=number
Authorization: Bearer Token
```

Delete an appointment

```sh
DELETE /api/appointments/:id
Authorization: Bearer Token
```

## Appointment Scheduling Logic
The system considers doctor availability, patient load, and appointment duration. When creating or updating an appointment, it:

Checks the schedules_time table for availability.
Ensures the doctor has not exceeded the maximum number of appointments per day.
Updates the schedules_time table to mark the slot as unavailable.

## Usage
To use the Hospital Appointment Scheduler:

Register as a patient using the /auth/register endpoint.
Log in to receive a JWT token.
Use the token to access protected endpoints and manage appointments.
