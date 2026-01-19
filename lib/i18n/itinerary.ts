export type ItineraryLocale = "en" | "es";

type ItineraryCopy = {
  heroEyebrowLabel: string;
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
  faqTitle: string;
  relatedTitle: string;
  primaryCtaTitle: string;
  primaryCtaBody: string;
  primaryCtaButton: string;
  secondaryCtaTitle: string;
  secondaryCtaBody: string;
  secondaryCtaButton: string;
};

const itineraryCopy: Record<ItineraryLocale, ItineraryCopy> = {
  en: {
    heroEyebrowLabel: "City itinerary",
    quickFactsTitle: "Quick facts",
    quickFactsLabels: {
      duration: "Duration",
      pace: "Pace",
      idealFor: "Ideal for",
      style: "Style",
    },
    fitTitle: "Is this itinerary for you?",
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
    faqTitle: "Frequently asked questions",
    relatedTitle: "Related itineraries",
    primaryCtaTitle: "Build this trip in Kruno",
    primaryCtaBody:
      "Turn this itinerary into a personalized plan with dates, preferences, and AI recommendations.",
    primaryCtaButton: "Start planning",
    secondaryCtaTitle: "Need a different pace?",
    secondaryCtaBody: "Try another city template or customize the days in minutes.",
    secondaryCtaButton: "Browse all cities",
  },
  es: {
    heroEyebrowLabel: "Itinerario por ciudad",
    quickFactsTitle: "Datos rapidos",
    quickFactsLabels: {
      duration: "Duracion",
      pace: "Ritmo",
      idealFor: "Ideal para",
      style: "Estilo",
    },
    fitTitle: "Este itinerario es para ti?",
    fitGoodLabel: "Ideal si buscas",
    fitNotLabel: "No es ideal si buscas",
    dayOverviewTitle: "Plan de un vistazo",
    dayOverviewTable: {
      day: "Dia",
      focus: "Enfoque",
      morning: "Manana",
      afternoon: "Tarde",
      evening: "Noche",
    },
    dayBlockLabels: {
      day: "Dia",
      morning: "Manana",
      afternoon: "Tarde",
      evening: "Noche",
    },
    dayUnit: {
      singular: "dia",
      plural: "dias",
    },
    dayBreakdownTitle: "Dia por dia",
    logisticsTitle: "Logistica y consejos practicos",
    checklistTitle: "Lista de preparativos",
    checklistSubtitle: "Marca los puntos mientras preparas el viaje.",
    faqTitle: "Preguntas frecuentes",
    relatedTitle: "Itinerarios relacionados",
    primaryCtaTitle: "Crea este viaje en Kruno",
    primaryCtaBody:
      "Convierte este itinerario en un plan personalizado con fechas, preferencias y recomendaciones de IA.",
    primaryCtaButton: "Empezar a planificar",
    secondaryCtaTitle: "Quieres otro ritmo?",
    secondaryCtaBody: "Explora otra ciudad o ajusta los dias en minutos.",
    secondaryCtaButton: "Ver todas las ciudades",
  },
};

export function getItineraryCopy(locale: ItineraryLocale): ItineraryCopy {
  return itineraryCopy[locale];
}
