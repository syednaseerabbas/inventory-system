'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasPermission } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  resource?: 'products' | 'suppliers' | 'categories' | 'transactions' | 'analytics' | 'users';
  action?: 'create' | 'read' | 'update' | 'delete';
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  resource, 
  action = 'read',
  fallback 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check permissions if resource and action are specified
  if (resource && !hasPermission(user.role, resource, action)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have permission to {action} {resource}.
          </p>
          <p className="text-sm text-muted-foreground">
            Your role: <span className="font-semibold capitalize">{user.role}</span>
          </p>
          {fallback}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
