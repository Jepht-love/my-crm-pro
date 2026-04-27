import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import LogoMarquee from "@/components/LogoMarquee";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Rdv from "@/components/Rdv";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <LogoMarquee />
        <Features />
        <Testimonials />
        <Pricing />
        <Rdv />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
