"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FactoryIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function TrendingUpIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("polyline", { key: "1", points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
    createElement("polyline", { key: "2", points: "17 6 23 6 23 12" }),
  ]);
}
function FileTextIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
    createElement("polyline", { key: "2", points: "14 2 14 8 20 8" }),
    createElement("line", { key: "3", x1: "16", y1: "13", x2: "8", y2: "13" }),
    createElement("line", { key: "4", x1: "16", y1: "17", x2: "8", y2: "17" }),
  ]);
}

const features = [
  { title: "Market Analysis", description: "Generate technical and fundamental analysis reports", icon: TrendingUpIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Earnings Summaries", description: "Automated earnings call summaries and highlights", icon: FileTextIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Sector Reports", description: "Comparative sector performance analysis", icon: FactoryIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Portfolio Insights", description: "AI-powered portfolio optimization suggestions", icon: TrendingUpIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "News Digests", description: "Curated financial news summaries", icon: FileTextIcon, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { title: "Risk Assessments", description: "Automated risk profiling and alerts", icon: FactoryIcon, color: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
];

export default function StockFactoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Factory"
        description="Automated stock market content generation and analysis"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Stock Factory" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Generate Content
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="Stock Factory" />

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
              <h3 className="font-medium text-primary">Under Development</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Stock Factory is currently in beta. Features like real-time data integration, custom template builders,
                scheduled generation, and multi-format export (PDF, Markdown, HTML) are planned for upcoming releases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}