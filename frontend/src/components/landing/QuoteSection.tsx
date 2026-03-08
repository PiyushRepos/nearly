import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export default function QuoteSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(1.5rem,3.5vw,2.4rem)] font-bold leading-[1.3] text-foreground"
        >
          Getting something fixed at home shouldn't feel like a part-time job.
          No cold calls.{" "}
          <span className="italic text-foreground/45">
            No "I'll check and get back to you."
          </span>{" "}
          No showing up three hours late with no explanation.{" "}
          <span className="text-primary font-black">
            Just good people doing good work — and you knowing exactly what's
            happening, every step of the way.
          </span>
        </motion.p>
      </div>
    </section>
  );
}
