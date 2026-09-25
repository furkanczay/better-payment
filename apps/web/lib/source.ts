import { docs, meta } from "@/.source/server";
import { loader } from "fumadocs-core/source";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { i18n } from "@/lib/i18n/config";

export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: toFumadocsSource(docs, meta),
});
