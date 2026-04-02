import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export class SystemTimeTool extends Tool<{}> {
  readonly name = "SystemTimeTool";
  readonly description = "Retrieves the current system time and date.";
  
  readonly inputSchema = z.object({});

  async execute(): Promise<ToolResponse> {
    const now = new Date();
    return {
      success: true,
      message: "Time retrieved successfully.",
      data: {
        iso: now.toISOString(),
        local: now.toLocaleString(),
        timestamp: now.getTime()
      }
    };
  }
}
