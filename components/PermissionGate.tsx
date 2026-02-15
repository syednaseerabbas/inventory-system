'use client';

import { useAuth } from '@/lib/AuthContext';
import { hasPermission } from '@/lib/auth';

interface PermissionGateProps {
  children: React.ReactNode;
  resource: 'products' | 'suppliers' | 'categories' | 'transactions' | 'analytics' | 'users';
  action: 'create' | 'read' | 'update' | 'delete';
  fallback?: React.ReactNode;
}

export default function PermissionGate({ children, resource, action, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();

  if (!user || !hasPermission(user.role, resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
