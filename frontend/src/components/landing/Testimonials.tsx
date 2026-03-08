import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { testimonials } from "@/config/landing";

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" className="bg-[#fdfaf6] py-30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Intro - left-aligned */}
        <div className="max-w-130 mb-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary bg-primary/10 px-3.5 py-1 rounded-full mb-4"
          >
            Real Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-[-0.03em] text-foreground mb-4"
          >
            Honestly?
            <br />
            <em className="font-light text-primary">People really like us.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-base font-light text-muted-foreground leading-relaxed max-w-100"
          >
            We'll let our customers and professionals do the talking. Every word
            below is from a verified, real booking.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-[#f7f3ee] rounded-2xl px-7 py-8 border border-border hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className="text-[#c49a3c] text-[0.85rem] tracking-[2px] mb-4">
                {"★".repeat(t.rating)}
              </div>
              <p className="font-display font-light italic text-[1rem] text-foreground leading-[1.7] mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`size-9 rounded-full flex items-center justify-center text-[0.8rem] font-bold shrink-0 ${t.color}`}
                >
                  {t.initials}
                </span>
                <div>
                  <p className="text-[0.85rem] font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
