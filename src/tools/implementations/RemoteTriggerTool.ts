import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export class RemoteTriggerTool extends Tool<{ endpoint: string; payload: any }> {
  readonly name = "RemoteTriggerTool";
  readonly description = "Sends a POST request with structured payload to a remote web server or webhook.";
  
  readonly inputSchema = z.object({
    endpoint: z.string().url().describe("The webhook or API endpoint"),
    payload: z.object({}).catchall(z.any()).describe("JSON payload to send")
  });

  async execute(input: { endpoint: string; payload: any }): Promise<ToolResponse> {
    try {
      const res = await fetch(input.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input.payload)
      });
      const data = await res.text();
      return { success: true, message: `POST triggered (Status: ${res.status})`, data };
    } catch(e: any) {
      return { success: false, error: e.message };
    }
  }
}
