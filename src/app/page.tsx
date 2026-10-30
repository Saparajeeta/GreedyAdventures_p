import { Navbar } from "@/components/experience/Navbar";
import { HeroSection } from "@/components/experience/HeroSection";
import { PackagesSection } from "@/components/experience/PackagesSection";
import { PlanSection } from "@/components/experience/PlanSection";
import { HighlightsSection } from "@/components/experience/HighlightsSection";
import { ChatPlaceholder } from "@/components/experience/ChatPlaceholder";
import { Footer } from "@/components/experience/Footer";

export default function ExperiencePage() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-sand selection:bg-brand-amber selection:text-white">
      <Navbar />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <PackagesSection />
        <PlanSection />
        <HighlightsSection />
        <ChatPlaceholder />
      </main>
      <Footer />
    </div>
  );
}
