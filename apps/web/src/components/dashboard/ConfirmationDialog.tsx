"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircleIcon, TrashIcon, XIcon, CheckIcon } from "@/components/ui/icons";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  variant?: "danger" | "warning" | "info" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = "confirm",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  isLoading = false,
  children,
}: ConfirmationDialogProps) {
  const handleConfirm = async () => {
    if (isLoading) return;
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    }
  };

  const variantStyles = {
    danger: {
      icon: AlertCircleIcon,
      iconClass: "text-destructive bg-destructive/10",
      titleClass: "text-destructive",
      confirmClass: "bg-destructive hover:bg-destructive/90",
    },
    warning: {
      icon: AlertCircleIcon,
      iconClass: "text-yellow-600 bg-yellow-600/10 dark:text-yellow-400 dark:bg-yellow-400/10",
      titleClass: "text-yellow-600 dark:text-yellow-400",
      confirmClass: "bg-yellow-600 hover:bg-yellow-600/90 text-yellow-600-foreground",
    },
    info: {
      icon: CheckIcon,
      iconClass: "text-primary bg-primary/10",
      titleClass: "",
      confirmClass: "",
    },
    confirm: {
      icon: CheckIcon,
      iconClass: "text-primary bg-primary/10",
      titleClass: "",
      confirmClass: "",
    },
  };

  const style = variantStyles[variant];
  const IconComponent = style.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                style.iconClass
              )}
              aria-hidden="true"
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogTitle className={cn("text-lg font-semibold", style.titleClass)}>
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close dialog"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {children && <div className="mt-4">{children}</div>}

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn(style.confirmClass)}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Specialized confirmation dialogs
export const ConfirmDialogs = {
  Delete: ({
    open,
    onOpenChange,
    itemName,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itemName: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
  }) => (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete item"
      description={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      variant="danger"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  ),

  DiscardChanges: ({
    open,
    onOpenChange,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
  }) => (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Discard changes"
      description="You have unsaved changes. Are you sure you want to leave without saving?"
      variant="warning"
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  ),

  ConfirmAction: ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    isLoading,
    confirmLabel = "Confirm",
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    isLoading?: boolean;
    confirmLabel?: string;
  }) => (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant="confirm"
      confirmLabel={confirmLabel}
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      isLoading={isLoading}
    />
  ),
};