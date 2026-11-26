"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card" | "stat" | "table-row";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseStyles = "animate-pulse rounded bg-muted overflow-hidden";

  const variantStyles = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-lg border bg-card",
    stat: "rounded-lg border bg-card p-6",
    "table-row": "h-12",
  };

  const skeletons = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={cn(baseStyles, variantStyles[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  ));

  return count === 1 ? skeletons[0] : <>{skeletons}</>;
}

// Pre-built skeleton components matching actual UI components
export const Skeletons = {
  // Page header skeleton
  PageHeader: () => (
    <div className="space-y-4" aria-label="Loading page header">
      <Skeleton variant="text" width="1/4" />
      <Skeleton variant="text" width="1/2" />
    </div>
  ),

  // Stat card skeleton
  StatCard: () => (
    <Skeleton variant="stat" className="min-h-[120px]" />
  ),

  // Stat card grid
  StatCardGrid: ({ count = 4 }: { count?: number }) => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading statistics">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} variant="stat" className="min-h-[120px]" />
      ))}
    </div>
  ),

  // Card skeleton
  Card: ({ lines = 3 }: { lines?: number }) => (
    <div className="space-y-3 p-6" aria-label="Loading card">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width="1/3" />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="2/3" className="text-2xl" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? "1/2" : "full"} />
        ))}
      </div>
    </div>
  ),

  // Table skeleton
  Table: ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="rounded-lg border" aria-label="Loading table">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} variant="text" width="3/4" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <Skeleton key={colIndex} variant="text" width={colIndex === 0 ? "full" : "3/4"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  ),

  // List item skeleton
  ListItem: ({ hasAvatar = true, lines = 2 }: { hasAvatar?: boolean; lines?: number }) => (
    <div className="flex gap-4 p-4" aria-label="Loading list item">
      {hasAvatar && <Skeleton variant="circular" width={40} height={40} />}
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="1/3" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? "1/2" : "full"} className="text-sm" />
        ))}
      </div>
    </div>
  ),

  // List skeleton
  List: ({ items = 5, ...props }: { items?: number } & Parameters<typeof Skeletons.ListItem>[0]) => (
    <div className="divide-y divide-border" aria-label="Loading list">
      {Array.from({ length: items }, (_, i) => (
        <Skeletons.ListItem key={i} {...props} />
      ))}
    </div>
  ),

  // Dashboard overview skeleton
  DashboardOverview: () => (
    <div className="space-y-6" aria-label="Loading dashboard">
      <Skeletons.PageHeader />
      <Skeletons.StatCardGrid />
      <Skeletons.Card lines={4} />
      <Skeletons.List items={3} hasAvatar={false} lines={1} />
    </div>
  ),

  // Form skeleton
  Form: ({ fields = 4 }: { fields?: number }) => (
    <div className="space-y-4" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton variant="text" width="1/4" />
          <Skeleton variant="rectangular" height={42} />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton variant="rectangular" width={120} height={40} />
        <Skeleton variant="rectangular" width={120} height={40} />
      </div>
    </div>
  ),

  // Chart skeleton
  Chart: ({ height = 300 }: { height?: number }) => (
    <div className="rounded-lg border bg-card p-4" aria-label="Loading chart" style={{ height }}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" width="1/3" />
        <Skeleton variant="text" width="1/4" />
      </div>
      <div className="h-full flex items-end justify-center gap-2" style={{ height: height - 60 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-muted animate-pulse"
            style={{
              height: `${20 + Math.random() * 60}%`,
              minHeight: "20%",
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  ),

  // Notification skeleton
  Notification: () => (
    <div className="flex items-start gap-3 p-3" aria-label="Loading notification">
      <Skeleton variant="circular" width={8} height={8} className="mt-1" />
      <div className="flex-1 space-y-1">
        <Skeleton variant="text" width="1/3" />
        <Skeleton variant="text" width="1/2" className="text-sm" />
        <Skeleton variant="text" width="1/4" className="text-xs" />
      </div>
    </div>
  ),

  // AI provider status skeleton
  AIProviderStatus: () => (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2" aria-label="Loading AI providers">
      {["Ollama", "FreeLLMAPI"].map((provider) => (
        <div key={provider} className="flex items-center gap-3 p-4 rounded-lg border bg-card">
          <Skeleton variant="circular" width={12} height={12} />
          <div className="flex-1 space-y-1">
            <Skeleton variant="text" width="1/2" />
            <Skeleton variant="text" width="1/3" className="text-sm" />
          </div>
          <Skeleton variant="circular" width={8} height={8} />
        </div>
      ))}
    </div>
  ),
};

// Full page skeleton wrapper
export function PageSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" style={{ animationDuration: "200ms" }}>
      {children}
    </div>
  );
}

// Shimmer effect for more realistic loading
export function ShimmerSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted animate-pulse",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "dark:before:via-white/10",
        className
      )}
      {...props}
    />
  );
}