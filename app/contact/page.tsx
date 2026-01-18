import { ContactContent } from "./contact-content";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us – Kruno",
  description:
    "Get in touch with the Kruno team. We're here to help with questions, feedback, or support requests.",
  path: "/contact",
  robots: {
    index: true,
    follow: true,
  },
});

export default function ContactPage() {
  return <ContactContent />;
}
