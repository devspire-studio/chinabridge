import type { Metadata } from "next";

import { LegalPage } from "@/components/site/legal";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="13 September 2026"
      intro="These terms govern your use of the ChinaBridge BD platform and the sourcing, freight and customs services we provide. By placing an order you accept them together with our refund policy."
      sections={[
        {
          title: "Who we are and what we do",
          body: [
            "ChinaBridge BD is a trade-licensed import and sourcing agent (Trade licence TRAD/DNCC/0784512/2021) operating from Dhaka with consolidation facilities in Guangzhou and Yiwu, China.",
            "We act as your buying and logistics agent: we purchase goods from third-party Chinese suppliers on your instructions, arrange consolidation, freight and Bangladesh customs clearance, and deliver to your address. We are not the manufacturer of the goods and we do not provide any manufacturer warranty unless expressly stated.",
          ],
        },
        {
          title: "Accounts and eligibility",
          body: [
            "You must provide accurate contact details and a delivery address in Bangladesh. You are responsible for keeping your account credentials secure and for all activity under your account.",
            "Business accounts that claim wholesale pricing or credit facilities may be asked to provide a valid BIN/VAT registration and trade documents.",
          ],
        },
        {
          title: "Orders, pricing and landed cost",
          body: [
            "Product prices shown on the platform include our sourcing service fee for the relevant category. Freight, customs duty, VAT, AIT, insurance and delivery are itemised separately in the landed-cost breakdown shown before checkout.",
            "Duty, VAT and AIT estimates are indicative. The binding amount is the assessed value on the Bangladesh customs bill of entry. Where the assessed duty is lower than our estimate, the difference is credited to your wallet; where it is higher, we will show you the customs document before requesting the additional amount.",
            "Foreign exchange conversions use our published weekly CNY/BDT rate. Rate movements after an invoice is issued do not change that invoice.",
          ],
        },
        {
          title: "Payment terms",
          body: [
            "Orders require an advance payment (currently 50% of the landed cost) before sourcing begins. The balance is payable before delivery or hub handover.",
            "Wholesale customers may be granted credit terms at our discretion; overdue balances attract a service charge and may suspend further sourcing.",
            "Cash on delivery is available only for orders below ৳20,000 and carries a 2% handling fee.",
          ],
        },
        {
          title: "Goods, inspection and risk",
          body: [
            "We inspect quantity, visible condition and basic functionality at our China warehouse and share a QC report. We do not test goods beyond the manufacturer's basic functions and we do not provide certification unless requested in writing.",
            "Risk in the goods passes to you on delivery or hub handover. Cargo insurance is optional and covers in-transit loss or damage up to the insured value; it does not cover supplier quality defects, customs seizure of prohibited goods, or delays caused by force majeure.",
          ],
        },
        {
          title: "Prohibited and restricted goods",
          body: [
            "You must not instruct us to import counterfeit branded goods, unlicensed pharmaceuticals, narcotics, weapons, live animals, items that infringe intellectual property, or any product restricted by Bangladesh law or by the laws of China.",
            "We may refuse or cancel any order we reasonably believe breaches these restrictions. In such cases we refund amounts received for the cancelled item, less any costs already incurred with the supplier or carrier.",
          ],
        },
        {
          title: "Delays and force majeure",
          body: [
            "Transit times published on the platform are typical, not guaranteed. Flight space, vessel schedules, port congestion, customs examination and public holidays can extend them.",
            "Neither party is liable for failure to perform caused by events beyond reasonable control, including natural disasters, strikes, government action, or national holidays in Bangladesh or China.",
          ],
        },
        {
          title: "Liability",
          body: [
            "Our liability for any single order is limited to the total service and freight charges we collected for that order. We are not liable for lost profit, lost business opportunity or indirect losses.",
            "Where goods are lost or damaged in transit and cargo insurance was purchased, recovery is limited to the insured amount.",
          ],
        },
        {
          title: "Suspension and termination",
          body: [
            "We may suspend or close an account for fraudulent activity, repeated non-payment, abusive behaviour toward staff, or attempted import of prohibited goods.",
            "You may close your account at any time. Outstanding orders, payments and refunds will be settled before closure is completed.",
          ],
        },
        {
          title: "Governing law",
          body: [
            "These terms are governed by the laws of the People's Republic of Bangladesh and disputes are subject to the exclusive jurisdiction of the courts of Dhaka.",
          ],
        },
      ]}
    />
  );
}
