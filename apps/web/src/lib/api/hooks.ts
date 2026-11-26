"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./client";
import { queryKeys } from "./query-keys";

/**
 * Backend health check.
 */
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: api.getHealth,
    staleTime: 10_000,
    retry: 1,
  });
}

/**
 * Backend readiness (database connectivity, etc.).
 */
export function useReadiness() {
  return useQuery({
    queryKey: queryKeys.readiness,
    queryFn: api.getReadiness,
    staleTime: 10_000,
    retry: 1,
  });
}

/**
 * AI provider availability and health.
 */
export function useProviderStatus() {
  return useQuery({
    queryKey: queryKeys.providerStatus,
    queryFn: api.getProvidersStatus,
    staleTime: 30_000,
    retry: 1,
  });
}

/**
 * Installed models per provider.
 */
export function useModels() {
  return useQuery({
    queryKey: queryKeys.models,
    queryFn: api.listModels,
    staleTime: 60_000,
    retry: 1,
  });
}

/**
 * Recent automation jobs.
 */
export function useRecentJobs(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.jobs, limit],
    queryFn: () => api.listJobs(limit),
    staleTime: 15_000,
    retry: 1,
  });
}

/**
 * Recent activity logs.
 */
export function useRecentActivity(limit = 10) {
  return useQuery({
    queryKey: [...queryKeys.activityLogs, limit],
    queryFn: () => api.listActivityLogs(limit),
    staleTime: 15_000,
    retry: 1,
  });
}

/**
 * Test a provider connection (mutation — manual retry action).
 */
export function useTestProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ provider, model }: { provider: string; model?: string }) =>
      api.testProvider(provider, model),
    onSuccess: () => {
      // Refresh provider status after a test
      queryClient.invalidateQueries({ queryKey: queryKeys.providerStatus });
    },
  });
}

/**
 * Send a chat message to the AI (non-streaming).
 */
export function useChat() {
  return useMutation({ mutationFn: api.chat });
}

export { ApiError };
