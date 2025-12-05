"use client";

import { NewNavbar } from "@/components/new-navbar";
import { NewHeroSection } from "@/components/new-hero-section";
import { NewWhyChooseSection } from "@/components/new-why-choose-section";
import { NewExperiencesSection } from "@/components/new-experiences-section";
import { WhyChooseSection } from "@/components/why-choose-section";
import { NewCTASection } from "@/components/new-cta-section";
import { NewNewsletterSection } from "@/components/new-newsletter-section";
import { NewFooter } from "@/components/new-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main>
        <NewHeroSection />
        <NewWhyChooseSection />
        <NewExperiencesSection />
        <WhyChooseSection />
        <NewCTASection />
        <NewNewsletterSection />
      </main>
      <NewFooter />
    </div>
  );
}
