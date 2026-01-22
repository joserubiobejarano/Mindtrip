import { CookiesContent } from "./cookies-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Cookie Policy – Kruno",
  description:
    "Learn about how Kruno uses cookies and similar technologies to improve your experience.",
  path: "/cookies",
  robots: {
    index: false,
    follow: false,
  },
});

export default function CookiesPage() {
  return <CookiesContent />;
}
