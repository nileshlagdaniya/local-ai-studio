"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, RefreshCwIcon, HomeIcon, XIcon } from "@/components/ui/icons";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showRetry?: boolean;
  showHomeLink?: boolean;
  className?: string;
  variant?: "page" | "card" | "inline" | "toast";
}

type Variant = "page" | "card" | "inline" | "toast";

export function ErrorState({
  title = "Something went wrong",
  message,
  error,
  onRetry,
  onDismiss,
  showRetry = true,
  showHomeLink = false,
  className,
  variant = "page",
}: ErrorStateProps) {
  const errorMessage = message || error?.message || "An unexpected error occurred. Please try again.";

  const variants = {
    page: "flex flex-col items-center justify-center text-center py-12 px-4 min-h-[60vh]",
    card: "p-6 text-center",
    inline: "p-4",
    toast: "p-3",
  };

  const iconSizes = {
    page: "h-12 w-12",
    card: "h-10 w-10",
    inline: "h-8 w-8",
    toast: "h-5 w-5",
  };

  const titleSizes = {
    page: "text-xl",
    card: "text-lg",
    inline: "text-base",
    toast: "text-sm",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-destructive/10 text-destructive",
        variants[variant],
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col items-center gap-3 w-full">
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-destructive/20 text-destructive",
            iconSizes[variant]
          )}
          aria-hidden="true"
        >
          <AlertCircleIcon className={cn(iconSizes[variant].replace("h-", "").replace("w-", ""))} />
        </div>

        <div className="space-y-1 w-full max-w-md">
          <h3 className={cn("font-semibold", titleSizes[variant])}>{title}</h3>
          <p className={cn("text-muted-foreground", variant === "page" ? "text-base" : "text-sm")}>
            {errorMessage}
          </p>
          {error && process.env.NODE_ENV === "development" && (
            <details className="mt-2 text-left text-xs text-muted-foreground">
              <summary className="cursor-pointer">Error details</summary>
              <pre className="mt-1 p-2 overflow-auto rounded bg-background">{error.stack}</pre>
            </details>
          )}
        </div>

        <div className={cn("flex flex-wrap items-center justify-center gap-2 mt-4 w-full", variant === "inline" && "mt-2")}>
          {showRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="gap-2"
              disabled={onRetry === undefined}
            >
              <RefreshCwIcon className="h-4 w-4" />
              Try again
            </Button>
          )}

          {showHomeLink && (
            <a href="/dashboard/overview" className={cn(
              "inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline",
              variant === "toast" && "text-xs"
            )}>
              <HomeIcon className="h-4 w-4" />
              Go to Dashboard
            </a>
          )}

          {onDismiss && (variant as Variant) !== "toast" && (
            <button
              onClick={onDismiss}
              className={cn(
                "p-1 rounded text-muted-foreground hover:text-foreground transition-colors",
                variant === "toast" && "absolute right-2 top-2"
              )}
              aria-label="Dismiss error"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: unknown[];
  resetOnPropsChange?: boolean;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetKeys && this.props.resetOnPropsChange) {
      const hasResetKeyChanged = this.props.resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );
      if (hasResetKeyChanged) {
        this.reset();
      }
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          error={this.state.error}
          onRetry={this.reset}
          variant="card"
          showHomeLink
        />
      );
    }

    return this.props.children;
  }
}

// Hook for handling errors in client components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((err: Error) => {
    setError(err);
    console.error("Error caught:", err);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

// Async error wrapper for server components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}