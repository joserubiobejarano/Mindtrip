"use client";

import { BookOpen, DollarSign, RefreshCw, CheckSquare, Sparkles, Mail } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Add from guides",
    description: "Crawled web content so you don't have to.",
  },
  {
    icon: DollarSign,
    title: "Expense splitting",
    description: "Keep track of budgets and split costs easily.",
  },
  {
    icon: RefreshCw,
    title: "Real-time collab",
    description: "Plan along with your friends with live syncing.",
  },
  {
    icon: CheckSquare,
    title: "Smart Checklists",
    description: "Packing lists, to-do lists, shopping lists.",
  },
  {
    icon: Sparkles,
    title: "Smart Recs",
    description: "Personalized recommendations for your itinerary.",
  },
  {
    icon: Mail,
    title: "Email Import",
    description: "Forward emails to get them magically added.",
  },
];

export function NewFeaturesSection() {
  return (
    <section className="py-20 px-6 bg-cream">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl mb-4">
            Why travelers love <span className="wavy-underline">Kruno</span>
          </h2>
          <p className="font-mono text-sm text-muted-foreground max-w-xl mx-auto">
            Built by explorers, for explorers. We&apos;ve thought of everything so you don&apos;t have to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="font-display text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

