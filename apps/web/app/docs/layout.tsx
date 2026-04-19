import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "better-payment",
        url: "/",
      }}
      githubUrl="https://github.com/furkanczay/better-payment"
    >
      {children}
    </DocsLayout>
  );
}
