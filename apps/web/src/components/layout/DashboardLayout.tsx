"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { XIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebarCollapsed");
    if (stored !== null) {
      setSidebarCollapsed(JSON.parse(stored));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, mounted]);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleMobileMenuClick = () => {
    setMobileSidebarOpen(true);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background" aria-hidden="true">
        <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar" />
        <div className="ml-64 min-h-screen">
          <div className="h-16 border-b bg-background/95 backdrop-blur" />
          <main className="p-6" role="main">
            <div className="animate-pulse space-y-6 max-w-4xl">
              <div className="h-8 w-1/4 bg-muted rounded" />
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-muted rounded-lg border" />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 max-h-screen"
          style={{ padding: 0 }}
        >
          <div className="flex h-16 items-center justify-between px-4 border-b">
            <span className="text-xl font-semibold">Navigation</span>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Close sidebar"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          <AppSidebar isCollapsed={false} onToggle={toggleSidebar} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <AppSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        className="hidden lg:block"
      />

      {/* Main content area */}
      <div className={cn("min-h-screen transition-all duration-200", sidebarCollapsed ? "lg:ml-16" : "lg:ml-64")}>
        {/* Mobile header with menu button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 border-b bg-background/95 backdrop-blur">
          <AppHeader
            onMenuClick={handleMobileMenuClick}
            sidebarCollapsed={false}
          />
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <AppHeader
            onMenuClick={toggleSidebar}
            sidebarCollapsed={sidebarCollapsed}
          />
        </div>

        {/* Main content */}
        <main
          className={cn("pt-16 lg:pt-0 min-h-[calc(100vh-4rem)]", "p-4 sm:p-6 lg:p-8")}
          role="main"
          id="main-content"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Focus trap for accessibility */}
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {sidebarCollapsed ? "Sidebar collapsed" : "Sidebar expanded"}
        </div>
      </div>
    </div>
  );
}

// Sheet component for mobile sidebar
import * as SheetPrimitive from "@radix-ui/react-sheet";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

export { Sheet, SheetContent, SheetTrigger };