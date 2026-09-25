import { source } from "@/lib/source";
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from "fumadocs-ui/layouts/docs/page";
import { Callout } from "fumadocs-ui/components/callout";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/lib/mdx-components";
import { alternates, isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

/** True when the page is shown from the other language because it has no translation */
function isFallback(page: { path: string }, lang: string): boolean {
  const translated = /\.([a-z]{2})\.mdx?$/.exec(page.path)?.[1];
  return lang === "en" ? translated !== undefined : translated !== lang;
}

export default async function Page({ params }: PageProps<"/[lang]/docs/[[...slug]]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        {isFallback(page, lang) && (
          <Callout type="info">{getDictionary(lang).docs.fallbackNotice}</Callout>
        )}
        <MDX components={getMDXComponents(defaultMdxComponents, lang)} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/docs/[[...slug]]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const page = source.getPage(slug, lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: alternates(`/docs${slug?.length ? `/${slug.join("/")}` : ""}`, lang),
  };
}
