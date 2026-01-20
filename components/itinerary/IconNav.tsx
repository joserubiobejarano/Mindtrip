"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Compass,
  HelpCircle,
  Landmark,
  Menu,
  MapPin,
  MapPinned,
  Star,
  UtensilsCrossed,
  X,
} from "lucide-react";

const iconMap = {
  BookOpen,
  CheckSquare,
  Compass,
  HelpCircle,
  Landmark,
  MapPin,
  MapPinned,
  Star,
  UtensilsCrossed,
};

type IconName = keyof typeof iconMap;

export type IconNavItem = {
  id: string;
  label: string;
  icon: IconName;
};

 type IconNavProps = {
   items: IconNavItem[];
 };

 export function IconNav({ items }: IconNavProps) {
   const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) ?? items[0],
    [activeId, items]
  );

   useEffect(() => {
     if (typeof window === "undefined") {
       return;
     }

     const sections = items
       .map((item) => document.getElementById(item.id))
       .filter((section): section is HTMLElement => Boolean(section));

     if (sections.length === 0) {
       return;
     }

     const observer = new IntersectionObserver(
       (entries) => {
         const visible = entries
           .filter((entry) => entry.isIntersecting)
           .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
         if (visible?.target?.id) {
           setActiveId(visible.target.id);
         }
       },
       {
         rootMargin: "-30% 0px -55% 0px",
         threshold: [0.15, 0.35, 0.6],
       }
     );

     sections.forEach((section) => observer.observe(section));

     return () => observer.disconnect();
   }, [items]);

  return (
    <div className="sticky top-4 z-30 w-full">
      <nav className="w-full">
        <div className="hidden w-full items-center justify-center md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
            {items.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = item.id === activeId;
              if (!Icon) {
                return null;
              }
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="flex w-full items-center justify-between rounded-full border border-border/60 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur"
            aria-expanded={isOpen}
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              {activeItem ? (
                <>
                  {(() => {
                    const Icon = activeItem ? iconMap[activeItem.icon] : null;
                    return Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null;
                  })()}
                  <span>{activeItem?.label ?? ""}</span>
                </>
              ) : null}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm">
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </span>
          </button>

          {isOpen ? (
            <div className="mt-3 rounded-2xl border border-border/60 bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = iconMap[item.icon];
                  if (!Icon) {
                    return null;
                  }
                  return (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
                    >
                      <Icon className="h-4 w-4 text-primary/80" />
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </nav>
    </div>
   );
 }
