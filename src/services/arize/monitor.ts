import axios from 'axios';
import { config } from '../../config';
import type { SeverityLevel } from '../../types';

interface PredictionRecord {
  predictionId: string;
  workerId: string;
  inputText: string;
  predictedSeverity: SeverityLevel;
  actualSeverity?: SeverityLevel;
  sentimentScore: number;
  latencyMs: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export async function logPrediction(record: PredictionRecord): Promise<void> {
  if (!config.arize.apiKey || !config.arize.spaceId) {
    return;
  }

  try {
    await axios.post(
      'https://api.arize.com/v1/log',
      {
        space_id: config.arize.spaceId,
        model_id: config.arize.modelId,
        model_version: '1.0.0',
        prediction_id: record.predictionId,
        prediction_timestamp: Math.floor(record.timestamp.getTime() / 1000),
        prediction_label: record.predictedSeverity,
        features: {
          worker_id: record.workerId,
          sentiment_score: record.sentimentScore,
          latency_ms: record.latencyMs,
          input_length: record.inputText.length,
          ...record.metadata,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${config.arize.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[Arize] Failed to log prediction:', err);
  }
}

export async function logActualSeverity(predictionId: string, actualSeverity: SeverityLevel): Promise<void> {
  if (!config.arize.apiKey) return;

  try {
    await axios.post(
      'https://api.arize.com/v1/log',
      {
        space_id: config.arize.spaceId,
        model_id: config.arize.modelId,
        prediction_id: predictionId,
        actual_label: actualSeverity,
      },
      {
        headers: {
          Authorization: `Bearer ${config.arize.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[Arize] Failed to log actual:', err);
  }
}

export function createPredictionId(workerId: string): string {
  return `${workerId}-${Date.now()}`;
}
