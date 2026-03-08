import { useEffect, useState } from "react";
import { motion, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/config/landing";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 24));
    return unsub;
  }, [scrollY]);

  return (
    <motion.header
      className={[
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#fdfaf6]/92 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-[#fdfaf6]/92 backdrop-blur-md border-b border-border",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-14">
        <div className="flex h-18 items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="font-display font-bold text-2xl tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Nearly<span className="text-primary">.</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-9">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.88rem] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTA pill */}
          <div className="hidden md:flex items-center">
            <a
              href="#"
              className="text-[0.82rem] font-semibold bg-primary text-white px-6 py-2.5 rounded-full hover:bg-foreground transition-colors"
            >
              Find Help Nearby
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-muted transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="md:hidden bg-brand-cream border-b border-border px-6 pb-6 pt-2 space-y-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-semibold text-foreground/80 hover:text-foreground py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2">
            <a
              href="#"
              className="block text-center text-sm font-semibold bg-primary text-white px-6 py-2.5 rounded-full hover:bg-foreground transition-colors w-full"
            >
              Find Help Nearby
            </a>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
