import { footerColumns } from "@/config/landing";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <a
              href="/"
              className="font-display font-black text-xl tracking-tight"
            >
              Nearly.
            </a>
            <p className="mt-3 text-xs text-background/45 leading-relaxed max-w-45">
              Local services, booked in minutes. Done right, every time.
            </p>
            <div className="mt-5 flex gap-3">
              {["𝕏", "in", "ig"].map((s) => (
                <a
                  key={s}
                  href="#"
                  className="text-xs font-bold text-background/35 hover:text-background transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-background/35 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-background/60 hover:text-background transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/30">
            © 2026 Nearly. All rights reserved.
          </p>
          <p className="text-xs text-background/25">
            Made with care for people who just want things done.
          </p>
        </div>
      </div>
    </footer>
  );
}
