"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SparklesIcon, DownloadIcon, FilterIcon, SearchIcon, AlertCircleIcon, CheckCircleIcon, InfoIcon, AlertTriangleIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

const activities = [
  { id: 1, title: "Job completed", detail: "Stock content generation - 5 articles", time: "2 min ago", level: "success" },
  { id: 2, title: "Model updated", detail: "qwen2.5-coder:3b pulled successfully", time: "15 min ago", level: "info" },
  { id: 3, title: "Storage warning", detail: "Disk usage at 85% - cleanup recommended", time: "1 hour ago", level: "warning" },
  { id: 4, title: "New automation", detail: "Created 'Weekly Blog Posts' workflow", time: "3 hours ago", level: "success" },
  { id: 5, title: "Settings updated", detail: "AI provider priority changed to Ollama first", time: "Yesterday", level: "info" },
  { id: 6, title: "Job failed", detail: "Code review assistant - timeout after 120s", time: "Yesterday", level: "error" },
  { id: 7, title: "User login", detail: "New session started from Chrome on Windows", time: "2 days ago", level: "info" },
  { id: 8, title: "Backup completed", detail: "Database backup stored (127 MB)", time: "3 days ago", level: "success" },
  { id: 9, title: "API error", detail: "FreeLLMAPI returned 503 - fallback to Ollama", time: "4 days ago", level: "error" },
  { id: 10, title: "Module enabled", detail: "Knowledge Base module activated", time: "5 days ago", level: "info" },
];

const levelConfig: Record<string, { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; border: string }> = {
  success: { icon: CheckCircleIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400", border: "border-l-green-500" },
  error: { icon: AlertCircleIcon, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400", border: "border-l-red-500" },
  warning: { icon: AlertTriangleIcon, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400", border: "border-l-yellow-500" },
  info: { icon: InfoIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400", border: "border-l-blue-500" },
};

export default function ActivityLogsPage() {
  const [filter, setFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filteredActivities = activities.filter((a) => {
    if (filter !== "all" && a.level !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Logs"
        description="System activity, audit trail, and event history"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Activity Logs" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search activities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search activities"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              {["all", "success", "info", "warning", "error"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md border transition-colors capitalize",
                    filter === level
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:bg-accent"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Showing {filteredActivities.length} of {activities.length} events</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const config = levelConfig[activity.level];
              const Icon = config.icon;
              return (
                <div key={activity.id} className={cn("flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors border-l-4", config.border)}>
                  <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5", config.color)}>
                    {createElement(Icon, { className: "h-4 w-4" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activity.title}</p>
                      <StatusBadge status={activity.level} variant="outline" size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              );
            })}
          </div>
          {filteredActivities.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No activities match your filters
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary">Basic Implementation</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity Logs displays system events with filtering and search. Full features like real-time streaming,
                log retention policies, structured logging (JSON), log aggregation, alerting rules, and SIEM integration
                are planned for future releases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}