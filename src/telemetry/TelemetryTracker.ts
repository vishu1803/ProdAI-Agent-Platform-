import { PrismaClient } from "@prisma/client";
import { globalDatadogSink } from "./DatadogSink";

// Instantiate the Prisma Client globally to prevent hot-reloading issues in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export interface TelemetryData {
  inputTokens: number;
  outputTokens: number;
  toolExecutions: Record<string, number>;
}

export class TelemetryTracker {
  async logTokens(input: number, output: number, sessionId?: string): Promise<void> {
    // Write directly to Postgres/SQLite
    await prisma.telemetryLog.create({
      data: {
        inputTokens: input,
        outputTokens: output,
        sessionId: sessionId,
      }
    });

    // Mirror to Datadog
    await globalDatadogSink.log({
      type: "token_usage",
      data: { inputTokens: input, outputTokens: output },
      sessionId
    });
  }

  async logToolExecution(toolName: string, sessionId?: string): Promise<void> {
    await prisma.telemetryLog.create({
      data: {
        toolName: toolName,
        sessionId: sessionId,
      }
    });

    // Mirror to Datadog
    await globalDatadogSink.log({
      type: "tool_execution",
      data: { toolName: toolName },
      sessionId
    });
  }

  async getStats(): Promise<TelemetryData> {
    const logs = await prisma.telemetryLog.findMany();
    
    let input = 0;
    let output = 0;
    const tools: Record<string, number> = {};

    logs.forEach(log => {
      input += log.inputTokens;
      output += log.outputTokens;
      if (log.toolName) {
        tools[log.toolName] = (tools[log.toolName] || 0) + 1;
      }
    });

    return { inputTokens: input, outputTokens: output, toolExecutions: tools };
  }
}

export const globalTelemetry = new TelemetryTracker();
