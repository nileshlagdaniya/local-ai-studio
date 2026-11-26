"use client";

import * as React from "react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { StatCard, StatCardGrid } from "@/components/dashboard/StatCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  SparklesIcon,
  CpuIcon,
  FactoryIcon,
  YoutubeIcon,
  Share2Icon,
  ZapIcon,
  CodeIcon,
  BookOpenIcon,
  ListTodoIcon,
  ActivityIcon,
  SettingsIcon,
  DatabaseIcon,
  GlobeIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PlusIcon,
  ArrowRightIcon,
  RefreshCwIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons";
import { createElement } from "react";

export default function OverviewPage() {
  const stats = [
    {
      title: "Total Automations",
      value: "24",
      description: "Active workflows",
      trend: { value: 12, label: "vs last month" },
      icon: <SparklesIcon className="h-5 w-5" />,
      iconColor: "primary" as const,
    },
    {
      title: "Jobs Completed",
      value: "1,234",
      description: "This month",
      trend: { value: 8, label: "vs last month" },
      icon: <CheckIcon className="h-5 w-5" />,
      iconColor: "success" as const,
    },
    {
      title: "AI Tokens Used",
      value: "2.4M",
      description: "Local inference",
      trend: { value: -3, label: "vs last month" },
      icon: <CpuIcon className="h-5 w-5" />,
      iconColor: "warning" as const,
    },
    {
      title: "Storage Used",
      value: "847 MB",
      description: "of 5 GB available",
      trend: { value: 15, label: "this week" },
      icon: <DatabaseIcon className="h-5 w-5" />,
      iconColor: "muted" as const,
    },
  ];

  const aiProviders = [
    {
      name: "Ollama (Local)",
      status: "connected" as const,
      model: "qwen2.5-coder:3b",
      latency: "45ms",
      type: "local",
    },
    {
      name: "FreeLLMAPI (Cloud)",
      status: "disconnected" as const,
      model: "gpt-4o-mini",
      latency: "—",
      type: "cloud",
    },
  ];

  const recentActivity = [
    { id: 1, action: "Job completed", detail: "Stock content generation - 5 articles", time: "2 min ago", type: "success" },
    { id: 2, action: "Model pulled", detail: "qwen2.5-coder:3b updated to latest", time: "15 min ago", type: "info" },
    { id: 3, action: "Storage cleanup", detail: "Removed 234 MB of temporary files", time: "1 hour ago", type: "warning" },
    { id: 4, action: "New automation", detail: "Created 'Weekly Blog Posts' workflow", time: "3 hours ago", type: "success" },
    { id: 5, action: "Settings updated", detail: "AI provider priority changed", time: "Yesterday", type: "info" },
  ];

  const recentJobs = [
    { id: "job-001", name: "Stock Analysis - Q4 2024", module: "Stock Factory", status: "completed", progress: 100, started: "10:23 AM", duration: "2m 34s" },
    { id: "job-002", name: "YouTube Script - Tech Review", module: "YouTube Factory", status: "running", progress: 65, started: "10:45 AM", duration: "—" },
    { id: "job-003", name: "Social Media Batch", module: "Social Factory", status: "queued", progress: 0, started: "—", duration: "—" },
    { id: "job-004", name: "Code Review Assistant", module: "Developer Assistant", status: "failed", progress: 0, started: "Yesterday", duration: "1m 12s" },
    { id: "job-005", name: "Knowledge Base Sync", module: "Knowledge Base", status: "pending", progress: 0, started: "—", duration: "—" },
  ];

  const quickActions = [
    { label: "Generate Stock Content", href: "/dashboard/stock-factory", icon: FactoryIcon, description: "Create financial content", variant: "primary" },
    { label: "Create YouTube Script", href: "/dashboard/youtube-factory", icon: YoutubeIcon, description: "Video content creation", variant: "secondary" },
    { label: "Social Media Posts", href: "/dashboard/social-factory", icon: Share2Icon, description: "Multi-platform content", variant: "secondary" },
    { label: "New Automation", href: "/dashboard/business-automation", icon: ZapIcon, description: "Build workflow", variant: "outline" },
    { label: "Code Assistant", href: "/dashboard/developer-assistant", icon: CodeIcon, description: "AI pair programming", variant: "outline" },
    { label: "Add Documents", href: "/dashboard/knowledge-base", icon: BookOpenIcon, description: "Knowledge management", variant: "outline" },
  ];

  const modules = [
    { name: "Stock Factory", icon: FactoryIcon, description: "Automated stock market content generation", status: "beta", href: "/dashboard/stock-factory" },
    { name: "YouTube Factory", icon: YoutubeIcon, description: "Script, title, and description generation", status: "alpha", href: "/dashboard/youtube-factory" },
    { name: "Social Factory", icon: Share2Icon, description: "Multi-platform social media content", status: "coming_soon", href: "/dashboard/social-factory" },
    { name: "Business Automation", icon: ZapIcon, description: "Workflow automation and scheduling", status: "coming_soon", href: "/dashboard/business-automation" },
    { name: "Developer Assistant", icon: CodeIcon, description: "Code generation and review assistance", status: "alpha", href: "/dashboard/developer-assistant" },
    { name: "Knowledge Base", icon: BookOpenIcon, description: "Document storage and RAG queries", status: "beta", href: "/dashboard/knowledge-base" },
    { name: "Task Queue", icon: ListTodoIcon, description: "Job management and monitoring", status: "enabled", href: "/dashboard/task-queue" },
    { name: "Activity Logs", icon: ActivityIcon, description: "System activity and audit trail", status: "enabled", href: "/dashboard/activity-logs" },
    { name: "Settings", icon: SettingsIcon, description: "Application configuration", status: "enabled", href: "/dashboard/settings" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Monitor your AI automations and system status at a glance"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Automation
            </Button>
          </div>
        }
      />

      <SectionHeading title="Automation Overview" />
      <StatCardGrid cards={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CpuIcon className="h-5 w-5 text-primary" />
                AI Provider Status
              </CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCwIcon className="h-4 w-4 mr-1" />
                Check
              </Button>
            </div>
            <CardDescription>Monitor your AI inference providers</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {aiProviders.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      provider.type === "local" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {provider.type === "local" ? <DatabaseIcon className="h-5 w-5" /> : <GlobeIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.model}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={provider.status} variant="default" size="md" />
                    {provider.latency !== "—" && (
                      <span className="text-sm text-muted-foreground">{provider.latency}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Start a new automation task</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-primary/50 hover:bg-accent/50",
                    action.variant === "primary" && "border-primary/30 bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    action.variant === "primary" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {createElement(action.icon, { className: "h-5 w-5" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{action.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
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
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className={cn(
                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                    activity.type === "success" && "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
                    activity.type === "warning" && "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
                    activity.type === "info" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {activity.type === "success" && <CheckIcon className="h-4 w-4" />}
                    {activity.type === "warning" && <ClockIcon className="h-4 w-4" />}
                    {activity.type === "info" && <FileTextIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
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
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{job.name}</p>
                    <p className="text-xs text-muted-foreground">{job.module}</p>
                  </div>
                  <StatusBadge status={job.status} variant="subtle" size="sm" />
                  <div className="text-right w-24 text-xs text-muted-foreground hidden sm:block">
                    <p>{job.started}</p>
                    <p>{job.duration}</p>
                  </div>
                  {job.progress > 0 && job.progress < 100 && (
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeading
        title="Automation Modules"
        description="Available modules for your AI workflows"
        action={
          <Button variant="ghost" size="sm" asChild>
            <a href="/dashboard/settings">
              Manage Modules
              <ArrowRightIcon className="h-4 w-4 ml-1" />
            </a>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <a
            key={module.name}
            href={module.href}
            className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all"
          >
            <div className={cn(
              "flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center",
              module.status === "enabled" || module.status === "beta" ? "bg-primary/10 text-primary" :
              module.status === "alpha" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
              module.status === "coming_soon" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
              "bg-muted text-muted-foreground"
            )}>
              {createElement(module.icon, { className: "h-6 w-6" })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">{module.name}</h3>
                <StatusBadge status={module.status} variant="outline" size="sm" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{module.description}</p>
            </div>
            <ArrowRightIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </a>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary">Modules Under Development</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stock Factory, YouTube Factory, Social Factory, Business Automation, and Developer Assistant
                are currently in development. The navigation items are placeholders for future functionality.
                Task Queue, Activity Logs, and Settings are available but have limited features in this preview.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}