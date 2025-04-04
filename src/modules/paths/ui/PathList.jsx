import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api as pathsApi } from '../api';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import { formatDistance, formatDate, formatDuration } from '@/shared/utils/formatters';
import * as Sentry from '@sentry/browser';

const PathList = () => {
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadPaths();
    
    const unsubscribeCompleted = pathsApi.onRecordingCompleted(() => {
      loadPaths();
    });
    
    const unsubscribeDeleted = pathsApi.onPathDeleted(({ id }) => {
      setPaths(current => current.filter(path => path.id !== id));
    });
    
    return () => {
      unsubscribeCompleted();
      unsubscribeDeleted();
    };
  }, []);
  
  const loadPaths = async () => {
    setIsLoading(true);
    try {
      const allPaths = await pathsApi.getAllPaths();
      setPaths(allPaths.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    } catch (error) {
      console.error('Failed to load paths:', error);
      Sentry.captureException(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeletePath = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this path?')) {
      try {
        await pathsApi.deletePath(id);
        // The path will be removed from the list via the onPathDeleted event
      } catch (error) {
        console.error('Failed to delete path:', error);
        Sentry.captureException(error);
      }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="mt-4 text-gray-600">Loading your saved paths...</p>
      </Card>
    );
  }
  
  if (paths.length === 0) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-xl font-medium text-gray-900 mb-2">No Saved Paths</h3>
        <p className="text-gray-600 mb-4">
          You haven't recorded any paths yet. Record your first path to see it here.
        </p>
        <Link to="/record" className="inline-block">
          <Button variant="primary" className="cursor-pointer">Record a Path</Button>
        </Link>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Your Saved Paths</h2>
      
      {paths.map(path => (
        <Link 
          to={`/path/${path.id}`} 
          key={path.id}
          className="block"
        >
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-lg text-gray-900">{path.name}</h3>
                <div className="text-sm text-gray-500">
                  {formatDate(path.startTime)}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatDistance(path.totalDistance)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDuration(path.duration)}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                {path.points.length} points
              </div>
              
              <Button
                variant="danger"
                size="sm"
                className="cursor-pointer"
                onClick={(e) => handleDeletePath(path.id, e)}
              >
                Delete
              </Button>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default PathList;