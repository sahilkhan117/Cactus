import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#101411] flex items-center justify-center text-[#00E5FF]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin"></div>
          <span className="text-xs uppercase tracking-widest font-bold">Syncing Oasis Protocol...</span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
