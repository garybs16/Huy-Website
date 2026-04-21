import AboutSection from "@/components/AboutSection";
import FeaturedVideoSection from "@/components/FeaturedVideoSection";
import HeroSection from "@/components/HeroSection";
import PhilosophySection from "@/components/PhilosophySection";
import ServicesSection from "@/components/ServicesSection";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-black selection:bg-white/20 selection:text-white">
      <HeroSection />
      <AboutSection />
      <FeaturedVideoSection />
      <PhilosophySection />
      <ServicesSection />
    </main>
  );
}
