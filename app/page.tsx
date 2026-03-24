import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection, ImageShowcase } from "@/components/features-section"
import { SpecsSection } from "@/components/specs-section"
import { InstallationSection } from "@/components/installation-section"
import { StatsSection } from "@/components/stats-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FAQSection } from "@/components/faq-section"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { WhatsAppFloat } from "@/components/whatsapp-float"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ImageShowcase />
      <SpecsSection />
      <InstallationSection />
      <StatsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
      <WhatsAppFloat />
    </main>
  )
}
