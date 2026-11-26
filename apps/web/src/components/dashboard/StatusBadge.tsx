"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "subtle" | "outline" | "dot";
  size?: "sm" | "md" | "lg";
  className?: string;
  showDot?: boolean;
  dotOnly?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dotColor: string }> = {
  // Job statuses
  pending: { label: "Pending", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-600/10 dark:bg-yellow-400/10", dotColor: "bg-yellow-500" },
  running: { label: "Running", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },
  completed: { label: "Completed", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  failed: { label: "Failed", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },
  cancelled: { label: "Cancelled", color: "text-muted-foreground", bg: "bg-muted", dotColor: "bg-muted-foreground" },
  queued: { label: "Queued", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-600/10 dark:bg-purple-400/10", dotColor: "bg-purple-500" },
  retrying: { label: "Retrying", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-600/10 dark:bg-orange-400/10", dotColor: "bg-orange-500" },

  // Provider statuses
  connected: { label: "Connected", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  disconnected: { label: "Disconnected", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },
  connecting: { label: "Connecting", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },
  error: { label: "Error", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },
  unhealthy: { label: "Unhealthy", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },
  healthy: { label: "Healthy", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  degraded: { label: "Degraded", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-600/10 dark:bg-yellow-400/10", dotColor: "bg-yellow-500" },

  // Module statuses
  enabled: { label: "Enabled", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  disabled: { label: "Disabled", color: "text-muted-foreground", bg: "bg-muted", dotColor: "bg-muted-foreground" },
  beta: { label: "Beta", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-600/10 dark:bg-purple-400/10", dotColor: "bg-purple-500" },
  alpha: { label: "Alpha", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-600/10 dark:bg-orange-400/10", dotColor: "bg-orange-500" },
  deprecated: { label: "Deprecated", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },
  coming_soon: { label: "Coming Soon", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },

  // Priority
  low: { label: "Low", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  normal: { label: "Normal", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },
  high: { label: "High", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-600/10 dark:bg-orange-400/10", dotColor: "bg-orange-500" },
  critical: { label: "Critical", color: "text-destructive", bg: "bg-destructive/10", dotColor: "bg-destructive" },

  // Generic
  active: { label: "Active", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  inactive: { label: "Inactive", color: "text-muted-foreground", bg: "bg-muted", dotColor: "bg-muted-foreground" },
  draft: { label: "Draft", color: "text-muted-foreground", bg: "bg-muted", dotColor: "bg-muted-foreground" },
  published: { label: "Published", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  archived: { label: "Archived", color: "text-muted-foreground", bg: "bg-muted", dotColor: "bg-muted-foreground" },
  processing: { label: "Processing", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },
  success: { label: "Success", color: "text-green-600 dark:text-green-400", bg: "bg-green-600/10 dark:bg-green-400/10", dotColor: "bg-green-500" },
  warning: { label: "Warning", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-600/10 dark:bg-yellow-400/10", dotColor: "bg-yellow-500" },
  info: { label: "Info", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-600/10 dark:bg-blue-400/10", dotColor: "bg-blue-500" },
};

const sizeStyles = {
  sm: { padding: "px-1.5 py-0.5 text-xs", dot: "h-1.5 w-1.5", gap: "gap-1" },
  md: { padding: "px-2 py-0.5 text-sm", dot: "h-2 w-2", gap: "gap-1.5" },
  lg: { padding: "px-3 py-1 text-base", dot: "h-2.5 w-2.5", gap: "gap-2" },
};

export function StatusBadge({
  status,
  variant = "default",
  size = "md",
  className,
  showDot = true,
  dotOnly = false,
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
    color: "text-muted-foreground",
    bg: "bg-muted",
    dotColor: "bg-muted-foreground",
  };

  const sizes = sizeStyles[size];

  if (dotOnly) {
    return (
      <span
        className={cn(
          "inline-flex items-center",
          sizes.gap,
          className
        )}
        title={config.label}
      >
        <span className={cn("rounded-full", sizes.dot, config.dotColor)} aria-hidden="true" />
        {!dotOnly && <span className={cn(config.color, sizes.padding.split(" ")[2])}>{config.label}</span>}
      </span>
    );
  }

  const variants = {
    default: cn("inline-flex items-center font-medium", sizes.padding, "rounded-full", config.bg, config.color),
    subtle: cn("inline-flex items-center font-medium", sizes.padding, "rounded-full", config.bg, config.color),
    outline: cn("inline-flex items-center font-medium", sizes.padding, "rounded-full", "border", config.color.replace("text-", "border-"), config.color, "bg-transparent"),
    dot: cn("inline-flex items-center font-medium", sizes.padding, "rounded-full", "bg-transparent", config.color),
  };

  return (
    <span
      className={cn(variants[variant], className)}
      role="status"
      aria-label={config.label}
    >
      {showDot && !dotOnly && <span className={cn("rounded-full", sizes.dot, config.dotColor)} aria-hidden="true" />}
      {!dotOnly && <span>{config.label}</span>}
    </span>
  );
}

// Status badge group for multiple statuses
interface StatusBadgeGroupProps {
  statuses: Array<{ status: string; count?: number }>;
  variant?: StatusBadgeProps["variant"];
  size?: StatusBadgeProps["size"];
  className?: string;
  maxVisible?: number;
}

export function StatusBadgeGroup({
  statuses,
  variant = "default",
  size = "sm",
  className,
  maxVisible = 3,
}: StatusBadgeGroupProps) {
  const visible = statuses.slice(0, maxVisible);
  const remaining = statuses.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} role="group" aria-label="Status badges">
      {visible.map(({ status, count }, index) => (
        <StatusBadge
          key={`${status}-${index}`}
          status={status}
          variant={variant}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <span className={cn("text-xs text-muted-foreground", sizeStyles[size].padding.split(" ")[2])}>
          +{remaining}
        </span>
      )}
    </div>
  );
}

// Progress badge with percentage
interface ProgressBadgeProps {
  value: number;
  max?: number;
  label?: string;
  variant?: "default" | "subtle";
  size?: StatusBadgeProps["size"];
  className?: string;
  showBar?: boolean;
}

export function ProgressBadge({
  value,
  max = 100,
  label,
  variant = "default",
  size = "md",
  className,
  showBar = false,
}: ProgressBadgeProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const sizes = sizeStyles[size];

  const getColor = (p: number) => {
    if (p >= 100) return "text-green-600 dark:text-green-400 bg-green-600/10 dark:bg-green-400/10";
    if (p >= 75) return "text-blue-600 dark:text-blue-400 bg-blue-600/10 dark:bg-blue-400/10";
    if (p >= 50) return "text-yellow-600 dark:text-yellow-400 bg-yellow-600/10 dark:bg-yellow-400/10";
    if (p >= 25) return "text-orange-600 dark:text-orange-400 bg-orange-600/10 dark:bg-orange-400/10";
    return "text-destructive bg-destructive/10";
  };

  const color = getColor(percentage);

  return (
    <div className={cn("inline-flex items-center gap-2", className)} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={label || "Progress"}>
      <span className={cn("inline-flex items-center font-medium", sizes.padding, "rounded-full", color)}>
        {label && <span>{label}</span>}
        <span>{Math.round(percentage)}%</span>
      </span>
      {showBar && (
        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden" style={{ minWidth: "6rem" }}>
          <div
            className="h-full bg-current rounded-full transition-all duration-300"
            style={{ width: `${percentage}%`, backgroundColor: color.includes("green") ? "rgb(34 197 94)" : color.includes("blue") ? "rgb(59 130 246)" : color.includes("yellow") ? "rgb(234 179 8)" : color.includes("orange") ? "rgb(249 115 22)" : "rgb(239 68 68)" }}
          />
        </div>
      )}
    </div>
  );
}