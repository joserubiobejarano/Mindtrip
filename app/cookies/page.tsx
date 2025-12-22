import type { Metadata } from "next";
import { CookiesContent } from "./cookies-content";

export const metadata: Metadata = {
  title: "Cookie Policy – Kruno",
  description: "Learn about how Kruno uses cookies and similar technologies to improve your experience.",
  openGraph: {
    title: "Cookie Policy – Kruno",
    description: "Learn about how Kruno uses cookies and similar technologies.",
    url: "https://kruno.app/cookies",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Policy – Kruno",
    description: "Learn about Kruno's cookie usage.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CookiesPage() {
  return <CookiesContent />;
}
