import geolocationService from './internal/geolocationService';
import { eventBus } from '../core/events';
import { events } from './events';

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
    return geolocationService.getCurrentPosition();
  },
  
  // Subscribe to position updates
  onPositionChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_POSITION_CHANGE, callback);
  },
  
  // Subscribe to geolocation errors
  onError(callback) {
    return eventBus.subscribe(events.GEOLOCATION_ERROR, callback);
  },
  
  // Subscribe to permission changes
  onPermissionChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_PERMISSION_CHANGE, callback);
  },
  
  // Subscribe to tracking status changes
  onTrackingStatusChange(callback) {
    return eventBus.subscribe(events.GEOLOCATION_TRACKING_STATUS_CHANGE, callback);
  }
};