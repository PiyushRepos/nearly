import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { whyItems } from "@/config/landing";

export default function WhyNearly() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="why" className="bg-[#f7f3ee] py-[100px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <div className="text-center max-w-[600px] mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary bg-primary/10 px-3.5 py-1 rounded-full mb-5"
          >
            Why Nearly
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.06 }}
            className="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-[-0.03em] text-foreground max-w-[600px] mx-auto mb-4"
          >
            We built this for people,
            <br />
            <em className="font-light text-primary">not for metrics.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-base font-light text-muted-foreground leading-relaxed"
          >
            A lot of platforms make big promises. We'd rather just earn your
            trust — one job at a time.
          </motion.p>
        </div>

        {/* Trust grid */}
        <div
          className="grid md:grid-cols-3 max-w-[900px] mx-auto"
          style={{ gap: "1px", background: "var(--color-border)" }}
        >
          {whyItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-[#f7f3ee] hover:bg-white transition-colors px-9 py-11"
            >
              <span className="text-[1.8rem] leading-none mb-4.5 block">
                {item.icon}
              </span>
              <h3 className="font-display font-bold text-[1.1rem] text-foreground mb-2.5">
                {item.title}
              </h3>
              <p className="text-[0.88rem] font-light text-muted-foreground leading-[1.7]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
