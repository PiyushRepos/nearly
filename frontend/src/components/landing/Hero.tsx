import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "motion/react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

const proofItems = [
  { icon: "⭐", label: "4.9 average rating" },
  { icon: "🕐", label: "Confirmed within the hour" },
  { icon: "🛡️", label: "Every pro is verified" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#fdfaf6] flex flex-col items-center justify-center overflow-hidden pt-28 pb-24 px-10 text-center">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute -top-24 -left-24 w-150 h-150 rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, #f2d4c8, transparent)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-125 h-125 rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, #d4e8e0, transparent)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Nudge pill */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="relative mb-8 inline-flex items-center gap-2 rounded-full bg-[#dceee8] text-[#2e5d4b] px-4 py-1.5 text-[0.78rem] font-semibold tracking-wide"
      >
        <span className="size-1.5 shrink-0 rounded-full bg-[#2e5d4b] animate-pulse" />
        850+ trusted professionals across your city
      </motion.div>

      {/* Headline */}
      <motion.h1
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.1}
        className="relative font-display font-black text-[clamp(3rem,6.5vw,6.2rem)] leading-none tracking-[-0.03em] text-foreground max-w-205 mb-7"
      >
        The help you need
        <br />
        is <em className="font-light text-primary">already nearby.</em>
      </motion.h1>

      {/* Sub */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.2}
        className="relative text-[1.1rem] font-light text-muted-foreground leading-[1.75] max-w-125 mx-auto mb-11"
      >
        Nearly connects you with skilled local professionals — for cleaning,
        repairs, and everything in between. Book in minutes. Track every step.
        Pay when it's done right.
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.3}
        className="relative flex gap-3.5 justify-center flex-wrap"
      >
        <Link
          to="/browse"
          className="text-[0.92rem] font-semibold bg-primary text-white px-9 py-3.75 rounded-full hover:bg-foreground transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(200,96,58,0.25)]"
        >
          Find a Professional
        </Link>
        <a
          href="#professionals"
          className="text-[0.92rem] font-medium text-foreground px-7 py-3.75 rounded-full border border-border hover:border-foreground hover:bg-[#f7f3ee] transition-all flex items-center gap-2"
        >
          Grow your bookings <ArrowRight className="size-4" />
        </a>
      </motion.div>

      {/* Proof items */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.4}
        className="relative mt-18 flex flex-wrap items-center justify-center gap-8"
      >
        {proofItems.map((item, i) => (
          <>
            {i > 0 && (
              <span
                key={`div-${i}`}
                className="w-px h-5 bg-border hidden sm:block"
              />
            )}
            <div
              key={item.label}
              className="flex items-center gap-2.5 text-[0.82rem] text-muted-foreground font-normal"
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </div>
          </>
        ))}
      </motion.div>
    </section>
  );
}
