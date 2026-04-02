import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { Tool, ToolResponse } from "../Tool";

const execAsync = promisify(exec);

export class GrepTool extends Tool<{ regex: string; directory?: string }> {
  readonly name = "GrepTool";
  readonly description = "Search your codebase using grep. Very fast search for variables or functions.";
  
  readonly inputSchema = z.object({
    regex: z.string().describe("The string or regex pattern to search for"),
    directory: z.string().describe("Directory to search in. Defaults to workspace root.").optional()
  });

  async execute(input: { regex: string; directory?: string }): Promise<ToolResponse> {
    try {
      const searchPath = input.directory || process.cwd();
      // Using generic grep recursively
      const command = `grep -Rn "${input.regex}" ${searchPath} | head -n 50`;
      
      const { stdout } = await execAsync(command);
      return {
        success: true,
        message: `Grep found results for '${input.regex}'`,
        data: { matches: stdout }
      };
    } catch (e: any) {
      if (e.code === 1) {
        return { success: true, message: `No results found for '${input.regex}'`, data: { matches: "" } };
      }
      return { success: false, error: e.message };
    }
  }
}
