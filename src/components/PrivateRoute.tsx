import React, { JSX} from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

interface PrivateRouteProps {
  element: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  // const { currentUser, setCurrentUser } = useAuth();
  
  // // Optional: You can handle setting the current user in case it's null
  // useEffect(() => {
  //   const storedUser = localStorage.getItem('user');
  //   console.log(storedUser)
  //   if (storedUser && !currentUser) {
  //     setCurrentUser(JSON.parse(storedUser));
  //   }
  // }, [currentUser, setCurrentUser]);

  // console.log(currentUser)
  // console.log(currentUser)
  // console.log(currentUser)
  // // If no user is found in the context, redirect to login
  // if (!currentUser) {
  //   return <Navigate to="/login" />;
  // }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {element}
      </div>
    </Layout>
  );
};

export default PrivateRoute;
