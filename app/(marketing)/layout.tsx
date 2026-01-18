import { NewFooter } from "@/components/new-footer";
import { NewNavbar } from "@/components/new-navbar";
import { LanguageProvider } from "@/components/providers/language-provider";
import { isSupportedLocale } from "@/lib/seo/urls";
import { notFound } from "next/navigation";

export default async function MarketingLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ lang?: string }>;
}>) {
  const resolvedParams = await params;
  const lang = resolvedParams?.lang;
  if (lang && !isSupportedLocale(lang)) {
    notFound();
  }

  const content = (
    <div className="min-h-screen bg-background">
      <NewNavbar />
      <main>{children}</main>
      <NewFooter />
    </div>
  );
  if (lang && isSupportedLocale(lang)) {
    return <LanguageProvider initialLanguage={lang}>{content}</LanguageProvider>;
  }

  return content;
}
