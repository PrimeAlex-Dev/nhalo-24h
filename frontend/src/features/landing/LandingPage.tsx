import { HeroSection } from './components/HeroSection';
import { StatsSection } from './components/StatsSection';
import { ProcessSection } from './components/ProcessSection';
import { ServicesSection } from './components/ServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { BlogSection } from './components/BlogSection';

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <ProcessSection />
      <ServicesSection />
      <TestimonialsSection />
      <BlogSection />
    </main>
  );
}
