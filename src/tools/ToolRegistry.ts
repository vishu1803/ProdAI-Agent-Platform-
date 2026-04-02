import { Tool, ToolResponse } from "./Tool";
import { globalHookEngine } from "../hooks";

export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  register(tool: Tool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`[ToolRegistry] Tool with name ${tool.name} is already registered.`);
    }
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  exportToLLMSchema(): any[] {
    return this.getAllTools().map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }));
  }

  async executeTool(name: string, input: any): Promise<ToolResponse> {
    const tool = this.getTool(name);
    if (!tool) {
      return { success: false, error: `Tool not found in registry: ${name}` };
    }

    // 1. Run Pre-Hooks (Permissions, Telemetry Limits, etc.)
    const preHookCheck = await globalHookEngine.runPreHooks(name, input);
    if (!preHookCheck.proceed) {
      return { success: false, error: `Execution blocked by Hook Engine: ${preHookCheck.error}` };
    }

    let response: ToolResponse;
    try {
      // 2. Execute Core Logic
      response = await tool.execute(input);
    } catch (error: any) {
      response = { success: false, error: `Execution failed fatally: ${error.message || String(error)}` };
    }

    // 3. Run Post-Hooks (Logging, Costs)
    await globalHookEngine.runPostHooks(name, input, response);

    return response;
  }
}

export const globalToolRegistry = new ToolRegistry();
