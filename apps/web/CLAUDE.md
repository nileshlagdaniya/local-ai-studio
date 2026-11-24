# Frontend — Claude Code Instructions

## Next.js App Router Rules

### Server Components by Default
- All components are **Server Components** unless they need:
  - Interactivity (`onClick`, `onChange`, etc.)
  - Browser APIs (`localStorage`, `window`, etc.)
  - React hooks (`useState`, `useEffect`, etc.)
- Mark Client Components with `'use client'` at top of file
- Keep Client Components small and focused

### Routing
- Use **route groups** for layout organization:
  - `(auth)` — Login, register
  - `(dashboard)` — Main app with sidebar
- Use **parallel routes** for complex layouts (e.g., `@modal`)
- Dynamic routes: `app/modules/[moduleId]/page.tsx`

### Data Fetching
- Fetch data in Server Components using `async/await`
- Use TanStack Query for client-side caching/mutations
- **Never** fetch in Client Components directly
- Use `next/cache` tags for revalidation

## TypeScript Strict Mode

- `strict: true` in `tsconfig.json`
- **No `any`** — use `unknown` or proper types
- **No `@ts-ignore`** or `@ts-expect-error`
- Enable `noUncheckedIndexedAccess`
- Use type inference; annotate only when needed

## Tailwind CSS v4 Only

### Syntax
```css
/* ✅ v4 - CSS-first */
@import "tailwindcss";
@theme { --color-primary: var(--color-blue-600); }

/* ❌ v3 - Config-first */
// tailwind.config.js with theme.extend
```

### Usage
- Use **CSS variables** for theming (`--color-primary`, `--radius`)
- Use **OKLCH** colors for perceptual uniformity
- Use `@apply` sparingly; prefer utility classes
- Dark mode via `@media (prefers-color-scheme: dark)`

## shadcn/ui Component Conventions

### Structure
```
components/ui/
├── button.tsx           # Base components
├── form.tsx             # Form wrappers
├── dialog.tsx           # Overlays
└── charts/              # Recharts wrappers
```

### Patterns
- **Copy, don't install** — components in `components/ui/`
- Extend via `className` prop, not by modifying base
- Use `cn()` utility: `cn(baseStyles, className)`
- Forward refs with `React.forwardRef`

### Example
```tsx
// components/ui/button.tsx
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
```

## Reusable Component Architecture

### Component Hierarchy
```
Page (Server Component)
├── Layout Components (Server)
│   ├── Sidebar
│   ├── Header
│   └── ModuleLayout
├── Feature Components (Client when interactive)
│   ├── ContentGenerator
│   ├── TemplateSelector
│   └── PreviewPanel
└── UI Primitives (Client)
    ├── Button
    ├── Input
    └── Select
```

### Rules
- **One component per file**
- **Colocate** types, styles, tests with component
- **Props interface** named `ComponentNameProps`
- **Default exports** for components
- **Named exports** for utilities, types

## Feature-Based Organization

```
src/
├── app/                          # Routes
│   ├── (dashboard)/
│   │   ├── modules/
│   │   │   ├── stock-content-factory/
│   │   │   │   ├── page.tsx      # Module entry
│   │   │   │   ├── components/   # Module-specific
│   │   │   │   └── hooks/        # Module-specific
│   │   │   └── ...
│   │   └── settings/
├── components/
│   ├── ui/                       # shadcn/ui base
│   ├── layout/                   # Shared layout
│   ├── ai/                       # AI streaming
│   └── forms/                    # Form components
├── lib/
│   ├── api/                      # TanStack Query client
│   ├── ai/                       # AI gateway client
│   ├── hooks/                    # Shared hooks
│   ├── utils/                    # cn(), formatters
│   ├── validations/              # Zod schemas
│   └── constants/                # App constants
├── providers/                    # Context providers
├── store/                        # Zustand stores
└── types/                        # Shared types
```

## API Integration Rules

### TanStack Query
```typescript
// lib/api/query-keys.ts
export const queryKeys = {
  modules: ['modules'] as const,
  module: (id: string) => ['modules', id] as const,
  aiProviders: ['ai', 'providers'] as const,
} as const;

// lib/api/hooks/use-modules.ts
export function useModules() {
  return useQuery({
    queryKey: queryKeys.modules,
    queryFn: () => api.get<Module[]>('/api/modules'),
  });
}

// Mutations
export function useCreateJob() {
  return useMutation({
    mutationFn: (job: CreateJobDTO) => api.post<Job>('/api/jobs', job),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.jobs }),
  });
}
```

### Rules
- **Centralized** API client in `lib/api/client.ts`
- **Query keys** as constants, typed with `as const`
- **Server state** → TanStack Query
- **Client state** → Zustand (minimal)
- **Optimistic updates** for mutations
- **Error boundaries** for failed queries

## Form Validation with Zod

### Schema Definition
```typescript
// lib/validations/module-settings.ts
export const moduleSettingsSchema = z.object({
  defaultModel: z.string().min(1, "Model required"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(32768).default(4096),
  systemPrompt: z.string().max(8000).optional(),
  enableStreaming: z.boolean().default(true),
});

export type ModuleSettings = z.infer<typeof moduleSettingsSchema>;
```

### Usage with React Hook Form
```tsx
const form = useForm<ModuleSettings>({
  resolver: zodResolver(moduleSettingsSchema),
  defaultValues,
});

<Form {...form}>
  <FormField
    control={form.control}
    name="defaultModel"
    render={({ field }) => (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
        <SelectContent>
          {models.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
        </SelectContent>
      </Select>
    )}
  />
</Form>
```

## Accessibility (WCAG AA)

- **Semantic HTML** — `<button>`, `<nav>`, `<main>`, `<section>`
- **Focus management** — visible focus rings (`focus-visible:ring-2`)
- **ARIA labels** — `aria-label`, `aria-describedby`
- **Color contrast** — 4.5:1 normal, 3:1 large
- **Keyboard navigation** — all interactive elements reachable
- **Screen readers** — `sr-only` for hidden labels
- **Reduced motion** — `@media (prefers-reduced-motion)`

## Responsive Design

- **Mobile-first** — base styles for < 640px
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Container queries** for component-level responsiveness
- **Flexible grids** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Fluid typography** — `text-base md:text-lg`

## Loading and Error States

### Loading
```tsx
// Skeleton components
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-12 w-full" />

// Suspense boundaries
<Suspense fallback={<ModuleSkeleton />}>
  <ModuleDashboard />
</Suspense>
```

### Error
```tsx
// Error boundaries
<ErrorBoundary fallback={<ModuleError />}>
  <ModuleContent />
</ErrorBoundary>

// Query errors
{error && <Alert variant="destructive">{error.message}</Alert>}
```

## Layout Shift Prevention

- **Aspect ratio** for images: `aspect-video`, `aspect-square`
- **Explicit dimensions** on all media
- **Font loading** — `next/font` with `display: swap`
- **Skeleton placeholders** matching content size
- **Avoid** inserting content above existing content

## Performance Optimization

### Bundle
- **Dynamic imports** for heavy components: `dynamic(() => import('./Heavy'))`
- **Code splitting** by route (automatic with App Router)
- **Tree shaking** — import only what you need
- **Bundle analyzer** — `pnpm build && pnpm @next/bundle-analyzer`

### Rendering
- **Server Components** for static content
- **Streaming** with `Suspense` for slow data
- **ISR** for semi-dynamic pages: `export const revalidate = 3600`

### Images
- **Next.js Image** with local loader
- **WebP/AVIF** formats
- **Responsive sizes** — `sizes="(max-width: 768px) 100vw, 50vw"`

## No Unnecessary Dependencies

### Before Adding
1. Can it be done with existing deps?
2. Is it in stdlib (React, Next.js, Tailwind)?
3. Is it a few lines of code?

### Allowed Additions
- **shadcn/ui** components (copy-paste)
- **Lucide React** icons
- **Zod** for validation
- **date-fns** for dates (if needed)

### Forbidden
- Moment.js (use date-fns)
- Lodash (use native JS)
- Classnames (use `cn()` utility)
- Redux (use Zustand + TanStack Query)

---

**See also:** Root `CLAUDE.md`, `.claude/skills/frontend-development/SKILL.md`