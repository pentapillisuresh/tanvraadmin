import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth';

const PrivateRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl">Loading...</div>
    </div>;
  }

  return admin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;