"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "./Breadcrumbs";
import { ArrowRightIcon, ExternalLinkIcon, PlusIcon, RefreshCwIcon, SparklesIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-base text-muted-foreground">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 sm:ml-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({ title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action && <div className="sm:ml-auto">{action}</div>}
    </div>
  );
}

// Pre-built action buttons
export const PageHeaderActions = {
  Primary: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button onClick={onClick} {...props}>{children}</Button>
  ),
  Secondary: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button variant="outline" onClick={onClick} {...props}>{children}</Button>
  ),
  Ghost: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button variant="ghost" onClick={onClick} {...props}>{children}</Button>
  ),
  Refresh: ({ onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button variant="outline" size="icon" onClick={onClick} disabled={disabled} {...props}>
      <RefreshCwIcon className={cn("h-4 w-4", disabled && "animate-spin")} />
      <span className="sr-only">Refresh</span>
    </Button>
  ),
  New: ({ onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <Button onClick={onClick} {...props}>
      <PlusIcon className="h-4 w-4 mr-2" />
      New
    </Button>
  ),
  ExternalLink: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-1.5 text-sm text-primary hover:underline", props.className)}>
      {children}
      <ExternalLinkIcon className="h-3.5 w-3.5" />
    </a>
  ),
};