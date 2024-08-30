export interface User {
  id?: number;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthday: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  role?: string;
}

export interface RequestUser {
  id: number;
  email: string;
}
