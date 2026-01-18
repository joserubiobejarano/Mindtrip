export type MarketingLocale = "en" | "es";

type MarketingCopy = {
  homeMetaTitle: string;
  homeMetaDescription: string;
  citiesMetaTitle: string;
  citiesMetaDescription: string;
  influencersMetaTitle: string;
  influencersMetaDescription: string;
  discoverMetaTitle: string;
  discoverMetaDescription: string;
  citiesHubTitle: string;
  citiesHubSubtitle: string;
  cityCardCta: string;
  influencersHubTitle: string;
  influencersHubSubtitle: string;
  influencerCardCta: string;
  cityDetailHighlightsTitle: string;
  cityDetailPlanTitle: string;
  cityDetailPlanBody: string;
  cityDetailPlanCta: string;
  cityDetailBrowseAll: string;
  cityDetailExploreMore: string;
  influencerDetailPlanTitle: string;
  influencerDetailPlanBody: string;
  influencerDetailPlanCta: string;
  influencerDetailBrowseAll: string;
  influencerDetailMore: string;
  influencerDetailFocusLabel: string;
  exploreSectionTitle: string;
  exploreSectionSubtitle: string;
  exploreCitiesTitle: string;
  exploreInfluencersTitle: string;
  exploreCitiesCta: string;
  exploreInfluencersCta: string;
};

const marketingCopy: Record<MarketingLocale, MarketingCopy> = {
  en: {
    homeMetaTitle: "Kruno - AI Travel Planner",
    homeMetaDescription:
      "Plan smart, personalized trips with Kruno's AI travel planner. Build itineraries, discover places, and travel with confidence.",
    citiesMetaTitle: "City Itineraries – Kruno",
    citiesMetaDescription:
      "Browse AI-generated city itineraries and travel guides from Kruno.",
    influencersMetaTitle: "Influencer Itineraries – Kruno",
    influencersMetaDescription:
      "Discover travel itineraries curated by influencers and creators on Kruno.",
    discoverMetaTitle: "Discover Kruno – AI Travel Planner",
    discoverMetaDescription:
      "Create a clear trip plan in minutes with Kruno's AI travel planner.",
    citiesHubTitle: "City itineraries",
    citiesHubSubtitle:
      "Pick a city to explore a ready-to-use itinerary and plan faster with Kruno.",
    cityCardCta: "View itinerary →",
    influencersHubTitle: "Influencer itineraries",
    influencersHubSubtitle:
      "Hand-picked itinerary frameworks and travel styles from creators you can trust.",
    influencerCardCta: "View profile →",
    cityDetailHighlightsTitle: "Top highlights",
    cityDetailPlanTitle: "Plan this trip in Kruno",
    cityDetailPlanBody:
      "Turn this outline into a personalized plan with dates, preferences, and AI recommendations.",
    cityDetailPlanCta: "Start planning",
    cityDetailBrowseAll: "Browse all cities",
    cityDetailExploreMore: "Explore more cities",
    influencerDetailPlanTitle: "Plan a trip with this style",
    influencerDetailPlanBody:
      "Use this creator-inspired style to build a custom itinerary with Kruno's AI planner.",
    influencerDetailPlanCta: "Start planning",
    influencerDetailBrowseAll: "Browse all creators",
    influencerDetailMore: "More creators",
    influencerDetailFocusLabel: "Focus area:",
    exploreSectionTitle: "Explore trips by city",
    exploreSectionSubtitle:
      "Jump into a ready-made itinerary or follow a creator-inspired travel style.",
    exploreCitiesTitle: "Popular city itineraries",
    exploreInfluencersTitle: "Influencer styles",
    exploreCitiesCta: "View all cities →",
    exploreInfluencersCta: "View all creators →",
  },
  es: {
    homeMetaTitle: "Kruno - Planificador de viajes con IA",
    homeMetaDescription:
      "Planifica viajes personalizados con Kruno. Crea itinerarios, descubre lugares y viaja con confianza.",
    citiesMetaTitle: "Itinerarios por ciudad – Kruno",
    citiesMetaDescription:
      "Explora itinerarios por ciudad y guías de viaje creadas con IA por Kruno.",
    influencersMetaTitle: "Itinerarios de influencers – Kruno",
    influencersMetaDescription:
      "Descubre itinerarios de viaje creados por influencers y creadores en Kruno.",
    discoverMetaTitle: "Descubre Kruno – Planificador de viajes con IA",
    discoverMetaDescription:
      "Crea un plan de viaje claro en minutos con el planificador de Kruno.",
    citiesHubTitle: "Itinerarios por ciudad",
    citiesHubSubtitle:
      "Elige una ciudad para explorar un itinerario listo y planificar más rápido con Kruno.",
    cityCardCta: "Ver itinerario →",
    influencersHubTitle: "Itinerarios de influencers",
    influencersHubSubtitle:
      "Estilos e itinerarios seleccionados por creadores en los que puedes confiar.",
    influencerCardCta: "Ver perfil →",
    cityDetailHighlightsTitle: "Principales destacados",
    cityDetailPlanTitle: "Planifica este viaje en Kruno",
    cityDetailPlanBody:
      "Convierte este esquema en un plan personalizado con fechas, preferencias y recomendaciones de IA.",
    cityDetailPlanCta: "Empezar a planificar",
    cityDetailBrowseAll: "Ver todas las ciudades",
    cityDetailExploreMore: "Explora más ciudades",
    influencerDetailPlanTitle: "Planifica un viaje con este estilo",
    influencerDetailPlanBody:
      "Usa este estilo inspirado en creadores para crear un itinerario con el planificador de Kruno.",
    influencerDetailPlanCta: "Empezar a planificar",
    influencerDetailBrowseAll: "Ver todos los creadores",
    influencerDetailMore: "Más creadores",
    influencerDetailFocusLabel: "Área de enfoque:",
    exploreSectionTitle: "Explora viajes por ciudad",
    exploreSectionSubtitle:
      "Accede a un itinerario listo o sigue un estilo de viaje inspirado en creadores.",
    exploreCitiesTitle: "Itinerarios de ciudades populares",
    exploreInfluencersTitle: "Estilos de influencers",
    exploreCitiesCta: "Ver todas las ciudades →",
    exploreInfluencersCta: "Ver todos los creadores →",
  },
};

export function getMarketingCopy(locale: MarketingLocale): MarketingCopy {
  return marketingCopy[locale];
}
