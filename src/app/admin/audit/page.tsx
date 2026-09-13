import { Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/fields";
import { EmptyState, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { dateTime, timeAgo } from "@/lib/format";
import { ROLE_LABEL } from "@/lib/roles";
import { listAuditLogs } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<{ q?: string; entity?: string }> }) {
  const sp = await searchParams;
  const logs = await listAuditLogs(300);
  const entities = Array.from(new Set(logs.map((l) => l.entity))).sort();

  const filtered = logs.filter((log) => {
    if (sp.entity && log.entity !== sp.entity) return false;
    if (sp.q) {
      const term = sp.q.toLowerCase();
      return (
        log.action.toLowerCase().includes(term) ||
        log.actor.toLowerCase().includes(term) ||
        (log.entityId ?? "").toLowerCase().includes(term) ||
        (log.meta ?? "").toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Immutable record of every admin mutation — who changed what, when and from which module."
        breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Audit log" }]}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href="/api/collections/staff?limit=200">Export team data</Link>
          </Button>
        }
      />

      <form className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
          <Input name="q" defaultValue={sp.q ?? ""} placeholder="Search action, actor, entity id or metadata…" className="h-9 pl-8" />
        </div>
        <Select name="entity" defaultValue={sp.entity ?? ""} className="h-9 w-auto min-w-[170px]">
          <option value="">Entity: all</option>
          {entities.map((entity) => (
            <option key={entity} value={entity}>
              {entity}
            </option>
          ))}
        </Select>
        <Button variant="cf" size="sm" type="submit">
          Filter
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/audit">Reset</Link>
        </Button>
        <span className="ml-auto text-xs text-slate-500">{filtered.length} entries</span>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        {filtered.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={<ShieldCheck className="size-5" />}
              title="No audit entries match"
              description="Clear the filters to see the full trail of admin activity."
            />
          </div>
        ) : (
          <TableWrap>
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Actor</TH>
                  <TH>Action</TH>
                  <TH>Entity</TH>
                  <TH className="hidden lg:table-cell">Details</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((log) => (
                  <TR key={log.id}>
                    <TD>
                      <span className="block text-sm text-slate-700">{dateTime(log.at)}</span>
                      <span className="block text-xs text-slate-400">{timeAgo(log.at)}</span>
                    </TD>
                    <TD>
                      <span className="block font-medium text-slate-800">{log.actor}</span>
                      <span className="block text-xs text-slate-400">{ROLE_LABEL[log.actorRole] ?? log.actorRole}</span>
                    </TD>
                    <TD>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{log.action}</code>
                    </TD>
                    <TD>
                      <Badge variant="secondary">{log.entity}</Badge>
                      {log.entityId && <span className="mt-1 block truncate text-[11px] text-slate-400">{log.entityId}</span>}
                    </TD>
                    <TD className="hidden max-w-[28rem] lg:table-cell">
                      <span className="line-clamp-2 text-xs text-slate-500">{log.meta ?? "—"}</span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}
      </div>
    </div>
  );
}
