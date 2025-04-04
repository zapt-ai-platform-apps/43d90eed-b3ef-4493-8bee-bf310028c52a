import geolocationService from './internal/geolocationService';
import { eventBus } from '../core/events';
import { events } from './events';
import { 
  validatePosition,
  validatePermissionStatus,
  validateGeolocationError,
  validateTrackingStatus
} from './validators';

export const api = {
  // Check if geolocation is supported
  isSupported() {
    return geolocationService.isSupported();
  },
  
  // Request permission and get current position
  async requestPermission() {
    return geolocationService.requestPermission();
  },
  
  // Start tracking location
  startTracking(options = {}) {
    geolocationService.startTracking(options);
  },
  
  // Stop tracking location
  stopTracking() {
    geolocationService.stopTracking();
  },
  
  // Get current position once
  async getCurrentPosition() {
    const position = await geolocationService.getCurrentPosition();
    return validatePosition(position, {
      actionName: 'getCurrentPosition',
      location: 'geolocation/api.js',
      direction: 'outgoing',
      moduleFrom: 'geolocation',
      moduleTo: 'client'
    });
  },
  
  // Subscribe to position updates
  onPositionChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_POSITION_CHANGE, (position) => {
      const validatedPosition = validatePosition(position, {
        actionName: 'onPositionChange',
        location: 'geolocation/api.js',
        direction: 'outgoing',
        moduleFrom: 'geolocation',
        moduleTo: 'client'
      });
      callback(validatedPosition);
    });
  },
  
  // Subscribe to geolocation errors
  onError(callback) {
    return eventBus.subscribe(events.GEOLOCATION_ERROR, (error) => {
      const validatedError = validateGeolocationError(error, {
        actionName: 'onError',
        location: 'geolocation/api.js',
        direction: 'outgoing',
        moduleFrom: 'geolocation',
        moduleTo: 'client'
      });
      callback(validatedError);
    });
  },
  
  // Subscribe to permission changes
  onPermissionChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_PERMISSION_CHANGE, (status) => {
      const validatedStatus = validatePermissionStatus(status, {
        actionName: 'onPermissionChange',
        location: 'geolocation/api.js',
        direction: 'outgoing',
        moduleFrom: 'geolocation',
        moduleTo: 'client'
      });
      callback(validatedStatus);
    });
  },
  
  // Subscribe to tracking status changes
  onTrackingStatusChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_TRACKING_STATUS_CHANGE, (status) => {
      const validatedStatus = validateTrackingStatus(status, {
        actionName: 'onTrackingStatusChange',
        location: 'geolocation/api.js',
        direction: 'outgoing',
        moduleFrom: 'geolocation',
        moduleTo: 'client'
      });
      callback(validatedStatus);
    });
  }
};