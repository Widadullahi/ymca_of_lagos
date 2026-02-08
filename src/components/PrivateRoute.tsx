import React, { JSX } from 'react';
import Layout from './Layout';
import { useAuth } from '../context/NewAuthContext';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { authToken, globalLoading } = useAuth();

  console.log(authToken)

  // If we are still fetching the initial profile, don't redirect yet
  if (globalLoading && !authToken) {
    return <div>Loading credentials...</div>;
  }

  if (!authToken) {
    return <Navigate to="/login" />;
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
