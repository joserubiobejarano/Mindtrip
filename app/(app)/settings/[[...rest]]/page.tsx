import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo/metadata";
import SettingsPageClient from "@/components/settings-page-client";

export const metadata: Metadata = buildMetadata({
  title: "Settings – Kruno",
  description: "Manage your account preferences and billing in Kruno.",
  path: "/settings",
  robots: {
    index: false,
    follow: false,
  },
});

export default function SettingsPage() {
  return <SettingsPageClient />;
}
