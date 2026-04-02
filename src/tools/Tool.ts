import { z } from "zod";

/**
 * Standardized response for all tool executions.
 * This guarantees the LLM receives structured data it can reason about.
 */
export interface ToolResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

/**
 * Base abstract class that all tools must extend.
 * T represents the parsed JSON input schema.
 */
export abstract class Tool<T = any> {
  abstract readonly name: string;
  abstract readonly description: string;
  
  /**
   * Zod Schema representation of the arguments this tool accepts.
   */
  abstract readonly inputSchema: z.ZodType<T>;

  /**
   * The core execution logic.
   * @param input The parsed parameters supplied by the LLM.
   */
  abstract execute(input: T): Promise<ToolResponse>;
}
