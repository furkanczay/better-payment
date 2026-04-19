import Navbar from "@/components/Navbar";
import DocsSidebar from "@/components/docs/DocsSidebar";
import Footer from "@/components/Footer";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 pt-14">
        <div className="flex gap-10 py-10">
          <DocsSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
