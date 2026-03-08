import { useRef } from "react";
import { motion, useInView } from "motion/react";

const copyPoints = [
  {
    icon: "🟢",
    text: "You're in charge of your schedule. Go available when you're ready. Go offline when you're not. Simple as that.",
  },
  {
    icon: "✅",
    text: "Review every job before you accept it. Location, scope, timing — you decide what works for you.",
  },
  {
    icon: "📷",
    text: "Upload before and after photos. Build a profile that speaks for itself and earns you more bookings over time.",
  },
  {
    icon: "💳",
    text: "Get paid reliably, every time. No chasing invoices. No awkward conversations at the door.",
  },
];

const incomeRows = [
  { label: "Jobs completed", value: "11", green: false },
  { label: "New bookings", value: "4 pending", green: false },
  { label: "Average rating", value: "4.9 ⭐", green: false },
  { label: "Repeat customers", value: "68%", green: true },
  { label: "This week's earnings", value: "₹14,300", green: true },
];

export default function ForProfessionals() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="professionals"
      className="bg-foreground py-30 overflow-hidden relative"
    >
      {/* Decorative radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -right-48 w-175 h-175 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(46,93,75,0.25), transparent)",
        }}
      />

      <div className="mx-auto max-w-275 px-6 lg:px-14" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Income card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-9">
              <p className="font-display font-light italic text-[0.8rem] text-white/30 mb-5">
                This week · Sunita Lal · Home Cleaning
              </p>
              {incomeRows.map((row, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center py-3.5 border-b border-white/[0.07] last:border-0"
                >
                  <span className="text-[0.88rem] font-light text-white/50">
                    {row.label}
                  </span>
                  <span
                    className={[
                      "font-display font-bold text-[1rem]",
                      row.green ? "text-[#8ecfb5]" : "text-white",
                    ].join(" ")}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* New request card */}
            <div className="mt-4 bg-white rounded-[14px] px-5 py-4.5 flex items-center gap-3.5 border border-border">
              <div className="size-11 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-white text-[0.9rem] shrink-0">
                MK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-semibold text-foreground">
                  New request: 2 BHK cleaning, Powai
                </p>
                <p className="text-[0.75rem] text-muted-foreground mt-0.5">
                  Today · 11 AM · ₹1,100
                </p>
              </div>
              <span className="text-[0.7rem] font-bold bg-[#dceee8] text-[#2e5d4b] px-2.5 py-1 rounded-full shrink-0">
                Accept?
              </span>
            </div>
          </motion.div>

          {/* Right: copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-[#8ecfb5] bg-[#8ecfb5]/12 px-3.5 py-1 rounded-full mb-5"
            >
              For Professionals
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="font-display text-[clamp(2rem,3.2vw,3rem)] font-bold leading-[1.15] tracking-[-0.03em] text-white mb-5"
            >
              Your skills deserve
              <br />
              <em className="font-light text-[#8ecfb5]">a full calendar.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-[1rem] font-light text-white/50 leading-[1.8] mb-9"
            >
              You're good at what you do. You shouldn't have to spend half your
              week chasing leads, following up on WhatsApp messages, or waiting
              to hear back. Nearly takes care of finding the customers — so you
              can focus on the work.
            </motion.p>

            <div className="flex flex-col gap-4 mb-10">
              {copyPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
                  className="flex items-start gap-3.5 text-[0.92rem] text-white/85 leading-[1.55]"
                >
                  <span className="size-7.5 shrink-0 rounded-full bg-[#8ecfb5]/12 text-[#8ecfb5] flex items-center justify-center text-[0.8rem] mt-0.5">
                    {point.icon}
                  </span>
                  <span>{point.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="#"
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-block text-[0.92rem] font-semibold bg-secondary text-white px-9 py-3.75 rounded-full hover:bg-[#3a7a62] transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(46,93,75,0.4)]"
            >
              Start Taking Bookings
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
