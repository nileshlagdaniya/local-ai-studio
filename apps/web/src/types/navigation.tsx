import type { ReactNode } from "react";
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

export interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const iconComponents = {
  home: HomeIcon,
  cpu: CpuIcon,
  factory: FactoryIcon,
  youtube: YoutubeIcon,
  share2: Share2Icon,
  zap: ZapIcon,
  code: CodeIcon,
  bookOpen: BookOpenIcon,
  listTodo: ListTodoIcon,
  activity: ActivityIcon,
  settings: SettingsIcon,
} as const;

function createIcon(name: keyof typeof iconComponents): ReactNode {
  const Icon = iconComponents[name];
  return <Icon />;
}

export const navigationSections: NavSection[] = [
  {
    label: "Core",
    items: [
      { label: "Overview", href: "/dashboard/overview", icon: createIcon("home") },
      { label: "AI Models", href: "/dashboard/ai-models", icon: createIcon("cpu") },
    ],
  },
  {
    label: "Factories",
    items: [
      { label: "Stock Factory", href: "/dashboard/stock-factory", icon: createIcon("factory") },
      { label: "YouTube Factory", href: "/dashboard/youtube-factory", icon: createIcon("youtube") },
      { label: "Social Factory", href: "/dashboard/social-factory", icon: createIcon("share2") },
    ],
  },
  {
    label: "Automation",
    items: [
      { label: "Business Automation", href: "/dashboard/business-automation", icon: createIcon("zap") },
      { label: "Developer Assistant", href: "/dashboard/developer-assistant", icon: createIcon("code") },
      { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: createIcon("bookOpen") },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Task Queue", href: "/dashboard/task-queue", icon: createIcon("listTodo") },
      { label: "Activity Logs", href: "/dashboard/activity-logs", icon: createIcon("activity") },
      { label: "Settings", href: "/dashboard/settings", icon: createIcon("settings") },
    ],
  },
];