import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export interface FileReadInput {
  filePath: string;
}

export class FileReadTool extends Tool<FileReadInput> {
  readonly name = "FileReadTool";
  readonly description = "Reads the content of a file on the local filesystem. Use this to inspect source code.";
  
  readonly inputSchema = z.object({
    filePath: z.string().describe("Absolute or relative path to the file to read.")
  });

  async execute(input: FileReadInput): Promise<ToolResponse> {
    if (!input.filePath) {
      return { success: false, error: "Missing filePath argument." };
    }

    try {
      const targetPath = path.resolve(process.cwd(), input.filePath);
      const content = await fs.readFile(targetPath, "utf-8");
      
      return {
        success: true,
        message: `Successfully read file: ${input.filePath}`,
        data: {
          content,
          length: content.length,
          absolutePath: targetPath,
        }
      };
    } catch (error: any) {
      return { success: false, error: `FS Error: Failed to read file at ${input.filePath}: ${error.message}` };
    }
  }
}
