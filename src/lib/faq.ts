/**
 * FAQ content lives in a plain module (not a "use client" component) so server
 * components — the FAQ page, the home page and the support pages — can read it.
 */
export interface FaqItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "How does ChinaBridge BD actually work?",
    a: "You order from our verified catalogue (or paste a 1688/Taobao/Alibaba link). We collect the advance payment, buy from the supplier in China, receive the goods at our Guangzhou or Yiwu warehouse, run quality checks, consolidate everything, then ship by air or sea to Bangladesh. We clear customs and deliver to your address or you collect from our Dhaka hub.",
  },
  {
    q: "What is the minimum order quantity?",
    a: "There is no platform-wide minimum — many products can be ordered as a single piece. Products with a factory MOQ show it on the product card (for example MOQ 10 for earphone lots and 500 for custom packaging). Wholesale buyers get better per-unit pricing above the listed MOQ.",
  },
  {
    q: "Air or sea — which should I choose?",
    a: "Air express (from ৳2,050/kg, 3-7 days) suits high-value, light or urgent goods like phones, gadgets, cosmetics and seasonal stock. Air standard is cheaper at ৳1,380/kg in 7-12 days. Sea LCL (৳41,000/CBM, 25-35 days) is best for bulky, heavy or large-volume orders, and sea FCL containers lower the CBM rate further.",
  },
  {
    q: "How is customs duty calculated?",
    a: "Bangladesh Customs assesses duty on the CIF value (supplier cost + freight + insurance). We apply the NBR rate for the HS code — for example 25% for mobile accessories and apparel, 15% for electronics, 5% for machinery and solar. Then 15% VAT is applied on assessed value plus duty, and 3% AIT (advance income tax) applies at import. Your invoice shows the actual customs bill of entry amount.",
  },
  {
    q: "When do I have to pay?",
    a: "Orders require a 50% advance to start sourcing. The balance is payable when your goods reach our Dhaka hub and before delivery, or on a credit basis if your account has an approved wholesale limit. We accept bKash, Nagad, Rocket, bank transfer, cards, and wallet balance. Cash on delivery is available for smaller orders with a 2% handling fee.",
  },
  {
    q: "Can I buy from a supplier you do not list?",
    a: "Yes. Use the quote request page and paste the supplier link. Our procurement team verifies the shop (licence, repurchase rate, response time), negotiates the price for your quantity and sends you a landed-cost quote within two working hours.",
  },
  {
    q: "What if the product arrives damaged or wrong?",
    a: "We share QC photos and video before shipping, so issues are usually caught in China and returned to the supplier at no extra freight cost. If damage happens in transit, cargo insurance covers it. Reported issues within 72 hours of delivery are resolved with a replacement, wallet refund or partial adjustment.",
  },
  {
    q: "Do you help with packaging and branding for resellers?",
    a: "Yes — custom printed mailer boxes, poly bags, labels and hangtags are all importable through us at factory MOQs, and we can also arrange printing of your logo on products with participating suppliers.",
  },
];

/** Grouped answer set used by the FAQ page. */
export const FAQ_GROUPS: { title: string; items: FaqItem[] }[] = [
  { title: "Sourcing & ordering", items: FAQ_ITEMS.slice(0, 2) },
  { title: "Freight & logistics", items: FAQ_ITEMS.slice(2, 3) },
  { title: "Duty, VAT & compliance", items: FAQ_ITEMS.slice(3, 4) },
  { title: "Payments & terms", items: FAQ_ITEMS.slice(4, 5) },
  { title: "Custom sourcing & after-sales", items: [...FAQ_ITEMS.slice(5, 6), ...FAQ_ITEMS.slice(6)] },
];
