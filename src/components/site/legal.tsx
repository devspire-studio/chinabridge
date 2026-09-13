import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/ui/data";

export interface LegalSection {
  title: string;
  body: (string | ReactNode)[];
}

export function LegalPage({
  title,
  updated,
  intro,
  sections,
  children,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  children?: ReactNode;
}) {
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-2 text-xs text-slate-400">Last updated {updated}</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">{intro}</p>

          <div className="mt-8 space-y-8">
            {sections.map((section, i) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                  {i + 1}. {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((block, k) =>
                    typeof block === "string" ? (
                      <p key={k} className="text-sm leading-relaxed text-slate-600">
                        {block}
                      </p>
                    ) : (
                      <div key={k}>{block}</div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
          {children}
        </article>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-semibold text-slate-900">On this page</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              {sections.map((section, i) => (
                <li key={section.title}>
                  {i + 1}. {section.title}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
