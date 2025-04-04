import { eventBus } from '@/modules/core/events';
import { events as geoEvents } from '@/modules/geolocation/events';
import { events as pathEvents } from '../events';
import pathStorage from './pathStorage';
import * as Sentry from '@sentry/browser';

class RecordingService {
  constructor() {
    this.isRecording = false;
    this.currentRecording = null;
    this.geoEventUnsubscribers = [];
    
    // Statistics tracking
    this.startTime = null;
    this.distance = 0;
    this.lastPoint = null;
  }

  startRecording() {
    if (this.isRecording) return;
    
    this.currentRecording = {
      id: this.generateId(),
      name: `Path ${new Date().toLocaleString()}`,
      description: '',
      startTime: new Date().toISOString(),
      endTime: null,
      points: [],
      totalDistance: 0,
      duration: 0,
    };
    
    this.startTime = Date.now();
    this.distance = 0;
    this.lastPoint = null;
    this.isRecording = true;
    
    // Subscribe to geolocation events
    this.geoEventUnsubscribers.push(
      eventBus.subscribe(geoEvents.GEOLOCATION_POSITION_CHANGE, this.handlePositionUpdate.bind(this))
    );
    
    console.log('Recording started:', this.currentRecording.id);
    eventBus.publish(pathEvents.RECORDING_STATUS_CHANGE, { isRecording: true });
    eventBus.publish(pathEvents.RECORDING_STARTED, this.currentRecording);
    
    return this.currentRecording.id;
  }

  async stopRecording() {
    if (!this.isRecording || !this.currentRecording) return null;
    
    // Calculate final statistics
    this.currentRecording.endTime = new Date().toISOString();
    this.currentRecording.totalDistance = this.distance;
    this.currentRecording.duration = Date.now() - this.startTime;
    
    // Unsubscribe from events
    this.geoEventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.geoEventUnsubscribers = [];
    
    const finishedRecording = {...this.currentRecording};
    
    // Reset current recording state
    this.isRecording = false;
    this.currentRecording = null;
    this.startTime = null;
    this.distance = 0;
    this.lastPoint = null;
    
    // Save the recording
    try {
      await pathStorage.savePath(finishedRecording);
      console.log('Recording completed:', finishedRecording.id);
      eventBus.publish(pathEvents.RECORDING_STATUS_CHANGE, { isRecording: false });
      eventBus.publish(pathEvents.RECORDING_COMPLETED, finishedRecording);
      return finishedRecording;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Failed to save recording:', error);
      eventBus.publish(pathEvents.RECORDING_ERROR, { 
        message: 'Failed to save recording', 
        error 
      });
      return null;
    }
  }

  cancelRecording() {
    if (!this.isRecording) return;
    
    // Unsubscribe from events
    this.geoEventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.geoEventUnsubscribers = [];
    
    const canceledRecording = {...this.currentRecording};
    
    // Reset state
    this.isRecording = false;
    this.currentRecording = null;
    this.startTime = null;
    this.distance = 0;
    this.lastPoint = null;
    
    console.log('Recording canceled');
    eventBus.publish(pathEvents.RECORDING_STATUS_CHANGE, { isRecording: false });
    eventBus.publish(pathEvents.RECORDING_CANCELED, canceledRecording);
  }

  updateRecordingDetails(details) {
    if (!this.isRecording || !this.currentRecording) return;
    
    this.currentRecording = {
      ...this.currentRecording,
      name: details.name || this.currentRecording.name,
      description: details.description || this.currentRecording.description
    };
    
    eventBus.publish(pathEvents.RECORDING_UPDATED, this.currentRecording);
  }

  handlePositionUpdate(position) {
    if (!this.isRecording || !this.currentRecording) return;
    
    const point = {
      latitude: position.latitude,
      longitude: position.longitude,
      altitude: position.altitude,
      accuracy: position.accuracy,
      timestamp: position.timestamp || Date.now()
    };
    
    // Add to points array
    this.currentRecording.points.push(point);
    
    // Update distance if we have at least two points
    if (this.lastPoint) {
      const segmentDistance = this.calculateDistance(this.lastPoint, point);
      this.distance += segmentDistance;
    }
    
    this.lastPoint = point;
    
    // Update duration
    this.currentRecording.duration = Date.now() - this.startTime;
    
    // Publish updates
    eventBus.publish(pathEvents.RECORDING_POINT_ADDED, { 
      point, 
      recordingId: this.currentRecording.id 
    });
    
    eventBus.publish(pathEvents.RECORDING_STATS_UPDATED, {
      distance: this.distance,
      duration: this.currentRecording.duration,
      pointCount: this.currentRecording.points.length
    });
  }

  getCurrentStats() {
    if (!this.isRecording) return null;
    
    return {
      recordingId: this.currentRecording?.id,
      distance: this.distance,
      duration: Date.now() - (this.startTime || Date.now()),
      pointCount: this.currentRecording?.points.length || 0
    };
  }

  calculateDistance(point1, point2) {
    // Haversine formula to calculate distance between two points on a sphere
    const R = 6371e3; // Earth radius in meters
    const φ1 = this.toRadians(point1.latitude);
    const φ2 = this.toRadians(point2.latitude);
    const Δφ = this.toRadians(point2.latitude - point1.latitude);
    const Δλ = this.toRadians(point2.longitude - point1.longitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  generateId() {
    // Simple ID generation
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

const recordingService = new RecordingService();
export default recordingService;