"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Skeletons } from "@/components/dashboard/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useHealth,
  useReadiness,
  useProviderStatus,
  useModels,
  useRecentJobs,
  useRecentActivity,
  useTestProvider,
  ApiError,
} from "@/lib/api/hooks";
import { cn } from "@/lib/utils";
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckIcon,
  CpuIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  GlobeIcon,
  ListTodoIcon,
  RefreshCwIcon,
  SparklesIcon,
  XIcon,
} from "@/components/ui/icons";

// ---------- Loading skeletons (dimension-matched to prevent layout shift) ----------

function StatusCardSkeleton() {
  return (
    <Card className="min-h-[120px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-32 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function ListCardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Card className="min-h-[280px]">
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
            <div className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ModelsCardSkeleton() {
  return (
    <Card className="min-h-[200px]">
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="pt-0 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-40 animate-pulse rounded-full bg-muted" />
        ))}
      </CardContent>
    </Card>
  );
}

// ---------- Error state with retry ----------

function ErrorPanel({
  error,
  onRetry,
  label,
}: {
  error: unknown;
  onRetry: () => void;
  label: string;
}) {
  const message =
    error instanceof ApiError
      ? error.status === 0
        ? "Cannot reach the backend. Is it running on the configured URL?"
        : error.detail
      : "An unexpected error occurred.";
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
      <XIcon className="h-8 w-8 text-destructive" aria-hidden="true" />
      <div>
        <p className="font-medium text-destructive">Failed to load {label}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCwIcon className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

// ---------- Connection status dot ----------

function StatusDot({ state }: { state: "healthy" | "unhealthy" | "unknown" }) {
  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full",
        state === "healthy" && "bg-green-500",
        state === "unhealthy" && "bg-red-500",
        state === "unknown" && "bg-muted-foreground"
      )}
      aria-label={state}
    />
  );
}

// ---------- Main page ----------

export default function OverviewPage() {
  const health = useHealth();
  const readiness = useReadiness();
  const providerStatus = useProviderStatus();
  const models = useModels();
  const jobs = useRecentJobs(5);
  const activity = useRecentActivity(5);
  const testProvider = useTestProvider();
  const [testResult, setTestResult] = React.useState<string | null>(null);

  const backendOnline = health.isSuccess && !health.isError;

  const handleTestProvider = (provider: string) => {
    setTestResult(`Testing ${provider}...`);
    testProvider.mutate(
      { provider },
      {
        onSuccess: (res) => {
          setTestResult(
            res.success
              ? `${provider}: connected (${res.latency_ms}ms via ${res.model_tested})`
              : `${provider}: failed — ${res.error}`
          );
        },
        onError: (err) => {
          setTestResult(
            `${provider}: failed — ${err instanceof ApiError ? err.detail : "unknown error"}`
          );
        },
      }
    );
  };

  const healthState: "healthy" | "unhealthy" | "unknown" = health.isPending
    ? "unknown"
    : health.isError
      ? "unhealthy"
      : health.data?.status === "healthy"
        ? "healthy"
        : "unhealthy";

  const dbState: "healthy" | "unhealthy" | "unknown" = readiness.isPending
    ? "unknown"
    : readiness.isError
      ? "unhealthy"
      : readiness.data?.checks?.database === "ok"
        ? "healthy"
        : "unhealthy";

  const ollamaState = (() => {
    if (providerStatus.isPending) return "unknown" as const;
    const status = providerStatus.data?.ollama;
    if (!status) return "unknown" as const;
    return status.healthy ? ("healthy" as const) : ("unhealthy" as const);
  })();

  const freellmState = (() => {
    if (providerStatus.isPending) return "unknown" as const;
    const status = providerStatus.data?.freellmapi;
    if (!status) return "unknown" as const;
    return status.healthy ? ("healthy" as const) : ("unhealthy" as const);
  })();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Live system status from your local backend"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }]}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <StatusDot state={healthState} />
              Backend {health.isPending ? "checking…" : backendOnline ? "online" : "offline"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                health.refetch();
                readiness.refetch();
                providerStatus.refetch();
                models.refetch();
                jobs.refetch();
                activity.refetch();
              }}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Refresh all
            </Button>
          </div>
        }
      />

      {/* System status cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {health.isPending || readiness.isPending || providerStatus.isPending ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : (
          <>
            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Backend API</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                  <CpuIcon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusDot state={healthState} />
                  <span className="text-2xl font-bold capitalize">{healthState}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {health.data?.service ?? "local-ai-studio-api"}
                </p>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Database</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                  <DatabaseIcon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusDot state={dbState} />
                  <span className="text-2xl font-bold capitalize">{dbState}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">SQLite (local)</p>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ollama</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" aria-hidden="true">
                  <CpuIcon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusDot state={ollamaState} />
                  <span className="text-2xl font-bold capitalize">{ollamaState}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Local inference</p>
              </CardContent>
            </Card>

            <Card className="min-h-[120px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">FreeLLMAPI</CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" aria-hidden="true">
                  <GlobeIcon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <StatusDot state={freellmState} />
                  <span className="text-2xl font-bold capitalize">{freellmState}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Cloud fallback</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Provider test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            Connection Tests
          </CardTitle>
          <CardDescription>Run real connection tests against configured providers</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleTestProvider("ollama")} disabled={testProvider.isPending}>
              Test Ollama
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleTestProvider("freellmapi")} disabled={testProvider.isPending}>
              Test FreeLLMAPI
            </Button>
            {testResult && (
              <p
                className={cn(
                  "text-sm",
                  testResult.includes("failed") ? "text-destructive" : "text-green-600 dark:text-green-400"
                )}
                role="status"
                aria-live="polite"
              >
                {testResult}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Models */}
      {models.isPending ? (
        <ModelsCardSkeleton />
      ) : models.isError ? (
        <ErrorPanel error={models.error} onRetry={() => models.refetch()} label="installed models" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Installed Models</CardTitle>
            <CardDescription>Models available per provider (live from backend)</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {Object.entries(models.data ?? {}).every(([, list]) => list.length === 0) ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No models reported. Is Ollama running with a model installed?
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(models.data ?? {}).map(([provider, list]) =>
                  list.length > 0 ? (
                    <div key={provider}>
                      <p className="mb-2 text-sm font-medium capitalize">{provider}</p>
                      <div className="flex flex-wrap gap-2">
                        {list.map((model) => (
                          <span
                            key={model}
                            className="rounded-full border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
                          >
                            {model}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Jobs and activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {jobs.isPending ? (
          <ListCardSkeleton rows={4} />
        ) : jobs.isError ? (
          <div>
            <ErrorPanel error={jobs.error} onRetry={() => jobs.refetch()} label="recent jobs" />
          </div>
        ) : (
          <Card className="min-h-[280px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ListTodoIcon className="h-5 w-5 text-primary" />
                  Recent Jobs
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard/task-queue">
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    View Queue
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {jobs.data?.jobs?.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No jobs yet. Jobs you submit will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {(jobs.data?.jobs ?? []).map((job) => (
                    <div key={job.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{job.job_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.module_id ?? "—"} · {new Date(job.created_at).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={job.status.toLowerCase()} variant="subtle" size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activity.isPending ? (
          <ListCardSkeleton rows={4} />
        ) : activity.isError ? (
          <div>
            <ErrorPanel error={activity.error} onRetry={() => activity.refetch()} label="activity logs" />
          </div>
        ) : (
          <Card className="min-h-[280px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/dashboard/activity-logs">
                    <ExternalLinkIcon className="h-4 w-4 mr-1" />
                    View All
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activity.data?.logs?.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No activity recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {(activity.data?.logs ?? []).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3">
                      <StatusDot
                        state={
                          log.severity === "error"
                            ? "unhealthy"
                            : log.severity === "warning"
                              ? "unknown"
                              : "healthy"
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{log.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{log.message}</p>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}