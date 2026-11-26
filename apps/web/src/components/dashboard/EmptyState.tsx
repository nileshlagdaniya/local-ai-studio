"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FileTextIcon,
  FolderIcon,
  SearchIcon,
  InboxIcon,
  DatabaseIcon,
  SparklesIcon,
  AlertCircleIcon,
  InfoIcon,
} from "@/components/ui/icons";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: "documents" | "folder" | "search" | "inbox" | "database" | "ai" | "warning" | "info";
  action?: React.ReactNode;
  className?: string;
  illustration?: React.ReactNode;
}

const iconMap = {
  documents: FileTextIcon,
  folder: FolderIcon,
  search: SearchIcon,
  inbox: InboxIcon,
  database: DatabaseIcon,
  ai: SparklesIcon,
  warning: AlertCircleIcon,
  info: InfoIcon,
};

export function EmptyState({
  title,
  description,
  icon = "inbox",
  action,
  className,
  illustration,
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        "rounded-lg border bg-card",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {illustration ? (
        <div className="mb-4 text-muted-foreground/50">{illustration}</div>
      ) : (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/50">
          <IconComponent className="h-8 w-8" aria-hidden="true" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Pre-defined empty states for common scenarios
export const EmptyStates = {
  NoData: ({ onAction, actionLabel = "Get started" }: { onAction?: () => void; actionLabel?: string }) => (
    <EmptyState
      title="No data yet"
      description="Get started by creating your first item."
      icon="documents"
      action={onAction ? <Button onClick={onAction}>{actionLabel}</Button> : undefined}
    />
  ),
  NoResults: ({ query }: { query?: string }) => (
    <EmptyState
      title="No results found"
      description={query ? `No matches for "${query}"` : "Try adjusting your search or filters."}
      icon="search"
    />
  ),
  NoActivity: () => (
    <EmptyState
      title="No recent activity"
      description="Activity will appear here when you start using the platform."
      icon="inbox"
    />
  ),
  NoJobs: ({ onAction }: { onAction?: () => void }) => (
    <EmptyState
      title="No jobs in queue"
      description="Submit a task to see it appear here."
      icon="database"
      action={onAction ? <Button onClick={onAction}>Create Job</Button> : undefined}
    />
  ),
  ModuleNotImplemented: function ModuleNotImplemented({ moduleName }: { moduleName: string }) {
    return (
      <EmptyState
        title={`${moduleName} coming soon`}
        description="This module is under development. Check back later for updates."
        icon="ai"
        illustration={
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-16 w-16 text-primary/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <SparklesIcon className="h-12 w-12 text-primary/40 animate-pulse" />
            </div>
          </div>
        }
      />
    );
  },
  Error: ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
    <EmptyState
      title="Something went wrong"
      description={message || "An unexpected error occurred. Please try again."}
      icon="warning"
      action={onRetry ? <Button variant="outline" onClick={onRetry}>Try again</Button> : undefined}
    />
  ),
};
