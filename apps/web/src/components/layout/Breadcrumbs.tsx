"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronRightIcon, HomeIcon } from "@/components/ui/icons";

interface BreadcrumbsProps {
  className?: string;
  items?: Array<{ label: string; href?: string }>;
}

export function Breadcrumbs({ className, items = [] }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from pathname if not provided
  const autoItems = React.useMemo(() => {
    if (items.length > 0) return items;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return [];

    return segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { label, href };
    });
  }, [pathname, items]);

  const displayItems = items.length > 0 ? items : autoItems;

  if (displayItems.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      <ol className="flex items-center gap-1.5" role="list">
        <li>
          <Link
            href="/dashboard/overview"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <HomeIcon className="h-3.5 w-3.5" />
          </Link>
        </li>
        {displayItems.map((item, index) => (
          <li key={item.href || item.label} className="flex items-center gap-1.5">
            <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  index === displayItems.length - 1
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={index === displayItems.length - 1 ? "page" : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-sm font-medium",
                  index === displayItems.length - 1 ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={index === displayItems.length - 1 ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}