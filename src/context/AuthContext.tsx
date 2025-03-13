// File: src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (user: Partial<User>, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => ({ id: '', firstName: '', lastName: '', email: '', registrationNumber: '' }),
  register: async () => ({ id: '', firstName: '', lastName: '', email: '', registrationNumber: '' }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    // In a real app, you would make an API call here
    // This is a mock implementation for demonstration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          setCurrentUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  // Register function
  const register = async (userData: Partial<User>, password: string): Promise<User> => {
    // In a real app, you would make an API call here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Get existing users or initialize empty array
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some((u: any) => u.email === userData.email)) {
          reject(new Error('Email already in use'));
          return;
        }
        
        // Generate unique ID and registration number
        const id = `user_${Date.now()}`;
        const registrationNumber = `LYA ${Math.floor(100 + Math.random() * 900)}`;
        
        // Create new user
        const newUser = {
          id,
          registrationNumber,
          registrationDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          ...userData,
          password
        };
        
        // Save user to "database"
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Return user without password
        const { password: _, ...userWithoutPassword } = newUser;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        resolve(userWithoutPassword);
      }, 500);
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


