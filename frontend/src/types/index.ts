export interface Admin {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AdminUserForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  password: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'inactive';
}

export interface LoginResponse {
  token: string;
  userId: string;
  fullName: string;
  role: 'admin' | 'super_admin';
}

export interface ApiError {
  error: string;
}

export interface BikeRider {
  _id: string;
  firstName: string;
  middleName: string;
  surname: string;
  phoneNumber: string;
  gender: 'Male' | 'Female';
  region: string;
  district: string;
  ward: string;
  village: string;
  bikeStation: string;
  bikeNumber: string;
  license: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type BikeRiderInput = Omit<BikeRider, '_id' | 'createdAt' | 'updatedAt'>;
