import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api as pathsApi } from '../api';
import { api as mapsApi } from '@/modules/maps/api';
import { api as geoApi } from '@/modules/geolocation/api';
import Card from '@/shared/components/Card';
import Button from '@/shared/components/Button';
import { formatDistance, formatDate, formatDuration } from '@/shared/utils/formatters';
import 'leaflet/dist/leaflet.css';
import * as Sentry from '@sentry/browser';

const PathDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  
  useEffect(() => {
    const loadPath = async () => {
      setIsLoading(true);
      try {
        const pathData = await pathsApi.getPathById(id);
        if (!pathData) {
          console.error('Path not found:', id);
          navigate('/');
          return;
        }
        setPath(pathData);
        setEditForm({
          name: pathData.name,
          description: pathData.description
        });
      } catch (error) {
        console.error('Failed to load path:', error);
        Sentry.captureException(error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPath();
  }, [id, navigate]);
  
  useEffect(() => {
    // Initialize map when path data is loaded
    if (path && !isLoading && !mapInitialized) {
      try {
        const map = mapsApi.initializeMap('path-map', {
          zoomControl: true,
        });
        mapsApi.displayPath(path, true);
        setMapInitialized(true);
      } catch (error) {
        console.error('Error initializing map:', error);
        Sentry.captureException(error);
      }
      
      return () => {
        mapsApi.destroyMap();
      };
    }
  }, [path, isLoading, mapInitialized]);
  
  useEffect(() => {
    if (!isFollowing) return;
    
    // Set up position tracking when following the path
    let unsubscribePosition = null;
    
    const startFollowing = async () => {
      try {
        await geoApi.requestPermission();
        geoApi.startTracking();
        
        unsubscribePosition = geoApi.onPositionChange((position) => {
          mapsApi.updateCurrentPosition(position);
        });
      } catch (error) {
        console.error('Failed to start following:', error);
        Sentry.captureException(error);
        setIsFollowing(false);
      }
    };
    
    startFollowing();
    
    return () => {
      if (unsubscribePosition) {
        unsubscribePosition();
      }
      geoApi.stopTracking();
      mapsApi.clearLayers();
      if (path) {
        mapsApi.displayPath(path, true);
      }
    };
  }, [isFollowing, path]);
  
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedPath = await pathsApi.updatePathDetails(id, editForm);
      setPath(updatedPath);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update path:', error);
      Sentry.captureException(error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleFollow = () => {
    setIsFollowing(current => !current);
  };
  
  const handleDeletePath = async () => {
    if (window.confirm('Are you sure you want to delete this path?')) {
      try {
        await pathsApi.deletePath(id);
        navigate('/');
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
        <p className="mt-4 text-gray-600">Loading path details...</p>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {isEditing ? (
        <Card>
          <form onSubmit={handleSaveEdit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Path Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 box-border"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 box-border"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              ></textarea>
            </div>
            
            <div className="flex space-x-3">
              <Button type="submit" variant="primary" className="cursor-pointer" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" className="cursor-pointer" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{path.name}</h1>
              {path.description && (
                <p className="text-gray-600 mt-1">{path.description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-500">Distance</div>
              <div className="font-semibold">{formatDistance(path.totalDistance)}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-500">Duration</div>
              <div className="font-semibold">{formatDuration(path.duration)}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-500">Recorded</div>
              <div className="font-semibold">{formatDate(path.startTime)}</div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-center">
              <div className="text-sm text-gray-500">Points</div>
              <div className="font-semibold">{path.points.length}</div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <Button 
              variant={isFollowing ? 'success' : 'primary'} 
              className="flex-1 cursor-pointer"
              onClick={handleToggleFollow}
            >
              {isFollowing ? 'Stop Following' : 'Follow This Path'}
            </Button>
            
            <Button variant="danger" className="flex-1 cursor-pointer" onClick={handleDeletePath}>
              Delete Path
            </Button>
          </div>
        </Card>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div id="path-map" className="h-96 w-full"></div>
      </div>
    </div>
  );
};

export default PathDetails;