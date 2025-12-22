import type { Metadata } from "next";
import { PrivacyContent } from "./privacy-content";

export const metadata: Metadata = {
  title: "Privacy Policy – Kruno",
  description: "Learn how Kruno collects, uses, and protects your personal information. Your privacy is important to us.",
  openGraph: {
    title: "Privacy Policy – Kruno",
    description: "Learn how Kruno collects, uses, and protects your personal information.",
    url: "https://kruno.app/privacy",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy – Kruno",
    description: "Learn how Kruno protects your privacy.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
