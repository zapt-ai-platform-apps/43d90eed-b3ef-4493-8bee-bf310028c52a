import * as L from 'leaflet';
import * as Sentry from '@sentry/browser';

class MapService {
  constructor() {
    this.map = null;
    this.currentPositionMarker = null;
    this.pathLayer = null;
    this.markers = [];
  }

  // Initialize a map on the given element ID
  initializeMap(elementId, options = {}) {
    if (this.map) {
      this.map.remove();
    }

    const defaultOptions = {
      center: [0, 0],
      zoom: 13,
      zoomControl: true,
    };

    const mapOptions = { ...defaultOptions, ...options };
    
    try {
      // Make sure the element exists
      const mapElement = document.getElementById(elementId);
      if (!mapElement) {
        throw new Error(`Map element not found: ${elementId}`);
      }
      
      this.map = L.map(elementId, mapOptions);

      // Add default OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(this.map);
      
      // Add ZAPT attribution
      const ZAPTAttribution = L.control.attribution({
        position: 'bottomright'
      }).addTo(this.map);
      
      ZAPTAttribution.addAttribution('<a href="https://www.zapt.ai" target="_blank">Made on ZAPT</a>');
      
      console.log('Map initialized:', elementId);
      return this.map;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      Sentry.captureException(error);
      throw error;
    }
  }

  // Set the center of the map to the given coordinates
  setCenter(latitude, longitude, zoom = null) {
    if (!this.map) return;
    
    try {
      this.map.setView([latitude, longitude], zoom || this.map.getZoom());
    } catch (error) {
      console.error('Error setting map center:', error);
      Sentry.captureException(error);
    }
  }

  // Update or create the current position marker
  updateCurrentPosition(position) {
    if (!this.map) return;
    
    try {
      const { latitude, longitude } = position;
      
      if (!this.currentPositionMarker) {
        // Create a marker for the current position
        this.currentPositionMarker = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: 'current-position-marker',
            html: '<div class="pulse"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(this.map);
      } else {
        // Update existing marker position
        this.currentPositionMarker.setLatLng([latitude, longitude]);
      }
    } catch (error) {
      console.error('Error updating current position:', error);
      Sentry.captureException(error);
    }
  }

  // Display a path on the map
  displayPath(path, fitBounds = true) {
    if (!this.map) return;
    
    try {
      // Remove existing path layer if it exists
      this.clearLayers();
      
      if (!path || !path.points || path.points.length === 0) {
        console.log('No points in path to display');
        return null;
      }
      
      // Create an array of LatLng objects from path points
      const latLngs = path.points.map(point => [point.latitude, point.longitude]);
      
      // Create a polyline for the path
      this.pathLayer = L.polyline(latLngs, {
        color: '#3b82f6', // blue-500
        weight: 5,
        opacity: 0.7,
      }).addTo(this.map);
      
      // Add markers for start and end points
      if (latLngs.length > 0) {
        const startPoint = latLngs[0];
        const endPoint = latLngs[latLngs.length - 1];
        
        // Start marker
        const startMarker = L.marker(startPoint, {
          icon: L.divIcon({
            className: 'start-marker',
            html: '<div class="start-icon">S</div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        }).addTo(this.map);
        
        this.markers.push(startMarker);
        
        // End marker
        if (path.endTime) {
          const endMarker = L.marker(endPoint, {
            icon: L.divIcon({
              className: 'end-marker',
              html: '<div class="end-icon">E</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            }),
          }).addTo(this.map);
          
          this.markers.push(endMarker);
        }
      }
      
      // Fit the map bounds to show the entire path
      if (fitBounds && this.pathLayer) {
        this.map.fitBounds(this.pathLayer.getBounds(), {
          padding: [50, 50],
        });
      }
      
      console.log('Path displayed with', path.points.length, 'points');
      return this.pathLayer;
    } catch (error) {
      console.error('Error displaying path:', error);
      Sentry.captureException(error);
      return null;
    }
  }

  // Clear all layers from the map
  clearLayers() {
    if (!this.map) return;
    
    try {
      if (this.pathLayer) {
        this.map.removeLayer(this.pathLayer);
        this.pathLayer = null;
      }
      
      // Remove all markers
      this.markers.forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.markers = [];
      
      // Don't remove the current position marker
    } catch (error) {
      console.error('Error clearing map layers:', error);
      Sentry.captureException(error);
    }
  }

  // Destroy the map instance
  destroyMap() {
    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
        this.currentPositionMarker = null;
        this.pathLayer = null;
        this.markers = [];
        console.log('Map destroyed');
      }
    } catch (error) {
      console.error('Error destroying map:', error);
      Sentry.captureException(error);
    }
  }
}

const mapService = new MapService();
export default mapService;