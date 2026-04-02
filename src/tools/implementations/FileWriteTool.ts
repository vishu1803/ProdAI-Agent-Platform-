import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export interface FileWriteInput {
  filePath: string;
  content: string;
}

export class FileWriteTool extends Tool<FileWriteInput> {
  readonly name = "FileWriteTool";
  readonly description = "Writes content to a file on the local filesystem. Use this to generate or modify code files.";
  
  readonly inputSchema = z.object({
    filePath: z.string().describe("Absolute or relative path to the file to write to."),
    content: z.string().describe("The complete string content to write.")
  });

  async execute(input: FileWriteInput): Promise<ToolResponse> {
    if (!input.filePath || input.content === undefined) {
      return { success: false, error: "Missing filePath or content argument." };
    }

    try {
      const targetPath = path.resolve(process.cwd(), input.filePath);
      // Ensure directory exists
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, input.content, "utf-8");
      
      return {
        success: true,
        message: `Successfully wrote to file: ${input.filePath}`,
        data: {
          absolutePath: targetPath,
          bytesWritten: Buffer.byteLength(input.content, 'utf8')
        }
      };
    } catch (error: any) {
      return { success: false, error: `FS Error: Failed to write file at ${input.filePath}: ${error.message}` };
    }
  }
}
