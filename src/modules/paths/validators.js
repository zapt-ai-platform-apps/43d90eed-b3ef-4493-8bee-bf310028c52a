import { z } from 'zod';
import { createValidator } from '../core/validators';

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

export const pathDetailsSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional()
});

export const recordingStatsSchema = z.object({
  recordingId: z.string().nullable().optional(),
  distance: z.number(),
  duration: z.number(),
  pointCount: z.number()
});

export const validatePath = createValidator(pathSchema, 'Path');
export const validatePathDetails = createValidator(pathDetailsSchema, 'PathDetails');
export const validateRecordingStats = createValidator(recordingStatsSchema, 'RecordingStats');
export const validatePathPoint = createValidator(pathPointSchema, 'PathPoint');