import type { Metadata } from "next";
import { TermsContent } from "./terms-content";

export const metadata: Metadata = {
  title: "Terms of Service – Kruno",
  description: "Read Kruno's Terms of Service to understand the rules and guidelines for using our platform.",
  openGraph: {
    title: "Terms of Service – Kruno",
    description: "Read Kruno's Terms of Service to understand the rules and guidelines for using our platform.",
    url: "https://kruno.app/terms",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service – Kruno",
    description: "Read Kruno's Terms of Service.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return <TermsContent />;
}
