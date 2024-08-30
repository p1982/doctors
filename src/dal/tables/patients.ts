export const createPatientsTable = `
  CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    birthday DATE NOT NULL,
    gender VARCHAR(100)NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createPatientsUpdatedAtTrigger = `
  CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

export const dropPatientsTable = `
  DROP TABLE IF EXISTS patients CASCADE
`;
