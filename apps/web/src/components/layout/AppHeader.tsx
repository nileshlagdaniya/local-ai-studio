"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MenuIcon,
  SearchIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
  XIcon,
  GlobeIcon,
  DatabaseIcon,
  SparklesIcon,
} from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
  CommandShortcut,
} from "@/components/ui/command";

interface AppHeaderProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

export function AppHeader({ onMenuClick, sidebarCollapsed }: AppHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Global search command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandOpen(true);
    }
    if (e.key === "Escape") {
      setCommandOpen(false);
      setNotificationsOpen(false);
      setUserMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigationItems = [
    { label: "Overview", href: "/dashboard/overview", description: "Dashboard home", icon: <HomeIcon className="h-4 w-4" /> },
    { label: "AI Models", href: "/dashboard/ai-models", description: "Manage AI providers", icon: <CpuIcon className="h-4 w-4" /> },
    { label: "Stock Factory", href: "/dashboard/stock-factory", description: "Stock content generation", icon: <FactoryIcon className="h-4 w-4" /> },
    { label: "YouTube Factory", href: "/dashboard/youtube-factory", description: "YouTube content creation", icon: <YoutubeIcon className="h-4 w-4" /> },
    { label: "Social Factory", href: "/dashboard/social-factory", description: "Social media content", icon: <Share2Icon className="h-4 w-4" /> },
    { label: "Business Automation", href: "/dashboard/business-automation", description: "Workflow automation", icon: <ZapIcon className="h-4 w-4" /> },
    { label: "Developer Assistant", href: "/dashboard/developer-assistant", description: "Code assistance tools", icon: <CodeIcon className="h-4 w-4" /> },
    { label: "Knowledge Base", href: "/dashboard/knowledge-base", description: "Document management", icon: <BookOpenIcon className="h-4 w-4" /> },
    { label: "Task Queue", href: "/dashboard/task-queue", description: "Job management", icon: <ListTodoIcon className="h-4 w-4" /> },
    { label: "Activity Logs", href: "/dashboard/activity-logs", description: "System activity", icon: <ActivityIcon className="h-4 w-4" /> },
    { label: "Settings", href: "/dashboard/settings", description: "App settings", icon: <SettingsIcon className="h-4 w-4" /> },
  ];

  const filterItems = (query: string) =>
    navigationItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    );

  const filteredItems = filterItems(searchQuery);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "flex items-center gap-4 px-4 transition-all duration-200",
        sidebarCollapsed ? "ml-16" : "ml-64"
      )}
      role="banner"
    >
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Toggle menu"
        aria-expanded={!sidebarCollapsed}
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* Global Search / Command Palette */}
      <div className="relative flex-1 max-w-xl hidden sm:block">
        <Command open={commandOpen} onOpenChange={setCommandOpen}>
          <CommandInput
            ref={searchRef}
            placeholder="Search... (⌘K)"
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-10 w-full rounded-md bg-background border border-input px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <CommandList className="max-h-96 overflow-auto">
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found
            </CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    window.location.href = item.href;
                    setCommandOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                  <CommandShortcut>{item.description}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <button
          onClick={() => setCommandOpen(true)}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        >
          <SearchIcon />
        </button>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ThemeToggleButton />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Toggle theme
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationButton onOpenChange={setNotificationsOpen} open={notificationsOpen} />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              Notifications
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* User Menu */}
        <UserMenu onOpenChange={setUserMenuOpen} open={userMenuOpen} />
      </div>
    </header>
  );
}

function ThemeToggleButton() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.remove("light", "dark");
    if (nextTheme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }
    } else {
      document.documentElement.classList.add(nextTheme);
    }
  };

  if (!mounted) {
    return (
      <button className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground" disabled aria-label="Loading theme">
        <SunIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label={`Current theme: ${theme}. Click to cycle.`}
      title={`Theme: ${theme}`}
    >
      {theme === "dark" && <MoonIcon className="h-5 w-5" />}
      {theme === "light" && <SunIcon className="h-5 w-5" />}
      {theme === "system" && (
        <span className="flex h-5 w-5 items-center justify-center">
          <MonitorIcon className="h-5 w-5" />
        </span>
      )}
    </button>
  );
}

function MonitorIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props} aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function NotificationButton({ onOpenChange, open }: { onOpenChange: (open: boolean) => void; open: boolean }) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="relative flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <BellIcon className="h-5 w-5" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" aria-label="3 unread notifications" />
      </button>
      {open && (
        <NotificationsDropdown onClose={() => onOpenChange(false)} />
      )}
    </div>
  );
}

function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const notifications = [
    { id: 1, title: "Job completed", description: "Stock content generation finished", time: "2 min ago", read: false },
    { id: 2, title: "Model updated", description: "qwen2.5-coder:3b pulled successfully", time: "15 min ago", read: false },
    { id: 3, title: "Storage warning", description: "Disk usage at 85%", time: "1 hour ago", read: true },
    { id: 4, title: "New version available", description: "v0.2.0 released with improvements", time: "Yesterday", read: true },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border bg-popover p-2 shadow-lg z-50">
      <div className="flex items-center justify-between px-2 py-2">
        <h3 className="font-semibold">Notifications</h3>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Mark all read</button>
      </div>
      <div className="max-h-96 overflow-auto">
        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={onClose}
            className={cn(
              "w-full px-3 py-2 text-left rounded-md transition-colors",
              "hover:bg-accent",
              !notification.read && "bg-accent/50"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("flex-shrink-0 mt-0.5 h-2 w-2 rounded-full", !notification.read && "bg-primary")} />
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="border-t pt-2 mt-2">
        <button onClick={onClose} className="w-full text-center text-sm text-primary hover:underline">
          View all notifications
        </button>
      </div>
    </div>
  );
}

function UserMenu({ onOpenChange, open }: { onOpenChange: (open: boolean) => void; open: boolean }) {
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback>NL</AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <UserDropdown onClose={() => onOpenChange(false)} />
      )}
    </div>
  );
}

function UserDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg z-50">
      <div className="px-2 py-2 border-b">
        <p className="font-medium truncate">Nilesh Lagdaniya</p>
        <p className="text-xs text-muted-foreground truncate">nilesh@example.com</p>
      </div>
      <div className="py-1">
        <button onClick={onClose} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
          <UserIcon className="h-4 w-4" />
          Profile
        </button>
        <button onClick={onClose} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
          <DatabaseIcon className="h-4 w-4" />
          Data & Storage
        </button>
        <button onClick={onClose} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
          <SparklesIcon className="h-4 w-4" />
          AI Preferences
        </button>
        <button onClick={onClose} className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
          <GlobeIcon className="h-4 w-4" />
          Language & Region
        </button>
      </div>
      <DropdownMenuSeparator className="my-1" />
      <button
        onClick={onClose}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md text-destructive hover:bg-accent transition-colors"
      >
        <LogOutIcon className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

// Import icons needed for command palette
import {
  HomeIcon,
  CpuIcon,
  FactoryIcon,
  YoutubeIcon,
  Share2Icon,
  ZapIcon,
  CodeIcon,
  BookOpenIcon,
  ListTodoIcon,
  ActivityIcon,
  SettingsIcon,
} from "@/components/ui/icons";