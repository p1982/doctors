export const createMedicalCardsTable = `
    CREATE TABLE IF NOT EXISTS medical_cards (
    id SERIAL PRIMARY KEY,
    patient_id INT,
    appointment_id INT,
    diagnosis TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);
`;

export const createMedicalCardsUpdatedAtTrigger = `
  CREATE TRIGGER update_medical_cards_updated_at
  BEFORE UPDATE ON medical_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

export const dropMedicalCardsTable = `
  DROP TABLE IF EXISTS medical_cards CASCADE
`;
