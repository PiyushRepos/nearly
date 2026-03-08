import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, useScroll } from "motion/react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { navLinks } from "@/config/landing";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const { data: session } = useSession();
  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;
  const dashboardPath =
    role === "provider"
      ? "/provider/dashboard"
      : role === "admin"
        ? "/admin"
        : "/customer/dashboard";

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
          <Link
            to="/"
            className="font-display font-bold text-2xl tracking-tight text-foreground"
            style={{ letterSpacing: "-0.02em" }}
          >
            Nearly<span className="text-primary">.</span>
          </Link>

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
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-1.5 text-[0.82rem] font-semibold bg-primary text-white px-5 py-2.5 rounded-full hover:bg-foreground transition-colors"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-[0.82rem] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-[0.82rem] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Log in
                </Link>
                <Link
                  to="/browse"
                  className="text-[0.82rem] font-semibold bg-primary text-white px-6 py-2.5 rounded-full hover:bg-foreground transition-colors"
                >
                  Find Help Nearby
                </Link>
              </>
            )}
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
          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 text-sm font-semibold bg-primary text-white px-6 py-2.5 rounded-full hover:bg-foreground transition-colors w-full"
                >
                  <LayoutDashboard size={14} />
                  My Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="text-center text-sm font-semibold text-foreground/80 hover:text-foreground border border-border px-6 py-2.5 rounded-full transition-colors w-full flex items-center justify-center gap-2"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm font-semibold text-foreground/80 hover:text-foreground border border-border px-6 py-2.5 rounded-full transition-colors w-full"
                >
                  Log in
                </Link>
                <Link
                  to="/browse"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center text-sm font-semibold bg-primary text-white px-6 py-2.5 rounded-full hover:bg-foreground transition-colors w-full"
                >
                  Find Help Nearby
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
