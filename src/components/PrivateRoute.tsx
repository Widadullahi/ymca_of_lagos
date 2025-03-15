import React, { JSX} from 'react';
import Layout from './Layout';
import { useAuth } from '../context/NewAuthContext';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { authToken } = useAuth();

  console.log(authToken)
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
