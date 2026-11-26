"use client";

import * as React from "react";
import { PageHeader, SectionHeading } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { SparklesIcon, DatabaseIcon, GlobeIcon, PlusIcon, RefreshCwIcon, SettingsIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

const providers = [
  {
    id: "ollama",
    name: "Ollama",
    type: "Local",
    status: "connected" as const,
    models: ["qwen2.5-coder:3b", "llama3.2:3b", "mistral:7b"],
    defaultModel: "qwen2.5-coder:3b",
    endpoint: "http://localhost:11434",
    description: "Local LLM inference engine",
  },
  {
    id: "freellmapi",
    name: "FreeLLMAPI",
    type: "Cloud",
    status: "disconnected" as const,
    models: ["gpt-4o-mini", "gpt-3.5-turbo"],
    defaultModel: "gpt-4o-mini",
    endpoint: "https://api.freellmapi.com",
    description: "Free cloud LLM API fallback",
  },
];

export default function AIModelsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Models"
        description="Configure and manage your AI inference providers"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "AI Models" }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
        }
      />

      <SectionHeading title="Providers" description="Configured AI inference providers" />

      <div className="grid gap-6 lg:grid-cols-2">
        {providers.map((provider) => (
          <Card key={provider.id} className={provider.status === "connected" ? "border-green-200 dark:border-green-800" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    provider.type === "Local" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {provider.type === "Local" ? <DatabaseIcon className="h-6 w-6" /> : <GlobeIcon className="h-6 w-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{provider.name}</CardTitle>
                      <StatusBadge status={provider.status} variant="subtle" size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.type} • {provider.description}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Endpoint</p>
                  <p className="font-mono text-xs truncate">{provider.endpoint}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Default Model</p>
                  <p className="font-medium">{provider.defaultModel}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Models</p>
                <div className="flex flex-wrap gap-2">
                  {provider.models.map((model) => (
                    <span
                      key={model}
                      className={cn(
                        "px-2 py-1 text-xs rounded-full border",
                        model === provider.defaultModel
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {model}{model === provider.defaultModel && " (default)"}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t">
                <Button variant="outline" size="sm">
                  <SettingsIcon className="h-4 w-4 mr-1" />
                  Configure
                </Button>
                <Button variant="ghost" size="sm">
                  <RefreshCwIcon className="h-4 w-4 mr-1" />
                  Health Check
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionHeading title="Model Settings" description="Global AI model configuration" />

      <Card>
        <CardHeader>
          <CardTitle>Generation Defaults</CardTitle>
          <CardDescription>Default parameters used when no module-specific settings are configured</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <label htmlFor="temperature" className="text-sm font-medium">Temperature</label>
              <input id="temperature" type="range" min={0} max={2} step={0.1} defaultValue={0.7} className="w-full" />
              <p className="text-sm text-muted-foreground">Controls randomness (0.7)</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="max-tokens" className="text-sm font-medium">Max Tokens</label>
              <input id="max-tokens" type="number" min={1} max={32768} defaultValue={4096} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-sm text-muted-foreground">Maximum response length</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="top-p" className="text-sm font-medium">Top P</label>
              <input id="top-p" type="range" min={0} max={1} step={0.05} defaultValue={0.9} className="w-full" />
              <p className="text-sm text-muted-foreground">Nucleus sampling (0.9)</p>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="top-k" className="text-sm font-medium">Top K</label>
              <input id="top-k" type="number" min={1} max={100} defaultValue={40} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              <p className="text-sm text-muted-foreground">Top-k sampling (40)</p>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-primary">Advanced Features Coming Soon</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Model fine-tuning, custom model imports, provider failover chains, usage analytics,
                and cost tracking will be available in future releases.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}