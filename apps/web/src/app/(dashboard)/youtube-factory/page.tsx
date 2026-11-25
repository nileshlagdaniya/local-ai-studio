"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { YoutubeIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function FileTextIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
    createElement("polyline", { key: "2", points: "14 2 14 8 20 8" }),
  ]);
}
function FilmIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("rect", { key: "1", x: "2", y: "2", width: "20", height: "20", rx: "2.18" }),
    createElement("path", { key: "2", d: "M7 2v20" }),
    createElement("path", { key: "3", d: "M17 2v20" }),
    createElement("path", { key: "4", d: "M2 12h20" }),
  ]);
}
function MicIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" }),
    createElement("path", { key: "2", d: "M19 10v2a7 7 0 0 1-14 0v-2" }),
    createElement("line", { key: "3", x1: "12", y1: "19", x2: "12", y2: "23" }),
  ]);
}

const features = [
  { title: "Script Generator", description: "Full video scripts with hooks, structure, and CTAs", icon: FileTextIcon, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  { title: "Title Optimizer", description: "Click-worthy titles optimized for search and CTR", icon: FilmIcon, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400" },
  { title: "Description Writer", description: "SEO-optimized descriptions with timestamps and links", icon: FileTextIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Thumbnail Ideas", description: "AI-generated thumbnail concepts and prompts", icon: FilmIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Shorts Creator", description: "Vertical video scripts under 60 seconds", icon: YoutubeIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Channel Strategy", description: "Content calendar and series planning", icon: MicIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
];

export default function YouTubeFactoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="YouTube Factory"
        description="AI-powered YouTube content creation: scripts, titles, descriptions, and thumbnails"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "YouTube Factory" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Create Video
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="YouTube Factory" />

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
              <h3 className="font-medium text-primary">Alpha Release Planned</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                YouTube Factory is in early alpha. Planned features include YouTube API integration for direct publishing,
                analytics tracking, A/B title testing, community post generation, and multi-language support.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}