export interface ExecutorSetup {
  endpoint: string;
  authorizationHeader: string;
}

export function buildExecutorSetup(endpoint: string): ExecutorSetup {
  return {
    endpoint,
    authorizationHeader: "Bearer <paste your token>",
  };
}
