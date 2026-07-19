import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, refreshSession } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (!isAuthenticated) {
        await refreshSession();
      }
      setChecking(false);
    };
    verifySession();
  }, [isAuthenticated, refreshSession]);

  if (checking) {
    return (
      <div className="min-h-screen bg-neutral-950 flex justify-center items-center">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};
