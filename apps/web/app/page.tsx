import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Compare from "@/components/Compare";
import Features from "@/components/Features";
import Providers from "@/components/Providers";
import Banks from "@/components/Banks";
import QuickStart from "@/components/QuickStart";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <Compare />
        <Features />
        <Providers />
        <Banks />
        <QuickStart />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
