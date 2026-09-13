import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import { CartProvider, LocaleProvider, SettingsProvider } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/overlays";
import { getSettings } from "@/server/settings";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ChinaBridge BD — One-stop global sourcing, import & customs clearance",
    template: "%s · ChinaBridge BD",
  },
  description:
    "Import anything from 1688, Taobao and Alibaba to Bangladesh. Browse verified products with full landed cost — sourcing fee, air/sea freight, customs duty, VAT and door delivery.",
  keywords: [
    "import from China to Bangladesh",
    "1688 sourcing agent Bangladesh",
    "Taobao agent Dhaka",
    "China cargo Bangladesh",
    "customs clearance Dhaka",
    "wholesale import BD",
  ],
  openGraph: {
    title: "ChinaBridge BD — One-stop global sourcing in Bangladesh",
    description:
      "Browse verified 1688 & Taobao products with landed cost shown upfront. Air express from ৳2,050/kg, sea cargo from ৳41,000/CBM.",
    type: "website",
    locale: "en_BD",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40f5",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <SettingsProvider settings={settings}>
          <LocaleProvider>
            <CartProvider>
              <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
              <Toaster position="top-center" richColors closeButton toastOptions={{ className: "font-sans" }} />
            </CartProvider>
          </LocaleProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
