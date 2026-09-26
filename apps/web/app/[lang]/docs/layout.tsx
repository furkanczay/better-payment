import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "@/lib/source";
import { isLocale, localePath } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function Layout({ children, params }: LayoutProps<"/[lang]/docs">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <DocsLayout
      tree={source.getPageTree(lang)}
      i18n
      nav={{
        title: (
          <>
            <Image src="/logo.svg" width={1000} height={897} alt="" className="h-6 w-auto" />
            better-payment
          </>
        ),
        url: localePath(lang, "/"),
      }}
      githubUrl="https://github.com/czaydev/better-payment"
    >
      {children}
    </DocsLayout>
  );
}
