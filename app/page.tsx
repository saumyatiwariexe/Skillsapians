import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ExistingSolutionsSection from "@/components/landing/ExistingSolutionsSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import ExampleReportSection from "@/components/landing/ExampleReportSection";
import WhoIsThisForSection from "@/components/landing/WhoIsThisForSection";
import WhyThisMattersSection from "@/components/landing/WhyThisMattersSection";
import TechnicalCredibilitySection from "@/components/landing/TechnicalCredibilitySection";
import FAQSection from "@/components/landing/FAQSection";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#050505" }}>
      <HeroSection />
      <ProblemSection />
      <ExistingSolutionsSection />
      <HowItWorksSection />
      <ExampleReportSection />
      <WhoIsThisForSection />
      <WhyThisMattersSection />
      <TechnicalCredibilitySection />
      <FAQSection />
      <Footer />
    </div>
  );
}
