/**
 * Centralized API client for Local AI Studio backend.
 * Base URL from env — never hardcode URLs in components.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    public endpoint: string
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
};

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal, timeoutMs = 30_000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Allow caller signal to abort too
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        detail = errorData.detail ?? detail;
      } catch {
        // Response body wasn't JSON
      }
      throw new ApiError(response.status, detail, endpoint);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(0, "Request timed out", endpoint);
    }
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error",
      endpoint
    );
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort);
  }
}

// ---------- Typed API ----------

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ReadinessResponse {
  status: string;
  checks: Record<string, string>;
}

export interface ProviderInfo {
  provider: string;
  name: string;
  type: string;
  healthy: boolean;
  models: string[];
}

export interface ProviderStatus {
  configured: boolean;
  healthy: boolean;
}

export interface ProviderTestResponse {
  provider: string;
  success: boolean;
  latency_ms: number | null;
  error: string | null;
  model_tested: string | null;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
  latency_ms: number;
}

export interface JobDto {
  id: string;
  type: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
  priority: number;
  progress: number;
  payload: unknown;
  result: unknown | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  module_id: string | null;
  user_id: string | null;
}

export interface ActivityLogDto {
  id: string;
  event_type: string;
  event_category: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
}

export const api = {
  // Health
  getHealth: () => request<HealthResponse>("/health"),
  getReadiness: () => request<ReadinessResponse>("/health/ready"),

  // AI providers
  listProviders: () => request<{ providers: string[] }>("/api/v1/providers"),
  getProvidersStatus: () =>
    request<Record<string, ProviderStatus>>("/api/v1/providers/status"),
  testProvider: (provider: string, model?: string) =>
    request<ProviderTestResponse>(`/api/v1/providers/${provider}/test`, {
      method: "POST",
      body: { model, test_prompt: "Connection test." },
      timeoutMs: 60_000,
    }),
  listModels: () =>
    request<Record<string, string[]>>("/api/v1/models"),
  chat: (body: {
    prompt: string;
    model: string;
    provider?: string;
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: false;
  }) =>
    request<ChatResponse>("/api/v1/ai/chat", {
      method: "POST",
      body: { ...body, stream: false },
      timeoutMs: 300_000,
    }),

  // Jobs
  listJobs: (limit = 10) =>
    request<{ jobs: JobDto[] }>(`/api/jobs?limit=${limit}`),

  // Activity logs - not yet exposed; will fail gracefully
  listActivityLogs: (limit = 10) =>
    request<{ logs: ActivityLogDto[] }>(`/api/activity?limit=${limit}`),
};
