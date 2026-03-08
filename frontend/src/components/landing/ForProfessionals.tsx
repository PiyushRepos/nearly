import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { proBenefits } from "@/config/landing";

export default function ForProfessionals() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="professionals"
      className="bg-brand-green py-24 md:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Mock pro dashboard card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/8 border border-white/12 rounded-2xl p-6 order-2 lg:order-1"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Dashboard
                </p>
                <h4 className="font-display font-bold text-white text-lg mt-0.5">
                  Rahul P.
                </h4>
              </div>
              <span className="text-xs font-bold bg-green-500/20 text-green-400 rounded-full px-3 py-1">
                Available
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "New bookings", value: "11" },
                { label: "Avg rating", value: "4.9 ⭐" },
                { label: "Completion", value: "98%" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 rounded-xl p-3">
                  <p className="font-display font-black text-xl text-white">
                    {s.value}
                  </p>
                  <p className="text-[10px] font-semibold text-white/40 mt-1 leading-tight">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Earnings */}
            <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/60">
                This week's earnings
              </span>
              <span className="font-display font-black text-xl text-primary">
                ₹14,500
              </span>
            </div>

            {/* Incoming job */}
            <div className="rounded-xl bg-primary/15 border border-primary/25 p-3.5 flex items-start gap-3">
              <span className="size-8 rounded-full bg-primary/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                N
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80">
                  New request · 3BHK cleaning, Powai
                </p>
                <p className="text-xs text-white/40 mt-0.5">
                  Today, 3:30 PM · ₹1,200
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button className="text-[11px] font-bold text-primary bg-primary/20 rounded-full px-2.5 py-1 hover:bg-primary/30 transition-colors">
                  Accept
                </button>
                <button className="text-[11px] font-bold text-white/40 hover:text-white/70 transition-colors px-1">
                  Skip
                </button>
              </div>
            </div>
          </motion.div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-3"
            >
              For Professionals
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="font-display text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-white"
            >
              Your skills deserve{" "}
              <span className="italic text-primary">a full calendar.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-4 text-base text-white/60 leading-relaxed"
            >
              You're good at what you do. You shouldn't have to spend half your
              week chasing leads, following up on WhatsApp messages, or waiting
              to hear back. Nearly takes care of finding the customers — so you
              can focus on the work.
            </motion.p>

            <div className="mt-8 space-y-4">
              {proBenefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: 24 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    duration: 0.5,
                    delay: 0.18 + i * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex items-start gap-3.5"
                >
                  <span className="text-xl leading-none mt-0.5">
                    {benefit.emoji}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {benefit.title}
                    </p>
                    <p className="text-sm text-white/50 mt-0.5">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="mt-10"
            >
              <Button
                variant="green"
                size="lg"
                className="gap-2 bg-white text-brand-green hover:bg-white/90"
              >
                Start Taking Bookings
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
