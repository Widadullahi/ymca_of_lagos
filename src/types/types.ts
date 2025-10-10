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


// User Request interface for detailed information
export interface UserRequest {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  citizen: string;
  country: string;
  state: string;
  lga: string;
  unit: string;
  club: string;
  age: number;
  gender: 'Male' | 'Female';
  date_of_birth: string;
  place_of_birth: string;
  home_address: string;
  office_address: string;
  profession: string;
  religion: string;
  church_name: string;
  occupation: string;
  marital_status: string;
  valid_id_number: string;
  passport_photo: string;
  valid_id_file: string;
  next_of_kin: string;
  referral_source: string;
  referral_name: string;
  referred_by: string;
  address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Updated Types
export interface Member {
  status_display: string;
  address: string;
  valid_id_type: string;
  valid_id_number: string;
  passport_photo: any;
  status: string;
  profession: string;
  religion: string;
  was_referred: boolean;
  referrer_name: string;
  next_of_kin_phone: string;
  next_of_kin_name: string;
  academic_qualification: string;
  denomination: string;
  nationality: string;
  state_of_origin: string;
  office_address: string;
  home_address: string;
  date_of_birth: string;
  marital_status: string;
  other_names: string;
  membership_category: string;
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
  updated_at: any;
  user_request?: UserRequest | null;
  [key: string]: any;
}


export interface PasswordReset {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}