'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthSession, DEFAULT_USERS, DEFAULT_CREDENTIALS, StoredCredentials } from '@/lib/auth';
import { storage } from '@/lib/storage';
import {
  AUTH_STORAGE_KEY,
  USERS_STORAGE_KEY,
  simpleHash,
  verifyPassword,
  generateToken,
  isSessionValid,
  getSessionExpiry,
} from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (username: string, email: string, password: string, role: User['role']) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize default users and credentials if not exists
    const users = storage.get<User[]>(USERS_STORAGE_KEY, []);
    if (users.length === 0) {
      storage.set(USERS_STORAGE_KEY, DEFAULT_USERS);
      
      // Initialize default credentials
      const credentials: StoredCredentials = {};
      Object.entries(DEFAULT_CREDENTIALS).forEach(([username, password]) => {
        const user = DEFAULT_USERS.find(u => u.username === username);
        if (user) {
          credentials[username] = {
            passwordHash: simpleHash(password),
            userId: user.id,
          };
        }
      });
      storage.set('inventory_credentials', credentials);
    }

    // Check for existing session
    const session = storage.get<AuthSession | null>(AUTH_STORAGE_KEY, null);
    if (session && isSessionValid(session)) {
      setUser(session.user);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const credentials = storage.get<StoredCredentials>('inventory_credentials', {});
    const userCredential = credentials[username];

    if (!userCredential) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!verifyPassword(password, userCredential.passwordHash)) {
      return { success: false, error: 'Invalid username or password' };
    }

    const users = storage.get<User[]>(USERS_STORAGE_KEY, []);
    const foundUser = users.find(u => u.id === userCredential.userId);

    if (!foundUser) {
      return { success: false, error: 'User not found' };
    }

    const session: AuthSession = {
      user: foundUser,
      token: generateToken(),
      expiresAt: getSessionExpiry(),
    };

    storage.set(AUTH_STORAGE_KEY, session);
    setUser(foundUser);

    return { success: true };
  };

  const logout = () => {
    storage.remove(AUTH_STORAGE_KEY);
    setUser(null);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role: User['role']
  ): Promise<{ success: boolean; error?: string }> => {
    const users = storage.get<User[]>(USERS_STORAGE_KEY, []);
    const credentials = storage.get<StoredCredentials>('inventory_credentials', {});

    // Check if username already exists
    if (credentials[username]) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email already exists
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now().toString(),
      username,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    // Store user
    users.push(newUser);
    storage.set(USERS_STORAGE_KEY, users);

    // Store credentials
    credentials[username] = {
      passwordHash: simpleHash(password),
      userId: newUser.id,
    };
    storage.set('inventory_credentials', credentials);

    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
