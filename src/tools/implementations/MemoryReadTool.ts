import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";
import { globalTeamMemory } from "../../swarm/TeamMemory";

export class MemoryReadTool extends Tool<{ key?: string }> {
  readonly name = "MemoryReadTool";
  readonly description = "Reads a value from the global Team Memory. Provide a key to get a specific entry, or omit to list all memory keys/values.";
  
  readonly inputSchema = z.object({
    key: z.string().optional().describe("Optional key to retrieve specific value. Omit to retrieve all memory.")
  });

  async execute(input: { key?: string }): Promise<ToolResponse> {
    if (input.key) {
      const val = globalTeamMemory.get(input.key);
      if (val === undefined) {
        return { success: false, error: `No Team Memory value found for key '${input.key}'` };
      }
      return { success: true, message: `Read memory key '${input.key}'`, data: { value: val } };
    }
    
    // Return all
    const all = globalTeamMemory.getAll();
    return {
      success: true,
      message: "Retrieved all Team Memory records",
      data: Object.entries(all).map(([k, v]) => ({ key: k, value: v }))
    };
  }
}
