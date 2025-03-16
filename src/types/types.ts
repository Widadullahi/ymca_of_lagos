// types/index.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber: string;
  category: string;
  registrationEndDate: string;
  photo?: string;
  signature?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}


// Updated Types
export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  image: string;
  signature: string;
  gender: 'Male' | 'Female' | 'Other';
  unit: 'Council of Church' | 'Youth Council' | "Y's Men" | 'Central Club';
  church?: any; 
  youth_council_group?: any;
  email: string;
  phone_number: string;
  category: any;
  is_active: boolean;
  created_at: any;
}


export interface PasswordReset {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}