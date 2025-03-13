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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
