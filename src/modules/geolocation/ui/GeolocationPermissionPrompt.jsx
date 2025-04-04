import React, { useState, useEffect } from 'react';
import { api as geoApi } from '../api';
import Button from '@/shared/components/Button';
import Card from '@/shared/components/Card';
import * as Sentry from '@sentry/browser';

const GeolocationPermissionPrompt = ({ onPermissionGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const unsubscribe = geoApi.onPermissionChange(({ granted }) => {
      setPermissionStatus(granted ? 'granted' : 'denied');
      if (granted && onPermissionGranted) {
        onPermissionGranted();
      }
    });
    
    return () => unsubscribe();
  }, [onPermissionGranted]);
  
  const handleRequestPermission = async () => {
    if (!geoApi.isSupported()) {
      setPermissionStatus('not-supported');
      return;
    }
    
    setIsLoading(true);
    try {
      const granted = await geoApi.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error requesting geolocation permission:', error);
      Sentry.captureException(error);
      setPermissionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (permissionStatus === 'granted') {
    return null; // Don't show anything if permission is granted
  }
  
  return (
    <Card className="mb-6 max-w-lg mx-auto">
      <div className="text-center p-4">
        <h2 className="text-xl font-semibold mb-4">Location Access Required</h2>
        
        {permissionStatus === 'not-supported' ? (
          <p className="text-red-600 mb-4">
            Geolocation is not supported by your browser. Please use a different browser or device.
          </p>
        ) : permissionStatus === 'denied' ? (
          <div>
            <p className="text-red-600 mb-4">
              Location access was denied. This app requires location access to record your path.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Please update your browser settings to allow location access for this site, then refresh the page.
            </p>
          </div>
        ) : permissionStatus === 'error' ? (
          <p className="text-red-600 mb-4">
            An error occurred while requesting location access. Please try again.
          </p>
        ) : (
          <p className="text-gray-600 mb-4">
            This app needs access to your location to record your travel path. Your location data will be stored only on your device.
          </p>
        )}
        
        {(permissionStatus === 'unknown' || permissionStatus === 'error') && (
          <Button
            onClick={handleRequestPermission}
            disabled={isLoading}
            className="w-full cursor-pointer"
          >
            {isLoading ? 'Requesting Access...' : 'Allow Location Access'}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GeolocationPermissionPrompt;