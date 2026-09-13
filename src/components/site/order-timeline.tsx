import { Check, Circle, Clock, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { ORDER_STATUS_FLOW, dateTime } from "@/lib/format";

export interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  note?: string;
  location?: string;
  at: string;
  actor?: string;
}

export function OrderTimeline({
  events,
  currentStatus,
  compact,
}: {
  events: TimelineEvent[];
  currentStatus: string;
  compact?: boolean;
}) {
  const currentIndex = ORDER_STATUS_FLOW.findIndex((s) => s.status === currentStatus);
  const eventByStatus = new Map(events.map((e) => [e.status, e]));
  const isTerminal = currentStatus === "cancelled" || currentStatus === "returned";

  return (
    <div className={cn("relative", compact && "text-sm")}>
      <ol className="space-y-0">
        {ORDER_STATUS_FLOW.map((step, index) => {
          const event = eventByStatus.get(step.status);
          const done = event != null;
          const active = !isTerminal && index === currentIndex;
          const upcoming = !done && !active;

          return (
            <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[11px] top-6 h-full w-px",
                    done ? "bg-emerald-200" : "bg-slate-200",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-300",
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3} /> : active ? <Clock className="size-3" /> : <Circle className="size-2 fill-current" />}
              </span>
              <div className={cn("min-w-0 flex-1", upcoming && "opacity-50")}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className={cn("text-sm font-medium", done || active ? "text-slate-800" : "text-slate-500")}>
                    {step.label}
                  </p>
                  {active && <Badge variant="default">Current stage</Badge>}
                </div>
                {event ? (
                  <>
                    <p className="mt-0.5 text-xs text-slate-500">{event.note ?? step.hint}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[11px] text-slate-400">
                      <span>{dateTime(event.at)}</span>
                      {event.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3" /> {event.location}
                        </span>
                      )}
                      {event.actor && <span>by {event.actor}</span>}
                    </p>
                  </>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-400">{step.hint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {isTerminal && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          This order was {currentStatus === "cancelled" ? "cancelled" : "returned"}. If a payment was collected, the refund is
          processed to your wallet or original payment method within 3 working days.
        </div>
      )}
    </div>
  );
}
