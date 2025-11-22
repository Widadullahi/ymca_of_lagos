import React, { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UnauthenticatedRouteProps {
  element: JSX.Element;
}

const UnauthenticatedRoute: React.FC<UnauthenticatedRouteProps> = ({ element }) => {
  const { currentUser } = useAuth(); // Get user from context

  // If user is authenticated, redirect to home page
  if (currentUser) {
    return <Navigate to="/home" />;
  }

  // If user is not authenticated, render the login page
  return element;
};

export default UnauthenticatedRoute;
