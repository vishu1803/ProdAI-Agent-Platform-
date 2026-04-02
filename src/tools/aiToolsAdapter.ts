import { tool as VercelTool } from 'ai';
import { globalToolRegistry } from './index';

// Convert our registry to Vercel AI format
export const aiTools: Record<string, any> = {};

globalToolRegistry.getAllTools().forEach(t => {
  aiTools[t.name] = VercelTool({
    description: t.description,
    parameters: t.inputSchema,
    // @ts-ignore
    execute: async (args: any) => {
      // 1. Execute actual tool
      const result = await globalToolRegistry.executeTool(t.name, args);
      // 2. Return data to LLM context
      return result.success ? (result.data || result.message) : { error: result.error };
    }
  });
});
