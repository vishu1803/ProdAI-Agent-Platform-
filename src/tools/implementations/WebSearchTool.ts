import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";

export class WebSearchTool extends Tool<{ query: string }> {
  readonly name = "WebSearchTool";
  readonly description = "Perform a web search. Good for finding up-to-date syntax or news.";
  
  readonly inputSchema = z.object({
    query: z.string().describe("What you want to search Google/DuckDuckGo for")
  });

  async execute(input: { query: string }): Promise<ToolResponse> {
    try {
      // For production, we mock this endpoint for safety until API keys (Tavily/SerpAPI) are provided.
      // But we will structure the return exactly as if the real API was called.
      return {
        success: true,
        message: `Mock Search Results for '${input.query}'`,
        data: {
          results: [
            { title: `Result 1 for ${input.query}`, url: "https://example.com/1", snippet: "Information snippet..." },
            { title: `Result 2 for ${input.query}`, url: "https://example.com/2", snippet: "Further context..." }
          ],
          note: "Tavily/Google Search API keys missing in .env.local. Using mock results."
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
