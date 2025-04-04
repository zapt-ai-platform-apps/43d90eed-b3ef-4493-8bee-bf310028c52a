import mapService from './internal/mapService';

export const api = {
  // Initialize a map on the given element ID
  initializeMap(elementId, options = {}) {
    return mapService.initializeMap(elementId, options);
  },
  
  // Set the center of the map to the given coordinates
  setCenter(latitude, longitude, zoom = null) {
    mapService.setCenter(latitude, longitude, zoom);
  },
  
  // Update or create the current position marker
  updateCurrentPosition(position) {
    mapService.updateCurrentPosition(position);
  },
  
  // Display a path on the map
  displayPath(path, fitBounds = true) {
    return mapService.displayPath(path, fitBounds);
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