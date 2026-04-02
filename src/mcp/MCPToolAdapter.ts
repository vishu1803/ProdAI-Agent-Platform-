import { z } from "zod";
import { Tool, ToolResponse } from "../tools/Tool";

/**
 * MCPToolAdapter dynamically converts an MCP Server Tool definition
 * (which uses JSON Schema) into our application's native Zod-based Tool class.
 */
export class MCPToolAdapter extends Tool<any> {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: z.ZodType<any>;
  private executeCallback: (args: any) => Promise<any>;

  constructor(
    name: string,
    description: string,
    jsonSchema: any,
    executeCallback: (args: any) => Promise<any>
  ) {
    super();
    this.name = name;
    this.description = description;
    
    // In a fully robust system, you would use a library like `json-schema-to-zod`
    // to dynamically parse the remote JSON schema into a strict Zod object.
    // For flexibility, we ingest any record matching the broad parameter shape.
    this.inputSchema = z.record(z.string(), z.any()).describe("Dynamic payload for " + name);
    this.executeCallback = executeCallback;
  }

  async execute(input: any): Promise<ToolResponse> {
    try {
      const result = await this.executeCallback(input);
      return { 
        success: true, 
        message: `MCP Tool ${this.name} executed successfully`,
        data: result 
      };
    } catch (e: any) {
      return { success: false, error: `MCP Engine Error: ${e.message}` };
    }
  }
}
