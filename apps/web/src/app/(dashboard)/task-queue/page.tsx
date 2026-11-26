"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ListTodoIcon, SparklesIcon, ArrowRightIcon, PlayIcon, PauseIcon, RotateCcwIcon, XIcon, ClockIcon, CheckIcon, AlertCircleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

const jobs = [
  { id: "job-001", name: "Stock Analysis - Q4 2024", module: "Stock Factory", status: "completed", progress: 100, started: "10:23 AM", duration: "2m 34s", priority: "high" },
  { id: "job-002", name: "YouTube Script - Tech Review", module: "YouTube Factory", status: "running", progress: 65, started: "10:45 AM", duration: "—", priority: "normal" },
  { id: "job-003", name: "Social Media Batch", module: "Social Factory", status: "queued", progress: 0, started: "—", duration: "—", priority: "low" },
  { id: "job-004", name: "Code Review Assistant", module: "Developer Assistant", status: "failed", progress: 0, started: "Yesterday", duration: "1m 12s", priority: "high" },
  { id: "job-005", name: "Knowledge Base Sync", module: "Knowledge Base", status: "pending", progress: 0, started: "—", duration: "—", priority: "normal" },
  { id: "job-006", name: "Weekly Report Generation", module: "Business Automation", status: "retrying", progress: 30, started: "09:15 AM", duration: "—", priority: "critical" },
];

function StatCardSimple({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TaskQueuePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Queue"
        description="Monitor and manage background jobs and automation tasks"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Task Queue" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RotateCcwIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <ArrowRightIcon className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCardSimple label="Queued" value={jobs.filter((j) => j.status === "queued").length} icon={<ClockIcon className="h-5 w-5" />} color="text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCardSimple label="Running" value={jobs.filter((j) => j.status === "running").length} icon={<PlayIcon className="h-5 w-5" />} color="text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" />
        <StatCardSimple label="Completed" value={jobs.filter((j) => j.status === "completed").length} icon={<CheckIcon className="h-5 w-5" />} color="text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCardSimple label="Failed" value={jobs.filter((j) => j.status === "failed").length} icon={<AlertCircleIcon className="h-5 w-5" />} color="text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" />
        <StatCardSimple label="Total" value={jobs.length} icon={<ListTodoIcon className="h-5 w-5" />} color="text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>All submitted jobs with their current status</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{job.name}</p>
                    <StatusBadge status={job.priority} variant="outline" size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">{job.module}</p>
                </div>
                <StatusBadge status={job.status} variant="subtle" size="md" />
                <div className="w-32 text-right text-sm text-muted-foreground hidden md:block">
                  <p>{job.started}</p>
                  <p>{job.duration}</p>
                </div>
                {job.progress > 0 && job.progress < 100 && (
                  <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                )}
                <div className="flex items-center gap-1">
                  {job.status === "running" && (
                    <Button variant="ghost" size="icon" aria-label="Pause job"><PauseIcon className="h-4 w-4" /></Button>
                  )}
                  {job.status === "failed" && (
                    <Button variant="ghost" size="icon" aria-label="Retry job"><RotateCcwIcon className="h-4 w-4" /></Button>
                  )}
                  {job.status === "queued" && (
                    <Button variant="ghost" size="icon" aria-label="Cancel job"><XIcon className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary">Limited Functionality</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Task Queue shows job status and basic controls. Full features like job scheduling, retry policies,
                priority queues, distributed workers, and execution logs are planned for future releases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}