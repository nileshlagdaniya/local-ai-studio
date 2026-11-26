"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableFooter,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  FilterIcon,
  ColumnsIcon,
  DownloadIcon,
  MoreHorizontalIcon,
} from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  renderHeader?: () => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyAccessor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: Set<string>;
  onSelectionChange?: (selected: Set<string>) => void;
  sortable?: boolean;
  defaultSort?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string, direction: "asc" | "desc") => void;
  filterable?: boolean;
  filters?: Record<string, unknown>;
  onFilterChange?: (filters: Record<string, unknown>) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
  };
  actions?: (row: T) => React.ReactNode;
  rowClassName?: (row: T) => string;
  className?: string;
  caption?: string;
  stickyHeader?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  compact?: boolean;
}

function defaultKeyAccessor<T>(row: T) {
  return JSON.stringify(row);
}

export function DataTable<T>({
  columns,
  data,
  keyAccessor = defaultKeyAccessor,
  isLoading = false,
  emptyMessage = "No data available",
  emptyIcon,
  onRowClick,
  selectable = false,
  selectedRows = new Set(),
  onSelectionChange,
  sortable = true,
  defaultSort,
  onSort,
  filterable = false,
  filters = {},
  onFilterChange,
  pagination,
  actions,
  rowClassName,
  className,
  caption,
  stickyHeader = true,
  hoverable = true,
  striped = false,
  compact = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" } | null>(
    defaultSort || null
  );
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const handleSort = (key: string) => {
    if (!sortable) return;
    const column = columns.find((c) => c.key === key);
    if (!column?.sortable) return;

    const direction = sortConfig?.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = new Set(data.map(keyAccessor));
      onSelectionChange?.(newSelection);
    } else {
      onSelectionChange?.(new Set());
    }
  };

  const handleSelectRow = (rowKey: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(rowKey);
    } else {
      newSelection.delete(rowKey);
    }
    onSelectionChange?.(newSelection);
  };

  const toggleColumn = (key: string) => {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const visibleColumns = columns.filter((col) => columnVisibility[col.key]);
  const allSelected = data.length > 0 && data.every((row) => selectedRows.has(keyAccessor(row)));
  const someSelected = data.some((row) => selectedRows.has(keyAccessor(row)));

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = columns.find((c) => c.key === sortConfig.key)?.accessor(a);
      const bVal = columns.find((c) => c.key === sortConfig.key)?.accessor(b);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [data, sortConfig, columns]);

  const filteredData = React.useMemo(() => {
    if (!globalFilter) return sortedData;
    const lowerFilter = globalFilter.toLowerCase();
    return sortedData.filter((row) =>
      visibleColumns.some((col) => {
        const value = col.accessor(row);
        return String(value).toLowerCase().includes(lowerFilter);
      })
    );
  }, [sortedData, globalFilter, visibleColumns]);

  const displayData = pagination ? filteredData : filteredData;

  if (isLoading) {
    return <DataTableSkeleton columns={visibleColumns.length} selectable={selectable} compact={compact} />;
  }

  return (
    <div className={cn("w-full overflow-auto", className)}>
      {filterable && (
        <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-card border rounded-lg">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter rows..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            {visibleColumns.some((c) => c.filterable) && (
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4 mr-2" />
                Filters
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ColumnsIcon className="h-4 w-4 mr-2" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-auto">
                {columns.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent">
                    <Checkbox
                      checked={columnVisibility[col.key]}
                      onCheckedChange={() => toggleColumn(col.key)}
                    />
                    <span className="text-sm">{col.header}</span>
                  </label>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {pagination && (
              <Button variant="outline" size="sm">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      )}

      <Table className={cn(stickyHeader && "sticky-header")}>
        {caption && <TableCaption className="text-sm text-muted-foreground pb-2">{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all rows"
                />
              </TableHead>
            )}
            {visibleColumns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "font-medium text-muted-foreground",
                  column.align && `text-${column.align}`,
                  column.width && `w-[${column.width}]`,
                  column.minWidth && `min-w-[${column.minWidth}]`,
                  column.maxWidth && `max-w-[${column.maxWidth}]`,
                  column.headerClassName
                )}
                style={{ width: column.width, minWidth: column.minWidth, maxWidth: column.maxWidth }}
              >
                {column.renderHeader ? (
                  column.renderHeader()
                ) : column.sortable && sortable ? (
                  <button
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      "flex items-center gap-1 hover:text-foreground transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    )}
                    aria-sort={
                      sortConfig?.key === column.key
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {column.header}
                    {sortConfig?.key === column.key ? (
                      sortConfig.direction === "asc" ? (
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <span className="inline-flex h-3.5 w-3.5 text-muted-foreground/50">
                        <ChevronUpIcon className="h-3.5 w-3.5" />
                        <ChevronDownIcon className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="w-12 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="py-12 text-center"
              >
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  {emptyIcon || (
                    <svg className="h-12 w-12 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      <path d="M7 7l10 10" />
                    </svg>
                  )}
                  <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
                  {globalFilter && (
                    <p className="text-xs">Try adjusting your search or filters</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            displayData.map((row, rowIndex) => {
              const rowKey = keyAccessor(row);
              const isSelected = selectedRows.has(rowKey);
              return (
                <TableRow
                  key={rowKey}
                  className={cn(
                    "transition-colors",
                    hoverable && "hover:bg-muted/50",
                    striped && rowIndex % 2 === 1 && "bg-muted/30",
                    isSelected && "bg-primary/5",
                    rowClassName?.(row)
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: "pointer" } : undefined}
                >
                  {selectable && (
                    <TableCell className="w-12 text-center">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(rowKey, (e.target as HTMLInputElement).checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        column.align && `text-${column.align}`,
                        column.cellClassName
                      )}
                    >
                      {column.accessor(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
        {pagination && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Showing{" "}
                      <span className="font-medium">
                        {((pagination.page - 1) * pagination.pageSize) + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{pagination.total}</span>{" "}
                      results
                    </span>
                    <Select
                      value={String(pagination.pageSize)}
                      onValueChange={(v) => pagination.onPageSizeChange(Number(v))}
                    >
                      <SelectTrigger className="w-auto h-8 text-sm">
                        <SelectValue placeholder="Page size" />
                      </SelectTrigger>
                      <SelectContent>
                        {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size} per page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => pagination.onPageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => pagination.onPageChange(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                      aria-label="Next page"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}

function DataTableSkeleton({ columns = 4, selectable = false, compact = false }: { columns?: number; selectable?: boolean; compact?: boolean }) {
  const colCount = columns + (selectable ? 1 : 0);
  return (
    <div className="rounded-lg border" aria-label="Loading table">
      <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
        {Array.from({ length: colCount }, (_, i) => (
          <div key={i} className="h-8 w-3/4 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
            {Array.from({ length: colCount }, (_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  "h-10 bg-muted animate-pulse rounded",
                  compact && "h-8"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

