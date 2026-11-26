"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsIcon, SparklesIcon, MoonIcon, SunIcon, MonitorIcon, DatabaseIcon, GlobeIcon, KeyIcon, BellIcon, UserIcon, SaveIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RotateCcwIcon, PlusIcon, AlertTriangleIcon, CheckIcon } from "@/components/ui/icons";
import { createElement } from "react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export default function SettingsPage() {
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system");
  const [language, setLanguage] = React.useState("en");
  const [notifications, setNotifications] = React.useState(true);
  const [autoSave, setAutoSave] = React.useState(true);
  const [compactMode, setCompactMode] = React.useState(false);
  const [animations, setAnimations] = React.useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure your Local AI Studio preferences"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard/overview" }, { label: "Settings" }]}
        actions={
          <Button>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="ai">AI Providers</TabsTrigger>
          <TabsTrigger value="data">Data & Storage</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MoonIcon className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { value: "light", label: "Light", icon: SunIcon, description: "Always use light mode" },
                  { value: "dark", label: "Dark", icon: MoonIcon, description: "Always use dark mode" },
                  { value: "system", label: "System", icon: MonitorIcon, description: "Match system preference" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all",
                      theme === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", theme === option.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {createElement(option.icon, { className: "h-6 w-6" })}
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.description}</p>
                    </div>
                    {theme === option.value && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Interface
              </CardTitle>
              <CardDescription>Customize the dashboard interface</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <SettingToggle
                label="Compact Mode"
                description="Reduce spacing for denser layouts"
                checked={compactMode}
                onChange={setCompactMode}
              />
              <SettingToggle
                label="Animations"
                description="Enable transitions and micro-animations"
                checked={animations}
                onChange={setAnimations}
              />
              <SettingToggle
                label="Auto-save Forms"
                description="Automatically save form drafts"
                checked={autoSave}
                onChange={setAutoSave}
              />
              <SettingToggle
                label="Sidebar Collapsed"
                description="Start with collapsed navigation"
                checked={false}
                onChange={() => {}}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                Language & Region
              </CardTitle>
              <CardDescription>Set your preferred language and locale</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language"><SelectValue placeholder="Select language" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                      <SelectItem value="zh">Chinese (Simplified)</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="ISO">
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ISO">ISO 8601 (YYYY-MM-DD)</SelectItem>
                      <SelectItem value="US">US (MM/DD/YYYY)</SelectItem>
                      <SelectItem value="EU">EU (DD/MM/YYYY)</SelectItem>
                      <SelectItem value="relative">Relative (2 hours ago)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="number-format">Number Format</Label>
                  <Select defaultValue="US">
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">US (1,234.56)</SelectItem>
                      <SelectItem value="EU">EU (1.234,56)</SelectItem>
                      <SelectItem value="SI">SI (1 234,56)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    AI Providers
                  </CardTitle>
                  <CardDescription>Configure local and cloud AI inference providers</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Provider
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <ProviderCard
                name="Ollama (Local)"
                type="local"
                status="connected"
                models={["qwen2.5-coder:3b", "llama3.2:3b", "mistral:7b"]}
                defaultModel="qwen2.5-coder:3b"
                endpoint="http://localhost:11434"
              />
              <ProviderCard
                name="FreeLLMAPI (Cloud)"
                type="cloud"
                status="disconnected"
                models={["gpt-4o-mini", "gpt-3.5-turbo"]}
                defaultModel="gpt-4o-mini"
                endpoint="https://api.freellmapi.com"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Generation Defaults
              </CardTitle>
              <CardDescription>Default parameters for AI generation</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <Label htmlFor="temperature">Temperature</Label>
                  <input id="temperature" type="range" min={0} max={2} step={0.1} defaultValue={0.7} className="w-full" />
                  <p className="text-xs text-muted-foreground text-right">0.7</p>
                  <p className="text-xs text-muted-foreground">Controls randomness</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max-tokens">Max Tokens</Label>
                  <input id="max-tokens" type="number" min={1} max={32768} defaultValue={4096} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground">Maximum response length</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="top-p">Top P</Label>
                  <input id="top-p" type="range" min={0} max={1} step={0.05} defaultValue={0.9} className="w-full" />
                  <p className="text-xs text-muted-foreground text-right">0.9</p>
                  <p className="text-xs text-muted-foreground">Nucleus sampling</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="top-k">Top K</Label>
                  <input id="top-k" type="number" min={1} max={100} defaultValue={40} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <p className="text-xs text-muted-foreground">Top-k sampling</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <textarea
                  id="system-prompt"
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional system prompt applied to all generations..."
                  defaultValue=""
                />
                <p className="text-xs text-muted-foreground">Applied to all modules unless overridden</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Storage Usage
              </CardTitle>
              <CardDescription>Monitor and manage local storage</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg border bg-card text-center">
                  <p className="text-sm text-muted-foreground">Total Used</p>
                  <p className="text-2xl font-bold text-primary mt-1">847 MB</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-center">
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">4.2 GB</p>
                </div>
                <div className="p-4 rounded-lg border bg-card text-center">
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold text-muted-foreground mt-1">5 GB</p>
                </div>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: "17%" }} />
              </div>
              <p className="text-sm text-muted-foreground">17% used — 4.2 GB remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <ActionRow
                  title="Export All Data"
                  description="Download a complete backup of your data (SQLite + files)"
                  action={<Button variant="outline">Export</Button>}
                />
                <ActionRow
                  title="Import Data"
                  description="Restore from a previous backup file"
                  action={<Button variant="outline">Import</Button>}
                />
                <ActionRow
                  title="Clear Cache"
                  description="Remove temporary files and model cache (~234 MB)"
                  action={<Button variant="secondary">Clear Cache</Button>}
                />
                <ActionRow
                  title="Reset to Defaults"
                  description="Delete all data and reset application to initial state"
                  action={<Button variant="destructive">Reset</Button>}
                  destructive
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <SparklesIcon className="h-6 w-6 text-primary mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-primary">Local-First Storage</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All data is stored locally in SQLite with optional PostgreSQL migration. No cloud sync or external
                    databases. Export/import for backups and migration between machines.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <SettingToggle
                label="Enable Notifications"
                description="Receive in-app notifications for job completion, errors, and updates"
                checked={notifications}
                onChange={setNotifications}
              />
              <SettingToggle
                label="Job Completion"
                description="Notify when background jobs finish"
                checked={true}
                onChange={() => {}}
              />
              <SettingToggle
                label="Job Failures"
                description="Notify when jobs fail or encounter errors"
                checked={true}
                onChange={() => {}}
              />
              <SettingToggle
                label="Model Updates"
                description="Notify when new model versions are available"
                checked={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="Storage Warnings"
                description="Alert when disk usage exceeds 80%"
                checked={true}
                onChange={() => {}}
              />
              <SettingToggle
                label="Weekly Digest"
                description="Receive a weekly summary of automation activity"
                checked={false}
                onChange={() => {}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Nilesh Lagdaniya</h3>
                  <p className="text-sm text-muted-foreground">nilesh@example.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Local AI Studio v0.1.0</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage API keys for external integrations</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <ActionRow
                  title="FreeLLMAPI Key"
                  description="Cloud fallback API key (not configured)"
                  action={<Button variant="outline" size="sm">Add Key</Button>}
                />
                <ActionRow
                  title="GitHub Token"
                  description="For repository integration (not configured)"
                  action={<Button variant="outline" size="sm">Add Key</Button>}
                />
                <ActionRow
                  title="Custom Provider"
                  description="Add custom API endpoint credentials"
                  action={<Button variant="outline" size="sm">Add Key</Button>}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Developer Options
              </CardTitle>
              <CardDescription>Advanced settings for power users</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <SettingToggle
                label="Debug Mode"
                description="Enable verbose logging and debug endpoints"
                checked={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="Developer Tools"
                description="Show developer-only UI elements and shortcuts"
                checked={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="Experimental Features"
                description="Enable access to alpha/beta features"
                checked={false}
                onChange={() => {}}
              />
              <SettingToggle
                label="Telemetry"
                description="Send anonymous usage statistics (local only)"
                checked={false}
                onChange={() => {}}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Database
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <ActionRow
                  title="Run Migrations"
                  description="Apply pending database migrations"
                  action={<Button variant="outline" size="sm">Run Migrations</Button>}
                />
                <ActionRow
                  title="Backup Database"
                  description="Create a SQLite backup file"
                  action={<Button variant="outline" size="sm">Backup</Button>}
                />
                <ActionRow
                  title="Vacuum Database"
                  description="Optimize and reclaim unused space"
                  action={<Button variant="outline" size="sm">Vacuum</Button>}
                />
                <ActionRow
                  title="Migration History"
                  description="View applied migrations"
                  action={<Button variant="ghost" size="sm">View History</Button>}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangleIcon className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="space-y-3">
                <ActionRow
                  title="Reset All Settings"
                  description="Restore all settings to factory defaults"
                  action={<Button variant="destructive" size="sm">Reset Settings</Button>}
                  destructive
                />
                <ActionRow
                  title="Delete All Data"
                  description="Permanently delete all data, jobs, and configurations"
                  action={<Button variant="destructive" size="sm">Delete Everything</Button>}
                  destructive
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function ProviderCard({ name, type, status, models, defaultModel, endpoint }: {
  name: string; type: "local" | "cloud"; status: "connected" | "disconnected" | "connecting" | "error";
  models: string[]; defaultModel: string; endpoint: string;
}) {
  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", type === "local" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400")}>
            {type === "local" ? <DatabaseIcon className="h-5 w-5" /> : <GlobeIcon className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{endpoint}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} variant="subtle" size="sm" />
          <Button variant="ghost" size="icon" title="Test Connection"><RotateCcwIcon className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="Configure"><SettingsIcon className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {models.map((model) => (
          <span
            key={model}
            className={cn(
              "px-2 py-1 text-xs rounded-full border",
              model === defaultModel ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
            )}
          >
            {model}{model === defaultModel && " (default)"}
          </span>
        ))}
      </div>
    </div>
  );
}

function StorageStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-lg border bg-card text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", color)}>{value}</p>
    </div>
  );
}

function ActionRow({ title, description, action, destructive }: { title: string; description: string; action: React.ReactNode; destructive?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between p-3 rounded-lg border", destructive && "border-destructive/20 bg-destructive/5")}>
      <div>
        <p className={cn("font-medium", destructive && "text-destructive")}>{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}