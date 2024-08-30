export const createSchedulesTable = `
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    doctor_id INT,
    available_date DATE,
    start_appointment TIME,
    end_appointment TIME,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(id)
);
`;

export const createSchedulesUpdatedAtTrigger = `
  CREATE TRIGGER update_schedules_updated_at
  BEFORE UPDATE ON schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

export const dropSchedulesTable = `
  DROP TABLE IF EXISTS schudules CASCADE
`;
