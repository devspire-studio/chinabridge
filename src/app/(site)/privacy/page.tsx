import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="13 September 2026"
      intro="We collect the minimum information needed to source, ship and clear your goods, and to keep you updated on each milestone. This page explains what we hold, why, and how you can control it."
      sections={[
        {
          title: "Information we collect",
          body: [
            "Account data: name, mobile number, email, password hash (stored by our authentication provider using industry-standard scrypt hashing).",
            "Order data: delivery addresses, order contents, payment records and transaction references, courier and consignment tracking numbers.",
            "Supplier data you provide: 1688 / Taobao / Alibaba links, product specifications, target prices and any images you share for sourcing.",
            "Support data: ticket contents, WhatsApp and phone conversation summaries, and documents you send us.",
            "Technical data: IP address, device and browser information, and pages you visit on our platform.",
          ],
        },
        {
          title: "Why we use it",
          body: [
            "To buy goods from suppliers on your instructions, pay them in CNY and share your shipping details only where required for delivery or customs clearance.",
            "To prepare customs documentation. Bangladesh customs authorities and our licensed clearing agent receive the minimum data required by law.",
            "To process payments, issue refunds, prevent fraud and recover overdue balances.",
            "To provide support and send service updates by SMS, phone, email or WhatsApp about the specific orders you placed.",
          ],
        },
        {
          title: "Marketing communication",
          body: [
            "We send promotional messages only if you subscribe to our newsletter or opt in. Every message includes an unsubscribe route, and unsubscribing never affects order-related updates.",
          ],
        },
        {
          title: "Who we share it with",
          body: [
            "Chinese suppliers and warehouses (name and delivery-adjacent details needed to purchase and receive goods), freight carriers and airlines (consignee details required for air waybills or bills of lading), our Bangladesh clearing agent and customs authorities, and our payment and courier partners.",
            "We never sell your personal data. We do not share your phone number with third-party marketing lists.",
          ],
        },
        {
          title: "How long we keep data",
          body: [
            "Order, customs and payment records are retained for at least six years to comply with tax, customs and audit requirements. Account credentials are deleted when you close your account, apart from records we are legally required to keep.",
          ],
        },
        {
          title: "Security",
          body: [
            "Passwords are hashed, administrative access is role-based and separately authenticated, and all staff access to customer records is logged. Card payments are processed by our payment partners; we do not store full card numbers.",
          ],
        },
        {
          title: "Your rights",
          body: [
            "You may request a copy of your personal data, ask us to correct errors, withdraw marketing consent, or ask us to delete data we are not legally required to retain.",
            "Requests can be made from your account dashboard or by email to support@chinabridge.com.bd. We respond within 30 days.",
          ],
        },
        {
          title: "Cookies",
          body: [
            "We use functional cookies and local storage to keep your cart, wishlist, language preference and session active. We do not use third-party advertising cookies.",
          ],
        },
      ]}
    />
  );
}
