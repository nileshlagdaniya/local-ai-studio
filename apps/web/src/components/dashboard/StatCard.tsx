"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "@/components/ui/icons";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  iconColor?: "primary" | "success" | "warning" | "destructive" | "muted";
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  iconColor = "primary",
  className,
}: StatCardProps) {
  const iconColors = {
    primary: "text-primary bg-primary/10",
    success: "text-green-600 bg-green-600/10 dark:text-green-400 dark:bg-green-400/10",
    warning: "text-yellow-600 bg-yellow-600/10 dark:text-yellow-400 dark:bg-yellow-400/10",
    destructive: "text-destructive bg-destructive/10",
    muted: "text-muted-foreground bg-muted",
  };

  const trendColor = trend
    ? trend.value > 0
      ? "text-green-600 dark:text-green-400"
      : trend.value < 0
      ? "text-destructive"
      : "text-muted-foreground"
    : "text-muted-foreground";

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUpIcon
      : trend.value < 0
      ? TrendingDownIcon
      : MinusIcon
    : null;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconColors[iconColor]
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          {trend && (
            <>
              {(trend.value > 0 ? <TrendingUpIcon /> : trend.value < 0 ? <TrendingDownIcon /> : <MinusIcon />) as React.ReactElement
              }
              <span className={cn("font-medium", trendColor)}>
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground">{trend.label}</span>
              )}
            </>
          )}
          {description && !trend && (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout for stat cards
interface StatCardGridProps {
  cards: StatCardProps[];
  className?: string;
}

export function StatCardGrid({ cards, className }: StatCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      role="list"
      aria-label="Statistics"
    >
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}