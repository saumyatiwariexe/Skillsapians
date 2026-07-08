import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import ProductivitySection from "@/components/landing/ProductivitySection";
import StatsSection from "@/components/landing/StatsSection";
import CollaborationSection from "@/components/landing/CollaborationSection";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#121212" }}>
      <HeroSection />
      <TrustBar />
      <ProductivitySection />
      <StatsSection />
      <CollaborationSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </div>
  );
}
