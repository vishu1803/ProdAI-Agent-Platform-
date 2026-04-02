import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiTools } from "../aiToolsAdapter";

export class TaskDelegateTool extends Tool<{ instructions: string }> {
  readonly name = "TaskDelegateTool";
  readonly description = "Spawns a child AI agent to handle a complex sub-task concurrently.";
  
  readonly inputSchema = z.object({
    instructions: z.string().describe("Detailed instructions for the sub-agent.")
  });

  async execute(input: { instructions: string }): Promise<ToolResponse> {
    try {
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        system: "You are a specialized background Swarm Sub-Agent. Your task is to execute the instructions given to you autonomously. Use your available tools. Feel free to use MemoryWriteTool to store intermediate or final complex findings for the Coordinator to read. Keep your final textual response concise.",
        prompt: input.instructions,
        tools: aiTools,
        // @ts-ignore
        maxSteps: 5,
      });

      return {
        success: true,
        message: "Sub-agent finished execution successfully.",
        data: { 
          output: result.text,
          status: "Background Processing Completed", 
          assigned_to: `sub-agent-${Date.now()}` 
        }
      };
    } catch (e: any) {
      return {
        success: false,
        error: `Sub-agent execution failed: ${e.message}`
      };
    }
  }
}
