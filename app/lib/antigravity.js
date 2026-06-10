/**
 * Antigravity Core Utility
 * Standard pattern for Agent-based state management
 */

/**
 * createAgent
 * Factory function to create a standardized Antigravity Agent
 */
export function createAgent(config) {
  return {
    name: config.name,
    initialState: config.initialState,
    useActions: (state, setState) => {
      return config.actions(state, setState);
    }
  };
}
