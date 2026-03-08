import { Link } from "react-router";
import { footerColumns } from "@/config/landing";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-14 pt-15 pb-9">
        {/* Top row */}
        <div className="flex flex-wrap justify-between items-start gap-10 pb-10 border-b border-white/8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="font-display font-bold text-[1.4rem] text-white block mb-2.5"
            >
              Nearly<span className="text-primary">.</span>
            </Link>
            <p className="text-[0.82rem] font-light text-white/45 leading-relaxed max-w-50">
              Local services, handled warmly — from the first request to the
              final review.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex flex-wrap gap-10">
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h5 className="text-[0.72rem] font-bold uppercase tracking-widest text-white/60 mb-4">
                  {col.heading}
                </h5>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link
                          to={link.href}
                          className="text-[0.85rem] font-light text-white/35 hover:text-white/80 transition-colors block"
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          className="text-[0.85rem] font-light text-white/35 hover:text-white/80 transition-colors block"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-7">
          <span className="text-[0.75rem] text-white/25">
            © 2025 Nearly. Made with care for the people who fix things.
          </span>
          <div className="flex gap-5">
            <a
              href="#"
              className="text-[0.75rem] text-white/25 hover:text-white/60 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[0.75rem] text-white/25 hover:text-white/60 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
