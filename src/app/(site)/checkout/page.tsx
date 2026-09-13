"use client";

import {
  Banknote,
  Building2,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  Phone,
  Plane,
  ShieldCheck,
  Ship,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCart, useSettings } from "@/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/data";
import { Field, Input, Label, Select, Textarea } from "@/components/ui/fields";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";
import { bdt, kg } from "@/lib/format";
import { SHIPPING_RATES } from "@/lib/pricing";
import type { Address, PaymentMethod, ShippingMode } from "@/lib/types";

const STEPS = ["Delivery details", "Freight & extras", "Payment", "Review"] as const;

const PAYMENTS: { id: PaymentMethod; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: "bkash", label: "bKash", hint: "Send money to 01711-000111 (merchant)", icon: Smartphone },
  { id: "nagad", label: "Nagad", hint: "Send money to 01811-000222", icon: Smartphone },
  { id: "rocket", label: "Rocket", hint: "Bill pay → ChinaBridge BD", icon: Smartphone },
  { id: "bank_transfer", label: "Bank transfer", hint: "City Bank A/C 1402-8871-0001, Banani branch", icon: Landmark },
  { id: "card", label: "Card / online", hint: "Visa, Mastercard, AmEx via SSLCOMMERZ", icon: CreditCard },
  { id: "wallet", label: "ChinaBridge wallet", hint: "Pay instantly from your wallet balance", icon: Wallet },
  { id: "cod", label: "Cash on delivery", hint: `Available under ৳20,000 · ${2}% handling fee`, icon: Banknote },
];

export default function CheckoutPage() {
  const settings = useSettings();
  const router = useRouter();
  const { items, pricing, shippingMode, setShippingMode, couponCode, discountBdt, clear, hydrated, previewPrice } = useCart();
  const { data: session } = authClient.useSession();

  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [savedAddresses, setSavedAddresses] = React.useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("new");
  const [payment, setPayment] = React.useState<PaymentMethod>("bkash");
  const [outsideDhaka, setOutsideDhaka] = React.useState(false);
  const [insured, setInsured] = React.useState(false);
  const [notes, setNotes] = React.useState("");

  const user = session?.user as { name?: string; email?: string; phone?: string } | undefined;

  const [address, setAddress] = React.useState<Address>({
    fullName: "",
    phone: "",
    addressLine: "",
    area: "",
    city: "Dhaka",
    district: "Dhaka",
    postcode: "",
    label: "Home",
  });

  React.useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  React.useEffect(() => {
    if (!session) return;
    fetch("/api/account/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.customer?.addresses?.length) {
          setSavedAddresses(data.customer.addresses);
          const def = data.customer.addresses.find((a: Address) => a.isDefault) ?? data.customer.addresses[0];
          setSelectedAddressId(def.id ?? "new");
          setAddress({
            fullName: def.fullName,
            phone: def.phone,
            addressLine: def.addressLine,
            area: def.area,
            city: def.city,
            district: def.district,
            postcode: def.postcode ?? "",
            label: def.label,
            isDefault: def.isDefault,
          });
        }
      })
      .catch(() => null);
  }, [session]);

  const quoting = React.useMemo(() => previewPrice(shippingMode), [previewPrice, shippingMode]);

  if (!hydrated) {
    return (
      <div className="container-x flex items-center justify-center py-24 text-sm text-slate-400">
        <Loader2 className="mr-2 size-4 animate-spin" /> Preparing checkout…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <EmptyState
          title="Nothing to check out"
          description="Your cart is empty — add products first, then come back to place the import order."
          action={
            <Button variant="brand" asChild>
              <Link href="/shop">Browse products</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const advance = Math.round((quoting.totalBdt * settings.advancePaymentPct) / 100);
  const codAllowed = quoting.totalBdt <= 20000;

  function next() {
    if (step === 0) {
      if (!address.fullName || !address.phone || !address.addressLine || !address.area) {
        toast.error("Please complete the delivery details");
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function placeOrder() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variant: i.variant })),
          shippingMode,
          address,
          paymentMethod: payment === "cod" && !codAllowed ? "bkash" : payment,
          couponCode,
          notes,
          channel: "store",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place the order");
      toast.success(`Order ${data.orderNo} placed!`, {
        description:
          payment === "wallet"
            ? "Paid from your wallet — sourcing starts today."
            : `Complete the ${settings.advancePaymentPct}% advance (${bdt(data.total)}) to start sourcing.`,
      });
      clear();
      router.push(`/order/${data.orderNo}?new=1`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-x py-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everything is quoted up front — pay only the advance now, the balance before delivery.
      </p>

      {/* stepper */}
      <ol className="mt-6 flex flex-wrap items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                i === step
                  ? "border-primary bg-primary text-white"
                  : i < step
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-400",
              )}
            >
              <span className="flex size-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                {i < step ? <CheckCircle2 className="size-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && <span className="hidden h-px w-6 bg-slate-200 sm:block" />}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          {step === 0 && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <MapPin className="size-4 text-primary" /> Delivery details
              </p>

              {savedAddresses.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {savedAddresses.map((saved) => (
                    <button
                      key={saved.id}
                      onClick={() => {
                        setSelectedAddressId(saved.id ?? "new");
                        setAddress({
                          fullName: saved.fullName,
                          phone: saved.phone,
                          addressLine: saved.addressLine,
                          area: saved.area,
                          city: saved.city,
                          district: saved.district,
                          postcode: saved.postcode ?? "",
                          label: saved.label,
                          isDefault: saved.isDefault,
                        });
                      }}
                      className={cn(
                        "rounded-lg border p-3 text-left text-xs transition-colors",
                        selectedAddressId === saved.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{saved.label}</span>
                        {saved.isDefault && <Badge variant="secondary">Default</Badge>}
                      </span>
                      <span className="mt-1 block text-slate-500">
                        {saved.fullName} · {saved.phone}
                      </span>
                      <span className="mt-0.5 block text-slate-500">
                        {saved.addressLine}, {saved.area}, {saved.city}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" required>
                  <Input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="Rakib Hasan" />
                </Field>
                <Field label="Mobile number" required hint="We send SMS updates at every milestone">
                  <Input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="01XXXXXXXXX" />
                </Field>
                <Field label="Address" required className="sm:col-span-2">
                  <Input
                    value={address.addressLine}
                    onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                    placeholder="House 42, Road 11, Block C"
                  />
                </Field>
                <Field label="Area / Thana" required>
                  <Input value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} placeholder="Banani" />
                </Field>
                <Field label="City" required>
                  <Select
                    value={address.city}
                    onChange={(e) => {
                      const city = e.target.value;
                      setAddress({ ...address, city, district: city });
                      setOutsideDhaka(!["Dhaka"].includes(city));
                    }}
                  >
                    {["Dhaka", "Chattogram", "Sylhet", "Khulna", "Rajshahi", "Bogura", "Cumilla", "Narayanganj", "Gazipur", "Rangpur", "Mymensingh"].map(
                      (city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ),
                    )}
                  </Select>
                </Field>
                <Field label="District">
                  <Input value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} />
                </Field>
                <Field label="Postcode">
                  <Input value={address.postcode ?? ""} onChange={(e) => setAddress({ ...address, postcode: e.target.value })} placeholder="1213" />
                </Field>
                <Field label="Order notes" className="sm:col-span-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Colour preference, supplier link, delivery instructions or BIN/VAT number for wholesale orders."
                  />
                </Field>
              </div>

              <Button variant="brand" className="mt-4" onClick={next}>
                Continue to freight options
              </Button>
            </Card>
          )}

          {step === 1 && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Truck className="size-4 text-primary" /> Freight mode & extras
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SHIPPING_RATES.map((rate) => {
                  const preview = previewPrice(rate.mode);
                  return (
                    <button
                      key={rate.mode}
                      onClick={() => setShippingMode(rate.mode as ShippingMode)}
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors",
                        shippingMode === rate.mode ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          {rate.unit === "kg" ? <Plane className="size-4" /> : <Ship className="size-4" />}
                          {rate.label}
                        </span>
                        <span className="text-sm font-bold text-primary">{bdt(preview.freightBdt)}</span>
                      </span>
                      <span className="mt-1.5 block text-xs text-slate-500">
                        {rate.transitDaysMin}–{rate.transitDaysMax} days · {bdt(rate.rateBdt)}/{rate.unit}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">{rate.description}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3 rounded-lg bg-slate-50 p-4">
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-slate-300"
                    checked={insured}
                    onChange={(e) => setInsured(e.target.checked)}
                  />
                  <span>
                    Add cargo insurance ({settings.insurancePct}% of goods value)
                    <span className="block text-xs text-slate-400">Recommended for electronics and high-value consignments.</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-slate-300"
                    checked={outsideDhaka}
                    onChange={(e) => setOutsideDhaka(e.target.checked)}
                  />
                  <span>
                    Deliver outside Dhaka ({bdt(settings.homeDeliveryOutsideBdt)} vs {bdt(settings.homeDeliveryDhakaBdt)})
                  </span>
                </label>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button variant="brand" onClick={next}>
                  Continue to payment
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ShieldCheck className="size-4 text-primary" /> Payment method
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Advance payable now: <span className="font-semibold text-slate-700">{bdt(advance)}</span> (
                {settings.advancePaymentPct}% of {bdt(quoting.totalBdt)}) — balance before delivery.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {PAYMENTS.map((option) => {
                  const disabled = option.id === "cod" && !codAllowed;
                  return (
                    <button
                      key={option.id}
                      disabled={disabled}
                      onClick={() => setPayment(option.id)}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-colors",
                        payment === option.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        <option.icon className="size-4" /> {option.label}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {disabled ? "Not available above ৳20,000" : option.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                <p className="font-semibold">How payment works</p>
                <p className="mt-1">
                  Place the order, then send the advance to the number shown on your order page and submit the transaction ID.
                  Our finance desk verifies within 30 minutes during business hours and sourcing starts the same day.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button variant="brand" onClick={next}>
                  Review order
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-5">
              <p className="text-sm font-semibold text-slate-900">Review & confirm</p>

              <div className="mt-4 space-y-3">
                <div className="rounded-lg border border-slate-200 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium text-slate-800">
                    <MapPin className="size-4 text-primary" /> Deliver to
                  </p>
                  <p className="mt-2 text-slate-600">
                    {address.fullName} · {address.phone}
                    <br />
                    {address.addressLine}, {address.area}, {address.city}
                    {address.postcode ? ` ${address.postcode}` : ""}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-4 text-sm">
                  <p className="flex items-center gap-2 font-medium text-slate-800">
                    <Truck className="size-4 text-primary" /> Freight & payment
                  </p>
                  <p className="mt-2 text-slate-600">
                    {SHIPPING_RATES.find((r) => r.mode === shippingMode)?.label} ·{" "}
                    {SHIPPING_RATES.find((r) => r.mode === shippingMode)?.transitDaysMin}–
                    {SHIPPING_RATES.find((r) => r.mode === shippingMode)?.transitDaysMax} days
                    <br />
                    Paying by {PAYMENTS.find((p) => p.id === payment)?.label}
                    {insured ? " · cargo insurance included" : ""}
                    {outsideDhaka ? " · outside Dhaka delivery" : " · Dhaka delivery"}
                  </p>
                </div>
              </div>

              <ul className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variant}`} className="flex items-center gap-3 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.title} className="size-12 rounded-md border border-slate-200 object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-sm text-slate-700">{item.title}</span>
                      <span className="text-xs text-slate-400">
                        {item.quantity} × {bdt(item.unitPriceBdt)} · {kg(item.weightGrams * item.quantity)}
                      </span>
                    </span>
                    <span className="text-sm font-medium text-slate-800">{bdt(item.unitPriceBdt * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button variant="brand" size="lg" loading={submitting} onClick={placeOrder}>
                  Place order · {bdt(quoting.totalBdt)}
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                By placing this order you agree to our import terms, refund policy and customs cooperation terms.
              </p>
            </Card>
          )}
        </div>

        {/* summary */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Card className="p-5">
            <p className="text-sm font-semibold text-slate-900">Order summary</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label={`Products (${items.length})`} value={bdt(quoting.subtotalBdt)} />
              <Row label="Sourcing fee (incl.)" value={bdt(quoting.serviceFeeBdt)} muted />
              <Row label="Freight" value={bdt(quoting.freightBdt)} />
              <Row label="Customs duty" value={bdt(quoting.dutyBdt)} />
              <Row label={`VAT ${settings.vatPct}%`} value={bdt(quoting.vatBdt)} />
              {discountBdt > 0 && <Row label="Coupon" value={`− ${bdt(discountBdt)}`} />}
              <Row label="Delivery" value={bdt(outsideDhaka ? settings.homeDeliveryOutsideBdt : settings.homeDeliveryDhakaBdt)} muted />
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-dashed border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-700">Total landed</span>
              <span className="text-2xl font-bold tracking-tight text-primary">{bdt(quoting.totalBdt)}</span>
            </div>
            <div className="mt-3 rounded-lg bg-primary/5 p-3 text-xs text-primary-700">
              <p className="font-semibold">Advance now: {bdt(advance)}</p>
              <p className="mt-0.5 text-primary/80">Balance {bdt(quoting.totalBdt - advance)} payable before delivery.</p>
            </div>
            <div className="mt-4 space-y-2 text-[11px] text-slate-500">
              <p className="flex items-center gap-1.5">
                <Phone className="size-3" /> Support {settings.supportPhone}
              </p>
              <p className="flex items-center gap-1.5">
                <Building2 className="size-3" /> {settings.address}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn("text-slate-500", muted && "text-slate-400")}>{label}</dt>
      <dd className={cn("font-medium text-slate-800", muted && "font-normal text-slate-500")}>{value}</dd>
    </div>
  );
}
