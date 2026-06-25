import { useEffect } from "react";
import { Link } from "react-router";
import type { LegalDocument as LegalDocumentData } from "@/config/legal";

interface LegalDocumentProps {
  document: LegalDocumentData;
}

/**
 * Presentational layout shared by the Terms of Service and Privacy Policy
 * pages. Renders a header, a quick-jump table of contents, and the document
 * body from plain data defined in `@/config/legal`.
 */
export default function LegalDocument({ document }: LegalDocumentProps) {
  // Long-form legal copy should start at the top, not wherever the user
  // happened to be scrolled before navigating here.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [document.title]);

  return (
    <div className="bg-brand-cream">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 pt-28 pb-20 sm:pt-32">
        {/* Header */}
        <header className="border-b border-border pb-8">
          <p className="text-[0.72rem] font-bold uppercase tracking-widest text-primary mb-3">
            Legal
          </p>
          <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-foreground">
            {document.title}
          </h1>
          <p className="mt-4 text-base font-light leading-relaxed text-muted-foreground">
            {document.intro}
          </p>
          <p className="mt-4 text-[0.8rem] text-muted-foreground/70">
            Last updated: {document.lastUpdated}
          </p>
        </header>

        {/* Table of contents */}
        <nav aria-label="Table of contents" className="py-8">
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-[0.85rem] font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Body */}
        <div className="space-y-10">
          {document.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="font-display font-bold text-xl text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-3 text-[0.95rem] font-light leading-relaxed text-foreground/80"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-4 space-y-2.5">
                  {section.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-[0.95rem] font-light leading-relaxed text-foreground/80"
                    >
                      <span
                        aria-hidden
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-14 border-t border-border pt-8">
          <p className="text-[0.85rem] font-light text-muted-foreground">
            See also our{" "}
            <Link
              to={document.title === "Privacy Policy" ? "/terms" : "/privacy"}
              className="font-medium text-primary hover:underline"
            >
              {document.title === "Privacy Policy"
                ? "Terms of Service"
                : "Privacy Policy"}
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
