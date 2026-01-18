import { notFound, redirect } from "next/navigation";
import { getLocalizedPath, isSupportedLocale } from "@/lib/seo/urls";

export default async function LocalizedDiscoverAliasRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) {
    notFound();
  }
  redirect(getLocalizedPath("/discover-kruno", lang));
}
