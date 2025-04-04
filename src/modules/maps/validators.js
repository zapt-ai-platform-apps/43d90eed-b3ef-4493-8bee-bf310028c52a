import { z } from 'zod';
import { createValidator } from '../core/validators';
import { positionSchema } from '../geolocation/validators';

export const mapOptionsSchema = z.object({
  center: z.tuple([z.number(), z.number()]).optional(),
  zoom: z.number().optional(),
  zoomControl: z.boolean().optional()
});

export const pathPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  altitude: z.number().nullable().optional(),
  accuracy: z.number().optional(),
  timestamp: z.number().optional()
});

export const pathSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  startTime: z.string(),
  endTime: z.string().nullable().optional(),
  points: z.array(pathPointSchema),
  totalDistance: z.number().default(0),
  duration: z.number().default(0)
});

export const validateMapOptions = createValidator(mapOptionsSchema, 'MapOptions');
export const validatePosition = createValidator(positionSchema, 'Position');
export const validatePath = createValidator(pathSchema, 'Path');