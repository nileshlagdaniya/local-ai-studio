"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZapIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function WorkflowIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("rect", { key: "1", x: "3", y: "3", width: "8", height: "8", rx: "2" }),
    createElement("path", { key: "2", d: "M7 11v4a2 2 0 0 0 2 2h4" }),
    createElement("rect", { key: "3", x: "13", y: "13", width: "8", height: "8", rx: "2" }),
  ]);
}
function ClockIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("circle", { key: "1", cx: "12", cy: "12", r: "10" }),
    createElement("polyline", { key: "2", points: "12 6 12 12 16 14" }),
  ]);
}
function RepeatIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M17 1l4 4-4 4" }),
    createElement("path", { key: "2", d: "M3 11V9a4 4 0 0 1 4-4h14" }),
    createElement("path", { key: "3", d: "M7 23l-4-4 4-4" }),
    createElement("path", { key: "4", d: "M21 13v2a4 4 0 0 1-4 4H3" }),
  ]);
}
function BarChartIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M3 3v18h18" }),
    createElement("path", { key: "2", d: "m19 9-5 5-4-4-3 3" }),
  ]);
}

const features = [
  { title: "Workflow Builder", description: "Visual drag-and-drop automation designer", icon: WorkflowIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Scheduled Jobs", description: "Cron-like scheduling for recurring tasks", icon: ClockIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Event Triggers", description: "Webhook and event-driven automation", icon: ZapIcon, color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
  { title: "Loop & Batch", description: "Iterate over lists and process in batches", icon: RepeatIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Conditional Logic", description: "If/else branching and decision nodes", icon: WorkflowIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Execution Logs", description: "Detailed run history and debugging", icon: BarChartIcon, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
];

export default function BusinessAutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Automation"
        description="Workflow automation, scheduling, and process orchestration"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Business Automation" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="Business Automation" />

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
              <h3 className="font-medium text-primary">Future Release</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Business Automation will provide a visual workflow builder with support for webhooks, scheduled triggers,
                conditional branching, parallel execution, error handling, and integration with all other modules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}