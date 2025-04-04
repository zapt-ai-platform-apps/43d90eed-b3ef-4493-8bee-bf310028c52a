import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes';

const AppRoot = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default AppRoot;