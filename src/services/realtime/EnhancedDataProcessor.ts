
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface DataStream {
  id: string;
  source: string;
  type: 'metrics' | 'events' | 'logs' | 'statistics';
  frequency: number;
  buffer: any[];
  maxBufferSize: number;
  lastProcessed: Date;
  processor: (data: any[]) => any;
}

interface ProcessingPipeline {
  name: string;
  filters: ((data: any) => boolean)[];
  transformers: ((data: any) => any)[];
  aggregators: ((data: any[]) => any)[];
  outputs: string[];
}

export class EnhancedDataProcessor {
  private logger = createRichLogger('EnhancedDataProcessor');
  private streams: Map<string, DataStream> = new Map();
  private pipelines: Map<string, ProcessingPipeline> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private batchSize = 100;
  private processingFrequency = 1000; // 1 second

  start(): void {
    if (this.isProcessing) return;

    this.logger.info('Starting enhanced data processor...');
    this.isProcessing = true;

    this.initializeDefaultStreams();
    this.initializeDefaultPipelines();

    this.processingInterval = setInterval(() => {
      this.processAllStreams();
    }, this.processingFrequency);
  }

  stop(): void {
    if (!this.isProcessing) return;

    this.logger.info('Stopping enhanced data processor...');
    this.isProcessing = false;

    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private initializeDefaultStreams(): void {
    // System metrics stream
    this.registerStream({
      id: 'system-metrics',
      source: 'SystemMonitorService',
      type: 'metrics',
      frequency: 1000,
      buffer: [],
      maxBufferSize: 300, // 5 minutes at 1 second intervals
      lastProcessed: new Date(),
      processor: (data) => this.processSystemMetrics(data)
    });

    // RF4S status stream
    this.registerStream({
      id: 'rf4s-status',
      source: 'RF4SIntegrationService',
      type: 'statistics',
      frequency: 2000,
      buffer: [],
      maxBufferSize: 150, // 5 minutes at 2 second intervals
      lastProcessed: new Date(),
      processor: (data) => this.processRF4SStatus(data)
    });

    // Event stream
    this.registerStream({
      id: 'system-events',
      source: 'EventManager',
      type: 'events',
      frequency: 500,
      buffer: [],
      maxBufferSize: 600, // 5 minutes at 0.5 second intervals
      lastProcessed: new Date(),
      processor: (data) => this.processSystemEvents(data)
    });
  }

  private initializeDefaultPipelines(): void {
    // Performance analysis pipeline
    this.registerPipeline({
      name: 'performance-analysis',
      filters: [
        (data) => data.type === 'metrics',
        (data) => data.source === 'system-metrics'
      ],
      transformers: [
        (data) => ({
          ...data,
          cpuTrend: this.calculateTrend(data.cpu),
          memoryTrend: this.calculateTrend(data.memory)
        })
      ],
      aggregators: [
        (dataArray) => ({
          avgCpu: dataArray.reduce((sum, d) => sum + d.cpu, 0) / dataArray.length,
          avgMemory: dataArray.reduce((sum, d) => sum + d.memory, 0) / dataArray.length,
          peakCpu: Math.max(...dataArray.map(d => d.cpu)),
          peakMemory: Math.max(...dataArray.map(d => d.memory))
        })
      ],
      outputs: ['performance.analysis_completed']
    });

    // Anomaly detection pipeline
    this.registerPipeline({
      name: 'anomaly-detection',
      filters: [
        (data) => data.type === 'metrics' || data.type === 'statistics'
      ],
      transformers: [
        (data) => ({
          ...data,
          anomalyScore: this.calculateAnomalyScore(data)
        })
      ],
      aggregators: [
        (dataArray) => {
          const anomalies = dataArray.filter(d => d.anomalyScore > 0.7);
          return {
            anomaliesDetected: anomalies.length,
            anomalies: anomalies,
            severity: this.calculateSeverity(anomalies)
          };
        }
      ],
      outputs: ['anomaly.detection_completed']
    });
  }

  registerStream(stream: DataStream): void {
    this.streams.set(stream.id, stream);
    this.logger.info(`Registered data stream: ${stream.id}`);
  }

  registerPipeline(pipeline: ProcessingPipeline): void {
    this.pipelines.set(pipeline.name, pipeline);
    this.logger.info(`Registered processing pipeline: ${pipeline.name}`);
  }

  addData(streamId: string, data: any): void {
    const stream = this.streams.get(streamId);
    if (!stream) {
      this.logger.warning(`Stream not found: ${streamId}`);
      return;
    }

    stream.buffer.push({
      ...data,
      timestamp: Date.now(),
      streamId
    });

    // Trim buffer if it exceeds max size
    if (stream.buffer.length > stream.maxBufferSize) {
      stream.buffer = stream.buffer.slice(-stream.maxBufferSize);
    }
  }

  private processAllStreams(): void {
    for (const [streamId, stream] of this.streams.entries()) {
      if (stream.buffer.length === 0) continue;

      try {
        // Process data in batches
        const batchesToProcess = Math.ceil(stream.buffer.length / this.batchSize);
        
        for (let i = 0; i < batchesToProcess; i++) {
          const start = i * this.batchSize;
          const end = Math.min(start + this.batchSize, stream.buffer.length);
          const batch = stream.buffer.slice(start, end);

          if (batch.length > 0) {
            const processed = stream.processor(batch);
            this.runPipelines(processed, stream);
          }
        }

        // Clear processed data
        stream.buffer = [];
        stream.lastProcessed = new Date();

      } catch (error) {
        this.logger.error(`Error processing stream ${streamId}:`, error);
      }
    }
  }

  private runPipelines(data: any, stream: DataStream): void {
    for (const [pipelineName, pipeline] of this.pipelines.entries()) {
      try {
        let processedData = Array.isArray(data) ? data : [data];

        // Apply filters
        for (const filter of pipeline.filters) {
          processedData = processedData.filter(filter);
        }

        if (processedData.length === 0) continue;

        // Apply transformers
        for (const transformer of pipeline.transformers) {
          processedData = processedData.map(transformer);
        }

        // Apply aggregators
        let result = processedData;
        for (const aggregator of pipeline.aggregators) {
          result = aggregator(processedData);
        }

        // Emit to outputs
        for (const output of pipeline.outputs) {
          EventManager.emit(output, {
            pipeline: pipelineName,
            data: result,
            source: stream.source,
            timestamp: Date.now()
          }, 'EnhancedDataProcessor');
        }

      } catch (error) {
        this.logger.error(`Error in pipeline ${pipelineName}:`, error);
      }
    }
  }

  private processSystemMetrics(data: any[]): any {
    return data.map(item => ({
      ...item,
      processed: true,
      processingTime: Date.now()
    }));
  }

  private processRF4SStatus(data: any[]): any {
    return data.map(item => ({
      ...item,
      sessionTime: Date.now() - (item.sessionStart || Date.now()),
      processed: true
    }));
  }

  private processSystemEvents(data: any[]): any {
    return data.map(item => ({
      ...item,
      category: this.categorizeEvent(item),
      processed: true
    }));
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-10);
    const avg1 = recent.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const avg2 = recent.slice(5).reduce((a, b) => a + b, 0) / 5;
    
    const threshold = 5; // 5% change threshold
    if (avg2 > avg1 * (1 + threshold / 100)) return 'increasing';
    if (avg2 < avg1 * (1 - threshold / 100)) return 'decreasing';
    return 'stable';
  }

  private calculateAnomalyScore(data: any): number {
    // Simple anomaly detection based on deviation from normal ranges
    let score = 0;
    
    if (data.cpu && data.cpu > 80) score += 0.3;
    if (data.memory && data.memory > 85) score += 0.3;
    if (data.responseTime && data.responseTime > 1000) score += 0.4;
    
    return Math.min(score, 1.0);
  }

  private calculateSeverity(anomalies: any[]): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalies.length === 0) return 'low';
    
    const avgScore = anomalies.reduce((sum, a) => sum + a.anomalyScore, 0) / anomalies.length;
    
    if (avgScore >= 0.9) return 'critical';
    if (avgScore >= 0.8) return 'high';
    if (avgScore >= 0.6) return 'medium';
    return 'low';
  }

  private categorizeEvent(event: any): string {
    if (event.type?.includes('error')) return 'error';
    if (event.type?.includes('warning')) return 'warning';
    if (event.type?.includes('performance')) return 'performance';
    if (event.type?.includes('user')) return 'user';
    return 'system';
  }

  getStreamStats(): { [streamId: string]: any } {
    const stats: { [streamId: string]: any } = {};
    
    for (const [streamId, stream] of this.streams.entries()) {
      stats[streamId] = {
        bufferSize: stream.buffer.length,
        maxBufferSize: stream.maxBufferSize,
        lastProcessed: stream.lastProcessed,
        frequency: stream.frequency,
        type: stream.type
      };
    }
    
    return stats;
  }

  getPipelineStats(): { [pipelineName: string]: any } {
    const stats: { [pipelineName: string]: any } = {};
    
    for (const [pipelineName, pipeline] of this.pipelines.entries()) {
      stats[pipelineName] = {
        filters: pipeline.filters.length,
        transformers: pipeline.transformers.length,
        aggregators: pipeline.aggregators.length,
        outputs: pipeline.outputs.length
      };
    }
    
    return stats;
  }
}

export const enhancedDataProcessor = new EnhancedDataProcessor();
