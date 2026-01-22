export type ItineraryLocale = "en" | "es";

type ItineraryCopy = {
  heroEyebrowLabel: string;
  iconNav: {
    overview: string;
    facts: string;
    top: string;
    attractions: string;
    history: string;
    food: string;
    logistics: string;
    checklist: string;
    tips: string;
  };
  cityStatsTitle: string;
  quickFactsTitle: string;
  quickFactsLabels: {
    duration: string;
    pace: string;
    idealFor: string;
    style: string;
  };
  fitTitle: string;
  fitGoodLabel: string;
  fitNotLabel: string;
  dayOverviewTitle: string;
  dayOverviewTable: {
    day: string;
    focus: string;
    morning: string;
    afternoon: string;
    evening: string;
  };
  dayBlockLabels: {
    day: string;
    morning: string;
    afternoon: string;
    evening: string;
  };
  dayUnit: {
    singular: string;
    plural: string;
  };
  dayBreakdownTitle: string;
  logisticsTitle: string;
  checklistTitle: string;
  checklistSubtitle: string;
  goodToKnowTitle: string;
  faqTitle: string;
  relatedTitle: string;
  imageInfoTitle: string;
  imageInfoSubtitle: string;
  primaryCtaTitle: string;
  primaryCtaBody: string;
  primaryCtaButton: string;
  secondaryCtaTitle: string;
  secondaryCtaBody: string;
  secondaryCtaButton: string;
};

const itineraryCopy: Record<ItineraryLocale, ItineraryCopy> = {
  en: {
    heroEyebrowLabel: "Travel guide",
    iconNav: {
      overview: "Overview",
      facts: "Quick facts",
      top: "Top",
      attractions: "Attractions",
      history: "History",
      food: "Food",
      logistics: "Logistics",
      checklist: "Checklist",
      tips: "Tips / FAQ",
    },
    cityStatsTitle: "City by numbers",
    quickFactsTitle: "Quick facts",
    quickFactsLabels: {
      duration: "Duration",
      pace: "Pace",
      idealFor: "Ideal for",
      style: "Style",
    },
    fitTitle: "Is this travel guide for you?",
    fitGoodLabel: "Great fit if you want",
    fitNotLabel: "Not ideal if you want",
    dayOverviewTitle: "At-a-glance plan",
    dayOverviewTable: {
      day: "Day",
      focus: "Focus",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
    },
    dayBlockLabels: {
      day: "Day",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
    },
    dayUnit: {
      singular: "day",
      plural: "days",
    },
    dayBreakdownTitle: "Day-by-day breakdown",
    logisticsTitle: "Logistics & practical tips",
    checklistTitle: "Checklist before you go",
    checklistSubtitle: "Tap items as you prepare. No sign-in needed.",
    goodToKnowTitle: "Good to know before you go",
    faqTitle: "Frequently asked questions",
    relatedTitle: "Need a different pace?",
    imageInfoTitle: "City stories & context",
    imageInfoSubtitle:
      "Short editorial snapshots that highlight neighborhoods, themes, and the city's everyday rhythm.",
    primaryCtaTitle: "Build this trip in Kruno",
    primaryCtaBody:
      "Turn this travel guide into a personalized plan with dates and preferences.",
    primaryCtaButton: "Start planning",
    secondaryCtaTitle: "Need a different pace?",
    secondaryCtaBody: "Try another city template or customize the days in minutes.",
    secondaryCtaButton: "Browse all cities",
  },
  es: {
    heroEyebrowLabel: "Guía de viaje",
    iconNav: {
      overview: "Resumen",
      facts: "Datos",
      top: "Top",
      attractions: "Atracciones",
      history: "Historia",
      food: "Comida",
      logistics: "Logística",
      checklist: "Lista",
      tips: "Consejos / FAQ",
    },
    cityStatsTitle: "La ciudad en cifras",
    quickFactsTitle: "Datos rápidos",
    quickFactsLabels: {
      duration: "Duración",
      pace: "Ritmo",
      idealFor: "Ideal para",
      style: "Estilo",
    },
    fitTitle: "¿Esta guía de viaje es para ti?",
    fitGoodLabel: "Ideal si buscas",
    fitNotLabel: "No es ideal si buscas",
    dayOverviewTitle: "Plan de un vistazo",
    dayOverviewTable: {
      day: "Día",
      focus: "Enfoque",
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche",
    },
    dayBlockLabels: {
      day: "Día",
      morning: "Mañana",
      afternoon: "Tarde",
      evening: "Noche",
    },
    dayUnit: {
      singular: "día",
      plural: "días",
    },
    dayBreakdownTitle: "Día por día",
    logisticsTitle: "Logística y consejos prácticos",
    checklistTitle: "Lista de preparativos",
    checklistSubtitle: "Marca los puntos mientras preparas el viaje.",
    goodToKnowTitle: "Consejos antes de viajar",
    faqTitle: "Preguntas frecuentes",
    relatedTitle: "¿Quieres otro ritmo?",
    imageInfoTitle: "Historias y contexto",
    imageInfoSubtitle:
      "Notas editoriales breves para destacar barrios, temas y el ritmo cotidiano de la ciudad.",
    primaryCtaTitle: "Crea este viaje en Kruno",
    primaryCtaBody:
      "Convierte esta guía de viaje en un plan personalizado con fechas y preferencias.",
    primaryCtaButton: "Empezar a planificar",
    secondaryCtaTitle: "¿Quieres otro ritmo?",
    secondaryCtaBody: "Explora otra ciudad o ajusta los días en minutos.",
    secondaryCtaButton: "Ver todas las ciudades",
  },
};

export function getItineraryCopy(locale: ItineraryLocale): ItineraryCopy {
  return itineraryCopy[locale];
}
