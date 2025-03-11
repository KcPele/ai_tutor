import LandingHero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import CallToAction from "@/components/landing/call-to-action";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <LandingHero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CallToAction />
      <Footer />
    </div>
  );
}
