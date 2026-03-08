import Marquee from "react-fast-marquee";

const items = [
  { text: "Home Cleaning", bold: true },
  { text: "Plumbing", bold: true },
  { text: "Electrical Work", bold: true },
  { text: "AC Service", bold: true },
  { text: "and hundreds more", bold: false },
  { text: "Carpentry", bold: true },
  { text: "Pest Control", bold: true },
  { text: "Painting", bold: true },
  { text: "Appliance Repair", bold: true },
  { text: "all close to home", bold: false },
];

export default function CategoryMarquee() {
  return (
    <div className="w-full bg-primary overflow-hidden py-12.5">
      <Marquee speed={40} gradient={false} pauseOnHover>
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center font-display text-[1rem] px-9 border-r border-white/15"
            style={{
              fontStyle: "italic",
              fontWeight: item.bold ? 700 : 300,
              color: item.bold ? "white" : "rgba(255,255,255,0.75)",
            }}
          >
            {item.bold ? (
              <strong className="not-italic font-bold">{item.text}</strong>
            ) : (
              item.text
            )}
          </span>
        ))}
      </Marquee>
    </div>
  );
}
