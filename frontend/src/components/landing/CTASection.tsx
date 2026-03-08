import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative bg-brand-green overflow-hidden py-28 md:py-36">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div
        className="relative mx-auto max-w-3xl px-6 lg:px-8 text-center"
        ref={ref}
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-xs font-bold uppercase tracking-widest text-primary mb-4"
        >
          So, what's stopping you?
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.06 }}
          className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight text-white"
        >
          That thing on your list?
          <br />
          <span className="italic text-primary">It's time.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-base text-white/55 leading-relaxed max-w-lg mx-auto"
        >
          Whether you're one job away from a fixed drain or a fresh coat of
          paint — we've got someone for that. Book in under 2 minutes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button
            size="xl"
            className="bg-white text-brand-green hover:bg-white/92 font-bold gap-2 w-full sm:w-auto"
          >
            Find Help Near Me
            <ArrowRight size={16} />
          </Button>
          <Button
            variant="outline-cream"
            size="xl"
            className="w-full sm:w-auto"
          >
            I'm a Professional
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
