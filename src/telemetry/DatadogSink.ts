// src/telemetry/DatadogSink.ts

export interface LogPayload {
  type: "token_usage" | "tool_execution";
  timestamp: string;
  data: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export class DatadogSink {
  private batch: LogPayload[] = [];
  private batchSize = 10;
  private endpoint = process.env.DATADOG_MOCK_ENDPOINT || "https://http-intake.logs.datadoghq.com/v1/input/mock";

  /**
   * Pushes a structured log into the batch pool.
   * If the batch is full, it performs an async flush to the enterprise sink.
   */
  async log(payload: Omit<LogPayload, "timestamp">) {
    this.batch.push({
      ...payload,
      timestamp: new Date().toISOString()
    });

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flushes currently queued logs to the external sink.
   */
  async flush() {
    if (this.batch.length === 0) return;
    
    // Copy the batch and reset immediately so tracking is unblocked
    const payloadBuffer = [...this.batch];
    this.batch = [];

    // Simulate an external network request
    console.log(`[DatadogSink] Flushing ${payloadBuffer.length} telemetry logs to enterprise sink...`);
    
    try {
      // In production, this would be: await fetch(this.endpoint, { method: "POST", body: JSON.stringify(payloadBuffer) })
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulating network latency
      console.log(`[DatadogSink] Successfully flushed batch.`);
    } catch (error) {
      console.error(`[DatadogSink] Failed to flush batch to enterprise sink:`, error);
    }
  }
}

export const globalDatadogSink = new DatadogSink();
