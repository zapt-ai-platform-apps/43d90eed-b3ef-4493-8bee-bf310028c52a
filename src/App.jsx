import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './app/routes';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;