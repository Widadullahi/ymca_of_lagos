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
    firstName: string;
    lastName: string;
    profileImage: string;
    signature: string;
    gender: 'Male' | 'Female' | 'Other';
    unit: 'Council of Church' | 'Youth Council' | "Y's Men" | 'Central Club';
    churchName?: string; // Only when unit is 'Council of Church'
    youthCouncilType?: 'Hi-Y' | 'Y-Elite'; // Only when unit is 'Youth Council'
    email: string;
    phoneNumber: string;
    category: 'Adult Member' | 'Youth Member' | 'Senior Member';
    status: 'Active' | 'Inactive' | 'On Leave';
    joinDate: string;
}
