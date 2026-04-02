import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

const execAsync = promisify(exec);

export interface BashInput {
  command: string;
}

export class BashTool extends Tool<BashInput> {
  readonly name = "BashTool";
  readonly description = "Executes arbitrary bash/terminal shell commands on the host machine. Used for running git, npm, or system scripts.";
  
  readonly inputSchema = z.object({
    command: z.string().describe("The exact shell command to execute.")
  });

  async execute(input: BashInput): Promise<ToolResponse> {
    if (!input.command) {
      return { success: false, error: "Missing command argument." };
    }

    try {
      const { stdout, stderr } = await execAsync(input.command);
      
      return {
        success: true,
        message: `Command executed successfully.`,
        data: {
          stdout,
          stderr,
        }
      };
    } catch (error: any) {
      // child_process exec throws if the command fails (exit code != 0)
      return { 
        success: false, 
        error: `Bash Error: Command failed with exit code ${error.code || 'unknown'}`,
        data: {
          stdout: error.stdout,
          stderr: error.stderr,
          message: error.message
        }
      };
    }
  }
}
