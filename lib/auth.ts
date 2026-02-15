// Authentication and Authorization utilities

export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

// Role permissions
export const PERMISSIONS = {
  admin: {
    products: { create: true, read: true, update: true, delete: true },
    suppliers: { create: true, read: true, update: true, delete: true },
    categories: { create: true, read: true, update: true, delete: true },
    transactions: { create: true, read: true, update: true, delete: true },
    analytics: { read: true },
    users: { create: true, read: true, update: true, delete: true },
  },
  manager: {
    products: { create: true, read: true, update: true, delete: false },
    suppliers: { create: true, read: true, update: true, delete: false },
    categories: { create: true, read: true, update: true, delete: false },
    transactions: { create: true, read: true, update: false, delete: false },
    analytics: { read: true },
    users: { create: false, read: true, update: false, delete: false },
  },
  viewer: {
    products: { create: false, read: true, update: false, delete: false },
    suppliers: { create: false, read: true, update: false, delete: false },
    categories: { create: false, read: true, update: false, delete: false },
    transactions: { create: false, read: true, update: false, delete: false },
    analytics: { read: true },
    users: { create: false, read: false, update: false, delete: false },
  },
};

export const hasPermission = (
  role: UserRole,
  resource: keyof typeof PERMISSIONS.admin,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean => {
  const rolePermissions = PERMISSIONS[role];
  const resourcePermissions = rolePermissions[resource] as Record<string, boolean>;
  
  return resourcePermissions[action] ?? false;
};

// Storage keys for auth
export const AUTH_STORAGE_KEY = 'inventory_auth_session';
export const USERS_STORAGE_KEY = 'inventory_users';

// Default admin user (for demo purposes)
export const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@inventory.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'manager',
    email: 'manager@inventory.com',
    role: 'manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'viewer',
    email: 'viewer@inventory.com',
    role: 'viewer',
    createdAt: new Date().toISOString(),
  },
];

// Default passwords (in production, these would be hashed)
export const DEFAULT_CREDENTIALS: Record<string, string> = {
  admin: 'admin123',
  manager: 'manager123',
  viewer: 'viewer123',
};

// Simple password storage (in production, use proper hashing like bcrypt)
export interface StoredCredentials {
  [username: string]: {
    passwordHash: string;
    userId: string;
  };
}

// Simple hash function (NOT for production - use bcrypt/argon2 in real apps)
export const simpleHash = (password: string): string => {
  return btoa(password); // Base64 encoding (NOT secure, for demo only)
};

// Verify password
export const verifyPassword = (password: string, hash: string): boolean => {
  return simpleHash(password) === hash;
};

// Generate a simple token
export const generateToken = (): string => {
  return btoa(Date.now().toString() + Math.random().toString());
};

// Check if session is valid
export const isSessionValid = (session: AuthSession): boolean => {
  return new Date(session.expiresAt) > new Date();
};

// Get session expiry (24 hours from now)
export const getSessionExpiry = (): string => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24);
  return expiry.toISOString();
};
