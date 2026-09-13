import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { getCategoriesWithCounts } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
      <WhatsAppFab />
    </div>
  );
}
