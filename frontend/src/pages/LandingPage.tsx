import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CategoryMarquee from "@/components/landing/CategoryMarquee";
import QuoteSection from "@/components/landing/QuoteSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ForProfessionals from "@/components/landing/ForProfessionals";
import WhyNearly from "@/components/landing/WhyNearly";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuoteSection />
        <HowItWorks />
        <CategoryMarquee />
        <ForProfessionals />
        <WhyNearly />
        <Testimonials />
        <CTASection />
      </main>
    </>
  );
}
