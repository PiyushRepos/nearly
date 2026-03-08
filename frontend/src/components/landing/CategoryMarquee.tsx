import Marquee from "react-fast-marquee";

const categories = [
  { label: "Home Cleaning", emoji: "🧹" },
  { label: "Plumbing", emoji: "🔧" },
  { label: "Carpentry", emoji: "🪚" },
  { label: "Pest Control", emoji: "🐛" },
  { label: "Painting", emoji: "🎨" },
  { label: "Appliance Repair", emoji: "⚡" },
  { label: "AC Service", emoji: "❄️" },
  { label: "Home Shifting", emoji: "📦" },
  { label: "Electrical Work", emoji: "💡" },
  { label: "Garden & Lawn", emoji: "🌿" },
  { label: "Water Tank Cleaning", emoji: "💧" },
  { label: "Home Massage & Spa", emoji: "💆" },
  { label: "Sofa & Upholstery", emoji: "🛋️" },
  { label: "Home Painting", emoji: "🖌️" },
];

export default function CategoryMarquee() {
  return (
    <div className="w-full border-y border-border bg-white py-0 overflow-hidden">
      <Marquee speed={40} gradient={false} pauseOnHover className="py-3">
        {categories.map((cat) => (
          <span
            key={cat.label}
            className="inline-flex items-center gap-2 mx-6 text-sm font-semibold text-foreground/70 hover:text-primary transition-colors cursor-default select-none"
          >
            <span className="text-base leading-none">{cat.emoji}</span>
            {cat.label}
            <span className="ml-6 text-border">·</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
