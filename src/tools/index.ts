import { globalToolRegistry } from "./ToolRegistry";
import { globalMCPClient } from "../mcp/MCPClient";
import { FileReadTool } from "./implementations/FileReadTool";
import { FileWriteTool } from "./implementations/FileWriteTool";
import { BashTool } from "./implementations/BashTool";
import { GlobTool } from "./implementations/GlobTool";
import { WebFetchTool } from "./implementations/WebFetchTool";
import { SystemTimeTool } from "./implementations/SystemTimeTool";
import { GrepTool } from "./implementations/GrepTool";
import { WebSearchTool } from "./implementations/WebSearchTool";
import { LSPCheckTool } from "./implementations/LSPCheckTool";
import { TodoWriteTool } from "./implementations/TodoWriteTool";
import { TaskDelegateTool } from "./implementations/TaskDelegateTool";
import { ScheduleCronTool } from "./implementations/ScheduleCronTool";
import { RemoteTriggerTool } from "./implementations/RemoteTriggerTool";
import { MemoryWriteTool } from "./implementations/MemoryWriteTool";
import { MemoryReadTool } from "./implementations/MemoryReadTool";

// Instantiate the core tools
const fileReadTool = new FileReadTool();
const fileWriteTool = new FileWriteTool();
const bashTool = new BashTool();
const globTool = new GlobTool();
const webFetchTool = new WebFetchTool();
const systemTimeTool = new SystemTimeTool();
const grepTool = new GrepTool();
const webSearchTool = new WebSearchTool();
const lspCheckTool = new LSPCheckTool();
const todoWriteTool = new TodoWriteTool();
const taskDelegateTool = new TaskDelegateTool();
const scheduleCronTool = new ScheduleCronTool();
const remoteTriggerTool = new RemoteTriggerTool();
const memoryWriteTool = new MemoryWriteTool();
const memoryReadTool = new MemoryReadTool();

// Register them eagerly so they are available application-wide
globalToolRegistry.register(fileReadTool);
globalToolRegistry.register(fileWriteTool);
globalToolRegistry.register(bashTool);
globalToolRegistry.register(globTool);
globalToolRegistry.register(webFetchTool);
globalToolRegistry.register(systemTimeTool);
globalToolRegistry.register(grepTool);
globalToolRegistry.register(webSearchTool);
globalToolRegistry.register(lspCheckTool);
globalToolRegistry.register(todoWriteTool);
globalToolRegistry.register(taskDelegateTool);
globalToolRegistry.register(scheduleCronTool);
globalToolRegistry.register(remoteTriggerTool);
globalToolRegistry.register(memoryWriteTool);
globalToolRegistry.register(memoryReadTool);

// Initialize external MCP environments
globalMCPClient.connect({
  id: "sqlite_mcp_mock",
  endpoint: "stdio://local-db-binary",
  type: "stdio"
});

export { globalToolRegistry };
export * from "./Tool";
export * from "./ToolRegistry";
