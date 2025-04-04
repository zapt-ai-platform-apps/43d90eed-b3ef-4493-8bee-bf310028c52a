import * as Sentry from '@sentry/browser';

// Simple storage service using localStorage
class PathStorage {
  constructor() {
    this.storageKey = 'recorded_paths';
  }

  async getAllPaths() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];
      
      return JSON.parse(stored);
    } catch (error) {
      Sentry.captureException(error);
      console.error('Failed to retrieve paths:', error);
      return [];
    }
  }

  async getPathById(id) {
    try {
      const paths = await this.getAllPaths();
      return paths.find(path => path.id === id) || null;
    } catch (error) {
      Sentry.captureException(error);
      console.error(`Failed to retrieve path with ID ${id}:`, error);
      return null;
    }
  }

  async savePath(path) {
    try {
      const paths = await this.getAllPaths();
      
      // Update if exists, otherwise add new
      const existingIndex = paths.findIndex(p => p.id === path.id);
      if (existingIndex >= 0) {
        paths[existingIndex] = path;
      } else {
        paths.push(path);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(paths));
      console.log('Path saved successfully:', path.id);
      return path;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Failed to save path:', error);
      throw error;
    }
  }

  async deletePath(id) {
    try {
      const paths = await this.getAllPaths();
      const newPaths = paths.filter(path => path.id !== id);
      
      if (newPaths.length === paths.length) {
        throw new Error(`Path with ID ${id} not found`);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(newPaths));
      console.log('Path deleted successfully:', id);
      return true;
    } catch (error) {
      Sentry.captureException(error);
      console.error(`Failed to delete path with ID ${id}:`, error);
      throw error;
    }
  }

  async updatePathDetails(id, details) {
    try {
      const path = await this.getPathById(id);
      if (!path) {
        throw new Error(`Path with ID ${id} not found`);
      }
      
      const updatedPath = {
        ...path,
        name: details.name || path.name,
        description: details.description || path.description
      };
      
      return this.savePath(updatedPath);
    } catch (error) {
      Sentry.captureException(error);
      console.error(`Failed to update path details for ID ${id}:`, error);
      throw error;
    }
  }
}

const pathStorage = new PathStorage();
export default pathStorage;