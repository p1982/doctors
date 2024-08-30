export const createSchedulesTimeTable = `
CREATE TABLE IF NOT EXISTS schedules_time (
    id SERIAL PRIMARY KEY,
    doctor_id INT NOT NULL,
    schedule_id INT NOT NULL,
    date DATE,
    start_schedule TIME,
    end_schedule TIME,
    is_available BOOLEAN default true,
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id)
);
`;

export const createUpdateUpdatedAtFunction = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;

export const createSchedulesTimeUpdatedAtTrigger = `
CREATE TRIGGER update_schedules_time_updated_at
BEFORE UPDATE ON schedules_time
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
`;

export const dropSchedulesTimeTable = `
DROP TABLE IF EXISTS schedules_time CASCADE;
`;
