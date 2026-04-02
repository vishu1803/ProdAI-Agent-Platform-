import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { Tool, ToolResponse } from "../Tool";

export class TodoWriteTool extends Tool<{ taskTitle: string, description: string }> {
  readonly name = "TodoWriteTool";
  readonly description = "Adds a task to the agent's internal persistent TODO list (.agent-todos.json).";
  
  readonly inputSchema = z.object({
    taskTitle: z.string().describe("Short title of the task"),
    description: z.string().describe("Details of execution")
  });

  async execute(input: { taskTitle: string, description: string }): Promise<ToolResponse> {
    try {
      const targetPath = path.resolve(process.cwd(), ".agent-todos.json");
      let currentTodos = [];
      try {
        const fileData = await fs.readFile(targetPath, "utf-8");
        currentTodos = JSON.parse(fileData);
      } catch (e) {
        // file doesn't exist
      }

      currentTodos.push({
        id: Date.now().toString(),
        title: input.taskTitle,
        description: input.description,
        status: "PENDING",
        created: new Date().toISOString()
      });

      await fs.writeFile(targetPath, JSON.stringify(currentTodos, null, 2), "utf-8");
      return {
        success: true,
        message: `Task successfully written to Todo system.`,
        data: { id: currentTodos[currentTodos.length - 1].id }
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
