// Format distance in meters to a human-readable string
export const formatDistance = (meters) => {
  if (meters === undefined || meters === null) return '0 m';
  
  // Convert to kilometers if distance is large enough
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  
  // Otherwise keep in meters
  return `${Math.round(meters)} m`;
};

// Format duration in milliseconds to a human-readable string
export const formatDuration = (milliseconds) => {
  if (milliseconds === undefined || milliseconds === null) return '0:00';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

// Format date to a human-readable string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};