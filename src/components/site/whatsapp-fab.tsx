"use client";

import { MessageCircle, Phone, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { useSettings } from "@/components/providers";

export function WhatsAppFab() {
  const settings = useSettings();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="fixed bottom-5 right-4 z-30 flex flex-col items-end gap-2 print:hidden">
      {open && (
        <div className="w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-elevated">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-slate-900">Talk to a sourcing agent</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400 hover:text-slate-600">
              <X className="size-3.5" />
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Share a 1688 / Taobao link and get unit price, freight and duty for your quantity.
          </p>
          <div className="mt-3 space-y-2">
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
            >
              <MessageCircle className="size-3.5" /> WhatsApp (China desk)
            </a>
            <a
              href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Phone className="size-3.5" /> {settings.supportPhone}
            </a>
            <Link
              href="/quote"
              className="flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Request a formal quote
            </Link>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Contact options"
        className="flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-elevated transition-transform hover:scale-105"
      >
        <MessageCircle className="size-5" />
      </button>
    </div>
  );
}
