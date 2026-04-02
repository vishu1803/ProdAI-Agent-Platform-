import { z } from "zod";
import { Tool, ToolResponse } from "../Tool";
import * as cheerio from "cheerio";

export interface WebFetchInput {
  url: string;
}

export class WebFetchTool extends Tool<WebFetchInput> {
  readonly name = "WebFetchTool";
  readonly description = "Fetch and scrape a webpage's textual content. Useful for reading API documentation or searching the web.";
  
  readonly inputSchema = z.object({
    url: z.string().url().describe("The URL to fetch.")
  });

  async execute(input: WebFetchInput): Promise<ToolResponse> {
    if (!input.url) return { success: false, error: "Missing url" };

    try {
      const res = await fetch(input.url);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const text = await res.text();
      
      const $ = cheerio.load(text);
      // Clean up irrelevant nodes
      $("script, style, noscript, svg, nav, footer").remove();
      
      const content = $("body").text().replace(/\s+/g, " ").trim(); 
      // Cap at 10k characters to save LLM context
      const truncated = content.length > 10000 ? content.substring(0, 10000) + "...(truncated)" : content;
      
      return {
        success: true,
        message: `Successfully scraped ${input.url}`,
        data: { text: truncated }
      };
    } catch (error: any) {
      return { success: false, error: `Fetch error: ${error.message}` };
    }
  }
}
