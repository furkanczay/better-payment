import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { isLocale, localePath } from "@/lib/i18n/config";
import { notFound } from "next/navigation";

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      i18n
      nav={{
        title: "better-payment",
        url: localePath(lang, "/"),
      }}
      githubUrl="https://github.com/furkanczay/better-payment"
    >
      {children}
    </DocsLayout>
  );
}
