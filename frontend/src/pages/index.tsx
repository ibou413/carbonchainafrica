import { Benefits } from "@/components/Benefits";
import { CTA } from "@/components/CTA";
import { FeaturedListings } from "@/components/FeaturedListings";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

import { Navbar } from "@/components/Navbar";
import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <div id="hero">
          <Hero />
        </div>
        <div id="featured">
          <FeaturedListings />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <Benefits />

        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
