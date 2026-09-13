import { ArrowRight, Package } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Table, TBody, TD, TH, THead, TR, TableWrap } from "@/components/ui/data";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE, PAYMENT_STATUS_LABEL, bdt, shortDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { getSession } from "@/server/auth-helpers";
import { getCustomerById } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AccountOrdersPage() {
  const session = await getSession();
  const customer = session?.user.customerId ? await getCustomerById(session.user.customerId) : null;
  const orders = ((customer as unknown as { orders?: Order[] })?.orders ?? []).slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<Package className="size-5" />}
        title="No orders yet"
        description="Your import orders will be listed here with live status, landed cost and courier tracking."
        action={
          <Button variant="brand" asChild>
            <Link href="/shop">Browse products</Link>
          </Button>
        }
      />
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900">My import orders</p>
          <p className="text-xs text-slate-500">{orders.length} orders · sorted by newest</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/quote">Request a new import</Link>
        </Button>
      </div>

      <TableWrap>
        <Table>
          <THead>
            <TR>
              <TH>Order</TH>
              <TH>Items</TH>
              <TH>Status</TH>
              <TH>Payment</TH>
              <TH className="text-right">Total</TH>
              <TH>Placed</TH>
              <TH />
            </TR>
          </THead>
          <TBody>
            {orders.map((order) => (
              <TR key={order.id}>
                <TD className="font-medium text-slate-900">
                  {order.orderNo}
                  <span className="block text-xs font-normal text-slate-400">{order.shippingMode.replace(/_/g, " ")}</span>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    {order.items.slice(0, 3).map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={item.id} src={item.image} alt={item.title} className="size-8 rounded border border-slate-200 object-cover" />
                    ))}
                    <span className="text-xs text-slate-500">×{order.items.length}</span>
                  </div>
                </TD>
                <TD>
                  <StatusPill tone={ORDER_STATUS_TONE[order.status] ?? "muted"}>{ORDER_STATUS_LABEL[order.status]}</StatusPill>
                </TD>
                <TD className="text-xs">
                  <span className={order.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}>
                    {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                  </span>
                  <span className="block text-slate-400">
                    {bdt(order.paidBdt)} / {bdt(order.totalBdt)}
                  </span>
                </TD>
                <TD className="text-right font-medium">{bdt(order.totalBdt)}</TD>
                <TD className="text-xs text-slate-500">{shortDate(order.createdAt)}</TD>
                <TD>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/order/${order.orderNo}`}>
                      View <ArrowRight className="size-3" />
                    </Link>
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableWrap>
    </Card>
  );
}
