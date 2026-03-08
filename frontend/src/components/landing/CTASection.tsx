import { useRef } from "react";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";
import { useSession } from "@/lib/auth-client";

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const proLink =
    role === "provider"
      ? "/provider/dashboard"
      : role === "customer"
        ? "/provider/profile"
        : "/auth/signup";

  return (
    <section className="relative bg-primary overflow-hidden py-[140px] text-center">
      {/* Watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute font-display font-black italic text-white/[0.06] whitespace-nowrap select-none"
        style={{
          fontSize: "20vw",
          bottom: "-3vw",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        nearly
      </span>

      <div className="relative mx-auto max-w-3xl px-6 lg:px-8" ref={ref}>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold leading-[1.1] tracking-[-0.03em] text-white max-w-[620px] mx-auto mb-5"
        >
          That thing on your list?
          <br />
          <em className="font-light text-white/65">It's time.</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-base font-light text-white/65 leading-relaxed max-w-[440px] mx-auto mb-12"
        >
          Whether it's been on your to-do list for a week or honestly a year —
          the right person is nearby, available, and ready. Booking takes two
          minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap"
        >
          <Link
            to="/browse"
            className="text-[0.92rem] font-semibold bg-white text-primary px-10 py-4 rounded-full hover:bg-foreground hover:text-white transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(0,0,0,0.15)] m-1.5"
          >
            Find Help Near Me
          </Link>
          <Link
            to={proLink}
            className="text-[0.92rem] font-medium text-white px-9 py-4 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all m-1.5"
          >
            {role === "provider" ? "Go to Dashboard" : "I'm a Professional"}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
