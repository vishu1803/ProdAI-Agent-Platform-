import { streamText, tool as VercelTool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { globalToolRegistry } from '../../../tools';
import { globalTelemetry } from '../../../telemetry';
import { auth } from '../../../auth';

import { aiTools } from '../../../tools/aiToolsAdapter';

export const maxDuration = 60; // Allow 60 seconds

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id || 'anonymous';

  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'), 
    system: "You are the Coordinator Agent of a production-ready Web App (Phase 9 architecture). You have direct access to bash, file reading, file writing, and swarm deployment tools. Use tools to answer questions autonomously, and delegate complex background tasks to Swarm sub-agents using TaskDelegateTool.",
    messages: messages,
    tools: aiTools,
    // @ts-ignore
    maxSteps: 5, // Allow the agent to call tools, read results, and reason again
    onFinish: async ({ usage }) => {
      // @ts-ignore
      await globalTelemetry.logTokens(usage.promptTokens || 0, usage.completionTokens || 0, userId);
    }
  });

  // @ts-ignore
  return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
}
