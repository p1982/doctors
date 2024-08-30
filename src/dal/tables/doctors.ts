export const createDoctorsTable = `
  CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialization VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

export const createDoctorsUpdatedAtTrigger = `
  CREATE TRIGGER update_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

export const dropDoctorsTable = `
  DROP TABLE IF EXISTS doctors CASCADE
`;
