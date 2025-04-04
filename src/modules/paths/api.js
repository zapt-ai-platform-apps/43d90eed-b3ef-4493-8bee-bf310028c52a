import recordingService from './internal/recordingService';
import pathStorage from './internal/pathStorage';
import { eventBus } from '../core/events';
import { events } from './events';

export const api = {
  // Recording methods
  startRecording() {
    return recordingService.startRecording();
  },
  
  async stopRecording() {
    return recordingService.stopRecording();
  },
  
  cancelRecording() {
    recordingService.cancelRecording();
  },
  
  updateRecordingDetails(details) {
    recordingService.updateRecordingDetails(details);
  },
  
  getCurrentStats() {
    return recordingService.getCurrentStats();
  },
  
  // Path storage methods
  async getAllPaths() {
    return pathStorage.getAllPaths();
  },
  
  async getPathById(id) {
    return pathStorage.getPathById(id);
  },
  
  async savePath(path) {
    return pathStorage.savePath(path);
  },
  
  async deletePath(id) {
    const result = await pathStorage.deletePath(id);
    if (result) {
      eventBus.publish(events.PATH_DELETED, { id });
    }
    return result;
  },
  
  async updatePathDetails(id, details) {
    const result = await pathStorage.updatePathDetails(id, details);
    if (result) {
      eventBus.publish(events.PATH_UPDATED, result);
    }
    return result;
  },
  
  // Event subscriptions
  onRecordingStarted(callback) {
    return eventBus.subscribe(events.RECORDING_STARTED, callback);
  },
  
  onRecordingCompleted(callback) {
    return eventBus.subscribe(events.RECORDING_COMPLETED, callback);
  },
  
  onRecordingCanceled(callback) {
    return eventBus.subscribe(events.RECORDING_CANCELED, callback);
  },
  
  onRecordingUpdated(callback) {
    return eventBus.subscribe(events.RECORDING_UPDATED, callback);
  },
  
  onRecordingPointAdded(callback) {
    return eventBus.subscribe(events.RECORDING_POINT_ADDED, callback);
  },
  
  onRecordingStatusChange(callback) {
    return eventBus.subscribe(events.RECORDING_STATUS_CHANGE, callback);
  },
  
  onRecordingStatsUpdated(callback) {
    return eventBus.subscribe(events.RECORDING_STATS_UPDATED, callback);
  },
  
  onRecordingError(callback) {
    return eventBus.subscribe(events.RECORDING_ERROR, callback);
  },
  
  onPathDeleted(callback) {
    return eventBus.subscribe(events.PATH_DELETED, callback);
  },
  
  onPathUpdated(callback) {
    return eventBus.subscribe(events.PATH_UPDATED, callback);
  }
};