import { PrivacyContent } from "./privacy-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy – Kruno",
  description:
    "Learn how Kruno collects, uses, and protects your personal information. Your privacy is important to us.",
  path: "/privacy",
  robots: {
    index: false,
    follow: false,
  },
});

export default function PrivacyPage() {
  return <PrivacyContent />;
}
