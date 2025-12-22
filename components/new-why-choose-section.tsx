"use client";

import { BookOpen, DollarSign, RefreshCw, CheckSquare, Sparkles, Mail } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

const reasons = [
  {
    icon: BookOpen,
    titleKey: "home_why_choose_feature_guides_title" as const,
    descriptionKey: "home_why_choose_feature_guides_desc" as const,
    bgColor: "#FEF3C7", // yellow-100
    iconColor: "#B45309", // yellow-700
  },
  {
    icon: DollarSign,
    titleKey: "home_why_choose_feature_expenses_title" as const,
    descriptionKey: "home_why_choose_feature_expenses_desc" as const,
    bgColor: "#FCE7F3", // pink-100
    iconColor: "#BE185D", // pink-700
  },
  {
    icon: RefreshCw,
    titleKey: "home_why_choose_feature_collab_title" as const,
    descriptionKey: "home_why_choose_feature_collab_desc" as const,
    bgColor: "#D1FAE5", // green-100
    iconColor: "#15803D", // green-700
  },
  {
    icon: CheckSquare,
    titleKey: "home_why_choose_feature_checklists_title" as const,
    descriptionKey: "home_why_choose_feature_checklists_desc" as const,
    bgColor: "#DBEAFE", // blue-100
    iconColor: "#1E40AF", // blue-700
  },
  {
    icon: Sparkles,
    titleKey: "home_why_choose_feature_recs_title" as const,
    descriptionKey: "home_why_choose_feature_recs_desc" as const,
    bgColor: "#F3E8FF", // purple-100
    iconColor: "#6B21A8", // purple-700
  },
  {
    icon: Mail,
    titleKey: "home_why_choose_feature_email_title" as const,
    descriptionKey: "home_why_choose_feature_email_desc" as const,
    bgColor: "#FFEDD5", // orange-100
    iconColor: "#C2410C", // orange-700
  },
];

export function NewWhyChooseSection() {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl mb-4" 
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            {t('home_why_choose_title')}
          </h2>
          <p className="text-muted-foreground mt-6">
            {t('home_why_choose_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm p-6 flex flex-col h-full transition-all duration-300 hover:border-b-4 hover:border-foreground cursor-pointer"
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border-2"
                style={{ 
                  backgroundColor: reason.bgColor,
                  borderColor: reason.iconColor
                }}
              >
                <reason.icon 
                  className="w-7 h-7" 
                  style={{ color: reason.iconColor }}
                  strokeWidth={2}
                />
              </div>
              <h3 
                className="text-xl font-bold mb-2 text-left"
                style={{ fontFamily: "'Patrick Hand', cursive" }}
              >
                {t(reason.titleKey)}
              </h3>
              <p className="text-muted-foreground text-sm text-left">{t(reason.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

