// This service handles access to device geolocation
import { eventBus } from '@/modules/core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

class GeolocationService {
  constructor() {
    this.watchId = null;
    this.lastPosition = null;
    this.isTracking = false;
    this.hasPermission = null; // null = unknown, true = granted, false = denied
  }

  // Check if geolocation is available in this browser
  isSupported() {
    return 'geolocation' in navigator;
  }

  // Request permission and get current position
  async requestPermission() {
    if (!this.isSupported()) {
      this.hasPermission = false;
      eventBus.publish(events.GEOLOCATION_ERROR, { 
        code: 'NOT_SUPPORTED', 
        message: 'Geolocation is not supported by this browser.' 
      });
      return false;
    }

    try {
      // Requesting the position will prompt for permission if not already granted
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
      
      this.hasPermission = true;
      eventBus.publish(events.GEOLOCATION_PERMISSION_CHANGE, { granted: true });
      return true;
    } catch (error) {
      this.hasPermission = false;
      eventBus.publish(events.GEOLOCATION_ERROR, {
        code: error.code,
        message: error.message
      });
      eventBus.publish(events.GEOLOCATION_PERMISSION_CHANGE, { granted: false });
      
      Sentry.captureException(error);
      return false;
    }
  }

  // Start tracking location
  startTracking(options = {}) {
    if (this.isTracking) return;
    
    if (!this.isSupported()) {
      eventBus.publish(events.GEOLOCATION_ERROR, { 
        code: 'NOT_SUPPORTED', 
        message: 'Geolocation is not supported by this browser.' 
      });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const trackingOptions = { ...defaultOptions, ...options };

    try {
      this.watchId = navigator.geolocation.watchPosition(
        this.handlePositionUpdate.bind(this),
        this.handlePositionError.bind(this),
        trackingOptions
      );
      
      this.isTracking = true;
      eventBus.publish(events.GEOLOCATION_TRACKING_STATUS_CHANGE, { isTracking: true });
      console.log('Geolocation tracking started');
    } catch (error) {
      eventBus.publish(events.GEOLOCATION_ERROR, {
        code: 'START_FAILED',
        message: 'Failed to start tracking location',
        originalError: error
      });
      Sentry.captureException(error);
    }
  }

  // Stop tracking location
  stopTracking() {
    if (!this.isTracking || this.watchId === null) return;
    
    navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
    this.isTracking = false;
    eventBus.publish(events.GEOLOCATION_TRACKING_STATUS_CHANGE, { isTracking: false });
    console.log('Geolocation tracking stopped');
  }

  // Get current position once
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject({ 
          code: 'NOT_SUPPORTED', 
          message: 'Geolocation is not supported by this browser.' 
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.lastPosition = this.formatPosition(position);
          resolve(this.lastPosition);
        },
        (error) => {
          reject({
            code: error.code,
            message: error.message
          });
          Sentry.captureException(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  }

  // Handler for position updates
  handlePositionUpdate(position) {
    const formattedPosition = this.formatPosition(position);
    this.lastPosition = formattedPosition;
    
    eventBus.publish(events.GEOLOCATION_POSITION_CHANGE, formattedPosition);
  }

  // Handler for position errors
  handlePositionError(error) {
    eventBus.publish(events.GEOLOCATION_ERROR, {
      code: error.code,
      message: error.message
    });
    
    // If permission denied, stop tracking
    if (error.code === 1) { // PERMISSION_DENIED
      this.hasPermission = false;
      this.stopTracking();
      eventBus.publish(events.GEOLOCATION_PERMISSION_CHANGE, { granted: false });
    }
    
    Sentry.captureException(error);
  }

  // Format position data into a more usable structure
  formatPosition(position) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };
  }
}

// Singleton instance
const geolocationService = new GeolocationService();
export default geolocationService;