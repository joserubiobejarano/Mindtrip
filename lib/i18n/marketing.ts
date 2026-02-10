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
    homeMetaTitle: "Kruno - Smart travel planner",
    homeMetaDescription:
      "Plan smart, personalized trips with Kruno's smart travel planner. Build itineraries, discover places, and travel with confidence.",
    citiesMetaTitle: "City Travel Guides – Kruno",
    citiesMetaDescription: "Browse smart city travel guides from Kruno.",
    influencersMetaTitle: "Influencer Guides – Kruno",
    influencersMetaDescription: "Discover travel guides curated by influencers and creators on Kruno.",
    discoverMetaTitle: "Discover Kruno – Smart travel planner",
    discoverMetaDescription:
      "Create a clear trip plan in minutes with Kruno's smart travel planner.",
    citiesHubTitle: "City travel guides",
    citiesHubSubtitle:
      "Pick a city to explore a ready-to-use travel guide and plan faster with Kruno.",
    cityCardCta: "View guide →",
    influencersHubTitle: "Influencer guides",
    influencersHubSubtitle:
      "Hand-picked guide frameworks and travel styles from creators you can trust.",
    influencerCardCta: "View profile →",
    cityDetailHighlightsTitle: "Top highlights",
    cityDetailPlanTitle: "Plan this trip in Kruno",
    cityDetailPlanBody:
      "Turn this guide into a personalized plan with dates, preferences, and smart recommendations.",
    cityDetailPlanCta: "Start planning",
    cityDetailBrowseAll: "Browse all cities",
    cityDetailExploreMore: "Explore more cities",
    influencerDetailPlanTitle: "Plan a trip with this style",
    influencerDetailPlanBody:
      "Use this creator-inspired style to build a custom travel guide with Kruno's smart planner.",
    influencerDetailPlanCta: "Start planning",
    influencerDetailBrowseAll: "Browse all creators",
    influencerDetailMore: "More creators",
    influencerDetailFocusLabel: "Focus area:",
    exploreSectionTitle: "Explore trips by city",
    exploreSectionSubtitle:
      "Jump into a ready-made travel guide or follow a creator-inspired travel style.",
    exploreCitiesTitle: "Popular city guides",
    exploreInfluencersTitle: "Influencer styles",
    exploreCitiesCta: "View all cities →",
    exploreInfluencersCta: "View all creators →",
  },
  es: {
    homeMetaTitle: "Kruno - Planificador de viajes inteligente",
    homeMetaDescription:
      "Planifica viajes personalizados con Kruno. Crea itinerarios, descubre lugares y viaja con confianza.",
    citiesMetaTitle: "Guías de viaje por ciudad – Kruno",
    citiesMetaDescription:
      "Explora guías de viaje inteligentes por ciudad de Kruno.",
    influencersMetaTitle: "Guías de influencers – Kruno",
    influencersMetaDescription:
      "Descubre guías de viaje creadas por influencers y creadores en Kruno.",
    discoverMetaTitle: "Descubre Kruno – Planificador de viajes inteligente",
    discoverMetaDescription:
      "Crea un plan de viaje claro en minutos con el planificador de Kruno.",
    citiesHubTitle: "Guías de viaje por ciudad",
    citiesHubSubtitle:
      "Elige una ciudad para explorar una guía de viaje lista y planificar más rápido con Kruno.",
    cityCardCta: "Ver guía →",
    influencersHubTitle: "Guías de influencers",
    influencersHubSubtitle:
      "Estilos y guías seleccionadas por creadores en los que puedes confiar.",
    influencerCardCta: "Ver perfil →",
    cityDetailHighlightsTitle: "Principales destacados",
    cityDetailPlanTitle: "Planifica este viaje en Kruno",
    cityDetailPlanBody:
      "Convierte esta guía en un plan personalizado con fechas, preferencias y recomendaciones inteligentes.",
    cityDetailPlanCta: "Empezar a planificar",
    cityDetailBrowseAll: "Ver todas las ciudades",
    cityDetailExploreMore: "Explora más ciudades",
    influencerDetailPlanTitle: "Planifica un viaje con este estilo",
    influencerDetailPlanBody:
      "Usa este estilo inspirado en creadores para crear una guía de viaje con el planificador de Kruno.",
    influencerDetailPlanCta: "Empezar a planificar",
    influencerDetailBrowseAll: "Ver todos los creadores",
    influencerDetailMore: "Más creadores",
    influencerDetailFocusLabel: "Área de enfoque:",
    exploreSectionTitle: "Explora viajes por ciudad",
    exploreSectionSubtitle:
      "Accede a una guía de viaje lista o sigue un estilo de viaje inspirado en creadores.",
    exploreCitiesTitle: "Guías de ciudades populares",
    exploreInfluencersTitle: "Estilos de influencers",
    exploreCitiesCta: "Ver todas las ciudades →",
    exploreInfluencersCta: "Ver todos los creadores →",
  },
};

export function getMarketingCopy(locale: MarketingLocale): MarketingCopy {
  return marketingCopy[locale];
}
