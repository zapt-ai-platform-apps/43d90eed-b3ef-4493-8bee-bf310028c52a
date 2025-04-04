import mapService from './internal/mapService';
import { validatePosition, validateMapOptions, validatePath } from './validators';

export const api = {
  // Initialize a map on the given element ID
  initializeMap(elementId, options = {}) {
    const validatedOptions = validateMapOptions(options, {
      actionName: 'initializeMap',
      location: 'maps/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'maps'
    });
    return mapService.initializeMap(elementId, validatedOptions);
  },
  
  // Set the center of the map to the given coordinates
  setCenter(latitude, longitude, zoom = null) {
    const position = { latitude, longitude };
    const validatedPosition = validatePosition(position, {
      actionName: 'setCenter',
      location: 'maps/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'maps'
    });
    mapService.setCenter(validatedPosition.latitude, validatedPosition.longitude, zoom);
  },
  
  // Update or create the current position marker
  updateCurrentPosition(position) {
    const validatedPosition = validatePosition(position, {
      actionName: 'updateCurrentPosition',
      location: 'maps/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'maps'
    });
    mapService.updateCurrentPosition(validatedPosition);
  },
  
  // Display a path on the map
  displayPath(path, fitBounds = true) {
    const validatedPath = validatePath(path, {
      actionName: 'displayPath',
      location: 'maps/api.js',
      direction: 'incoming',
      moduleFrom: 'client',
      moduleTo: 'maps'
    });
    return mapService.displayPath(validatedPath, fitBounds);
  },
  
  // Clear all layers from the map
  clearLayers() {
    mapService.clearLayers();
  },
  
  // Destroy the map instance
  destroyMap() {
    mapService.destroyMap();
  }
};