"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function TerminalIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("polyline", { key: "1", points: "4 17 10 11 4 5" }),
    createElement("line", { key: "2", x1: "12", y1: "19", x2: "20", y2: "19" }),
  ]);
}
function GitBranchIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("line", { key: "1", x1: "6", y1: "3", x2: "6", y2: "15" }),
    createElement("circle", { key: "2", cx: "18", cy: "6", r: "3" }),
    createElement("circle", { key: "3", cx: "6", cy: "18", r: "3" }),
    createElement("path", { key: "4", d: "M18 9a9 9 0 0 1-9 9" }),
  ]);
}
function SearchIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("circle", { key: "1", cx: "11", cy: "11", r: "8" }),
    createElement("line", { key: "2", x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  ]);
}
function CopyIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("rect", { key: "1", x: "9", y: "9", width: "13", height: "13", rx: "2" }),
    createElement("path", { key: "2", d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" }),
  ]);
}

const features = [
  { title: "Code Generation", description: "Generate functions, components, and modules", icon: CodeIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Code Review", description: "Automated PR reviews and quality checks", icon: SearchIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Debug Assistant", description: "Error analysis and fix suggestions", icon: TerminalIcon, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  { title: "Terminal AI", description: "Natural language to command translation", icon: TerminalIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Git Helper", description: "Commit messages, branch naming, rebasing", icon: GitBranchIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Doc Generator", description: "Auto-generate README, API docs, comments", icon: CopyIcon, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
];

export default function DeveloperAssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Assistant"
        description="AI-powered code generation, review, debugging, and documentation"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Developer Assistant" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Start Coding
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="Developer Assistant" />

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
              <h3 className="font-medium text-primary">Alpha Preview</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Developer Assistant is in early alpha. Planned features include IDE integration (VS Code, JetBrains),
                multi-file context awareness, test generation, refactoring suggestions, and support for 20+ languages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}