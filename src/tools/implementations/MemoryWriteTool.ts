import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";
import { globalTeamMemory } from "../../swarm/TeamMemory";

export class MemoryWriteTool extends Tool<{ key: string; value: string }> {
  readonly name = "MemoryWriteTool";
  readonly description = "Writes a string value to the global Team Memory, accessible by all sub-agents.";
  
  readonly inputSchema = z.object({
    key: z.string().describe("The key to store the value under."),
    value: z.string().describe("The long-form string value to store (thoughts, research, findings).")
  });

  async execute(input: { key: string; value: string }): Promise<ToolResponse> {
    globalTeamMemory.set(input.key, input.value);
    return {
      success: true,
      message: `Successfully wrote to Team Memory at key '${input.key}'`,
      data: { key: input.key }
    };
  }
}
