import { motion, type Variants } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trustStats } from "@/config/landing";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-brand-cream flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background texture spot */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-225 h-225 rounded-full bg-brand-orange/5 blur-3xl" />
      </div>

      {/* Pill badge */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-semibold text-foreground/60 shadow-sm"
      >
        <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
        900+ trusted professionals active in your city
      </motion.div>

      {/* Headline */}
      <div className="text-center max-w-3xl px-6">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.08}
          className="font-display text-[clamp(2.6rem,6vw,5rem)] font-black leading-[1.05] tracking-tight text-foreground"
        >
          The help you need
          <br />
          <span className="italic text-primary">is already nearby.</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.18}
          className="mt-6 text-base md:text-lg text-foreground/60 leading-relaxed max-w-xl mx-auto font-sans"
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
          custom={0.28}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            Find a Professional
            <ArrowRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto"
          >
            Grow your bookings
            <ChevronDown size={16} />
          </Button>
        </motion.div>
      </div>

      {/* Trust stats */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.38}
        className="mt-14 flex flex-wrap items-center justify-center gap-8 px-6"
      >
        {trustStats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2.5">
            <span className="font-display font-black text-xl text-foreground">
              {stat.value}
            </span>
            <span className="text-xs font-semibold text-foreground/50 leading-tight max-w-20">
              {stat.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
