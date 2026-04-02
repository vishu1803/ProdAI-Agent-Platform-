import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export interface GlobInput {
  pattern: string;
}

export class GlobTool extends Tool<GlobInput> {
  readonly name = "GlobTool";
  readonly description = "Find files by glob pattern in the workspace. Returns a list of matching file paths. (e.g. '**/*.ts')";
  
  readonly inputSchema = z.object({
    pattern: z.string().describe("The glob pattern to match files against.")
  });

  async execute(input: GlobInput): Promise<ToolResponse> {
    if (!input.pattern) return { success: false, error: "Missing pattern" };

    try {
      // Dynamic import to avoid ESM/CJS interop issues at build time
      const fg = require("fast-glob");
      const parentDir = process.cwd();
      const files = await fg(input.pattern, { cwd: parentDir, onlyFiles: true });
      return {
        success: true,
        message: `Found ${files.length} files matching ${input.pattern}`,
        data: files
      };
    } catch (error: any) {
      return { success: false, error: `Glob error: ${error.message}` };
    }
  }
}
