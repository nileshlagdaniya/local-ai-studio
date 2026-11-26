"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyStates } from "@/components/dashboard/EmptyState";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpenIcon, SparklesIcon, ArrowRightIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { createElement } from "react";

function FileTextIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" }),
    createElement("polyline", { key: "2", points: "14 2 14 8 20 8" }),
  ]);
}
function SearchIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("circle", { key: "1", cx: "11", cy: "11", r: "8" }),
    createElement("line", { key: "2", x1: "21", y1: "21", x2: "16.65", y2: "16.65" }),
  ]);
}
function BrainIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M12 2a3 3 0 0 0-3 3v1a2 2 0 0 1-2 2 5 5 0 0 0 5 5 2 2 0 0 1 4 0 5 5 0 0 0 5-5 2 2 0 0 1-2-2V5a3 3 0 0 0-3-3Z" }),
  ]);
}
function FolderIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" }),
  ]);
}
function LinkIcon({ className = "h-5 w-5", ...props }: React.SVGProps<SVGSVGElement>) {
  return createElement("svg", { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, ...props, "aria-hidden": "true" }, [
    createElement("path", { key: "1", d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
    createElement("path", { key: "2", d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" }),
  ]);
}

const features = [
  { title: "Document Upload", description: "PDF, Markdown, Text, and Office documents", icon: FileTextIcon, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Semantic Search", description: "Vector-based similarity search across docs", icon: SearchIcon, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "RAG Chat", description: "Ask questions grounded in your documents", icon: BrainIcon, color: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  { title: "Collections", description: "Organize documents into knowledge collections", icon: FolderIcon, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Web Import", description: "Crawl and index web pages automatically", icon: LinkIcon, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { title: "Embeddings Mgmt", description: "Configure models and chunking strategies", icon: BrainIcon, color: "text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400" },
];

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base"
        description="Document storage, retrieval, and RAG-powered question answering"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Knowledge Base" }]}
        actions={
          <Button>
            <ArrowRightIcon className="h-4 w-4 mr-2" />
            Add Documents
          </Button>
        }
      />

      <EmptyStates.ModuleNotImplemented moduleName="Knowledge Base" />

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
              <h3 className="font-medium text-primary">Beta Release</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Knowledge Base is in beta with local vector storage. Features include hybrid search (keyword + semantic),
                citation tracking, document versioning, and integration with all factory modules for grounded generation.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}