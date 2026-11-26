"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { SearchIcon, XIcon, FilterIcon, SlidersHorizontalIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Checkbox,
  CheckboxProps,
} from "@/components/ui/checkbox";
import {
  Label,
} from "@/components/ui/label";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  filters?: SearchFilter[];
  showFilterButton?: boolean;
  className?: string;
}

interface SearchFilter {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
  multiple?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  debounceMs = 300,
  filters = [],
  showFilterButton = false,
  className,
  onChange,
  value,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(value || "");
  const [isFocused, setIsFocused] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({});
  const debounceRef = React.useRef<NodeJS.Timeout>();

  const searchValue = value ?? internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(e);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      onSearch?.(newValue);
    }, debounceMs);
  };

  const clearSearch = () => {
    if (value === undefined) {
      setInternalValue("");
    }
    onChange?.({ target: { value: "" } } as React.ChangeEvent<HTMLInputElement>);
    onSearch?.("");
  };

  const toggleFilter = (filterKey: string, optionValue: string) => {
    setActiveFilters((prev) => {
      const current = prev[filterKey] || [];
      const isActive = current.includes(optionValue);
      return {
        ...prev,
        [filterKey]: isActive
          ? current.filter((v) => v !== optionValue)
          : [...current, optionValue],
      };
    });
  };

  const clearFilters = () => {
    setActiveFilters({});
  };

  const hasActiveFilters = Object.values(activeFilters).some((arr) => arr.length > 0);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <SearchIcon className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          isFocused && "text-primary"
        )} aria-hidden="true" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "pl-10 pr-10",
            "focus:ring-2 focus:ring-ring focus:ring-offset-2",
            hasActiveFilters && "bg-primary/5 border-primary/20"
          )}
          {...props}
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {showFilterButton && filters.length > 0 && (
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveFilters ? "secondary" : "outline"}
              size="icon"
              className="relative h-10"
              aria-label="Filters"
            >
              <FilterIcon className="h-4 w-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                  {Object.values(activeFilters).reduce((sum, arr) => sum + arr.length, 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-72 p-2">
            <div className="space-y-3">
              {filters.map((filter) => (
                <div key={filter.key} className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {filter.label}
                  </Label>
                  <div className="space-y-1.5 max-h-48 overflow-auto">
                    {filter.options.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={activeFilters[filter.key]?.includes(option.value) || false}
                          onCheckedChange={(checked) => toggleFilter(filter.key, option.value)}
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={clearFilters}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Clear all filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

// Advanced search with facets
interface FacetedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  facets: SearchFacet[];
  placeholder?: string;
  className?: string;
}

interface SearchFacet {
  key: string;
  label: string;
  type: "select" | "multi-select" | "range" | "date";
  options?: Array<{ value: string; label: string; count?: number }>;
  value?: string | string[] | { min?: number; max?: number } | { start?: Date; end?: Date };
  onChange: (value: unknown) => void;
}

export function FacetedSearch({
  value,
  onChange,
  onSearch,
  facets,
  placeholder = "Search...",
  className,
}: FacetedSearchProps) {
  const [expandedFacets, setExpandedFacets] = React.useState<string[]>([]);

  return (
    <div className={cn("space-y-3", className)}>
      <SearchInput
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeholder}
        showFilterButton={facets.length > 0}
        filters={facets.map((f) => ({
          key: f.key,
          label: f.label,
          options: f.options?.map((o) => ({ value: o.value, label: o.label })) || [],
          multiple: f.type === "multi-select",
        }))}
      />

      {facets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {facets.map((facet) => (
            <FacetChip key={facet.key} facet={facet} />
          ))}
        </div>
      )}
    </div>
  );
}

function FacetChip({ facet }: { facet: SearchFacet }) {
  const hasValue = facet.value && (
    Array.isArray(facet.value) ? facet.value.length > 0 :
    typeof facet.value === "object" ? Object.keys(facet.value).length > 0 :
    !!facet.value
  );

  if (!hasValue) return null;

  const displayValue = React.useMemo(() => {
    if (Array.isArray(facet.value)) {
      return facet.value.join(", ");
    }
    if (typeof facet.value === "object") {
      if ("min" in facet.value || "max" in facet.value) {
        return `${facet.value.min ?? "min"} - ${facet.value.max ?? "max"}`;
      }
      if ("start" in facet.value || "end" in facet.value) {
        return `${facet.value.start?.toLocaleDateString() ?? "..."} - ${facet.value.end?.toLocaleDateString() ?? "..."}`;
      }
    }
    return String(facet.value);
  }, [facet.value]);

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
      <span className="font-medium">{facet.label}:</span>
      <span>{displayValue}</span>
      <button
        onClick={() => facet.onChange(facet.type === "multi-select" ? [] : undefined)}
        className="ml-0.5 p-0.5 rounded hover:bg-primary/20"
        aria-label={`Remove ${facet.label} filter`}
      >
        <XIcon className="h-3 w-3" />
      </button>
    </span>
  );
}

// Missing UI components - Checkbox and Popover
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "@/components/ui/icons";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <CheckIcon className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Popover
import * as PopoverPrimitive from "@radix-ui/react-popover";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };