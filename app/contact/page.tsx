import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact Us – Kruno",
  description: "Get in touch with the Kruno team. We're here to help with questions, feedback, or support requests.",
  openGraph: {
    title: "Contact Us – Kruno",
    description: "Get in touch with the Kruno team. We're here to help with questions, feedback, or support requests.",
    url: "https://kruno.app/contact",
    siteName: "Kruno",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us – Kruno",
    description: "Get in touch with the Kruno team.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
