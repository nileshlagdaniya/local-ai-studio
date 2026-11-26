"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navigationSections, NavSection } from "@/types/navigation";
import { ChevronLeft, ChevronRight, LogoIcon } from "@/components/ui/icons";

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isCollapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-200 ease-in-out",
        "flex flex-col overflow-y-auto",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className={cn("flex h-16 items-center justify-between px-4 border-b", isCollapsed && "justify-center")}>
        <Link href="/dashboard/overview" className="flex items-center gap-2" aria-label="Local AI Studio Home">
          <LogoIcon className="h-7 w-7 text-primary" aria-hidden="true" />
          {!isCollapsed && (
            <span className="text-xl font-semibold text-foreground">Local AI Studio</span>
          )}
        </Link>
        <button
          onClick={onToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground transition-colors",
            isCollapsed && "mx-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6" aria-label="Navigation">
        {navigationSections.map((section: NavSection) => (
          <div key={section.label} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </h3>
            )}
            <ul className="space-y-0.5" role="list">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavItem
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom: Version info */}
      <div className={cn("p-4 border-t", isCollapsed && "hidden")}>
        <p className="text-xs text-center text-muted-foreground">
          v0.1.0 &middot; Local AI Studio
        </p>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavItem({ item, isActive, isCollapsed }: NavItemProps) {
  const linkClassName = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    isActive
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    item.disabled && "opacity-50 pointer-events-none"
  );

  const tooltip = isCollapsed && !item.disabled ? (
    <div className="fixed left-16 top-0 z-50 ml-2 px-2 py-1.5 text-xs font-medium bg-popover text-popover-foreground border shadow-lg rounded-md whitespace-nowrap">
      {item.label}
    </div>
  ) : null;

  if (item.disabled) {
    return (
      <div className={cn(linkClassName, "cursor-not-allowed")}>
        {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5 flex-shrink-0" })}
        {!isCollapsed && <span>{item.label}</span>}
      </div>
    );
  }

  return (
    <Link href={item.href} className={linkClassName} aria-current={isActive ? "page" : undefined}>
      <span className="flex h-5 w-5 items-center justify-center flex-shrink-0">
        {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5" })}
      </span>
      {!isCollapsed && <span className="truncate">{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}