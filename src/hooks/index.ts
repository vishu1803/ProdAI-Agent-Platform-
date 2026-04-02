import { HookEngine, ToolHook } from "./HookEngine";
import { globalTelemetry } from "../telemetry";

export const globalHookEngine = new HookEngine();

/**
 * 1. Telemetry Logging Hook
 * Automatically logs to the local JSON Database every time a tool succeeds.
 */
const telemetryHook: ToolHook = {
  name: "TelemetryLoggingHook",
  async afterExecute(toolName, payload, response) {
    if (response.success) {
      await globalTelemetry.logToolExecution(toolName);
    }
  }
};

/**
 * 2. Basic Permission Engine Hook
 * Simulates a permissions check by blocking dangerous requests locally.
 */
const permissionHook: ToolHook = {
  name: "BasicBashPermissionHook",
  async beforeExecute(toolName, payload) {
    if (toolName === "BashTool" && payload && typeof payload.command === "string") {
      if (payload.command.includes("rm -rf")) {
        return { proceed: false, error: "'rm -rf' commands are strictly forbidden by security hooks." };
      }
    }
    return { proceed: true };
  }
};

globalHookEngine.registerHook(telemetryHook);
globalHookEngine.registerHook(permissionHook);

export * from "./HookEngine";
