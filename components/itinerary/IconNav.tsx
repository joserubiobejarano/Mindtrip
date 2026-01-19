"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Compass,
  HelpCircle,
  Landmark,
  MapPin,
  MapPinned,
  Star,
  UtensilsCrossed,
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
     <div className="sticky top-4 z-30">
       <nav className="rounded-full border border-border/60 bg-background/90 px-3 py-2 shadow-sm backdrop-blur">
         <div className="flex items-center gap-2 overflow-x-auto">
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
                 className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                   isActive
                     ? "bg-primary text-primary-foreground"
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
       </nav>
     </div>
   );
 }
