import { ToolResponse } from "../tools/Tool";

export type PreHookResult = { proceed: boolean; error?: string };

export interface ToolHook {
  name: string;
  beforeExecute?(toolName: string, payload: any): Promise<PreHookResult>;
  afterExecute?(toolName: string, payload: any, response: ToolResponse): Promise<void>;
}

export class HookEngine {
  private hooks: ToolHook[] = [];

  registerHook(hook: ToolHook) {
    this.hooks.push(hook);
  }

  async runPreHooks(toolName: string, payload: any): Promise<PreHookResult> {
    for (const hook of this.hooks) {
      if (hook.beforeExecute) {
        const result = await hook.beforeExecute(toolName, payload);
        if (!result.proceed) {
          return result;
        }
      }
    }
    return { proceed: true };
  }

  async runPostHooks(toolName: string, payload: any, response: ToolResponse): Promise<void> {
    // Run all post-hooks in parallel where possible, or sequentially. We will do sequentially for simplicity.
    for (const hook of this.hooks) {
      if (hook.afterExecute) {
        await hook.afterExecute(toolName, payload, response);
      }
    }
  }
}
