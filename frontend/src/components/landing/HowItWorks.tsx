import { useRef } from "react";
import { motion, useInView } from "motion/react";

const copyPoints = [
  {
    icon: "📍",
    text: "Search services by your area. See real professionals near you, not a list of people three cities away.",
  },
  {
    icon: "💬",
    text: "Add notes, upload a photo of the issue, pick a time that works for you. The professional arrives prepared.",
  },
  {
    icon: "💰",
    text: "The price is right there before you confirm. What you see is what you pay. No awkward conversations later.",
  },
  {
    icon: "🔄",
    text: "Plans changed? Reschedule or cancel without the drama. We get it — life doesn't always cooperate.",
  },
];

const timelineSteps = [
  { label: "Request sent", time: "9:02 AM", state: "done" },
  { label: "Ravi confirmed your booking", time: "9:18 AM", state: "done" },
  { label: "Ravi is on his way ✦", time: "Now", state: "now" },
  { label: "Job in progress", time: "—", state: "pending" },
  { label: "Completed & reviewed", time: "—", state: "pending" },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="customers" className="bg-[#fdfaf6] py-[120px]">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-14" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: copy */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="inline-block text-[0.72rem] font-bold uppercase tracking-[0.12em] text-primary bg-primary/10 px-3.5 py-1 rounded-full mb-5"
            >
              For Homeowners
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.06 }}
              className="font-display text-[clamp(2rem,3.2vw,3rem)] font-bold leading-[1.15] tracking-[-0.03em] text-foreground mb-5"
            >
              Book it today.
              <br />
              <em className="font-light text-primary">Actually get it done.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="text-[1rem] font-light text-muted-foreground leading-[1.8] mb-9"
            >
              We know how it goes. You search, you call, someone doesn't show
              up, you call again. Nearly is built to make that whole experience
              disappear. You describe what you need, we show you who's available
              nearby, you book — and then you can actually go about your day.
            </motion.p>

            <div className="flex flex-col gap-4 mb-10">
              {copyPoints.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.07 }}
                  className="flex items-start gap-3.5 text-[0.92rem] text-foreground leading-[1.55]"
                >
                  <span className="size-[30px] shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[0.8rem] mt-0.5">
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
              className="inline-block text-[0.92rem] font-semibold bg-primary text-white px-9 py-[15px] rounded-full hover:bg-foreground transition-all hover:-translate-y-0.5 shadow-[0_4px_20px_rgba(200,96,58,0.25)]"
            >
              Book Your First Service
            </motion.a>
          </div>

          {/* Right: timeline card */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-foreground rounded-2xl p-9 shadow-2xl"
          >
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-white/30 mb-5">
              Your Booking · Live
            </p>

            <div className="flex flex-col">
              {timelineSteps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3.5 py-3 border-b border-white/[0.08] last:border-0"
                >
                  <span
                    className={[
                      "size-2.5 rounded-full shrink-0",
                      step.state === "done"
                        ? "bg-[#5cb88a]"
                        : step.state === "now"
                        ? "bg-[#c49a3c] animate-pulse"
                        : "bg-white/20",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "text-[0.83rem] font-medium flex-1",
                      step.state === "done"
                        ? "text-white/90"
                        : step.state === "now"
                        ? "text-[#c49a3c] font-semibold"
                        : "text-white/55",
                    ].join(" ")}
                  >
                    {step.label}
                  </span>
                  <span className="text-[0.72rem] text-white/35 ml-auto">
                    {step.time}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.07]">
              <div className="bg-white/[0.07] rounded-[14px] px-4 py-3.5 max-w-[90%]">
                <p className="text-[0.82rem] text-white/70 leading-[1.5]">
                  "I've uploaded before photos and should arrive by 11 AM. See
                  you soon!"
                </p>
                <p className="text-[0.72rem] text-white/40 mt-1">
                  Ravi · Electrician
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
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
