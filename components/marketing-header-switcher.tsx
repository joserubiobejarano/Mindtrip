"use client";

import { usePathname } from "next/navigation";
import { MarketingNavbar } from "@/components/marketing-navbar";
import { MarketingGuideHeader } from "@/components/marketing-guide-header";

type MarketingHeaderSwitcherProps = {
  isSignedIn?: boolean;
};

const getBasePath = (pathname: string | null) => {
  if (!pathname) return "";
  return pathname.startsWith("/es") ? "/es" : pathname.startsWith("/en") ? "/en" : "";
};

const isCitiesPath = (pathname: string | null) => {
  if (!pathname) return false;
  const normalized = pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return (
    normalized === "/cities" ||
    normalized.startsWith("/cities/") ||
    normalized === "/en/cities" ||
    normalized.startsWith("/en/cities/") ||
    normalized === "/es/cities" ||
    normalized.startsWith("/es/cities/")
  );
};

export function MarketingHeaderSwitcher({ isSignedIn = false }: MarketingHeaderSwitcherProps) {
  const pathname = usePathname();
  if (isCitiesPath(pathname)) {
    const basePath = getBasePath(pathname) || "/";
    return <MarketingGuideHeader ctaHref={basePath} />;
  }

  return <MarketingNavbar isSignedIn={isSignedIn} />;
}
