import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Refund & return policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & return policy"
      updated="13 September 2026"
      intro="Cross-border imports are different from local purchases: goods are bought to your specification, freight is consumed, and duty is paid to the government. This policy sets out exactly what is refundable, and when."
      sections={[
        {
          title: "Cancellation before we purchase",
          body: [
            "You can cancel free of charge while the order is in 'Pending payment' or 'Order confirmed' and before we place the purchase with the supplier. Your full advance is refunded to your wallet immediately, or to your original payment method within 3 working days.",
          ],
        },
        {
          title: "Cancellation after purchase",
          body: [
            "Once goods are bought from the supplier, cancellation depends on whether the supplier accepts returns within the return window. Where they do, we refund the goods value less actual freight, return freight, duty already paid and a 5% handling charge. Where they do not, the order cannot be cancelled.",
          ],
        },
        {
          title: "Wrong, damaged or short goods",
          body: [
            "Report issues within 72 hours of delivery with photos or video. For items we picked wrongly, arrived damaged in transit, or quantity shortages we shipped, we arrange a replacement, a wallet credit, or a partial refund.",
            "Where the supplier sent a different variant, we first try to return it in China at our cost and re-buy the correct item, which avoids international freight loss.",
          ],
        },
        {
          title: "Cargo insurance claims",
          body: [
            "If you purchased cargo insurance, in-transit loss or damage is claimed under that policy. We prepare the claim file (airway bill or bill of lading, photographs, packing list, invoice) and follow it through with the insurer.",
          ],
        },
        {
          title: "Customs duty, VAT and AIT",
          body: [
            "Duty, VAT and AIT paid to Bangladesh Customs are non-refundable once the goods are cleared. If duty was assessed lower than our estimate, the difference is credited to your wallet automatically.",
            "If we over-collected duty because of an error on our side, we refund the difference in full.",
          ],
        },
        {
          title: "Freight and storage charges",
          body: [
            "Freight already flown or shipped is non-refundable. Consolidation and storage charges are refundable only where the delay or cancellation was caused by us.",
          ],
        },
        {
          title: "Refund method and timeline",
          body: [
            "Refunds are issued to your ChinaBridge wallet by default (instant, and usable for your next order), or to bKash / Nagad / bank account on request within 3–7 working days depending on the channel.",
            "Cash on delivery orders are refunded by mobile financial service transfer only.",
          ],
        },
        {
          title: "Not covered",
          body: [
            "Change of mind after goods are purchased, buyer-specified wrong size or colour, normal wear, goods damaged by misuse, seized prohibited items, and delays caused by force majeure or customs examination.",
          ],
        },
      ]}
    />
  );
}
