import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from './Layout';
import { useAuth } from '../context/NewAuthContext';

interface RoleBasedRouteProps {
  element: JSX.Element;
  requiredRole: string;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ element, requiredRole }) => {
  const { user, globalLoading } = useAuth();

  if (globalLoading && !user) {
    return <div>Verifying authorization...</div>;
  }

  if (!user || user.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <Layout>{element}</Layout>;;
};

export default RoleBasedRoute;
