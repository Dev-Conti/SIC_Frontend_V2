import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthorizedEmails from '../hooks/useAuthorizedEmails';

const ProtectedRoute = ({ children }) => {
  const authorizedEmails = useAuthorizedEmails();
  const userEmail = localStorage.getItem('userEmail'); // Assuming user email is stored in localStorage

  return authorizedEmails.includes(userEmail) ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;