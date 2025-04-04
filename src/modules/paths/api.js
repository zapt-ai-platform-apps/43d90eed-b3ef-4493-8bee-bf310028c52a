import recordingService from './internal/recordingService';
import pathStorage from './internal/pathStorage';
import { eventBus } from '../core/events';
import { events } from './events';
import { 
  validatePath, 
  validatePathDetails, 
  validateRecordingStats,
  validatePathPoint
} from './validators';

export const api = {
  // Recording methods
  startRecording() {
    return recordingService.startRecording();
  },
  
  async stopRecording() {
    const path = await recordingService.stopRecording();
    if (path) {
      return validatePath(path, {
        actionName: 'stopRecording',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
    }
    return null;
  },
  
  cancelRecording() {
    recordingService.cancelRecording();
  },
  
  updateRecordingDetails(details) {
    const validatedDetails = validatePathDetails(details, {
      actionName: 'updateRecordingDetails',
      location: 'paths/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'paths'
    });
    recordingService.updateRecordingDetails(validatedDetails);
  },
  
  getCurrentStats() {
    const stats = recordingService.getCurrentStats();
    if (!stats) return null;
    
    return validateRecordingStats(stats, {
      actionName: 'getCurrentStats',
      location: 'paths/api.js',
      direction: 'outgoing',
      moduleFrom: 'paths',
      moduleTo: 'client'
    });
  },
  
  // Path storage methods
  async getAllPaths() {
    const paths = await pathStorage.getAllPaths();
    return paths.map(path => 
      validatePath(path, {
        actionName: 'getAllPaths',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      })
    );
  },
  
  async getPathById(id) {
    const path = await pathStorage.getPathById(id);
    if (!path) return null;
    
    return validatePath(path, {
      actionName: 'getPathById',
      location: 'paths/api.js',
      direction: 'outgoing',
      moduleFrom: 'paths',
      moduleTo: 'client'
    });
  },
  
  async savePath(path) {
    const validatedPath = validatePath(path, {
      actionName: 'savePath',
      location: 'paths/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'paths'
    });
    return pathStorage.savePath(validatedPath);
  },
  
  async deletePath(id) {
    const result = await pathStorage.deletePath(id);
    if (result) {
      eventBus.publish(events.PATH_DELETED, { id });
    }
    return result;
  },
  
  async updatePathDetails(id, details) {
    const validatedDetails = validatePathDetails(details, {
      actionName: 'updatePathDetails',
      location: 'paths/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'paths'
    });
    
    const result = await pathStorage.updatePathDetails(id, validatedDetails);
    if (result) {
      const validatedResult = validatePath(result, {
        actionName: 'updatePathDetails',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      eventBus.publish(events.PATH_UPDATED, validatedResult);
      return validatedResult;
    }
    return null;
  },
  
  // Event subscriptions with validation
  onRecordingStarted(callback) {
    return eventBus.subscribe(events.RECORDING_STARTED, (recording) => {
      const validatedRecording = validatePath(recording, {
        actionName: 'onRecordingStarted',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback(validatedRecording);
    });
  },
  
  onRecordingCompleted(callback) {
    return eventBus.subscribe(events.RECORDING_COMPLETED, (recording) => {
      const validatedRecording = validatePath(recording, {
        actionName: 'onRecordingCompleted',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback(validatedRecording);
    });
  },
  
  onRecordingCanceled(callback) {
    return eventBus.subscribe(events.RECORDING_CANCELED, (recording) => {
      // May be incomplete due to cancellation, so wrap in try/catch
      try {
        const validatedRecording = validatePath(recording, {
          actionName: 'onRecordingCanceled',
          location: 'paths/api.js',
          direction: 'outgoing',
          moduleFrom: 'paths',
          moduleTo: 'client'
        });
        callback(validatedRecording);
      } catch (error) {
        console.error('Canceled recording validation failed, passing raw data:', error);
        callback(recording);
      }
    });
  },
  
  onRecordingUpdated(callback) {
    return eventBus.subscribe(events.RECORDING_UPDATED, (recording) => {
      const validatedRecording = validatePath(recording, {
        actionName: 'onRecordingUpdated',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback(validatedRecording);
    });
  },
  
  onRecordingPointAdded(callback) {
    return eventBus.subscribe(events.RECORDING_POINT_ADDED, (data) => {
      const validatedPoint = validatePathPoint(data.point, {
        actionName: 'onRecordingPointAdded',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback({
        point: validatedPoint,
        recordingId: data.recordingId
      });
    });
  },
  
  onRecordingStatusChange(callback) {
    return eventBus.subscribe(events.RECORDING_STATUS_CHANGE, callback);
  },
  
  onRecordingStatsUpdated(callback) {
    return eventBus.subscribe(events.RECORDING_STATS_UPDATED, (stats) => {
      const validatedStats = validateRecordingStats(stats, {
        actionName: 'onRecordingStatsUpdated',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback(validatedStats);
    });
  },
  
  onRecordingError(callback) {
    return eventBus.subscribe(events.RECORDING_ERROR, callback);
  },
  
  onPathDeleted(callback) {
    return eventBus.subscribe(events.PATH_DELETED, callback);
  },
  
  onPathUpdated(callback) {
    return eventBus.subscribe(events.PATH_UPDATED, (path) => {
      const validatedPath = validatePath(path, {
        actionName: 'onPathUpdated',
        location: 'paths/api.js',
        direction: 'outgoing',
        moduleFrom: 'paths',
        moduleTo: 'client'
      });
      callback(validatedPath);
    });
  }
};