import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/shared/components/Layout';
import GeolocationPermissionPrompt from '@/modules/geolocation/ui/GeolocationPermissionPrompt';
import PathRecorder from '@/modules/paths/ui/PathRecorder';
import { api as geoApi } from '@/modules/geolocation/api';
import { api as pathsApi } from '@/modules/paths/api';
import { api as mapsApi } from '@/modules/maps/api';
import 'leaflet/dist/leaflet.css';

const RecordPathPage = () => {
  const navigate = useNavigate();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  useEffect(() => {
    // When recording is completed, navigate to view the recorded path
    const unsubscribe = pathsApi.onRecordingCompleted((path) => {
      navigate(`/path/${path.id}`);
    });
    
    return () => {
      unsubscribe();
      // Ensure tracking is stopped when leaving the page
      geoApi.stopTracking();
      mapsApi.destroyMap();
    };
  }, [navigate]);
  
  useEffect(() => {
    if (permissionGranted && !mapInitialized) {
      // Initialize map when permission is granted
      const map = mapsApi.initializeMap('record-map');
      setMapInitialized(true);
      
      // Start position tracking
      geoApi.startTracking();
      
      // Subscribe to position updates
      const unsubscribePosition = geoApi.onPositionChange((position) => {
        mapsApi.setCenter(position.latitude, position.longitude);
        mapsApi.updateCurrentPosition(position);
      });
      
      // Get initial position
      geoApi.getCurrentPosition()
        .then(position => {
          mapsApi.setCenter(position.latitude, position.longitude);
          mapsApi.updateCurrentPosition(position);
        })
        .catch(error => {
          console.error('Error getting current position:', error);
          Sentry.captureException(error);
        });
      
      return () => {
        unsubscribePosition();
      };
    }
  }, [permissionGranted, mapInitialized]);
  
  return (
    <Layout title="Record Path" showBackButton>
      <div className="space-y-6">
        <GeolocationPermissionPrompt 
          onPermissionGranted={() => setPermissionGranted(true)} 
        />
        
        {permissionGranted && (
          <>
            <PathRecorder />
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div id="record-map" className="h-96 w-full"></div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default RecordPathPage;