"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2Icon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function MessageSquareIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }),
  ]);
}
function UsersIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
    createElement("circle", { key: "2", cx: "9", cy: "7", r: "4" }),
    createElement("path", { key: "3", d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
  ]);
}
function HashtagIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("line", { key: "1", x1: "4", y1: "9", x2: "20", y2: "9" }),
    createElement("line", { key: "2", x1: "4", y1: "15", x2: "20", y2: "15" }),
    createElement("line", { key: "3", x1: "9", y1: "3", x2: "9", y2: "21" }),
    createElement("line", { key: "4", x1: "15", y1: "3", x2: "15", y2: "21" }),
  ]);
}
function ImageIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("rect", { key: "1", x: "3", y: "3", width: "18", height: "18", rx: "2" }),
    createElement("circle", { key: "2", cx: "8.5", cy: "8.5", r: "1.5" }),
    createElement("polyline", { key: "3", points: "21 15 16 10 5 21" }),
  ]);
}
function CalendarIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("rect", { key: "1", x: "3", y: "4", width: "18", height: "18", rx: "2" }),
    createElement("line", { key: "2", x1: "16", y1: "2", x2: "16", y2: "6" }),
    createElement("line", { key: "3", x1: "8", y1: "2", x2: "8", y2: "6" }),
    createElement("line", { key: "4", x1: "3", y1: "10", x2: "21", y2: "10" }),
  ]);
}

const features = [
  { title: "Post Generator", description: "Platform-optimized posts for Twitter, LinkedIn, Instagram", icon: MessageSquareIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Thread Creator", description: "Engaging Twitter/X threads and LinkedIn carousels", icon: MessageSquareIcon, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { title: "Hashtag Research", description: "Trending and niche hashtag recommendations", icon: HashtagIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Image Prompts", description: "AI image generation prompts for social visuals", icon: ImageIcon, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400" },
  { title: "Content Calendar", description: "Schedule and plan posts across platforms", icon: CalendarIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Audience Insights", description: "Engagement analysis and growth recommendations", icon: UsersIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
];

export default function SocialFactoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Social Factory"
        description="Multi-platform social media content generation and scheduling"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Social Factory" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="Social Factory" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg mb-4", feature.color)}>
                {createElement(feature.icon, { className: "h-6 w-6" })}
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary">Coming Soon</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Social Factory is planned for future release. Features will include direct platform publishing via APIs,
                analytics dashboard, team collaboration, approval workflows, and cross-posting optimization.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}