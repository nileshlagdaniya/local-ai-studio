/**
 * Centralized query keys for TanStack Query.
 */
export const queryKeys = {
  health: ["health"] as const,
  readiness: ["readiness"] as const,
  providers: ["providers"] as const,
  providerStatus: ["providers", "status"] as const,
  providerTest: (provider: string) => ["providers", "test", provider] as const,
  models: ["models"] as const,
  jobs: ["jobs"] as const,
  activityLogs: ["activity-logs"] as const,
} as const;
