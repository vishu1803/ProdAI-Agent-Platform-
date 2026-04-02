import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { Tool, ToolResponse } from "../Tool";

const execAsync = promisify(exec);

export class LSPCheckTool extends Tool<{ workspacePath?: string }> {
  readonly name = "LSPCheckTool";
  readonly description = "Uses TypeScript Compiler (TSC) to check the workspace for type errors, acting as a Language Server.";
  
  readonly inputSchema = z.object({
    workspacePath: z.string().describe("Directory to run tsc in. Defaults to root.").optional()
  });

  async execute(input: { workspacePath?: string }): Promise<ToolResponse> {
    try {
      const searchPath = input.workspacePath || process.cwd();
      const command = `npx tsc --noEmit`;
      
      const { stdout } = await execAsync(command, { cwd: searchPath });
      return {
        success: true,
        message: `No TypeScript errors found!`,
        data: { stdout }
      };
    } catch (e: any) {
      // TSC returns exit code 1 or 2 when it finds type errors
      return { 
        success: true, // We successfully RAN the tool
        message: `TypeScript type errors found.`, 
        data: { 
           errors: e.stdout ? e.stdout.substring(0, 5000) : "Unknown compilation error" 
        } 
      };
    }
  }
}
