import React, { JSX } from 'react';
import Layout from './Layout';
import { useAuth } from '../context/NewAuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { authToken, globalLoading, user } = useAuth();
  const location = useLocation();

  console.log(authToken)

  // If we are still fetching the initial profile, don't redirect yet
  if (globalLoading && !authToken) {
    return <div>Loading credentials...</div>;
  }

  if (!authToken) {
    return <Navigate to="/login" />;
  }

  const needsProfileCompletion =
    user?.role === 'Member' && Boolean(user?.profile_completion_required);

  if (needsProfileCompletion && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  if (!needsProfileCompletion && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {element}
      </div>
    </Layout>
  );
};

export default PrivateRoute;
