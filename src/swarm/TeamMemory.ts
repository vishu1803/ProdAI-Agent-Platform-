// Team Memory Store for Agent Swarm Context
export class TeamMemoryStore {
  private store: Record<string, string> = {};

  set(key: string, value: string) {
    this.store[key] = value;
  }

  get(key: string): string | undefined {
    return this.store[key];
  }

  getAll(): Record<string, string> {
    return { ...this.store };
  }
  
  clear() {
    this.store = {};
  }
}

// Global instance shared memory across all executing agents in the Node process
export const globalTeamMemory = new TeamMemoryStore();
