import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children, title, showBackButton = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          {showBackButton && (
            <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          <div className="ml-auto">
            <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500">
              Made on ZAPT
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;