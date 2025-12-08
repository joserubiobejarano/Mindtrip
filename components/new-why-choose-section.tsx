"use client";

import { BookOpen, DollarSign, RefreshCw, CheckSquare, Sparkles, Mail } from "lucide-react";

const reasons = [
  {
    icon: BookOpen,
    title: "Add from guides",
    description: "Crawled web content so you don't have to.",
    bgColor: "#FEF3C7", // yellow-100
    iconColor: "#B45309", // yellow-700
  },
  {
    icon: DollarSign,
    title: "Expense splitting",
    description: "Keep track of budgets and split costs easily.",
    bgColor: "#FCE7F3", // pink-100
    iconColor: "#BE185D", // pink-700
  },
  {
    icon: RefreshCw,
    title: "Real-time collab",
    description: "Plan along with your friends with live syncing.",
    bgColor: "#D1FAE5", // green-100
    iconColor: "#15803D", // green-700
  },
  {
    icon: CheckSquare,
    title: "Smart Checklists",
    description: "Packing lists, to-do lists, shopping lists.",
    bgColor: "#DBEAFE", // blue-100
    iconColor: "#1E40AF", // blue-700
  },
  {
    icon: Sparkles,
    title: "Smart Recs",
    description: "Personalized recommendations for your itinerary.",
    bgColor: "#F3E8FF", // purple-100
    iconColor: "#6B21A8", // purple-700
  },
  {
    icon: Mail,
    title: "Email Import",
    description: "Forward emails to get them magically added.",
    bgColor: "#FFEDD5", // orange-100
    iconColor: "#C2410C", // orange-700
  },
];

export function NewWhyChooseSection() {
  return (
    <section className="py-20 px-6" style={{ backgroundColor: 'hsl(var(--cream))' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl mb-4" 
            style={{ fontFamily: "'Patrick Hand', cursive" }}
          >
            Why travelers love <span className="solid-underline inline-block relative">Kruno</span>
          </h2>
          <p className="text-muted-foreground mt-6">
            Built by explorers, for explorers. We&apos;ve thought of <span className="wavy-underline inline-block">everything</span> so you don&apos;t have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div 
              key={reason.title} 
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
                {reason.title}
              </h3>
              <p className="text-muted-foreground text-sm text-left">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

