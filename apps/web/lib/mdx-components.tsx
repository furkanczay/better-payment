import type { MDXComponents } from "mdx/types";
import { Callout } from "fumadocs-ui/components/callout";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Card, Cards } from "fumadocs-ui/components/card";

export function getMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    Tab,
    Tabs,
    Card,
    Cards,
  };
}
