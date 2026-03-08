import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

export default function QuoteSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-[#f7f3ee] border-y border-border py-24 md:py-28">
      <div className="mx-auto max-w-[760px] px-6 lg:px-8 text-center" ref={ref}>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(1.6rem,3vw,2.8rem)] font-light italic leading-normal text-foreground"
        >
          Getting something fixed at home shouldn't feel like a part-time job.
          No cold calls. No &ldquo;I'll check and get back to you.&rdquo; No
          showing up three hours late with no explanation.{" "}
          <strong className="not-italic font-bold text-primary">
            Just good people doing good work — and you knowing exactly what's
            happening, every step of the way.
          </strong>
        </motion.p>
      </div>
    </section>
  );
}
