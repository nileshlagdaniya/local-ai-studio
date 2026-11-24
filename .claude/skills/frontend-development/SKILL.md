# Frontend Development Skill

## Overview

This skill provides guidance for frontend development in Local AI Studio using Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Component Creation

### When to Create a Component

Create a new component when:

- UI element is reused in 2+ places
- Logic complexity warrants separation
- Testing isolation is needed
- Feature flagging requires isolation

### Component Template

```tsx
// components/[feature]/[ComponentName].tsx
"use client"; // Only if needed

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ComponentNameProps {
  className?: string;
  // ... other props
}

export const ComponentName = forwardRef<HTMLDivElement, ComponentNameProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("base-styles", className)} {...props} />
  ),
);

ComponentName.displayName = "ComponentName";
```

### shadcn/ui Component Conventions

1. **Copy from shadcn/ui** — don't install as dependency
2. **Place in** `components/ui/`
3. **Extend via** `className` prop
4. **Use `cn()`** for class merging
5. **Forward refs** with `React.forwardRef`

### Naming

- **Files**: PascalCase (`Button.tsx`, `ContentGenerator.tsx`)
- **Components**: PascalCase (`Button`, `ContentGenerator`)
- **Props interfaces**: `{ComponentName}Props`
- **Hooks**: `use{Feature}` (`useContentGenerator`)

## Page Development

### Server Components by Default

```tsx
// app/(dashboard)/modules/stock-content-factory/page.tsx
import { ModuleLayout } from "@/components/layout/ModuleLayout";
import { ContentGenerator } from "./components/ContentGenerator";

export default async function StockContentFactoryPage() {
  // Fetch data here (server-side)
  const modules = await getModules();

  return (
    <ModuleLayout>
      <ContentGenerator initialData={modules} />
    </ModuleLayout>
  );
}
```

### Client Components Only When Necessary

Add `'use client'` only for:

- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- React hooks (`useState`, `useEffect`, `useRouter`)
- TanStack Query hooks (`useQuery`, `useMutation`)

### Dynamic Routes

```tsx
// app/(dashboard)/modules/[moduleId]/page.tsx
import { notFound } from "next/navigation";
import { getModule } from "@/lib/modules/registry";

export async function generateStaticParams() {
  const modules = await getEnabledModules();
  return modules.map((m) => ({ moduleId: m.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const module = getModule(moduleId);

  if (!module) notFound();

  return <ModuleLayout module={module} />;
}
```

## Layout Development

### Root Layout

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

### Dashboard Layout

```tsx
// components/layout/DashboardLayout.tsx
"use client";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Module Layout

```tsx
// components/layout/ModuleLayout.tsx
interface ModuleLayoutProps {
  module: ModuleDefinition;
  children: React.ReactNode;
}

export function ModuleLayout({ module, children }: ModuleLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{module.name}</h1>
          <p className="text-muted-foreground">{module.description}</p>
        </div>
        <ModuleActions module={module} />
      </div>
      {children}
    </div>
  );
}
```

## UI Consistency

### Design Tokens (Tailwind v4)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: var(--color-blue-600);
  --color-primary-foreground: var(--color-white);
  --color-border: var(--color-slate-200);
  --radius: 0.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: var(--color-blue-500);
    --color-border: var(--color-slate-700);
  }
}
```

### Spacing Scale

- **Base unit**: 4px (`space-1` = 0.25rem)
- **Common**: `space-4` (1rem), `space-6` (1.5rem), `space-8` (2rem)

### Typography

```tsx
// Headings
<h1 className="text-3xl font-bold tracking-tight" />
<h2 className="text-2xl font-semibold" />
<h3 className="text-xl font-medium" />

// Body
<p className="text-base text-foreground" />
<p className="text-sm text-muted-foreground" />

// Code
<code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded" />
```

## Responsive Design

### Breakpoints

| Prefix | Min Width | Usage         |
| ------ | --------- | ------------- |
| (none) | 0px       | Mobile first  |
| `sm:`  | 640px     | Small tablets |
| `md:`  | 768px     | Tablets       |
| `lg:`  | 1024px    | Desktop       |
| `xl:`  | 1280px    | Large desktop |
| `2xl:` | 1536px    | Ultra-wide    |

### Patterns

```tsx
// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />

// Flex
<div className="flex flex-col md:flex-row gap-4" />

// Visibility
<div className="hidden md:block" />
<div className="block md:hidden" />

// Container queries (component-level)
<div className="@container">
  <div className="@md:grid @md:grid-cols-2" />
</div>
```

### Fluid Typography

```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl" />
<p className="text-base md:text-lg" />
```

## Accessibility

### Required Attributes

```tsx
// Buttons
<button aria-label="Close dialog" />

// Inputs
<label htmlFor="email">Email</label>
<input id="email" aria-describedby="email-error" />
<span id="email-error" className="sr-only">Invalid email</span>

// Navigation
<nav aria-label="Main navigation" />

// Live regions
<div aria-live="polite" className="sr-only">{status}</div>
```

### Focus Management

```tsx
// Focus visible
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />

// Focus trap in dialogs (Radix handles automatically)
// Restore focus on unmount (Radix handles automatically)
```

### Color Contrast

- **Normal text**: 4.5:1 minimum
- **Large text** (18px+): 3:1 minimum
- **UI components**: 3:1 minimum

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Checks

### Bundle Size

```bash
# Analyze bundle
pnpm build
pnpm @next/bundle-analyzer
```

### Targets

- **Initial JS**: < 200 KB gzipped
- **Total JS**: < 500 KB gzipped
- **LCP**: < 2.5s
- **CLS**: < 0.1

### Optimization Checklist

- [ ] Server Components for static content
- [ ] Dynamic imports for heavy features
- [ ] `next/image` for all images
- [ ] `next/font` for fonts
- [ ] `Suspense` boundaries for streaming
- [ ] TanStack Query for caching
- [ ] No unnecessary re-renders (React DevTools Profiler)

## API Integration

### TanStack Query Setup

```tsx
// providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### Query Keys

```typescript
// lib/api/query-keys.ts
export const queryKeys = {
  modules: ["modules"] as const,
  module: (id: string) => ["modules", id] as const,
  aiProviders: ["ai", "providers"] as const,
  jobs: ["jobs"] as const,
  job: (id: string) => ["jobs", id] as const,
} as const;
```

### Mutations

```typescript
export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (job: CreateJobDTO) => api.post<Job>("/api/jobs", job),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs });
      toast.success("Job created");
    },
    onError: (error) => toast.error(error.message),
  });
}
```

## Form Validation

### Zod Schema

```typescript
// lib/validations/content-generation.ts
export const contentGenerationSchema = z.object({
  prompt: z.string().min(10, "Prompt too short").max(5000),
  model: z.string().min(1, "Select a model"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32768).default(4096),
  count: z.number().min(1).max(10).default(1),
});

export type ContentGenerationInput = z.infer<typeof contentGenerationSchema>;
```

### React Hook Form

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export function ContentForm() {
  const form = useForm<ContentGenerationInput>({
    resolver: zodResolver(contentGenerationSchema),
    defaultValues: { temperature: 0.7, maxTokens: 4096, count: 1 },
  });

  const mutation = useCreateJob();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prompt</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe what to generate..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Generating..." : "Generate"}
        </Button>
      </form>
    </Form>
  );
}
```

---

**Reference:** `apps/web/CLAUDE.md` for complete rules
