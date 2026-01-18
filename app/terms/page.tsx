import { TermsContent } from "./terms-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service – Kruno",
  description:
    "Read Kruno's Terms of Service to understand the rules and guidelines for using our platform.",
  path: "/terms",
  robots: {
    index: true,
    follow: true,
  },
});

export default function TermsPage() {
  return <TermsContent />;
}
