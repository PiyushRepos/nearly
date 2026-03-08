import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { howItWorksSteps } from "@/config/landing";

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="homeowners" className="bg-brand-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-xl" ref={ref}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="text-xs font-bold uppercase tracking-widest text-primary mb-3"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="font-display text-[clamp(2rem,4vw,3rem)] font-black leading-tight text-foreground"
          >
            Book it today.{" "}
            <span className="italic text-primary">Actually get it done.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-4 text-base text-foreground/60 leading-relaxed"
          >
            We know how it goes. You search, you call, someone doesn't show up,
            you call again. Nearly is built to make that entire experience
            disappear. You describe what you need, we show you who's available
            nearby, you book — and then you actually see results.
          </motion.p>
        </div>

        {/* Steps + mock UI */}
        <div className="mt-16 grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps */}
          <div className="space-y-8">
            {howItWorksSteps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.55,
                  delay: 0.1 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex gap-5"
              >
                <span className="font-display font-black text-4xl text-primary/20 leading-none w-10 shrink-0 mt-0.5">
                  {step.number}
                </span>
                <div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="pt-2"
            >
              <Button size="lg" className="gap-2">
                Book Your First Service
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          </div>

          {/* Mock booking UI card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-foreground rounded-2xl p-6 shadow-2xl"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                Your bookings
              </span>
              <span className="text-xs font-bold text-primary bg-primary/15 rounded-full px-2.5 py-1">
                1 pending
              </span>
            </div>

            {/* Booking items */}
            {[
              {
                label: "Request confirmed laundry",
                status: "Confirmed",
                dot: "bg-green-400",
              },
              {
                label: "Repair on the way",
                status: "In-progress",
                dot: "bg-yellow-400",
              },
              {
                label: "Job in-progress",
                status: "In-progress",
                dot: "bg-yellow-400",
              },
              {
                label: "Completed & reviewed",
                status: "Completed",
                dot: "bg-green-500",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-white/8 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`size-2 rounded-full shrink-0 ${item.dot}`}
                  />
                  <span className="text-sm font-medium text-white/80">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-semibold text-white/40">
                  {item.status}
                </span>
              </div>
            ))}

            {/* Bottom notification */}
            <div className="mt-5 rounded-xl bg-white/6 border border-white/10 p-3.5 flex items-start gap-3">
              <span className="size-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                RP
              </span>
              <div>
                <p className="text-xs font-semibold text-white/80">
                  New request · 2 BHK cleaning, Powai
                </p>
                <p className="text-xs text-white/40 mt-0.5">Today, 2:45 PM</p>
              </div>
              <button className="ml-auto text-xs font-bold text-primary bg-primary/15 rounded-full px-3 py-1 hover:bg-primary/25 transition-colors">
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
