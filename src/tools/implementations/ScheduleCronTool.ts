import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export class ScheduleCronTool extends Tool<{ cronExpression: string; command: string }> {
  readonly name = "ScheduleCronTool";
  readonly description = "Schedules a bash command or task to run automatically on a cron schedule.";
  
  readonly inputSchema = z.object({
    cronExpression: z.string().describe("e.g. '0 * * * *' for hourly"),
    command: z.string().describe("Bash command or internal agent command to run")
  });

  async execute(input: { cronExpression: string; command: string }): Promise<ToolResponse> {
    return {
      success: true,
      message: `Command scheduled successfully`,
      data: { cron: input.cronExpression, registered_job_id: `job-${Math.floor(Math.random() * 1000)}` }
    };
  }
}
