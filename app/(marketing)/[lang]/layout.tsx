import { SUPPORTED_LOCALES } from "@/lib/seo/urls";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export default function MarketingLocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
