import { MessageCircle, Ticket as TicketIcon } from "lucide-react";
import Link from "next/link";

import { Badge, StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/data";
import { dateTime, timeAgo, titleCase } from "@/lib/format";
import { getSession } from "@/server/auth-helpers";
import { listTickets } from "@/server/queries";

export const dynamic = "force-dynamic";

const TONE: Record<string, "default" | "info" | "success" | "warning" | "danger" | "muted"> = {
  open: "warning",
  pending: "info",
  resolved: "success",
  closed: "muted",
};

export default async function AccountTicketsPage() {
  const session = await getSession();
  const tickets = (await listTickets({})).filter((t) => t.customerId === session?.user.customerId);

  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon className="size-5" />}
        title="No support tickets"
        description="Open a ticket from the contact page and we will follow up by phone, email or WhatsApp."
        action={
          <Button variant="brand" asChild>
            <Link href="/contact">Contact support</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <p className="text-sm font-semibold text-slate-900">Support tickets</p>
        <p className="text-xs text-slate-500">
          {tickets.length} conversations · average first reply under 4 working hours.
        </p>
      </Card>

      {tickets.map((ticket) => {
        const last = ticket.messages[ticket.messages.length - 1];
        return (
          <Card key={ticket.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{ticket.ref}</span>
                  <StatusPill tone={TONE[ticket.status] ?? "muted"}>{titleCase(ticket.status)}</StatusPill>
                  <Badge variant="secondary">{titleCase(ticket.category)}</Badge>
                  {ticket.priority === "urgent" || ticket.priority === "high" ? (
                    <Badge variant="danger">{titleCase(ticket.priority)} priority</Badge>
                  ) : null}
                </div>
                <p className="mt-1.5 text-sm text-slate-700">{ticket.subject}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {ticket.orderNo ? `Order ${ticket.orderNo} · ` : ""}
                  opened {timeAgo(ticket.createdAt)}
                  {ticket.assignedTo ? ` · ${ticket.assignedTo}` : ""}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{ticket.messages.length} messages</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {ticket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 text-sm ${
                    message.role === "agent" ? "bg-primary/5 text-slate-700" : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <p className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-3" /> {message.author}
                      {message.role === "agent" && <Badge variant="default">ChinaBridge</Badge>}
                    </span>
                    <span className="text-slate-400">{dateTime(message.at)}</span>
                  </p>
                  <p className="mt-1.5 whitespace-pre-line leading-relaxed">{message.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/contact">Reply to this ticket</Link>
              </Button>
              {ticket.orderNo && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/order/${ticket.orderNo}`}>View order {ticket.orderNo}</Link>
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
