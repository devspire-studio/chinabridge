"use client";

import { Download, Filter, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/fields";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/overlays";
import { EmptyState, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { bdt, dateTime, kg, shortDate, titleCase } from "@/lib/format";

export type ColumnType =
  | "text"
  | "strong"
  | "muted"
  | "number"
  | "currency"
  | "weight"
  | "date"
  | "datetime"
  | "badge"
  | "image"
  | "link"
  | "boolean"
  | "progress";

export interface ColumnSpec {
  key: string;
  label: string;
  type?: ColumnType;
  badgeMap?: Record<string, "default" | "success" | "warning" | "danger" | "info" | "muted" | "secondary" | "accent">;
  href?: string;
  sub?: string;
  width?: string;
  align?: "left" | "right";
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

export interface FieldSpec {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "checkbox" | "date" | "tags" | "lines";
  options?: { value: string; label: string }[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
  span?: 1 | 2;
  step?: string;
}

export interface FilterSpec {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface ResourceTableProps {
  collection: string;
  title: string;
  description?: string;
  columns: ColumnSpec[];
  fields?: FieldSpec[];
  filters?: FilterSpec[];
  searchPlaceholder?: string;
  createLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  pageSize?: number;
  rowHrefPrefix?: string;
  /** extra client-side filter applied after fetch */
  clientFilter?: { key: string; value: string };
  defaults?: Record<string, unknown>;
  actions?: React.ReactNode;
}

type Row = Record<string, unknown>;

export function ResourceTable(props: ResourceTableProps) {
  const {
    collection,
    title,
    description,
    columns,
    fields = [],
    filters = [],
    searchPlaceholder = "Search…",
    createLabel,
    emptyTitle = "Nothing here yet",
    emptyDescription,
    allowCreate = true,
    allowEdit = true,
    allowDelete = true,
    pageSize = 20,
    rowHrefPrefix,
    clientFilter,
    defaults = {},
    actions,
  } = props;

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "300" });
      if (query) params.set("q", query);
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value) params.set(`f_${key}`, value);
      }
      const res = await fetch(`/api/collections/${collection}?${params.toString()}`);
      const data = await res.json();
      const fetched: Row[] = data.rows ?? [];
      setRows(clientFilter ? fetched.filter((row) => String(row[clientFilter.key]) === clientFilter.value) : fetched);
    } catch {
      toast.error("Could not load records");
    } finally {
      setLoading(false);
    }
  }, [collection, query, activeFilters, clientFilter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const filtered = rows;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openCreate() {
    const initial: Record<string, unknown> = { ...defaults };
    for (const field of fields) if (field.type === "checkbox") initial[field.name] = false;
    setDraft(initial);
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: Row) {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      const value = row[field.name];
      if (field.type === "tags" || field.type === "lines") initial[field.name] = Array.isArray(value) ? value.join("\n") : value ?? "";
      else if (field.type === "date") initial[field.name] = value ? String(value).slice(0, 10) : "";
      else if (field.type === "checkbox") initial[field.name] = Boolean(value);
      else initial[field.name] = value ?? "";
    }
    setDraft(initial);
    setEditing(row);
    setDialogOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        let value = draft[field.name];
        if (field.type === "tags" || field.type === "lines") {
          value = String(value ?? "")
            .split("\n")
            .map((v) => v.trim())
            .filter(Boolean);
        } else if (field.type === "number") {
          value = value === "" || value == null ? 0 : Number(value);
        } else if (field.type === "date") {
          value = value ? new Date(String(value)).toISOString() : null;
        }
        payload[field.name] = value;
      }

      const res = await fetch(
        editing ? `/api/collections/${collection}/${editing.id}` : `/api/collections/${collection}`,
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      toast.success(editing ? "Record updated" : "Record created");
      setDialogOpen(false);
      void load();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete this ${title.replace(/s$/, "").toLowerCase()}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/collections/${collection}/${row.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      toast.success(data.archived ? data.note : "Record deleted");
      void load();
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function bulkDelete() {
    if (!selected.length) return;
    if (!window.confirm(`Delete ${selected.length} selected record(s)?`)) return;
    for (const id of selected) {
      await fetch(`/api/collections/${collection}/${id}`, { method: "DELETE" });
    }
    toast.success(`${selected.length} record(s) deleted`);
    setSelected([]);
    void load();
  }

  function exportCsv() {
    const header = columns.map((c) => c.label).join(",");
    const body = filtered
      .map((row) =>
        columns
          .map((col) => {
            const value = row[col.key];
            const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${collection}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function renderCell(row: Row, col: ColumnSpec): React.ReactNode {
    const raw = row[col.key];
    switch (col.type) {
      case "currency":
        return <span className="font-medium text-slate-800">{bdt(Number(raw ?? 0))}</span>;
      case "number":
        return <span className="tabular-nums">{Number(raw ?? 0).toLocaleString("en-IN")}</span>;
      case "weight":
        return <span>{kg(Number(raw ?? 0))}</span>;
      case "date":
        return <span className="text-slate-500">{raw ? shortDate(String(raw)) : "—"}</span>;
      case "datetime":
        return <span className="text-slate-500">{raw ? dateTime(String(raw)) : "—"}</span>;
      case "badge": {
        const value = String(raw ?? "—");
        const tone = col.badgeMap?.[value] ?? "muted";
        return <Badge variant={tone === "muted" ? "muted" : tone}>{titleCase(value)}</Badge>;
      }
      case "boolean":
        return raw ? <Badge variant="success">Yes</Badge> : <Badge variant="muted">No</Badge>;
      case "image": {
        const src = Array.isArray(raw) ? (raw[0] as string) : (raw as string);
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-9 rounded-md border border-slate-200 object-cover" />
        ) : (
          <span className="text-slate-300">—</span>
        );
      }
      case "link": {
        const value = String(raw ?? "");
        return value ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
            Open link
          </a>
        ) : (
          <span className="text-slate-300">—</span>
        );
      }
      case "strong": {
        const sub = col.sub ? row[col.sub] : null;
        return (
          <span className="block">
            <span className="font-medium text-slate-900">{String(raw ?? "—")}</span>
            {sub != null && <span className="block text-xs text-slate-400">{String(sub)}</span>}
          </span>
        );
      }
      case "muted":
        return <span className="text-slate-400">{String(raw ?? "—")}</span>;
      case "progress": {
        const pct = Number(raw ?? 0);
        return (
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-cf-orange" style={{ width: `${Math.min(100, pct)}%` }} />
            </span>
            <span className="text-xs text-slate-500">{pct}%</span>
          </span>
        );
      }
      default:
        return <span className="line-clamp-2 max-w-[26rem] text-slate-700">{String(raw ?? "—")}</span>;
    }
  }

  const hiddenClass = {
    sm: "hidden sm:table-cell",
    md: "hidden md:table-cell",
    lg: "hidden lg:table-cell",
    xl: "hidden xl:table-cell",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
          />
        </div>

        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={activeFilters[filter.key] ?? ""}
            onChange={(e) => {
              setActiveFilters((prev) => ({ ...prev, [filter.key]: e.target.value }));
              setPage(1);
            }}
            className="h-9 w-auto min-w-[150px]"
          >
            <option value="">{filter.label}: all</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ))}

        {(query || Object.values(activeFilters).some(Boolean)) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              setActiveFilters({});
            }}
          >
            <X className="size-3.5" /> Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {selected.length > 0 && (
            <>
              <Badge variant="default">{selected.length} selected</Badge>
              <Button variant="outline" size="sm" onClick={bulkDelete} className="text-rose-600">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => void load()} title="Refresh">
            <RefreshCw className="size-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-3.5" /> Export
          </Button>
          {actions}
          {allowCreate && fields.length > 0 && (
            <Button variant="cf" size="sm" onClick={openCreate}>
              <Plus className="size-3.5" /> {createLabel ?? `Add ${title.replace(/s$/, "")}`}
            </Button>
          )}
        </div>
      </div>

      {(description || filters.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Filter className="size-3.5" /> {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </span>
          {description && <span className="text-slate-400">{description}</span>}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : pageRows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={
                allowCreate && fields.length > 0 ? (
                  <Button variant="cf" size="sm" onClick={openCreate}>
                    <Plus className="size-3.5" /> {createLabel ?? `Add ${title.replace(/s$/, "")}`}
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH className="w-10">
                    <Checkbox
                      checked={pageRows.length > 0 && pageRows.every((row) => selected.includes(String(row.id)))}
                      onCheckedChange={(checked) =>
                        setSelected(checked ? pageRows.map((row) => String(row.id)) : [])
                      }
                    />
                  </TH>
                  {columns.map((col) => (
                    <TH key={col.key} style={{ width: col.width }} className={col.hideBelow ? hiddenClass[col.hideBelow] : undefined}>
                      {col.label}
                    </TH>
                  ))}
                  {(allowEdit || allowDelete || rowHrefPrefix) && <TH className="text-right">Actions</TH>}
                </TR>
              </THead>
              <TBody>
                {pageRows.map((row) => (
                  <TR key={String(row.id)}>
                    <TD>
                      <Checkbox
                        checked={selected.includes(String(row.id))}
                        onCheckedChange={(checked) =>
                          setSelected((prev) => (checked ? [...prev, String(row.id)] : prev.filter((id) => id !== String(row.id))))
                        }
                      />
                    </TD>
                    {columns.map((col) => (
                      <TD
                        key={col.key}
                        className={col.hideBelow ? hiddenClass[col.hideBelow] : undefined}
                        style={col.align === "right" ? { textAlign: "right" } : undefined}
                      >
                        {col.href ? (
                          <Link href={col.href.replace("{id}", String(row.id))} className="hover:text-primary">
                            {renderCell(row, col)}
                          </Link>
                        ) : (
                          renderCell(row, col)
                        )}
                      </TD>
                    ))}
                    {(allowEdit || allowDelete || rowHrefPrefix) && (
                      <TD className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {rowHrefPrefix && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={rowHrefPrefix.replace("{id}", String(row.id))}>Open</Link>
                            </Button>
                          )}
                          {allowEdit && fields.length > 0 && (
                            <button onClick={() => openEdit(row)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Edit">
                              <Pencil className="size-3.5" />
                            </button>
                          )}
                          {allowDelete && (
                            <button onClick={() => remove(row)} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="Delete">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </TD>
                    )}
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        {pageCount > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>
              Page {page} of {pageCount} · {filtered.length} records
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit ${title.replace(/s$/, "")}` : `New ${title.replace(/s$/, "")}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                required={field.required}
                className={field.span === 2 ? "sm:col-span-2" : undefined}
              >
                {field.type === "textarea" || field.type === "lines" ? (
                  <Textarea
                    value={String(draft[field.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={String(draft[field.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                  >
                    <option value="">— select —</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                ) : field.type === "checkbox" ? (
                  <label className="flex h-10 items-center gap-2 text-sm text-slate-600">
                    <Checkbox
                      checked={Boolean(draft[field.name])}
                      onCheckedChange={(checked) => setDraft({ ...draft, [field.name]: Boolean(checked) })}
                    />
                    Enabled
                  </label>
                ) : field.type === "tags" ? (
                  <Textarea
                    value={String(draft[field.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                    placeholder={"one per line\nhot\nwholesale"}
                  />
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    step={field.step}
                    value={String(draft[field.name] ?? "")}
                    onChange={(e) => setDraft({ ...draft, [field.name]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </Field>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="cf" loading={saving} onClick={save}>
              {editing ? "Save changes" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
