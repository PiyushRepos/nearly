// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface TrustStat {
  value: string;
  label: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export interface ProBenefit {
  emoji: string;
  title: string;
  description: string;
}

export interface WhyItem {
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  rating: number;
  text: string;
  name: string;
  role: string;
  initials: string;
  color: string;
}

export interface FooterColumn {
  heading: string;
  links: { label: string; href: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const navLinks: NavLink[] = [
  { label: "For Homeowners", href: "/#customers" },
  { label: "For Professionals", href: "/#professionals" },
  { label: "Why Nearly", href: "/#why" },
  { label: "Stories", href: "/#testimonials" },
];

export const trustStats: TrustStat[] = [
  { value: "4.9", label: "Average rating" },
  { value: "12,000+", label: "Professionals active" },
  { value: "30-day", label: "Work guarantee" },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Search your area",
    description:
      "Browse services by category. See real professionals near you — not a list of a thousand strangers.",
  },
  {
    number: "02",
    title: "Pick a time that works",
    description:
      "Add the details, select a date. The price is right there before you confirm — no surprises, ever.",
  },
  {
    number: "03",
    title: "Track every step",
    description:
      "From confirmed to completed, you always know exactly what's happening. Changed plans? Reschedule in seconds.",
  },
  {
    number: "04",
    title: "Pay only when done",
    description:
      "Changed your mind? Cancel without the drama. We get it — life doesn't always cooperate.",
  },
];

export const proBenefits: ProBenefit[] = [
  {
    emoji: "📅",
    title: "Set your schedule",
    description: "Go offline when you're not. Simple as that.",
  },
  {
    emoji: "✅",
    title: "Accept what works",
    description: "Review each request, accept only jobs that work for you.",
  },
  {
    emoji: "📸",
    title: "Build your reputation",
    description: "Upload before/after photos. Your work speaks for itself.",
  },
  {
    emoji: "💸",
    title: "Get paid reliably",
    description:
      "Every job, same day. No chasing invoices. No awkward moments.",
  },
];

export const whyItems: WhyItem[] = [
  {
    icon: "🔍",
    title: "Every professional is certified",
    description:
      "Background checked, identity verified, skill assessed. You know who's coming before they arrive.",
  },
  {
    icon: "⭐",
    title: "Reviews you can actually trust",
    description:
      "No fake stars. No paid bumps. Only verified customers who completed a job can leave a review.",
  },
  {
    icon: "🔒",
    title: "Work documented, always",
    description:
      "Before and after photos on every job, uploaded by the pro — so you always know what actually happened.",
  },
];

export const testimonials: Testimonial[] = [
  {
    rating: 5,
    text: "I've tried three other apps. Nearly is the first one where I didn't have to chase anyone. Booked at night, professional confirmed by morning, showed up exactly on time. That's all I wanted.",
    name: "Nisha Patel",
    role: "Booked plumbing · Mumbai",
    initials: "NP",
    color: "bg-primary text-white",
  },
  {
    rating: 5,
    text: "The before and after photos were a surprise I didn't expect. I wasn't home when the work happened — seeing those photos meant I actually trusted the job was done properly.",
    name: "Arjun Kapoor",
    role: "Booked electrical · Delhi",
    initials: "AK",
    color: "bg-secondary text-white",
  },
  {
    rating: 5,
    text: "As a professional, Nearly changed how I work. I used to spend hours finding customers. Now I just switch on, accept what fits my day, and focus on the job. My income has genuinely improved.",
    name: "Sunita Lal",
    role: "Cleaning professional · Bengaluru",
    initials: "SL",
    color: "bg-[#c49a3c] text-white",
  },
];

export const footerColumns: FooterColumn[] = [
  {
    heading: "For Homeowners",
    links: [
      { label: "Browse Services", href: "/browse" },
      { label: "How Booking Works", href: "/#customers" },
      { label: "Cities We Cover", href: "/browse" },
      { label: "Pricing Guide", href: "/browse" },
    ],
  },
  {
    heading: "For Professionals",
    links: [
      { label: "Join Nearly", href: "/auth/signup" },
      { label: "How It Works for You", href: "/#professionals" },
      { label: "Verification Process", href: "/auth/signup" },
      { label: "Getting Paid", href: "/auth/signup" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Get in Touch", href: "#" },
    ],
  },
];
