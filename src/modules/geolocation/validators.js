import { z } from 'zod';
import { createValidator } from '../core/validators';

export const positionSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  accuracy: z.number().optional(),
  altitude: z.number().nullable().optional(),
  altitudeAccuracy: z.number().nullable().optional(),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  timestamp: z.number().optional()
});

export const permissionStatusSchema = z.object({
  granted: z.boolean()
});

export const geolocationErrorSchema = z.object({
  code: z.union([z.number(), z.string()]),
  message: z.string()
});

export const trackingStatusSchema = z.object({
  isTracking: z.boolean()
});

export const validatePosition = createValidator(positionSchema, 'Position');
export const validatePermissionStatus = createValidator(permissionStatusSchema, 'PermissionStatus');
export const validateGeolocationError = createValidator(geolocationErrorSchema, 'GeolocationError');
export const validateTrackingStatus = createValidator(trackingStatusSchema, 'TrackingStatus');