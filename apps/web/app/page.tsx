import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Providers from "@/components/Providers";
import QuickStart from "@/components/QuickStart";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Providers />
        <QuickStart />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
