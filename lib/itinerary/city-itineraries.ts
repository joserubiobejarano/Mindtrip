import type { ItineraryLocale } from "@/lib/i18n/itinerary";

export type DayPlan = {
  day: number;
  title: string;
  summary: string;
  morning: string;
  afternoon: string;
  evening: string;
};

export type LogisticsItem = {
  label: string;
  value: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type RelatedItinerary = {
  slug: string;
  city: string;
  days: number;
  description: string;
};

export type CityItinerary = {
  slug: string;
  city: string;
  country: string;
  days: number;
  pace: string;
  idealFor: string[];
  style: string[];
  pacing?: string[];
  hero: {
    title: string;
    subtitle: string;
    eyebrow?: string;
    image?: {
      src: string;
      alt: string;
    };
  };
  cityStats?: Array<{
    value: string;
    label: string;
  }>;
  fit: {
    forYou: string[];
    notForYou: string[];
  };
  dayPlans: DayPlan[];
  imageInfoCards?: Array<{
    title: string;
    description: string;
    image: {
      src: string;
      alt: string;
    };
  }>;
  logistics: LogisticsItem[];
  goodToKnow?: LogisticsItem[];
  checklist: string[];
  faqs: FaqItem[];
  relatedItineraries: RelatedItinerary[];
  primaryCtaHref: string;
  secondaryCtaHref?: string;
};

const defaultPacingCopy: Record<ItineraryLocale, (city: string, days: number) => string[]> = {
  en: (city, days) => [
    `${city} is best enjoyed at a calm pace. Anchor each day with one headline sight, then leave room for long meals, small stops, and slow walks between neighborhoods.`,
    `Group your time by nearby districts to keep transit light. Pair adjacent areas so the flow feels smooth, then save one stretch for a focused museum or landmark day.`,
    `Build at least one open-ended afternoon into your ${days}-day plan for markets, cafes, or a sunset stroll that keeps the trip feeling relaxed.`,
  ],
  es: (city, days) => [
    `${city} se disfruta mejor con un ritmo tranquilo. Ancla cada día con un gran punto de interés y deja tiempo para comidas largas y paseos cortos entre barrios.`,
    `Agrupa el tiempo por zonas cercanas para moverte menos. Combina barrios vecinos para que el recorrido sea fluido y reserva un día más intenso para museos o monumentos.`,
    `Incluye al menos una tarde abierta en tu plan de ${days} días para mercados, cafés o un paseo al atardecer.`,
  ],
};

const defaultGoodToKnow: Record<ItineraryLocale, LogisticsItem[]> = {
  en: [
    { label: "Crowd timing", value: "Start by 8:30–9:00 for headline sights" },
    { label: "Seasonal notes", value: "Plan shade or indoor stops on hot afternoons" },
    { label: "Museum booking advice", value: "Reserve timed slots 1–2 weeks ahead in peak season" },
    { label: "Common mistakes", value: "Overbooking too many sights in one day" },
    { label: "Dress code", value: "Bring a light layer for church and basilica entry" },
  ],
  es: [
    { label: "Horario de multitudes", value: "Empieza a las 8:30–9:00 para los puntos clave" },
    { label: "Notas estacionales", value: "Busca sombra o interiores en las tardes calurosas" },
    { label: "Reservas de museos", value: "Reserva horarios 1–2 semanas antes en temporada alta" },
    { label: "Errores comunes", value: "Programar demasiados sitios en un solo día" },
    { label: "Código de vestimenta", value: "Lleva una capa ligera para iglesias y basílicas" },
  ],
};

const defaultFaqs: Record<
  ItineraryLocale,
  (city: string, days: number) => FaqItem[]
> = {
  en: (city, days) => [
    {
      question: `Is ${days} days enough for ${city}?`,
      answer:
        "Yes for the core highlights. Expect one major sight per day, short walks between neighborhoods, and enough breathing room for cafes, viewpoints, and unplanned local stops.",
    },
    {
      question: "Should I buy skip-the-line tickets?",
      answer:
        "Yes. Pre-book top attractions for timed entry, shorter waits, and a schedule that stays on track during busy travel periods.",
    },
    {
      question: "Do I need a transit pass?",
      answer:
        "Not necessarily. Most itineraries stay walkable, but a 24- or 48-hour pass helps on museum days, longer hops, or evening returns.",
    },
    {
      question: `Is ${city} walkable?`,
      answer:
        "Yes. The main sights cluster together, so most days work on foot with occasional transit for farther neighborhoods or late-night returns.",
    },
    {
      question: "Where should I stay?",
      answer:
        "Pick a central, walkable neighborhood for easy sightseeing and relaxed evenings. Look for areas with quick transit links if you plan longer day routes.",
    },
    {
      question: "What time should I start each day?",
      answer:
        "Plan for an early start on major sight days. Morning entry helps you beat crowds, then you can slow down with a long lunch and a relaxed afternoon.",
    },
    {
      question: "Do I need to book restaurants in advance?",
      answer:
        "For popular spots, yes—especially on weekends. Keep one or two reservations, then leave the rest flexible to follow neighborhood recommendations.",
    },
  ],
  es: (city, days) => [
    {
      question: `¿Son suficientes ${days} días en ${city}?`,
      answer:
        "Sí para lo esencial. Cuenta con un gran sitio al día, paseos cortos entre barrios y suficiente margen para cafés, miradores y paradas espontáneas.",
    },
    {
      question: "¿Debo comprar entradas sin fila?",
      answer:
        "Sí. Reserva las atracciones principales con horario para evitar esperas y mantener el plan sin retrasos en temporadas altas.",
    },
    {
      question: "¿Necesito un pase de transporte?",
      answer:
        "No siempre. La mayoría de rutas son caminables, pero un pase de 24 o 48 horas ayuda en días de museos o trayectos largos.",
    },
    {
      question: `¿${city} es caminable?`,
      answer:
        "Sí. Los puntos clave están relativamente cerca, así que puedes ir a pie la mayor parte del tiempo con algún trayecto puntual.",
    },
    {
      question: "¿Dónde me conviene alojarme?",
      answer:
        "Elige un barrio céntrico y caminable para estar cerca de los clásicos y tener noches tranquilas. Prioriza buenas conexiones si vas a moverte más.",
    },
    {
      question: "¿A qué hora debería empezar cada día?",
      answer:
        "Empieza temprano en los días de grandes atracciones. Entrar por la mañana reduce multitudes y te deja tardes más relajadas.",
    },
    {
      question: "¿Necesito reservar restaurantes con antelación?",
      answer:
        "Para lugares populares, sí—sobre todo en fines de semana. Reserva una o dos comidas y deja el resto flexible.",
    },
  ],
};

const extendFaqAnswer = (locale: ItineraryLocale, answer: string) => {
  const suffix =
    locale === "es"
      ? " Esto mantiene el ritmo relajado y deja margen para pausas."
      : " This keeps the pace relaxed and leaves room for breaks.";
  if (answer.endsWith(suffix)) {
    return answer;
  }
  const normalized = answer.endsWith(".") ? answer : `${answer}.`;
  return `${normalized}${suffix}`;
};

const normalizeFaqs = (
  locale: ItineraryLocale,
  city: string,
  days: number,
  items: FaqItem[]
) => {
  const defaults = defaultFaqs[locale](city, days);
  const existing = items.map((faq) => ({
    ...faq,
    answer: extendFaqAnswer(locale, faq.answer),
  }));
  const merged = [...existing];
  const existingQuestions = new Set(existing.map((faq) => faq.question));
  defaults.forEach((faq) => {
    if (merged.length >= 7) {
      return;
    }
    if (existingQuestions.has(faq.question)) {
      return;
    }
    merged.push({
      ...faq,
      answer: extendFaqAnswer(locale, faq.answer),
    });
  });
  return merged.slice(0, 7);
};

const withDefaults = (
  locale: ItineraryLocale,
  items: Record<string, CityItinerary>
): Record<string, CityItinerary> => {
  const buildPacing = defaultPacingCopy[locale];
  const goodToKnowItems = defaultGoodToKnow[locale];
  return Object.fromEntries(
    Object.entries(items).map(([slug, itinerary]) => [
      slug,
      {
        ...itinerary,
        pacing: itinerary.pacing ?? buildPacing(itinerary.city, itinerary.days),
        goodToKnow: itinerary.goodToKnow ?? goodToKnowItems,
        faqs: normalizeFaqs(locale, itinerary.city, itinerary.days, itinerary.faqs),
      },
    ])
  );
};

const cityItineraries: Record<ItineraryLocale, Record<string, CityItinerary>> = {
  en: withDefaults("en", {
    rome: {
      slug: "rome",
      city: "Rome",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Food-first travelers"],
      style: ["Classic sights", "Walkable neighborhoods", "Cafe breaks"],
      pacing: [
        "Rome rewards a calm rhythm. Treat each day like a focused chapter: anchor it with one headline sight, then leave room for long lunches, spontaneous piazza stops, and slow walks between landmarks.",
        "Group time by neighborhood to keep travel light. Pair the Centro Storico with nearby Monti for classic sights and evening aperitivo, then dedicate another day to the Vatican and Prati for museums and riverfront strolls.",
        "Save an unhurried afternoon for Trastevere or Testaccio, where the joy is in the smaller streets, local bakeries, and a relaxed dinner that stretches past sunset.",
      ],
      hero: {
        title: "Rome in 3 days",
        subtitle:
          "Hit the essentials with room to breathe, focusing on ancient icons, piazzas, and easy food stops.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1600&q=80",
          alt: "Warm golden light over Rome rooftops and domes at sunset.",
        },
      },
      cityStats: [
        { value: "2,700+", label: "Years of recorded history" },
        { value: "900+", label: "Churches and basilicas" },
        { value: "280", label: "Public fountains" },
        { value: "10M+", label: "Annual visitors" },
      ],
      fit: {
        forYou: ["A first trip with iconic landmarks", "A mix of history and cafes", "Short walking routes", "Flexible pace with time to relax", "Classic photo opportunities"],
        notForYou: ["A packed schedule of museums only", "Day trips outside the city", "Late-night nightlife focus", "Extremely detailed art tours", "Budget backpacker style"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Ancient Rome core",
          summary: "Colosseum, Forum, and sunset viewpoints.",
          morning: "Colosseum and Roman Forum",
          afternoon: "Capitoline Hill and Piazza Venezia",
          evening: "Monti dinner and a walk to the Colosseum",
        },
        {
          day: 2,
          title: "Vatican and river stroll",
          summary: "Museums, St. Peter's, and a Tiber walk.",
          morning: "Vatican Museums and Sistine Chapel",
          afternoon: "St. Peter's Basilica and Castel Sant'Angelo",
          evening: "Trastevere aperitivo and riverside stroll",
        },
        {
          day: 3,
          title: "Piazzas and food",
          summary: "Fountains, markets, and classic gelato stops.",
          morning: "Trevi Fountain, Spanish Steps, shopping streets",
          afternoon: "Piazza Navona and Campo de' Fiori",
          evening: "Gelato loop and sunset at Pincio Terrace",
        },
      ],
      imageInfoCards: [
        {
          title: "The grand piazzas",
          description:
            "Rome's public squares are outdoor living rooms. Expect fountains, morning espresso rituals, and a steady hum of conversation.",
          image: {
            src: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80",
            alt: "Crowd gathered around a grand Rome piazza fountain.",
          },
        },
        {
          title: "Layers of ancient history",
          description:
            "Streets stack centuries at once. A short walk can take you from imperial forums to baroque churches.",
          image: {
            src: "https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?auto=format&fit=crop&w=1200&q=80",
            alt: "View of the Roman Forum with ruins and columns.",
          },
        },
        {
          title: "Food-first neighborhoods",
          description:
            "Trastevere and Monti set the tone for long lunches, aperitivo hours, and unhurried evenings.",
          image: {
            src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
            alt: "Outdoor dining with pasta and wine on a Rome street.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Train to Termini or fixed-rate taxi" },
        { label: "Transit tips", value: "Walk core sights; use Metro for Vatican" },
        { label: "Ticketing", value: "Book Colosseum and Vatican in advance" },
        { label: "Neighborhood stay", value: "Centro Storico or Monti" },
      ],
      goodToKnow: [
        { label: "Crowd timing", value: "Start by 8:30–9:00 for the Colosseum and Vatican" },
        { label: "Seasonal notes", value: "Summer afternoons are hot; plan shade or indoor stops" },
        { label: "Museum booking advice", value: "Reserve timed slots 1–2 weeks ahead in peak season" },
        { label: "Common mistakes", value: "Overbooking too many sights in one day" },
        { label: "Dress code", value: "Bring a light layer for church and basilica entry" },
      ],
      checklist: [
        "Book Colosseum ticket window",
        "Reserve Vatican Museums slot",
        "Pack comfortable walking shoes",
        "Save offline maps for Rome",
        "Plan one slow cafe break daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Rome?",
          answer:
            "Yes for the core highlights. Expect one major sight per day, short walks between neighborhoods, and enough breathing room for cafes, viewpoints, and unplanned piazza time.",
        },
        {
          question: "Should I buy skip-the-line tickets?",
          answer:
            "Yes. Pre-book the Colosseum and Vatican for timed entry, shorter waits, and a schedule that stays on track even in peak season.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Not necessarily. The historic center is walkable, but a 24- or 48-hour pass helps on Vatican day, evening returns, and longer hops across the river.",
        },
        {
          question: "Is Rome walkable?",
          answer:
            "Yes. The core sights are close together, so most days work on foot with occasional Metro or bus rides for Vatican, Testaccio, or late-night returns.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Centro Storico keeps you central for classic sights and evening strolls, while Monti feels local and gives quick access to the Colosseum and Termini.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Plan for an early start on major sight days. Morning entry helps you beat crowds at the Colosseum or Vatican, then you can slow down with a long lunch and a relaxed afternoon.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular trattorias, yes—especially on weekends. Keep one or two reservations, then leave the rest flexible so you can follow neighborhood recommendations.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "rome-2-days": {
      slug: "rome-2-days",
      city: "Rome",
      country: "Italy",
      days: 2,
      pace: "Balanced",
      idealFor: ["Short breaks", "First-timers", "Walkers"],
      style: ["Iconic sights", "Compact routes", "Cafe pauses"],
      hero: {
        title: "Rome in 2 days",
        subtitle:
          "Cover the essentials with calm pacing, focusing on ancient landmarks, piazzas, and short walks.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1600&q=80",
          alt: "Warm golden light over Rome rooftops and domes at sunset.",
        },
      },
      fit: {
        forYou: ["A short visit focused on the core sights", "Easy walks with breaks", "A clear, simple plan", "First-time visitors to Rome", "Scenic viewpoints and piazzas"],
        notForYou: ["A deep museum-only travel guide", "Day trips outside Rome", "Late-night nightlife focus", "Extensive shopping time", "Off-the-beaten-path exploration"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Ancient Rome core",
          summary: "Colosseum, Forum, and a sunset viewpoint.",
          morning: "Colosseum and Roman Forum",
          afternoon: "Capitoline Hill and Piazza Venezia",
          evening: "Monti dinner and an easy Colosseum walk",
        },
        {
          day: 2,
          title: "Vatican and historic center",
          summary: "Vatican highlights and classic piazzas.",
          morning: "Vatican Museums and Sistine Chapel",
          afternoon: "St. Peter's Basilica and Castel Sant'Angelo",
          evening: "Piazza Navona loop and gelato stop",
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Train to Termini or fixed-rate taxi" },
        { label: "Transit tips", value: "Walk the center; Metro for Vatican day" },
        { label: "Ticketing", value: "Pre-book Colosseum and Vatican slots" },
        { label: "Neighborhood stay", value: "Centro Storico or Monti" },
      ],
      checklist: [
        "Book Colosseum tickets",
        "Reserve Vatican Museums entry",
        "Pack comfortable walking shoes",
        "Save offline maps for Rome",
        "Plan one slow cafe break daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Rome?",
          answer:
            "Yes for the essentials. This plan focuses on the main highlights with a walkable, realistic pace.",
        },
        {
          question: "Do I need advance tickets?",
          answer:
            "Yes. Pre-booking the Colosseum and Vatican keeps the schedule reliable and avoids long lines.",
        },
        {
          question: "Can I walk most places?",
          answer:
            "The center is very walkable. Use the Metro for the Vatican if you want to save time.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Centro Storico is central and convenient, while Monti is quieter and close to ancient sites.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    paris: {
      slug: "paris",
      city: "Paris",
      country: "France",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Museum fans", "Slow walkers"],
      style: ["Classic landmarks", "River strolls", "Neighborhood cafes"],
      hero: {
        title: "Paris in 3 days",
        subtitle:
          "See the essentials with short walks between sights, mixing museums with relaxed neighborhood time.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
          alt: "The Eiffel Tower viewed across Paris rooftops at golden hour.",
        },
      },
      cityStats: [
        { value: "37", label: "Bridges crossing the Seine" },
        { value: "20", label: "Arrondissements to explore" },
        { value: "130+", label: "Museums and galleries" },
        { value: "30M+", label: "Annual visitors" },
      ],
      fit: {
        forYou: ["A clear plan with breathing room", "A mix of art and city walks", "Simple metro hops", "World-class museum highlights", "Charming neighborhood strolls"],
        notForYou: ["Day trips outside the city", "A packed museum-only schedule", "Late-night nightlife focus", "Extensive wine tasting tours", "Adventure or hiking activities"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic core and the Seine",
          summary: "Louvre area, gardens, and a river walk.",
          morning: "Louvre exterior and Tuileries Garden",
          afternoon: "Seine walk to Pont Neuf and Ile de la Cite",
          evening: "Left Bank stroll and easy cafe stop",
        },
        {
          day: 2,
          title: "Eiffel and grand avenues",
          summary: "Eiffel Tower area and classic Paris streets.",
          morning: "Eiffel Tower and Champ de Mars",
          afternoon: "Invalides and a walk toward the Seine",
          evening: "Arc de Triomphe view at sunset",
        },
        {
          day: 3,
          title: "Montmartre and Le Marais",
          summary: "Hilltop views and calm neighborhood time.",
          morning: "Montmartre and Sacre-Coeur",
          afternoon: "Le Marais lanes and Place des Vosges",
          evening: "Canal Saint-Martin or a short Seine walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Riverfront rhythm",
          description:
            "The Seine stitches neighborhoods together. Expect gentle walks, frequent bridges, and a steady, unhurried pace.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "A calm Seine riverside path with stone bridges in the distance.",
          },
        },
        {
          title: "Museum mornings",
          description:
            "Paris rewards early starts. A focused museum visit in the morning leaves the rest of the day light and flexible.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Paris skyline with the Eiffel Tower rising above the city.",
          },
        },
        {
          title: "Neighborhood cafes",
          description:
            "Small squares and cafe terraces shape the day. Plan for one long pause rather than rushing between stops.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Outdoor cafe tables along a Paris street.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September to October" },
        { label: "Airport transfer", value: "RER B or fixed-rate taxi" },
        { label: "Transit tips", value: "Walk the center; use Metro for longer hops" },
        { label: "Ticketing", value: "Pre-book Eiffel Tower and Louvre time slots" },
        { label: "Neighborhood stay", value: "Le Marais or Saint-Germain" },
      ],
      checklist: [
        "Book Eiffel Tower entry time",
        "Reserve a Louvre window if visiting",
        "Pack a light layer for evenings",
        "Save offline metro map",
        "Plan one slow cafe break daily",
        "Carry a reusable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Paris?",
          answer:
            "Yes for the highlights. This plan prioritizes walkable areas and simple metro hops.",
        },
        {
          question: "Do I need museum reservations?",
          answer:
            "For the Louvre or popular exhibitions, yes. It saves time and keeps the day calm.",
        },
        {
          question: "Should I buy a transit pass?",
          answer:
            "A carnet or day pass works well if you plan multiple Metro rides each day.",
        },
        {
          question: "Which area is best to stay?",
          answer:
            "Le Marais and Saint-Germain are central, walkable, and easy to reach from major sights.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome-2-days",
          city: "Rome",
          days: 2,
          description: "A short, walkable plan focused on Rome's essentials.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    barcelona: {
      slug: "barcelona",
      city: "Barcelona",
      country: "Spain",
      days: 3,
      pace: "Balanced",
      idealFor: ["Architecture fans", "Beach walkers", "First-timers"],
      style: ["Gaudi highlights", "Neighborhood strolls", "Open-air time"],
      hero: {
        title: "Barcelona in 3 days",
        subtitle:
          "Blend Gaudi icons with walkable neighborhoods and a relaxed coastal rhythm.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBzYWdyYWRhJTIwZmFtaWxpYXxlbnwxfHx8fDE3NjQwNTU2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          alt: "Colorful rooftops and spires of Park Guell in Barcelona.",
        },
      },
      cityStats: [
        { value: "10", label: "Districts across the city" },
        { value: "4.5 km", label: "Urban beach coastline" },
        { value: "1.6M", label: "Residents in the city proper" },
        { value: "2,000+", label: "Years of recorded history" },
      ],
      fit: {
        forYou: ["A mix of architecture and easy walks", "Clear, simple days", "Time by the sea", "Gaudi masterpieces up close", "Mediterranean vibes and beaches"],
        notForYou: ["A packed museum schedule", "Late-night nightlife focus", "Day trips outside the city", "Mountain hiking excursions", "Heavy nightclub scene"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and the waterfront",
          summary: "Gothic Quarter lanes and a gentle beach walk.",
          morning: "Gothic Quarter and Barcelona Cathedral",
          afternoon: "El Born and Parc de la Ciutadella",
          evening: "Barceloneta promenade at sunset",
        },
        {
          day: 2,
          title: "Gaudi and Eixample",
          summary: "Major Gaudi sights with short, flat walks.",
          morning: "Sagrada Familia",
          afternoon: "Passeig de Gracia and modernist facades",
          evening: "Gracia neighborhood walk",
        },
        {
          day: 3,
          title: "Park views and calm neighborhoods",
          summary: "Park Guell and scenic city viewpoints.",
          morning: "Park Guell early entry",
          afternoon: "Montjuic gardens and viewpoints",
          evening: "Placa d'Espanya fountains and an easy stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Modernist city blocks",
          description:
            "Eixample's wide grid keeps walks easy. The modernist facades feel best in the softer morning light.",
          image: {
            src: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80",
            alt: "Modernist building facades along a Barcelona boulevard.",
          },
        },
        {
          title: "Old town lanes",
          description:
            "The Gothic Quarter and El Born are compact and layered. Expect short blocks and shaded streets.",
          image: {
            src: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow stone street in Barcelona's old town.",
          },
        },
        {
          title: "Coastal breathing room",
          description:
            "The waterfront offers a clear reset between big sights. A late-day walk keeps the rhythm calm.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Barcelona beach promenade near sunset.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Aerobus or train to Passeig de Gracia" },
        { label: "Transit tips", value: "Walk central areas; use Metro for longer hops" },
        { label: "Ticketing", value: "Book Sagrada Familia and Park Guell in advance" },
        { label: "Neighborhood stay", value: "Eixample or El Born" },
      ],
      checklist: [
        "Reserve Sagrada Familia time slot",
        "Book Park Guell entry window",
        "Pack sun protection and water",
        "Save offline city maps",
        "Plan one slow cafe break daily",
        "Wear comfortable walking shoes",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Barcelona?",
          answer:
            "Yes for the main highlights. This plan mixes major sights with simple neighborhood walks.",
        },
        {
          question: "Should I pre-book Gaudi tickets?",
          answer:
            "Yes. Sagrada Familia and Park Guell often sell out, so booking keeps the pace smooth.",
        },
        {
          question: "How walkable is the city?",
          answer:
            "The center is very walkable, with Metro rides for longer distances like Montjuic.",
        },
        {
          question: "Where is best to stay?",
          answer:
            "Eixample is central and convenient, while El Born is lively and close to the old town.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
        {
          slug: "rome-2-days",
          city: "Rome",
          days: 2,
          description: "A short, walkable plan focused on Rome's essentials.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    amsterdam: {
      slug: "amsterdam",
      city: "Amsterdam",
      country: "Netherlands",
      days: 3,
      pace: "Balanced",
      idealFor: ["Canal walkers", "Museum fans", "Relaxed travelers"],
      style: ["Canal ring strolls", "Museum mornings", "Cafe pauses"],
      hero: {
        title: "Amsterdam in 3 days",
        subtitle:
          "Keep it easy with canal walks, compact museum time, and a calm neighborhood rhythm.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
          alt: "Canal houses and a bridge reflected in Amsterdam water.",
        },
      },
      cityStats: [
        { value: "165", label: "Canals in the city" },
        { value: "1,500", label: "Bridges to cross" },
        { value: "50+", label: "Museums and galleries" },
        { value: "800k+", label: "Residents in the city" },
      ],
      fit: {
        forYou: ["A walkable city with short distances", "A mix of museums and parks", "Easy, quiet evenings", "Canal-side cafe culture", "Bike-friendly exploration"],
        notForYou: ["A packed schedule of tours", "Long day trips", "Late-night nightlife focus", "Beach or coastal activities", "Luxury shopping focus"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Canal ring and Jordaan",
          summary: "Historic canals and relaxed neighborhood streets.",
          morning: "Canal Ring walk and Nine Streets",
          afternoon: "Jordaan lanes and Anne Frank area exterior",
          evening: "Evening canal stroll and quiet squares",
        },
        {
          day: 2,
          title: "Museum District and park",
          summary: "A focused museum visit and time outdoors.",
          morning: "Rijksmuseum or Van Gogh Museum",
          afternoon: "Vondelpark and Museumplein",
          evening: "Leidseplein area walk",
        },
        {
          day: 3,
          title: "Local neighborhoods",
          summary: "Markets, canals, and low-key scenery.",
          morning: "De Pijp and Albert Cuyp Market",
          afternoon: "Amstel River walk and quiet canals",
          evening: "Eastern Docklands or canal-side sunset",
        },
      ],
      imageInfoCards: [
        {
          title: "Canal ring mornings",
          description:
            "Early hours are calm on the canals. Short loops keep the city feel intimate and unhurried.",
          image: {
            src: "https://images.unsplash.com/photo-1505843795480-5cfb3c03f6ff?auto=format&fit=crop&w=1200&q=80",
            alt: "Bicycles parked along a quiet Amsterdam canal.",
          },
        },
        {
          title: "Compact museum time",
          description:
            "Plan one main museum a day. The Museum District is concentrated, so transitions stay simple.",
          image: {
            src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
            alt: "Amsterdam museum building along a tree-lined street.",
          },
        },
        {
          title: "Neighborhood markets",
          description:
            "De Pijp and nearby streets add texture without heavy planning. A short market stop fits easily.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Outdoor market stalls in Amsterdam.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September" },
        { label: "Airport transfer", value: "Train to Centraal Station" },
        { label: "Transit tips", value: "Walk or tram; consider a bike if confident" },
        { label: "Ticketing", value: "Reserve museums and Anne Frank House early" },
        { label: "Neighborhood stay", value: "Canal Ring or Jordaan" },
      ],
      checklist: [
        "Book museum entry times",
        "Reserve Anne Frank House if visiting",
        "Pack a light rain layer",
        "Save offline canal maps",
        "Plan a daily park break",
        "Bring comfortable walking shoes",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Amsterdam?",
          answer:
            "Yes for the highlights. Distances are short and the city is easy to navigate on foot.",
        },
        {
          question: "Do I need to pre-book museums?",
          answer:
            "Yes for the major museums and Anne Frank House, which often sell out.",
        },
        {
          question: "Is biking required?",
          answer:
            "No. You can walk or use trams; biking is optional if you feel comfortable in traffic.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The Canal Ring and Jordaan are central and walkable with good transit access.",
        },
      ],
      relatedItineraries: [
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "rome-2-days",
          city: "Rome",
          days: 2,
          description: "A short, walkable plan focused on Rome's essentials.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    london: {
      slug: "london",
      city: "London",
      country: "United Kingdom",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Museum fans", "City walkers"],
      style: ["Iconic sights", "Riverside walks", "Neighborhood time"],
      hero: {
        title: "London in 3 days",
        subtitle:
          "Cover the essentials with short walks and easy transit, mixing landmarks with relaxed neighborhoods.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=1600&q=80",
          alt: "London skyline with the Thames and Tower Bridge.",
        },
      },
      cityStats: [
        { value: "32", label: "Boroughs across the city" },
        { value: "35+", label: "Bridges over the Thames" },
        { value: "170+", label: "Museums and galleries" },
        { value: "9M", label: "Residents in Greater London" },
      ],
      fit: {
        forYou: ["A clear plan with short transfers", "A mix of museums and landmarks", "Walkable river routes", "Historic royal attractions", "Diverse food scene sampling"],
        notForYou: ["Day trips outside London", "A packed schedule of shows", "Late-night nightlife focus", "Countryside escapes", "Budget hostel backpacking"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Westminster and the Thames",
          summary: "Parliament views and a calm river walk.",
          morning: "Westminster Abbey area and Big Ben",
          afternoon: "St. James's Park to Buckingham Palace",
          evening: "South Bank stroll and city views",
        },
        {
          day: 2,
          title: "City landmarks and markets",
          summary: "Historic streets with short, flat walks.",
          morning: "St. Paul's Cathedral exterior and Millennium Bridge",
          afternoon: "Tower of London area and Tower Bridge",
          evening: "Borough Market area walk and the Thames",
        },
        {
          day: 3,
          title: "Museums and classic neighborhoods",
          summary: "A focused museum visit and easy shopping streets.",
          morning: "British Museum",
          afternoon: "Bloomsbury squares and Covent Garden",
          evening: "Soho and Piccadilly Circus walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Riverside routes",
          description:
            "The Thames makes navigation easy. A riverside walk links major sights without constant Tube hops.",
          image: {
            src: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80",
            alt: "People walking along the South Bank beside the Thames.",
          },
        },
        {
          title: "Museum balance",
          description:
            "London's museums are dense and free. Keep visits focused so afternoons stay flexible.",
          image: {
            src: "https://images.unsplash.com/photo-1473959383414-b0b2d6b04504?auto=format&fit=crop&w=1200&q=80",
            alt: "A quiet museum hall with tall windows.",
          },
        },
        {
          title: "Neighborhood resets",
          description:
            "Short walks through squares and parks break up landmark days and keep the pace steady.",
          image: {
            src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
            alt: "London park path lined with trees.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September to October" },
        { label: "Airport transfer", value: "Train or Tube depending on airport" },
        { label: "Transit tips", value: "Use contactless or Oyster; walk central routes" },
        { label: "Ticketing", value: "Pre-book Tower of London if visiting" },
        { label: "Neighborhood stay", value: "Covent Garden or South Bank" },
      ],
      checklist: [
        "Bring a light rain layer",
        "Save an offline Tube map",
        "Pre-book Tower of London slot if needed",
        "Plan a daily park or river break",
        "Wear comfortable walking shoes",
        "Keep a transit card handy",
      ],
      faqs: [
        {
          question: "Is 3 days enough for London?",
          answer:
            "Yes for the highlights. This plan keeps transfers short and balances landmarks with walks.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Contactless payment or an Oyster card is the easiest option for buses and the Tube.",
        },
        {
          question: "Are museums free?",
          answer:
            "Many major museums are free, though some exhibitions require paid tickets.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Covent Garden and South Bank are central, walkable, and well connected by transit.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canal walks, museums, and relaxed neighborhoods.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    lisbon: {
      slug: "lisbon",
      city: "Lisbon",
      country: "Portugal",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Viewpoint lovers", "Slow walkers"],
      style: ["Hillside neighborhoods", "Riverside walks", "Tram rides"],
      hero: {
        title: "Lisbon in 3 days",
        subtitle:
          "Move through the historic hills with time for viewpoints, river walks, and quiet neighborhood breaks.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1645976442485-82a2d110fc07?auto=format&fit=crop&w=1600&q=80",
          alt: "Lisbon rooftops stacked along a sunny hillside.",
        },
      },
      cityStats: [
        { value: "7", label: "Hills shaping the city" },
        { value: "20+", label: "Viewpoints and miradouros" },
        { value: "550k", label: "Residents in the city" },
        { value: "2,900+", label: "Sunny hours each year" },
      ],
      fit: {
        forYou: [
          "A calm first trip with short walks",
          "Hilltop views balanced with river paths",
          "Neighborhoods with slow cafe breaks",
          "A mix of history and local street life",
          "Flexible days with light transit",
        ],
        notForYou: [
          "A packed schedule of long museum days",
          "Day trips outside the city",
          "Late-night nightlife focus",
          "Flat, step-free routes only",
          "Luxury shopping as the main goal",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Baixa and Alfama",
          summary: "Core plazas, riverside squares, and hilltop lanes.",
          morning: "Baixa grid and Praca do Comercio",
          afternoon: "Alfama lanes and Sao Jorge Castle exterior",
          evening: "Miradouro sunset and a short tram ride",
        },
        {
          day: 2,
          title: "Belem by the river",
          summary: "Waterfront monuments with a relaxed pace.",
          morning: "Belem waterfront and tower exterior",
          afternoon: "Jeronimos Monastery area and gardens",
          evening: "Riverside stroll back toward the center",
        },
        {
          day: 3,
          title: "Chiado and Bairro Alto",
          summary: "Elegant streets, small squares, and easy views.",
          morning: "Chiado streets and nearby viewpoints",
          afternoon: "Bairro Alto and Principe Real gardens",
          evening: "Cais do Sodre riverfront walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Hillside viewpoints",
          description:
            "Short climbs unlock wide views. Plan one or two miradouros a day and keep the rest easy.",
          image: {
            src: "https://images.unsplash.com/photo-1637070749375-737c684fae02?auto=format&fit=crop&w=1200&q=80",
            alt: "Lisbon skyline with a bridge in the distance.",
          },
        },
        {
          title: "Tile-lined streets",
          description:
            "Historic facades and tiled walls add texture. The best routes are the slower, shaded lanes.",
          image: {
            src: "https://images.unsplash.com/photo-1501415201023-2f45fbcefac0?auto=format&fit=crop&w=1200&q=80",
            alt: "A tiled tower rising above Lisbon buildings.",
          },
        },
        {
          title: "Riverside breathing room",
          description:
            "The Tagus waterfront is flat and open, perfect for an unhurried evening walk.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Cobblestone street in a traditional Lisbon neighborhood.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "March to June or September to October" },
        { label: "Airport transfer", value: "Metro or taxi to the center" },
        { label: "Transit tips", value: "Use trams and funiculars for hills" },
        { label: "Ticketing", value: "Book Jeronimos or Belem Tower if entering" },
        { label: "Neighborhood stay", value: "Baixa, Chiado, or Alfama" },
      ],
      checklist: [
        "Wear comfortable shoes for hills",
        "Reserve Jeronimos entry if visiting",
        "Pack a light layer for the river breeze",
        "Save offline city maps",
        "Plan one slow cafe break daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Lisbon?",
          answer:
            "Yes for the highlights. This plan keeps distances short and balances hills with flat river walks.",
        },
        {
          question: "Is Lisbon walkable?",
          answer:
            "Yes, but expect hills. Short routes and tram rides make the days comfortable.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Not essential. A few tram or metro rides help with hills and longer transfers.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Baixa and Chiado keep you central, while Alfama is quieter with historic charm.",
        },
      ],
      relatedItineraries: [
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi highlights, walkable neighborhoods, and seaside time.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and calm cafe breaks.",
        },
        {
          slug: "rome-2-days",
          city: "Rome",
          days: 2,
          description: "A short, walkable plan focused on Rome's essentials.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    prague: {
      slug: "prague",
      city: "Prague",
      country: "Czech Republic",
      days: 3,
      pace: "Balanced",
      idealFor: ["Architecture fans", "First-timers", "City walkers"],
      style: ["Historic squares", "River crossings", "Compact days"],
      hero: {
        title: "Prague in 3 days",
        subtitle:
          "Follow the historic core, castle viewpoints, and gentle river walks with a calm, realistic pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1748633212968-7bf42d82ec79?auto=format&fit=crop&w=1600&q=80",
          alt: "Prague Castle rising above the river and rooftops.",
        },
      },
      cityStats: [
        { value: "1,100+", label: "Years of recorded history" },
        { value: "18", label: "Bridges over the Vltava" },
        { value: "100+", label: "Towers and spires" },
        { value: "1.3M", label: "Residents in the city" },
      ],
      fit: {
        forYou: [
          "Historic architecture with short walks",
          "A compact city that rewards slow pacing",
          "Riverside strolls between big sights",
          "Balanced days with time to pause",
          "Clear routes without long transfers",
        ],
        notForYou: [
          "Day trips outside the city",
          "Late-night nightlife focus",
          "A heavy museum-only schedule",
          "Long hikes or countryside escapes",
          "A packed list of ticketed tours",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town and Charles Bridge",
          summary: "Classic squares and easy river crossings.",
          morning: "Old Town Square and Astronomical Clock",
          afternoon: "Charles Bridge and Mala Strana lanes",
          evening: "Riverside walk at sunset",
        },
        {
          day: 2,
          title: "Castle district",
          summary: "Hilltop views and historic courtyards.",
          morning: "Prague Castle complex exterior",
          afternoon: "St. Vitus Cathedral area and gardens",
          evening: "Quiet Lesser Town streets",
        },
        {
          day: 3,
          title: "New Town and parks",
          summary: "Broader avenues with green breaks.",
          morning: "Wenceslas Square and nearby passages",
          afternoon: "Vltava riverfront and Letna Park",
          evening: "Vinohrady neighborhood stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Stone bridge mornings",
          description:
            "Early crossings are calm and clear. A short loop over the river keeps the day grounded.",
          image: {
            src: "https://images.unsplash.com/photo-1668944102700-96d55a7cb878?auto=format&fit=crop&w=1200&q=80",
            alt: "Charles Bridge with historic buildings beyond.",
          },
        },
        {
          title: "Castle hill views",
          description:
            "The castle district sits above the river. Plan a slow climb and a longer pause at the top.",
          image: {
            src: "https://images.unsplash.com/photo-1746389442067-a257ad864c10?auto=format&fit=crop&w=1200&q=80",
            alt: "Prague rooftops seen from a high viewpoint.",
          },
        },
        {
          title: "Riverside green space",
          description:
            "Parks along the Vltava add breathing room and help balance the stone streets.",
          image: {
            src: "https://images.unsplash.com/photo-1761865843087-1b58df6c7a1a?auto=format&fit=crop&w=1200&q=80",
            alt: "Bridge over the Vltava with Prague skyline.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September to October" },
        { label: "Airport transfer", value: "Bus plus Metro or taxi" },
        { label: "Transit tips", value: "Walk the core; trams help for the castle" },
        { label: "Ticketing", value: "Book castle entries if visiting interiors" },
        { label: "Neighborhood stay", value: "Old Town or Mala Strana" },
      ],
      checklist: [
        "Book a castle entry slot if needed",
        "Pack a light layer for evening walks",
        "Wear comfortable walking shoes",
        "Save offline city and tram maps",
        "Plan a slow riverside pause daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Prague?",
          answer:
            "Yes for the main highlights. The city is compact, so short walks cover the core areas.",
        },
        {
          question: "Do I need to use trams?",
          answer:
            "Not for the center. Trams help with the castle hill or longer transfers.",
        },
        {
          question: "Should I pre-book castle tickets?",
          answer:
            "If you want interiors, yes. It keeps the day calm and avoids lines.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Old Town is central and walkable, while Mala Strana is quieter with scenic views.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Grand avenues, classic museums, and relaxed parks.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube views, historic hills, and thermal baths.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Landmarks, museums, and easy river walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    vienna: {
      slug: "vienna",
      city: "Vienna",
      country: "Austria",
      days: 3,
      pace: "Balanced",
      idealFor: ["Museum fans", "First-timers", "Slow walkers"],
      style: ["Imperial sights", "Park pauses", "Easy transit"],
      hero: {
        title: "Vienna in 3 days",
        subtitle:
          "Pair grand avenues with calm museum mornings, palace gardens, and easy tram connections.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1646491311728-f4a676e5f17d?auto=format&fit=crop&w=1600&q=80",
          alt: "St. Stephen's Cathedral rising above Vienna rooftops.",
        },
      },
      cityStats: [
        { value: "23", label: "Districts across the city" },
        { value: "2M", label: "Residents in the metro area" },
        { value: "60+", label: "Museums and galleries" },
        { value: "280+", label: "Parks and gardens" },
      ],
      fit: {
        forYou: [
          "Classic sights with short transfers",
          "Museum time balanced with outdoor breaks",
          "Elegant streets and quiet courtyards",
          "A clear plan with tram support",
          "Historic architecture and city views",
        ],
        notForYou: [
          "Day trips outside Vienna",
          "Late-night nightlife focus",
          "A packed schedule of ticketed tours",
          "Mountain or lake excursions",
          "Long hikes and adventure activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center and Ringstrasse",
          summary: "Cathedral views and the classic city loop.",
          morning: "St. Stephen's Cathedral area and Graben",
          afternoon: "Hofburg and Heldenplatz",
          evening: "Ringstrasse walk and evening lights",
        },
        {
          day: 2,
          title: "Museums and gardens",
          summary: "Focused museum time with green breaks.",
          morning: "MuseumsQuartier or Kunsthistorisches",
          afternoon: "Maria-Theresien-Platz and Burggarten",
          evening: "Naschmarkt area stroll",
        },
        {
          day: 3,
          title: "Palaces and viewpoints",
          summary: "Grand palace grounds with calm pacing.",
          morning: "Schonbrunn Palace gardens",
          afternoon: "Belvedere exterior and palace grounds",
          evening: "Danube Canal walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Grand boulevards",
          description:
            "The Ringstrasse links major sights. A slow loop keeps the day simple and scenic.",
          image: {
            src: "https://images.unsplash.com/photo-1555242354-90933d7da551?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic Vienna building along a wide boulevard.",
          },
        },
        {
          title: "City skyline views",
          description:
            "Short climbs reveal rooftops and church towers, adding contrast to museum-heavy days.",
          image: {
            src: "https://images.unsplash.com/photo-1743784083194-b8b601dc8526?auto=format&fit=crop&w=1200&q=80",
            alt: "Vienna skyline with church towers from above.",
          },
        },
        {
          title: "Clock towers and streets",
          description:
            "Ornate facades and narrow lanes give the center its character. A late walk feels calm.",
          image: {
            src: "https://images.unsplash.com/photo-1664296130464-c7a1f9a9ef85?auto=format&fit=crop&w=1200&q=80",
            alt: "Vienna street lined with historic buildings and a clock tower.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "City Airport Train or Railjet" },
        { label: "Transit tips", value: "Walk the center; trams for longer hops" },
        { label: "Ticketing", value: "Reserve major museums or Schonbrunn" },
        { label: "Neighborhood stay", value: "Innere Stadt or Leopoldstadt" },
      ],
      checklist: [
        "Reserve museum time slots if visiting",
        "Pack a light layer for evenings",
        "Wear comfortable walking shoes",
        "Save offline tram and U-Bahn maps",
        "Plan a daily park pause",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Vienna?",
          answer:
            "Yes for the main highlights. This plan balances museums with walks and garden time.",
        },
        {
          question: "Do I need to book museums?",
          answer:
            "For popular museums or Schonbrunn, booking helps keep the day on track.",
        },
        {
          question: "Is the city walkable?",
          answer:
            "The center is very walkable, and trams make longer routes simple.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Innere Stadt is central, while Leopoldstadt offers quieter streets with easy transit.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Historic squares, castle views, and river walks.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube viewpoints, thermal baths, and easy pacing.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Landmarks, museums, and calm neighborhood time.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    budapest: {
      slug: "budapest",
      city: "Budapest",
      country: "Hungary",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "River walkers", "Slow travelers"],
      style: ["Danube viewpoints", "Historic hills", "Thermal breaks"],
      hero: {
        title: "Budapest in 3 days",
        subtitle:
          "Balance the Buda hills with Pest boulevards, riverside views, and time for thermal baths.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1664289496602-378f6e666f7e?auto=format&fit=crop&w=1600&q=80",
          alt: "Hungarian Parliament building across the Danube.",
        },
      },
      cityStats: [
        { value: "2", label: "City sides: Buda and Pest" },
        { value: "23", label: "Districts across the city" },
        { value: "1.7M", label: "Residents in the city" },
        { value: "100+", label: "Thermal springs" },
      ],
      fit: {
        forYou: [
          "Riverfront walks with easy views",
          "A mix of hills and flat boulevards",
          "Thermal baths as a slow reset",
          "Short transfers between main areas",
          "Classic architecture and skyline shots",
        ],
        notForYou: [
          "A packed schedule of nightlife",
          "Day trips outside the city",
          "Long hiking excursions",
          "Museum-only travel plans",
          "A fast, checklist-style trip",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Pest core and the Danube",
          summary: "Parliament views and a gentle river stroll.",
          morning: "Parliament exterior and Kossuth Square",
          afternoon: "Danube promenade and Chain Bridge crossing",
          evening: "Riverside sunset walk",
        },
        {
          day: 2,
          title: "Buda hills",
          summary: "Castle district views with calm pacing.",
          morning: "Buda Castle courtyards",
          afternoon: "Fisherman's Bastion and Matthias Church exterior",
          evening: "Gellert Hill viewpoints",
        },
        {
          day: 3,
          title: "Baths and city boulevards",
          summary: "Thermal time and leafy avenues.",
          morning: "Szechenyi Baths or a shorter thermal visit",
          afternoon: "City Park and Andrassy Avenue walk",
          evening: "Jewish Quarter neighborhood stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Parliament skyline",
          description:
            "The river bends frame the Parliament perfectly. Plan one long walk along the Danube.",
          image: {
            src: "https://images.unsplash.com/photo-1744642774961-4a4d2cd588a3?auto=format&fit=crop&w=1200&q=80",
            alt: "Hungarian Parliament building beside the Danube.",
          },
        },
        {
          title: "Bridges after dusk",
          description:
            "Budapest lights up early. A slow evening crossing adds an easy highlight.",
          image: {
            src: "https://images.unsplash.com/photo-1740333863042-11ae1f783090?auto=format&fit=crop&w=1200&q=80",
            alt: "Illuminated bridge and Parliament building at night.",
          },
        },
        {
          title: "Danube crossings",
          description:
            "Short bridge walks connect Buda and Pest and keep the day flowing without long rides.",
          image: {
            src: "https://images.unsplash.com/photo-1648584271420-a77d6b2eb2b9?auto=format&fit=crop&w=1200&q=80",
            alt: "Bridge over the Danube with Budapest skyline.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Airport bus to Deak Ferenc ter" },
        { label: "Transit tips", value: "Walk the river; use Metro for longer hops" },
        { label: "Ticketing", value: "Book thermal bath time if visiting" },
        { label: "Neighborhood stay", value: "District V or near the Danube" },
      ],
      checklist: [
        "Reserve thermal bath entry if needed",
        "Pack a swimsuit and light towel",
        "Bring a light layer for evenings",
        "Save offline Metro and tram maps",
        "Plan one slow riverside break daily",
        "Wear comfortable walking shoes",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Budapest?",
          answer:
            "Yes for the main highlights. This plan balances the two sides of the city with short transfers.",
        },
        {
          question: "Do I need to book a thermal bath?",
          answer:
            "Popular baths can get busy, so booking helps keep the schedule calm.",
        },
        {
          question: "Is the city walkable?",
          answer:
            "The riverfront and central districts are walkable, with Metro rides for longer distances.",
        },
        {
          question: "Where should I stay?",
          answer:
            "District V is central and walkable, while areas near the Danube stay scenic and calm.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Grand avenues, museum mornings, and park pauses.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Historic squares, castle views, and river walks.",
        },
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks, piazzas, and easy cafe breaks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    berlin: {
      slug: "berlin",
      city: "Berlín",
      country: "Germany",
      days: 3,
      pace: "Balanced",
      idealFor: ["History buffs", "Culture seekers", "Neighborhood explorers"],
      style: ["Iconic memorials", "Creative districts", "Easy transit"],
      hero: {
        title: "Berlin in 3 days",
        subtitle:
          "Mix landmark history with gallery time, leafy parks, and relaxed neighborhood walks.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80",
          alt: "Berlin boulevard with historic buildings and soft light.",
        },
      },
      cityStats: [
        { value: "12", label: "Districts across the city" },
        { value: "180+", label: "Museums and galleries" },
        { value: "2", label: "Rivers: Spree and Havel" },
        { value: "70+", label: "Parks and green spaces" },
      ],
      fit: {
        forYou: [
          "History with calm museum breaks",
          "Neighborhood walks and local cafes",
          "A mix of landmarks and street culture",
          "Easy metro hops between districts",
          "Late afternoons in parks",
        ],
        notForYou: [
          "A nightlife-heavy schedule",
          "Fast-paced, checklist touring",
          "Long day trips outside the city",
          "Museum marathons without breaks",
          "Only modern art and clubs",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic core and Mitte",
          summary: "Brandenburg Gate, memorials, and classic boulevards.",
          morning: "Brandenburg Gate and Reichstag exterior",
          afternoon: "Holocaust Memorial and Tiergarten stroll",
          evening: "Unter den Linden and Museum Island riverfront",
        },
        {
          day: 2,
          title: "East Berlin neighborhoods",
          summary: "Creative streets, canals, and local cafes.",
          morning: "East Side Gallery and Oberbaum Bridge",
          afternoon: "Kreuzberg canals and market stops",
          evening: "Prenzlauer Berg dinner and neighborhood walk",
        },
        {
          day: 3,
          title: "Museums and palaces",
          summary: "Gallery time with quiet garden breaks.",
          morning: "Museum Island highlights",
          afternoon: "Charlottenburg Palace gardens",
          evening: "Savignyplatz cafe stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Monuments and memory",
          description:
            "Berlin's landmarks sit close together, so you can explore the historic core on foot.",
          image: {
            src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
            alt: "Wide Berlin boulevard with historic buildings.",
          },
        },
        {
          title: "Creative neighborhoods",
          description:
            "Colorful streets, street art, and cafes make the east side feel lively but relaxed.",
          image: {
            src: "https://images.unsplash.com/photo-1495069785877-7c5485000a68?auto=format&fit=crop&w=1200&q=80",
            alt: "Berlin street art mural on a city wall.",
          },
        },
        {
          title: "Park pauses",
          description:
            "Tiergarten and the canal paths offer easy breaks between museum visits.",
          image: {
            src: "https://images.unsplash.com/photo-1516900557543-41557bfc7ef7?auto=format&fit=crop&w=1200&q=80",
            alt: "Tree-lined path in a Berlin park.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "FEX train to Hauptbahnhof or Mitte" },
        { label: "Transit tips", value: "U-Bahn and S-Bahn cover most stops" },
        { label: "Ticketing", value: "Book Reichstag dome slots in advance" },
        { label: "Neighborhood stay", value: "Mitte or Prenzlauer Berg" },
      ],
      checklist: [
        "Reserve Reichstag dome entry",
        "Save an offline BVG transit map",
        "Pack a light layer for evenings",
        "Plan one museum block per day",
        "Bring comfortable walking shoes",
        "Leave time for a canal-side cafe",
      ],
      faqs: [
        {
          question: "Is Berlin good for a first-time visit?",
          answer:
            "Yes. The main landmarks are spread across a few easy districts, and transit makes short hops simple.",
        },
        {
          question: "Which museums should I prioritize?",
          answer:
            "Start with Museum Island, then add one focused museum that matches your interests to keep the pace light.",
        },
        {
          question: "Do I need to visit the wall sites?",
          answer:
            "The East Side Gallery is the easiest stop, and a short visit gives helpful context without taking a full day.",
        },
        {
          question: "Is Berlin bike-friendly?",
          answer:
            "Yes. Dedicated lanes and flat terrain make biking easy, especially for park routes and canal paths.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Historic squares, castle views, and river walks.",
        },
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Grand avenues, museum mornings, and park pauses.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    florence: {
      slug: "florence",
      city: "Florence",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["Art lovers", "Slow walkers", "First-timers in Italy"],
      style: ["Renaissance sights", "River strolls", "Cafe pauses"],
      hero: {
        title: "Florence in 3 days",
        subtitle:
          "Pair landmark art with river walks, lively squares, and easy afternoons in the hills.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Florence_skyline.jpg",
          alt: "Florence skyline with the Duomo rising above the city.",
        },
      },
      cityStats: [
        { value: "1", label: "Walkable historic center" },
        { value: "70+", label: "Museums and galleries" },
        { value: "2", label: "Banks of the Arno River" },
        { value: "600+", label: "Years of Renaissance heritage" },
      ],
      fit: {
        forYou: [
          "Art highlights with breaks in between",
          "Compact neighborhoods and easy walks",
          "Golden-hour viewpoints",
          "Cafe culture and markets",
          "A relaxed pace with time to linger",
        ],
        notForYou: [
          "A packed schedule of day trips",
          "Late-night nightlife focus",
          "Long hikes outside the city",
          "A museum-only marathon",
          "Fast-paced sightseeing",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Duomo and central Florence",
          summary: "Cathedral sights with historic squares.",
          morning: "Duomo complex and Piazza del Duomo",
          afternoon: "Piazza della Signoria and Palazzo Vecchio exterior",
          evening: "Ponte Vecchio stroll at sunset",
        },
        {
          day: 2,
          title: "Art and the Arno",
          summary: "Gallery time balanced with river views.",
          morning: "Uffizi Gallery highlights",
          afternoon: "Oltrarno workshops and Santo Spirito",
          evening: "Arno riverside walk",
        },
        {
          day: 3,
          title: "Gardens and viewpoints",
          summary: "Green spaces with scenic overlooks.",
          morning: "Boboli Gardens",
          afternoon: "Pitti Palace exterior and nearby cafes",
          evening: "Piazzale Michelangelo sunset",
        },
      ],
      imageInfoCards: [
        {
          title: "Renaissance squares",
          description:
            "Short walks connect Florence's main plazas, keeping each day compact and calm.",
          image: {
            src: "https://images.unsplash.com/photo-1501084817091-a4f3d1a11f8e?auto=format&fit=crop&w=1200&q=80",
            alt: "Florence square with historic architecture and cafes.",
          },
        },
        {
          title: "Arno river light",
          description:
            "The river adds soft light to your afternoons. Plan one long stroll along the banks.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Arno River with historic bridges in Florence.",
          },
        },
        {
          title: "Hillside views",
          description:
            "A gentle climb to a city viewpoint breaks up museum time and adds open air.",
          image: {
            src: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
            alt: "View over Florence rooftops from a hillside lookout.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Tram from Florence Airport to the center" },
        { label: "Transit tips", value: "Most sights are walkable in the historic core" },
        { label: "Ticketing", value: "Book Uffizi and Accademia timed entry" },
        { label: "Neighborhood stay", value: "Duomo area or Oltrarno" },
      ],
      checklist: [
        "Reserve Uffizi or Accademia tickets",
        "Pack comfortable walking shoes",
        "Save offline maps for the historic center",
        "Plan one long cafe break daily",
        "Bring a light layer for evenings",
        "Leave time for a sunset viewpoint",
      ],
      faqs: [
        {
          question: "Is Florence walkable?",
          answer:
            "Yes. The historic center is compact, so most days work on foot with short, scenic routes.",
        },
        {
          question: "Do I need to pre-book art museums?",
          answer:
            "Yes for the Uffizi and Accademia. Timed entry keeps the day calm and avoids long queues.",
        },
        {
          question: "Should I visit the hills above the city?",
          answer:
            "A short climb to Piazzale Michelangelo is worth it for sunset views and a quieter break.",
        },
        {
          question: "Is two museums in one day too much?",
          answer:
            "It can be. Pair one major museum with an outdoor afternoon to keep your pace relaxed.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks, piazzas, and easy cafe breaks.",
        },
        {
          slug: "venice",
          city: "Venice",
          days: 3,
          description: "Canal walks, classic churches, and island time.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    venice: {
      slug: "venice",
      city: "Venice",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["Romantic breaks", "Slow travelers", "Photo lovers"],
      style: ["Canal strolls", "Historic churches", "Island hopping"],
      hero: {
        title: "Venice in 3 days",
        subtitle:
          "Slow down with canal walks, quiet campos, and easy day trips to nearby islands.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Venice_Grand_Canal.jpg",
          alt: "Grand Canal in Venice with historic facades.",
        },
      },
      cityStats: [
        { value: "118", label: "Islands across the lagoon" },
        { value: "400+", label: "Bridges in the historic center" },
        { value: "170+", label: "Canals in the city" },
        { value: "25+", label: "Museums and galleries" },
      ],
      fit: {
        forYou: [
          "Slow walks with constant views",
          "Small museums and churches",
          "Cafe breaks by the canals",
          "Photo-friendly routes",
          "Gentle island day trips",
        ],
        notForYou: [
          "Fast-paced sightseeing",
          "Long drives or car travel",
          "Late-night nightlife focus",
          "Packed museum schedules",
          "Large group tours only",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "St. Mark's and the Grand Canal",
          summary: "The classic center with iconic views.",
          morning: "St. Mark's Square and Basilica exterior",
          afternoon: "Doge's Palace exterior and waterfront walk",
          evening: "Grand Canal promenade at golden hour",
        },
        {
          day: 2,
          title: "Cannaregio and local lanes",
          summary: "Quieter neighborhoods and canalside cafes.",
          morning: "Cannaregio canals and Jewish Ghetto",
          afternoon: "Rialto Market and bridge views",
          evening: "Dorsoduro aperitivo and canal walk",
        },
        {
          day: 3,
          title: "Lagoon islands",
          summary: "Glassmaking and colorful waterfront streets.",
          morning: "Murano glass workshops",
          afternoon: "Burano island stroll",
          evening: "Back to Venice for a final canal walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Canal-side light",
          description:
            "The best views arrive on foot. Plan time for slow bridges and quiet lanes.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Venice canal lined with pastel buildings.",
          },
        },
        {
          title: "Hidden squares",
          description:
            "Small campos offer a quieter side of Venice with cafes and local life.",
          image: {
            src: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=80",
            alt: "Quiet Venice square with cafes and historic buildings.",
          },
        },
        {
          title: "Lagoon colors",
          description:
            "A short vaporetto ride brings bright houses and slower island rhythms.",
          image: {
            src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
            alt: "Colorful waterfront houses in the Venice lagoon.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Alilaguna boat or water taxi" },
        { label: "Transit tips", value: "Walk most routes; vaporetto for longer hops" },
        { label: "Ticketing", value: "Book Basilica or Doge's Palace entry" },
        { label: "Neighborhood stay", value: "San Marco or Dorsoduro" },
      ],
      checklist: [
        "Pack comfortable walking shoes",
        "Buy a vaporetto pass if hopping islands",
        "Reserve Basilica or palace tickets",
        "Bring a light layer for canal breezes",
        "Plan early mornings for quieter lanes",
        "Keep space for a slow canal dinner",
      ],
      faqs: [
        {
          question: "Is Venice easy to navigate?",
          answer:
            "Yes with a map. Streets are narrow and winding, so plan a few anchor sights and explore slowly.",
        },
        {
          question: "Should I visit Murano and Burano?",
          answer:
            "If you have a full third day, the islands add color and a calmer pace beyond the main canals.",
        },
        {
          question: "Do I need to book gondola rides?",
          answer:
            "Not required. Most travelers enjoy the public vaporetto and a short walk along the canals.",
        },
        {
          question: "Is Venice crowded all day?",
          answer:
            "Mornings and evenings are quieter. Start early and linger in calmer neighborhoods later in the day.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florence",
          days: 3,
          description: "Renaissance art, river walks, and calm piazzas.",
        },
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks, piazzas, and easy cafe breaks.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    milan: {
      slug: "milan",
      city: "Milan",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["Design fans", "City weekenders", "Food lovers"],
      style: ["Cathedral sights", "Creative districts", "Aperitivo culture"],
      hero: {
        title: "Milan in 3 days",
        subtitle:
          "Blend cathedral highlights with design neighborhoods, cafe pauses, and evening aperitivo.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Duomo_di_Milano_(23282).jpg",
          alt: "Duomo di Milano in the city center.",
        },
      },
      cityStats: [
        { value: "9", label: "Municipal zones" },
        { value: "80+", label: "Museums and galleries" },
        { value: "1.3M", label: "Residents in the city" },
        { value: "2", label: "Main hubs: Duomo and Brera" },
      ],
      fit: {
        forYou: [
          "Cathedral and landmark highlights",
          "Design shops and modern districts",
          "Cafe breaks and people watching",
          "Easy metro routes",
          "Short day plans with free evenings",
        ],
        notForYou: [
          "A countryside-focused trip",
          "Long hikes or outdoor-only days",
          "A packed museum marathon",
          "Late-night clubbing focus",
          "Strictly budget travel",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Duomo and the center",
          summary: "Cathedral views and classic shopping streets.",
          morning: "Duomo di Milano and cathedral square",
          afternoon: "Galleria Vittorio Emanuele II and La Scala exterior",
          evening: "Brera dinner and quiet streets",
        },
        {
          day: 2,
          title: "Art and design districts",
          summary: "Galleries and modern architecture.",
          morning: "Pinacoteca di Brera highlights",
          afternoon: "Porta Nuova and Bosco Verticale area",
          evening: "Corso Como aperitivo",
        },
        {
          day: 3,
          title: "Canals and local neighborhoods",
          summary: "Easy walks and relaxed waterside cafes.",
          morning: "Navigli canal walk",
          afternoon: "Sant'Ambrogio and nearby courtyards",
          evening: "Late aperitivo along the canals",
        },
      ],
      imageInfoCards: [
        {
          title: "Cathedral grandeur",
          description:
            "The Duomo anchors the city. Plan a slow morning and leave time for the square.",
          image: {
            src: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848a?auto=format&fit=crop&w=1200&q=80",
            alt: "Close-up view of Milan Cathedral spires.",
          },
        },
        {
          title: "Design and modern Milan",
          description:
            "Porta Nuova contrasts old Milan with new towers and open plazas.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Modern skyline in Milan with glass towers.",
          },
        },
        {
          title: "Canal evenings",
          description:
            "Navigli is best near sunset. The water and lights keep the pace mellow.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Milan Navigli canal lined with cafes at dusk.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Malpensa Express or airport bus" },
        { label: "Transit tips", value: "Metro lines connect main districts quickly" },
        { label: "Ticketing", value: "Book The Last Supper weeks ahead" },
        { label: "Neighborhood stay", value: "Brera or Porta Romana" },
      ],
      checklist: [
        "Reserve The Last Supper tickets early",
        "Pack comfortable walking shoes",
        "Save offline metro maps",
        "Plan an aperitivo stop each evening",
        "Leave time for cathedral terraces",
        "Bring a light jacket for evenings",
      ],
      faqs: [
        {
          question: "Is Milan worth 3 days?",
          answer:
            "Yes if you balance the Duomo and museums with design districts and canal time.",
        },
        {
          question: "Should I visit the cathedral roof?",
          answer:
            "Yes. The terraces add a memorable viewpoint and only take a short block of time.",
        },
        {
          question: "Is the city good for shopping?",
          answer:
            "Milan is a shopping hub. Schedule a short window near the Galleria or Brera.",
        },
        {
          question: "Do I need a day trip to Lake Como?",
          answer:
            "Not for a calm 3-day visit. Keep your time in the city to avoid rushed travel.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florence",
          days: 3,
          description: "Renaissance art, river walks, and calm piazzas.",
        },
        {
          slug: "venice",
          city: "Venice",
          days: 3,
          description: "Canal walks, classic churches, and island time.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    munich: {
      slug: "munich",
      city: "Múnich",
      country: "Germany",
      days: 3,
      pace: "Balanced",
      idealFor: ["Beer garden fans", "Museum visitors", "Easy walkers"],
      style: ["Historic squares", "Garden breaks", "Short tram rides"],
      hero: {
        title: "Munich in 3 days",
        subtitle:
          "Pair historic squares with garden breaks, classic museums, and easy neighborhood strolls.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marienplatz_(M%C3%BCnchen)_48.jpg",
          alt: "Marienplatz in Munich with the New Town Hall.",
        },
      },
      cityStats: [
        { value: "25", label: "Boroughs across the city" },
        { value: "1.5M", label: "Residents in the city" },
        { value: "300+", label: "Beer gardens and halls" },
        { value: "1", label: "Large central park: English Garden" },
      ],
      fit: {
        forYou: [
          "Historic squares and easy walks",
          "Parks and river paths",
          "Museum mornings with open afternoons",
          "Local food halls and beer gardens",
          "Short tram rides between neighborhoods",
        ],
        notForYou: [
          "Long day trips to the Alps",
          "Late-night clubbing focus",
          "Packed schedules with no breaks",
          "Long-distance driving routes",
          "A museum-only trip",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town and Marienplatz",
          summary: "Classic Munich squares and landmark views.",
          morning: "Marienplatz and Neues Rathaus exterior",
          afternoon: "Viktualienmarkt and nearby lanes",
          evening: "Isar river stroll",
        },
        {
          day: 2,
          title: "Museums and gardens",
          summary: "Art time with green breaks.",
          morning: "Kunstareal museums or Lenbachhaus",
          afternoon: "English Garden walk",
          evening: "Beer garden dinner",
        },
        {
          day: 3,
          title: "Palaces and neighborhoods",
          summary: "Palace grounds and relaxed districts.",
          morning: "Nymphenburg Palace gardens",
          afternoon: "Schwabing streets and cafes",
          evening: "Leopoldstrasse stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Old Town squares",
          description:
            "Munich's center is compact, so you can cover the main squares without rushing.",
          image: {
            src: "https://images.unsplash.com/photo-1509731981857-78b349f5d46b?auto=format&fit=crop&w=1200&q=80",
            alt: "Marienplatz square with historic buildings.",
          },
        },
        {
          title: "English Garden calm",
          description:
            "The English Garden provides a long, scenic break between museum stops.",
          image: {
            src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
            alt: "Green lawns and paths in Munich's English Garden.",
          },
        },
        {
          title: "Beer garden evenings",
          description:
            "Outdoor tables and soft light keep evenings relaxed after a museum-heavy day.",
          image: {
            src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
            alt: "Beer garden tables under trees in Munich.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "S-Bahn to Marienplatz" },
        { label: "Transit tips", value: "Trams and U-Bahn are simple for hops" },
        { label: "Ticketing", value: "Book BMW Museum or Residenz if visiting" },
        { label: "Neighborhood stay", value: "Altstadt or Schwabing" },
      ],
      checklist: [
        "Save an offline MVV transit map",
        "Pack a light layer for evenings",
        "Plan a beer garden stop",
        "Bring comfortable walking shoes",
        "Leave time for a park break daily",
        "Reserve museum entry if needed",
      ],
      faqs: [
        {
          question: "Is Munich walkable?",
          answer:
            "Yes in the center. You can reach most Old Town sights on foot and use trams for longer hops.",
        },
        {
          question: "Should I visit a beer garden?",
          answer:
            "Yes. They are casual and relaxed, and you can stop for an hour without a reservation.",
        },
        {
          question: "Is a day trip to Neuschwanstein necessary?",
          answer:
            "Not for a calm 3-day plan. Focus on Munich to keep the pace easy.",
        },
        {
          question: "Which museum district is best?",
          answer:
            "The Kunstareal area is the easiest base, with several museums within short walks.",
        },
      ],
      relatedItineraries: [
        {
          slug: "berlin",
          city: "Berlin",
          days: 3,
          description: "Historic landmarks, creative districts, and easy transit.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Historic squares, castle views, and river walks.",
        },
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Grand avenues, museum mornings, and park pauses.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dublin: {
      slug: "dublin",
      city: "Dublín",
      country: "Ireland",
      days: 3,
      pace: "Balanced",
      idealFor: ["Literary fans", "Pub culture lovers", "First-time visitors"],
      style: ["Historic streets", "River walks", "Cozy evenings"],
      hero: {
        title: "Dublin in 3 days",
        subtitle:
          "Blend literary landmarks with riverside strolls, local pubs, and relaxed neighborhoods.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ha%27penny_Bridge,_Dublin.jpg",
          alt: "Ha'penny Bridge over the River Liffey in Dublin.",
        },
      },
      cityStats: [
        { value: "2", label: "Main river banks to explore" },
        { value: "50+", label: "Museums and cultural sites" },
        { value: "1.4M", label: "Residents in the metro area" },
        { value: "3", label: "Walkable core neighborhoods" },
      ],
      fit: {
        forYou: [
          "Literary landmarks and museums",
          "Historic streets and river views",
          "Pub culture with early nights",
          "Compact routes and easy walking",
          "Daytime cafe and market stops",
        ],
        notForYou: [
          "A packed schedule of day trips",
          "Nightlife-only travel plans",
          "Long countryside hikes",
          "A museum marathon with no breaks",
          "Strictly luxury travel",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Georgian core and Trinity",
          summary: "Classic streets and historic libraries.",
          morning: "Trinity College and campus walk",
          afternoon: "Grafton Street and St. Stephen's Green",
          evening: "Temple Bar lanes and a casual dinner",
        },
        {
          day: 2,
          title: "Castles and culture",
          summary: "Historic sites with easy walking routes.",
          morning: "Dublin Castle and Chester Beatty Library",
          afternoon: "Christ Church Cathedral and riverfront",
          evening: "Smithfield neighborhood stroll",
        },
        {
          day: 3,
          title: "Neighborhoods and coastal air",
          summary: "Markets and a light seaside escape.",
          morning: "St. Patrick's Cathedral and nearby streets",
          afternoon: "Howth or Dun Laoghaire promenade",
          evening: "Back to the city for a quiet pub night",
        },
      ],
      imageInfoCards: [
        {
          title: "Georgian streets",
          description:
            "The historic center is compact, so you can wander between major sights without rushing.",
          image: {
            src: "https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=1200&q=80",
            alt: "Colorful Georgian doors along a Dublin street.",
          },
        },
        {
          title: "River Liffey walks",
          description:
            "The river paths are best in the late afternoon when the light softens.",
          image: {
            src: "https://images.unsplash.com/photo-1517309230475-6736d926b979?auto=format&fit=crop&w=1200&q=80",
            alt: "River Liffey with bridges and city lights.",
          },
        },
        {
          title: "Coastal escapes",
          description:
            "A short train ride brings sea air and a calm break from the city streets.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "Coastal path near Dublin with sea views.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Airlink or bus to the center" },
        { label: "Transit tips", value: "Walk the core; use DART for the coast" },
        { label: "Ticketing", value: "Book Trinity Library slots in advance" },
        { label: "Neighborhood stay", value: "Temple Bar or St. Stephen's Green" },
      ],
      checklist: [
        "Reserve Book of Kells entry",
        "Pack a light rain jacket",
        "Save offline maps for the center",
        "Plan one coastal walk",
        "Bring comfortable walking shoes",
        "Leave time for a quiet pub stop",
      ],
      faqs: [
        {
          question: "Is Dublin good for a relaxed weekend?",
          answer:
            "Yes. The main sights are close together and you can add short coastal trips without long travel days.",
        },
        {
          question: "Should I visit a coastal town?",
          answer:
            "If you have a free afternoon, the DART makes it easy to reach Howth or Dun Laoghaire.",
        },
        {
          question: "Is Dublin easy to navigate?",
          answer:
            "Yes. The core is compact and most areas connect with simple bus or tram routes.",
        },
        {
          question: "Do I need to pre-book Trinity College?",
          answer:
            "Booking ahead helps, especially in summer, and keeps the day on schedule.",
        },
      ],
      relatedItineraries: [
        {
          slug: "edinburgh",
          city: "Edinburgh",
          days: 3,
          description: "Castle views, historic lanes, and scenic hikes.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    edinburgh: {
      slug: "edinburgh",
      city: "Edinburgh",
      country: "United Kingdom",
      days: 3,
      pace: "Balanced",
      idealFor: ["History lovers", "Scenic walkers", "Festival fans"],
      style: ["Castle views", "Old Town lanes", "Hilltop strolls"],
      hero: {
        title: "Edinburgh in 3 days",
        subtitle:
          "Blend castle history with Old Town lanes, green parks, and easy hilltop views.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_Scotland.jpg",
          alt: "Edinburgh Castle overlooking the city.",
        },
      },
      cityStats: [
        { value: "2", label: "Historic cores: Old Town and New Town" },
        { value: "1", label: "Castle dominating the skyline" },
        { value: "100+", label: "Festivals across the year" },
        { value: "4", label: "Main hill viewpoints" },
      ],
      fit: {
        forYou: [
          "Historic streets and castle views",
          "Short hikes with city panoramas",
          "Museums mixed with park breaks",
          "Cozy pubs and early nights",
          "Compact neighborhoods",
        ],
        notForYou: [
          "A nightlife-only trip",
          "Long countryside day trips",
          "Fast-paced city touring",
          "Long museum marathons",
          "Strictly warm-weather travel",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town and the Royal Mile",
          summary: "Castle history and cobblestone lanes.",
          morning: "Edinburgh Castle and esplanade views",
          afternoon: "Royal Mile walk and St. Giles' Cathedral",
          evening: "Grassmarket dinner and evening stroll",
        },
        {
          day: 2,
          title: "New Town and museums",
          summary: "Elegant streets and cultural stops.",
          morning: "Princes Street Gardens and New Town walk",
          afternoon: "National Gallery or Museum of Scotland",
          evening: "Stockbridge neighborhood cafes",
        },
        {
          day: 3,
          title: "Hills and viewpoints",
          summary: "Easy hikes with wide city views.",
          morning: "Arthur's Seat or Calton Hill",
          afternoon: "Holyrood Park and palace exterior",
          evening: "Leith waterfront dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Old Town textures",
          description:
            "Narrow closes and stone lanes make the historic core feel cinematic.",
          image: {
            src: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow Edinburgh lane with stone buildings.",
          },
        },
        {
          title: "City viewpoints",
          description:
            "Short climbs like Calton Hill add big views without a long hike.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Edinburgh skyline from a hill viewpoint.",
          },
        },
        {
          title: "New Town calm",
          description:
            "Elegant streets and gardens create a quieter contrast to the Old Town.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Edinburgh New Town with classic architecture.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Tram or bus to the center" },
        { label: "Transit tips", value: "Walk Old Town; buses for longer hops" },
        { label: "Ticketing", value: "Book Edinburgh Castle entry" },
        { label: "Neighborhood stay", value: "Old Town or New Town" },
      ],
      checklist: [
        "Reserve castle tickets in advance",
        "Pack a windproof layer",
        "Save offline maps for the Old Town",
        "Plan one hilltop sunrise or sunset",
        "Bring comfortable walking shoes",
        "Leave time for a pub dinner",
      ],
      faqs: [
        {
          question: "Is Edinburgh hilly?",
          answer:
            "Yes in some areas, but the climbs are short and the views are worth the effort.",
        },
        {
          question: "Should I hike Arthur's Seat?",
          answer:
            "It is a great option if you want a longer walk. Calton Hill is a shorter alternative.",
        },
        {
          question: "Do I need to pre-book the castle?",
          answer:
            "Yes in peak season. Timed entry keeps your schedule calm.",
        },
        {
          question: "Is the city good in cooler months?",
          answer:
            "Yes, but pack warm layers. Many museums and indoor stops keep the day comfortable.",
        },
      ],
      relatedItineraries: [
        {
          slug: "dublin",
          city: "Dublin",
          days: 3,
          description: "Literary landmarks, river walks, and cozy evenings.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and riverside walks.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    copenhagen: {
      slug: "copenhagen",
      city: "Copenhagen",
      country: "Denmark",
      days: 3,
      pace: "Balanced",
      idealFor: ["Design fans", "Bike-friendly travelers", "Food explorers"],
      style: ["Waterfront walks", "Colorful districts", "Easy biking"],
      hero: {
        title: "Copenhagen in 3 days",
        subtitle:
          "Pair waterfront strolls with design districts, cozy cafes, and easy bike routes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Nyhavn_Copenhagen.jpg",
          alt: "Nyhavn harbor with colorful buildings in Copenhagen.",
        },
      },
      cityStats: [
        { value: "1", label: "Harbor-centered city core" },
        { value: "350+", label: "Kilometers of bike lanes" },
        { value: "50+", label: "Museums and galleries" },
        { value: "2", label: "Main hubs: Indre By and Vesterbro" },
      ],
      fit: {
        forYou: [
          "Waterfront walks and bike rides",
          "Design and architecture highlights",
          "Cafe culture with early evenings",
          "Short hops between districts",
          "Relaxed day pacing",
        ],
        notForYou: [
          "Long-distance day trips",
          "Late-night nightlife focus",
          "A fast museum sprint",
          "Car-based travel",
          "Packed schedules without breaks",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Nyhavn and the historic core",
          summary: "Classic waterfront views and city center walks.",
          morning: "Nyhavn and Kongens Nytorv",
          afternoon: "Amalienborg exterior and harbor stroll",
          evening: "Nyhavn evening stroll and dinner",
        },
        {
          day: 2,
          title: "Design districts",
          summary: "Neighborhood cafes and modern architecture.",
          morning: "Christianshavn and canals",
          afternoon: "Vesterbro boutiques and coffee",
          evening: "Meatpacking District dinner",
        },
        {
          day: 3,
          title: "Gardens and museums",
          summary: "Green spaces with cultural stops.",
          morning: "Tivoli Gardens or nearby parks",
          afternoon: "Rosenborg Castle exterior and King's Garden",
          evening: "Evening cycle by the lakes",
        },
      ],
      imageInfoCards: [
        {
          title: "Harbor colors",
          description:
            "Nyhavn sets the tone. Early mornings are calm and bright.",
          image: {
            src: "https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=1200&q=80",
            alt: "Colorful buildings along Copenhagen's harbor.",
          },
        },
        {
          title: "Bike-friendly streets",
          description:
            "Short bike rides connect the main neighborhoods without stress.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Cyclists on a Copenhagen street.",
          },
        },
        {
          title: "Design corners",
          description:
            "Clean lines and quiet plazas make the city feel spacious and calm.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Modern architecture and open plaza in Copenhagen.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Metro to Kongens Nytorv" },
        { label: "Transit tips", value: "Bike or walk; metro for longer routes" },
        { label: "Ticketing", value: "Book Tivoli or Rosenborg if visiting" },
        { label: "Neighborhood stay", value: "Indre By or Vesterbro" },
      ],
      checklist: [
        "Pack a light rain jacket",
        "Plan one bike-friendly day",
        "Reserve Tivoli tickets if needed",
        "Save offline metro maps",
        "Bring comfortable walking shoes",
        "Leave time for a harbor cafe",
      ],
      faqs: [
        {
          question: "Is Copenhagen easy to bike?",
          answer:
            "Yes. The bike infrastructure is strong and most routes are flat and short.",
        },
        {
          question: "Do I need to visit Tivoli?",
          answer:
            "It's optional, but a short visit adds a classic local highlight without taking a full day.",
        },
        {
          question: "Are the neighborhoods walkable?",
          answer:
            "Yes. The city core is compact, and most neighborhoods connect by short waterfront routes.",
        },
        {
          question: "Is Copenhagen good in shoulder season?",
          answer:
            "Yes, but bring layers and plan more indoor cafes if the weather turns cool.",
        },
      ],
      relatedItineraries: [
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Old town charm, museums, and island pauses.",
        },
        {
          slug: "berlin",
          city: "Berlin",
          days: 3,
          description: "Historic landmarks, creative districts, and easy transit.",
        },
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canals, museums, and bike-friendly neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    stockholm: {
      slug: "stockholm",
      city: "Stockholm",
      country: "Sweden",
      days: 3,
      pace: "Balanced",
      idealFor: ["Waterfront walkers", "Museum fans", "Scenic explorers"],
      style: ["Island vistas", "Old town lanes", "Museum breaks"],
      hero: {
        title: "Stockholm in 3 days",
        subtitle:
          "Mix old town lanes with museum visits, island strolls, and calm waterfront breaks.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stockholm_Skyline.jpg",
          alt: "Stockholm skyline with waterfront buildings.",
        },
      },
      cityStats: [
        { value: "14", label: "Islands in the city center" },
        { value: "50+", label: "Museums and galleries" },
        { value: "30+", label: "Bridges linking neighborhoods" },
        { value: "1", label: "Walkable old town core" },
      ],
      fit: {
        forYou: [
          "Waterfront walks and ferry rides",
          "Historic lanes with cafes",
          "Museum time balanced with nature",
          "Short day plans with open evenings",
          "Scenic viewpoints",
        ],
        notForYou: [
          "A nightlife-only trip",
          "Long countryside hikes",
          "Fast-paced sightseeing",
          "Museum marathons without breaks",
          "Car-based travel",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Gamla Stan and waterfront",
          summary: "Old town charm with easy harbor views.",
          morning: "Gamla Stan lanes and Stortorget",
          afternoon: "Royal Palace exterior and waterfront walk",
          evening: "Skeppsholmen sunset stroll",
        },
        {
          day: 2,
          title: "Museum island day",
          summary: "Focused museum time with park breaks.",
          morning: "Vasa Museum or ABBA Museum",
          afternoon: "Djurgarden park walk",
          evening: "Ostermalm dinner",
        },
        {
          day: 3,
          title: "Neighborhoods and viewpoints",
          summary: "Scenic walks with city panoramas.",
          morning: "Sodermalm viewpoints",
          afternoon: "Fotografiska exterior and cafes",
          evening: "Riddarholmen waterfront walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Old town details",
          description:
            "Gamla Stan is compact and best explored slowly with short cafe breaks.",
          image: {
            src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow street in Stockholm's Gamla Stan.",
          },
        },
        {
          title: "Island walks",
          description:
            "Bridges connect most areas, so you can walk between islands without long transfers.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Bridge view over Stockholm waterfront.",
          },
        },
        {
          title: "Museum breaks",
          description:
            "Djurgarden mixes museums with green paths for a balanced day.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Tree-lined park path in Stockholm.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Arlanda Express to Central Station" },
        { label: "Transit tips", value: "Walk the core; metro for longer hops" },
        { label: "Ticketing", value: "Book Vasa Museum entry in summer" },
        { label: "Neighborhood stay", value: "Norrmalm or Sodermalm" },
      ],
      checklist: [
        "Reserve Vasa Museum tickets if needed",
        "Pack a light jacket for waterfront breezes",
        "Save offline metro maps",
        "Plan one ferry or bridge walk",
        "Bring comfortable walking shoes",
        "Leave time for a waterfront cafe",
      ],
      faqs: [
        {
          question: "Is Stockholm easy to explore on foot?",
          answer:
            "Yes. The central islands connect by bridges, so most routes are walkable with short hops.",
        },
        {
          question: "Should I visit Djurgarden?",
          answer:
            "Yes. It combines museums with green paths and keeps the day balanced.",
        },
        {
          question: "Is the Vasa Museum worth it?",
          answer:
            "Yes. It is one of the city's highlights and fits well into a half-day plan.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Not for short stays. Most sights are walkable, with occasional metro rides.",
        },
      ],
      relatedItineraries: [
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Waterfront strolls, design districts, and bike-friendly routes.",
        },
        {
          slug: "berlin",
          city: "Berlin",
          days: 3,
          description: "Historic landmarks, creative districts, and easy transit.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    athens: {
      slug: "athens",
      city: "Athens",
      country: "Greece",
      days: 3,
      pace: "Balanced",
      idealFor: ["History lovers", "Food explorers", "Viewpoint seekers"],
      style: ["Ancient landmarks", "Neighborhood cafes", "Sunset walks"],
      hero: {
        title: "Athens in 3 days",
        subtitle:
          "Balance ancient sites with local neighborhoods, cafe pauses, and sunset viewpoints.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Parthenon_Image_01.jpg",
          alt: "The Parthenon on the Acropolis in Athens.",
        },
      },
      cityStats: [
        { value: "1", label: "Historic hilltop Acropolis" },
        { value: "300+", label: "Sunny days each year" },
        { value: "3", label: "Walkable central neighborhoods" },
        { value: "15", label: "Minutes between main landmarks" },
      ],
      fit: {
        forYou: [
          "Ancient history with modern cafes",
          "Short walks between sites",
          "Rooftop and hilltop views",
          "Relaxed meals and market stops",
          "A calm pace with midday breaks",
        ],
        notForYou: [
          "A packed schedule of day trips",
          "Long hikes outside the city",
          "Late-night nightlife focus",
          "Museum-only marathons",
          "Strictly beach-only travel",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Acropolis and Plaka",
          summary: "Ancient landmarks with old town lanes.",
          morning: "Acropolis and Parthenon",
          afternoon: "Acropolis Museum and Plaka walk",
          evening: "Anafiotika and sunset viewpoints",
        },
        {
          day: 2,
          title: "Agora and central squares",
          summary: "Historic ruins and market streets.",
          morning: "Ancient Agora and Temple of Hephaestus",
          afternoon: "Monastiraki and flea market",
          evening: "Psyrri dinner and neighborhood stroll",
        },
        {
          day: 3,
          title: "Neighborhoods and hills",
          summary: "Green spaces and city panoramas.",
          morning: "National Garden and Syntagma area",
          afternoon: "Kolonaki cafes and Lycabettus Hill",
          evening: "Sunset walk on Filopappou Hill",
        },
      ],
      imageInfoCards: [
        {
          title: "Ancient hilltop views",
          description:
            "The Acropolis dominates the skyline. Go early to enjoy cooler air and fewer crowds.",
          image: {
            src: "https://images.unsplash.com/photo-1505739778-5cb6734f965e?auto=format&fit=crop&w=1200&q=80",
            alt: "The Acropolis with warm light across Athens.",
          },
        },
        {
          title: "Plaka lanes",
          description:
            "Small streets and cafes in Plaka are perfect for slow afternoons after sightseeing.",
          image: {
            src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow street lined with cafes in Athens.",
          },
        },
        {
          title: "Sunset hills",
          description:
            "Short climbs to nearby hills give you wide sunset views without a long hike.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "City skyline with a hilltop sunset viewpoint in Athens.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Metro or airport bus to Syntagma" },
        { label: "Transit tips", value: "Walk the core; use Metro for longer hops" },
        { label: "Ticketing", value: "Book Acropolis slots for early entry" },
        { label: "Neighborhood stay", value: "Plaka or Koukaki" },
      ],
      checklist: [
        "Reserve Acropolis entry slot",
        "Pack a light hat and sunscreen",
        "Plan an early start for major sites",
        "Save offline maps for the center",
        "Bring comfortable walking shoes",
        "Leave time for a long lunch",
      ],
      faqs: [
        {
          question: "Is Athens easy for first-time visitors?",
          answer:
            "Yes. The main sights are close together, and the central neighborhoods are easy to navigate.",
        },
        {
          question: "Should I visit the Acropolis early?",
          answer:
            "Yes. Mornings are cooler and less crowded, which keeps the visit calm and comfortable.",
        },
        {
          question: "Is a day trip to the islands needed?",
          answer:
            "Not for a calm 3-day stay. Focus on the city and save island time for a longer trip.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Not necessarily. Most days are walkable, with occasional Metro rides for longer hops.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks, piazzas, and easy cafe breaks.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 4,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    seville: {
      slug: "seville",
      city: "Seville",
      country: "Spain",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Outdoor walkers", "Slow travelers"],
      style: ["Open plazas", "Historic quarters", "Easy pacing"],
      hero: {
        title: "Seville in 3 days",
        subtitle:
          "A calm plan through plazas, courtyards, and Guadalquivir strolls with time to breathe.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1713102834168-c8f0b3ed7ca9?auto=format&fit=crop&w=1600&q=80",
          alt: "Plaza de Espana in Seville with its sweeping architecture.",
        },
      },
      cityStats: [
        { value: "3", label: "UNESCO World Heritage sites" },
        { value: "700k", label: "Residents in the city" },
        { value: "3,000+", label: "Sunshine hours each year" },
        { value: "1", label: "Main river: the Guadalquivir" },
      ],
      fit: {
        forYou: [
          "Plazas and courtyards for slow walks",
          "A compact historic center",
          "Outdoor time and shaded parks",
          "Gentle pacing with short distances",
          "Andalusian architecture and culture",
        ],
        notForYou: [
          "Day trips outside the city",
          "Nightlife as the main focus",
          "A packed schedule of ticketed sites",
          "Long walks in peak heat",
          "A rushed, checklist-style visit",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center and plazas",
          summary: "Cathedral views, classic neighborhoods, and open squares.",
          morning: "Seville Cathedral and Giralda exterior",
          afternoon: "Alcazar exterior and Barrio Santa Cruz",
          evening: "Plaza de Espana at sunset",
        },
        {
          day: 2,
          title: "Riverfront and Triana",
          summary: "Calm river walks and local streets.",
          morning: "Guadalquivir river stroll",
          afternoon: "Triana neighborhood and Isabel II Bridge",
          evening: "Easy riverside walk",
        },
        {
          day: 3,
          title: "Parks and viewpoints",
          summary: "Garden time and modern viewpoints.",
          morning: "Maria Luisa Park",
          afternoon: "Metropol Parasol and a center walk",
          evening: "Alameda de Hercules stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Open plazas",
          description:
            "Seville's plazas bring shade and benches. They're perfect for a long pause.",
          image: {
            src: "https://images.unsplash.com/photo-1640799172468-d75176e6fa2f?auto=format&fit=crop&w=1200&q=80",
            alt: "Wide view of Seville Cathedral and its surroundings.",
          },
        },
        {
          title: "The Giralda tower",
          description:
            "The tower anchors the historic center. A slow loop nearby adds context.",
          image: {
            src: "https://images.unsplash.com/photo-1664354565807-f832d990d50e?auto=format&fit=crop&w=1200&q=80",
            alt: "La Giralda in Seville against a clear sky.",
          },
        },
        {
          title: "Gothic details",
          description:
            "The cathedral adds texture and history without overloading the day.",
          image: {
            src: "https://images.unsplash.com/photo-1755832056530-4102cc092c6b?auto=format&fit=crop&w=1200&q=80",
            alt: "Gothic detail on Seville Cathedral.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "March to May or October to November" },
        { label: "Airport transfer", value: "Bus or taxi to the center" },
        { label: "Transit tips", value: "Walk the core; tram for longer hops" },
        { label: "Ticketing", value: "Reserve Cathedral or Alcazar if entering" },
        { label: "Neighborhood stay", value: "Centro or Santa Cruz" },
      ],
      checklist: [
        "Reserve entry tickets if visiting interiors",
        "Pack sun protection and water",
        "Wear comfortable walking shoes",
        "Save an offline map of the center",
        "Plan a long mid-day break",
        "Bring a light layer for evenings",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Seville?",
          answer:
            "Yes for the essentials. The center is compact and the walks are short and easy.",
        },
        {
          question: "Do I need transit?",
          answer:
            "Not in the core. The tram helps if you want to reduce longer walks.",
        },
        {
          question: "Should I pre-book the Cathedral or Alcazar?",
          answer:
            "If you plan to go inside, yes. Reservations keep the pace calm.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Centro and Santa Cruz are central, walkable, and close to the main plazas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "lisbon",
          city: "Lisbon",
          days: 3,
          description: "Viewpoint neighborhoods and riverside walks.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture and walkable seaside routes.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museums, central plazas, and easy walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    porto: {
      slug: "porto",
      city: "Porto",
      country: "Portugal",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Riverside walkers", "Food-first travelers"],
      style: ["Riverside strolls", "Hilltop viewpoints", "Cafe pauses"],
      pacing: [
        "Porto works best with a calm loop: one anchor sight each day, then long breaks for riverside views and small streets.",
        "Keep mornings for hilltop viewpoints and historic lanes, then slow down in the afternoon with a relaxed lunch by the Douro.",
        "Save one evening for a gentle bridge walk and sunset light along the water.",
      ],
      hero: {
        title: "Porto in 3 days",
        subtitle:
          "Riverside neighborhoods, tiled streets, and slow meals with time to pause between viewpoints.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Porto_skyline.jpg",
          alt: "Riverside view of Porto with colorful buildings and the Douro.",
        },
      },
      cityStats: [
        { value: "Ribeira", label: "Historic riverside core" },
        { value: "Hills", label: "Viewpoints above the river" },
        { value: "Azulejos", label: "Tile-lined streets and facades" },
        { value: "Douro", label: "Slow walks along the water" },
      ],
      fit: {
        forYou: ["Short walks with long breaks", "Scenic river views", "Historic streets and cafes", "Simple day-by-day structure", "Calm, food-first pacing"],
        notForYou: ["Late-night party focus", "Fast-paced landmark hopping", "A museum-only itinerary", "Full-day excursions outside the city", "Heavy shopping itineraries"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Riverside old town",
          summary: "Ribeira lanes and a relaxed bridge walk.",
          morning: "Ribeira waterfront and quiet side streets",
          afternoon: "Cathedral area and tiled facades",
          evening: "Dom Luis I Bridge at golden hour",
        },
        {
          day: 2,
          title: "Hilltop views and cafes",
          summary: "City viewpoints and classic cafes.",
          morning: "Clerigos area and viewpoint loop",
          afternoon: "Bookshop street and cafe pause",
          evening: "Douro riverside dinner",
        },
        {
          day: 3,
          title: "Across the river",
          summary: "Easy strolls and cellar time.",
          morning: "Vila Nova de Gaia riverfront",
          afternoon: "Port wine cellars or museum stop",
          evening: "Riverside promenade and quiet squares",
        },
      ],
      imageInfoCards: [
        {
          title: "Riverside layers",
          description:
            "Porto's stacked streets descend to the Douro, making every walk a series of small viewpoints.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Layered hills and rooftops above Porto's riverfront.",
          },
        },
        {
          title: "Azulejo details",
          description:
            "Tile-covered facades and stations add color without adding distance.",
          image: {
            src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80",
            alt: "Blue tile facade detail in Porto.",
          },
        },
        {
          title: "Bridge walks",
          description:
            "Short bridge crossings give big views and an easy way to reset the pace.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "Bridge crossing above the Douro River in Porto.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Metro or taxi to the center" },
        { label: "Transit tips", value: "Walk the core; metro for longer hills" },
        { label: "Ticketing", value: "Book cellars if you want a tasting" },
        { label: "Neighborhood stay", value: "Ribeira or Cedofeita" },
      ],
      checklist: [
        "Book a cellar visit if desired",
        "Pack comfortable walking shoes",
        "Carry a light layer for breezy evenings",
        "Save an offline map of the old town",
        "Plan one long riverside break daily",
        "Keep small cash for cafes",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Porto?",
          answer:
            "Yes. Three days covers the core neighborhoods and leaves time for relaxed riverside walks.",
        },
        {
          question: "Should I cross to Gaia?",
          answer:
            "Yes for a different viewpoint and the cellars. A half day is enough.",
        },
        {
          question: "Is Porto walkable?",
          answer:
            "The center is walkable but hilly. Plan short climbs and pause often.",
        },
        {
          question: "Do I need advance tickets for cellars?",
          answer:
            "Only for popular tours or evenings. Daytime slots are often flexible.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Ribeira keeps you close to the river, while Cedofeita is quieter and still central.",
        },
        {
          question: "What pace works best?",
          answer:
            "Aim for one major area per day, then fill the rest with walks and cafes.",
        },
        {
          question: "Is Porto good for first-timers in Portugal?",
          answer:
            "Yes. The historic core is compact and easy to explore without rushing.",
        },
      ],
      relatedItineraries: [
        {
          slug: "lisbon",
          city: "Lisbon",
          days: 3,
          description: "Hillside viewpoints and riverside strolls.",
        },
        {
          slug: "seville",
          city: "Seville",
          days: 3,
          description: "Plazas, parks, and slow river walks.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Walkable neighborhoods and easy seaside time.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    krakow: {
      slug: "krakow",
      city: "Krakow",
      country: "Poland",
      days: 3,
      pace: "Balanced",
      idealFor: ["History lovers", "Old town walkers", "First-time visitors"],
      style: ["Historic squares", "Castle views", "Neighborhood strolls"],
      pacing: [
        "Krakow's center is compact, so build each day around one area and keep the rest for slow walks and cafes.",
        "Pair the old town and castle hill on separate days to avoid crowding the pace.",
        "Leave time for Kazimierz in the evening when the streets feel calmer and more local.",
      ],
      hero: {
        title: "Krakow in 3 days",
        subtitle:
          "Old town squares, castle views, and calm neighborhood walks with plenty of pause time.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Krakow_Main_Square.jpg",
          alt: "Historic square in Krakow with church towers at sunset.",
        },
      },
      cityStats: [
        { value: "Old Town", label: "Walkable central square" },
        { value: "Wawel Hill", label: "Castle and riverside views" },
        { value: "Kazimierz", label: "Cafes and quiet lanes" },
        { value: "River", label: "Easy promenade walks" },
      ],
      fit: {
        forYou: ["Compact city walks", "Historic cores", "Quiet cafes", "Simple day-by-day pacing", "Low transit needs"],
        notForYou: ["A nightlife-only trip", "Heavy museum marathons", "Big daily transit jumps", "Packed schedules", "Day trips as a priority"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town core",
          summary: "Main square, cloth hall, and short lanes.",
          morning: "Main Market Square and nearby streets",
          afternoon: "St. Mary's Basilica area and Planty Park",
          evening: "Old town dinner and easy evening walk",
        },
        {
          day: 2,
          title: "Castle hill and river",
          summary: "Wawel views and a calm riverside loop.",
          morning: "Wawel Castle exterior and hill walk",
          afternoon: "Vistula river promenade",
          evening: "Sunset by the river and quiet cafes",
        },
        {
          day: 3,
          title: "Kazimierz and slow lanes",
          summary: "Neighborhood streets and relaxed stops.",
          morning: "Kazimierz synagogues and small streets",
          afternoon: "Plac Nowy and cafe break",
          evening: "Return to the old town for a short loop",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic squares",
          description:
            "Wide squares and short lanes make it easy to keep the pace slow.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic square with arcades in Krakow.",
          },
        },
        {
          title: "Castle hill views",
          description:
            "The hilltop loop offers wide views without a long hike.",
          image: {
            src: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=1200&q=80",
            alt: "View toward Wawel Castle in Krakow.",
          },
        },
        {
          title: "Quiet neighborhood lanes",
          description:
            "Kazimierz streets slow the day down with cafes and local corners.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Small street with cafes in Krakow.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September" },
        { label: "Airport transfer", value: "Train or taxi to the center" },
        { label: "Transit tips", value: "Walk most routes; tram for longer hops" },
        { label: "Ticketing", value: "Reserve Wawel or museums if visiting interiors" },
        { label: "Neighborhood stay", value: "Old Town or Kazimierz" },
      ],
      checklist: [
        "Pack comfortable walking shoes",
        "Keep a light layer for evenings",
        "Save an offline map of the center",
        "Book Wawel entry if going inside",
        "Plan one long cafe break daily",
        "Carry small cash for trams",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Krakow?",
          answer:
            "Yes. The old town and nearby neighborhoods are compact and easy to cover in three days.",
        },
        {
          question: "Is Krakow walkable?",
          answer:
            "Very. Most highlights are within a short walk, with trams for longer distances.",
        },
        {
          question: "Should I visit Wawel Castle?",
          answer:
            "Yes for the views and the riverside walk. Interiors are optional.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Old Town keeps you central, while Kazimierz is quieter with local cafes.",
        },
        {
          question: "Do I need to book museums in advance?",
          answer:
            "Only for specific exhibitions or peak season weekends.",
        },
        {
          question: "What is the best pace for this guide?",
          answer:
            "One neighborhood focus per day, then fill in with cafes and river walks.",
        },
        {
          question: "Is Kazimierz worth a full day?",
          answer:
            "A half to full day is ideal, depending on how many museums you add.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old town lanes and easy river walks.",
        },
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Museum districts and calm boulevards.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube views and historic hills.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    zurich: {
      slug: "zurich",
      city: "Zurich",
      country: "Switzerland",
      days: 3,
      pace: "Balanced",
      idealFor: ["Lakeside walkers", "Museum fans", "Short calm breaks"],
      style: ["Lakeside strolls", "Compact museums", "Old town lanes"],
      pacing: [
        "Zurich is compact, so keep the pace light: one museum or viewpoint a day, then long lakeside walks.",
        "Group sights by the lakefront and old town to avoid backtracking.",
        "Use the final day for a slow promenade and a quiet neighborhood lunch.",
      ],
      hero: {
        title: "Zurich in 3 days",
        subtitle:
          "Lakeside walks, a compact old town, and relaxed museum time without overplanning.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Zurich_Skyline.jpg",
          alt: "Zurich skyline with lakefront and church towers.",
        },
      },
      cityStats: [
        { value: "Lake", label: "Easy waterfront promenades" },
        { value: "Old Town", label: "Short lanes and squares" },
        { value: "Museums", label: "Compact cultural stops" },
        { value: "Trams", label: "Quick hops across the city" },
      ],
      fit: {
        forYou: ["Calm city breaks", "Lake views", "Short walking routes", "Museum afternoons", "Easy transit"],
        notForYou: ["A nightlife-focused trip", "Heavy day trips", "Packed shopping plans", "Long walking days only", "High-energy pacing"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and lake",
          summary: "Historic lanes and a relaxed promenade.",
          morning: "Old Town lanes and church squares",
          afternoon: "Lake Zurich promenade",
          evening: "Riverside dinner and short stroll",
        },
        {
          day: 2,
          title: "Museums and parks",
          summary: "Compact museum time and green space.",
          morning: "Kunsthaus or Swiss National Museum",
          afternoon: "Lindenhof and nearby parks",
          evening: "Cafe pause in the old town",
        },
        {
          day: 3,
          title: "Neighborhood loops",
          summary: "Easy tram hops and viewpoints.",
          morning: "Uetliberg viewpoint or botanical garden",
          afternoon: "West Zurich cafes and galleries",
          evening: "Lakefront sunset walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Lakeside calm",
          description:
            "The promenade is the city's slow lane, ideal for a daily reset.",
          image: {
            src: "https://images.unsplash.com/photo-1505843795480-5cfb3c03f6ff?auto=format&fit=crop&w=1200&q=80",
            alt: "Lake Zurich promenade with mountains in the distance.",
          },
        },
        {
          title: "Old town lanes",
          description:
            "Short lanes, small squares, and views of church towers make walking easy.",
          image: {
            src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow old town street in Zurich.",
          },
        },
        {
          title: "Museum afternoons",
          description:
            "Museums are close together, so you can keep the day light.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Museum exterior in Zurich with a quiet plaza.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Train to Hauptbahnhof" },
        { label: "Transit tips", value: "Trams are fast and reliable" },
        { label: "Ticketing", value: "Reserve museum tickets in peak season" },
        { label: "Neighborhood stay", value: "Old Town or Seefeld" },
      ],
      checklist: [
        "Pack a light layer for the lake breeze",
        "Save a tram map offline",
        "Plan one museum afternoon",
        "Book a lake cruise if desired",
        "Keep walking shoes for cobblestones",
        "Plan a long lakefront break daily",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Zurich?",
          answer:
            "Yes. The city is compact and the core highlights are easy to cover in three days.",
        },
        {
          question: "Is Zurich walkable?",
          answer:
            "Yes, especially the old town and lakefront. Trams help for longer hops.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "A day pass can help if you plan multiple tram rides or a lake cruise.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Old Town keeps you close to everything, while Seefeld is quieter by the lake.",
        },
        {
          question: "Are museums a must?",
          answer:
            "Pick one or two. The city is small enough to keep the rest of the day flexible.",
        },
        {
          question: "What pace works best?",
          answer:
            "One anchor stop per day plus long lakefront walks.",
        },
        {
          question: "Is a day trip necessary?",
          answer:
            "Not for this guide. The focus is on Zurich's calm city rhythm.",
        },
      ],
      relatedItineraries: [
        {
          slug: "munich",
          city: "Munich",
          days: 3,
          description: "Garden breaks and walkable squares.",
        },
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Classic museums and wide boulevards.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old town charm and river walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    brussels: {
      slug: "brussels",
      city: "Brussels",
      country: "Belgium",
      days: 3,
      pace: "Balanced",
      idealFor: ["City breakers", "Museum fans", "Cafe lovers"],
      style: ["Grand squares", "Museum districts", "Easy cafe pauses"],
      pacing: [
        "Brussels is best in short, calm loops: a main square, a museum block, and a park each day.",
        "Keep afternoons light with cafe breaks and short walks between neighborhoods.",
        "Save one evening for a quiet wander around the historic core.",
      ],
      hero: {
        title: "Brussels in 3 days",
        subtitle:
          "Grand squares, museum time, and relaxed cafe breaks with an easy walking pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brussels-Grand-Place.jpg",
          alt: "Grand square in Brussels with historic buildings.",
        },
      },
      cityStats: [
        { value: "Grand Place", label: "Historic square core" },
        { value: "Museums", label: "Compact cultural district" },
        { value: "Parks", label: "Green pauses between stops" },
        { value: "Walkable", label: "Short city-center routes" },
      ],
      fit: {
        forYou: ["Short walking days", "Historic architecture", "Museum afternoons", "Cafe culture", "Easy transit"],
        notForYou: ["High-energy nightlife plans", "Long day trips", "Packed schedules", "Beach-focused trips", "Fast-paced sight collecting"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Grand Place and old center",
          summary: "Historic squares and easy lanes.",
          morning: "Grand Place and nearby streets",
          afternoon: "Galeries and central squares",
          evening: "Old town dinner and short walk",
        },
        {
          day: 2,
          title: "Museums and parks",
          summary: "Mont des Arts and green breaks.",
          morning: "Royal Museums area",
          afternoon: "Mont des Arts gardens",
          evening: "Sablon cafes and chocolate stops",
        },
        {
          day: 3,
          title: "Neighborhoods and viewpoints",
          summary: "Calm walks and relaxed viewpoints.",
          morning: "Parc du Cinquantenaire",
          afternoon: "Ixelles ponds and side streets",
          evening: "Return to the center for an easy loop",
        },
      ],
      imageInfoCards: [
        {
          title: "Grand square details",
          description:
            "The city’s central square sets the tone for slow architectural walks.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Grand Place architecture in Brussels.",
          },
        },
        {
          title: "Museum district",
          description:
            "Museums sit close together, so you can keep the schedule light.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Museum district building in Brussels.",
          },
        },
        {
          title: "Park pauses",
          description:
            "Parks and gardens give you natural breaks between landmarks.",
          image: {
            src: "https://images.unsplash.com/photo-1501084817091-a4f3d1a11f8e?auto=format&fit=crop&w=1200&q=80",
            alt: "Park walk in Brussels with trees and paths.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Train to Brussels Central" },
        { label: "Transit tips", value: "Walk the core; metro for longer hops" },
        { label: "Ticketing", value: "Reserve museums on weekends" },
        { label: "Neighborhood stay", value: "Center or Sablon" },
      ],
      checklist: [
        "Reserve museum tickets if needed",
        "Pack a light rain layer",
        "Save an offline map of the center",
        "Plan one long cafe break daily",
        "Keep small cash for snacks",
        "Wear comfortable walking shoes",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Brussels?",
          answer:
            "Yes. The central sights and museum district fit comfortably in three days.",
        },
        {
          question: "Is Brussels walkable?",
          answer:
            "The core is walkable, with metro options for longer distances.",
        },
        {
          question: "Do I need to pre-book museums?",
          answer:
            "Only for popular exhibits or weekend visits.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The center is convenient, while Sablon offers a calmer, local feel.",
        },
        {
          question: "Should I add a day trip?",
          answer:
            "Not necessary for this guide. The focus is a calm city pace.",
        },
        {
          question: "What pace works best?",
          answer:
            "One anchor area per day, with plenty of cafe and park breaks.",
        },
        {
          question: "Is it good for first-time visitors?",
          answer:
            "Yes. The city is compact and easy to navigate without rushing.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks and cafe neighborhoods.",
        },
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canal walks and relaxed museum time.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights and riverside walks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    valencia: {
      slug: "valencia",
      city: "Valencia",
      country: "Spain",
      days: 3,
      pace: "Balanced",
      idealFor: ["Food lovers", "Beach breaks", "First-time visitors"],
      style: ["Old town lanes", "Garden walks", "Seaside pauses"],
      pacing: [
        "Valencia blends old town sights with long garden walks, so split your days between the historic center and the Turia parks.",
        "Keep one afternoon for the beach to slow the pace and avoid stacking too many sights.",
        "Plan dinners early and leave the late evening open for a calm paseo.",
      ],
      hero: {
        title: "Valencia in 3 days",
        subtitle:
          "Old town lanes, garden walks, and a relaxed beach afternoon with plenty of breathing room.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/City_of_Arts_and_Sciences,_Valencia,_Spain.jpg",
          alt: "View of Valencia with historic rooftops and clear sky.",
        },
      },
      cityStats: [
        { value: "Turia", label: "Long garden walks" },
        { value: "Old Town", label: "Compact historic core" },
        { value: "Seaside", label: "Easy beach access" },
        { value: "Markets", label: "Food-focused mornings" },
      ],
      fit: {
        forYou: ["A mix of city and beach", "Relaxed walking pace", "Food markets", "Parks and gardens", "Simple day structure"],
        notForYou: ["High-energy nightlife plans", "Packed museum schedules", "Fast-paced sightseeing", "Long day trips", "Shopping-only itineraries"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town core",
          summary: "Historic streets and market stops.",
          morning: "Cathedral area and central lanes",
          afternoon: "Central Market and nearby squares",
          evening: "Old town dinner and short stroll",
        },
        {
          day: 2,
          title: "Parks and modern Valencia",
          summary: "Turia Gardens and modern architecture.",
          morning: "Turia Gardens walk",
          afternoon: "City of Arts and Sciences exterior loop",
          evening: "Ruzafa cafes and relaxed dinner",
        },
        {
          day: 3,
          title: "Beach and promenade",
          summary: "Seaside time and a calm paseo.",
          morning: "Malvarrosa beach walk",
          afternoon: "Seaside lunch and rest",
          evening: "Promenade sunset walk",
        },
      ],
      imageInfoCards: [
        {
          title: "Garden corridor",
          description:
            "The Turia Gardens form a long green path ideal for slow walks.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Garden walkway in Valencia's Turia Gardens.",
          },
        },
        {
          title: "Old town lanes",
          description:
            "Short, shaded streets keep the old town easy to explore.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic lane in Valencia's old town.",
          },
        },
        {
          title: "Seaside pauses",
          description:
            "A beach afternoon brings the pace down and opens the evenings.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Valencia beach promenade with calm water.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September" },
        { label: "Airport transfer", value: "Metro or taxi to the center" },
        { label: "Transit tips", value: "Walk the core; tram for the beach" },
        { label: "Ticketing", value: "Reserve Oceanografic if visiting" },
        { label: "Neighborhood stay", value: "Old Town or Ruzafa" },
      ],
      checklist: [
        "Pack sun protection for beach time",
        "Save a map of the Turia Gardens",
        "Plan a long mid-day break",
        "Reserve Oceanografic tickets if needed",
        "Bring comfortable walking shoes",
        "Carry a reusable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Valencia?",
          answer:
            "Yes. Three days covers the old town, gardens, and a beach afternoon.",
        },
        {
          question: "Do I need to include the beach?",
          answer:
            "It is recommended for pacing, but you can swap it for more city time.",
        },
        {
          question: "Is Valencia walkable?",
          answer:
            "The center is walkable. Use tram or bus for the beach.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Old Town is central, while Ruzafa adds a local, food-forward feel.",
        },
        {
          question: "Should I visit the City of Arts and Sciences?",
          answer:
            "Yes for the architecture and a short walk around the complex.",
        },
        {
          question: "What pace works best?",
          answer:
            "One main area per day, with an easy beach or park break.",
        },
        {
          question: "Is Valencia good for first-timers?",
          answer:
            "Yes. The city is approachable and easy to navigate on foot.",
        },
      ],
      relatedItineraries: [
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Seaside walks and neighborhood loops.",
        },
        {
          slug: "seville",
          city: "Seville",
          days: 3,
          description: "Plazas, parks, and slow city walks.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museums and central plazas at a calm pace.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    oslo: {
      slug: "oslo",
      city: "Oslo",
      country: "Norway",
      days: 3,
      pace: "Balanced",
      idealFor: ["Waterfront walks", "Museum time", "Quiet city breaks"],
      style: ["Harbor strolls", "Park pauses", "Compact museums"],
      pacing: [
        "Oslo moves at a steady, relaxed pace. Plan one anchor area per day and keep the rest for waterfront walks.",
        "Pair museums with nearby parks to keep afternoons light.",
        "Use the final day for a calm fjord-side loop and a long cafe break.",
      ],
      hero: {
        title: "Oslo in 3 days",
        subtitle:
          "Harbor walks, park pauses, and compact museums with plenty of time to slow down.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Oslo_Opera_House.jpg",
          alt: "Oslo waterfront with boats and modern buildings.",
        },
      },
      cityStats: [
        { value: "Harbor", label: "Easy waterfront loops" },
        { value: "Parks", label: "Green breaks between stops" },
        { value: "Museums", label: "Compact cultural visits" },
        { value: "Trams", label: "Quick city connections" },
      ],
      fit: {
        forYou: ["Calm city rhythm", "Waterfront views", "Short walking days", "Museum afternoons", "Easy transit"],
        notForYou: ["Packed nightlife plans", "Fast sightseeing pace", "Long day trips", "Heavy shopping days", "High-intensity itineraries"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Harbor and opera",
          summary: "Waterfront walks and city views.",
          morning: "Opera House exterior and harbor walk",
          afternoon: "Aker Brygge promenade",
          evening: "Sunset along the fjord",
        },
        {
          day: 2,
          title: "Parks and museums",
          summary: "Green space and a museum stop.",
          morning: "Vigeland Park",
          afternoon: "Museum visit in Bygdoy",
          evening: "Cafe break in the center",
        },
        {
          day: 3,
          title: "Neighborhood loops",
          summary: "Calm streets and easy viewpoints.",
          morning: "Akershus Fortress exterior walk",
          afternoon: "Grunerlokka cafes and small shops",
          evening: "Return to the waterfront for a short loop",
        },
      ],
      imageInfoCards: [
        {
          title: "Harbor walks",
          description:
            "The waterfront sets the tone for a slow, scenic pace.",
          image: {
            src: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848a?auto=format&fit=crop&w=1200&q=80",
            alt: "Oslo harbor with boats and the city skyline.",
          },
        },
        {
          title: "Park pauses",
          description:
            "Green spaces like Vigeland Park make it easy to reset the day.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Tree-lined path in a park in Oslo.",
          },
        },
        {
          title: "Modern architecture",
          description:
            "New waterfront buildings add contrast without extra travel time.",
          image: {
            src: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
            alt: "Modern buildings by Oslo's waterfront.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "June to September" },
        { label: "Airport transfer", value: "Train to Oslo Central" },
        { label: "Transit tips", value: "Trams cover most city routes" },
        { label: "Ticketing", value: "Reserve museums in peak season" },
        { label: "Neighborhood stay", value: "City Center or Aker Brygge" },
      ],
      checklist: [
        "Pack a light rain layer",
        "Bring comfortable walking shoes",
        "Save a tram map offline",
        "Plan one long waterfront break",
        "Reserve museums if visiting",
        "Keep a warm layer for evenings",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Oslo?",
          answer:
            "Yes. The center and main museums are compact and easy to cover in three days.",
        },
        {
          question: "Is Oslo walkable?",
          answer:
            "The core is walkable, and trams help for longer distances.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "A day pass is helpful if you plan multiple tram rides or museum stops.",
        },
        {
          question: "Where should I stay?",
          answer:
            "City Center is convenient, while Aker Brygge keeps you by the water.",
        },
        {
          question: "Is Bygdoy worth visiting?",
          answer:
            "Yes if you want a museum day. You can keep it short and focused.",
        },
        {
          question: "What pace works best?",
          answer:
            "One waterfront loop or museum per day, then a slow cafe break.",
        },
        {
          question: "Is Oslo good for a calm trip?",
          answer:
            "Yes. The city is quiet and easy to navigate without rushing.",
        },
      ],
      relatedItineraries: [
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Waterfront walks and bike-friendly routes.",
        },
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Island walks and compact museums.",
        },
        {
          slug: "berlin",
          city: "Berlin",
          days: 3,
          description: "Relaxed parks and neighborhood loops.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    reykjavik: {
      slug: "reykjavik",
      city: "Reykjavik",
      country: "Iceland",
      days: 3,
      pace: "Balanced",
      idealFor: ["Coastal walks", "Cafe breaks", "Short city stays"],
      style: ["Seaside strolls", "Colorful streets", "Cozy cafes"],
      pacing: [
        "Reykjavik is small and walkable. Keep each day light with one anchor stop and long waterfront walks.",
        "Mix downtown lanes with the harbor for variety without extra transit.",
        "Use the final day for a slow loop and time in a warm cafe.",
      ],
      hero: {
        title: "Reykjavik in 3 days",
        subtitle:
          "Walkable downtown streets, coastal views, and cozy cafe pauses at a calm pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hallgrímskirkja_church,_Reykjavik,_Iceland.jpg",
          alt: "Reykjavik skyline with colorful rooftops and the coastline.",
        },
      },
      cityStats: [
        { value: "Waterfront", label: "Easy coastal walks" },
        { value: "Downtown", label: "Compact city center" },
        { value: "Cafes", label: "Warm indoor breaks" },
        { value: "Viewpoints", label: "Short scenic climbs" },
      ],
      fit: {
        forYou: ["Walkable city centers", "Coastal views", "Short museum stops", "Cafe culture", "Slow pacing"],
        notForYou: ["High-energy nightlife", "Packed schedules", "Long drives as a priority", "Heavy shopping itineraries", "Rushed day trips"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Downtown core",
          summary: "Colorful streets and the main landmarks.",
          morning: "Laugavegur walk and central streets",
          afternoon: "Hallgrimskirkja area and viewpoint",
          evening: "Downtown dinner and short stroll",
        },
        {
          day: 2,
          title: "Harbor and museums",
          summary: "Waterfront walks and compact museums.",
          morning: "Old Harbor promenade",
          afternoon: "Harpa exterior and nearby museum stop",
          evening: "Seaside walk at dusk",
        },
        {
          day: 3,
          title: "Neighborhood loops",
          summary: "Calm streets and cafe time.",
          morning: "Tjornin lake loop",
          afternoon: "Cozy cafe break and small shops",
          evening: "Return to the waterfront for a quiet loop",
        },
      ],
      imageInfoCards: [
        {
          title: "Colorful streets",
          description:
            "Downtown lanes are compact, so you can keep walking distances short.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Colorful houses along a street in Reykjavik.",
          },
        },
        {
          title: "Harbor views",
          description:
            "The harbor walk is a natural pause point between sightseeing blocks.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Harbor view in Reykjavik with boats and modern buildings.",
          },
        },
        {
          title: "Cozy cafe breaks",
          description:
            "Warm cafes make it easy to slow down during cooler hours.",
          image: {
            src: "https://images.unsplash.com/photo-1516900557543-41557bfc7ef7?auto=format&fit=crop&w=1200&q=80",
            alt: "Cozy cafe interior in Reykjavik.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "June to September for mild weather" },
        { label: "Airport transfer", value: "Flybus or taxi to downtown" },
        { label: "Transit tips", value: "Walk most routes; buses for longer hops" },
        { label: "Ticketing", value: "Reserve museum tickets on peak days" },
        { label: "Neighborhood stay", value: "Downtown or near Old Harbor" },
      ],
      checklist: [
        "Pack a windproof layer",
        "Bring walking shoes with grip",
        "Save an offline map of downtown",
        "Plan one long cafe break daily",
        "Reserve museums if visiting",
        "Carry a reusable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Reykjavik?",
          answer:
            "Yes. The city core is compact and easy to explore in three days.",
        },
        {
          question: "Is Reykjavik walkable?",
          answer:
            "Very. Most highlights are within a short walk of downtown.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Not for the core. Buses help if you want to reduce walking.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Downtown keeps everything close, while the Old Harbor adds a calm vibe.",
        },
        {
          question: "Should I add a day trip?",
          answer:
            "This guide focuses on the city. Add a day trip only if you have extra time.",
        },
        {
          question: "What pace works best?",
          answer:
            "One anchor stop per day, then long waterfront walks and cafes.",
        },
        {
          question: "Is Reykjavik good for a calm trip?",
          answer:
            "Yes. The city is small, quiet, and easy to navigate.",
        },
      ],
      relatedItineraries: [
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Waterfront walks and quiet parks.",
        },
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Harbor strolls and relaxed neighborhoods.",
        },
        {
          slug: "dublin",
          city: "Dublin",
          days: 3,
          description: "Walkable center and riverside loops.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    istanbul: {
      slug: "istanbul",
      city: "Istanbul",
      country: "Turkey",
      days: 3,
      pace: "Balanced",
      idealFor: ["History lovers", "Neighborhood explorers", "First-time visitors"],
      style: ["Historic cores", "Ferry views", "Market strolls"],
      pacing: [
        "Istanbul rewards a steady rhythm: anchor each day in one main district and keep the rest for short walks and tea breaks.",
        "Split the historic peninsula across two days to avoid overloading sights.",
        "End with a slower day along the Bosphorus for water views and fresh air.",
      ],
      hero: {
        title: "Istanbul in 3 days",
        subtitle:
          "Historic cores, market walks, and Bosphorus views with a calm, steady pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hagia_Sophia_Istanbul_Old_City,_Turkey_(Unsplash).jpg",
          alt: "Istanbul skyline with domes and minarets at sunset.",
        },
      },
      cityStats: [
        { value: "Historic core", label: "Compact landmark district" },
        { value: "Bosphorus", label: "Easy water views" },
        { value: "Bazaars", label: "Short market walks" },
        { value: "Ferries", label: "Scenic crossings" },
      ],
      fit: {
        forYou: ["Historic landmarks", "Neighborhood walks", "Market strolls", "Cafe breaks", "Flexible pacing"],
        notForYou: ["Fast-paced checklist travel", "Nightlife-only plans", "Long day trips", "Heavy shopping-only itineraries", "Rigid schedules"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic peninsula core",
          summary: "Major landmarks and easy squares.",
          morning: "Hagia Sophia exterior and nearby squares",
          afternoon: "Blue Mosque area and gardens",
          evening: "Sunset walk in Sultanahmet",
        },
        {
          day: 2,
          title: "Bazaars and waterfront",
          summary: "Market time and short water views.",
          morning: "Grand Bazaar and nearby lanes",
          afternoon: "Spice Bazaar and Golden Horn walk",
          evening: "Galata Bridge stroll and dinner",
        },
        {
          day: 3,
          title: "Bosphorus pace",
          summary: "Ferry views and calm neighborhoods.",
          morning: "Bosphorus ferry or waterfront walk",
          afternoon: "Ortakoy or Karakoy cafes",
          evening: "Waterfront sunset and tea break",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic skyline",
          description:
            "Domes and minarets frame the day without needing long walks.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Istanbul skyline with historic architecture.",
          },
        },
        {
          title: "Market lanes",
          description:
            "Short market loops add texture without overloading the schedule.",
          image: {
            src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
            alt: "Covered market lane in Istanbul.",
          },
        },
        {
          title: "Bosphorus views",
          description:
            "Ferry crossings and waterfront walks keep the pace calm.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Bosphorus waterfront with boats and skyline.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September" },
        { label: "Airport transfer", value: "Metro or taxi to the center" },
        { label: "Transit tips", value: "Use trams in the historic core" },
        { label: "Ticketing", value: "Reserve major sites if entering" },
        { label: "Neighborhood stay", value: "Sultanahmet or Karakoy" },
      ],
      checklist: [
        "Book entry times for major sites",
        "Wear comfortable walking shoes",
        "Carry a light layer for breezy evenings",
        "Save a map of the historic core",
        "Plan tea breaks between stops",
        "Keep small cash for trams",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Istanbul?",
          answer:
            "Yes for the main historic areas and a Bosphorus day at a calm pace.",
        },
        {
          question: "Is Istanbul walkable?",
          answer:
            "Key areas are walkable, but trams help connect longer distances.",
        },
        {
          question: "Do I need to pre-book attractions?",
          answer:
            "Yes for the most popular sites in peak season.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Sultanahmet is closest to landmarks, while Karakoy adds a neighborhood feel.",
        },
        {
          question: "Should I take a Bosphorus ferry?",
          answer:
            "Yes. It is a calm, scenic way to see the city from the water.",
        },
        {
          question: "What pace works best?",
          answer:
            "One district focus per day, with tea breaks in between.",
        },
        {
          question: "Is Istanbul good for first-timers?",
          answer:
            "Yes. The main districts are clear and rewarding without rushing.",
        },
      ],
      relatedItineraries: [
        {
          slug: "athens",
          city: "Athens",
          days: 3,
          description: "Ancient sites and neighborhood cafes.",
        },
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Iconic landmarks and historic streets.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube walks and historic hills.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    naples: {
      slug: "naples",
      city: "Naples",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["Food lovers", "Historic walks", "First-time visitors"],
      style: ["Historic streets", "Seaside pauses", "Local markets"],
      pacing: [
        "Naples is lively, so keep each day focused on one area and add long breaks for coffee and people-watching.",
        "Pair the historic center with the waterfront on separate days to keep walking light.",
        "End with a slow loop through local streets and a relaxed dinner.",
      ],
      hero: {
        title: "Naples in 3 days",
        subtitle:
          "Historic streets, seaside pauses, and food-first pacing that keeps the days calm.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Castel_dell%27Ovo_(Naples).jpg",
          alt: "Naples waterfront with Mount Vesuvius in the distance.",
        },
      },
      cityStats: [
        { value: "Historic core", label: "Dense streets and lanes" },
        { value: "Waterfront", label: "Easy seaside walks" },
        { value: "Markets", label: "Food-focused mornings" },
        { value: "Views", label: "Short lookout loops" },
      ],
      fit: {
        forYou: ["Food-first pacing", "Historic streets", "Short walks", "Local markets", "Flexible days"],
        notForYou: ["High-intensity sightseeing", "Late-night party focus", "Packed museum schedules", "Long day trips", "Shopping-only itineraries"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center",
          summary: "Old town streets and market time.",
          morning: "Spaccanapoli walk and side streets",
          afternoon: "Historic churches and small squares",
          evening: "Pizza dinner and short evening stroll",
        },
        {
          day: 2,
          title: "Waterfront and views",
          summary: "Seaside walks and easy viewpoints.",
          morning: "Castel dell'Ovo exterior and harbor walk",
          afternoon: "Lungomare promenade",
          evening: "Sunset by the water",
        },
        {
          day: 3,
          title: "Museums and neighborhoods",
          summary: "Museum time and local streets.",
          morning: "National Archaeological Museum",
          afternoon: "Vomero neighborhood and viewpoint",
          evening: "Calm dinner in a local trattoria",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic lanes",
          description:
            "The old town is dense but walkable, perfect for short loops.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Narrow historic street in Naples.",
          },
        },
        {
          title: "Seaside promenade",
          description:
            "The waterfront is where the city slows down the most.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Naples waterfront promenade with calm sea.",
          },
        },
        {
          title: "City viewpoints",
          description:
            "Short climbs give broad views without adding heavy distance.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Viewpoint over Naples with rooftops and the sea.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September" },
        { label: "Airport transfer", value: "Bus or taxi to the center" },
        { label: "Transit tips", value: "Walk the core; metro for hills" },
        { label: "Ticketing", value: "Reserve museum tickets on weekends" },
        { label: "Neighborhood stay", value: "Centro Storico or Chiaia" },
      ],
      checklist: [
        "Pack comfortable walking shoes",
        "Save an offline map of the old town",
        "Plan one long cafe break daily",
        "Reserve museum tickets if needed",
        "Carry a light layer for evenings",
        "Keep small cash for markets",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Naples?",
          answer:
            "Yes. Three days covers the historic center, waterfront, and a museum day.",
        },
        {
          question: "Is Naples walkable?",
          answer:
            "The historic center is walkable. Use metro or funicular for hills.",
        },
        {
          question: "Should I visit the Archaeological Museum?",
          answer:
            "Yes if you enjoy history. Plan a half day to keep the pace light.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Centro Storico is central, while Chiaia is calmer near the water.",
        },
        {
          question: "Do I need a day trip to Pompeii?",
          answer:
            "Not for this guide. Keep the focus on Naples for a calm pace.",
        },
        {
          question: "What pace works best?",
          answer:
            "One main area per day, with long breaks for food and people-watching.",
        },
        {
          question: "Is Naples good for first-timers?",
          answer:
            "Yes. It is lively but manageable with a simple daily plan.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient sights and classic piazzas.",
        },
        {
          slug: "florence",
          city: "Florence",
          days: 3,
          description: "Art, river walks, and calm squares.",
        },
        {
          slug: "venice",
          city: "Venice",
          days: 3,
          description: "Canal walks and slow island time.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    nice: {
      slug: "nice",
      city: "Nice",
      country: "France",
      days: 3,
      pace: "Balanced",
      idealFor: ["Seaside breaks", "Old town walkers", "Easy viewpoints"],
      style: ["Seaside promenades", "Old town lanes", "Viewpoint pauses"],
      pacing: [
        "Nice is built for slow seaside walks. Keep each day light with one main stop and plenty of promenade time.",
        "Split the old town and seaside into different days to avoid overloading the pace.",
        "Use the final day for a relaxed viewpoint and a long beach break.",
      ],
      hero: {
        title: "Nice in 3 days",
        subtitle:
          "Seaside promenades, old town lanes, and calm viewpoint walks with time to pause.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Promenade_des_Anglais_(Nice).jpg",
          alt: "Nice coastline with blue water and the promenade.",
        },
      },
      cityStats: [
        { value: "Promenade", label: "Long seaside walks" },
        { value: "Old Town", label: "Compact historic core" },
        { value: "Viewpoints", label: "Short hilltop pauses" },
        { value: "Markets", label: "Easy morning stops" },
      ],
      fit: {
        forYou: ["Beach and city mix", "Short walking loops", "Old town cafes", "Slow pacing", "Easy viewpoints"],
        notForYou: ["High-energy nightlife", "Packed day trips", "Museum-only travel", "Fast-paced touring", "Heavy shopping focus"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and markets",
          summary: "Historic lanes and light market stops.",
          morning: "Old Town lanes and Cours Saleya",
          afternoon: "Seaside promenade walk",
          evening: "Old town dinner and short loop",
        },
        {
          day: 2,
          title: "Seaside and viewpoints",
          summary: "Promenade time and a gentle climb.",
          morning: "Promenade des Anglais walk",
          afternoon: "Castle Hill viewpoint",
          evening: "Sunset by the water",
        },
        {
          day: 3,
          title: "Neighborhood strolls",
          summary: "Calm streets and cafe breaks.",
          morning: "Port area walk and small squares",
          afternoon: "Cafe pause and light shopping",
          evening: "Return to the promenade for a slow loop",
        },
      ],
      imageInfoCards: [
        {
          title: "Seaside promenade",
          description:
            "The long coastal path sets a calm rhythm for the day.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Promenade des Anglais with blue water in Nice.",
          },
        },
        {
          title: "Old town lanes",
          description:
            "Short lanes and shaded corners make the old town easy to explore.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Old town street in Nice with pastel buildings.",
          },
        },
        {
          title: "Viewpoint pauses",
          description:
            "A short climb gives wide views without adding a long hike.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "View of Nice coastline from a hilltop viewpoint.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September" },
        { label: "Airport transfer", value: "Tram or taxi to the center" },
        { label: "Transit tips", value: "Walk the core; tram for longer hops" },
        { label: "Ticketing", value: "Reserve museums in peak season" },
        { label: "Neighborhood stay", value: "Old Town or Promenade" },
      ],
      checklist: [
        "Pack sun protection for seaside walks",
        "Bring comfortable walking shoes",
        "Save a map of the old town",
        "Plan a long beach break",
        "Carry a light layer for evenings",
        "Keep small cash for markets",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Nice?",
          answer:
            "Yes. Three days is enough for the old town, promenade, and a viewpoint day.",
        },
        {
          question: "Is Nice walkable?",
          answer:
            "The center is walkable, and the promenade is flat and easy.",
        },
        {
          question: "Should I visit Castle Hill?",
          answer:
            "Yes for the views. The walk is short and manageable.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Old Town is central, while the Promenade keeps you near the water.",
        },
        {
          question: "Do I need a day trip?",
          answer:
            "Not for this guide. The focus is on keeping the pace calm in Nice.",
        },
        {
          question: "What pace works best?",
          answer:
            "One main area per day, then long walks along the sea.",
        },
        {
          question: "Is Nice good for first-time visitors?",
          answer:
            "Yes. The city is compact and easy to navigate without rushing.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks and cafe culture.",
        },
        {
          slug: "florence",
          city: "Florence",
          days: 3,
          description: "Art-filled walks and river views.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Seaside neighborhoods and relaxed pacing.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    warsaw: {
      slug: "warsaw",
      city: "Warsaw",
      country: "Poland",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History enthusiasts", "City walkers"],
      style: ["Historic old town", "Modern districts", "River walks"],
      pacing: [
        "Warsaw rewards a measured pace. The rebuilt Old Town anchors the first day, then spread out to modern neighborhoods and riverside paths that show the city's layered history.",
        "Group sights by area to minimize transit. The Old Town and Royal Castle work as one walk, while the modern center and Vistula riverfront offer a different rhythm with parks and contemporary architecture.",
        "Save time for Lazienki Park and the Palace of Culture area, where you can slow down with green spaces, quiet cafes, and views that span from historic to modern Warsaw.",
      ],
      hero: {
        title: "Warsaw in 3 days",
        subtitle:
          "Explore the rebuilt Old Town, modern districts, and riverside walks with a calm, practical pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
          alt: "Colorful historic buildings in Warsaw Old Town Square.",
        },
      },
      cityStats: [
        { value: "1.8M", label: "Residents in the metro area" },
        { value: "18", label: "Districts across the city" },
        { value: "85%", label: "City rebuilt after WWII" },
        { value: "30+", label: "Museums and galleries" },
      ],
      fit: {
        forYou: [
          "A first visit with historic and modern contrasts",
          "Walkable routes with clear neighborhoods",
          "A mix of history and contemporary culture",
          "Riverside walks and park time",
          "Clear, practical planning",
        ],
        notForYou: [
          "Day trips outside the city",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Adventure or hiking activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town and Royal Castle",
          summary: "Rebuilt historic center and castle grounds.",
          morning: "Old Town Square and Market Square",
          afternoon: "Royal Castle and Castle Square",
          evening: "Vistula riverfront walk",
        },
        {
          day: 2,
          title: "Modern center and culture",
          summary: "Contemporary districts and cultural sites.",
          morning: "Palace of Culture area and modern center",
          afternoon: "Warsaw Uprising Museum or POLIN Museum",
          evening: "Nowy Swiat street and cafe stop",
        },
        {
          day: 3,
          title: "Parks and viewpoints",
          summary: "Green spaces and city views.",
          morning: "Lazienki Park and Palace on the Water",
          afternoon: "Wilanow Palace or continued park time",
          evening: "Vistula boulevards and sunset views",
        },
      ],
      imageInfoCards: [
        {
          title: "The rebuilt Old Town",
          description:
            "Warsaw's historic center was meticulously reconstructed after WWII. The colorful facades and cobblestone squares feel authentic despite being rebuilt.",
          image: {
            src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic buildings and cobblestone streets in Warsaw Old Town.",
          },
        },
        {
          title: "Modern and historic layers",
          description:
            "The city blends reconstructed history with contemporary architecture. Short walks reveal both eras side by side.",
          image: {
            src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
            alt: "Warsaw skyline showing modern and historic buildings.",
          },
        },
        {
          title: "Riverside and parks",
          description:
            "The Vistula riverfront and Lazienki Park offer calm breaks from city streets, with easy walks and green spaces.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Lazienki Park with palace and gardens in Warsaw.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Train to Central Station or taxi" },
        { label: "Transit tips", value: "Walk Old Town; use trams for modern center" },
        { label: "Ticketing", value: "Book Royal Castle and major museums in advance" },
        { label: "Neighborhood stay", value: "Old Town area or modern center" },
      ],
      checklist: [
        "Reserve Royal Castle time slot",
        "Book Warsaw Uprising Museum if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Warsaw",
        "Plan one park or riverside break daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Warsaw?",
          answer:
            "Yes for the main highlights. This plan covers the Old Town, modern center, and key parks with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book museums?",
          answer:
            "For the Royal Castle and popular museums like the Warsaw Uprising Museum, yes. Pre-booking helps avoid lines and keeps your schedule on track.",
        },
        {
          question: "Is Warsaw walkable?",
          answer:
            "The Old Town is very walkable, and the modern center connects well on foot. Use trams or metro for longer hops to Lazienki Park or Wilanow.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The Old Town area keeps you close to historic sights and evening walks, while the modern center offers more contemporary options with easy transit links.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for museum days to beat crowds. The Old Town is pleasant in the morning, and you can slow down with a long lunch and relaxed afternoon.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, especially in the Old Town, yes—particularly on weekends. Keep one or two reservations, then leave the rest flexible.",
        },
        {
          question: "Is the Old Town really rebuilt?",
          answer:
            "Yes, the Old Town was reconstructed after WWII using historical documents and paintings. It's now a UNESCO World Heritage site and feels authentic despite being rebuilt.",
        },
      ],
      relatedItineraries: [
        {
          slug: "krakow",
          city: "Krakow",
          days: 3,
          description: "Historic old town and castle hill.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old Town Square and castle views.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube views and historic hills.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    granada: {
      slug: "granada",
      city: "Granada",
      country: "Spain",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Mountain views"],
      style: ["Alhambra palace", "Historic quarters", "Moorish architecture"],
      pacing: [
        "Granada rewards a focused approach. The Alhambra deserves a full morning, then spread out to the Albaicin and Sacromonte for historic neighborhoods and mountain views.",
        "Book Alhambra tickets well in advance—this is essential. Plan one day entirely around the palace complex, then use the other days for the old quarters and relaxed walks.",
        "The Albaicin's narrow lanes and viewpoints pair well with slow afternoons. Save time for tapas in the evening, where Granada's food culture shines.",
      ],
      hero: {
        title: "Granada in 3 days",
        subtitle:
          "Explore the Alhambra, historic Albaicin quarter, and mountain views with a calm, practical pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1759434613657-422a87ff991a?auto=format&fit=crop&w=1600&q=80",
          alt: "The Alhambra palace complex with mountains in the background.",
        },
      },
      cityStats: [
        { value: "230K", label: "Residents in the city" },
        { value: "800+", label: "Years of Moorish history" },
        { value: "3M+", label: "Annual visitors" },
        { value: "1", label: "UNESCO World Heritage site" },
      ],
      fit: {
        forYou: [
          "A first visit focused on the Alhambra",
          "Historic neighborhoods and viewpoints",
          "Mountain views and easy walks",
          "Moorish architecture and culture",
          "A clear plan with advance booking",
        ],
        notForYou: [
          "Day trips outside Granada",
          "Late-night nightlife focus",
          "A packed schedule without Alhambra booking",
          "Beach or coastal activities",
          "Extensive shopping time",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "The Alhambra",
          summary: "Full day exploring the palace complex.",
          morning: "Alhambra entry and Nasrid Palaces",
          afternoon: "Generalife gardens and Alcazaba",
          evening: "Albaicin viewpoint and tapas",
        },
        {
          day: 2,
          title: "Albaicin and Sacromonte",
          summary: "Historic quarters and mountain views.",
          morning: "Albaicin quarter and narrow lanes",
          afternoon: "Mirador de San Nicolas and viewpoints",
          evening: "Sacromonte area or continued Albaicin exploration",
        },
        {
          day: 3,
          title: "Cathedral and city center",
          summary: "Historic center and relaxed walks.",
          morning: "Granada Cathedral and Royal Chapel",
          afternoon: "Alcaiceria market and shopping streets",
          evening: "Final tapas tour and evening stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "The Alhambra complex",
          description:
            "The palace, gardens, and fortress form one of Spain's most visited sites. Book tickets weeks in advance for your preferred time slot.",
          image: {
            src: "https://images.unsplash.com/photo-1555993536-48e0c8b73fd4?auto=format&fit=crop&w=1200&q=80",
            alt: "Intricate Moorish architecture in the Nasrid Palaces of the Alhambra.",
          },
        },
        {
          title: "Albaicin viewpoints",
          description:
            "The historic quarter offers narrow lanes and viewpoints that frame the Alhambra against the Sierra Nevada mountains.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic Albaicin quarter with white houses and narrow streets.",
          },
        },
        {
          title: "Mountain backdrop",
          description:
            "Granada sits at the foot of the Sierra Nevada, creating dramatic views from the Albaicin and Alhambra grounds.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Granada city with Sierra Nevada mountains in the background.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Bus to city center or taxi" },
        { label: "Transit tips", value: "Walk the historic center; use buses for Alhambra" },
        { label: "Ticketing", value: "Book Alhambra tickets weeks in advance" },
        { label: "Neighborhood stay", value: "City center or Albaicin area" },
      ],
      checklist: [
        "Book Alhambra tickets weeks in advance",
        "Reserve Nasrid Palaces time slot",
        "Pack comfortable walking shoes for hills",
        "Save offline maps for Granada",
        "Plan one viewpoint stop daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Granada?",
          answer:
            "Yes for the Alhambra and main historic quarters. This plan dedicates one full day to the palace, then covers the Albaicin and city center with a calm pace.",
        },
        {
          question: "Do I need to book the Alhambra in advance?",
          answer:
            "Absolutely yes. Book tickets weeks ahead, especially for peak season. The Nasrid Palaces require a specific time slot that sells out quickly.",
        },
        {
          question: "Is Granada walkable?",
          answer:
            "The historic center is walkable, but the Albaicin has steep hills. Wear comfortable shoes and take breaks. The Alhambra requires a bus or taxi from the center.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The city center keeps you close to the cathedral and restaurants, while the Albaicin offers historic atmosphere and views, though with steeper walks.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the Alhambra to make the most of your time slot. For the Albaicin, mornings are cooler and less crowded.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular tapas spots, yes—especially in the evening. Granada's tapas culture is strong, so plan a few stops but leave room for spontaneity.",
        },
        {
          question: "Can I visit the Alhambra without advance booking?",
          answer:
            "It's very difficult, especially in peak season. Same-day tickets are rare. Book well in advance to secure your preferred date and time slot.",
        },
      ],
      relatedItineraries: [
        {
          slug: "seville",
          city: "Seville",
          days: 3,
          description: "Historic plazas and riverside walks.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture and walkable neighborhoods.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Museums, parks, and classic squares.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    lyon: {
      slug: "lyon",
      city: "Lyon",
      country: "France",
      days: 3,
      pace: "Balanced",
      idealFor: ["Food lovers", "History enthusiasts", "Riverside walkers"],
      style: ["Roman history", "Gastronomy", "Riverside neighborhoods"],
      pacing: [
        "Lyon rewards a food-first approach. The historic Vieux Lyon anchors the first day, then spread out to the Presqu'ile and Fourviere for Roman sites and riverside walks.",
        "Group time by neighborhood to keep travel simple. Vieux Lyon pairs with Fourviere Hill for history, while the Presqu'ile offers shopping, markets, and easy river views.",
        "Save time for long meals and market visits. Lyon's bouchons and food markets are part of the experience, so plan relaxed lunches and evening dinners.",
      ],
      hero: {
        title: "Lyon in 3 days",
        subtitle:
          "Explore Roman history, gastronomy, and riverside neighborhoods with a calm, food-focused pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1530282279139-9cfdae52582f?auto=format&fit=crop&w=1600&q=80",
          alt: "Historic Vieux Lyon with Renaissance buildings and narrow streets.",
        },
      },
      cityStats: [
        { value: "500K", label: "Residents in the city" },
        { value: "2,000+", label: "Years of history" },
        { value: "4,000+", label: "Restaurants and bouchons" },
        { value: "2", label: "Rivers: Rhone and Saone" },
      ],
      fit: {
        forYou: [
          "A food-focused visit with history",
          "Riverside walks and Roman sites",
          "Historic neighborhoods and markets",
          "A mix of culture and gastronomy",
          "Clear, practical planning",
        ],
        notForYou: [
          "Day trips outside Lyon",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Beach or coastal activities",
          "Extensive shopping time",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Vieux Lyon and Fourviere",
          summary: "Historic quarter and hilltop basilica.",
          morning: "Vieux Lyon and traboules",
          afternoon: "Fourviere Basilica and Roman theaters",
          evening: "Riverside walk and bouchon dinner",
        },
        {
          day: 2,
          title: "Presqu'ile and markets",
          summary: "City center and food markets.",
          morning: "Presqu'ile and Place Bellecour",
          afternoon: "Les Halles market or shopping streets",
          evening: "Rhone riverfront and evening lights",
        },
        {
          day: 3,
          title: "Museums and riverside",
          summary: "Cultural sites and relaxed walks.",
          morning: "Musee des Beaux-Arts or Confluence Museum",
          afternoon: "Saone riverfront walk",
          evening: "Final bouchon meal and old town stroll",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic traboules",
          description:
            "Vieux Lyon's hidden passageways connect streets and courtyards. These Renaissance-era shortcuts are unique to Lyon.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Historic traboule passageway in Vieux Lyon.",
          },
        },
        {
          title: "Riverside views",
          description:
            "The Rhone and Saone rivers frame the city. Riverside walks offer views of historic and modern architecture.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Lyon cityscape with the Rhone and Saone rivers.",
          },
        },
        {
          title: "Food markets and bouchons",
          description:
            "Lyon's food culture centers on bouchons and markets. Plan time for long meals and market visits.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Colorful food market in Lyon with fresh produce.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Rhonexpress tram or taxi" },
        { label: "Transit tips", value: "Walk Vieux Lyon; use metro for Fourviere" },
        { label: "Ticketing", value: "Book major museums in advance if visiting" },
        { label: "Neighborhood stay", value: "Vieux Lyon or Presqu'ile" },
      ],
      checklist: [
        "Reserve restaurant tables for bouchons",
        "Book major museums if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Lyon",
        "Plan one long meal daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Lyon?",
          answer:
            "Yes for the main highlights. This plan covers Vieux Lyon, Fourviere, and the Presqu'ile with time for food markets and relaxed meals.",
        },
        {
          question: "Do I need to book restaurants?",
          answer:
            "For popular bouchons, yes—especially on weekends. Lyon's food scene is busy, so reserve a few meals in advance.",
        },
        {
          question: "Is Lyon walkable?",
          answer:
            "Vieux Lyon and the Presqu'ile are very walkable. Fourviere Hill requires a climb or funicular, but the historic center is flat and easy.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Vieux Lyon keeps you in the historic heart, while the Presqu'ile offers central location with easy access to markets and shopping.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Fourviere to avoid crowds and heat. Vieux Lyon is pleasant in the morning, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book museums?",
          answer:
            "For popular museums like the Musee des Beaux-Arts, booking helps in peak season. Check ahead for special exhibitions.",
        },
        {
          question: "What are traboules?",
          answer:
            "Traboules are hidden passageways that connect streets through buildings and courtyards. They're unique to Lyon and worth exploring in Vieux Lyon.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks and cafe culture.",
        },
        {
          slug: "nice",
          city: "Nice",
          days: 3,
          description: "Seaside promenades and old town lanes.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Gaudi architecture and walkable neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    salzburg: {
      slug: "salzburg",
      city: "Salzburg",
      country: "Austria",
      days: 3,
      pace: "Balanced",
      idealFor: ["Music lovers", "Mountain views", "Historic architecture"],
      style: ["Baroque buildings", "Mountain backdrop", "Music heritage"],
      pacing: [
        "Salzburg rewards a calm rhythm. The Old Town and fortress anchor the first day, then spread out to palace gardens and mountain viewpoints that show the city's baroque elegance.",
        "Group sights by area to minimize walking. The compact Old Town connects easily, while the Mirabell Palace and gardens offer a different pace with green spaces and river views.",
        "Save time for slow walks along the Salzach River and quiet moments in the Old Town squares. The city's baroque architecture and mountain backdrop create a peaceful atmosphere.",
      ],
      hero: {
        title: "Salzburg in 3 days",
        subtitle:
          "Explore the baroque Old Town, fortress, and mountain views with a calm, practical pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1750419594123-c2623bab7320?auto=format&fit=crop&w=1600&q=80",
          alt: "Salzburg Old Town with baroque buildings and mountains in the background.",
        },
      },
      cityStats: [
        { value: "150K", label: "Residents in the city" },
        { value: "1,000+", label: "Years of history" },
        { value: "7", label: "Hills surrounding the city" },
        { value: "1", label: "UNESCO World Heritage site" },
      ],
      fit: {
        forYou: [
          "A first visit with baroque architecture",
          "Mountain views and easy walks",
          "Music heritage and historic sites",
          "Compact, walkable Old Town",
          "Clear, practical planning",
        ],
        notForYou: [
          "Day trips outside Salzburg",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Beach or coastal activities",
          "Extensive shopping time",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town and fortress",
          summary: "Historic center and hilltop castle.",
          morning: "Hohensalzburg Fortress and funicular",
          afternoon: "Old Town squares and Getreidegasse",
          evening: "Salzach River walk and dinner",
        },
        {
          day: 2,
          title: "Palaces and gardens",
          summary: "Baroque palaces and green spaces.",
          morning: "Mirabell Palace and gardens",
          afternoon: "Hellbrunn Palace or continued garden time",
          evening: "Riverside promenade and evening lights",
        },
        {
          day: 3,
          title: "Music heritage and views",
          summary: "Mozart sites and mountain viewpoints.",
          morning: "Mozart's Birthplace or Residence",
          afternoon: "Kapuzinerberg viewpoint or Old Town stroll",
          evening: "Final Old Town walk and cafe stop",
        },
      ],
      imageInfoCards: [
        {
          title: "Baroque Old Town",
          description:
            "Salzburg's historic center features baroque architecture, narrow lanes, and squares that feel like stepping into another era.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Salzburg Cathedral with baroque architecture.",
          },
        },
        {
          title: "Mountain backdrop",
          description:
            "The city sits at the foot of the Alps, creating dramatic views from the fortress and riverfront that frame the baroque architecture.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Salzburg with mountains in the background.",
          },
        },
        {
          title: "Fortress views",
          description:
            "Hohensalzburg Fortress offers panoramic views of the city and mountains. The funicular makes the climb easy.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Hohensalzburg Fortress overlooking Salzburg.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Bus to city center or taxi" },
        { label: "Transit tips", value: "Walk Old Town; use funicular for fortress" },
        { label: "Ticketing", value: "Book fortress and major museums in advance" },
        { label: "Neighborhood stay", value: "Old Town area or near Mirabell" },
      ],
      checklist: [
        "Reserve Hohensalzburg Fortress tickets",
        "Book major museums if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Salzburg",
        "Plan one viewpoint stop daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Salzburg?",
          answer:
            "Yes for the main highlights. This plan covers the Old Town, fortress, and palaces with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book the fortress?",
          answer:
            "Booking helps avoid lines, especially in peak season. The funicular and fortress tickets can be purchased in advance or on arrival.",
        },
        {
          question: "Is Salzburg walkable?",
          answer:
            "The Old Town is very compact and walkable. The fortress requires a funicular ride, but the historic center is flat and easy to navigate.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The Old Town area keeps you close to historic sights and evening walks, while areas near Mirabell offer quieter streets with easy access to gardens.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the fortress to beat crowds and get the best views. The Old Town is pleasant in the morning, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Salzburg's dining scene is busy, so reserve a few meals in advance.",
        },
        {
          question: "Is Salzburg good for music lovers?",
          answer:
            "Yes. The city is Mozart's birthplace and offers several music-related sites, concerts, and a strong musical heritage throughout the Old Town.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Classic museums and palace gardens.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old Town Square and castle views.",
        },
        {
          slug: "munich",
          city: "Munich",
          days: 3,
          description: "Historic squares and garden breaks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    rotterdam: {
      slug: "rotterdam",
      city: "Rotterdam",
      country: "Netherlands",
      days: 3,
      pace: "Balanced",
      idealFor: ["Architecture fans", "Modern design", "Waterfront walkers"],
      style: ["Modern architecture", "Waterfront walks", "Cultural districts"],
      pacing: [
        "Rotterdam rewards a modern approach. The rebuilt city center showcases innovative architecture, then spread out to waterfront districts and cultural areas that show the city's contemporary character.",
        "Group sights by area to keep travel simple. The modern center and Markthal work as one walk, while the waterfront and Cube Houses offer a different rhythm with bridges and contemporary design.",
        "Save time for slow walks along the Maas River and quiet moments in the parks. The city's modern architecture and waterfront create a peaceful, forward-looking atmosphere.",
      ],
      hero: {
        title: "Rotterdam in 3 days",
        subtitle:
          "Explore modern architecture, waterfront walks, and cultural districts with a calm, practical pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1619768708936-2fce8c74cd04?auto=format&fit=crop&w=1600&q=80",
          alt: "Modern Rotterdam skyline with innovative architecture and bridges.",
        },
      },
      cityStats: [
        { value: "650K", label: "Residents in the city" },
        { value: "85%", label: "City rebuilt after WWII" },
        { value: "1,000+", label: "Modern architectural landmarks" },
        { value: "1", label: "Largest port in Europe" },
      ],
      fit: {
        forYou: [
          "A first visit with modern architecture",
          "Waterfront walks and bridges",
          "Contemporary design and culture",
          "Compact, walkable center",
          "Clear, practical planning",
        ],
        notForYou: [
          "Day trips outside Rotterdam",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Historic old town atmosphere",
          "Extensive shopping time",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Modern center and Markthal",
          summary: "Contemporary architecture and food market.",
          morning: "Markthal and modern center",
          afternoon: "Cube Houses and Overblaak area",
          evening: "Maas River waterfront walk",
        },
        {
          day: 2,
          title: "Waterfront and bridges",
          summary: "Erasmus Bridge and riverside districts.",
          morning: "Erasmus Bridge and Kop van Zuid",
          afternoon: "Maritime Museum or continued waterfront",
          evening: "Riverside promenade and evening lights",
        },
        {
          day: 3,
          title: "Museums and parks",
          summary: "Cultural sites and green spaces.",
          morning: "Museum Boijmans Van Beuningen or Kunsthal",
          afternoon: "Het Park or Euromast viewpoint",
          evening: "Final waterfront walk and dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Modern architecture",
          description:
            "Rotterdam's rebuilt city center features innovative buildings, bridges, and contemporary design that sets it apart from other Dutch cities.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Iconic Cube Houses in Rotterdam with modern architecture.",
          },
        },
        {
          title: "Waterfront walks",
          description:
            "The Maas River and waterfront districts offer calm walks with views of modern architecture and bridges.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Erasmus Bridge spanning the Maas River in Rotterdam.",
          },
        },
        {
          title: "Cultural districts",
          description:
            "The city's museums and cultural areas blend with modern architecture, creating a forward-looking cultural scene.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Modern Markthal food market in Rotterdam.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Train to Central Station or taxi" },
        { label: "Transit tips", value: "Walk the center; use trams for waterfront" },
        { label: "Ticketing", value: "Book major museums in advance if visiting" },
        { label: "Neighborhood stay", value: "City center or near Markthal" },
      ],
      checklist: [
        "Reserve major museum tickets if visiting",
        "Book restaurants for popular spots",
        "Pack comfortable walking shoes",
        "Save offline maps for Rotterdam",
        "Plan one waterfront walk daily",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Rotterdam?",
          answer:
            "Yes for the main highlights. This plan covers the modern center, waterfront, and key cultural sites with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book museums?",
          answer:
            "For popular museums like Museum Boijmans Van Beuningen, booking helps in peak season. Check ahead for special exhibitions.",
        },
        {
          question: "Is Rotterdam walkable?",
          answer:
            "The modern center is very walkable, and the waterfront connects well on foot. Use trams or metro for longer hops to museums or Euromast.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The city center keeps you close to the Markthal and modern architecture, while areas near the waterfront offer riverside views and easy access to bridges.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for museum days to beat crowds. The Markthal is pleasant in the morning, and you can slow down with a long lunch and relaxed afternoon.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Rotterdam's dining scene is busy, so reserve a few meals in advance.",
        },
        {
          question: "Is Rotterdam different from Amsterdam?",
          answer:
            "Yes. Rotterdam is more modern and architectural, rebuilt after WWII with contemporary design. Amsterdam has more historic canals and old buildings.",
        },
      ],
      relatedItineraries: [
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canals, museums, and historic neighborhoods.",
        },
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Waterfront strolls and design.",
        },
        {
          slug: "berlin",
          city: "Berlin",
          days: 3,
          description: "History and creative neighborhoods.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bergen: {
      slug: "bergen",
      city: "Bergen",
      country: "Norway",
      days: 3,
      pace: "Balanced",
      idealFor: ["Fjord lovers", "First-timers", "Mountain walkers"],
      style: ["Historic wharves", "Mountain views", "Waterfront strolls"],
      pacing: [
        "Bergen rewards a calm pace. Anchor each day with one main area—the historic Bryggen, a mountain viewpoint, or a waterfront walk—then leave room for cafes, markets, and slow exploration.",
        "Group sights by proximity to keep travel simple. The historic center and Bryggen work as one walk, while Fløyen mountain offers a different rhythm with views and nature.",
        "Save time for the fish market and quiet moments along the harbor. The city's compact size and fjord setting create a peaceful, manageable atmosphere.",
      ],
      hero: {
        title: "Bergen in 3 days",
        subtitle:
          "Explore historic wharves, mountain viewpoints, and fjord views with a calm, walkable pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryggen_in_Bergen.jpg",
          alt: "Historic Bryggen wharves in Bergen with colorful wooden buildings.",
        },
      },
      cityStats: [
        { value: "280K", label: "Residents in the city" },
        { value: "7", label: "Mountains surrounding the city" },
        { value: "900+", label: "Years of history" },
        { value: "1.2M", label: "Annual visitors" },
      ],
      fit: {
        forYou: [
          "A first visit with fjord views",
          "Historic wharves and mountain walks",
          "Compact, walkable center",
          "Clear, practical planning",
          "Waterfront and market time",
        ],
        notForYou: [
          "Day trips outside Bergen",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Long hiking expeditions",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic Bryggen and center",
          summary: "Colorful wharves and old town walks.",
          morning: "Bryggen wharves and historic buildings",
          afternoon: "Fish Market and harbor area",
          evening: "Waterfront walk and dinner",
        },
        {
          day: 2,
          title: "Fløyen mountain",
          summary: "Mountain views and nature walks.",
          morning: "Fløyen funicular and summit views",
          afternoon: "Mountain trails or return to center",
          evening: "Old town stroll and cafes",
        },
        {
          day: 3,
          title: "Museums and waterfront",
          summary: "Cultural sites and harbor views.",
          morning: "Hanseatic Museum or Bergenhus Fortress",
          afternoon: "Waterfront promenade and parks",
          evening: "Final harbor walk and sunset views",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic wharves",
          description:
            "Bryggen's colorful wooden buildings are UNESCO World Heritage, offering a glimpse into Bergen's trading past.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryggen_bergen_2005_2.jpg",
            alt: "Colorful wooden buildings of Bryggen wharves in Bergen.",
          },
        },
        {
          title: "Mountain viewpoints",
          description:
            "Fløyen and other surrounding mountains offer easy access to panoramic fjord and city views.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bergen_from_Floyen.jpg",
            alt: "View of Bergen city and fjord from Fløyen mountain.",
          },
        },
        {
          title: "Waterfront life",
          description:
            "The harbor and fish market create a lively, authentic atmosphere with fresh seafood and local culture.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bergen_fish_market.jpg",
            alt: "Bergen fish market with vendors and fresh seafood.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the center; funicular for Fløyen" },
        { label: "Ticketing", value: "Book Fløyen funicular in advance if needed" },
        { label: "Neighborhood stay", value: "City center near Bryggen" },
      ],
      checklist: [
        "Book Fløyen funicular tickets",
        "Pack layers for mountain weather",
        "Save offline maps for Bergen",
        "Plan one mountain walk",
        "Visit the fish market",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Bergen?",
          answer:
            "Yes for the main highlights. This plan covers Bryggen, Fløyen, and key cultural sites with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book the Fløyen funicular?",
          answer:
            "Booking helps in peak season to avoid waits. The funicular runs frequently, but advance tickets can save time.",
        },
        {
          question: "Is Bergen walkable?",
          answer:
            "The historic center is very walkable, and the waterfront connects well on foot. Use the funicular for Fløyen mountain access.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The city center near Bryggen keeps you close to historic sites and the harbor, with easy access to restaurants and cafes.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Fløyen to beat crowds and get clear views. The fish market is pleasant in the morning, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Bergen's dining scene focuses on fresh seafood, so reserve a few meals in advance.",
        },
        {
          question: "Is Bergen good for fjord views?",
          answer:
            "Yes. The city sits on a fjord, and Fløyen mountain offers excellent panoramic views of the harbor and surrounding fjords.",
        },
      ],
      relatedItineraries: [
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Waterfront walks and compact museums.",
        },
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Old town charm and island hopping.",
        },
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Waterfront strolls and design.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bologna: {
      slug: "bologna",
      city: "Bologna",
      country: "Italy",
      days: 2,
      pace: "Balanced",
      idealFor: ["Food lovers", "First-timers", "University town fans"],
      style: ["Medieval towers", "Food markets", "Historic squares"],
      pacing: [
        "Bologna rewards a food-first approach. Anchor each day with one main area—the historic center with its towers, or the university quarter—then leave room for long meals, market stops, and slow walks.",
        "The compact center makes it easy to group sights. Pair the Two Towers with Piazza Maggiore for classic sights, then explore the food markets and university area for a different rhythm.",
        "Save time for the food markets and quiet moments in the porticoes. The city's medieval architecture and food culture create a relaxed, authentic atmosphere.",
      ],
      hero: {
        title: "Bologna in 2 days",
        subtitle:
          "Explore medieval towers, food markets, and historic squares with a calm, walkable pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bologna_-_Due_Torri.jpg",
          alt: "Two Towers of Bologna rising above the historic city center.",
        },
      },
      cityStats: [
        { value: "390K", label: "Residents in the city" },
        { value: "900+", label: "Years of history" },
        { value: "38KM", label: "Porticoes throughout the city" },
        { value: "1", label: "Oldest university in Europe" },
      ],
      fit: {
        forYou: [
          "A first visit with medieval architecture",
          "Food markets and authentic cuisine",
          "Compact, walkable center",
          "Clear, practical planning",
          "University town atmosphere",
        ],
        notForYou: [
          "Day trips outside Bologna",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach or coastal activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center and towers",
          summary: "Two Towers and Piazza Maggiore.",
          morning: "Two Towers and historic center",
          afternoon: "Piazza Maggiore and Basilica di San Petronio",
          evening: "Food market area and dinner",
        },
        {
          day: 2,
          title: "University quarter and markets",
          summary: "University area and food markets.",
          morning: "University quarter and porticoes",
          afternoon: "Food markets and local shops",
          evening: "Historic center stroll and aperitivo",
        },
      ],
      imageInfoCards: [
        {
          title: "Medieval towers",
          description:
            "Bologna's Two Towers are iconic symbols of the city, offering views and a glimpse into medieval architecture.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Asinelli_e_Garisenda.jpg",
            alt: "The Two Towers of Bologna, Asinelli and Garisenda, in the historic center.",
          },
        },
        {
          title: "Food markets",
          description:
            "Bologna's food markets showcase the city's culinary heritage with fresh produce, pasta, and local specialties.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercato_di_Mezzo_Bologna.jpg",
            alt: "Food market in Bologna with fresh produce and local specialties.",
          },
        },
        {
          title: "Historic porticoes",
          description:
            "The city's extensive portico system provides covered walks throughout the historic center, unique to Bologna.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Portici_di_Bologna.jpg",
            alt: "Historic porticoes in Bologna providing covered walkways.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Airport bus or train to city center" },
        { label: "Transit tips", value: "Walk the center; everything is close" },
        { label: "Ticketing", value: "Book tower climb in advance if visiting" },
        { label: "Neighborhood stay", value: "Historic center near Piazza Maggiore" },
      ],
      checklist: [
        "Book Two Towers climb if interested",
        "Pack comfortable walking shoes",
        "Save offline maps for Bologna",
        "Plan time for food markets",
        "Try local pasta specialties",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Bologna?",
          answer:
            "Yes for the main highlights. This plan covers the historic center, towers, and food markets with a calm pace that leaves room for meals and unplanned stops.",
        },
        {
          question: "Do I need to book the Two Towers?",
          answer:
            "Booking helps in peak season to avoid waits. The tower climb offers great views but requires advance planning.",
        },
        {
          question: "Is Bologna walkable?",
          answer:
            "The historic center is very walkable and compact. Everything is within easy walking distance, and the porticoes provide covered walks.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The historic center near Piazza Maggiore keeps you close to the main sights, food markets, and restaurants.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the towers to beat crowds and get clear views. The food markets are pleasant in the morning, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Bologna is known for its food, so reserve a few meals in advance.",
        },
        {
          question: "Is Bologna good for food?",
          answer:
            "Yes. Bologna is considered the food capital of Italy, with excellent markets, pasta, and authentic cuisine throughout the city.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florence",
          days: 3,
          description: "Renaissance art and river walks.",
        },
        {
          slug: "venice",
          city: "Venice",
          days: 3,
          description: "Canal walks and classic churches.",
        },
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks and piazzas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bruges: {
      slug: "bruges",
      city: "Bruges",
      country: "Belgium",
      days: 2,
      pace: "Balanced",
      idealFor: ["Romantic breaks", "First-timers", "Slow walkers"],
      style: ["Medieval squares", "Canal strolls", "Historic churches"],
      pacing: [
        "Bruges rewards a slow, romantic pace. Anchor each day with one main area—the historic Markt square, or the quieter canal districts—then leave room for cafes, chocolate shops, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the Markt with the Belfry for classic sights, then explore the canals and quieter neighborhoods for a different rhythm.",
        "Save time for canal boat tours and quiet moments in the squares. The city's medieval architecture and peaceful canals create a relaxed, timeless atmosphere.",
      ],
      hero: {
        title: "Bruges in 2 days",
        subtitle:
          "Explore medieval squares, canal strolls, and historic churches with a calm, romantic pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brugge_grote_markt.jpg",
          alt: "Historic Markt square in Bruges with medieval buildings and the Belfry tower.",
        },
      },
      cityStats: [
        { value: "118K", label: "Residents in the city" },
        { value: "800+", label: "Years of history" },
        { value: "50+", label: "Bridges over canals" },
        { value: "UNESCO", label: "World Heritage Site" },
      ],
      fit: {
        forYou: [
          "A romantic, slow-paced visit",
          "Medieval architecture and canals",
          "Compact, walkable center",
          "Clear, practical planning",
          "Cafe and chocolate shop time",
        ],
        notForYou: [
          "Day trips outside Bruges",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Modern city atmosphere",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center and Markt",
          summary: "Markt square and Belfry tower.",
          morning: "Markt square and Belfry tower",
          afternoon: "Burg square and historic buildings",
          evening: "Canal walk and dinner",
        },
        {
          day: 2,
          title: "Canals and quiet districts",
          summary: "Canal tours and quieter neighborhoods.",
          morning: "Canal boat tour",
          afternoon: "Quieter canal districts and churches",
          evening: "Final square stroll and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Medieval squares",
          description:
            "Bruges' Markt and Burg squares showcase medieval architecture with colorful facades and historic buildings.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bruges_Burg.jpg",
            alt: "Historic Burg square in Bruges with medieval architecture.",
          },
        },
        {
          title: "Canal network",
          description:
            "The city's canals create a peaceful, romantic atmosphere with bridges, swans, and quiet waterfront walks.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bruges_canals.jpg",
            alt: "Peaceful canals in Bruges with historic buildings reflected in the water.",
          },
        },
        {
          title: "Historic churches",
          description:
            "Bruges' churches and bell towers add to the medieval atmosphere, with quiet interiors and historic art.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Our_Lady_Bruges.jpg",
            alt: "Church of Our Lady in Bruges with historic architecture.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Train from Brussels or Ghent" },
        { label: "Transit tips", value: "Walk everywhere; center is compact" },
        { label: "Ticketing", value: "Book canal tours in advance if needed" },
        { label: "Neighborhood stay", value: "Historic center near Markt" },
      ],
      checklist: [
        "Book canal boat tour",
        "Pack comfortable walking shoes",
        "Save offline maps for Bruges",
        "Plan time for cafes and chocolate",
        "Visit the Belfry if interested",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Bruges?",
          answer:
            "Yes for the main highlights. This plan covers the historic center, canals, and key sights with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book canal tours?",
          answer:
            "Booking helps in peak season to avoid waits. Canal tours are popular and offer great views of the city from the water.",
        },
        {
          question: "Is Bruges walkable?",
          answer:
            "The historic center is very walkable and compact. Everything is within easy walking distance, and the canals create natural walking routes.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The historic center near Markt keeps you close to the main sights, restaurants, and cafes, with easy access to everything.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early to beat crowds at the Markt and Belfry. The canals are pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Bruges' dining scene focuses on Belgian cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Bruges crowded?",
          answer:
            "Bruges can be busy, especially in peak season. Starting early and exploring quieter canal districts helps avoid the biggest crowds.",
        },
      ],
      relatedItineraries: [
        {
          slug: "brussels",
          city: "Brussels",
          days: 3,
          description: "Grand squares and museum districts.",
        },
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canals and historic neighborhoods.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old town and castle views.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dubrovnik: {
      slug: "dubrovnik",
      city: "Dubrovnik",
      country: "Croatia",
      days: 3,
      pace: "Balanced",
      idealFor: ["History lovers", "First-timers", "Coastal walkers"],
      style: ["Historic walls", "Adriatic views", "Old town walks"],
      pacing: [
        "Dubrovnik rewards a calm, coastal pace. Anchor each day with one main area—the historic old town, the city walls, or a nearby island—then leave room for cafes, viewpoints, and slow walks.",
        "The compact old town makes it easy to explore on foot. Pair the city walls with the main street for classic sights, then explore quieter lanes and viewpoints for a different rhythm.",
        "Save time for Lokrum Island and quiet moments along the walls. The city's historic architecture and Adriatic setting create a relaxed, scenic atmosphere.",
      ],
      hero: {
        title: "Dubrovnik in 3 days",
        subtitle:
          "Explore historic walls, Adriatic views, and old town walks with a calm, coastal pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_Old_Town.jpg",
          alt: "Historic old town of Dubrovnik with stone buildings and red roofs overlooking the Adriatic Sea.",
        },
      },
      cityStats: [
        { value: "42K", label: "Residents in the city" },
        { value: "1,940M", label: "City walls length" },
        { value: "UNESCO", label: "World Heritage Site" },
        { value: "1.2M", label: "Annual visitors" },
      ],
      fit: {
        forYou: [
          "A first visit with historic walls",
          "Adriatic views and coastal walks",
          "Compact, walkable old town",
          "Clear, practical planning",
          "Island day trips",
        ],
        notForYou: [
          "Day trips far outside Dubrovnik",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach-only activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and main street",
          summary: "Historic center and Stradun.",
          morning: "Old town entrance and Stradun",
          afternoon: "Historic buildings and churches",
          evening: "Waterfront walk and dinner",
        },
        {
          day: 2,
          title: "City walls walk",
          summary: "Walls circuit and viewpoints.",
          morning: "City walls walk and viewpoints",
          afternoon: "Fort Lovrijenac or continued walls",
          evening: "Old town stroll and cafes",
        },
        {
          day: 3,
          title: "Lokrum Island",
          summary: "Island visit and nature.",
          morning: "Boat to Lokrum Island",
          afternoon: "Island exploration and beaches",
          evening: "Return to old town and sunset views",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic walls",
          description:
            "Dubrovnik's city walls offer panoramic views of the old town and Adriatic Sea, creating a unique walking experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_City_Walls.jpg",
            alt: "Historic city walls of Dubrovnik with views of the old town and sea.",
          },
        },
        {
          title: "Old town streets",
          description:
            "The limestone streets and historic buildings create a timeless atmosphere, perfect for slow exploration.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stradun_Dubrovnik.jpg",
            alt: "Stradun, the main street of Dubrovnik's old town with historic buildings.",
          },
        },
        {
          title: "Adriatic views",
          description:
            "The city's coastal setting provides stunning sea views from the walls, fortresses, and waterfront promenades.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_Adriatic_View.jpg",
            alt: "View of the Adriatic Sea from Dubrovnik with the old town in the background.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September to October" },
        { label: "Airport transfer", value: "Airport bus or taxi to old town" },
        { label: "Transit tips", value: "Walk the old town; boat for Lokrum" },
        { label: "Ticketing", value: "Book city walls tickets in advance" },
        { label: "Neighborhood stay", value: "Old town or nearby" },
      ],
      checklist: [
        "Book city walls tickets",
        "Pack comfortable walking shoes",
        "Save offline maps for Dubrovnik",
        "Plan Lokrum Island visit",
        "Bring sun protection",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Dubrovnik?",
          answer:
            "Yes for the main highlights. This plan covers the old town, city walls, and Lokrum Island with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book city walls tickets?",
          answer:
            "Yes, booking in advance is recommended, especially in peak season. The walls walk is popular and offers the best views of the city.",
        },
        {
          question: "Is Dubrovnik walkable?",
          answer:
            "The old town is very walkable and compact. Everything is within easy walking distance, though the city walls walk requires good fitness.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town keeps you close to the main sights, though nearby areas offer good value and easy access to the historic center.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the city walls to beat crowds and heat. The old town is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Dubrovnik's dining scene focuses on seafood, so reserve a few meals in advance.",
        },
        {
          question: "Is Lokrum Island worth visiting?",
          answer:
            "Yes. Lokrum offers a peaceful escape from the old town crowds, with nature trails, beaches, and historic ruins in a scenic setting.",
        },
      ],
      relatedItineraries: [
        {
          slug: "split",
          city: "Split",
          days: 2,
          description: "Diocletian's Palace and waterfront.",
        },
        {
          slug: "venice",
          city: "Venice",
          days: 3,
          description: "Canal walks and classic churches.",
        },
        {
          slug: "athens",
          city: "Athens",
          days: 3,
          description: "Ancient sites and neighborhood cafes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    helsinki: {
      slug: "helsinki",
      city: "Helsinki",
      country: "Finland",
      days: 3,
      pace: "Balanced",
      idealFor: ["Design fans", "First-timers", "Island hoppers"],
      style: ["Waterfront design", "Island hopping", "Cafe culture"],
      pacing: [
        "Helsinki rewards a calm, design-focused pace. Anchor each day with one main area—the design district, Suomenlinna island, or the waterfront—then leave room for cafes, saunas, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the design district with the waterfront for modern sights, then explore Suomenlinna or other islands for a different rhythm.",
        "Save time for sauna culture and quiet moments along the harbor. The city's modern design and island setting create a relaxed, forward-looking atmosphere.",
      ],
      hero: {
        title: "Helsinki in 3 days",
        subtitle:
          "Explore waterfront design, island hopping, and relaxed cafe culture with a calm, modern pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Cathedral.jpg",
          alt: "Helsinki Cathedral and Senate Square with neoclassical architecture.",
        },
      },
      cityStats: [
        { value: "650K", label: "Residents in the city" },
        { value: "330", label: "Islands in the archipelago" },
        { value: "2M+", label: "Saunas in Finland" },
        { value: "1", label: "Design capital of Finland" },
      ],
      fit: {
        forYou: [
          "A first visit with modern design",
          "Island hopping and waterfront walks",
          "Compact, walkable center",
          "Clear, practical planning",
          "Cafe and sauna culture",
        ],
        notForYou: [
          "Day trips far outside Helsinki",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Historic old town atmosphere",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Design district and center",
          summary: "Design shops and historic center.",
          morning: "Design district and shops",
          afternoon: "Senate Square and Helsinki Cathedral",
          evening: "Waterfront walk and dinner",
        },
        {
          day: 2,
          title: "Suomenlinna Island",
          summary: "Fortress island and nature.",
          morning: "Boat to Suomenlinna",
          afternoon: "Fortress exploration and island walks",
          evening: "Return to center and cafes",
        },
        {
          day: 3,
          title: "Waterfront and markets",
          summary: "Harbor area and market square.",
          morning: "Market Square and harbor",
          afternoon: "Uspenski Cathedral and Katajanokka",
          evening: "Final waterfront walk and sunset",
        },
      ],
      imageInfoCards: [
        {
          title: "Modern design",
          description:
            "Helsinki's design district showcases Finnish design with shops, galleries, and contemporary architecture throughout the city.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Design_District.jpg",
            alt: "Modern design district in Helsinki with contemporary architecture.",
          },
        },
        {
          title: "Island fortress",
          description:
            "Suomenlinna offers a unique island experience with historic fortifications, nature trails, and harbor views.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Suomenlinna_Helsinki.jpg",
            alt: "Suomenlinna fortress island in Helsinki with historic buildings and harbor views.",
          },
        },
        {
          title: "Waterfront life",
          description:
            "The harbor and Market Square create a lively atmosphere with ferries, markets, and waterfront cafes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Market_Square.jpg",
            alt: "Market Square in Helsinki with vendors and harbor views.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Train to city center" },
        { label: "Transit tips", value: "Walk the center; ferry for Suomenlinna" },
        { label: "Ticketing", value: "Book Suomenlinna ferry tickets" },
        { label: "Neighborhood stay", value: "City center near Senate Square" },
      ],
      checklist: [
        "Book Suomenlinna ferry tickets",
        "Pack layers for island weather",
        "Save offline maps for Helsinki",
        "Plan time for sauna if interested",
        "Visit design shops",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Helsinki?",
          answer:
            "Yes for the main highlights. This plan covers the design district, Suomenlinna, and key cultural sites with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book Suomenlinna ferry?",
          answer:
            "Ferry tickets are available at the harbor, but booking in advance can save time in peak season. The ferry runs frequently.",
        },
        {
          question: "Is Helsinki walkable?",
          answer:
            "The city center is very walkable and compact. Everything is within easy walking distance, and the waterfront connects well on foot.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The city center near Senate Square keeps you close to the main sights, design district, and restaurants, with easy access to the harbor.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Suomenlinna to maximize island time. The design district is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Helsinki's dining scene focuses on Nordic cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Helsinki good for design?",
          answer:
            "Yes. Helsinki is known as a design capital, with excellent design shops, galleries, and contemporary architecture throughout the city.",
        },
      ],
      relatedItineraries: [
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Old town charm and island hopping.",
        },
        {
          slug: "copenhagen",
          city: "Copenhagen",
          days: 3,
          description: "Waterfront strolls and design.",
        },
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Waterfront walks and compact museums.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    innsbruck: {
      slug: "innsbruck",
      city: "Innsbruck",
      country: "Austria",
      days: 2,
      pace: "Balanced",
      idealFor: ["Mountain lovers", "First-timers", "Alpine walkers"],
      style: ["Alpine views", "Historic old town", "Mountain access"],
      pacing: [
        "Innsbruck rewards a calm, alpine pace. Anchor each day with one main area—the historic old town, or the Nordkette mountains—then leave room for cafes, viewpoints, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the old town with the Golden Roof for classic sights, then explore the mountains or nearby areas for a different rhythm.",
        "Save time for mountain viewpoints and quiet moments in the old town. The city's alpine setting and historic architecture create a relaxed, scenic atmosphere.",
      ],
      hero: {
        title: "Innsbruck in 2 days",
        subtitle:
          "Explore alpine views, historic old town, and easy mountain access with a calm, scenic pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Altstadt_10.jpg",
          alt: "Historic old town of Innsbruck with colorful buildings and mountain backdrop.",
        },
      },
      cityStats: [
        { value: "132K", label: "Residents in the city" },
        { value: "574M", label: "Nordkette cable car elevation" },
        { value: "800+", label: "Years of history" },
        { value: "2", label: "Winter Olympics hosted" },
      ],
      fit: {
        forYou: [
          "A first visit with alpine views",
          "Historic old town and mountains",
          "Compact, walkable center",
          "Clear, practical planning",
          "Mountain cable car experience",
        ],
        notForYou: [
          "Day trips far outside Innsbruck",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach or coastal activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic old town",
          summary: "Golden Roof and old town walks.",
          morning: "Golden Roof and historic center",
          afternoon: "Old town streets and churches",
          evening: "Riverside walk and dinner",
        },
        {
          day: 2,
          title: "Nordkette mountains",
          summary: "Mountain cable car and views.",
          morning: "Nordkette cable car and summit",
          afternoon: "Mountain walks or return to center",
          evening: "Old town stroll and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Alpine setting",
          description:
            "Innsbruck's mountain backdrop creates stunning views from the old town, with easy access to the Nordkette range via cable car.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Nordkette.jpg",
            alt: "Nordkette mountains above Innsbruck with cable car and alpine views.",
          },
        },
        {
          title: "Historic old town",
          description:
            "The colorful old town with the Golden Roof showcases Tyrolean architecture and history in a compact, walkable center.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Roof_Innsbruck.jpg",
            alt: "Golden Roof in Innsbruck's historic old town with colorful buildings.",
          },
        },
        {
          title: "Mountain access",
          description:
            "The Nordkette cable car provides easy access to alpine viewpoints and nature, just minutes from the city center.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Cable_Car.jpg",
            alt: "Cable car ascending to Nordkette mountains from Innsbruck.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the old town; cable car for mountains" },
        { label: "Ticketing", value: "Book Nordkette cable car in advance" },
        { label: "Neighborhood stay", value: "Old town center" },
      ],
      checklist: [
        "Book Nordkette cable car tickets",
        "Pack layers for mountain weather",
        "Save offline maps for Innsbruck",
        "Plan time for mountain views",
        "Wear comfortable walking shoes",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Innsbruck?",
          answer:
            "Yes for the main highlights. This plan covers the old town and Nordkette mountains with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book the Nordkette cable car?",
          answer:
            "Booking in advance is recommended, especially in peak season. The cable car offers stunning alpine views and is a popular attraction.",
        },
        {
          question: "Is Innsbruck walkable?",
          answer:
            "The old town is very walkable and compact. Everything is within easy walking distance, and the cable car station is close to the center.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town center keeps you close to the main sights, restaurants, and cafes, with easy access to the cable car.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the Nordkette to get clear mountain views. The old town is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Innsbruck's dining scene focuses on Tyrolean cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Innsbruck good for mountain views?",
          answer:
            "Yes. The city sits in a valley surrounded by mountains, and the Nordkette cable car provides easy access to stunning alpine viewpoints.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Vienna",
          days: 3,
          description: "Classic museums and palace gardens.",
        },
        {
          slug: "salzburg",
          city: "Salzburg",
          days: 3,
          description: "Baroque architecture and mountain views.",
        },
        {
          slug: "munich",
          city: "Munich",
          days: 3,
          description: "Historic squares and garden breaks.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    riga: {
      slug: "riga",
      city: "Riga",
      country: "Latvia",
      days: 2,
      pace: "Balanced",
      idealFor: ["Architecture fans", "First-timers", "Old town walkers"],
      style: ["Art nouveau", "Historic squares", "Riverfront walks"],
      pacing: [
        "Riga rewards a calm, architectural pace. Anchor each day with one main area—the art nouveau district, or the historic old town—then leave room for cafes, markets, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the old town with the art nouveau district for diverse sights, then explore the riverfront or markets for a different rhythm.",
        "Save time for art nouveau buildings and quiet moments along the Daugava River. The city's diverse architecture and river setting create a relaxed, cultural atmosphere.",
      ],
      hero: {
        title: "Riga in 2 days",
        subtitle:
          "Explore art nouveau architecture, old town squares, and riverfront walks with a calm, cultural pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Historic_Centre_of_Riga-112610.jpg",
          alt: "Historic old town of Riga with medieval buildings and church spires.",
        },
      },
      cityStats: [
        { value: "632K", label: "Residents in the city" },
        { value: "800+", label: "Art nouveau buildings" },
        { value: "800+", label: "Years of history" },
        { value: "UNESCO", label: "World Heritage Site" },
      ],
      fit: {
        forYou: [
          "A first visit with art nouveau",
          "Historic old town and architecture",
          "Compact, walkable center",
          "Clear, practical planning",
          "Cultural and market time",
        ],
        notForYou: [
          "Day trips far outside Riga",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach or coastal activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and squares",
          summary: "Historic center and main squares.",
          morning: "Old town and Town Hall Square",
          afternoon: "Dome Cathedral and historic buildings",
          evening: "Riverfront walk and dinner",
        },
        {
          day: 2,
          title: "Art nouveau district",
          summary: "Art nouveau architecture and streets.",
          morning: "Art nouveau district and buildings",
          afternoon: "Central Market or continued architecture",
          evening: "Old town stroll and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Art nouveau architecture",
          description:
            "Riga has one of the world's largest collections of art nouveau buildings, with ornate facades and decorative details throughout the city.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Art_Nouveau.jpg",
            alt: "Art nouveau building in Riga with ornate facade and decorative details.",
          },
        },
        {
          title: "Historic old town",
          description:
            "The medieval old town with cobblestone streets and historic buildings creates a charming, walkable center.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Dome_Cathedral.jpg",
            alt: "Dome Cathedral in Riga's old town with historic architecture.",
          },
        },
        {
          title: "Riverfront setting",
          description:
            "The Daugava River provides a peaceful backdrop to the city, with waterfront promenades and scenic views.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Daugava_River.jpg",
            alt: "Daugava River in Riga with city skyline and waterfront views.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the center; everything is close" },
        { label: "Ticketing", value: "Book major attractions in advance if needed" },
        { label: "Neighborhood stay", value: "Old town or art nouveau district" },
      ],
      checklist: [
        "Book major attraction tickets if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Riga",
        "Plan time for art nouveau buildings",
        "Visit Central Market",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Riga?",
          answer:
            "Yes for the main highlights. This plan covers the old town and art nouveau district with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book attractions?",
          answer:
            "For major attractions, booking in advance can help in peak season. The old town and art nouveau district are best explored on foot.",
        },
        {
          question: "Is Riga walkable?",
          answer:
            "The city center is very walkable and compact. Everything is within easy walking distance, and the old town connects well to the art nouveau district.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town keeps you close to the main sights, though the art nouveau district offers good value and easy access to the center.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early to beat crowds at the old town squares. The art nouveau district is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Riga's dining scene focuses on Baltic cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Riga good for art nouveau?",
          answer:
            "Yes. Riga has one of the world's largest collections of art nouveau buildings, with over 800 examples throughout the city.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tallinn",
          city: "Tallinn",
          days: 2,
          description: "Medieval old town and city walls.",
        },
        {
          slug: "vilnius",
          city: "Vilnius",
          days: 2,
          description: "Baroque architecture and historic lanes.",
        },
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Old town charm and island hopping.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    split: {
      slug: "split",
      city: "Split",
      country: "Croatia",
      days: 2,
      pace: "Balanced",
      idealFor: ["History lovers", "First-timers", "Waterfront walkers"],
      style: ["Roman palace", "Waterfront promenades", "Historic lanes"],
      pacing: [
        "Split rewards a calm, historic pace. Anchor each day with one main area—Diocletian's Palace, or the waterfront—then leave room for cafes, viewpoints, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the palace with the old town for classic sights, then explore the waterfront or Marjan Hill for a different rhythm.",
        "Save time for Marjan Hill and quiet moments along the Riva. The city's Roman history and Adriatic setting create a relaxed, scenic atmosphere.",
      ],
      hero: {
        title: "Split in 2 days",
        subtitle:
          "Explore Diocletian's Palace, waterfront promenades, and nearby islands with a calm, coastal pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Historical_Complex_of_Split_with_the_Palace_of_Diocletian-108827.jpg",
          alt: "Diocletian's Palace in Split with Roman architecture and historic buildings.",
        },
      },
      cityStats: [
        { value: "178K", label: "Residents in the city" },
        { value: "1,700+", label: "Years of history" },
        { value: "UNESCO", label: "World Heritage Site" },
        { value: "30K", label: "Square meters of palace" },
      ],
      fit: {
        forYou: [
          "A first visit with Roman history",
          "Waterfront walks and palace exploration",
          "Compact, walkable center",
          "Clear, practical planning",
          "Island day trips",
        ],
        notForYou: [
          "Day trips far outside Split",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach-only activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Diocletian's Palace",
          summary: "Roman palace and old town.",
          morning: "Diocletian's Palace entrance and Peristyle",
          afternoon: "Palace streets and Cathedral of St. Domnius",
          evening: "Riva promenade and dinner",
        },
        {
          day: 2,
          title: "Marjan Hill and waterfront",
          summary: "Hill viewpoints and harbor area.",
          morning: "Marjan Hill walk and viewpoints",
          afternoon: "Waterfront area and beaches",
          evening: "Old town stroll and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Roman palace",
          description:
            "Diocletian's Palace is a living Roman monument, with ancient walls, streets, and buildings integrated into the modern city.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Peristyle_Split.jpg",
            alt: "Peristyle square in Diocletian's Palace, Split, with Roman columns and architecture.",
          },
        },
        {
          title: "Waterfront promenade",
          description:
            "The Riva promenade along the harbor provides a lively atmosphere with cafes, views, and easy access to the old town.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riva_Split.jpg",
            alt: "Riva waterfront promenade in Split with cafes and harbor views.",
          },
        },
        {
          title: "Marjan Hill",
          description:
            "Marjan Hill offers peaceful nature walks and panoramic views of Split, the harbor, and surrounding islands.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marjan_Hill_Split.jpg",
            alt: "View from Marjan Hill in Split showing the city and Adriatic Sea.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to June or September to October" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the center; everything is close" },
        { label: "Ticketing", value: "Book palace attractions in advance if needed" },
        { label: "Neighborhood stay", value: "Old town or near Riva" },
      ],
      checklist: [
        "Book palace attraction tickets if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Split",
        "Plan time for Marjan Hill",
        "Bring sun protection",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Split?",
          answer:
            "Yes for the main highlights. This plan covers Diocletian's Palace and Marjan Hill with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book palace attractions?",
          answer:
            "For major attractions within the palace, booking in advance can help in peak season. The palace itself is free to explore.",
        },
        {
          question: "Is Split walkable?",
          answer:
            "The old town and palace are very walkable and compact. Everything is within easy walking distance, though Marjan Hill requires some uphill walking.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town keeps you close to the palace and main sights, though areas near the Riva offer good value and easy access.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for the palace to beat crowds. Marjan Hill is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Split's dining scene focuses on seafood, so reserve a few meals in advance.",
        },
        {
          question: "Is Split good for Roman history?",
          answer:
            "Yes. Diocletian's Palace is one of the best-preserved Roman monuments, with ancient architecture integrated into the modern city center.",
        },
      ],
      relatedItineraries: [
        {
          slug: "dubrovnik",
          city: "Dubrovnik",
          days: 3,
          description: "Historic walls and Adriatic views.",
        },
        {
          slug: "rome",
          city: "Rome",
          days: 3,
          description: "Ancient landmarks and piazzas.",
        },
        {
          slug: "athens",
          city: "Athens",
          days: 3,
          description: "Ancient sites and neighborhood cafes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    tallinn: {
      slug: "tallinn",
      city: "Tallinn",
      country: "Estonia",
      days: 2,
      pace: "Balanced",
      idealFor: ["History lovers", "First-timers", "Medieval town fans"],
      style: ["Medieval walls", "Historic squares", "Harbor views"],
      pacing: [
        "Tallinn rewards a calm, medieval pace. Anchor each day with one main area—the old town, or Toompea Hill—then leave room for cafes, viewpoints, and slow walks.",
        "The compact old town makes it easy to explore on foot. Pair the lower town with Toompea for classic sights, then explore the walls or harbor for a different rhythm.",
        "Save time for city walls and quiet moments in the squares. The city's medieval architecture and harbor setting create a relaxed, historic atmosphere.",
      ],
      hero: {
        title: "Tallinn in 2 days",
        subtitle:
          "Explore medieval old town, city walls, and harbor views with a calm, historic pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Old_Town.jpg",
          alt: "Medieval old town of Tallinn with historic buildings and church spires.",
        },
      },
      cityStats: [
        { value: "437K", label: "Residents in the city" },
        { value: "800+", label: "Years of history" },
        { value: "1.9KM", label: "City walls length" },
        { value: "UNESCO", label: "World Heritage Site" },
      ],
      fit: {
        forYou: [
          "A first visit with medieval architecture",
          "Historic old town and walls",
          "Compact, walkable center",
          "Clear, practical planning",
          "Harbor and viewpoint time",
        ],
        notForYou: [
          "Day trips far outside Tallinn",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach or coastal activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and Toompea",
          summary: "Medieval center and hilltop views.",
          morning: "Old town entrance and Town Hall Square",
          afternoon: "Toompea Hill and Alexander Nevsky Cathedral",
          evening: "Harbor walk and dinner",
        },
        {
          day: 2,
          title: "City walls and districts",
          summary: "Walls walk and historic districts.",
          morning: "City walls walk and viewpoints",
          afternoon: "Historic districts and churches",
          evening: "Old town stroll and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Medieval old town",
          description:
            "Tallinn's old town is one of Europe's best-preserved medieval centers, with cobblestone streets and historic buildings.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Town_Hall_Square.jpg",
            alt: "Town Hall Square in Tallinn's old town with medieval architecture.",
          },
        },
        {
          title: "City walls",
          description:
            "The well-preserved city walls and towers offer views of the old town and create a unique walking experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_City_Walls.jpg",
            alt: "Historic city walls of Tallinn with medieval towers and old town views.",
          },
        },
        {
          title: "Harbor setting",
          description:
            "The harbor provides a scenic backdrop to the old town, with waterfront promenades and views of the Baltic Sea.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Harbor.jpg",
            alt: "Harbor in Tallinn with old town and Baltic Sea views.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the old town; everything is close" },
        { label: "Ticketing", value: "Book city walls walk in advance if needed" },
        { label: "Neighborhood stay", value: "Old town center" },
      ],
      checklist: [
        "Book city walls walk if interested",
        "Pack comfortable walking shoes",
        "Save offline maps for Tallinn",
        "Plan time for Toompea Hill",
        "Visit the old town squares",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Tallinn?",
          answer:
            "Yes for the main highlights. This plan covers the old town and city walls with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book city walls walk?",
          answer:
            "For guided walks, booking in advance can help. The walls can be viewed from various points throughout the old town.",
        },
        {
          question: "Is Tallinn walkable?",
          answer:
            "The old town is very walkable and compact. Everything is within easy walking distance, though Toompea Hill requires some uphill walking.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town center keeps you close to the main sights, restaurants, and cafes, with easy access to everything.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early to beat crowds at the old town squares. Toompea Hill is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Tallinn's dining scene focuses on Estonian cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Tallinn good for medieval history?",
          answer:
            "Yes. Tallinn has one of Europe's best-preserved medieval old towns, with intact city walls, historic buildings, and a charming atmosphere.",
        },
      ],
      relatedItineraries: [
        {
          slug: "riga",
          city: "Riga",
          days: 2,
          description: "Art nouveau and old town squares.",
        },
        {
          slug: "vilnius",
          city: "Vilnius",
          days: 2,
          description: "Baroque architecture and historic lanes.",
        },
        {
          slug: "stockholm",
          city: "Stockholm",
          days: 3,
          description: "Old town charm and island hopping.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    vilnius: {
      slug: "vilnius",
      city: "Vilnius",
      country: "Lithuania",
      days: 2,
      pace: "Balanced",
      idealFor: ["Architecture fans", "First-timers", "Baroque town walkers"],
      style: ["Baroque architecture", "Historic lanes", "Hilltop viewpoints"],
      pacing: [
        "Vilnius rewards a calm, baroque pace. Anchor each day with one main area—the old town, or Gediminas Tower—then leave room for cafes, viewpoints, and slow walks.",
        "The compact center makes it easy to explore on foot. Pair the old town with Gediminas Hill for classic sights, then explore Užupis or quieter districts for a different rhythm.",
        "Save time for Gediminas Tower and quiet moments in the old town. The city's baroque architecture and hilltop setting create a relaxed, cultural atmosphere.",
      ],
      hero: {
        title: "Vilnius in 2 days",
        subtitle:
          "Explore baroque architecture, historic lanes, and hilltop viewpoints with a calm, cultural pace.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vilnius_Old_Town.jpg",
          alt: "Historic old town of Vilnius with baroque architecture and church spires.",
        },
      },
      cityStats: [
        { value: "588K", label: "Residents in the city" },
        { value: "700+", label: "Years of history" },
        { value: "40+", label: "Churches in the old town" },
        { value: "UNESCO", label: "World Heritage Site" },
      ],
      fit: {
        forYou: [
          "A first visit with baroque architecture",
          "Historic old town and hilltop views",
          "Compact, walkable center",
          "Clear, practical planning",
          "Cultural and artistic districts",
        ],
        notForYou: [
          "Day trips far outside Vilnius",
          "Late-night nightlife focus",
          "A packed museum-only schedule",
          "Extensive shopping time",
          "Beach or coastal activities",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old town and Gediminas",
          summary: "Historic center and hilltop tower.",
          morning: "Old town and Cathedral Square",
          afternoon: "Gediminas Tower and hilltop views",
          evening: "Old town stroll and dinner",
        },
        {
          day: 2,
          title: "Užupis and districts",
          summary: "Artistic district and historic churches.",
          morning: "Užupis district and artistic area",
          afternoon: "Historic churches and quieter lanes",
          evening: "Final old town walk and cafes",
        },
      ],
      imageInfoCards: [
        {
          title: "Baroque architecture",
          description:
            "Vilnius' old town showcases baroque architecture with ornate churches, historic buildings, and charming streets throughout.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vilnius_Cathedral.jpg",
            alt: "Vilnius Cathedral with baroque architecture in the old town.",
          },
        },
        {
          title: "Gediminas Tower",
          description:
            "The hilltop Gediminas Tower offers panoramic views of Vilnius and the surrounding area, accessible by foot or funicular.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gediminas_Tower_Vilnius.jpg",
            alt: "Gediminas Tower on the hilltop overlooking Vilnius old town.",
          },
        },
        {
          title: "Užupis district",
          description:
            "The artistic Užupis district adds a creative, bohemian atmosphere to the old town, with galleries, cafes, and unique character.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uzupis_Vilnius.jpg",
            alt: "Užupis artistic district in Vilnius with colorful buildings and creative atmosphere.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "May to September for warm weather" },
        { label: "Airport transfer", value: "Airport bus or taxi to city center" },
        { label: "Transit tips", value: "Walk the old town; everything is close" },
        { label: "Ticketing", value: "Book Gediminas Tower in advance if needed" },
        { label: "Neighborhood stay", value: "Old town center" },
      ],
      checklist: [
        "Book Gediminas Tower if interested",
        "Pack comfortable walking shoes",
        "Save offline maps for Vilnius",
        "Plan time for Užupis district",
        "Visit the old town churches",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Vilnius?",
          answer:
            "Yes for the main highlights. This plan covers the old town and Gediminas Tower with a calm pace that leaves room for cafes and unplanned stops.",
        },
        {
          question: "Do I need to book Gediminas Tower?",
          answer:
            "For the tower climb, booking in advance can help in peak season. The hilltop offers great views even without entering the tower.",
        },
        {
          question: "Is Vilnius walkable?",
          answer:
            "The old town is very walkable and compact. Everything is within easy walking distance, though Gediminas Hill requires some uphill walking.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The old town center keeps you close to the main sights, restaurants, and cafes, with easy access to everything.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early to beat crowds at the old town squares. Gediminas Hill is pleasant throughout the day, and you can slow down with a long lunch.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Vilnius' dining scene focuses on Lithuanian cuisine, so reserve a few meals in advance.",
        },
        {
          question: "Is Vilnius good for baroque architecture?",
          answer:
            "Yes. Vilnius has one of Europe's largest baroque old towns, with over 40 churches and historic buildings throughout the center.",
        },
      ],
      relatedItineraries: [
        {
          slug: "riga",
          city: "Riga",
          days: 2,
          description: "Art nouveau and old town squares.",
        },
        {
          slug: "tallinn",
          city: "Tallinn",
          days: 2,
          description: "Medieval old town and city walls.",
        },
        {
          slug: "krakow",
          city: "Krakow",
          days: 3,
          description: "Old town and castle hill.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    tokyo: {
      slug: "tokyo",
      city: "Tokyo",
      country: "Japan",
      days: 4,
      pace: "Balanced",
      idealFor: ["First-timers", "Food lovers", "Culture seekers"],
      style: ["Traditional temples", "Modern districts", "Exceptional food"],
      pacing: [
        "Tokyo rewards a calm pace across its diverse neighborhoods. Focus each day on one major area, then leave time for temple visits, local markets, and spontaneous food discoveries.",
        "Group your time by district clusters. Pair Shibuya with Harajuku for modern energy, dedicate another day to Asakusa and Ueno for traditional culture, then explore Shinjuku and Ginza for contrast.",
        "Save unhurried time for neighborhood walks, local izakaya dinners, and the quiet moments that reveal Tokyo's character beyond the main sights.",
      ],
      hero: {
        title: "Tokyo in 4 days",
        subtitle:
          "Explore the essentials with room to breathe, balancing traditional temples, modern districts, and exceptional food culture.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
          alt: "Shibuya Crossing in Tokyo with neon lights and crowds.",
        },
      },
      cityStats: [
        { value: "13.9M", label: "Residents in the metro area" },
        { value: "23", label: "Special wards across the city" },
        { value: "160,000+", label: "Restaurants and food establishments" },
        { value: "2,000+", label: "Temples and shrines" },
      ],
      fit: {
        forYou: ["Traditional temple visits", "Modern district exploration", "Exceptional food scenes", "Efficient public transit", "Safe, walkable neighborhoods"],
        notForYou: ["A packed schedule of only temples", "Day trips outside Tokyo", "Late-night party focus", "Beach time", "Budget backpacker style"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Modern Tokyo",
          summary: "Shibuya, Harajuku, and modern energy.",
          morning: "Shibuya Crossing and Hachiko Square",
          afternoon: "Harajuku and Takeshita Street",
          evening: "Shibuya Sky or neighborhood dinner",
        },
        {
          day: 2,
          title: "Traditional culture",
          summary: "Asakusa, Senso-ji, and Ueno Park.",
          morning: "Senso-ji Temple and Nakamise Street",
          afternoon: "Ueno Park and museums",
          evening: "Traditional dinner in Asakusa",
        },
        {
          day: 3,
          title: "Imperial and shopping",
          summary: "Imperial Palace, Ginza, and Tsukiji.",
          morning: "Imperial Palace East Gardens",
          afternoon: "Ginza district and shopping",
          evening: "Tsukiji Outer Market area",
        },
        {
          day: 4,
          title: "Neighborhoods and food",
          summary: "Shinjuku, local markets, and relaxed time.",
          morning: "Shinjuku Gyoen or Meiji Shrine",
          afternoon: "Shinjuku neighborhood exploration",
          evening: "Izakaya dinner and Golden Gai",
        },
      ],
      imageInfoCards: [
        {
          title: "Traditional temples",
          description:
            "Senso-ji and Meiji Shrine offer peaceful contrasts to Tokyo's modern energy. Morning visits provide quiet moments before the crowds arrive.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sensoji_Temple_Tokyo.jpg",
            alt: "Senso-ji Temple in Asakusa with traditional architecture and lanterns.",
          },
        },
        {
          title: "Modern districts",
          description:
            "Shibuya and Shinjuku showcase Tokyo's contemporary side with neon lights, efficient transit, and vibrant street life that feels both organized and energetic.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Shinjuku_Tokyo_Skyline.jpg",
            alt: "Shinjuku skyline with modern skyscrapers and neon signs.",
          },
        },
        {
          title: "Exceptional food culture",
          description:
            "From Tsukiji fish market to neighborhood izakaya, Tokyo's food scene is world-class. Long meals and local discoveries are part of the experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tsukiji_Market_Tokyo.jpg",
            alt: "Tsukiji Outer Market with fresh seafood and food stalls.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "March to May or September to November" },
        { label: "Airport transfer", value: "Narita Express or Skyliner to city center" },
        { label: "Transit tips", value: "Get a JR Pass or IC card for easy transit" },
        { label: "Ticketing", value: "Book major attractions like Tokyo Skytree in advance" },
        { label: "Neighborhood stay", value: "Shibuya, Shinjuku, or Ginza areas" },
      ],
      checklist: [
        "Get a JR Pass or IC card for transit",
        "Book Tokyo Skytree if visiting",
        "Pack comfortable walking shoes",
        "Save offline maps for Tokyo",
        "Plan one traditional meal experience",
        "Carry cash for smaller establishments",
      ],
      faqs: [
        {
          question: "Is 4 days enough for Tokyo?",
          answer:
            "Yes for the core highlights. This plan balances traditional and modern Tokyo with enough breathing room for food discoveries, neighborhood walks, and unplanned stops.",
        },
        {
          question: "Do I need a JR Pass?",
          answer:
            "For city travel, an IC card is more practical. JR Passes are better for longer Japan trips. Both offer easy access to Tokyo's excellent transit system.",
        },
        {
          question: "Is Tokyo walkable?",
          answer:
            "Neighborhoods are walkable, but Tokyo is vast. Use the efficient subway and train system to move between districts, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Shibuya or Shinjuku offer good transit connections and central locations. Ginza provides a more upscale base with easy access to shopping and dining.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for temple visits to avoid crowds. Markets like Tsukiji are best in the morning. Afternoons can be slower with neighborhood exploration.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end restaurants, yes—especially for sushi or kaiseki. For izakaya and casual spots, walk-ins are common, though popular places may have waits.",
        },
        {
          question: "Is English widely spoken?",
          answer:
            "In tourist areas, yes. Many restaurants have English menus, and transit signs are bilingual. Learning basic Japanese phrases helps, especially outside central areas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "seoul",
          city: "Seoul",
          days: 3,
          description: "Ancient palaces, modern neighborhoods, and dynamic food scenes.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Golden temples, floating markets, and vibrant street food.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Skyline views, traditional markets, and easy island escapes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    seoul: {
      slug: "seoul",
      city: "Seoul",
      country: "South Korea",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Food enthusiasts"],
      style: ["Ancient palaces", "Modern neighborhoods", "Dynamic food scenes"],
      pacing: [
        "Seoul rewards a calm pace across its mix of ancient and modern. Anchor each day with one major area, then leave time for palace visits, neighborhood markets, and spontaneous food discoveries.",
        "Group your time by district. Pair Gyeongbokgung with Bukchon for traditional culture, dedicate another day to Myeongdong and Insadong for shopping and food, then explore Gangnam for modern contrast.",
        "Save unhurried time for hanok village walks, local market visits, and the relaxed meals that showcase Seoul's exceptional food culture.",
      ],
      hero: {
        title: "Seoul in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, mixing ancient palaces, modern neighborhoods, and dynamic street food scenes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1758509444769-95567facc5b0?auto=format&fit=crop&w=1600&q=80",
          alt: "Seoul city skyline with Namsan Tower and modern architecture.",
        },
      },
      cityStats: [
        { value: "9.7M", label: "Residents in the city" },
        { value: "5", label: "Grand palaces across Seoul" },
        { value: "25", label: "Districts (gu) in the city" },
        { value: "20,000+", label: "Restaurants and food establishments" },
      ],
      fit: {
        forYou: ["Ancient palace visits", "Traditional hanok villages", "Vibrant food markets", "Modern shopping districts", "Efficient public transit"],
        notForYou: ["A packed schedule of only palaces", "Day trips outside Seoul", "Late-night party focus", "Beach time", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Palaces and tradition",
          summary: "Gyeongbokgung, Bukchon, and traditional culture.",
          morning: "Gyeongbokgung Palace and changing of the guard",
          afternoon: "Bukchon Hanok Village walk",
          evening: "Insadong area and traditional dinner",
        },
        {
          day: 2,
          title: "Modern Seoul",
          summary: "Myeongdong, N Seoul Tower, and shopping.",
          morning: "Myeongdong shopping district",
          afternoon: "N Seoul Tower and Namsan Park",
          evening: "Gangnam area or Hongdae for nightlife",
        },
        {
          day: 3,
          title: "Markets and neighborhoods",
          summary: "Gwangjang Market, local areas, and relaxed time.",
          morning: "Gwangjang Market and street food",
          afternoon: "Dongdaemun or neighborhood exploration",
          evening: "Traditional hanjeongsik dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Ancient palaces",
          description:
            "Gyeongbokgung and Changdeokgung showcase Korea's royal history. Morning visits offer quieter moments and the chance to see traditional ceremonies.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Changdeokgung_Palace_Seoul.jpg",
            alt: "Changdeokgung Palace with traditional Korean architecture and gardens.",
          },
        },
        {
          title: "Hanok villages",
          description:
            "Bukchon preserves traditional Korean architecture in a residential setting. Slow walks reveal courtyards, tea houses, and quiet streets that feel removed from modern Seoul.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bukchon_Hanok_Village_Seoul.jpg",
            alt: "Traditional hanok houses in Bukchon Village with tiled roofs.",
          },
        },
        {
          title: "Dynamic food culture",
          description:
            "From Gwangjang Market to Myeongdong street food, Seoul's food scene is vibrant and accessible. Long meals and local discoveries are central to the experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gwangjang_Market_Seoul.jpg",
            alt: "Gwangjang Market with food stalls and vendors in Seoul.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to November" },
        { label: "Airport transfer", value: "AREX express train or airport bus to city center" },
        { label: "Transit tips", value: "Get a T-money card for easy subway and bus access" },
        { label: "Ticketing", value: "Book palace tours and N Seoul Tower in advance" },
        { label: "Neighborhood stay", value: "Myeongdong, Insadong, or Gangnam areas" },
      ],
      checklist: [
        "Get a T-money card for transit",
        "Book Changdeokgung Secret Garden tour if interested",
        "Pack comfortable walking shoes",
        "Save offline maps for Seoul",
        "Plan one traditional meal experience",
        "Carry cash for markets and street food",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Seoul?",
          answer:
            "Yes for the core highlights. This plan balances traditional and modern Seoul with enough breathing room for palace visits, food markets, and neighborhood exploration.",
        },
        {
          question: "Do I need to book palace visits?",
          answer:
            "For Gyeongbokgung, no advance booking needed. For Changdeokgung Secret Garden, yes—book in advance as tours are limited. The changing of the guard at Gyeongbokgung is free and worth timing your visit.",
        },
        {
          question: "Is Seoul walkable?",
          answer:
            "Neighborhoods are walkable, but Seoul is spread out. Use the efficient subway system to move between districts, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Myeongdong offers central location and easy access to shopping and food. Insadong provides traditional character, while Gangnam offers modern convenience.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for palace visits to avoid crowds and see the changing of the guard. Markets are best in the morning, and afternoons can be slower with neighborhood walks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end Korean BBQ or hanjeongsik, yes—especially on weekends. For street food and casual spots, walk-ins are common and part of the experience.",
        },
        {
          question: "Is English widely spoken?",
          answer:
            "In tourist areas and with younger people, yes. Many restaurants have English menus, and transit signs are bilingual. Learning basic Korean phrases helps.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokyo",
          days: 4,
          description: "Traditional temples, modern districts, and exceptional food culture.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Golden temples, floating markets, and vibrant street food.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Skyline views, traditional markets, and easy island escapes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bangkok: {
      slug: "bangkok",
      city: "Bangkok",
      country: "Thailand",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Temple lovers", "Food enthusiasts"],
      style: ["Golden temples", "Floating markets", "Vibrant street food"],
      pacing: [
        "Bangkok rewards a calm pace despite its energy. Anchor each day with one major temple or area, then leave time for market visits, street food discoveries, and river boat rides.",
        "Group your time by area. Pair the Grand Palace with Wat Pho for temple culture, dedicate another day to Chatuchak or floating markets, then explore neighborhoods like Chinatown for food and local life.",
        "Save unhurried time for temple visits, long market walks, and the relaxed meals that showcase Bangkok's exceptional street food culture.",
      ],
      hero: {
        title: "Bangkok in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, featuring golden temples, floating markets, and vibrant street food scenes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80",
          alt: "Wat Phra Kaew (Temple of the Emerald Buddha) in Bangkok with golden architecture.",
        },
      },
      cityStats: [
        { value: "10.5M", label: "Residents in the metro area" },
        { value: "400+", label: "Temples (wats) across the city" },
        { value: "50", label: "Districts (khet) in Bangkok" },
        { value: "20,000+", label: "Street food vendors" },
      ],
      fit: {
        forYou: ["Temple visits and culture", "Floating and street markets", "Vibrant street food", "River boat experiences", "Affordable travel"],
        notForYou: ["A packed schedule of only temples", "Beach time", "Late-night party focus", "Extensive shopping malls", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Grand temples",
          summary: "Grand Palace, Wat Pho, and temple culture.",
          morning: "Grand Palace and Wat Phra Kaew",
          afternoon: "Wat Pho (Temple of the Reclining Buddha)",
          evening: "Wat Arun sunset and river views",
        },
        {
          day: 2,
          title: "Markets and food",
          summary: "Chatuchak or floating market, street food.",
          morning: "Chatuchak Weekend Market or Damnoen Saduak",
          afternoon: "Market exploration and street food",
          evening: "Chinatown food walk",
        },
        {
          day: 3,
          title: "Neighborhoods and culture",
          summary: "Jim Thompson House, local areas, and relaxed time.",
          morning: "Jim Thompson House or Wat Saket",
          afternoon: "Siam area or neighborhood walk",
          evening: "Rooftop bar or traditional dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Golden temples",
          description:
            "The Grand Palace and Wat Pho showcase Thailand's royal and religious heritage. Morning visits offer cooler temperatures and fewer crowds before tour groups arrive.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Wat_Pho_Bangkok.jpg",
            alt: "Wat Pho with the Reclining Buddha and golden architecture.",
          },
        },
        {
          title: "Floating markets",
          description:
            "Damnoen Saduak and other floating markets offer a glimpse into traditional Thai life. Early morning visits provide the best experience before the heat and crowds.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Damnoen_Saduak_Floating_Market.jpg",
            alt: "Floating market with boats and vendors on the water.",
          },
        },
        {
          title: "Vibrant street food",
          description:
            "From Chinatown to local markets, Bangkok's street food scene is world-class. Long food walks and local discoveries are central to the experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bangkok_Street_Food.jpg",
            alt: "Street food vendors and stalls in Bangkok with colorful displays.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "November to March for cooler, drier weather" },
        { label: "Airport transfer", value: "Airport Rail Link or taxi to city center" },
        { label: "Transit tips", value: "Use BTS Skytrain and MRT for longer distances; tuk-tuks for short hops" },
        { label: "Ticketing", value: "Buy Grand Palace tickets on-site; book floating market tours in advance" },
        { label: "Neighborhood stay", value: "Sukhumvit, Silom, or near the river" },
      ],
      checklist: [
        "Book floating market tour if visiting",
        "Pack light, breathable clothing",
        "Bring comfortable walking shoes",
        "Save offline maps for Bangkok",
        "Plan one street food walk",
        "Carry cash for markets and street food",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Bangkok?",
          answer:
            "Yes for the core highlights. This plan balances temples, markets, and food with enough breathing room for river boat rides, neighborhood walks, and unplanned discoveries.",
        },
        {
          question: "Do I need to book temple visits?",
          answer:
            "No advance booking needed for most temples. Buy tickets on-site. For floating markets, book tours in advance as they're outside the city and require transportation.",
        },
        {
          question: "Is Bangkok walkable?",
          answer:
            "Neighborhoods are walkable, but Bangkok is spread out and can be hot. Use BTS Skytrain and MRT for longer distances, then explore on foot within each area. River boats offer scenic transit.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Sukhumvit offers good BTS access and modern convenience. Silom provides central location, while areas near the river offer scenic views and easy boat access.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for temple visits to avoid heat and crowds. Floating markets are best at dawn. Afternoons can be slower with indoor stops or air-conditioned breaks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end restaurants, yes. For street food and casual spots, walk-ins are the norm. Food markets and street vendors don't require reservations.",
        },
        {
          question: "Is street food safe?",
          answer:
            "Yes, generally. Look for busy stalls with high turnover. Avoid raw foods if you're sensitive. Stick to cooked items and stay hydrated. Most travelers enjoy street food without issues.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokyo",
          days: 4,
          description: "Traditional temples, modern districts, and exceptional food culture.",
        },
        {
          slug: "seoul",
          city: "Seoul",
          days: 3,
          description: "Ancient palaces, modern neighborhoods, and dynamic food scenes.",
        },
        {
          slug: "singapore",
          city: "Singapore",
          days: 3,
          description: "Modern architecture, diverse neighborhoods, and exceptional food.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    singapore: {
      slug: "singapore",
      city: "Singapore",
      country: "Singapore",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Food lovers", "Modern architecture fans"],
      style: ["Modern architecture", "Diverse neighborhoods", "Exceptional food"],
      pacing: [
        "Singapore rewards a calm pace despite its compact size. Focus each day on one major area, then leave time for food discoveries, neighborhood walks, and relaxed garden time.",
        "Group your time by district. Pair Marina Bay with Gardens by the Bay for modern icons, dedicate another day to Chinatown and Little India for culture and food, then explore Sentosa or neighborhoods for contrast.",
        "Save unhurried time for food center visits, long garden walks, and the relaxed meals that showcase Singapore's exceptional multicultural cuisine.",
      ],
      hero: {
        title: "Singapore in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, combining modern architecture, diverse neighborhoods, and exceptional food scenes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80",
          alt: "Marina Bay skyline in Singapore with modern architecture and water.",
        },
      },
      cityStats: [
        { value: "5.6M", label: "Residents in the city-state" },
        { value: "4", label: "Official languages" },
        { value: "350+", label: "Parks and gardens" },
        { value: "12,000+", label: "Food establishments" },
      ],
      fit: {
        forYou: ["Modern architecture", "Diverse food scenes", "Efficient public transit", "Safe, clean streets", "Garden and park time"],
        notForYou: ["A packed schedule of only malls", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Marina Bay and modern icons",
          summary: "Marina Bay, Gardens by the Bay, and skyline views.",
          morning: "Marina Bay Sands area and Merlion",
          afternoon: "Gardens by the Bay and Cloud Forest",
          evening: "Marina Bay light show and dinner",
        },
        {
          day: 2,
          title: "Cultural neighborhoods",
          summary: "Chinatown, Little India, and diverse food.",
          morning: "Chinatown and Buddha Tooth Relic Temple",
          afternoon: "Little India and Sri Veeramakaliamman Temple",
          evening: "Food center dinner and neighborhood walk",
        },
        {
          day: 3,
          title: "Sentosa or neighborhoods",
          summary: "Sentosa Island, Orchard Road, or relaxed time.",
          morning: "Sentosa Island or Botanic Gardens",
          afternoon: "Orchard Road or neighborhood exploration",
          evening: "Rooftop bar or traditional dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Modern architecture",
          description:
            "Marina Bay showcases Singapore's futuristic skyline. The Gardens by the Bay offer a green contrast with innovative design that feels both natural and engineered.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gardens_by_the_Bay_Singapore.jpg",
            alt: "Gardens by the Bay with Supertree Grove and modern architecture.",
          },
        },
        {
          title: "Diverse neighborhoods",
          description:
            "Chinatown and Little India preserve cultural heritage while offering exceptional food. Slow walks reveal temples, markets, and local life that feels authentic and vibrant.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Chinatown_Singapore.jpg",
            alt: "Chinatown in Singapore with traditional architecture and colorful buildings.",
          },
        },
        {
          title: "Exceptional food culture",
          description:
            "From hawker centers to fine dining, Singapore's food scene is world-class. Long meals and local discoveries showcase the city's multicultural cuisine.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hawker_Center_Singapore.jpg",
            alt: "Hawker center in Singapore with food stalls and diverse cuisine.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "Year-round, though February to April is driest" },
        { label: "Airport transfer", value: "MRT or taxi to city center" },
        { label: "Transit tips", value: "Get an EZ-Link card for easy MRT and bus access" },
        { label: "Ticketing", value: "Book Gardens by the Bay and major attractions in advance" },
        { label: "Neighborhood stay", value: "Marina Bay, Orchard Road, or Chinatown areas" },
      ],
      checklist: [
        "Get an EZ-Link card for transit",
        "Book Gardens by the Bay in advance",
        "Pack light, breathable clothing",
        "Save offline maps for Singapore",
        "Plan one hawker center meal",
        "Carry cash for food centers and markets",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Singapore?",
          answer:
            "Yes for the core highlights. This plan balances modern icons, cultural neighborhoods, and food with enough breathing room for garden walks, neighborhood exploration, and unplanned discoveries.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "For Gardens by the Bay and Marina Bay Sands SkyPark, yes—book in advance for timed entry. Most temples and neighborhoods don't require advance booking.",
        },
        {
          question: "Is Singapore walkable?",
          answer:
            "Neighborhoods are walkable, but Singapore is best explored with a mix of walking and efficient MRT transit. The city is compact and well-connected.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Marina Bay offers modern convenience and skyline views. Orchard Road provides shopping and central location, while Chinatown offers cultural character.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Gardens by the Bay to avoid crowds and heat. Temples are pleasant throughout the day. Afternoons can include indoor stops or air-conditioned breaks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end restaurants, yes—especially on weekends. For hawker centers and casual spots, walk-ins are the norm. Food centers don't require reservations.",
        },
        {
          question: "Is English widely spoken?",
          answer:
            "Yes, English is one of the official languages and widely spoken. Signs are in English, and most locals are fluent. This makes Singapore very accessible for English speakers.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokyo",
          days: 4,
          description: "Traditional temples, modern districts, and exceptional food culture.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Golden temples, floating markets, and vibrant street food.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Skyline views, traditional markets, and easy island escapes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "hong-kong": {
      slug: "hong-kong",
      city: "Hong Kong",
      country: "China",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Skyline lovers", "Food enthusiasts"],
      style: ["Skyline views", "Traditional markets", "Easy island escapes"],
      pacing: [
        "Hong Kong rewards a calm pace across its mix of urban energy and natural escapes. Focus each day on one major area, then leave time for market visits, island trips, and spontaneous food discoveries.",
        "Group your time by district. Pair Victoria Peak with Central for skyline views, dedicate another day to Kowloon for markets and culture, then explore an outlying island like Lantau for contrast.",
        "Save unhurried time for market walks, long island visits, and the relaxed meals that showcase Hong Kong's exceptional food culture.",
      ],
      hero: {
        title: "Hong Kong in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, with skyline views, traditional markets, and easy island escapes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1600&q=80",
          alt: "Hong Kong skyline with Victoria Harbour and modern skyscrapers.",
        },
      },
      cityStats: [
        { value: "7.5M", label: "Residents in the city" },
        { value: "263", label: "Islands in Hong Kong" },
        { value: "40%", label: "Land designated as country parks" },
        { value: "11,000+", label: "Restaurants and food establishments" },
      ],
      fit: {
        forYou: ["Iconic skyline views", "Traditional markets", "Island day trips", "Efficient public transit", "Diverse food scenes"],
        notForYou: ["A packed schedule of only shopping", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Skyline and Peak",
          summary: "Victoria Peak, Star Ferry, and harbor views.",
          morning: "Victoria Peak and Sky Terrace",
          afternoon: "Star Ferry to Kowloon and Tsim Sha Tsui",
          evening: "Avenue of Stars and Symphony of Lights",
        },
        {
          day: 2,
          title: "Markets and culture",
          summary: "Temple Street, markets, and local neighborhoods.",
          morning: "Temple Street Night Market area",
          afternoon: "Wong Tai Sin Temple or local markets",
          evening: "Kowloon food walk and neighborhood exploration",
        },
        {
          day: 3,
          title: "Island escape",
          summary: "Lantau Island, Big Buddha, or relaxed time.",
          morning: "Lantau Island and Ngong Ping",
          afternoon: "Big Buddha and Po Lin Monastery",
          evening: "Return to city or island dinner",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic skyline",
          description:
            "Victoria Peak offers the classic Hong Kong view. The Star Ferry provides a scenic way to cross the harbor while taking in the skyline from water level.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Victoria_Peak_Hong_Kong.jpg",
            alt: "View from Victoria Peak showing Hong Kong skyline and harbor.",
          },
        },
        {
          title: "Traditional markets",
          description:
            "Temple Street and other markets showcase local life with food, goods, and evening energy that feels authentic and vibrant.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Temple_Street_Market_Hong_Kong.jpg",
            alt: "Temple Street Night Market with stalls and evening lights.",
          },
        },
        {
          title: "Island escapes",
          description:
            "Lantau and other outlying islands offer natural contrast to Hong Kong's urban energy. Day trips provide hiking, beaches, and quiet moments.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Big_Buddha_Lantau.jpg",
            alt: "Big Buddha statue on Lantau Island with mountain backdrop.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "October to April for cooler, drier weather" },
        { label: "Airport transfer", value: "Airport Express train or bus to city center" },
        { label: "Transit tips", value: "Get an Octopus card for easy MTR, bus, and ferry access" },
        { label: "Ticketing", value: "Book Peak Tram and major attractions in advance" },
        { label: "Neighborhood stay", value: "Central, Tsim Sha Tsui, or Causeway Bay" },
      ],
      checklist: [
        "Get an Octopus card for transit",
        "Book Peak Tram tickets in advance",
        "Pack comfortable walking shoes",
        "Save offline maps for Hong Kong",
        "Plan one island day trip",
        "Carry cash for markets and street food",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Hong Kong?",
          answer:
            "Yes for the core highlights. This plan balances skyline views, markets, and island time with enough breathing room for food discoveries, neighborhood walks, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "For Victoria Peak Tram and major attractions, yes—book in advance for timed entry. Markets and neighborhoods don't require advance booking.",
        },
        {
          question: "Is Hong Kong walkable?",
          answer:
            "Neighborhoods are walkable, but Hong Kong is hilly and spread out. Use the efficient MTR system for longer distances, then explore on foot within each area. The Star Ferry offers scenic transit.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Central offers good MTR access and central location. Tsim Sha Tsui provides harbor views and easy access to Kowloon, while Causeway Bay offers shopping and local character.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Victoria Peak to avoid crowds and get clearer views. Markets are best in the evening. Island trips work well as full-day excursions.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end restaurants, yes—especially on weekends. For dim sum and casual spots, walk-ins are common. Food markets don't require reservations.",
        },
        {
          question: "Is English widely spoken?",
          answer:
            "Yes, English is widely spoken alongside Cantonese. Signs are bilingual, and most locals in tourist areas speak English. This makes Hong Kong very accessible.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokyo",
          days: 4,
          description: "Traditional temples, modern districts, and exceptional food culture.",
        },
        {
          slug: "singapore",
          city: "Singapore",
          days: 3,
          description: "Modern architecture, diverse neighborhoods, and exceptional food.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Golden temples, floating markets, and vibrant street food.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "new-york": {
      slug: "new-york",
      city: "New York",
      country: "USA",
      days: 4,
      pace: "Balanced",
      idealFor: ["First-timers", "Museum lovers", "Neighborhood explorers"],
      style: ["Iconic neighborhoods", "World-class museums", "Diverse food scenes"],
      pacing: [
        "New York rewards a calm pace despite its energy. Focus each day on one major area, then leave time for neighborhood walks, spontaneous food discoveries, and relaxed park time.",
        "Group your time by borough and neighborhood clusters. Pair Manhattan's museums with Central Park, dedicate another day to Brooklyn for bridges and local life, then explore different Manhattan neighborhoods for contrast.",
        "Save unhurried time for long park walks, neighborhood exploration, and the relaxed meals that showcase New York's exceptional food diversity.",
      ],
      hero: {
        title: "New York in 4 days",
        subtitle:
          "Explore the essentials with room to breathe, covering iconic neighborhoods, world-class museums, and diverse food scenes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80",
          alt: "New York City skyline with iconic buildings and Central Park.",
        },
      },
      cityStats: [
        { value: "8.3M", label: "Residents in the city" },
        { value: "5", label: "Boroughs across the city" },
        { value: "100+", label: "Museums and galleries" },
        { value: "24,000+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["Iconic landmarks", "World-class museums", "Diverse neighborhoods", "Efficient public transit", "Park and green space"],
        notForYou: ["A packed schedule of only shopping", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Manhattan core",
          summary: "Central Park, museums, and Upper East Side.",
          morning: "Central Park and reservoir walk",
          afternoon: "Metropolitan Museum or Museum of Natural History",
          evening: "Upper East Side or neighborhood dinner",
        },
        {
          day: 2,
          title: "Midtown and icons",
          summary: "Times Square, Empire State, and classic sights.",
          morning: "Times Square and Broadway area",
          afternoon: "Empire State Building or High Line",
          evening: "Theater district or neighborhood exploration",
        },
        {
          day: 3,
          title: "Brooklyn and bridges",
          summary: "Brooklyn Bridge, DUMBO, and local neighborhoods.",
          morning: "Brooklyn Bridge walk from Manhattan",
          afternoon: "DUMBO and Brooklyn Heights",
          evening: "Brooklyn neighborhood dinner",
        },
        {
          day: 4,
          title: "Neighborhoods and culture",
          summary: "SoHo, Greenwich Village, or relaxed time.",
          morning: "SoHo or Greenwich Village walk",
          afternoon: "Neighborhood exploration and shopping",
          evening: "West Village dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic skyline",
          description:
            "New York's skyline is instantly recognizable. Views from Brooklyn Bridge, Central Park, or observation decks showcase the city's scale and energy.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Bridge_New_York.jpg",
            alt: "Brooklyn Bridge with Manhattan skyline in the background.",
          },
        },
        {
          title: "World-class museums",
          description:
            "The Metropolitan Museum and Museum of Natural History offer world-class collections. Plan one focused visit, then balance it with park time and neighborhood walks.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Metropolitan_Museum_New_York.jpg",
            alt: "Metropolitan Museum of Art building with grand architecture.",
          },
        },
        {
          title: "Diverse neighborhoods",
          description:
            "From SoHo to Greenwich Village, New York's neighborhoods each have distinct character. Slow walks reveal local shops, cafes, and residential life.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Greenwich_Village_New_York.jpg",
            alt: "Greenwich Village street with brownstone buildings and tree-lined sidewalks.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to November" },
        { label: "Airport transfer", value: "AirTrain and subway or taxi to city center" },
        { label: "Transit tips", value: "Get a MetroCard for easy subway and bus access" },
        { label: "Ticketing", value: "Book major museums and observation decks in advance" },
        { label: "Neighborhood stay", value: "Manhattan (Midtown, Upper East/West) or Brooklyn" },
      ],
      checklist: [
        "Get a MetroCard for transit",
        "Book major museum tickets in advance",
        "Pack comfortable walking shoes",
        "Save offline maps for New York",
        "Plan one long park walk",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 4 days enough for New York?",
          answer:
            "Yes for the core highlights. This plan balances iconic landmarks, museums, and neighborhoods with enough breathing room for park time, food discoveries, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "For major museums like the Met and observation decks like Empire State Building, yes—book in advance for timed entry and shorter waits, especially in peak season.",
        },
        {
          question: "Is New York walkable?",
          answer:
            "Neighborhoods are walkable, but New York is vast. Use the efficient subway system for longer distances, then explore on foot within each area. Walking between nearby neighborhoods is also enjoyable.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Manhattan offers central location and easy access to major sights. Midtown provides good transit connections, while Upper East/West offers quieter streets near Central Park.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for museums to avoid crowds. Central Park is pleasant throughout the day. Afternoons can include neighborhood walks or indoor stops.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends and for dinner. Many places accept walk-ins for lunch. Food markets and casual spots don't require reservations.",
        },
        {
          question: "Is New York safe?",
          answer:
            "Yes, generally very safe, especially in tourist areas. Use common sense, stay aware of your surroundings, and avoid isolated areas late at night. The subway is safe and efficient.",
        },
      ],
      relatedItineraries: [
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and neighborhoods across the Thames.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Classic landmarks, museums, and cafe neighborhoods.",
        },
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Hillside neighborhoods, waterfront walks, and diverse cuisine.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "san-francisco": {
      slug: "san-francisco",
      city: "San Francisco",
      country: "USA",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Food lovers", "Neighborhood explorers"],
      style: ["Hillside neighborhoods", "Waterfront walks", "Diverse cuisine"],
      pacing: [
        "San Francisco rewards a calm pace across its hilly neighborhoods. Focus each day on one major area, then leave time for waterfront walks, spontaneous food discoveries, and relaxed park time.",
        "Group your time by district. Pair Fisherman's Wharf with North Beach for classic sights, dedicate another day to Golden Gate Bridge and Presidio, then explore neighborhoods like Mission or Haight-Ashbury for local character.",
        "Save unhurried time for long waterfront walks, neighborhood exploration, and the relaxed meals that showcase San Francisco's exceptional food diversity.",
      ],
      hero: {
        title: "San Francisco in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, featuring hillside neighborhoods, waterfront walks, and diverse cuisine.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80",
          alt: "Golden Gate Bridge in San Francisco with bay and city in background.",
        },
      },
      cityStats: [
        { value: "875K", label: "Residents in the city" },
        { value: "43", label: "Hills across the city" },
        { value: "200+", label: "Parks and green spaces" },
        { value: "4,500+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["Iconic Golden Gate Bridge", "Hillside neighborhoods", "Waterfront walks", "Diverse food scenes", "Park and green space"],
        notForYou: ["A packed schedule of only shopping", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Golden Gate and Presidio",
          summary: "Golden Gate Bridge, Presidio, and waterfront.",
          morning: "Golden Gate Bridge walk or bike",
          afternoon: "Presidio and Crissy Field",
          evening: "Marina District or neighborhood dinner",
        },
        {
          day: 2,
          title: "Fisherman's Wharf and Alcatraz",
          summary: "Waterfront, Alcatraz, and classic sights.",
          morning: "Alcatraz tour (book in advance)",
          afternoon: "Fisherman's Wharf and Pier 39",
          evening: "North Beach neighborhood dinner",
        },
        {
          day: 3,
          title: "Neighborhoods and culture",
          summary: "Mission, Haight-Ashbury, or relaxed time.",
          morning: "Mission District and murals",
          afternoon: "Haight-Ashbury or Golden Gate Park",
          evening: "Neighborhood dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic Golden Gate",
          description:
            "The Golden Gate Bridge is San Francisco's signature. Walking or biking across offers bay views and a sense of the city's scale and natural setting.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Gate_Bridge_Walk.jpg",
            alt: "People walking across Golden Gate Bridge with bay views.",
          },
        },
        {
          title: "Hillside neighborhoods",
          description:
            "San Francisco's hills create distinct neighborhoods with character. From North Beach to Mission, each area offers local shops, cafes, and residential charm.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/San_Francisco_Hills.jpg",
            alt: "San Francisco hillside neighborhood with colorful houses and steep streets.",
          },
        },
        {
          title: "Waterfront walks",
          description:
            "The Embarcadero and Marina offer long waterfront paths. Slow walks provide bay views, park time, and easy access to neighborhoods and food.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Embarcadero_San_Francisco.jpg",
            alt: "Embarcadero waterfront in San Francisco with bay and city skyline.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to October for warmer, drier weather" },
        { label: "Airport transfer", value: "BART train or taxi to city center" },
        { label: "Transit tips", value: "Get a Clipper card for easy Muni and BART access" },
        { label: "Ticketing", value: "Book Alcatraz tours well in advance" },
        { label: "Neighborhood stay", value: "Union Square, Fisherman's Wharf, or Mission areas" },
      ],
      checklist: [
        "Book Alcatraz tour well in advance",
        "Get a Clipper card for transit",
        "Pack comfortable walking shoes for hills",
        "Save offline maps for San Francisco",
        "Plan one long waterfront walk",
        "Carry layers for changing weather",
      ],
      faqs: [
        {
          question: "Is 3 days enough for San Francisco?",
          answer:
            "Yes for the core highlights. This plan balances iconic sights, neighborhoods, and waterfront time with enough breathing room for food discoveries, park walks, and unplanned stops.",
        },
        {
          question: "Do I need to book Alcatraz in advance?",
          answer:
            "Yes, absolutely. Alcatraz tours sell out weeks in advance, especially in peak season. Book as early as possible through the official National Park Service website.",
        },
        {
          question: "Is San Francisco walkable?",
          answer:
            "Neighborhoods are walkable, but San Francisco is hilly. Use Muni and BART for longer distances, then explore on foot within each area. The hills are part of the experience.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Union Square offers central location and good transit. Fisherman's Wharf provides waterfront access, while Mission offers local character and food scenes.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Golden Gate Bridge to avoid crowds and fog. Alcatraz tours have set times. Afternoons can include neighborhood walks or indoor stops.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins for lunch. Food markets and casual spots don't require reservations.",
        },
        {
          question: "What about the weather?",
          answer:
            "San Francisco has microclimates and can be cool even in summer. Bring layers—fog is common, especially near the water. The city is known for its changeable weather.",
        },
      ],
      relatedItineraries: [
        {
          slug: "new-york",
          city: "New York",
          days: 4,
          description: "Iconic neighborhoods, world-class museums, and diverse food scenes.",
        },
        {
          slug: "los-angeles",
          city: "Los Angeles",
          days: 3,
          description: "Beaches, iconic neighborhoods, and relaxed coastal vibes.",
        },
        {
          slug: "london",
          city: "London",
          days: 3,
          description: "Iconic sights, museums, and neighborhoods across the Thames.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "los-angeles": {
      slug: "los-angeles",
      city: "Los Angeles",
      country: "USA",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Beach lovers", "Entertainment seekers"],
      style: ["Beaches", "Iconic neighborhoods", "Relaxed coastal vibes"],
      pacing: [
        "Los Angeles rewards a calm pace across its spread-out neighborhoods. Focus each day on one major area, then leave time for beach time, spontaneous food discoveries, and relaxed neighborhood walks.",
        "Group your time by region. Pair Santa Monica with Venice for beach culture, dedicate another day to Hollywood and Griffith Observatory, then explore neighborhoods like Beverly Hills or Downtown for contrast.",
        "Save unhurried time for long beach walks, neighborhood exploration, and the relaxed meals that showcase LA's diverse food culture.",
      ],
      hero: {
        title: "Los Angeles in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, balancing beaches, iconic neighborhoods, and relaxed coastal vibes.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1756072226051-f6835aec4f9a?auto=format&fit=crop&w=1600&q=80",
          alt: "Los Angeles downtown skyline at sunset with city lights.",
        },
      },
      cityStats: [
        { value: "4M", label: "Residents in the city" },
        { value: "75", label: "Miles of coastline" },
        { value: "88", label: "Incorporated cities in LA County" },
        { value: "10,000+", label: "Restaurants across the metro area" },
      ],
      fit: {
        forYou: ["Beach time and coastal walks", "Iconic neighborhoods", "Entertainment culture", "Diverse food scenes", "Relaxed pace"],
        notForYou: ["A packed schedule of only theme parks", "Museum-focused only", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Beaches and coast",
          summary: "Santa Monica, Venice Beach, and coastal walks.",
          morning: "Santa Monica Pier and beach",
          afternoon: "Venice Beach boardwalk and canals",
          evening: "Beach sunset and dinner",
        },
        {
          day: 2,
          title: "Hollywood and views",
          summary: "Griffith Observatory, Hollywood, and iconic sights.",
          morning: "Griffith Observatory and park",
          afternoon: "Hollywood Walk of Fame and area",
          evening: "Sunset Boulevard or neighborhood dinner",
        },
        {
          day: 3,
          title: "Neighborhoods and culture",
          summary: "Beverly Hills, Downtown, or relaxed time.",
          morning: "Beverly Hills or Downtown LA",
          afternoon: "Neighborhood exploration and shopping",
          evening: "Neighborhood dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic beaches",
          description:
            "Santa Monica and Venice Beach showcase LA's coastal culture. Long beach walks, pier visits, and relaxed time by the water are central to the experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Venice_Beach_Los_Angeles.jpg",
            alt: "Venice Beach boardwalk with palm trees and ocean.",
          },
        },
        {
          title: "Griffith Observatory",
          description:
            "Griffith Observatory offers city views and a sense of LA's scale. The park surrounding it provides green space and hiking trails with city panoramas.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Griffith_Observatory_Los_Angeles.jpg",
            alt: "Griffith Observatory with city skyline in background.",
          },
        },
        {
          title: "Diverse neighborhoods",
          description:
            "From Beverly Hills to Downtown, LA's neighborhoods each have distinct character. Slow drives or walks reveal local shops, cafes, and residential charm.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Beverly_Hills_Los_Angeles.jpg",
            alt: "Beverly Hills street with palm trees and upscale shops.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "Year-round, though spring and fall are most pleasant" },
        { label: "Airport transfer", value: "FlyAway bus or taxi to city center" },
        { label: "Transit tips", value: "Rental car recommended; Metro for some areas" },
        { label: "Ticketing", value: "Book major attractions like Universal Studios in advance" },
        { label: "Neighborhood stay", value: "Santa Monica, Hollywood, or Downtown areas" },
      ],
      checklist: [
        "Consider rental car for flexibility",
        "Book major attractions in advance",
        "Pack beach essentials and sunscreen",
        "Save offline maps for Los Angeles",
        "Plan one long beach walk",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Los Angeles?",
          answer:
            "Yes for the core highlights. This plan balances beaches, iconic neighborhoods, and entertainment culture with enough breathing room for food discoveries, relaxed time, and unplanned stops.",
        },
        {
          question: "Do I need a car in LA?",
          answer:
            "A rental car provides the most flexibility, as LA is spread out. Public transit exists but is limited. Ride-sharing services are also widely available and convenient.",
        },
        {
          question: "Is Los Angeles walkable?",
          answer:
            "Neighborhoods can be walkable, but LA is very spread out. Beach areas like Santa Monica and Venice are more walkable. Most areas require transportation between them.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Santa Monica offers beach access and walkable areas. Hollywood provides central location, while Downtown offers urban character and good transit connections.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for beaches to avoid crowds and get parking. Griffith Observatory is pleasant throughout the day. Afternoons can include neighborhood exploration.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins for lunch. Food markets and casual spots don't require reservations.",
        },
        {
          question: "What about traffic?",
          answer:
            "LA traffic is real. Plan extra time for driving, especially during rush hours. Consider staying in one area per day to minimize driving time.",
        },
      ],
      relatedItineraries: [
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Hillside neighborhoods, waterfront walks, and diverse cuisine.",
        },
        {
          slug: "sydney",
          city: "Sydney",
          days: 3,
          description: "Harbor views, coastal walks, and relaxed beach time.",
        },
        {
          slug: "new-york",
          city: "New York",
          days: 4,
          description: "Iconic neighborhoods, world-class museums, and diverse food scenes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    sydney: {
      slug: "sydney",
      city: "Sydney",
      country: "Australia",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Beach lovers", "Harbor enthusiasts"],
      style: ["Harbor views", "Coastal walks", "Relaxed beach time"],
      pacing: [
        "Sydney rewards a calm pace across its harbor and coastal areas. Focus each day on one major area, then leave time for harbor walks, beach time, and spontaneous food discoveries.",
        "Group your time by region. Pair the Opera House with Circular Quay for iconic sights, dedicate another day to Bondi Beach and coastal walks, then explore neighborhoods like The Rocks or Surry Hills for local character.",
        "Save unhurried time for long harbor walks, beach relaxation, and the relaxed meals that showcase Sydney's diverse food culture.",
      ],
      hero: {
        title: "Sydney in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, with harbor views, coastal walks, and relaxed beach time.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80",
          alt: "Sydney Opera House and Harbour Bridge with harbor in foreground.",
        },
      },
      cityStats: [
        { value: "5.3M", label: "Residents in the metro area" },
        { value: "100+", label: "Beaches along the coast" },
        { value: "70", label: "Harbor islands" },
        { value: "3,000+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["Iconic Opera House and Harbour Bridge", "Harbor walks and ferry rides", "Beach time and coastal walks", "Diverse food scenes", "Relaxed pace"],
        notForYou: ["A packed schedule of only beaches", "Museum-focused only", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Harbor icons",
          summary: "Opera House, Harbour Bridge, and Circular Quay.",
          morning: "Sydney Opera House tour or exterior",
          afternoon: "Circular Quay and Harbour Bridge walk",
          evening: "The Rocks area and dinner",
        },
        {
          day: 2,
          title: "Beaches and coast",
          summary: "Bondi Beach, coastal walk, and beach time.",
          morning: "Bondi Beach and promenade",
          afternoon: "Coastal walk to Coogee or Bronte",
          evening: "Beach area dinner or return to city",
        },
        {
          day: 3,
          title: "Neighborhoods and culture",
          summary: "Royal Botanic Gardens, neighborhoods, or relaxed time.",
          morning: "Royal Botanic Gardens and Mrs. Macquarie's Chair",
          afternoon: "Surry Hills or neighborhood exploration",
          evening: "Neighborhood dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic harbor",
          description:
            "The Opera House and Harbour Bridge define Sydney's skyline. Harbor walks and ferry rides provide the best views and a sense of the city's relationship with the water.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Harbour_Ferry.jpg",
            alt: "Ferry on Sydney Harbour with Opera House and bridge in background.",
          },
        },
        {
          title: "Coastal walks",
          description:
            "Bondi to Coogee coastal walk showcases Sydney's beach culture. The path offers ocean views, beach access, and a relaxed pace that feels both active and peaceful.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bondi_Beach_Sydney.jpg",
            alt: "Bondi Beach in Sydney with golden sand and ocean.",
          },
        },
        {
          title: "Harbor neighborhoods",
          description:
            "The Rocks preserves historic character near the harbor, while neighborhoods like Surry Hills offer local cafes, shops, and residential charm.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Rocks_Sydney.jpg",
            alt: "The Rocks neighborhood in Sydney with historic buildings.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "September to November or March to May" },
        { label: "Airport transfer", value: "Airport Link train or taxi to city center" },
        { label: "Transit tips", value: "Get an Opal card for easy ferry, train, and bus access" },
        { label: "Ticketing", value: "Book Opera House tours in advance" },
        { label: "Neighborhood stay", value: "Circular Quay, The Rocks, or Bondi areas" },
      ],
      checklist: [
        "Get an Opal card for transit",
        "Book Opera House tour in advance",
        "Pack beach essentials and sunscreen",
        "Save offline maps for Sydney",
        "Plan one harbor ferry ride",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Sydney?",
          answer:
            "Yes for the core highlights. This plan balances harbor icons, beaches, and neighborhoods with enough breathing room for coastal walks, food discoveries, and unplanned stops.",
        },
        {
          question: "Do I need to book Opera House tours?",
          answer:
            "Yes, book in advance for guided tours. You can also see the exterior and enjoy the harbor views without a tour. The building is impressive from outside.",
        },
        {
          question: "Is Sydney walkable?",
          answer:
            "Harbor areas and neighborhoods are walkable, but Sydney is spread out. Use ferries, trains, and buses for longer distances, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Circular Quay offers harbor views and easy access to major sights. The Rocks provides historic character, while Bondi offers beach access and relaxed vibes.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for beaches to avoid crowds and get good light. Harbor areas are pleasant throughout the day. Afternoons can include neighborhood walks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins for lunch. Food markets and casual spots don't require reservations.",
        },
        {
          question: "What about the weather?",
          answer:
            "Sydney has a temperate climate. Summers (Dec-Feb) are warm, winters (Jun-Aug) are mild. Bring layers and sunscreen year-round. The weather is generally pleasant.",
        },
      ],
      relatedItineraries: [
        {
          slug: "melbourne",
          city: "Melbourne",
          days: 3,
          description: "Laneway culture, coffee scenes, and easygoing neighborhoods.",
        },
        {
          slug: "los-angeles",
          city: "Los Angeles",
          days: 3,
          description: "Beaches, iconic neighborhoods, and relaxed coastal vibes.",
        },
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Hillside neighborhoods, waterfront walks, and diverse cuisine.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    melbourne: {
      slug: "melbourne",
      city: "Melbourne",
      country: "Australia",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Coffee lovers", "Culture seekers"],
      style: ["Laneway culture", "Coffee scenes", "Easygoing neighborhoods"],
      pacing: [
        "Melbourne rewards a calm pace across its laneways and neighborhoods. Focus each day on one major area, then leave time for cafe stops, spontaneous food discoveries, and relaxed neighborhood walks.",
        "Group your time by district. Pair the CBD with laneways for coffee and culture, dedicate another day to St. Kilda or Fitzroy for local character, then explore markets and neighborhoods for contrast.",
        "Save unhurried time for long cafe sessions, laneway exploration, and the relaxed meals that showcase Melbourne's exceptional food and coffee culture.",
      ],
      hero: {
        title: "Melbourne in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, focused on laneway culture, coffee scenes, and easygoing neighborhoods.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1757807776083-221d653b161b?auto=format&fit=crop&w=1600&q=80",
          alt: "Melbourne city skyline with Yarra River and modern architecture.",
        },
      },
      cityStats: [
        { value: "5M", label: "Residents in the metro area" },
        { value: "40+", label: "Laneways with street art" },
        { value: "2,000+", label: "Cafes across the city" },
        { value: "4,000+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["Laneway exploration", "Coffee culture", "Diverse food scenes", "Easygoing neighborhoods", "Art and culture"],
        notForYou: ["A packed schedule of only beaches", "Iconic landmarks focus", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "CBD and laneways",
          summary: "Federation Square, laneways, and coffee culture.",
          morning: "Federation Square and Flinders Street Station",
          afternoon: "Laneway exploration and street art",
          evening: "CBD dinner or neighborhood exploration",
        },
        {
          day: 2,
          title: "Markets and neighborhoods",
          summary: "Queen Victoria Market, neighborhoods, and local life.",
          morning: "Queen Victoria Market",
          afternoon: "Fitzroy or St. Kilda neighborhood walk",
          evening: "Neighborhood dinner and local scene",
        },
        {
          day: 3,
          title: "Culture and relaxation",
          summary: "Royal Botanic Gardens, museums, or relaxed time.",
          morning: "Royal Botanic Gardens or National Gallery",
          afternoon: "Neighborhood exploration or shopping",
          evening: "Relaxed dinner or cafe time",
        },
      ],
      imageInfoCards: [
        {
          title: "Laneway culture",
          description:
            "Melbourne's laneways are hidden gems with street art, cafes, and local character. Slow walks reveal murals, coffee shops, and a creative energy that defines the city.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hosier_Lane_Melbourne.jpg",
            alt: "Hosier Lane in Melbourne with colorful street art and murals.",
          },
        },
        {
          title: "Coffee culture",
          description:
            "Melbourne is known for its exceptional coffee scene. Long cafe sessions, flat whites, and relaxed mornings are central to the local rhythm.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Melbourne_Cafe.jpg",
            alt: "Coffee shop in Melbourne laneway with outdoor seating.",
          },
        },
        {
          title: "Easygoing neighborhoods",
          description:
            "Fitzroy and St. Kilda showcase Melbourne's neighborhood character with local shops, cafes, and residential charm that feels both creative and relaxed.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Fitzroy_Melbourne.jpg",
            alt: "Fitzroy neighborhood in Melbourne with colorful buildings.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "September to November or March to May" },
        { label: "Airport transfer", value: "SkyBus or taxi to city center" },
        { label: "Transit tips", value: "Get a myki card for easy tram, train, and bus access" },
        { label: "Ticketing", value: "Book major attractions in advance if needed" },
        { label: "Neighborhood stay", value: "CBD, Fitzroy, or St. Kilda areas" },
      ],
      checklist: [
        "Get a myki card for transit",
        "Pack comfortable walking shoes",
        "Save offline maps for Melbourne",
        "Plan one long cafe session",
        "Explore laneways with street art",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Melbourne?",
          answer:
            "Yes for the core highlights. This plan balances laneways, neighborhoods, and markets with enough breathing room for cafe time, food discoveries, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "Most laneways and neighborhoods don't require booking. For major museums or special events, check in advance. Markets are open and accessible.",
        },
        {
          question: "Is Melbourne walkable?",
          answer:
            "The CBD and neighborhoods are very walkable. Trams provide easy access between areas. Melbourne is known for being pedestrian-friendly.",
        },
        {
          question: "Where should I stay?",
          answer:
            "CBD offers central location and easy access to laneways. Fitzroy provides local character, while St. Kilda offers beach access and relaxed vibes.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for markets to avoid crowds. Laneways are pleasant throughout the day. Afternoons can include neighborhood walks or cafe time.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many cafes and casual spots accept walk-ins. Food markets don't require reservations.",
        },
        {
          question: "What about the coffee?",
          answer:
            "Melbourne's coffee is exceptional. Don't miss trying a flat white, and take time to explore different cafes. The coffee culture is a central part of the experience.",
        },
      ],
      relatedItineraries: [
        {
          slug: "sydney",
          city: "Sydney",
          days: 3,
          description: "Harbor views, coastal walks, and relaxed beach time.",
        },
        {
          slug: "amsterdam",
          city: "Amsterdam",
          days: 3,
          description: "Canal walks, world-class museums, and relaxed neighborhoods.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 4,
          description: "Gaudi architecture, walkable neighborhoods, and beaches.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dubai: {
      slug: "dubai",
      city: "Dubai",
      country: "UAE",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Modern architecture fans", "Luxury seekers"],
      style: ["Modern architecture", "Traditional souks", "Desert experiences"],
      pacing: [
        "Dubai rewards a calm pace across its mix of modern and traditional. Focus each day on one major area, then leave time for souk visits, spontaneous food discoveries, and relaxed waterfront time.",
        "Group your time by district. Pair Burj Khalifa with Dubai Mall for modern icons, dedicate another day to traditional souks and old Dubai, then explore a desert experience or beach for contrast.",
        "Save unhurried time for souk walks, long mall visits, and the relaxed meals that showcase Dubai's diverse food culture.",
      ],
      hero: {
        title: "Dubai in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, pairing modern architecture, traditional souks, and desert experiences.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
          alt: "Burj Khalifa in Dubai with modern skyline.",
        },
      },
      cityStats: [
        { value: "3.4M", label: "Residents in the city" },
        { value: "828m", label: "Burj Khalifa height (world's tallest)" },
        { value: "200+", label: "Nationalities in the city" },
        { value: "365", label: "Days of sunshine per year" },
      ],
      fit: {
        forYou: ["Modern architecture", "Traditional souks", "Desert experiences", "Luxury shopping", "Diverse food scenes"],
        notForYou: ["A packed schedule of only malls", "Beach-focused only", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Modern icons",
          summary: "Burj Khalifa, Dubai Mall, and modern architecture.",
          morning: "Burj Khalifa observation deck",
          afternoon: "Dubai Mall and Dubai Fountain",
          evening: "Fountain show and dinner",
        },
        {
          day: 2,
          title: "Traditional Dubai",
          summary: "Gold Souk, Spice Souk, and old Dubai.",
          morning: "Gold Souk and Spice Souk",
          afternoon: "Dubai Museum and Al Fahidi Historic District",
          evening: "Dubai Creek and traditional dinner",
        },
        {
          day: 3,
          title: "Desert or beach",
          summary: "Desert safari, beach time, or relaxed exploration.",
          morning: "Desert safari or Jumeirah Beach",
          afternoon: "Beach time or Palm Jumeirah",
          evening: "Relaxed dinner or return from desert",
        },
      ],
      imageInfoCards: [
        {
          title: "Modern architecture",
          description:
            "Burj Khalifa and the Dubai skyline showcase ambitious modern design. The observation deck offers city views, while the surrounding area provides shopping and dining.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubai_Marina_Skyline.jpg",
            alt: "Dubai Marina skyline with modern skyscrapers.",
          },
        },
        {
          title: "Traditional souks",
          description:
            "The Gold Souk and Spice Souk preserve traditional market culture. Slow walks reveal local goods, bargaining, and an authentic side of Dubai beyond the modern icons.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gold_Souk_Dubai.jpg",
            alt: "Gold Souk in Dubai with shops and traditional architecture.",
          },
        },
        {
          title: "Desert experiences",
          description:
            "Desert safaris offer dune bashing, camel rides, and sunset views. The contrast between city and desert showcases Dubai's unique setting.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubai_Desert.jpg",
            alt: "Desert dunes in Dubai with sunset colors.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "November to March for cooler weather" },
        { label: "Airport transfer", value: "Metro or taxi to city center" },
        { label: "Transit tips", value: "Get a Nol card for easy Metro and bus access" },
        { label: "Ticketing", value: "Book Burj Khalifa and desert safaris in advance" },
        { label: "Neighborhood stay", value: "Downtown Dubai, Dubai Marina, or near the beach" },
      ],
      checklist: [
        "Book Burj Khalifa tickets in advance",
        "Book desert safari if interested",
        "Get a Nol card for transit",
        "Pack light, breathable clothing",
        "Save offline maps for Dubai",
        "Carry cash for souks",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Dubai?",
          answer:
            "Yes for the core highlights. This plan balances modern icons, traditional souks, and desert time with enough breathing room for food discoveries, shopping, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "For Burj Khalifa, yes—book in advance for timed entry. Desert safaris should also be booked ahead. Souks and neighborhoods don't require advance booking.",
        },
        {
          question: "Is Dubai walkable?",
          answer:
            "Some areas are walkable, but Dubai is spread out and can be hot. Use the Metro for longer distances, then explore on foot within each area. Taxis are also convenient.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Downtown Dubai offers proximity to Burj Khalifa and Dubai Mall. Dubai Marina provides modern convenience, while areas near the beach offer resort-style stays.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early to avoid heat, especially for outdoor activities. Malls provide air-conditioned breaks. Desert safaris typically run in the afternoon and evening.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For high-end restaurants, yes—especially on weekends. Many places accept walk-ins. Food courts in malls don't require reservations.",
        },
        {
          question: "What about dress code?",
          answer:
            "Dubai is relatively liberal, but respectful dress is appreciated, especially in traditional areas. Beach areas are more relaxed. Cover shoulders and knees in souks and mosques.",
        },
      ],
      relatedItineraries: [
        {
          slug: "singapore",
          city: "Singapore",
          days: 3,
          description: "Modern architecture, diverse neighborhoods, and exceptional food.",
        },
        {
          slug: "tokyo",
          city: "Tokyo",
          days: 4,
          description: "Traditional temples, modern districts, and exceptional food culture.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Skyline views, traditional markets, and easy island escapes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    marrakech: {
      slug: "marrakech",
      city: "Marrakech",
      country: "Morocco",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Culture seekers", "Market lovers"],
      style: ["Historic medinas", "Vibrant souks", "Tranquil gardens"],
      pacing: [
        "Marrakech rewards a calm pace despite its energy. Focus each day on one major area, then leave time for souk visits, garden breaks, and spontaneous food discoveries.",
        "Group your time by area. Pair the medina with souks for traditional culture, dedicate another day to gardens and palaces, then explore neighborhoods like Gueliz for modern contrast.",
        "Save unhurried time for souk walks, long garden visits, and the relaxed meals that showcase Marrakech's exceptional food culture.",
      ],
      hero: {
        title: "Marrakech in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, featuring historic medinas, vibrant souks, and tranquil gardens.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1600&q=80",
          alt: "Jemaa el-Fnaa square in Marrakech with evening lights and activity.",
        },
      },
      cityStats: [
        { value: "1M", label: "Residents in the city" },
        { value: "700+", label: "Years of history" },
        { value: "18", label: "Gates to the medina" },
        { value: "1,000+", label: "Souk stalls in the medina" },
      ],
      fit: {
        forYou: ["Historic medina exploration", "Vibrant souk shopping", "Tranquil garden visits", "Traditional food experiences", "Cultural immersion"],
        notForYou: ["A packed schedule of only shopping", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Medina and souks",
          summary: "Jemaa el-Fnaa, souks, and traditional culture.",
          morning: "Jemaa el-Fnaa square",
          afternoon: "Souk exploration and shopping",
          evening: "Square at sunset and dinner",
        },
        {
          day: 2,
          title: "Palaces and gardens",
          summary: "Bahia Palace, Majorelle Garden, and tranquility.",
          morning: "Bahia Palace",
          afternoon: "Majorelle Garden",
          evening: "Gueliz neighborhood or medina return",
        },
        {
          day: 3,
          title: "Culture and relaxation",
          summary: "Saadian Tombs, neighborhoods, or relaxed time.",
          morning: "Saadian Tombs or medina walk",
          afternoon: "Neighborhood exploration or hammam",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic medina",
          description:
            "Marrakech's medina is a UNESCO World Heritage site with narrow alleys, traditional architecture, and a maze-like quality that rewards slow exploration.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marrakech_Medina.jpg",
            alt: "Narrow alley in Marrakech medina with traditional architecture.",
          },
        },
        {
          title: "Vibrant souks",
          description:
            "The souks offer everything from spices to leather goods. Slow walks reveal local crafts, bargaining culture, and an authentic market experience.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marrakech_Souk.jpg",
            alt: "Colorful souk in Marrakech with spices and goods.",
          },
        },
        {
          title: "Tranquil gardens",
          description:
            "Majorelle Garden and other green spaces provide peaceful contrast to the medina's energy. These oases offer quiet moments and beautiful design.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Majorelle_Garden_Marrakech.jpg",
            alt: "Majorelle Garden in Marrakech with blue buildings and plants.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "October to April for cooler weather" },
        { label: "Airport transfer", value: "Taxi or airport bus to city center" },
        { label: "Transit tips", value: "Walk the medina; taxis for longer distances" },
        { label: "Ticketing", value: "Buy palace and garden tickets on-site" },
        { label: "Neighborhood stay", value: "Medina (near Jemaa el-Fnaa) or Gueliz" },
      ],
      checklist: [
        "Pack comfortable walking shoes",
        "Bring cash for souks and markets",
        "Save offline maps for Marrakech",
        "Plan one garden visit",
        "Respect local customs and dress",
        "Carry a refillable water bottle",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Marrakech?",
          answer:
            "Yes for the core highlights. This plan balances medina exploration, souks, and gardens with enough breathing room for food discoveries, cultural experiences, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "Most palaces and gardens don't require advance booking. Buy tickets on-site. For popular restaurants, reservations help, especially during peak season.",
        },
        {
          question: "Is Marrakech walkable?",
          answer:
            "The medina is very walkable, though it's a maze. Use landmarks to navigate. Taxis are useful for reaching gardens and neighborhoods outside the medina.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The medina offers authentic riad experiences near the action. Gueliz provides modern convenience and is quieter, with easy access to gardens.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for souks to avoid heat and crowds. Gardens are pleasant throughout the day. Evenings are lively in Jemaa el-Fnaa.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially for dinner. Many places accept walk-ins. Street food in Jemaa el-Fnaa doesn't require reservations.",
        },
        {
          question: "What about bargaining?",
          answer:
            "Bargaining is expected in souks. Start at about half the asking price and negotiate politely. It's part of the cultural experience, so enjoy the process.",
        },
      ],
      relatedItineraries: [
        {
          slug: "cairo",
          city: "Cairo",
          days: 3,
          description: "Ancient pyramids, historic mosques, and bustling markets.",
        },
        {
          slug: "istanbul",
          city: "Istanbul",
          days: 3,
          description: "Historic core sights, ferry views, and layered neighborhoods.",
        },
        {
          slug: "dubai",
          city: "Dubai",
          days: 3,
          description: "Modern architecture, traditional souks, and desert experiences.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    cairo: {
      slug: "cairo",
      city: "Cairo",
      country: "Egypt",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Culture seekers"],
      style: ["Ancient pyramids", "Historic mosques", "Bustling markets"],
      pacing: [
        "Cairo rewards a calm pace despite its energy. Focus each day on one major area, then leave time for market visits, mosque breaks, and spontaneous food discoveries.",
        "Group your time by area. Pair the Pyramids of Giza with a morning visit, dedicate another day to Islamic Cairo and mosques, then explore the Egyptian Museum and Khan el-Khalili for culture and shopping.",
        "Save unhurried time for market walks, long museum visits, and the relaxed meals that showcase Cairo's exceptional food culture.",
      ],
      hero: {
        title: "Cairo in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, with ancient pyramids, historic mosques, and bustling markets.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1716639154447-98e6cd8de2e8?auto=format&fit=crop&w=1600&q=80",
          alt: "Pyramids of Giza with Sphinx in foreground, Cairo.",
        },
      },
      cityStats: [
        { value: "10M", label: "Residents in the metro area" },
        { value: "4,500+", label: "Years of history" },
        { value: "3", label: "Main pyramids at Giza" },
        { value: "1,000+", label: "Mosques across the city" },
      ],
      fit: {
        forYou: ["Ancient pyramid visits", "Historic mosque exploration", "Bustling market shopping", "Museum visits", "Cultural immersion"],
        notForYou: ["A packed schedule of only pyramids", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Pyramids of Giza",
          summary: "Great Pyramid, Sphinx, and ancient wonders.",
          morning: "Pyramids of Giza and Sphinx",
          afternoon: "Pyramid complex exploration",
          evening: "Return to city and dinner",
        },
        {
          day: 2,
          title: "Islamic Cairo",
          summary: "Mosques, historic streets, and culture.",
          morning: "Al-Azhar Mosque and area",
          afternoon: "Khan el-Khalili market",
          evening: "Historic Cairo walk and dinner",
        },
        {
          day: 3,
          title: "Museum and culture",
          summary: "Egyptian Museum, neighborhoods, or relaxed time.",
          morning: "Egyptian Museum",
          afternoon: "Neighborhood exploration or Coptic Cairo",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Ancient pyramids",
          description:
            "The Pyramids of Giza are among the world's most iconic sights. Early morning visits offer better light and fewer crowds, with time to appreciate their scale and history.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Great_Pyramid_Giza.jpg",
            alt: "Great Pyramid of Giza with desert and sky.",
          },
        },
        {
          title: "Historic mosques",
          description:
            "Islamic Cairo preserves centuries of architecture. Mosques like Al-Azhar showcase intricate design and offer peaceful moments away from the city's energy.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Azhar_Mosque_Cairo.jpg",
            alt: "Al-Azhar Mosque in Cairo with Islamic architecture.",
          },
        },
        {
          title: "Bustling markets",
          description:
            "Khan el-Khalili offers traditional market culture with spices, crafts, and local goods. Slow walks reveal bargaining, local life, and authentic experiences.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Khan_el-Khalili_Cairo.jpg",
            alt: "Khan el-Khalili market in Cairo with shops and crowds.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "October to April for cooler weather" },
        { label: "Airport transfer", value: "Taxi or airport bus to city center" },
        { label: "Transit tips", value: "Use taxis or organized tours for pyramids; walk the city center" },
        { label: "Ticketing", value: "Buy pyramid and museum tickets on-site" },
        { label: "Neighborhood stay", value: "Downtown Cairo or near Khan el-Khalili" },
      ],
      checklist: [
        "Book pyramid tour or arrange transport",
        "Pack comfortable walking shoes",
        "Bring cash for markets and tips",
        "Save offline maps for Cairo",
        "Plan one museum visit",
        "Respect local customs and dress",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Cairo?",
          answer:
            "Yes for the core highlights. This plan balances pyramids, Islamic Cairo, and museums with enough breathing room for market visits, cultural experiences, and unplanned stops.",
        },
        {
          question: "Do I need to book pyramid visits?",
          answer:
            "You can buy tickets on-site, but organized tours help with transportation and context. Early morning visits are recommended to avoid heat and crowds.",
        },
        {
          question: "Is Cairo walkable?",
          answer:
            "Islamic Cairo and downtown are walkable, but Cairo is vast and can be chaotic. Use taxis for longer distances. The pyramids require transportation from the city.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Downtown Cairo offers central location and good access. Areas near Khan el-Khalili provide historic character and easy market access.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start very early for pyramids to avoid heat and crowds. Museums and mosques are pleasant throughout the day. Markets are lively in the afternoon and evening.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially for dinner. Many places accept walk-ins. Street food doesn't require reservations.",
        },
        {
          question: "What about safety?",
          answer:
            "Cairo is generally safe for tourists, but use common sense. Avoid isolated areas at night, be cautious with valuables, and consider guided tours for pyramids.",
        },
      ],
      relatedItineraries: [
        {
          slug: "marrakech",
          city: "Marrakech",
          days: 3,
          description: "Historic medinas, vibrant souks, and tranquil gardens.",
        },
        {
          slug: "istanbul",
          city: "Istanbul",
          days: 3,
          description: "Historic core sights, ferry views, and layered neighborhoods.",
        },
        {
          slug: "athens",
          city: "Athens",
          days: 3,
          description: "Ancient sites, neighborhood cafes, and sunset viewpoints.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "buenos-aires": {
      slug: "buenos-aires",
      city: "Buenos Aires",
      country: "Argentina",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Culture lovers", "Food enthusiasts"],
      style: ["European architecture", "Tango culture", "Vibrant neighborhoods"],
      pacing: [
        "Buenos Aires rewards a calm pace across its European-influenced neighborhoods. Focus each day on one major area, then leave time for cafe culture, spontaneous food discoveries, and relaxed evening walks.",
        "Group your time by neighborhood. Pair La Boca with San Telmo for colorful culture, dedicate another day to Recoleta and Palermo for architecture and parks, then explore neighborhoods for local character.",
        "Save unhurried time for long cafe sessions, neighborhood exploration, and the relaxed meals that showcase Buenos Aires' exceptional food and wine culture.",
      ],
      hero: {
        title: "Buenos Aires in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, mixing European architecture, tango culture, and vibrant neighborhoods.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1601352682292-ab6ced05c50c?auto=format&fit=crop&w=1600&q=80",
          alt: "Colorful La Boca neighborhood in Buenos Aires with tango dancers.",
        },
      },
      cityStats: [
        { value: "3M", label: "Residents in the city" },
        { value: "48", label: "Neighborhoods (barrios)" },
        { value: "100+", label: "Tango venues" },
        { value: "4,000+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["European architecture", "Tango culture", "Vibrant neighborhoods", "Cafe culture", "Exceptional food and wine"],
        notForYou: ["A packed schedule of only museums", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Colorful neighborhoods",
          summary: "La Boca, San Telmo, and tango culture.",
          morning: "La Boca and Caminito",
          afternoon: "San Telmo market and area",
          evening: "Tango show or neighborhood dinner",
        },
        {
          day: 2,
          title: "Recoleta and culture",
          summary: "Recoleta Cemetery, Palermo, and architecture.",
          morning: "Recoleta Cemetery",
          afternoon: "Palermo neighborhoods and parks",
          evening: "Palermo dinner and local scene",
        },
        {
          day: 3,
          title: "City center and culture",
          summary: "Plaza de Mayo, neighborhoods, or relaxed time.",
          morning: "Plaza de Mayo and Casa Rosada",
          afternoon: "Neighborhood exploration or cafe time",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "European architecture",
          description:
            "Buenos Aires' architecture reflects European influence with grand boulevards, ornate buildings, and a sense of old-world elegance mixed with local character.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Recoleta_Cemetery_Buenos_Aires.jpg",
            alt: "Recoleta Cemetery in Buenos Aires with ornate mausoleums.",
          },
        },
        {
          title: "Tango culture",
          description:
            "Tango is central to Buenos Aires' identity. From street performances to formal shows, the dance and music are part of the city's cultural fabric.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tango_Buenos_Aires.jpg",
            alt: "Tango dancers in Buenos Aires with colorful backdrop.",
          },
        },
        {
          title: "Vibrant neighborhoods",
          description:
            "Each barrio has distinct character. From colorful La Boca to elegant Recoleta, slow walks reveal local cafes, shops, and residential charm.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Palermo_Buenos_Aires.jpg",
            alt: "Palermo neighborhood in Buenos Aires with tree-lined streets.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "March to May or September to November" },
        { label: "Airport transfer", value: "Taxi or airport bus to city center" },
        { label: "Transit tips", value: "Use subway and buses; taxis for convenience" },
        { label: "Ticketing", value: "Book tango shows in advance" },
        { label: "Neighborhood stay", value: "Palermo, Recoleta, or San Telmo" },
      ],
      checklist: [
        "Book tango show in advance",
        "Pack comfortable walking shoes",
        "Save offline maps for Buenos Aires",
        "Plan one long cafe session",
        "Try local steak and wine",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Buenos Aires?",
          answer:
            "Yes for the core highlights. This plan balances neighborhoods, culture, and food with enough breathing room for cafe time, tango experiences, and unplanned stops.",
        },
        {
          question: "Do I need to book tango shows?",
          answer:
            "Yes, book in advance, especially for popular venues. You can also see street tango in La Boca and San Telmo, which doesn't require booking.",
        },
        {
          question: "Is Buenos Aires walkable?",
          answer:
            "Neighborhoods are walkable, but Buenos Aires is spread out. Use the subway for longer distances, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Palermo offers local character and good food scenes. Recoleta provides elegant architecture, while San Telmo offers historic charm.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for markets and to avoid crowds. Afternoons are perfect for cafe culture. Evenings are lively, especially for tango and dinner.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular steakhouses (parrillas), yes—especially on weekends. Many cafes accept walk-ins. Food markets don't require reservations.",
        },
        {
          question: "What about the food?",
          answer:
            "Buenos Aires is known for exceptional steak, wine, and Italian-influenced cuisine. Don't miss trying a parrilla (steakhouse) and local Malbec wine.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rio-de-janeiro",
          city: "Rio de Janeiro",
          days: 3,
          description: "Iconic beaches, mountain viewpoints, and vibrant culture.",
        },
        {
          slug: "mexico-city",
          city: "Mexico City",
          days: 3,
          description: "Historic centers, world-class museums, and exceptional food markets.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Grand museums, historic plazas, and vibrant food markets.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "rio-de-janeiro": {
      slug: "rio-de-janeiro",
      city: "Rio de Janeiro",
      country: "Brazil",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "Beach lovers", "Culture seekers"],
      style: ["Iconic beaches", "Mountain viewpoints", "Vibrant culture"],
      pacing: [
        "Rio rewards a calm pace across its beaches and mountains. Focus each day on one major area, then leave time for beach time, spontaneous food discoveries, and relaxed evening walks.",
        "Group your time by region. Pair Copacabana with Ipanema for beach culture, dedicate another day to Christ the Redeemer and Sugarloaf for iconic views, then explore neighborhoods like Santa Teresa for local character.",
        "Save unhurried time for long beach walks, mountain viewpoints, and the relaxed meals that showcase Rio's exceptional food and culture.",
      ],
      hero: {
        title: "Rio de Janeiro in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, featuring iconic beaches, mountain viewpoints, and vibrant culture.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=80",
          alt: "Christ the Redeemer statue in Rio de Janeiro with city and ocean views.",
        },
      },
      cityStats: [
        { value: "6.7M", label: "Residents in the metro area" },
        { value: "23", label: "Beaches along the coast" },
        { value: "709m", label: "Sugarloaf Mountain height" },
        { value: "30m", label: "Christ the Redeemer height" },
      ],
      fit: {
        forYou: ["Iconic beach time", "Mountain viewpoints", "Vibrant culture", "Relaxed pace", "Exceptional food"],
        notForYou: ["A packed schedule of only museums", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only", "Mountain hiking focus"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Beaches and coast",
          summary: "Copacabana, Ipanema, and beach culture.",
          morning: "Copacabana Beach",
          afternoon: "Ipanema Beach and promenade",
          evening: "Beach area dinner and sunset",
        },
        {
          day: 2,
          title: "Iconic viewpoints",
          summary: "Christ the Redeemer, Sugarloaf, and city views.",
          morning: "Christ the Redeemer",
          afternoon: "Sugarloaf Mountain",
          evening: "Neighborhood dinner or relaxed time",
        },
        {
          day: 3,
          title: "Neighborhoods and culture",
          summary: "Santa Teresa, Lapa, or relaxed time.",
          morning: "Santa Teresa neighborhood",
          afternoon: "Lapa or neighborhood exploration",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Iconic beaches",
          description:
            "Copacabana and Ipanema are world-famous for good reason. Long beach walks, people-watching, and relaxed time by the water are central to Rio's culture.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Copacabana_Beach_Rio.jpg",
            alt: "Copacabana Beach in Rio de Janeiro with golden sand and ocean.",
          },
        },
        {
          title: "Mountain viewpoints",
          description:
            "Christ the Redeemer and Sugarloaf offer spectacular city and ocean views. Early morning visits provide clearer skies and fewer crowds.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sugarloaf_Mountain_Rio.jpg",
            alt: "Sugarloaf Mountain in Rio de Janeiro with cable car and city views.",
          },
        },
        {
          title: "Vibrant culture",
          description:
            "From samba to street art, Rio's culture is vibrant and visible. Neighborhoods like Santa Teresa showcase local life, music, and creative energy.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Santa_Teresa_Rio.jpg",
            alt: "Santa Teresa neighborhood in Rio with colorful street art.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to October for drier, cooler weather" },
        { label: "Airport transfer", value: "Taxi or airport bus to city center" },
        { label: "Transit tips", value: "Use metro and buses; taxis for convenience" },
        { label: "Ticketing", value: "Book Christ the Redeemer and Sugarloaf in advance" },
        { label: "Neighborhood stay", value: "Copacabana, Ipanema, or near the beach" },
      ],
      checklist: [
        "Book Christ the Redeemer tickets in advance",
        "Book Sugarloaf tickets in advance",
        "Pack beach essentials and sunscreen",
        "Save offline maps for Rio",
        "Plan one long beach walk",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Rio?",
          answer:
            "Yes for the core highlights. This plan balances beaches, iconic viewpoints, and neighborhoods with enough breathing room for food discoveries, relaxed time, and unplanned stops.",
        },
        {
          question: "Do I need to book attractions in advance?",
          answer:
            "For Christ the Redeemer and Sugarloaf, yes—book in advance for timed entry, especially in peak season. Beaches don't require booking.",
        },
        {
          question: "Is Rio walkable?",
          answer:
            "Beach areas are walkable, but Rio is spread out and hilly. Use the metro for longer distances, then explore on foot within each area. Taxis are convenient.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Copacabana or Ipanema offer beach access and good transit. These areas are safe, walkable, and central to major sights.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Christ the Redeemer to avoid crowds and get clearer views. Beaches are pleasant throughout the day. Afternoons can include neighborhood walks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins. Beach kiosks and casual spots don't require reservations.",
        },
        {
          question: "What about safety?",
          answer:
            "Rio requires common sense. Stick to tourist areas, avoid isolated spots at night, don't flash valuables, and use official taxis. Beach areas are generally safe during the day.",
        },
      ],
      relatedItineraries: [
        {
          slug: "buenos-aires",
          city: "Buenos Aires",
          days: 3,
          description: "European architecture, tango culture, and vibrant neighborhoods.",
        },
        {
          slug: "mexico-city",
          city: "Mexico City",
          days: 3,
          description: "Historic centers, world-class museums, and exceptional food markets.",
        },
        {
          slug: "sydney",
          city: "Sydney",
          days: 3,
          description: "Harbor views, coastal walks, and relaxed beach time.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "mexico-city": {
      slug: "mexico-city",
      city: "Mexico City",
      country: "Mexico",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Food enthusiasts"],
      style: ["Historic centers", "World-class museums", "Exceptional food markets"],
      pacing: [
        "Mexico City rewards a calm pace across its historic and modern areas. Focus each day on one major area, then leave time for market visits, museum breaks, and spontaneous food discoveries.",
        "Group your time by district. Pair the Zocalo with historic center for culture, dedicate another day to museums and Chapultepec, then explore neighborhoods like Roma or Condesa for local character.",
        "Save unhurried time for long market walks, museum visits, and the relaxed meals that showcase Mexico City's exceptional food culture.",
      ],
      hero: {
        title: "Mexico City in 3 days",
        subtitle:
          "Explore the essentials with room to breathe, with historic centers, world-class museums, and exceptional food markets.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1533251568747-725d423801d3?auto=format&fit=crop&w=1600&q=80",
          alt: "Palacio de Bellas Artes in Mexico City with historic architecture.",
        },
      },
      cityStats: [
        { value: "9.2M", label: "Residents in the city" },
        { value: "150+", label: "Museums across the city" },
        { value: "700+", label: "Years of history" },
        { value: "40,000+", label: "Restaurants across the city" },
      ],
      fit: {
        forYou: ["Historic center exploration", "World-class museums", "Exceptional food markets", "Vibrant neighborhoods", "Cultural immersion"],
        notForYou: ["A packed schedule of only museums", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center",
          summary: "Zocalo, Templo Mayor, and historic culture.",
          morning: "Zocalo and Metropolitan Cathedral",
          afternoon: "Templo Mayor and historic streets",
          evening: "Historic center dinner",
        },
        {
          day: 2,
          title: "Museums and culture",
          summary: "Frida Kahlo Museum, Chapultepec, and art.",
          morning: "Frida Kahlo Museum (book in advance)",
          afternoon: "Chapultepec Park or Anthropology Museum",
          evening: "Roma or Condesa neighborhood dinner",
        },
        {
          day: 3,
          title: "Markets and neighborhoods",
          summary: "Xochimilco, markets, or relaxed time.",
          morning: "Xochimilco or market visit",
          afternoon: "Neighborhood exploration",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic center",
          description:
            "The Zocalo is one of the world's largest public squares, surrounded by historic buildings. The area showcases Mexico's colonial and pre-Columbian history.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Metropolitan_Cathedral_Mexico_City.jpg",
            alt: "Metropolitan Cathedral in Mexico City with grand architecture.",
          },
        },
        {
          title: "World-class museums",
          description:
            "The Frida Kahlo Museum and National Anthropology Museum are world-class. Plan one focused visit, then balance it with neighborhood walks and food.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Frida_Kahlo_Museum_Mexico_City.jpg",
            alt: "Frida Kahlo Museum (Casa Azul) in Mexico City with blue walls.",
          },
        },
        {
          title: "Exceptional food markets",
          description:
            "From Mercado de San Juan to street food, Mexico City's food scene is exceptional. Long market walks and local discoveries showcase the city's culinary culture.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercado_Mexico_City.jpg",
            alt: "Food market in Mexico City with colorful produce and vendors.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "October to April for drier weather" },
        { label: "Airport transfer", value: "Metro or taxi to city center" },
        { label: "Transit tips", value: "Use Metro and buses; Uber is convenient" },
        { label: "Ticketing", value: "Book Frida Kahlo Museum well in advance" },
        { label: "Neighborhood stay", value: "Roma, Condesa, or historic center" },
      ],
      checklist: [
        "Book Frida Kahlo Museum well in advance",
        "Pack comfortable walking shoes",
        "Save offline maps for Mexico City",
        "Plan one market visit",
        "Try street food and local specialties",
        "Carry cash for markets",
      ],
      faqs: [
        {
          question: "Is 3 days enough for Mexico City?",
          answer:
            "Yes for the core highlights. This plan balances historic center, museums, and neighborhoods with enough breathing room for market visits, food discoveries, and unplanned stops.",
        },
        {
          question: "Do I need to book Frida Kahlo Museum?",
          answer:
            "Yes, absolutely. Book well in advance as tickets sell out weeks ahead. The museum is small and popular, so advance planning is essential.",
        },
        {
          question: "Is Mexico City walkable?",
          answer:
            "Neighborhoods are walkable, but Mexico City is vast. Use the Metro for longer distances, then explore on foot within each area. Uber is convenient and safe.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Roma or Condesa offer local character, good food scenes, and safety. The historic center provides proximity to major sights but can be noisier.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for museums to avoid crowds. Markets are best in the morning. Afternoons can include neighborhood walks or indoor stops.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins. Street food and markets don't require reservations.",
        },
        {
          question: "What about the food?",
          answer:
            "Mexico City's food is exceptional. Don't miss street food (tacos, elotes), markets, and traditional restaurants. The city is a food destination.",
        },
      ],
      relatedItineraries: [
        {
          slug: "buenos-aires",
          city: "Buenos Aires",
          days: 3,
          description: "European architecture, tango culture, and vibrant neighborhoods.",
        },
        {
          slug: "rio-de-janeiro",
          city: "Rio de Janeiro",
          days: 3,
          description: "Iconic beaches, mountain viewpoints, and vibrant culture.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Grand museums, historic plazas, and vibrant food markets.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bucharest: {
      slug: "bucharest",
      city: "Bucharest",
      country: "Romania",
      days: 2,
      pace: "Balanced",
      idealFor: ["First-timers", "Architecture lovers", "History seekers"],
      style: ["Grand architecture", "Historic neighborhoods", "Relaxed parks"],
      pacing: [
        "Bucharest rewards a calm pace across its mix of grand and historic architecture. Focus each day on one major area, then leave time for park visits, spontaneous food discoveries, and relaxed neighborhood walks.",
        "Group your time by district. Pair the Palace of Parliament with the historic center for contrast, dedicate time to Herastrau Park and neighborhoods, then explore local character.",
        "Save unhurried time for long park walks, neighborhood exploration, and the relaxed meals that showcase Bucharest's food culture.",
      ],
      hero: {
        title: "Bucharest in 2 days",
        subtitle:
          "Explore the essentials with room to breathe, pairing grand architecture, historic neighborhoods, and relaxed parks.",
        eyebrow: "Travel guide",
        image: {
          src: "https://images.unsplash.com/photo-1665200658303-ca61225bbaff?auto=format&fit=crop&w=1600&q=80",
          alt: "Palace of Parliament in Bucharest with grand neoclassical architecture.",
        },
      },
      cityStats: [
        { value: "1.8M", label: "Residents in the city" },
        { value: "365K", label: "Square meters of Palace of Parliament" },
        { value: "40+", label: "Parks and gardens" },
        { value: "600+", label: "Years of history" },
      ],
      fit: {
        forYou: ["Grand architecture", "Historic neighborhoods", "Relaxed parks", "Affordable travel", "Cultural immersion"],
        notForYou: ["A packed schedule of only museums", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Grand architecture",
          summary: "Palace of Parliament, historic center, and contrast.",
          morning: "Palace of Parliament tour",
          afternoon: "Historic Old Town and Lipscani",
          evening: "Old Town dinner and walk",
        },
        {
          day: 2,
          title: "Parks and neighborhoods",
          summary: "Herastrau Park, neighborhoods, or relaxed time.",
          morning: "Herastrau Park and Village Museum",
          afternoon: "Neighborhood exploration or museums",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Grand architecture",
          description:
            "The Palace of Parliament is one of the world's largest buildings, showcasing communist-era scale. The historic Old Town offers contrast with charming streets and cafes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Old_Town_Bucharest.jpg",
            alt: "Historic Old Town in Bucharest with cobblestone streets.",
          },
        },
        {
          title: "Historic neighborhoods",
          description:
            "The Old Town (Lipscani) preserves historic character with cobblestone streets, cafes, and a relaxed atmosphere that feels both European and unique.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lipscani_Bucharest.jpg",
            alt: "Lipscani street in Bucharest Old Town with historic buildings.",
          },
        },
        {
          title: "Relaxed parks",
          description:
            "Herastrau Park offers green space and the Village Museum, showcasing traditional Romanian architecture in a peaceful setting.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Herastrau_Park_Bucharest.jpg",
            alt: "Herastrau Park in Bucharest with lake and green space.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Bus or taxi to city center" },
        { label: "Transit tips", value: "Use metro and buses; walk the center" },
        { label: "Ticketing", value: "Book Palace of Parliament tour in advance" },
        { label: "Neighborhood stay", value: "Old Town or city center" },
      ],
      checklist: [
        "Book Palace of Parliament tour in advance",
        "Pack comfortable walking shoes",
        "Save offline maps for Bucharest",
        "Plan one park visit",
        "Explore Old Town on foot",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Bucharest?",
          answer:
            "Yes for the core highlights. This plan balances grand architecture, historic neighborhoods, and parks with enough breathing room for food discoveries and unplanned stops.",
        },
        {
          question: "Do I need to book Palace of Parliament?",
          answer:
            "Yes, book tours in advance as they're required to enter. The building is massive and the tour provides context for its history and scale.",
        },
        {
          question: "Is Bucharest walkable?",
          answer:
            "The Old Town and city center are very walkable. Use the metro for longer distances, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The Old Town offers historic character and easy access to restaurants and cafes. The city center provides good transit connections.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for Palace of Parliament to avoid crowds. The Old Town is pleasant throughout the day. Afternoons can include park walks.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins. The Old Town has many options for casual dining.",
        },
        {
          question: "What about the food?",
          answer:
            "Bucharest offers Romanian cuisine with influences from neighboring countries. Try traditional dishes like sarmale (cabbage rolls) and local wines.",
        },
      ],
      relatedItineraries: [
        {
          slug: "sofia",
          city: "Sofia",
          days: 2,
          description: "Historic churches, mountain views, and walkable city center.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube views, historic hills, and thermal baths.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old Town, castle views, and easy river strolls.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    sofia: {
      slug: "sofia",
      city: "Sofia",
      country: "Bulgaria",
      days: 2,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Mountain enthusiasts"],
      style: ["Historic churches", "Mountain views", "Walkable city center"],
      pacing: [
        "Sofia rewards a calm pace across its compact center. Focus each day on one major area, then leave time for church visits, spontaneous food discoveries, and relaxed neighborhood walks.",
        "Group your time by area. Pair the historic churches with the city center for culture, dedicate time to Vitosha Mountain access or parks, then explore local character.",
        "Save unhurried time for long walks, church visits, and the relaxed meals that showcase Sofia's food culture.",
      ],
      hero: {
        title: "Sofia in 2 days",
        subtitle:
          "Explore the essentials with room to breathe, featuring historic churches, mountain views, and walkable city center.",
        eyebrow: "Travel guide",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Alexander_Nevsky_Cathedral_Sofia.jpg",
          alt: "Alexander Nevsky Cathedral in Sofia with golden domes.",
        },
      },
      cityStats: [
        { value: "1.2M", label: "Residents in the city" },
        { value: "2,290m", label: "Vitosha Mountain height" },
        { value: "50+", label: "Churches across the city" },
        { value: "7,000+", label: "Years of history" },
      ],
      fit: {
        forYou: ["Historic church visits", "Mountain access", "Walkable center", "Affordable travel", "Cultural immersion"],
        notForYou: ["A packed schedule of only museums", "Beach-focused time", "Late-night party focus", "Budget backpacker style", "Off-the-beaten-path only"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Historic center",
          summary: "Alexander Nevsky Cathedral, churches, and culture.",
          morning: "Alexander Nevsky Cathedral",
          afternoon: "St. Sofia Church and city center walk",
          evening: "City center dinner and walk",
        },
        {
          day: 2,
          title: "Culture and nature",
          summary: "Serdika Complex, Vitosha, or relaxed time.",
          morning: "Serdika Complex and Roman ruins",
          afternoon: "Vitosha Mountain or park visit",
          evening: "Traditional dinner or relaxed time",
        },
      ],
      imageInfoCards: [
        {
          title: "Historic churches",
          description:
            "Alexander Nevsky Cathedral is Sofia's signature, with golden domes and grand scale. The city has many historic churches showcasing Orthodox architecture.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/St_Sofia_Church_Sofia.jpg",
            alt: "St. Sofia Church in Sofia with historic architecture.",
          },
        },
        {
          title: "Mountain views",
          description:
            "Vitosha Mountain provides a natural backdrop and easy access from the city. Cable car rides or hikes offer city views and a contrast to urban energy.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vitosha_Mountain_Sofia.jpg",
            alt: "Vitosha Mountain near Sofia with city in background.",
          },
        },
        {
          title: "Walkable center",
          description:
            "Sofia's center is compact and pedestrian-friendly. Slow walks reveal Roman ruins, historic buildings, and a relaxed pace that feels both European and unique.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Serdika_Complex_Sofia.jpg",
            alt: "Serdika Complex in Sofia with Roman ruins and modern buildings.",
          },
        },
      ],
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Metro or taxi to city center" },
        { label: "Transit tips", value: "Use metro and trams; walk the center" },
        { label: "Ticketing", value: "Most sights don't require advance booking" },
        { label: "Neighborhood stay", value: "City center or near Vitosha" },
      ],
      checklist: [
        "Pack comfortable walking shoes",
        "Save offline maps for Sofia",
        "Plan one church visit",
        "Consider Vitosha Mountain if interested",
        "Explore city center on foot",
        "Carry cash for some establishments",
      ],
      faqs: [
        {
          question: "Is 2 days enough for Sofia?",
          answer:
            "Yes for the core highlights. This plan balances historic churches, city center, and optional mountain time with enough breathing room for food discoveries and unplanned stops.",
        },
        {
          question: "Do I need to book attractions?",
          answer:
            "Most churches and sights don't require advance booking. Buy tickets on-site. Vitosha Mountain access is straightforward without advance booking.",
        },
        {
          question: "Is Sofia walkable?",
          answer:
            "The city center is very walkable and compact. Use the metro for longer distances, then explore on foot within each area.",
        },
        {
          question: "Where should I stay?",
          answer:
            "The city center offers proximity to major sights, restaurants, and cafes. Areas near Vitosha provide mountain access and quieter streets.",
        },
        {
          question: "What time should I start each day?",
          answer:
            "Start early for churches to avoid crowds. The city center is pleasant throughout the day. Afternoons can include park walks or mountain visits.",
        },
        {
          question: "Do I need to book restaurants in advance?",
          answer:
            "For popular restaurants, yes—especially on weekends. Many places accept walk-ins. The city center has many options for casual dining.",
        },
        {
          question: "What about the food?",
          answer:
            "Sofia offers Bulgarian cuisine with influences from neighboring countries. Try traditional dishes like banitsa (cheese pastry) and local wines.",
        },
      ],
      relatedItineraries: [
        {
          slug: "bucharest",
          city: "Bucharest",
          days: 2,
          description: "Grand architecture, historic neighborhoods, and relaxed parks.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Danube views, historic hills, and thermal baths.",
        },
        {
          slug: "prague",
          city: "Prague",
          days: 3,
          description: "Old Town, castle views, and easy river strolls.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
  }),
  es: withDefaults("es", {
    rome: {
      slug: "rome",
      city: "Roma",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Viajeros de buena comida"],
      style: ["Lugares clásicos", "Barrios caminables", "Pausas en café"],
      pacing: [
        "Roma recompensa un ritmo calmado. Trata cada día como un capítulo: un gran icono y luego tiempo para comidas largas, plazas improvisadas y paseos lentos entre monumentos.",
        "Agrupa el tiempo por barrios para moverte menos. Combina el Centro Storico con Monti para los clásicos y el aperitivo, y dedica otro día al Vaticano y Prati para museos y paseos junto al río.",
        "Reserva una tarde sin prisas para Trastevere o Testaccio, donde lo mejor son las calles pequeñas, panaderías locales y una cena tranquila que se alarga hasta el atardecer.",
      ],
      hero: {
        title: "Roma en 3 días",
        subtitle:
          "Recorre lo esencial con tiempo para respirar, centrado en íconos antiguos, plazas y comidas fáciles.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&w=1600&q=80",
          alt: "Luz dorada sobre los tejados y cúpulas de Roma al atardecer.",
        },
      },
      cityStats: [
        { value: "2.700+", label: "Años de historia registrada" },
        { value: "900+", label: "Iglesias y basílicas" },
        { value: "280", label: "Fuentes públicas" },
        { value: "10M+", label: "Visitantes al año" },
      ],
      fit: {
        forYou: ["Un primer viaje con íconos", "Mezcla de historia y café", "Rutas a pie sin prisa", "Ritmo flexible con tiempo libre", "Oportunidades de fotos clásicas"],
        notForYou: ["Solo museos todo el día", "Excursiones fuera de la ciudad", "Plan de vida nocturna", "Tours de arte muy detallados", "Estilo mochilero económico"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Roma antigua",
          summary: "Coliseo, Foro y miradores al atardecer.",
          morning: "Coliseo y Foro Romano",
          afternoon: "Colina Capitolina y Piazza Venezia",
          evening: "Cena en Monti y paseo al Coliseo",
        },
        {
          day: 2,
          title: "Vaticano y paseo al río",
          summary: "Museos, San Pedro y el Tíber.",
          morning: "Museos Vaticanos y Capilla Sixtina",
          afternoon: "Basílica de San Pedro y Castel Sant'Angelo",
          evening: "Aperitivo en Trastevere y paseo",
        },
        {
          day: 3,
          title: "Plazas y comida",
          summary: "Fuentes, mercados y gelato clásico.",
          morning: "Fontana di Trevi, Plaza de España, tiendas",
          afternoon: "Piazza Navona y Campo de' Fiori",
          evening: "Ruta de gelato y atardecer en Pincio",
        },
      ],
      imageInfoCards: [
        {
          title: "Las grandes plazas",
          description:
            "Las plazas de Roma son salas de estar al aire libre. Espera fuentes, espresso matutino y conversaciones constantes.",
          image: {
            src: "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=1200&q=80",
            alt: "Gente reunida junto a una fuente en una gran plaza de Roma.",
          },
        },
        {
          title: "Capas de historia antigua",
          description:
            "Las calles mezclan siglos en pocos pasos. En una caminata pasas del foro imperial a iglesias barrocas.",
          image: {
            src: "https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista del Foro Romano con ruinas y columnas.",
          },
        },
        {
          title: "Barrios para comer bien",
          description:
            "Trastevere y Monti marcan el ritmo de almuerzos largos, aperitivos y noches sin prisa.",
          image: {
            src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=1200&q=80",
            alt: "Cena al aire libre con pasta y vino en una calle de Roma.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Tren a Termini o taxi tarifa fija" },
        { label: "Transporte", value: "Camina el centro; Metro para Vaticano" },
        { label: "Entradas", value: "Reserva Coliseo y Vaticano con antelación" },
        { label: "Zona para alojarte", value: "Centro Storico o Monti" },
      ],
      checklist: [
        "Reserva entrada al Coliseo",
        "Reserva Museos Vaticanos",
        "Calzado cómodo para caminar",
        "Mapas offline de Roma",
        "Pausa lenta de café cada día",
        "Botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Roma?",
          answer:
            "Sí para los puntos clave. Este plan prioriza lo esencial con ritmo relajado y traslados cortos.",
        },
        {
          question: "¿Conviene comprar entradas sin cola?",
          answer:
            "Sí. Reservar Coliseo y Vaticano ahorra horas y hace el plan más fiable.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "Muchas zonas son caminables. Un pase de 24 o 48 horas ayuda para el Vaticano y trayectos largos.",
        },
        {
          question: "¿Roma es caminable?",
          answer:
            "Sí. El centro histórico es compacto y puedes hacer la mayoría a pie con pocos trayectos en Metro.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Centro Storico te deja en el centro. Monti es más local y cerca del Coliseo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos, museos y barrios con café.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos fáciles.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    madrid: {
      slug: "madrid",
      city: "Madrid",
      country: "España",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de museos", "Viajeros a pie"],
      style: ["Paseos por el centro", "Parques tranquilos", "Museos clave"],
      hero: {
        title: "Madrid en 2 días",
        subtitle:
          "Recorre lo esencial con traslados cortos, combinando museos, plazas y parques.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1600&q=80",
          alt: "Vista amplia de Madrid con edificios históricos y cielo claro.",
        },
      },
      cityStats: [
        { value: "3.4M", label: "Habitantes en la ciudad" },
        { value: "21", label: "Distritos para recorrer" },
        { value: "60+", label: "Museos y galerías" },
        { value: "300", label: "Días de sol al año" },
      ],
      fit: {
        forYou: ["Un plan claro y caminable", "Museos y parques en equilibrio", "Ritmo realista", "Lo mejor de los museos del mundo", "Paseos por barrios encantadores"],
        notForYou: ["Excursiones fuera de la ciudad", "Plan muy cargado", "Vida nocturna como prioridad", "Tours extensos de vinos", "Actividades de aventura o senderismo"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro clásico y museos",
          summary: "Puerta del Sol, Prado y paseo por el parque.",
          morning: "Puerta del Sol, Plaza Mayor y calles cercanas",
          afternoon: "Museo del Prado y Paseo del Prado",
          evening: "Parque del Retiro y lagos al atardecer",
        },
        {
          day: 2,
          title: "Palacio y barrios",
          summary: "Palacio Real y barrios caminables.",
          morning: "Palacio Real y Catedral de la Almudena",
          afternoon: "Plaza de España y Templo de Debod",
          evening: "Barrio de las Letras y paseo tranquilo",
        },
      ],
      imageInfoCards: [
        {
          title: "Paseos por el eje central",
          description:
            "El centro histórico se recorre bien a pie. Las plazas se enlazan con calles cortas y claras.",
          image: {
            src: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=1200&q=80",
            alt: "Plaza amplia en Madrid con arquitectura clásica.",
          },
        },
        {
          title: "Ritmo de museo",
          description:
            "Un museo principal al día es suficiente. Deja la tarde libre para parques y barrios.",
          image: {
            src: "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80",
            alt: "Entrada de un museo en Madrid.",
          },
        },
        {
          title: "Parques como pausa",
          description:
            "El Retiro y sus alrededores sirven para resetear el ritmo sin salir del centro.",
          image: {
            src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
            alt: "Sendero arbolado en un parque de Madrid.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Marzo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro, bus o taxi" },
        { label: "Transporte", value: "Centro caminable; Metro para trayectos largos" },
        { label: "Entradas", value: "Reserva Prado y Palacio si quieres horarios fijos" },
        { label: "Zona para alojarte", value: "Centro, Letras o Malasaña" },
      ],
      checklist: [
        "Reserva entrada al Prado si vas",
        "Calzado cómodo para caminar",
        "Botella de agua reutilizable",
        "Mapa offline del Metro",
        "Pausa lenta de café cada día",
        "Lleva protector solar en verano",
      ],
      faqs: [
        {
          question: "¿Alcanzan 2 días para Madrid?",
          answer:
            "Sí para los puntos clave. Este plan prioriza el centro y mantiene un ritmo tranquilo.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "El centro se puede recorrer a pie, pero el Metro ayuda si quieres ahorrar tiempo.",
        },
        {
          question: "¿Conviene reservar el Prado?",
          answer:
            "Sí. Reservar con antelación te da un horario claro y evita filas.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Centro y Barrio de las Letras son prácticos; Malasaña ofrece un ambiente más local.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos fáciles.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí, barrios caminables y playa.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    paris: {
      slug: "paris",
      city: "París",
      country: "Francia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de museos", "Caminantes tranquilos"],
      style: ["Monumentos clásicos", "Paseos por el río", "Cafés de barrio"],
      hero: {
        title: "París en 3 días",
        subtitle:
          "Verás lo esencial con paseos cortos entre puntos clave, combinando museos con tiempo relajado en barrios.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
          alt: "La Torre Eiffel al fondo sobre los tejados de París.",
        },
      },
      cityStats: [
        { value: "37", label: "Puentes sobre el Sena" },
        { value: "20", label: "Distritos de la ciudad" },
        { value: "130+", label: "Museos y galerías" },
        { value: "30M+", label: "Visitantes al año" },
      ],
      fit: {
        forYou: [
          "Un plan claro con margen para respirar",
          "Mezcla de arte y paseos por la ciudad",
          "Traslados sencillos en Metro",
          "Museos de primer nivel",
          "Paseos por barrios con encanto",
        ],
        notForYou: [
          "Excursiones fuera de la ciudad",
          "Un itinerario lleno solo de museos",
          "Vida nocturna como prioridad",
          "Tours extensos de cata de vinos",
          "Aventura o actividades de senderismo",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y el Sena",
          summary: "Zona del Louvre, jardines y paseo por el río.",
          morning: "Exterior del Louvre y Jardines de Tullerías",
          afternoon: "Paseo por el Sena hasta el Puente Nuevo y la Île de la Cité",
          evening: "Paseo por la orilla izquierda y parada sencilla en un café",
        },
        {
          day: 2,
          title: "Eiffel y grandes avenidas",
          summary: "Zona de la Torre Eiffel y calles clásicas de París.",
          morning: "Torre Eiffel y Campo de Marte",
          afternoon: "Los Inválidos y un paseo hacia el Sena",
          evening: "Arco del Triunfo al atardecer",
        },
        {
          day: 3,
          title: "Montmartre y Le Marais",
          summary: "Vistas en lo alto y tiempo tranquilo en barrios.",
          morning: "Montmartre y Sacré-Coeur",
          afternoon: "Calles de Le Marais y Place des Vosges",
          evening: "Canal Saint-Martin o un paseo corto por el Sena",
        },
      ],
      imageInfoCards: [
        {
          title: "Ritmo junto al río",
          description:
            "El Sena une los barrios. Espera paseos suaves, puentes frecuentes y un ritmo constante sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Camino tranquilo junto al Sena con puentes de piedra a lo lejos.",
          },
        },
        {
          title: "Mañanas de museo",
          description:
            "París recompensa empezar temprano. Una visita de museo enfocada por la mañana deja el resto del día libre y flexible.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Panorama de París con la Torre Eiffel sobre la ciudad.",
          },
        },
        {
          title: "Cafés de barrio",
          description:
            "Plazas pequeñas y terrazas de café marcan el ritmo. Mejor una pausa larga que ir corriendo entre paradas.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Mesas de café al aire libre en una calle de París.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "RER B o taxi tarifa fija" },
        { label: "Transporte", value: "Centro caminable; Metro para distancias largas" },
        { label: "Entradas", value: "Reserva Torre Eiffel y Louvre si vas" },
        { label: "Zona para alojarte", value: "Le Marais o Saint-Germain" },
      ],
      checklist: [
        "Reserva horario de entrada a la Torre Eiffel",
        "Reserva una franja del Louvre si vas",
        "Lleva una capa ligera para la tarde",
        "Mapa offline del Metro",
        "Planifica una pausa de café lenta cada día",
        "Lleva una botella reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para París?",
          answer:
            "Sí para lo esencial. Este plan prioriza zonas caminables y traslados sencillos en Metro.",
        },
        {
          question: "¿Necesito reservar museos?",
          answer:
            "Para el Louvre o exposiciones populares, sí. Ahorra tiempo y mantiene el día calmado.",
        },
        {
          question: "¿Conviene un pase de transporte?",
          answer:
            "Un carnet o pase diario funciona bien si usarás el Metro varias veces al día.",
        },
        {
          question: "¿Qué zona es mejor para alojarse?",
          answer:
            "Le Marais y Saint-Germain son céntricos, caminables y fáciles para llegar a los principales puntos.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos fáciles.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos fáciles.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    london: {
      slug: "london",
      city: "Londres",
      country: "Reino Unido",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de museos", "Viajeros a pie"],
      style: ["Íconos clásicos", "Paseos junto al río", "Tiempo de barrio"],
      hero: {
        title: "Londres en 3 días",
        subtitle:
          "Recorre lo esencial con paseos cortos y transporte fácil, combinando monumentos con barrios relajados.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline de Londres con el Támesis y el Tower Bridge.",
        },
      },
      cityStats: [
        { value: "32", label: "Distritos en la ciudad" },
        { value: "35+", label: "Puentes sobre el Támesis" },
        { value: "170+", label: "Museos y galerías" },
        { value: "9M", label: "Habitantes en el Gran Londres" },
      ],
      fit: {
        forYou: [
          "Plan claro con traslados cortos",
          "Mezcla de museos y monumentos",
          "Rutas caminables junto al río",
          "Atracciones reales históricas",
          "Muestra de la escena gastronómica diversa",
        ],
        notForYou: [
          "Excursiones fuera de Londres",
          "Agenda llena de espectáculos",
          "Vida nocturna como prioridad",
          "Escapadas al campo",
          "Mochilero de bajo presupuesto",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Westminster y el Támesis",
          summary: "Vistas del Parlamento y paseo tranquilo junto al río.",
          morning: "Zona de Westminster y Big Ben",
          afternoon: "St. James's Park hasta Buckingham Palace",
          evening: "Paseo por South Bank y vistas de la ciudad",
        },
        {
          day: 2,
          title: "Monumentos del centro y mercados",
          summary: "Calles históricas con paseos cortos y llanos.",
          morning: "Exterior de St. Paul's Cathedral y Millennium Bridge",
          afternoon: "Zona de la Torre de Londres y Tower Bridge",
          evening: "Paseo por Borough Market y el Támesis",
        },
        {
          day: 3,
          title: "Museos y barrios clásicos",
          summary: "Visita de museo y calles de compras fáciles.",
          morning: "British Museum",
          afternoon: "Plazas de Bloomsbury y Covent Garden",
          evening: "Paseo por Soho y Piccadilly Circus",
        },
      ],
      imageInfoCards: [
        {
          title: "Rutas junto al río",
          description:
            "El Támesis facilita orientarse. Un paseo junto al río conecta sitios clave sin tantos cambios de metro.",
          image: {
            src: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=1200&q=80",
            alt: "Personas caminando por South Bank junto al Támesis.",
          },
        },
        {
          title: "Equilibrio de museos",
          description:
            "Los museos de Londres son muchos y gratuitos. Mantén las visitas enfocadas para dejar tardes flexibles.",
          image: {
            src: "https://images.unsplash.com/photo-1473959383414-b0b2d6b04504?auto=format&fit=crop&w=1200&q=80",
            alt: "Sala de museo tranquila con ventanales altos.",
          },
        },
        {
          title: "Pausas de barrio",
          description:
            "Paseos cortos por plazas y parques equilibran los días de monumentos y mantienen el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80",
            alt: "Camino en un parque de Londres con árboles.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Tren o metro según el aeropuerto" },
        { label: "Transporte", value: "Contactless u Oyster; camina rutas centrales" },
        { label: "Entradas", value: "Reserva la Torre de Londres si vas" },
        { label: "Zona para alojarte", value: "Covent Garden o South Bank" },
      ],
      checklist: [
        "Lleva una capa ligera para la lluvia",
        "Guarda un mapa offline del metro",
        "Reserva entrada a la Torre de Londres si vas",
        "Planifica una pausa diaria en parque o río",
        "Calzado cómodo para caminar",
        "Ten una tarjeta de transporte a mano",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Londres?",
          answer:
            "Sí para lo esencial. Este plan mantiene traslados cortos y equilibra monumentos con paseos.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "El pago contactless o una Oyster es lo más fácil para buses y metro.",
        },
        {
          question: "¿Los museos son gratuitos?",
          answer:
            "Muchos museos principales son gratuitos, aunque algunas exposiciones requieren entrada.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Covent Garden y South Bank son céntricos, caminables y bien conectados.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos, museos y paseos junto al río.",
        },
        {
          slug: "edinburgh",
          city: "Edimburgo",
          days: 3,
          description: "Castillo, colinas y paseos con vistas.",
        },
        {
          slug: "dublin",
          city: "Dublín",
          days: 3,
          description: "Literatura, pubs tranquilos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    barcelona: {
      slug: "barcelona",
      city: "Barcelona",
      country: "España",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de arquitectura", "Primer viaje", "Paseos con mar"],
      style: ["Gaudí esencial", "Barrios caminables", "Tiempo al aire libre"],
      hero: {
        title: "Barcelona en 3 días",
        subtitle:
          "Combina íconos de Gaudí con paseos por barrios y un ritmo relajado junto al mar.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBzYWdyYWRhJTIwZmFtaWxpYXxlbnwxfHx8fDE3NjQwNTU2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
          alt: "Tejados y mosaicos de Park Guell en Barcelona.",
        },
      },
      cityStats: [
        { value: "10", label: "Distritos en la ciudad" },
        { value: "4,5 km", label: "Litoral urbano de playa" },
        { value: "1,6M", label: "Habitantes en la ciudad" },
        { value: "2.000+", label: "Años de historia" },
      ],
      fit: {
        forYou: ["Arquitectura y paseos fáciles", "Plan claro por días", "Tiempo de playa sin prisa", "Obras maestras de Gaudí de cerca", "Ambiente mediterráneo y playas"],
        notForYou: ["Solo museos todo el día", "Vida nocturna como prioridad", "Excursiones fuera de la ciudad", "Excursiones de montaña", "Escena de discotecas intensas"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y mar",
          summary: "Barrio Gótico, parque y paseo costero.",
          morning: "Barrio Gótico y Catedral de Barcelona",
          afternoon: "El Born y Parc de la Ciutadella",
          evening: "Paseo por la Barceloneta",
        },
        {
          day: 2,
          title: "Gaudí y Eixample",
          summary: "Sagrada Familia y modernismo en calles amplias.",
          morning: "Sagrada Familia",
          afternoon: "Passeig de Gràcia y fachadas modernistas",
          evening: "Paseo por Gracia",
        },
        {
          day: 3,
          title: "Parques y miradores",
          summary: "Vistas de la ciudad y tiempo tranquilo.",
          morning: "Park Güell temprano",
          afternoon: "Jardines de Montjuïc y miradores",
          evening: "Plaça d'Espanya y paseo corto",
        },
      ],
      imageInfoCards: [
        {
          title: "Modernismo a pie",
          description:
            "El Eixample es llano y amplio. Las fachadas se disfrutan mejor en caminatas lentas.",
          image: {
            src: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=1200&q=80",
            alt: "Fachadas modernistas en una avenida de Barcelona.",
          },
        },
        {
          title: "Calles del casco antiguo",
          description:
            "Gótico y El Born concentran historia en pocas manzanas. Son recorridos cortos y sombreados.",
          image: {
            src: "https://images.unsplash.com/photo-1464790719320-516ecd75af6c?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle estrecha del casco antiguo de Barcelona.",
          },
        },
        {
          title: "Pausa junto al mar",
          description:
            "El paseo marítimo ayuda a bajar el ritmo. Ideal para una caminata al final del día.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Paseo marítimo de Barcelona con el mar al atardecer.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Aerobus o tren a Passeig de Gràcia" },
        { label: "Transporte", value: "Centro caminable; Metro para trayectos largos" },
        { label: "Entradas", value: "Reserva Sagrada Familia y Park Güell" },
        { label: "Zona para alojarte", value: "Eixample o El Born" },
      ],
      checklist: [
        "Reserva Sagrada Familia",
        "Compra entrada a Park Güell",
        "Protección solar y agua",
        "Mapa offline de la ciudad",
        "Pausa lenta de café cada día",
        "Calzado cómodo para caminar",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Barcelona?",
          answer:
            "Sí para lo esencial. El plan combina íconos y paseos con ritmo tranquilo.",
        },
        {
          question: "¿Debo reservar entradas de Gaudí?",
          answer:
            "Sí. Sagrada Familia y Park Güell se agotan y es mejor asegurar horarios.",
        },
        {
          question: "¿Se puede caminar todo?",
          answer:
            "El centro es caminable, y el Metro ayuda para Montjuïc o distancias largas.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Eixample es central y práctico; El Born es animado y cerca del casco antiguo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos fáciles.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
        {
          slug: "lisbon",
          city: "Lisboa",
          days: 3,
          description: "Barrios en colinas y paseos junto al agua.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    lisbon: {
      slug: "lisbon",
      city: "Lisboa",
      country: "Portugal",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Viajeros tranquilos", "Amantes de miradores", "Primer viaje"],
      style: ["Paseos con vistas", "Barrios tradicionales", "Ritmo pausado"],
      hero: {
        title: "Lisboa en 3 días",
        subtitle:
          "Un plan sereno por barrios históricos, miradores y paseos junto al Tajo.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
          alt: "Vista de Lisboa con el río y tejados al atardecer.",
        },
      },
      cityStats: [
        { value: "7", label: "Colinas en la ciudad" },
        { value: "20+", label: "Miradores con vistas" },
        { value: "550k", label: "Habitantes en el centro urbano" },
        { value: "2.000+", label: "Años de historia" },
      ],
      fit: {
        forYou: ["Caminatas con vistas y descansos", "Barrios con ambiente local", "Ritmo realista", "Cultura de cafés junto al canal", "Exploración amigable en bici"],
        notForYou: ["Plan muy cargado", "Excursiones fuera de la ciudad", "Vida nocturna como prioridad", "Actividades de playa o costa", "Enfoque en compras de lujo"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Baixa y Alfama",
          summary: "Centro histórico y miradores clásicos.",
          morning: "Baixa y Plaza del Comercio",
          afternoon: "Alfama y Castillo de San Jorge exterior",
          evening: "Mirador al atardecer y paseo corto",
        },
        {
          day: 2,
          title: "Belém tranquilo",
          summary: "Paseo junto al río y monumentos clave.",
          morning: "Torre de Belém y paseo por el río",
          afternoon: "Monasterio de los Jerónimos y jardines",
          evening: "Regreso lento por la ribera",
        },
        {
          day: 3,
          title: "Barrios y miradores",
          summary: "Calles con tranvía y vistas amplias.",
          morning: "Chiado y Bairro Alto",
          afternoon: "Mirador de São Pedro de Alcántara",
          evening: "Cais do Sodré y paseo junto al agua",
        },
      ],
      imageInfoCards: [
        {
          title: "Vistas y cuestas",
          description:
            "Lisboa se disfruta mejor en tramos cortos. Las cuestas son frecuentes, pero las vistas compensan.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Mirador sobre los tejados de Lisboa y el Tajo.",
          },
        },
        {
          title: "Ribera del Tajo",
          description:
            "El paseo junto al río es llano y aireado. Es un buen cierre de día tras barrios con pendientes.",
          image: {
            src: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=1200&q=80",
            alt: "Tranvía clásico de Lisboa junto al río.",
          },
        },
        {
          title: "Barrios con ritmo lento",
          description:
            "Alfama y Chiado se exploran sin prisas. Callejones y plazas pequeñas invitan a parar.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle empedrada en un barrio tradicional de Lisboa.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Marzo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi" },
        { label: "Transporte", value: "Tranvía y Metro; muchas calles con cuestas" },
        { label: "Entradas", value: "Reserva Jerónimos si quieres entrar" },
        { label: "Zona para alojarte", value: "Baixa, Chiado o Alfama" },
      ],
      checklist: [
        "Calzado cómodo para cuestas",
        "Reserva Jerónimos si vas",
        "Lleva una chaqueta ligera",
        "Mapa offline de la ciudad",
        "Pausa lenta de café cada día",
        "Protección solar en verano",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Lisboa?",
          answer:
            "Sí para los puntos clave. El plan mantiene recorridos cortos y con descansos.",
        },
        {
          question: "¿Necesito usar tranvía?",
          answer:
            "No es obligatorio, pero ayuda en las cuestas y para recorrer barrios distantes.",
        },
        {
          question: "¿Conviene reservar Jerónimos?",
          answer:
            "Si quieres entrar, es recomendable reservar para evitar esperas largas.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Baixa es central; Chiado es cómodo y Alfama es más tradicional.",
        },
      ],
      relatedItineraries: [
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos fáciles.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    prague: {
      slug: "prague",
      city: "Praga",
      country: "República Checa",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de arquitectura", "Viajeros tranquilos"],
      style: ["Centro histórico compacto", "Puentes y río", "Paseos cortos"],
      hero: {
        title: "Praga en 3 días",
        subtitle:
          "Un plan sereno por el casco antiguo, el castillo y paseos junto al Moldava.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1748633212968-7bf42d82ec79?auto=format&fit=crop&w=1600&q=80",
          alt: "El Castillo de Praga sobre el río y los tejados.",
        },
      },
      cityStats: [
        { value: "1.100+", label: "Años de historia registrada" },
        { value: "18", label: "Puentes sobre el Moldava" },
        { value: "100+", label: "Torres y agujas" },
        { value: "1,3M", label: "Habitantes en la ciudad" },
      ],
      fit: {
        forYou: [
          "Arquitectura histórica con paseos cortos",
          "Un centro compacto que se recorre sin prisa",
          "Caminatas junto al río entre puntos clave",
          "Ritmo equilibrado con pausas diarias",
          "Traslados simples sin largas distancias",
        ],
        notForYou: [
          "Excursiones fuera de la ciudad",
          "Vida nocturna como prioridad",
          "Un plan solo de museos",
          "Rutas largas de senderismo",
          "Lista extensa de tours guiados",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y Puente de Carlos",
          summary: "Plazas clásicas y cruces suaves del río.",
          morning: "Plaza de la Ciudad Vieja y Reloj Astronómico",
          afternoon: "Puente de Carlos y calles de Malá Strana",
          evening: "Paseo junto al río al atardecer",
        },
        {
          day: 2,
          title: "Zona del castillo",
          summary: "Vistas en altura y patios históricos.",
          morning: "Exteriores del Castillo de Praga",
          afternoon: "Catedral de San Vito y jardines cercanos",
          evening: "Calles tranquilas de Malá Strana",
        },
        {
          day: 3,
          title: "Ciudad Nueva y parques",
          summary: "Avenidas amplias con pausas verdes.",
          morning: "Plaza de Wenceslao y pasajes cercanos",
          afternoon: "Ribera del Moldava y parque Letná",
          evening: "Paseo por Vinohrady",
        },
      ],
      imageInfoCards: [
        {
          title: "Mañanas en los puentes",
          description:
            "Los cruces tempranos son tranquilos y claros. Un circuito corto mantiene el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1668944102700-96d55a7cb878?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente de Carlos con edificios históricos al fondo.",
          },
        },
        {
          title: "Vistas desde el castillo",
          description:
            "La colina del castillo se disfruta con calma. Sube despacio y reserva tiempo para mirar.",
          image: {
            src: "https://images.unsplash.com/photo-1746389442067-a257ad864c10?auto=format&fit=crop&w=1200&q=80",
            alt: "Tejados de Praga vistos desde un mirador.",
          },
        },
        {
          title: "Paseos junto al río",
          description:
            "Los parques del Moldava aportan aire y equilibrio a los días de piedra y plazas.",
          image: {
            src: "https://images.unsplash.com/photo-1761865843087-1b58df6c7a1a?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente sobre el Moldava con el skyline de Praga.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Bus con conexión a Metro o taxi" },
        { label: "Transporte", value: "Centro caminable; tranvía para el castillo" },
        { label: "Entradas", value: "Reserva el castillo si quieres interiores" },
        { label: "Zona para alojarte", value: "Ciudad Vieja o Malá Strana" },
      ],
      checklist: [
        "Reserva entrada al castillo si vas a entrar",
        "Capa ligera para la noche",
        "Calzado cómodo para caminar",
        "Mapas offline de la ciudad y tranvía",
        "Pausa tranquila junto al río cada día",
        "Botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Praga?",
          answer:
            "Sí para lo esencial. El centro es compacto y se recorre bien con paseos cortos.",
        },
        {
          question: "¿Es necesario usar tranvía?",
          answer:
            "No para el centro, pero ayuda con la colina del castillo o traslados más largos.",
        },
        {
          question: "¿Conviene reservar el castillo?",
          answer:
            "Si quieres interiores, sí. Así evitas filas y mantienes el plan tranquilo.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "La Ciudad Vieja es muy central; Malá Strana es más tranquila y con buenas vistas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Avenidas imperiales, museos y parques tranquilos.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio, colinas y baños termales.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    vienna: {
      slug: "vienna",
      city: "Viena",
      country: "Austria",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de museos", "Primer viaje", "Viajeros tranquilos"],
      style: ["Sedes imperiales", "Pausas en parques", "Tranvías fáciles"],
      hero: {
        title: "Viena en 3 días",
        subtitle:
          "Combina avenidas clásicas con mañanas de museo, jardines amplios y traslados sencillos.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1646491311728-f4a676e5f17d?auto=format&fit=crop&w=1600&q=80",
          alt: "La Catedral de San Esteban sobre los tejados de Viena.",
        },
      },
      cityStats: [
        { value: "23", label: "Distritos en la ciudad" },
        { value: "2M", label: "Habitantes en el área metropolitana" },
        { value: "60+", label: "Museos y galerías" },
        { value: "280+", label: "Parques y jardines" },
      ],
      fit: {
        forYou: [
          "Lugares clásicos con traslados cortos",
          "Museos equilibrados con tiempo al aire libre",
          "Calles elegantes y patios tranquilos",
          "Plan claro con apoyo del tranvía",
          "Arquitectura histórica y vistas urbanas",
        ],
        notForYou: [
          "Excursiones fuera de la ciudad",
          "Vida nocturna como prioridad",
          "Agenda muy cargada de tours",
          "Rutas de montaña o lagos",
          "Aventura o senderismo intenso",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y Ringstrasse",
          summary: "Catedral, plazas y el bulevar clásico.",
          morning: "Catedral de San Esteban y Graben",
          afternoon: "Hofburg y Heldenplatz",
          evening: "Paseo por la Ringstrasse",
        },
        {
          day: 2,
          title: "Museos y jardines",
          summary: "Museo principal y pausas verdes.",
          morning: "MuseumsQuartier o Kunsthistorisches",
          afternoon: "Maria-Theresien-Platz y Burggarten",
          evening: "Paseo por la zona de Naschmarkt",
        },
        {
          day: 3,
          title: "Palacios y vistas",
          summary: "Jardines amplios con ritmo pausado.",
          morning: "Jardines de Schonbrunn",
          afternoon: "Belvedere exterior y parque",
          evening: "Paseo por el Canal del Danubio",
        },
      ],
      imageInfoCards: [
        {
          title: "Bulevares imperiales",
          description:
            "La Ringstrasse conecta los grandes hitos. Un recorrido lento mantiene el día sencillo.",
          image: {
            src: "https://images.unsplash.com/photo-1555242354-90933d7da551?auto=format&fit=crop&w=1200&q=80",
            alt: "Edificio histórico en un bulevar de Viena.",
          },
        },
        {
          title: "Vistas de tejados",
          description:
            "Un mirador breve aporta contraste a los días de museo y añade aire al plan.",
          image: {
            src: "https://images.unsplash.com/photo-1743784083194-b8b601dc8526?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista de Viena con torres de iglesias.",
          },
        },
        {
          title: "Calles con relojes",
          description:
            "Las fachadas ornamentadas y los relojes marcan el ritmo del centro histórico.",
          image: {
            src: "https://images.unsplash.com/photo-1664296130464-c7a1f9a9ef85?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle de Viena con edificios clásicos y torre con reloj.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "City Airport Train o Railjet" },
        { label: "Transporte", value: "Centro caminable; tranvías para distancias" },
        { label: "Entradas", value: "Reserva museos o Schonbrunn si vas" },
        { label: "Zona para alojarte", value: "Innere Stadt o Leopoldstadt" },
      ],
      checklist: [
        "Reserva museo si quieres horario fijo",
        "Capa ligera para la noche",
        "Calzado cómodo para caminar",
        "Mapas offline de tranvía y metro",
        "Pausa diaria en un parque",
        "Botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Viena?",
          answer:
            "Sí para lo principal. Este plan equilibra museos con paseos y jardines.",
        },
        {
          question: "¿Hay que reservar museos?",
          answer:
            "Para los más visitados o Schonbrunn, reservar ayuda a mantener el ritmo.",
        },
        {
          question: "¿La ciudad es caminable?",
          answer:
            "El centro es muy caminable, y el tranvía facilita los trayectos largos.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "Innere Stadt es central; Leopoldstadt ofrece calles más tranquilas y buen acceso.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Plazas históricas, castillo y paseos junto al río.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio, colinas y termas.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos y rutas suaves por el Sena.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    budapest: {
      slug: "budapest",
      city: "Budapest",
      country: "Hungría",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Paseos junto al río", "Viajeros tranquilos"],
      style: ["Vistas del Danubio", "Colinas históricas", "Pausas termales"],
      hero: {
        title: "Budapest en 3 días",
        subtitle:
          "Equilibra las colinas de Buda con el ritmo de Pest, paseos ribereños y tiempo de termas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1664289496602-378f6e666f7e?auto=format&fit=crop&w=1600&q=80",
          alt: "El Parlamento de Hungría frente al Danubio.",
        },
      },
      cityStats: [
        { value: "2", label: "Orillas: Buda y Pest" },
        { value: "23", label: "Distritos en la ciudad" },
        { value: "1,7M", label: "Habitantes en la ciudad" },
        { value: "100+", label: "Manantiales termales" },
      ],
      fit: {
        forYou: [
          "Paseos junto al río con vistas claras",
          "Mezcla de colinas y avenidas planas",
          "Termas como pausa tranquila",
          "Traslados cortos entre zonas clave",
          "Arquitectura clásica y fotos del skyline",
        ],
        notForYou: [
          "Vida nocturna como prioridad",
          "Excursiones fuera de la ciudad",
          "Rutas largas de senderismo",
          "Plan solo de museos",
          "Un viaje rápido y sin pausas",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro de Pest y Danubio",
          summary: "Parlamento y paseo suave junto al río.",
          morning: "Parlamento exterior y Plaza Kossuth",
          afternoon: "Paseo del Danubio y cruce del Puente de las Cadenas",
          evening: "Caminata al atardecer junto al río",
        },
        {
          day: 2,
          title: "Colinas de Buda",
          summary: "Vistas altas y ritmo tranquilo.",
          morning: "Patios del Castillo de Buda",
          afternoon: "Bastión de los Pescadores y exterior de Matías",
          evening: "Miradores de la colina Gellért",
        },
        {
          day: 3,
          title: "Termas y bulevares",
          summary: "Pausa termal y avenidas verdes.",
          morning: "Baños Széchenyi o visita termal corta",
          afternoon: "Parque de la Ciudad y paseo por Andrássy",
          evening: "Paseo por el Barrio Judío",
        },
      ],
      imageInfoCards: [
        {
          title: "Skyline del Parlamento",
          description:
            "El Danubio enmarca las vistas. Un paseo largo por la ribera lo resume todo.",
          image: {
            src: "https://images.unsplash.com/photo-1744642774961-4a4d2cd588a3?auto=format&fit=crop&w=1200&q=80",
            alt: "El Parlamento de Hungría junto al Danubio.",
          },
        },
        {
          title: "Puentes al anochecer",
          description:
            "La ciudad se ilumina temprano. Un cruce lento aporta un gran momento del día.",
          image: {
            src: "https://images.unsplash.com/photo-1740333863042-11ae1f783090?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente iluminado y el Parlamento de noche.",
          },
        },
        {
          title: "Cruces del Danubio",
          description:
            "Los puentes conectan Buda y Pest sin grandes desvíos y mantienen el ritmo fluido.",
          image: {
            src: "https://images.unsplash.com/photo-1648584271420-a77d6b2eb2b9?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente sobre el Danubio con la ciudad al fondo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Bus aeropuerto a Deák Ferenc tér" },
        { label: "Transporte", value: "Ribera caminable; Metro para distancias" },
        { label: "Entradas", value: "Reserva termas si planeas visitarlas" },
        { label: "Zona para alojarte", value: "Distrito V o cerca del Danubio" },
      ],
      checklist: [
        "Reserva termas si quieres horario fijo",
        "Traje de baño y toalla ligera",
        "Capa ligera para la noche",
        "Mapas offline de Metro y tranvía",
        "Pausa lenta junto al río cada día",
        "Calzado cómodo para caminar",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Budapest?",
          answer:
            "Sí para lo esencial. El plan reparte Buda y Pest con traslados cortos.",
        },
        {
          question: "¿Conviene reservar termas?",
          answer:
            "Las más populares se llenan, así que reservar ayuda a mantener el ritmo tranquilo.",
        },
        {
          question: "¿Es caminable la ciudad?",
          answer:
            "La ribera y los distritos centrales son caminables, con Metro para trayectos largos.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "El Distrito V es céntrico; las zonas cercanas al Danubio son escénicas y prácticas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Avenidas clásicas, museos y parques tranquilos.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco histórico y paseos junto al río.",
        },
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos suaves.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    seville: {
      slug: "seville",
      city: "Sevilla",
      country: "España",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Paseos al aire libre", "Viajeros tranquilos"],
      style: ["Plazas amplias", "Barrios históricos", "Ritmo pausado"],
      hero: {
        title: "Sevilla en 3 días",
        subtitle:
          "Un plan sereno por plazas, patios y paseos junto al Guadalquivir con tiempo para respirar.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1713102834168-c8f0b3ed7ca9?auto=format&fit=crop&w=1600&q=80",
          alt: "Plaza de España de Sevilla con su arquitectura curva.",
        },
      },
      cityStats: [
        { value: "3", label: "Sitios Patrimonio de la Humanidad" },
        { value: "700k", label: "Habitantes en la ciudad" },
        { value: "3.000+", label: "Horas de sol al año" },
        { value: "1", label: "Gran río: el Guadalquivir" },
      ],
      fit: {
        forYou: [
          "Plazas y patios para caminar sin prisa",
          "Un centro histórico compacto",
          "Tiempo al aire libre y parques",
          "Ritmo suave con pocas distancias",
          "Arquitectura y cultura andaluza",
        ],
        notForYou: [
          "Excursiones fuera de la ciudad",
          "Vida nocturna como prioridad",
          "Plan muy cargado de entradas",
          "Rutas largas bajo calor intenso",
          "Un viaje rápido sin pausas",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y plazas",
          summary: "Catedral, barrios clásicos y grandes espacios abiertos.",
          morning: "Catedral de Sevilla y exterior de la Giralda",
          afternoon: "Alcázar exterior y Barrio de Santa Cruz",
          evening: "Plaza de España al atardecer",
        },
        {
          day: 2,
          title: "Río y Triana",
          summary: "Ribera tranquila y calles con identidad local.",
          morning: "Paseo junto al Guadalquivir",
          afternoon: "Barrio de Triana y puente de Isabel II",
          evening: "Paseo lento por la ribera",
        },
        {
          day: 3,
          title: "Parques y miradores urbanos",
          summary: "Jardines amplios y puntos de vista modernos.",
          morning: "Parque de María Luisa",
          afternoon: "Metropol Parasol y paseo por el centro",
          evening: "Alameda de Hércules con paseo tranquilo",
        },
      ],
      imageInfoCards: [
        {
          title: "Plazas abiertas",
          description:
            "Las plazas sevillanas tienen sombra y bancos. Son el mejor lugar para una pausa larga.",
          image: {
            src: "https://images.unsplash.com/photo-1640799172468-d75176e6fa2f?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista amplia de la Catedral de Sevilla y su entorno.",
          },
        },
        {
          title: "La Giralda en altura",
          description:
            "La torre marca el centro histórico. Un paseo lento por sus alrededores da contexto.",
          image: {
            src: "https://images.unsplash.com/photo-1664354565807-f832d990d50e?auto=format&fit=crop&w=1200&q=80",
            alt: "La Giralda de Sevilla con cielo claro.",
          },
        },
        {
          title: "Detalles góticos",
          description:
            "La catedral ofrece textura y calma. Un vistazo corto aporta historia sin cargar el día.",
          image: {
            src: "https://images.unsplash.com/photo-1755832056530-4102cc092c6b?auto=format&fit=crop&w=1200&q=80",
            alt: "Detalle gótico de la Catedral de Sevilla.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Marzo a mayo o octubre a noviembre" },
        { label: "Traslado aeropuerto", value: "Bus o taxi al centro" },
        { label: "Transporte", value: "Centro caminable; tranvía para trayectos" },
        { label: "Entradas", value: "Reserva la Catedral o el Alcázar si entras" },
        { label: "Zona para alojarte", value: "Centro o Santa Cruz" },
      ],
      checklist: [
        "Reserva entradas si quieres visitar interiores",
        "Protección solar y agua en días calurosos",
        "Calzado cómodo para caminar",
        "Mapa offline del centro",
        "Pausa larga al mediodía",
        "Capa ligera para la noche",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Sevilla?",
          answer:
            "Sí para lo esencial. El centro es compacto y los paseos son cortos y claros.",
        },
        {
          question: "¿Hace falta usar transporte?",
          answer:
            "No en el centro. El tranvía ayuda si quieres evitar caminatas largas.",
        },
        {
          question: "¿Conviene reservar la Catedral o el Alcázar?",
          answer:
            "Si quieres entrar, sí. Reservar evita filas y mantiene el ritmo tranquilo.",
        },
        {
          question: "¿Dónde hospedarse?",
          answer:
            "El Centro y Santa Cruz son cómodos, caminables y cercanos a las plazas principales.",
        },
      ],
      relatedItineraries: [
        {
          slug: "lisbon",
          city: "Lisboa",
          days: 3,
          description: "Barrios con vistas y paseos junto al agua.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí y paseos junto al mar.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos fáciles.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    berlin: {
      slug: "berlin",
      city: "Berlín",
      country: "Alemania",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Buscadores de cultura", "Exploradores de barrios"],
      style: ["Memoriales icónicos", "Distritos creativos", "Transporte fácil"],
      hero: {
        title: "Berlín en 3 días",
        subtitle:
          "Mezcla historia y barrios creativos con parques amplios y paseos tranquilos.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80",
          alt: "Avenida de Berlín con edificios históricos.",
        },
      },
      cityStats: [
        { value: "12", label: "Distritos en la ciudad" },
        { value: "180+", label: "Museos y galerías" },
        { value: "2", label: "Ríos: Spree y Havel" },
        { value: "70+", label: "Parques y zonas verdes" },
      ],
      fit: {
        forYou: [
          "Historia con pausas en museos",
          "Paseos por barrios y cafés",
          "Una mezcla de íconos y cultura urbana",
          "Traslados cortos en metro",
          "Tardes en parques",
        ],
        notForYou: [
          "Plan centrado en vida nocturna",
          "Ritmo muy rápido y sin pausas",
          "Excursiones largas fuera de la ciudad",
          "Solo museos sin descanso",
          "Viaje enfocado solo en clubs",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y Mitte",
          summary: "Puerta de Brandeburgo y paseos clásicos.",
          morning: "Puerta de Brandeburgo y exterior del Reichstag",
          afternoon: "Memorial del Holocausto y paseo por Tiergarten",
          evening: "Unter den Linden y ribera de Museum Island",
        },
        {
          day: 2,
          title: "Berlín del este",
          summary: "Arte urbano, canales y barrios locales.",
          morning: "East Side Gallery y puente Oberbaum",
          afternoon: "Canales de Kreuzberg y mercados",
          evening: "Cena en Prenzlauer Berg",
        },
        {
          day: 3,
          title: "Museos y palacios",
          summary: "Galerías y jardines con ritmo suave.",
          morning: "Museos de Museum Island",
          afternoon: "Jardines del Palacio de Charlottenburg",
          evening: "Paseo por Savignyplatz",
        },
      ],
      imageInfoCards: [
        {
          title: "Monumentos y memoria",
          description:
            "El centro histórico se recorre a pie, con paradas cortas entre memoriales.",
          image: {
            src: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
            alt: "Avenida amplia con edificios históricos en Berlín.",
          },
        },
        {
          title: "Barrios creativos",
          description:
            "El este de la ciudad combina grafiti, cafés y calles tranquilas.",
          image: {
            src: "https://images.unsplash.com/photo-1495069785877-7c5485000a68?auto=format&fit=crop&w=1200&q=80",
            alt: "Mural de arte urbano en una calle de Berlín.",
          },
        },
        {
          title: "Pausas en parques",
          description:
            "Tiergarten ofrece sombra y espacios abiertos para descansar entre visitas.",
          image: {
            src: "https://images.unsplash.com/photo-1516900557543-41557bfc7ef7?auto=format&fit=crop&w=1200&q=80",
            alt: "Camino arbolado en un parque de Berlín.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Tren FEX a Hauptbahnhof o Mitte" },
        { label: "Transporte", value: "U-Bahn y S-Bahn para trayectos cortos" },
        { label: "Entradas", value: "Reserva la cúpula del Reichstag" },
        { label: "Zona para alojarte", value: "Mitte o Prenzlauer Berg" },
      ],
      checklist: [
        "Reserva entrada a la cúpula del Reichstag",
        "Guarda mapas offline del transporte",
        "Capa ligera para la tarde",
        "Un museo principal al día",
        "Calzado cómodo para caminar",
        "Pausa en un café junto al canal",
      ],
      faqs: [
        {
          question: "¿Berlín es buena para un primer viaje?",
          answer:
            "Sí. Los principales íconos están en pocos barrios y el transporte es fácil.",
        },
        {
          question: "¿Qué museos debería priorizar?",
          answer:
            "Empieza por Museum Island y suma un museo más según tus intereses.",
        },
        {
          question: "¿Conviene ver sitios del Muro?",
          answer:
            "El East Side Gallery es la opción más fácil y se puede visitar en poco tiempo.",
        },
        {
          question: "¿Se puede recorrer en bici?",
          answer:
            "Sí. Hay carriles y rutas planas, especialmente por parques y canales.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Plazas históricas, castillo y paseos junto al río.",
        },
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Avenidas clásicas, museos y parques tranquilos.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    florence: {
      slug: "florence",
      city: "Florencia",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de arte", "Paseos tranquilos", "Primer viaje a Italia"],
      style: ["Arte renacentista", "Paseos junto al río", "Pausas en café"],
      hero: {
        title: "Florencia en 3 días",
        subtitle:
          "Combina arte esencial con paseos por el Arno, plazas históricas y miradores al atardecer.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Florence_skyline.jpg",
          alt: "El skyline de Florencia con el Duomo al fondo.",
        },
      },
      cityStats: [
        { value: "1", label: "Centro histórico caminable" },
        { value: "70+", label: "Museos y galerías" },
        { value: "2", label: "Riberas del Arno" },
        { value: "600+", label: "Años de herencia renacentista" },
      ],
      fit: {
        forYou: [
          "Arte con pausas entre visitas",
          "Barrios compactos y caminables",
          "Miradores al atardecer",
          "Cafés y mercados",
          "Ritmo tranquilo con tiempo libre",
        ],
        notForYou: [
          "Excursiones largas cada día",
          "Vida nocturna como prioridad",
          "Rutas de senderismo intensas",
          "Maratón de museos",
          "Plan acelerado sin pausas",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Duomo y centro",
          summary: "Catedral, plazas históricas y paseos suaves.",
          morning: "Duomo y Piazza del Duomo",
          afternoon: "Piazza della Signoria y exterior del Palazzo Vecchio",
          evening: "Paseo por el Ponte Vecchio",
        },
        {
          day: 2,
          title: "Arte y Arno",
          summary: "Galerías y barrios junto al río.",
          morning: "Uffizi y sus salas principales",
          afternoon: "Oltrarno y Santo Spirito",
          evening: "Paseo tranquilo por la ribera",
        },
        {
          day: 3,
          title: "Jardines y miradores",
          summary: "Verde y vistas amplias.",
          morning: "Jardines de Boboli",
          afternoon: "Exterior del Palacio Pitti y cafés cercanos",
          evening: "Atardecer en Piazzale Michelangelo",
        },
      ],
      imageInfoCards: [
        {
          title: "Plazas renacentistas",
          description:
            "Las plazas principales se conectan a pie y permiten un ritmo pausado.",
          image: {
            src: "https://images.unsplash.com/photo-1501084817091-a4f3d1a11f8e?auto=format&fit=crop&w=1200&q=80",
            alt: "Plaza de Florencia con arquitectura clásica y cafés.",
          },
        },
        {
          title: "Luz del Arno",
          description:
            "El río aporta un respiro entre museos. Un paseo largo al final del día es ideal.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista del río Arno con puentes y edificios históricos.",
          },
        },
        {
          title: "Vistas desde la colina",
          description:
            "Un mirador cercano cambia el ritmo y deja espacio para la tarde.",
          image: {
            src: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista de Florencia desde un mirador.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Tranvía al centro" },
        { label: "Transporte", value: "Centro caminable, todo cerca" },
        { label: "Entradas", value: "Reserva Uffizi o Accademia" },
        { label: "Zona para alojarte", value: "Duomo u Oltrarno" },
      ],
      checklist: [
        "Reserva entradas para Uffizi o Accademia",
        "Calzado cómodo para caminar",
        "Mapas offline del centro",
        "Pausa larga en un café",
        "Capa ligera para la noche",
        "Tiempo para un mirador al atardecer",
      ],
      faqs: [
        {
          question: "¿Florencia es caminable?",
          answer:
            "Sí. El centro es compacto y casi todo se hace a pie.",
        },
        {
          question: "¿Conviene reservar museos?",
          answer:
            "Sí, especialmente Uffizi y Accademia para evitar colas.",
        },
        {
          question: "¿Vale la pena subir al mirador?",
          answer:
            "Sí. Una subida corta a Piazzale Michelangelo ofrece las mejores vistas.",
        },
        {
          question: "¿Dos museos en un día es demasiado?",
          answer:
            "Puede ser. Mejor combinar un museo fuerte con un paseo al aire libre.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos fáciles.",
        },
        {
          slug: "venice",
          city: "Venecia",
          days: 3,
          description: "Canales, iglesias clásicas y ritmo lento.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    venice: {
      slug: "venice",
      city: "Venecia",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Escapadas románticas", "Viajeros tranquilos", "Amantes de fotos"],
      style: ["Paseos por canales", "Iglesias históricas", "Islas cercanas"],
      hero: {
        title: "Venecia en 3 días",
        subtitle:
          "Baja el ritmo con paseos por canales, plazas tranquilas y visitas a islas cercanas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Venice_Grand_Canal.jpg",
          alt: "El Gran Canal de Venecia con fachadas históricas.",
        },
      },
      cityStats: [
        { value: "118", label: "Islas en la laguna" },
        { value: "400+", label: "Puentes en el centro" },
        { value: "170+", label: "Canales urbanos" },
        { value: "25+", label: "Museos y galerías" },
      ],
      fit: {
        forYou: [
          "Paseos lentos con vistas constantes",
          "Iglesias y museos pequeños",
          "Pausas junto al canal",
          "Rutas muy fotogénicas",
          "Excursiones cortas a islas",
        ],
        notForYou: [
          "Plan acelerado y sin pausas",
          "Uso de coche o grandes traslados",
          "Vida nocturna intensa",
          "Maratón de museos",
          "Tours masivos",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "San Marcos y el Gran Canal",
          summary: "Íconos clásicos con vistas al agua.",
          morning: "Plaza San Marcos y Basílica exterior",
          afternoon: "Exterior del Palacio Ducal y paseo por la riva",
          evening: "Paseo al atardecer por el Gran Canal",
        },
        {
          day: 2,
          title: "Cannaregio y barrios locales",
          summary: "Canales tranquilos y cafés locales.",
          morning: "Canales de Cannaregio y Ghetto judío",
          afternoon: "Mercado de Rialto y vistas del puente",
          evening: "Aperitivo en Dorsoduro",
        },
        {
          day: 3,
          title: "Islas de la laguna",
          summary: "Colores y artesanías junto al agua.",
          morning: "Murano y talleres de vidrio",
          afternoon: "Isla de Burano",
          evening: "Regreso para un último paseo por canales",
        },
      ],
      imageInfoCards: [
        {
          title: "Luz sobre los canales",
          description:
            "Las mejores vistas llegan caminando, con puentes cortos y calles silenciosas.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Canal de Venecia con edificios de colores suaves.",
          },
        },
        {
          title: "Plazas escondidas",
          description:
            "Pequeños campos ofrecen una Venecia tranquila con cafés y bancos.",
          image: {
            src: "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&w=1200&q=80",
            alt: "Plaza tranquila en Venecia con edificios históricos.",
          },
        },
        {
          title: "Colores de la laguna",
          description:
            "Un vaporetto corto te lleva a islas coloridas y ritmo más lento.",
          image: {
            src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
            alt: "Casas coloridas junto al agua en la laguna.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Alilaguna o taxi acuático" },
        { label: "Transporte", value: "Camina y usa vaporetto para distancias" },
        { label: "Entradas", value: "Reserva Basílica o Palacio Ducal" },
        { label: "Zona para alojarte", value: "San Marco o Dorsoduro" },
      ],
      checklist: [
        "Calzado cómodo para caminar",
        "Pase de vaporetto si visitas islas",
        "Reserva Basílica o Palacio",
        "Capa ligera para la brisa",
        "Madrugar para calles más vacías",
        "Cena tranquila junto al canal",
      ],
      faqs: [
        {
          question: "¿Es fácil orientarse en Venecia?",
          answer:
            "Sí con mapa. Las calles son estrechas y conviene ir sin prisa.",
        },
        {
          question: "¿Merece la pena Murano y Burano?",
          answer:
            "Si tienes un día libre, las islas aportan color y calma.",
        },
        {
          question: "¿Necesito paseo en góndola?",
          answer:
            "No es obligatorio. El vaporetto y los paseos a pie ya ofrecen vistas bellas.",
        },
        {
          question: "¿Hay demasiada gente todo el día?",
          answer:
            "Las primeras horas y el atardecer son más tranquilos.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florencia",
          days: 3,
          description: "Arte renacentista, paseos por el río y plazas tranquilas.",
        },
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos fáciles.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    milan: {
      slug: "milan",
      city: "Milán",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de diseño", "Escapadas urbanas", "Buena comida"],
      style: ["Catedral y plazas", "Barrios creativos", "Aperitivo"],
      hero: {
        title: "Milán en 3 días",
        subtitle:
          "Combina el Duomo con barrios modernos, cafés tranquilos y tardes de aperitivo.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Duomo_di_Milano_(23282).jpg",
          alt: "El Duomo de Milán en el centro de la ciudad.",
        },
      },
      cityStats: [
        { value: "9", label: "Zonas municipales" },
        { value: "80+", label: "Museos y galerías" },
        { value: "1.3M", label: "Habitantes en la ciudad" },
        { value: "2", label: "Zonas clave: Duomo y Brera" },
      ],
      fit: {
        forYou: [
          "Iconos urbanos y plazas centrales",
          "Diseño y arquitectura moderna",
          "Pausas en cafés y heladerías",
          "Metro fácil para moverse",
          "Plan con tardes libres",
        ],
        notForYou: [
          "Viaje de campo o naturaleza",
          "Solo actividades al aire libre",
          "Maratón de museos",
          "Vida nocturna intensa",
          "Ritmo muy acelerado",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Duomo y centro",
          summary: "Catedral, galerías y calles principales.",
          morning: "Duomo de Milán y plaza central",
          afternoon: "Galería Vittorio Emanuele II y exterior de La Scala",
          evening: "Cena en Brera y paseo corto",
        },
        {
          day: 2,
          title: "Arte y barrios modernos",
          summary: "Museos y arquitectura contemporánea.",
          morning: "Pinacoteca di Brera",
          afternoon: "Porta Nuova y zona de Bosco Verticale",
          evening: "Aperitivo en Corso Como",
        },
        {
          day: 3,
          title: "Canales y barrios locales",
          summary: "Paseos junto al agua y calles tranquilas.",
          morning: "Paseo por Navigli",
          afternoon: "Sant'Ambrogio y patios cercanos",
          evening: "Aperitivo al atardecer en los canales",
        },
      ],
      imageInfoCards: [
        {
          title: "Catedral protagonista",
          description:
            "El Duomo marca el ritmo. Reserva una mañana lenta para disfrutar la plaza.",
          image: {
            src: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848a?auto=format&fit=crop&w=1200&q=80",
            alt: "Detalle de las agujas del Duomo de Milán.",
          },
        },
        {
          title: "Milán moderno",
          description:
            "Porta Nuova ofrece contraste con edificios nuevos y plazas abiertas.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Rascacielos modernos en Milán.",
          },
        },
        {
          title: "Canales al atardecer",
          description:
            "Navigli se disfruta mejor con luz baja y un paseo sin prisa.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Canal de Navigli con cafés al anochecer.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Malpensa Express o bus" },
        { label: "Transporte", value: "Metro rápido para barrios clave" },
        { label: "Entradas", value: "Reserva La Última Cena con antelación" },
        { label: "Zona para alojarte", value: "Brera o Porta Romana" },
      ],
      checklist: [
        "Reserva La Última Cena con antelación",
        "Calzado cómodo para caminar",
        "Mapas offline del metro",
        "Planifica un aperitivo cada tarde",
        "Tiempo para terrazas del Duomo",
        "Capa ligera para la noche",
      ],
      faqs: [
        {
          question: "¿Milán merece 3 días?",
          answer:
            "Sí combinas el Duomo con barrios modernos y tiempo en los canales.",
        },
        {
          question: "¿Conviene subir a la terraza del Duomo?",
          answer:
            "Sí. Las vistas son memorables y no requiere mucho tiempo.",
        },
        {
          question: "¿Es buena ciudad para compras?",
          answer:
            "Sí, pero reserva solo un bloque corto para mantener el ritmo tranquilo.",
        },
        {
          question: "¿Hace falta ir al Lago Como?",
          answer:
            "No para un plan de 3 días. Es mejor enfocarse en la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florencia",
          days: 3,
          description: "Arte renacentista, paseos por el río y plazas tranquilas.",
        },
        {
          slug: "venice",
          city: "Venecia",
          days: 3,
          description: "Canales, iglesias clásicas y ritmo lento.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    munich: {
      slug: "munich",
      city: "Múnich",
      country: "Alemania",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de jardines", "Museos tranquilos", "Paseos suaves"],
      style: ["Plazas históricas", "Pausas en parques", "Tranvía fácil"],
      hero: {
        title: "Múnich en 3 días",
        subtitle:
          "Combina plazas históricas con jardines, museos clave y paseos relajados.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marienplatz_(M%C3%BCnchen)_48.jpg",
          alt: "Marienplatz de Múnich con el Nuevo Ayuntamiento.",
        },
      },
      cityStats: [
        { value: "25", label: "Distritos en la ciudad" },
        { value: "1.5M", label: "Habitantes en la ciudad" },
        { value: "300+", label: "Cervecerías y jardines" },
        { value: "1", label: "Gran parque central: Englischer Garten" },
      ],
      fit: {
        forYou: [
          "Plazas históricas y paseos fáciles",
          "Parques y rutas junto al río",
          "Museos con tardes libres",
          "Mercados y cervecerías locales",
          "Traslados cortos en tranvía",
        ],
        notForYou: [
          "Excursiones largas a los Alpes",
          "Vida nocturna como prioridad",
          "Plan sin pausas",
          "Rutas largas en coche",
          "Solo museos sin descanso",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco histórico y Marienplatz",
          summary: "Plazas clásicas y calles centrales.",
          morning: "Marienplatz y exterior del Neues Rathaus",
          afternoon: "Viktualienmarkt y calles cercanas",
          evening: "Paseo por el río Isar",
        },
        {
          day: 2,
          title: "Museos y parques",
          summary: "Arte y descanso al aire libre.",
          morning: "Museos del Kunstareal",
          afternoon: "Paseo por el Englischer Garten",
          evening: "Cena en cervecería tradicional",
        },
        {
          day: 3,
          title: "Palacios y barrios",
          summary: "Jardines y barrios tranquilos.",
          morning: "Jardines del Palacio de Nymphenburg",
          afternoon: "Calles de Schwabing y cafés",
          evening: "Paseo por Leopoldstraße",
        },
      ],
      imageInfoCards: [
        {
          title: "Plazas del centro",
          description:
            "El casco histórico es compacto y permite ver lo principal sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1509731981857-78b349f5d46b?auto=format&fit=crop&w=1200&q=80",
            alt: "Plaza de Marienplatz con edificios históricos.",
          },
        },
        {
          title: "Pausa en el parque",
          description:
            "El Englischer Garten es ideal para un descanso largo entre museos.",
          image: {
            src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
            alt: "Césped y árboles en el Englischer Garten.",
          },
        },
        {
          title: "Cervecerías al aire libre",
          description:
            "Las mesas al exterior hacen las tardes más relajadas después de caminar.",
          image: {
            src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
            alt: "Mesas bajo árboles en una cervecería de Múnich.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "S-Bahn hasta Marienplatz" },
        { label: "Transporte", value: "Tranvía y U-Bahn para trayectos cortos" },
        { label: "Entradas", value: "Reserva museos si es necesario" },
        { label: "Zona para alojarte", value: "Altstadt o Schwabing" },
      ],
      checklist: [
        "Guarda mapas offline del transporte",
        "Capa ligera para la tarde",
        "Planifica una cervecería",
        "Calzado cómodo para caminar",
        "Pausa diaria en un parque",
        "Reserva museo si lo necesitas",
      ],
      faqs: [
        {
          question: "¿Múnich es caminable?",
          answer:
            "Sí en el centro. Para distancias largas, el tranvía funciona muy bien.",
        },
        {
          question: "¿Hace falta visitar una cervecería?",
          answer:
            "Es una experiencia local y se puede hacer en una sola tarde sin prisas.",
        },
        {
          question: "¿Es necesaria una excursión a los Alpes?",
          answer:
            "No para un plan de 3 días. Mejor aprovechar la ciudad.",
        },
        {
          question: "¿Qué zona de museos es mejor?",
          answer:
            "Kunstareal es la zona más cómoda con varias opciones cercanas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Íconos históricos, barrios creativos y buen transporte.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Plazas históricas, castillo y paseos junto al río.",
        },
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Avenidas clásicas, museos y parques tranquilos.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dublin: {
      slug: "dublin",
      city: "Dublín",
      country: "Irlanda",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de literatura", "Pubs tranquilos", "Primer viaje"],
      style: ["Calles históricas", "Paseos junto al río", "Noches relajadas"],
      hero: {
        title: "Dublín en 3 días",
        subtitle:
          "Combina lugares literarios con paseos por el río, pubs locales y barrios tranquilos.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ha%27penny_Bridge,_Dublin.jpg",
          alt: "El puente Ha'penny sobre el río Liffey en Dublín.",
        },
      },
      cityStats: [
        { value: "2", label: "Riberas principales del río" },
        { value: "50+", label: "Museos y sitios culturales" },
        { value: "1.4M", label: "Habitantes en el área metropolitana" },
        { value: "3", label: "Barrios centrales caminables" },
      ],
      fit: {
        forYou: [
          "Lugares literarios y museos",
          "Calles históricas y paseos al río",
          "Pubs con ritmo temprano",
          "Rutas compactas y caminables",
          "Mercados y cafés de día",
        ],
        notForYou: [
          "Excursiones largas cada día",
          "Vida nocturna como prioridad",
          "Senderismo de larga distancia",
          "Maratón de museos sin pausas",
          "Viaje solo de lujo",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro georgiano y Trinity",
          summary: "Bibliotecas y calles clásicas.",
          morning: "Trinity College y paseo por el campus",
          afternoon: "Grafton Street y St. Stephen's Green",
          evening: "Temple Bar y cena tranquila",
        },
        {
          day: 2,
          title: "Castillos y cultura",
          summary: "Historia y paseos fáciles.",
          morning: "Dublin Castle y Chester Beatty Library",
          afternoon: "Christ Church Cathedral y ribera",
          evening: "Paseo por Smithfield",
        },
        {
          day: 3,
          title: "Barrios y costa",
          summary: "Mercados y brisa marina.",
          morning: "St. Patrick's Cathedral y calles cercanas",
          afternoon: "Howth o Dún Laoghaire",
          evening: "Regreso para pub tranquilo",
        },
      ],
      imageInfoCards: [
        {
          title: "Calles georgianas",
          description:
            "El centro histórico es compacto y permite caminar sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=1200&q=80",
            alt: "Puertas georgianas de colores en Dublín.",
          },
        },
        {
          title: "Paseos por el Liffey",
          description:
            "Las riberas son ideales al final de la tarde cuando baja la luz.",
          image: {
            src: "https://images.unsplash.com/photo-1517309230475-6736d926b979?auto=format&fit=crop&w=1200&q=80",
            alt: "Río Liffey con puentes y luces de la ciudad.",
          },
        },
        {
          title: "Escapadas costeras",
          description:
            "Un tren corto te lleva al mar y aporta un descanso suave.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "Sendero costero cerca de Dublín.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Bus Airlink al centro" },
        { label: "Transporte", value: "Camina el centro; DART para la costa" },
        { label: "Entradas", value: "Reserva la biblioteca de Trinity" },
        { label: "Zona para alojarte", value: "Temple Bar o St. Stephen's Green" },
      ],
      checklist: [
        "Reserva entrada al Book of Kells",
        "Lleva chaqueta impermeable",
        "Mapas offline del centro",
        "Planifica un paseo costero",
        "Calzado cómodo para caminar",
        "Tiempo para un pub tranquilo",
      ],
      faqs: [
        {
          question: "¿Dublín es buena para un fin de semana?",
          answer:
            "Sí. Los puntos principales están cerca y puedes sumar una escapada corta.",
        },
        {
          question: "¿Conviene visitar un pueblo costero?",
          answer:
            "Si tienes una tarde libre, el DART te lleva fácil a Howth o Dún Laoghaire.",
        },
        {
          question: "¿Es fácil moverse por la ciudad?",
          answer:
            "Sí. El centro es compacto y los buses conectan bien los barrios.",
        },
        {
          question: "¿Hace falta reservar Trinity College?",
          answer:
            "Conviene reservar en verano para evitar colas y mantener el ritmo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "edinburgh",
          city: "Edimburgo",
          days: 3,
          description: "Castillo, calles históricas y paseos con vistas.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Íconos históricos, barrios creativos y buen transporte.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    edinburgh: {
      slug: "edinburgh",
      city: "Edimburgo",
      country: "Reino Unido",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Caminatas cortas", "Festivales"],
      style: ["Castillo y vistas", "Calles antiguas", "Colinas suaves"],
      hero: {
        title: "Edimburgo en 3 días",
        subtitle:
          "Combina historia del castillo con calles antiguas, parques y miradores fáciles.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_Castle_Scotland.jpg",
          alt: "Castillo de Edimburgo sobre la ciudad.",
        },
      },
      cityStats: [
        { value: "2", label: "Centros históricos: Old Town y New Town" },
        { value: "1", label: "Castillo en lo alto del casco" },
        { value: "100+", label: "Festivales al año" },
        { value: "4", label: "Miradores principales" },
      ],
      fit: {
        forYou: [
          "Calles históricas con vistas",
          "Subidas cortas con panorama",
          "Museos y parques en balance",
          "Pubs tranquilos al final del día",
          "Barrios compactos",
        ],
        notForYou: [
          "Vida nocturna como prioridad",
          "Excursiones largas al campo",
          "Ritmo acelerado",
          "Maratón de museos",
          "Clima muy caluroso",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Old Town y Royal Mile",
          summary: "Castillo e historia en calles antiguas.",
          morning: "Castillo de Edimburgo y vistas",
          afternoon: "Royal Mile y Catedral de St. Giles",
          evening: "Grassmarket y paseo nocturno",
        },
        {
          day: 2,
          title: "New Town y museos",
          summary: "Calles elegantes y cultura.",
          morning: "Princes Street Gardens y New Town",
          afternoon: "National Gallery o Museum of Scotland",
          evening: "Barrio de Stockbridge",
        },
        {
          day: 3,
          title: "Colinas y miradores",
          summary: "Vistas amplias con caminatas suaves.",
          morning: "Arthur's Seat o Calton Hill",
          afternoon: "Holyrood Park y exterior del palacio",
          evening: "Cena en la zona de Leith",
        },
      ],
      imageInfoCards: [
        {
          title: "Texturas del casco antiguo",
          description:
            "Las calles de piedra y los callejones hacen el paseo muy visual.",
          image: {
            src: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle estrecha de piedra en Edimburgo.",
          },
        },
        {
          title: "Miradores cercanos",
          description:
            "Calton Hill ofrece vistas rápidas sin caminata larga.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista de Edimburgo desde una colina.",
          },
        },
        {
          title: "Calma en New Town",
          description:
            "Calles elegantes y jardines ofrecen un ritmo más tranquilo.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Arquitectura clásica en New Town.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Tranvía o bus al centro" },
        { label: "Transporte", value: "Camina Old Town; buses para distancias" },
        { label: "Entradas", value: "Reserva el Castillo de Edimburgo" },
        { label: "Zona para alojarte", value: "Old Town o New Town" },
      ],
      checklist: [
        "Reserva entradas para el castillo",
        "Lleva capa contra el viento",
        "Mapas offline del Old Town",
        "Planifica un mirador al amanecer o atardecer",
        "Calzado cómodo para caminar",
        "Tiempo para una cena tranquila",
      ],
      faqs: [
        {
          question: "¿Edimburgo es una ciudad con cuestas?",
          answer:
            "Sí, pero las subidas son cortas y las vistas compensan.",
        },
        {
          question: "¿Arthur's Seat es obligatorio?",
          answer:
            "No. Calton Hill es más corto si prefieres algo rápido.",
        },
        {
          question: "¿Conviene reservar el castillo?",
          answer:
            "Sí en temporada alta. Ayuda a mantener el plan ordenado.",
        },
        {
          question: "¿Es buena ciudad en meses frios?",
          answer:
            "Sí, pero lleva capas. Hay muchos museos y cafés para resguardarse.",
        },
      ],
      relatedItineraries: [
        {
          slug: "dublin",
          city: "Dublín",
          days: 3,
          description: "Literatura, paseos junto al río y noches tranquilas.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Íconos históricos, barrios creativos y buen transporte.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    copenhagen: {
      slug: "copenhagen",
      city: "Copenhague",
      country: "Dinamarca",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de diseño", "Viajeros en bici", "Exploradores de comida"],
      style: ["Paseos junto al agua", "Barrios coloridos", "Bici fácil"],
      hero: {
        title: "Copenhague en 3 días",
        subtitle:
          "Combina paseos frente al agua con barrios de diseño, cafés y rutas en bici.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Nyhavn_Copenhagen.jpg",
          alt: "Puerto de Nyhavn con edificios coloridos en Copenhague.",
        },
      },
      cityStats: [
        { value: "1", label: "Centro urbano junto al puerto" },
        { value: "350+", label: "Kilómetros de ciclovías" },
        { value: "50+", label: "Museos y galerías" },
        { value: "2", label: "Zonas clave: Indre By y Vesterbro" },
      ],
      fit: {
        forYou: [
          "Paseos por el puerto y bici",
          "Arquitectura y diseño",
          "Cafés tranquilos",
          "Traslados cortos entre barrios",
          "Ritmo relajado",
        ],
        notForYou: [
          "Excursiones largas fuera de la ciudad",
          "Vida nocturna intensa",
          "Maratón de museos",
          "Viaje en coche",
          "Plan sin pausas",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Nyhavn y centro histórico",
          summary: "Vistas clásicas y paseos cortos.",
          morning: "Nyhavn y Kongens Nytorv",
          afternoon: "Exterior de Amalienborg y paseo por el puerto",
          evening: "Paseo frente al agua y cena",
        },
        {
          day: 2,
          title: "Barrios de diseño",
          summary: "Calles creativas y cafés locales.",
          morning: "Christianshavn y sus canales",
          afternoon: "Vesterbro y tiendas locales",
          evening: "Cena en el Meatpacking District",
        },
        {
          day: 3,
          title: "Jardines y museos",
          summary: "Verde y cultura con ritmo suave.",
          morning: "Tivoli o parques cercanos",
          afternoon: "Exterior de Rosenborg y King's Garden",
          evening: "Paseo en bici junto a los lagos",
        },
      ],
      imageInfoCards: [
        {
          title: "Colores del puerto",
          description:
            "Nyhavn marca el tono. Por la mañana hay menos gente.",
          image: {
            src: "https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=1200&q=80",
            alt: "Fachadas coloridas junto al puerto de Copenhague.",
          },
        },
        {
          title: "Calles para bici",
          description:
            "Las ciclovías conectan barrios sin esfuerzo.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Ciclistas en una calle de Copenhague.",
          },
        },
        {
          title: "Diseño y plazas",
          description:
            "Plazas abiertas y líneas limpias dan un ritmo sereno.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Arquitectura moderna y plaza amplia en Copenhague.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Metro hasta Kongens Nytorv" },
        { label: "Transporte", value: "Bici o caminata; metro para distancias" },
        { label: "Entradas", value: "Reserva Tivoli o Rosenborg si vas" },
        { label: "Zona para alojarte", value: "Indre By o Vesterbro" },
      ],
      checklist: [
        "Lleva chaqueta ligera",
        "Planifica un día en bici",
        "Reserva Tivoli si quieres entrar",
        "Mapas offline del metro",
        "Calzado cómodo para caminar",
        "Tiempo para un café junto al puerto",
      ],
      faqs: [
        {
          question: "¿Copenhague es fácil en bici?",
          answer:
            "Sí. Las ciclovías son amplias y las rutas son cortas.",
        },
        {
          question: "¿Es obligatorio visitar Tivoli?",
          answer:
            "No, pero una visita corta suma un clásico sin ocupar todo el día.",
        },
        {
          question: "¿Se puede recorrer a pie?",
          answer:
            "Sí. El centro es compacto y los barrios están cerca.",
        },
        {
          question: "¿Es buena en temporada baja?",
          answer:
            "Sí, pero conviene llevar capas y planear más cafés.",
        },
      ],
      relatedItineraries: [
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Casco antiguo, museos y pausas entre islas.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Íconos históricos, barrios creativos y buen transporte.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    stockholm: {
      slug: "stockholm",
      city: "Estocolmo",
      country: "Suecia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Paseos junto al agua", "Museos tranquilos", "Vistas escénicas"],
      style: ["Islas y puentes", "Casco antiguo", "Pausas en museos"],
      hero: {
        title: "Estocolmo en 3 días",
        subtitle:
          "Combina calles antiguas con museos, paseos entre islas y pausas junto al agua.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stockholm_Skyline.jpg",
          alt: "Skyline de Estocolmo con edificios junto al agua.",
        },
      },
      cityStats: [
        { value: "14", label: "Islas en el centro urbano" },
        { value: "50+", label: "Museos y galerías" },
        { value: "30+", label: "Puentes que conectan barrios" },
        { value: "1", label: "Casco antiguo caminable" },
      ],
      fit: {
        forYou: [
          "Paseos por el agua y ferris",
          "Calles antiguas con cafés",
          "Museos con pausas al aire libre",
          "Plan con tardes libres",
          "Miradores escénicos",
        ],
        notForYou: [
          "Vida nocturna como prioridad",
          "Senderismo largo fuera de la ciudad",
          "Ritmo rápido sin pausas",
          "Maratón de museos",
          "Viaje en coche",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Gamla Stan y el agua",
          summary: "Casco antiguo y paseo por el puerto.",
          morning: "Calles de Gamla Stan y Stortorget",
          afternoon: "Exterior del Palacio Real y paseo junto al agua",
          evening: "Atardecer en Skeppsholmen",
        },
        {
          day: 2,
          title: "Día de museos",
          summary: "Museos clave y parques tranquilos.",
          morning: "Museo Vasa o ABBA Museum",
          afternoon: "Paseo por Djurgården",
          evening: "Cena en Östermalm",
        },
        {
          day: 3,
          title: "Barrios y miradores",
          summary: "Vistas de la ciudad con ritmo suave.",
          morning: "Miradores de Södermalm",
          afternoon: "Exterior de Fotografiska y cafés",
          evening: "Paseo por Riddarholmen",
        },
      ],
      imageInfoCards: [
        {
          title: "Detalles del casco antiguo",
          description:
            "Gamla Stan se disfruta mejor sin prisa, con pausas cortas en cafés.",
          image: {
            src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle estrecha en Gamla Stan, Estocolmo.",
          },
        },
        {
          title: "Paseos entre islas",
          description:
            "Los puentes permiten recorrer la ciudad caminando sin grandes traslados.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente y vistas del agua en Estocolmo.",
          },
        },
        {
          title: "Museos y verde",
          description:
            "Djurgården combina cultura y espacios verdes para equilibrar el día.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Camino arbolado en un parque de Estocolmo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Arlanda Express a Central Station" },
        { label: "Transporte", value: "Camina el centro; metro para distancias" },
        { label: "Entradas", value: "Reserva Vasa Museum en verano" },
        { label: "Zona para alojarte", value: "Norrmalm o Södermalm" },
      ],
      checklist: [
        "Reserva entradas para el Vasa si es necesario",
        "Capa ligera para el viento",
        "Mapas offline del metro",
        "Paseo en ferry o por puentes",
        "Calzado cómodo para caminar",
        "Tiempo para un café junto al agua",
      ],
      faqs: [
        {
          question: "¿Estocolmo se recorre a pie?",
          answer:
            "Sí. Las islas principales se conectan con puentes cortos.",
        },
        {
          question: "¿Djurgården es imprescindible?",
          answer:
            "Si quieres museos y parques en un mismo día, es la mejor zona.",
        },
        {
          question: "¿Vale la pena el Museo Vasa?",
          answer:
            "Sí. Es uno de los principales atractivos y encaja en medio día.",
        },
        {
          question: "¿Hace falta pase de transporte?",
          answer:
            "No siempre. La mayoría de rutas son caminables con algún metro puntual.",
        },
      ],
      relatedItineraries: [
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos frente al agua, diseño y bici fácil.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Íconos históricos, barrios creativos y buen transporte.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    athens: {
      slug: "athens",
      city: "Atenas",
      country: "Grecia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Comida local", "Miradores"],
      style: ["Sitios antiguos", "Barrios con cafés", "Paseos al atardecer"],
      hero: {
        title: "Atenas en 3 días",
        subtitle:
          "Equilibra ruinas antiguas con barrios locales, cafés y miradores al atardecer.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Parthenon_Image_01.jpg",
          alt: "El Partenón en la Acrópolis de Atenas.",
        },
      },
      cityStats: [
        { value: "1", label: "Acrópolis en lo alto de la ciudad" },
        { value: "300+", label: "Días de sol al año" },
        { value: "3", label: "Barrios centrales caminables" },
        { value: "15", label: "Minutos entre puntos clave" },
      ],
      fit: {
        forYou: [
          "Historia antigua con cafés modernos",
          "Paseos cortos entre sitios",
          "Miradores y terrazas",
          "Comidas largas sin prisa",
          "Ritmo relajado con pausas al mediodía",
        ],
        notForYou: [
          "Excursiones largas cada día",
          "Senderismo fuera de la ciudad",
          "Vida nocturna como prioridad",
          "Maratón de museos",
          "Viaje solo de playa",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Acrópolis y Plaka",
          summary: "Sitios antiguos con calles antiguas.",
          morning: "Acrópolis y Partenón",
          afternoon: "Museo de la Acrópolis y paseo por Plaka",
          evening: "Anafiotika y mirador al atardecer",
        },
        {
          day: 2,
          title: "Agora y plazas",
          summary: "Ruinas y barrios centrales.",
          morning: "Agora Antigua y Templo de Hefesto",
          afternoon: "Monastiraki y mercado",
          evening: "Cena en Psyrri y paseo corto",
        },
        {
          day: 3,
          title: "Barrios y colinas",
          summary: "Verde urbano y vistas amplias.",
          morning: "Jardín Nacional y zona de Syntagma",
          afternoon: "Cafés de Kolonaki y colina de Licabeto",
          evening: "Paseo al atardecer por Filopappou",
        },
      ],
      imageInfoCards: [
        {
          title: "Vistas antiguas",
          description:
            "La Acrópolis domina la ciudad. Ve temprano para evitar calor y multitudes.",
          image: {
            src: "https://images.unsplash.com/photo-1505739778-5cb6734f965e?auto=format&fit=crop&w=1200&q=80",
            alt: "La Acrópolis con luz cálida en Atenas.",
          },
        },
        {
          title: "Calles de Plaka",
          description:
            "Plaka ofrece calles pequeñas y cafés para una tarde lenta.",
          image: {
            src: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle con cafés en el barrio de Plaka.",
          },
        },
        {
          title: "Colinas al atardecer",
          description:
            "Subidas cortas a miradores cercanos dan vistas amplias sin esfuerzo.",
          image: {
            src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            alt: "Mirador sobre Atenas al atardecer.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro o bus a Syntagma" },
        { label: "Transporte", value: "Camina el centro; metro para distancias" },
        { label: "Entradas", value: "Reserva entrada para la Acrópolis" },
        { label: "Zona para alojarte", value: "Plaka o Koukaki" },
      ],
      checklist: [
        "Reserva entrada para la Acrópolis",
        "Sombrero y protector solar",
        "Salida temprano para los sitios principales",
        "Mapas offline del centro",
        "Calzado cómodo para caminar",
        "Tiempo para un almuerzo largo",
      ],
      faqs: [
        {
          question: "¿Atenas es fácil para primer viaje?",
          answer:
            "Sí. Los puntos principales están cerca y los barrios centrales son claros.",
        },
        {
          question: "¿Conviene visitar la Acrópolis temprano?",
          answer:
            "Sí. Por la mañana hay menos calor y se disfruta más.",
        },
        {
          question: "¿Hace falta una excursión a las islas?",
          answer:
            "No para 3 días. Mejor concentrarse en la ciudad.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "No siempre. La mayoría de recorridos son caminables.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos antiguos, plazas y paseos fáciles.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudí y paseos junto al mar.",
        },
        {
          slug: "paris",
          city: "París",
          days: 2,
          description: "Monumentos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    porto: {
      slug: "porto",
      city: "Oporto",
      country: "Portugal",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Paseos junto al río", "Amantes de la comida"],
      style: ["Paseos ribereños", "Miradores en colinas", "Pausas en café"],
      pacing: [
        "Oporto se disfruta mejor con un ritmo calmado: un punto clave por día y pausas largas para el río y las callecitas.",
        "Deja las mañanas para miradores y zonas altas, y las tardes para comidas lentas junto al Duero.",
        "Reserva una tarde para cruzar el puente con vistas y volver sin prisa.",
      ],
      hero: {
        title: "Oporto en 3 días",
        subtitle:
          "Barrios junto al río, calles con azulejos y comidas lentas con tiempo para respirar.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Porto_skyline.jpg",
          alt: "Vista del río en Oporto con casas coloridas.",
        },
      },
      cityStats: [
        { value: "Ribeira", label: "Casco histórico junto al río" },
        { value: "Colinas", label: "Miradores cortos y accesibles" },
        { value: "Azulejos", label: "Fachadas con textura local" },
        { value: "Duero", label: "Paseos calmados junto al agua" },
      ],
      fit: {
        forYou: [
          "Paseos cortos con pausas largas",
          "Vistas al río",
          "Calles históricas y cafés",
          "Plan simple día a día",
          "Ritmo calmado con buena comida",
        ],
        notForYou: [
          "Vida nocturna como prioridad",
          "Maratón de museos",
          "Excursiones largas cada día",
          "Agenda muy apretada",
          "Compras como foco principal",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Ribeira y casco viejo",
          summary: "Calles históricas y paseo junto al río.",
          morning: "Ribeira y calles cercanas",
          afternoon: "Catedral y miradores del centro",
          evening: "Puente Dom Luis I al atardecer",
        },
        {
          day: 2,
          title: "Vistas y cafés",
          summary: "Miradores y pausas largas.",
          morning: "Zona de Clerigos y mirador",
          afternoon: "Calles de librerías y café lento",
          evening: "Cena junto al Duero",
        },
        {
          day: 3,
          title: "Gaia y paseo ribereño",
          summary: "Cruce del río y bodegas.",
          morning: "Paseo por Vila Nova de Gaia",
          afternoon: "Bodegas de vino de Oporto",
          evening: "Paseo tranquilo junto al agua",
        },
      ],
      imageInfoCards: [
        {
          title: "Capas junto al río",
          description:
            "Las calles se apilan sobre el Duero y cada paseo trae una vista nueva.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Casas en ladera sobre el río en Oporto.",
          },
        },
        {
          title: "Detalles de azulejos",
          description:
            "Las fachadas con azulejos suman color sin añadir distancia.",
          image: {
            src: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=1200&q=80",
            alt: "Detalle de azulejos en Oporto.",
          },
        },
        {
          title: "Cruces de puente",
          description:
            "Cruzar el puente da vistas amplias sin una caminata larga.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente sobre el Duero en Oporto.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Centro caminable; metro para colinas" },
        { label: "Entradas", value: "Reserva bodegas si quieres degustación" },
        { label: "Zona para alojarte", value: "Ribeira o Cedofeita" },
      ],
      checklist: [
        "Reserva una bodega si quieres visita",
        "Calzado cómodo para colinas",
        "Capa ligera para la noche",
        "Mapa offline del casco viejo",
        "Pausa larga junto al río cada día",
        "Efectivo pequeño para cafés",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Oporto?",
          answer:
            "Sí. Con tres días puedes cubrir lo esencial y mantener un ritmo calmado.",
        },
        {
          question: "¿Conviene cruzar a Gaia?",
          answer:
            "Sí, por las vistas y las bodegas. Medio día suele bastar.",
        },
        {
          question: "¿Oporto es caminable?",
          answer:
            "Sí, aunque con colinas. Planifica subidas cortas y descansos.",
        },
        {
          question: "¿Necesito reservar bodegas?",
          answer:
            "Solo si quieres visitas muy populares o horarios específicos.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Ribeira es central junto al río; Cedofeita es más tranquilo.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un área principal por día y tiempo amplio para paseos y cafés.",
        },
        {
          question: "¿Es buen destino para primer viaje?",
          answer:
            "Sí. El centro es compacto y fácil de recorrer sin prisa.",
        },
      ],
      relatedItineraries: [
        {
          slug: "lisbon",
          city: "Lisboa",
          days: 3,
          description: "Miradores de colina y paseos junto al río.",
        },
        {
          slug: "seville",
          city: "Sevilla",
          days: 3,
          description: "Plazas, parques y paseos lentos.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Barrios caminables y tiempo junto al mar.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    krakow: {
      slug: "krakow",
      city: "Cracovia",
      country: "Polonia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Caminatas suaves", "Primer viaje"],
      style: ["Plazas históricas", "Vistas al castillo", "Barrios tranquilos"],
      pacing: [
        "Cracovia es compacta, así que cada día puede girar en torno a un solo barrio con pausas largas.",
        "Separa la colina del castillo del casco viejo para evitar sobrecargar el día.",
        "Deja Kazimierz para la tarde y disfruta de un ritmo más local.",
      ],
      hero: {
        title: "Cracovia en 3 días",
        subtitle:
          "Plazas históricas, vistas al castillo y paseos tranquilos con tiempo para cafés.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Krakow_Main_Square.jpg",
          alt: "Plaza histórica en Cracovia con torres al fondo.",
        },
      },
      cityStats: [
        { value: "Casco viejo", label: "Plaza central caminable" },
        { value: "Wawel", label: "Colina y vistas al río" },
        { value: "Kazimierz", label: "Cafés y calles tranquilas" },
        { value: "Río", label: "Paseos fáciles junto al agua" },
      ],
      fit: {
        forYou: [
          "Ciudad compacta",
          "Centro histórico",
          "Pausas en café",
          "Ritmo simple por barrios",
          "Poca necesidad de transporte",
        ],
        notForYou: [
          "Vida nocturna como foco",
          "Excursiones largas",
          "Agenda muy cargada",
          "Solo museos todo el día",
          "Compras como prioridad",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo",
          summary: "Plaza principal y calles históricas.",
          morning: "Plaza del Mercado y calles cercanas",
          afternoon: "Basílica de Santa María y Planty Park",
          evening: "Cena tranquila en el centro",
        },
        {
          day: 2,
          title: "Colina del castillo",
          summary: "Vistas y paseo junto al río.",
          morning: "Exterior del Castillo de Wawel",
          afternoon: "Paseo por el Vístula",
          evening: "Café lento junto al río",
        },
        {
          day: 3,
          title: "Kazimierz",
          summary: "Calles de barrio y ambiente local.",
          morning: "Sinagogas y calles de Kazimierz",
          afternoon: "Plac Nowy y pausa en café",
          evening: "Paseo corto por el centro",
        },
      ],
      imageInfoCards: [
        {
          title: "Plazas históricas",
          description:
            "Las plazas amplias permiten descansar y orientarse sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Plaza histórica en Cracovia.",
          },
        },
        {
          title: "Vistas al castillo",
          description:
            "La colina ofrece vistas amplias con caminatas cortas.",
          image: {
            src: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista del Castillo de Wawel en Cracovia.",
          },
        },
        {
          title: "Calles tranquilas",
          description:
            "Kazimierz aporta un ritmo local y pausado.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle tranquila en Cracovia.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre" },
        { label: "Traslado aeropuerto", value: "Tren o taxi al centro" },
        { label: "Transporte", value: "Camina casi todo; tranvía si hace falta" },
        { label: "Entradas", value: "Reserva Wawel si visitas interiores" },
        { label: "Zona para alojarte", value: "Casco viejo o Kazimierz" },
      ],
      checklist: [
        "Calzado cómodo para caminar",
        "Capa ligera para la tarde",
        "Mapa offline del centro",
        "Reserva Wawel si vas a entrar",
        "Pausa larga en café cada día",
        "Efectivo pequeño para tranvías",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Cracovia?",
          answer:
            "Sí. El casco viejo y los barrios cercanos son compactos.",
        },
        {
          question: "¿Cracovia es caminable?",
          answer:
            "Sí. La mayoría de puntos están a poca distancia.",
        },
        {
          question: "¿Conviene visitar Wawel?",
          answer:
            "Sí por las vistas. El interior es opcional.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Casco viejo es central; Kazimierz es más local y tranquilo.",
        },
        {
          question: "¿Necesito reservas para museos?",
          answer:
            "Solo para exposiciones populares o fines de semana.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un barrio principal por día con pausas largas.",
        },
        {
          question: "¿Vale la pena dedicar tiempo a Kazimierz?",
          answer:
            "Sí. Medio día o un día completo es ideal.",
        },
      ],
      relatedItineraries: [
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco viejo y paseos junto al río.",
        },
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Museos clásicos y bulevares tranquilos.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio y colinas históricas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    zurich: {
      slug: "zurich",
      city: "Zúrich",
      country: "Suiza",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Paseos junto al lago", "Museos", "Escapadas tranquilas"],
      style: ["Paseos al lago", "Museos compactos", "Calles del casco viejo"],
      pacing: [
        "Zúrich es compacto: un museo o un mirador por día y caminatas largas junto al lago.",
        "Agrupa las paradas por el casco viejo y la orilla para evitar traslados innecesarios.",
        "Deja el último día para un paseo lento y una comida sin prisa.",
      ],
      hero: {
        title: "Zúrich en 3 días",
        subtitle:
          "Paseos junto al lago, casco viejo compacto y museos con ritmo calmado.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Zurich_Skyline.jpg",
          alt: "Vista de Zúrich con el lago y torres al fondo.",
        },
      },
      cityStats: [
        { value: "Lago", label: "Paseos largos junto al agua" },
        { value: "Casco viejo", label: "Calles cortas y plazas" },
        { value: "Museos", label: "Paradas culturales compactas" },
        { value: "Tranvías", label: "Conexiones rápidas" },
      ],
      fit: {
        forYou: [
          "Ritmo calmado",
          "Vistas al lago",
          "Caminatas cortas",
          "Tardes de museo",
          "Transporte sencillo",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Excursiones largas",
          "Agenda muy cargada",
          "Compras como prioridad",
          "Días de caminata muy largos",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo y lago",
          summary: "Calles históricas y paseo ribereño.",
          morning: "Casco viejo y plazas principales",
          afternoon: "Paseo por el lago de Zúrich",
          evening: "Cena tranquila junto al río",
        },
        {
          day: 2,
          title: "Museos y parques",
          summary: "Cultura y verde urbano.",
          morning: "Kunsthaus o Museo Nacional",
          afternoon: "Lindenhof y parques cercanos",
          evening: "Pausa en café del centro",
        },
        {
          day: 3,
          title: "Barrios y miradores",
          summary: "Tranvía suave y vistas amplias.",
          morning: "Mirador de Uetliberg o jardín botánico",
          afternoon: "West Zurich y galerías pequeñas",
          evening: "Paseo final junto al lago",
        },
      ],
      imageInfoCards: [
        {
          title: "Calma junto al lago",
          description:
            "La orilla del lago es el mejor lugar para bajar el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1505843795480-5cfb3c03f6ff?auto=format&fit=crop&w=1200&q=80",
            alt: "Paseo junto al lago de Zúrich.",
          },
        },
        {
          title: "Calles del casco viejo",
          description:
            "Calles cortas y torres facilitan las caminatas suaves.",
          image: {
            src: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle del casco viejo en Zúrich.",
          },
        },
        {
          title: "Tardes de museo",
          description:
            "Los museos están cerca y permiten mantener el día flexible.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Edificio de museo en Zúrich.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Tren a Hauptbahnhof" },
        { label: "Transporte", value: "Tranvías rápidos y frecuentes" },
        { label: "Entradas", value: "Reserva museos en temporada alta" },
        { label: "Zona para alojarte", value: "Casco viejo o Seefeld" },
      ],
      checklist: [
        "Capa ligera para brisa del lago",
        "Mapa de tranvías offline",
        "Planifica una tarde de museo",
        "Reserva paseo en barco si quieres",
        "Calzado cómodo para adoquines",
        "Pausa larga junto al lago cada día",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Zúrich?",
          answer:
            "Sí. El centro es compacto y los puntos clave están cerca.",
        },
        {
          question: "¿Zúrich es caminable?",
          answer:
            "Sí, sobre todo el casco viejo y la orilla del lago.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "Ayuda si usarás tranvías varias veces o un paseo en barco.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Casco viejo es central; Seefeld es más tranquilo junto al lago.",
        },
        {
          question: "¿Cuántos museos conviene visitar?",
          answer:
            "Uno o dos. Mantén el resto del día flexible.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un punto clave por día y caminatas largas junto al lago.",
        },
        {
          question: "¿Hace falta una excursión?",
          answer:
            "No para esta guía. El enfoque es la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "munich",
          city: "Múnich",
          days: 3,
          description: "Jardines y plazas caminables.",
        },
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Museos clásicos y avenidas amplias.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco viejo y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    brussels: {
      slug: "brussels",
      city: "Bruselas",
      country: "Bélgica",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Escapadas urbanas", "Museos", "Cafés tranquilos"],
      style: ["Plazas grandes", "Distritos de museos", "Pausas en café"],
      pacing: [
        "Bruselas se recorre en bucles cortos: una plaza principal, un museo y un parque cada día.",
        "Mantén las tardes ligeras con cafés y paseos entre barrios.",
        "Deja una tarde para caminar sin prisa por el centro histórico.",
      ],
      hero: {
        title: "Bruselas en 3 días",
        subtitle:
          "Plazas monumentales, tiempo de museo y pausas en café con ritmo tranquilo.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brussels-Grand-Place.jpg",
          alt: "Plaza histórica en Bruselas con edificios ornamentados.",
        },
      },
      cityStats: [
        { value: "Grand Place", label: "Centro histórico principal" },
        { value: "Museos", label: "Distrito cultural compacto" },
        { value: "Parques", label: "Pausas verdes entre visitas" },
        { value: "Caminable", label: "Recorridos cortos en el centro" },
      ],
      fit: {
        forYou: [
          "Caminatas cortas",
          "Arquitectura histórica",
          "Tardes de museo",
          "Cultura de café",
          "Transporte sencillo",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Excursiones largas",
          "Agenda muy apretada",
          "Viaje de playa",
          "Ritmo acelerado",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Grand Place y centro",
          summary: "Plazas históricas y calles cercanas.",
          morning: "Grand Place y calles del casco viejo",
          afternoon: "Galerías y plazas centrales",
          evening: "Cena en el centro y paseo corto",
        },
        {
          day: 2,
          title: "Museos y jardines",
          summary: "Mont des Arts y pausas verdes.",
          morning: "Zona de museos reales",
          afternoon: "Jardines de Mont des Arts",
          evening: "Cafés en Sablon",
        },
        {
          day: 3,
          title: "Barrios y parques",
          summary: "Paseos tranquilos y vistas suaves.",
          morning: "Parc du Cinquantenaire",
          afternoon: "Ixelles y sus estanques",
          evening: "Vuelta suave por el centro",
        },
      ],
      imageInfoCards: [
        {
          title: "Plaza monumental",
          description:
            "El centro histórico marca el ritmo con paseos cortos y vistas amplias.",
          image: {
            src: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80",
            alt: "Grand Place de Bruselas con arquitectura histórica.",
          },
        },
        {
          title: "Zona de museos",
          description:
            "Los museos están cerca y permiten un horario sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Edificio de museo en Bruselas.",
          },
        },
        {
          title: "Pausas en parque",
          description:
            "Los parques dan aire entre visitas y bajan el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1501084817091-a4f3d1a11f8e?auto=format&fit=crop&w=1200&q=80",
            alt: "Parque con senderos en Bruselas.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Tren a Brussels Central" },
        { label: "Transporte", value: "Camina el centro; metro para distancias" },
        { label: "Entradas", value: "Reserva museos los fines de semana" },
        { label: "Zona para alojarte", value: "Centro o Sablon" },
      ],
      checklist: [
        "Reserva museos si vas en fin de semana",
        "Capa ligera para la lluvia",
        "Mapa offline del centro",
        "Pausa larga en café cada día",
        "Efectivo pequeño para snacks",
        "Calzado cómodo para caminar",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Bruselas?",
          answer:
            "Sí. Los puntos centrales y los museos caben bien en tres días.",
        },
        {
          question: "¿Bruselas es caminable?",
          answer:
            "Sí, con metro para recorridos más largos.",
        },
        {
          question: "¿Necesito reservas para museos?",
          answer:
            "Solo para exposiciones populares o fines de semana.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "El centro es práctico; Sablon es más tranquilo.",
        },
        {
          question: "¿Hace falta una excursión?",
          answer:
            "No para esta guía. El enfoque es un ritmo calmado en la ciudad.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un área principal por día con pausas en cafés y parques.",
        },
        {
          question: "¿Es buena para primer viaje?",
          answer:
            "Sí. La ciudad es compacta y fácil de recorrer sin prisa.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos y barrios con café.",
        },
        {
          slug: "amsterdam",
          city: "Ámsterdam",
          days: 3,
          description: "Canales y museos con ritmo relajado.",
        },
        {
          slug: "london",
          city: "Londres",
          days: 3,
          description: "Íconos clásicos y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    valencia: {
      slug: "valencia",
      city: "Valencia",
      country: "España",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de la comida", "Pausa de playa", "Primer viaje"],
      style: ["Casco viejo", "Paseos por jardines", "Tiempo junto al mar"],
      pacing: [
        "Valencia combina casco viejo con parques largos, así que divide los días entre centro histórico y jardines.",
        "Guarda una tarde para la playa para bajar el ritmo.",
        "Deja las cenas tempranas y un paseo suave para terminar cada día.",
      ],
      hero: {
        title: "Valencia en 3 días",
        subtitle:
          "Casco viejo, paseos por jardines y una tarde de playa con ritmo tranquilo.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/City_of_Arts_and_Sciences,_Valencia,_Spain.jpg",
          alt: "Vista de Valencia con tejados históricos y cielo claro.",
        },
      },
      cityStats: [
        { value: "Turia", label: "Jardines largos para caminar" },
        { value: "Casco viejo", label: "Centro histórico compacto" },
        { value: "Playa", label: "Acceso fácil al mar" },
        { value: "Mercados", label: "Mañanas con comida local" },
      ],
      fit: {
        forYou: [
          "Mezcla de ciudad y playa",
          "Ritmo caminable",
          "Mercados de comida",
          "Parques y jardines",
          "Plan claro por días",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Maratón de museos",
          "Ritmo acelerado",
          "Excursiones largas",
          "Compras como prioridad",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo",
          summary: "Calles históricas y mercado central.",
          morning: "Zona de la Catedral y calles céntricas",
          afternoon: "Mercado Central y plazas cercanas",
          evening: "Cena en el centro y paseo corto",
        },
        {
          day: 2,
          title: "Jardines y arquitectura moderna",
          summary: "Turia y Ciudad de las Artes.",
          morning: "Paseo por los Jardines del Turia",
          afternoon: "Exterior de la Ciudad de las Artes",
          evening: "Cafés en Ruzafa",
        },
        {
          day: 3,
          title: "Playa y paseo marítimo",
          summary: "Tiempo junto al mar y descanso.",
          morning: "Paseo por la playa de la Malvarrosa",
          afternoon: "Almuerzo junto al mar y descanso",
          evening: "Paseo al atardecer por el paseo marítimo",
        },
      ],
      imageInfoCards: [
        {
          title: "Corredor verde",
          description:
            "Los Jardines del Turia ofrecen un paseo largo y tranquilo.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Paseo en los Jardines del Turia de Valencia.",
          },
        },
        {
          title: "Calles del casco viejo",
          description:
            "Calles cortas y sombra para caminar sin prisa.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle histórica en el casco viejo de Valencia.",
          },
        },
        {
          title: "Pausas en la playa",
          description:
            "Una tarde junto al mar ayuda a bajar el ritmo del viaje.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Paseo marítimo en Valencia con el mar en calma.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Camina el centro; tranvía para la playa" },
        { label: "Entradas", value: "Reserva Oceanografic si vas" },
        { label: "Zona para alojarte", value: "Casco viejo o Ruzafa" },
      ],
      checklist: [
        "Protector solar para la playa",
        "Mapa offline del Turia",
        "Pausa larga al mediodía",
        "Reserva Oceanografic si lo visitas",
        "Calzado cómodo para caminar",
        "Botella reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Valencia?",
          answer:
            "Sí. Con tres días puedes cubrir casco viejo, jardines y playa.",
        },
        {
          question: "¿Es necesario ir a la playa?",
          answer:
            "Es recomendable para el ritmo, pero puedes cambiarla por más ciudad.",
        },
        {
          question: "¿Valencia es caminable?",
          answer:
            "El centro sí. Para la playa es mejor usar tranvía.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "El casco viejo es central; Ruzafa aporta ambiente local.",
        },
        {
          question: "¿Conviene visitar la Ciudad de las Artes?",
          answer:
            "Sí por la arquitectura y un paseo corto por el exterior.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un área principal por día y una tarde de parque o playa.",
        },
        {
          question: "¿Es buena para primer viaje?",
          answer:
            "Sí. Es una ciudad clara y fácil de recorrer a pie.",
        },
      ],
      relatedItineraries: [
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Paseos junto al mar y barrios con ritmo calmado.",
        },
        {
          slug: "seville",
          city: "Sevilla",
          days: 3,
          description: "Plazas y parques con caminatas suaves.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos y plazas centrales sin prisa.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    oslo: {
      slug: "oslo",
      city: "Oslo",
      country: "Noruega",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Paseos junto al agua", "Museos", "Ritmo tranquilo"],
      style: ["Paseos por el puerto", "Parques", "Museos compactos"],
      pacing: [
        "Oslo tiene un ritmo tranquilo. Planifica un área principal por día y paseos largos junto al agua.",
        "Combina museos con parques cercanos para mantener la tarde ligera.",
        "Reserva el último día para un paseo por el fiordo y café sin prisa.",
      ],
      hero: {
        title: "Oslo en 3 días",
        subtitle:
          "Paseos por el puerto, parques y museos compactos con tiempo para bajar el ritmo.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Oslo_Opera_House.jpg",
          alt: "Puerto de Oslo con edificios modernos y el agua.",
        },
      },
      cityStats: [
        { value: "Puerto", label: "Paseos fáciles junto al agua" },
        { value: "Parques", label: "Pausas verdes entre visitas" },
        { value: "Museos", label: "Paradas culturales compactas" },
        { value: "Tranvías", label: "Conexiones rápidas" },
      ],
      fit: {
        forYou: [
          "Ritmo calmado",
          "Vistas al agua",
          "Caminatas cortas",
          "Tardes de museo",
          "Transporte sencillo",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Ritmo acelerado",
          "Excursiones largas",
          "Compras como prioridad",
          "Itinerarios muy intensos",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Puerto y ópera",
          summary: "Paseos junto al agua y vistas urbanas.",
          morning: "Exterior de la Ópera y paseo por el puerto",
          afternoon: "Promenade de Aker Brygge",
          evening: "Atardecer junto al fiordo",
        },
        {
          day: 2,
          title: "Parques y museos",
          summary: "Verde urbano y una visita cultural.",
          morning: "Parque Vigeland",
          afternoon: "Museo en Bygdoy",
          evening: "Pausa en café del centro",
        },
        {
          day: 3,
          title: "Barrios y paseos",
          summary: "Calles tranquilas y vistas suaves.",
          morning: "Fortaleza de Akershus y paseo exterior",
          afternoon: "Cafés en Grunerlokka",
          evening: "Vuelta corta por el puerto",
        },
      ],
      imageInfoCards: [
        {
          title: "Paseos del puerto",
          description:
            "El frente marítimo marca el ritmo más calmado de la ciudad.",
          image: {
            src: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848a?auto=format&fit=crop&w=1200&q=80",
            alt: "Puerto de Oslo con barcos y skyline.",
          },
        },
        {
          title: "Pausas en parques",
          description:
            "Los parques ayudan a mantener el día ligero y sin prisas.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Parque en Oslo con senderos.",
          },
        },
        {
          title: "Arquitectura moderna",
          description:
            "Los edificios del puerto suman contraste sin agregar distancia.",
          image: {
            src: "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80",
            alt: "Edificios modernos junto al agua en Oslo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Junio a septiembre" },
        { label: "Traslado aeropuerto", value: "Tren a Oslo Central" },
        { label: "Transporte", value: "Tranvías para trayectos largos" },
        { label: "Entradas", value: "Reserva museos en temporada alta" },
        { label: "Zona para alojarte", value: "Centro o Aker Brygge" },
      ],
      checklist: [
        "Capa ligera para la lluvia",
        "Calzado cómodo para caminar",
        "Mapa de tranvías offline",
        "Pausa larga junto al agua",
        "Reserva museos si los visitas",
        "Abrigo ligero para la noche",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Oslo?",
          answer:
            "Sí. El centro y los museos principales son compactos.",
        },
        {
          question: "¿Oslo es caminable?",
          answer:
            "Sí en el centro, con tranvías para distancias largas.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "Conviene si harás varios trayectos en tranvía.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "El centro es práctico; Aker Brygge te deja junto al agua.",
        },
        {
          question: "¿Vale la pena Bygdoy?",
          answer:
            "Sí si quieres un día de museos. Mantén el ritmo suave.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un paseo del puerto o un museo por día, con pausas largas.",
        },
        {
          question: "¿Es buena ciudad para un viaje tranquilo?",
          answer:
            "Sí. Es una ciudad ordenada y calmada.",
        },
      ],
      relatedItineraries: [
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos frente al agua y barrios relajados.",
        },
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Islas y museos compactos.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Parques y barrios con ritmo lento.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    reykjavik: {
      slug: "reykjavik",
      city: "Reikiavik",
      country: "Islandia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Paseos costeros", "Cafés", "Estadías cortas"],
      style: ["Paseos junto al mar", "Calles coloridas", "Cafés cálidos"],
      pacing: [
        "Reikiavik es pequeña y caminable. Mantén un punto clave por día y paseos largos junto al agua.",
        "Combina el centro con el puerto para variar sin mover mucho.",
        "Termina el viaje con un loop tranquilo y tiempo en café.",
      ],
      hero: {
        title: "Reikiavik en 3 días",
        subtitle:
          "Calles caminables, vistas costeras y pausas cálidas con ritmo calmado.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hallgrímskirkja_church,_Reykjavik,_Iceland.jpg",
          alt: "Skyline de Reikiavik con casas de colores y costa.",
        },
      },
      cityStats: [
        { value: "Costas", label: "Paseos fáciles junto al mar" },
        { value: "Centro", label: "Núcleo compacto" },
        { value: "Cafés", label: "Pausas cálidas en interior" },
        { value: "Miradores", label: "Subidas cortas con vistas" },
      ],
      fit: {
        forYou: [
          "Centro caminable",
          "Vistas costeras",
          "Pausas en café",
          "Ritmo lento",
          "Visitas cortas a museos",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Agenda muy cargada",
          "Largas rutas en coche",
          "Compras como prioridad",
          "Excursiones rápidas cada día",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro caminable",
          summary: "Calles principales y miradores.",
          morning: "Laugavegur y calles centrales",
          afternoon: "Hallgrimskirkja y mirador",
          evening: "Cena en el centro y paseo corto",
        },
        {
          day: 2,
          title: "Puerto y museos",
          summary: "Paseos junto al agua y visitas suaves.",
          morning: "Paseo por el Viejo Puerto",
          afternoon: "Harpa y museo cercano",
          evening: "Caminata al atardecer junto al mar",
        },
        {
          day: 3,
          title: "Barrios y cafés",
          summary: "Calles tranquilas y descanso.",
          morning: "Paseo por el lago Tjornin",
          afternoon: "Café largo y tiendas pequeñas",
          evening: "Vuelta suave por el puerto",
        },
      ],
      imageInfoCards: [
        {
          title: "Calles coloridas",
          description:
            "Las calles del centro son cortas y fáciles de recorrer sin prisa.",
          image: {
            src: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&q=80",
            alt: "Casas de colores en Reikiavik.",
          },
        },
        {
          title: "Vistas del puerto",
          description:
            "El paseo del puerto es un descanso natural entre visitas.",
          image: {
            src: "https://images.unsplash.com/photo-1505312926838-645f295aaf7c?auto=format&fit=crop&w=1200&q=80",
            alt: "Puerto de Reikiavik con barcos y edificios modernos.",
          },
        },
        {
          title: "Pausas cálidas",
          description:
            "Los cafés hacen fácil bajar el ritmo durante horas frescas.",
          image: {
            src: "https://images.unsplash.com/photo-1516900557543-41557bfc7ef7?auto=format&fit=crop&w=1200&q=80",
            alt: "Interior de café acogedor en Reikiavik.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Junio a septiembre para clima suave" },
        { label: "Traslado aeropuerto", value: "Flybus o taxi al centro" },
        { label: "Transporte", value: "Camina el centro; buses si hace falta" },
        { label: "Entradas", value: "Reserva museos en días concurridos" },
        { label: "Zona para alojarte", value: "Centro o Old Harbor" },
      ],
      checklist: [
        "Capa cortaviento",
        "Calzado con buen agarre",
        "Mapa offline del centro",
        "Pausa larga en café cada día",
        "Reserva museos si vas",
        "Botella reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Reikiavik?",
          answer:
            "Sí. El centro es compacto y fácil de recorrer en tres días.",
        },
        {
          question: "¿Reikiavik es caminable?",
          answer:
            "Sí. La mayoría de puntos están cerca del centro.",
        },
        {
          question: "¿Necesito pase de transporte?",
          answer:
            "No para el centro. Los buses ayudan si quieres caminar menos.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Centro es práctico; Old Harbor aporta un ritmo más tranquilo.",
        },
        {
          question: "¿Conviene una excursión?",
          answer:
            "No para esta guía. El foco es la ciudad.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un punto principal por día y paseos largos junto al mar.",
        },
        {
          question: "¿Es buen destino para un viaje tranquilo?",
          answer:
            "Sí. Es una ciudad pequeña y fácil de manejar.",
        },
      ],
      relatedItineraries: [
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Paseos junto al agua y parques tranquilos.",
        },
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos por el puerto y barrios relajados.",
        },
        {
          slug: "dublin",
          city: "Dublín",
          days: 3,
          description: "Centro caminable y paseos junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    istanbul: {
      slug: "istanbul",
      city: "Estambul",
      country: "Turquía",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Exploradores de barrios", "Primer viaje"],
      style: ["Centros históricos", "Vistas al Bósforo", "Paseos por mercados"],
      pacing: [
        "Estambul premia un ritmo constante: un barrio principal por día y pausas de té entre visitas.",
        "Divide la península histórica en dos jornadas para evitar cansancio.",
        "Cierra el viaje con un día lento junto al Bósforo.",
      ],
      hero: {
        title: "Estambul en 3 días",
        subtitle:
          "Centros históricos, paseos por mercados y vistas al Bósforo con ritmo calmado.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hagia_Sophia_Istanbul_Old_City,_Turkey_(Unsplash).jpg",
          alt: "Skyline de Estambul con cúpulas y minaretes.",
        },
      },
      cityStats: [
        { value: "Centro histórico", label: "Zona compacta de monumentos" },
        { value: "Bósforo", label: "Vistas fáciles al agua" },
        { value: "Bazares", label: "Paseos cortos por mercados" },
        { value: "Ferries", label: "Cruces escénicos" },
      ],
      fit: {
        forYou: [
          "Monumentos históricos",
          "Barrios caminables",
          "Paseos por bazares",
          "Pausas en té",
          "Ritmo flexible",
        ],
        notForYou: [
          "Checklist acelerado",
          "Vida nocturna como foco",
          "Excursiones largas",
          "Compras como prioridad",
          "Agenda rígida",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Península histórica",
          summary: "Monumentos principales y plazas.",
          morning: "Exterior de Santa Sofía y plazas cercanas",
          afternoon: "Zona de la Mezquita Azul y jardines",
          evening: "Paseo al atardecer por Sultanahmet",
        },
        {
          day: 2,
          title: "Bazares y waterfront",
          summary: "Mercados y vistas al agua.",
          morning: "Gran Bazar y calles cercanas",
          afternoon: "Bazar de las Especias y paseo por el Cuerno de Oro",
          evening: "Paseo por el puente de Gálata",
        },
        {
          day: 3,
          title: "Ritmo del Bósforo",
          summary: "Vistas al agua y barrios tranquilos.",
          morning: "Ferry por el Bósforo",
          afternoon: "Cafés en Ortakoy o Karakoy",
          evening: "Atardecer junto al agua",
        },
      ],
      imageInfoCards: [
        {
          title: "Skyline histórico",
          description:
            "Cúpulas y minaretes dan contexto sin necesidad de largas caminatas.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Skyline histórico de Estambul.",
          },
        },
        {
          title: "Pasillos de mercado",
          description:
            "Los bazares se recorren en bucles cortos para mantener el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80",
            alt: "Pasillo de mercado en Estambul.",
          },
        },
        {
          title: "Vistas al Bósforo",
          description:
            "Los paseos junto al agua ayudan a terminar el día con calma.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Orilla del Bósforo con barcos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Tranvía para el centro histórico" },
        { label: "Entradas", value: "Reserva sitios principales si entras" },
        { label: "Zona para alojarte", value: "Sultanahmet o Karakoy" },
      ],
      checklist: [
        "Reserva entradas para sitios populares",
        "Calzado cómodo para calles empedradas",
        "Capa ligera para la noche",
        "Mapa del centro histórico",
        "Pausa de té entre visitas",
        "Efectivo pequeño para tranvías",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Estambul?",
          answer:
            "Sí para lo esencial del centro histórico y un día del Bósforo.",
        },
        {
          question: "¿Estambul es caminable?",
          answer:
            "Las zonas principales sí, con tranvías para trayectos largos.",
        },
        {
          question: "¿Necesito reservar atracciones?",
          answer:
            "Sí para los sitios más populares en temporada alta.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Sultanahmet está cerca de monumentos; Karakoy suma ambiente local.",
        },
        {
          question: "¿Conviene tomar un ferry por el Bósforo?",
          answer:
            "Sí. Es un paseo tranquilo y escénico.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un barrio principal por día con pausas de té.",
        },
        {
          question: "¿Es buena para primer viaje?",
          answer:
            "Sí. Los distritos principales son claros y fáciles de recorrer.",
        },
      ],
      relatedItineraries: [
        {
          slug: "athens",
          city: "Atenas",
          days: 3,
          description: "Sitios antiguos y barrios con cafés.",
        },
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Íconos clásicos y calles históricas.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Paseos por el Danubio y colinas históricas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    naples: {
      slug: "naples",
      city: "Nápoles",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de la comida", "Calles históricas", "Primer viaje"],
      style: ["Calles históricas", "Pausas junto al mar", "Mercados locales"],
      pacing: [
        "Nápoles es intensa, así que mantén un área principal por día y deja tiempo para cafés.",
        "Separa el casco histórico del paseo marítimo para caminar menos.",
        "Cierra con un recorrido lento y cena sin prisa.",
      ],
      hero: {
        title: "Nápoles en 3 días",
        subtitle:
          "Calles históricas, paseos junto al mar y ritmo food-first sin prisas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Castel_dell%27Ovo_(Naples).jpg",
          alt: "Paseo marítimo de Nápoles con el Vesubio al fondo.",
        },
      },
      cityStats: [
        { value: "Centro histórico", label: "Calles densas y caminables" },
        { value: "Mar", label: "Paseos fáciles junto al agua" },
        { value: "Mercados", label: "Mañanas con comida local" },
        { value: "Vistas", label: "Miradores cortos" },
      ],
      fit: {
        forYou: [
          "Ritmo food-first",
          "Calles históricas",
          "Caminatas cortas",
          "Mercados locales",
          "Plan flexible",
        ],
        notForYou: [
          "Ritmo acelerado",
          "Vida nocturna como foco",
          "Solo museos todo el día",
          "Excursiones largas",
          "Compras como prioridad",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco histórico",
          summary: "Calles antiguas y mercados.",
          morning: "Spaccanapoli y calles cercanas",
          afternoon: "Iglesias históricas y plazas pequeñas",
          evening: "Cena de pizza y paseo corto",
        },
        {
          day: 2,
          title: "Paseo marítimo",
          summary: "Caminata junto al mar y vistas suaves.",
          morning: "Exterior del Castel dell'Ovo",
          afternoon: "Lungomare",
          evening: "Atardecer junto al agua",
        },
        {
          day: 3,
          title: "Museo y barrios",
          summary: "Cultura y calles locales.",
          morning: "Museo Arqueológico Nacional",
          afternoon: "Barrio del Vomero y mirador",
          evening: "Cena tranquila en trattoria",
        },
      ],
      imageInfoCards: [
        {
          title: "Calles históricas",
          description:
            "El centro es denso pero fácil de recorrer en bucles cortos.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle histórica en Nápoles.",
          },
        },
        {
          title: "Paseo marítimo",
          description:
            "La costa es el lugar ideal para bajar el ritmo.",
          image: {
            src: "https://images.unsplash.com/photo-1506801310323-534be5e7fd47?auto=format&fit=crop&w=1200&q=80",
            alt: "Paseo marítimo de Nápoles con mar en calma.",
          },
        },
        {
          title: "Vistas urbanas",
          description:
            "Miradores cortos ofrecen vistas amplias sin gran esfuerzo.",
          image: {
            src: "https://images.unsplash.com/photo-1501806897405-5e8b63604d91?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista sobre Nápoles con tejados y costa.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre" },
        { label: "Traslado aeropuerto", value: "Bus o taxi al centro" },
        { label: "Transporte", value: "Camina el centro; metro para colinas" },
        { label: "Entradas", value: "Reserva museos los fines de semana" },
        { label: "Zona para alojarte", value: "Centro Histórico o Chiaia" },
      ],
      checklist: [
        "Calzado cómodo para caminar",
        "Mapa offline del casco viejo",
        "Pausa larga para comer cada día",
        "Reserva museo si lo visitas",
        "Capa ligera para la noche",
        "Efectivo pequeño para mercados",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Nápoles?",
          answer:
            "Sí. En tres días puedes ver el centro, el mar y un museo.",
        },
        {
          question: "¿Nápoles es caminable?",
          answer:
            "El centro sí, con metro o funicular para zonas altas.",
        },
        {
          question: "¿Conviene el Museo Arqueológico?",
          answer:
            "Sí si te interesa la historia. Medio día es suficiente.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "Centro Histórico es céntrico; Chiaia es más tranquilo.",
        },
        {
          question: "¿Hace falta una excursión a Pompeya?",
          answer:
            "No para esta guía. El foco es la ciudad.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un área principal por día con pausas largas para comer.",
        },
        {
          question: "¿Es buena para primer viaje?",
          answer:
            "Sí. Con un plan simple es fácil de manejar.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Sitios antiguos y plazas clásicas.",
        },
        {
          slug: "florence",
          city: "Florencia",
          days: 3,
          description: "Arte, río y plazas tranquilas.",
        },
        {
          slug: "venice",
          city: "Venecia",
          days: 3,
          description: "Canales y ritmo pausado.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    nice: {
      slug: "nice",
      city: "Niza",
      country: "Francia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Pausas junto al mar", "Casco viejo", "Miradores fáciles"],
      style: ["Paseos marítimos", "Calles antiguas", "Miradores suaves"],
      pacing: [
        "Niza está hecha para caminar lento. Un punto clave por día y mucho tiempo en el paseo marítimo.",
        "Separa el casco viejo y la costa en días distintos para evitar acumulación de visitas.",
        "Deja el último día para un mirador corto y descanso en la playa.",
      ],
      hero: {
        title: "Niza en 3 días",
        subtitle:
          "Paseos marítimos, calles del casco viejo y miradores tranquilos con ritmo calmado.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Promenade_des_Anglais_(Nice).jpg",
          alt: "Costa de Niza con mar azul y paseo marítimo.",
        },
      },
      cityStats: [
        { value: "Promenade", label: "Paseos largos junto al mar" },
        { value: "Casco viejo", label: "Centro histórico compacto" },
        { value: "Miradores", label: "Subidas cortas con vistas" },
        { value: "Mercados", label: "Paradas fáciles por la mañana" },
      ],
      fit: {
        forYou: [
          "Mezcla de playa y ciudad",
          "Caminatas cortas",
          "Cafés en el casco viejo",
          "Ritmo pausado",
          "Miradores accesibles",
        ],
        notForYou: [
          "Vida nocturna intensa",
          "Excursiones largas",
          "Solo museos",
          "Ritmo acelerado",
          "Compras como prioridad",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo y mercados",
          summary: "Calles antiguas y mercados locales.",
          morning: "Calles del casco viejo y Cours Saleya",
          afternoon: "Paseo por la Promenade des Anglais",
          evening: "Cena en el casco viejo y paseo corto",
        },
        {
          day: 2,
          title: "Mar y miradores",
          summary: "Paseo marítimo y vista panorámica.",
          morning: "Promenade des Anglais",
          afternoon: "Mirador de Castle Hill",
          evening: "Atardecer junto al agua",
        },
        {
          day: 3,
          title: "Barrios tranquilos",
          summary: "Calles calmadas y cafés.",
          morning: "Paseo por el puerto",
          afternoon: "Café largo y tiendas pequeñas",
          evening: "Vuelta suave por el paseo marítimo",
        },
      ],
      imageInfoCards: [
        {
          title: "Paseo marítimo",
          description:
            "La Promenade des Anglais es el hilo conductor del ritmo calmado.",
          image: {
            src: "https://images.unsplash.com/photo-1506807803488-8eafc15323a8?auto=format&fit=crop&w=1200&q=80",
            alt: "Promenade des Anglais en Niza con el mar azul.",
          },
        },
        {
          title: "Calles del casco viejo",
          description:
            "Calles cortas y sombrías para caminar sin prisa.",
          image: {
            src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
            alt: "Calle del casco viejo en Niza.",
          },
        },
        {
          title: "Miradores suaves",
          description:
            "Un ascenso corto ofrece vistas amplias sin gran esfuerzo.",
          image: {
            src: "https://images.unsplash.com/photo-1501869150797-9bbb64f78222?auto=format&fit=crop&w=1200&q=80",
            alt: "Vista de la costa de Niza desde un mirador.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre" },
        { label: "Traslado aeropuerto", value: "Tranvía o taxi al centro" },
        { label: "Transporte", value: "Camina el centro; tranvía si hace falta" },
        { label: "Entradas", value: "Reserva museos en temporada alta" },
        { label: "Zona para alojarte", value: "Casco viejo o Promenade" },
      ],
      checklist: [
        "Protector solar para paseos",
        "Calzado cómodo para caminar",
        "Mapa offline del casco viejo",
        "Pausa larga en la playa",
        "Capa ligera para la noche",
        "Efectivo pequeño para mercados",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Niza?",
          answer:
            "Sí. Tres días alcanzan para casco viejo, paseo marítimo y mirador.",
        },
        {
          question: "¿Niza es caminable?",
          answer:
            "Sí. El centro es compacto y el paseo marítimo es plano.",
        },
        {
          question: "¿Conviene subir a Castle Hill?",
          answer:
            "Sí por las vistas. La subida es corta y manejable.",
        },
        {
          question: "¿Dónde conviene alojarse?",
          answer:
            "El casco viejo es céntrico; la Promenade queda junto al mar.",
        },
        {
          question: "¿Necesito excursiones?",
          answer:
            "No para esta guía. El foco es mantener un ritmo calmado en Niza.",
        },
        {
          question: "¿Qué ritmo funciona mejor?",
          answer:
            "Un área principal por día y paseos largos junto al mar.",
        },
        {
          question: "¿Es buen destino para primer viaje?",
          answer:
            "Sí. La ciudad es compacta y fácil de recorrer sin prisa.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos y cultura de café.",
        },
        {
          slug: "florence",
          city: "Florencia",
          days: 3,
          description: "Arte y paseos junto al río.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Paseos junto al mar con ritmo relajado.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    warsaw: {
      slug: "warsaw",
      city: "Varsovia",
      country: "Polonia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Caminantes urbanos"],
      style: ["Casco viejo histórico", "Distritos modernos", "Paseos junto al río"],
      pacing: [
        "Varsovia recompensa un ritmo calmado. El casco viejo reconstruido centra el primer día, luego explora barrios modernos y paseos junto al río que muestran la historia en capas de la ciudad.",
        "Agrupa los lugares por zona para minimizar el transporte. El casco viejo y el Castillo Real funcionan como una caminata, mientras el centro moderno y el frente del Vístula ofrecen un ritmo diferente con parques y arquitectura contemporánea.",
        "Reserva tiempo para el Parque Lazienki y la zona del Palacio de la Cultura, donde puedes relajarte con espacios verdes, cafés tranquilos y vistas que abarcan desde Varsovia histórica hasta moderna.",
      ],
      hero: {
        title: "Varsovia en 3 días",
        subtitle:
          "Explora el casco viejo reconstruido, distritos modernos y paseos junto al río con un ritmo calmado y práctico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80",
          alt: "Edificios históricos coloridos en la Plaza del Casco Viejo de Varsovia.",
        },
      },
      cityStats: [
        { value: "1,8M", label: "Habitantes en el área metropolitana" },
        { value: "18", label: "Distritos en la ciudad" },
        { value: "85%", label: "Ciudad reconstruida tras la Segunda Guerra Mundial" },
        { value: "30+", label: "Museos y galerías" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con contrastes históricos y modernos",
          "Rutas caminables con barrios claros",
          "Mezcla de historia y cultura contemporánea",
          "Paseos junto al río y tiempo en parques",
          "Planificación clara y práctica",
        ],
        notForYou: [
          "Excursiones fuera de la ciudad",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de aventura o senderismo",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo y Castillo Real",
          summary: "Centro histórico reconstruido y terrenos del castillo.",
          morning: "Plaza del Casco Viejo y Plaza del Mercado",
          afternoon: "Castillo Real y Plaza del Castillo",
          evening: "Paseo junto al río Vístula",
        },
        {
          day: 2,
          title: "Centro moderno y cultura",
          summary: "Distritos contemporáneos y sitios culturales.",
          morning: "Zona del Palacio de la Cultura y centro moderno",
          afternoon: "Museo del Alzamiento de Varsovia o Museo POLIN",
          evening: "Calle Nowy Swiat y parada en café",
        },
        {
          day: 3,
          title: "Parques y miradores",
          summary: "Espacios verdes y vistas de la ciudad.",
          morning: "Parque Lazienki y Palacio sobre el Agua",
          afternoon: "Palacio de Wilanow o más tiempo en el parque",
          evening: "Bulevares del Vístula y vistas al atardecer",
        },
      ],
      imageInfoCards: [
        {
          title: "El casco viejo reconstruido",
          description:
            "El centro histórico de Varsovia fue meticulosamente reconstruido tras la Segunda Guerra Mundial. Las fachadas coloridas y las plazas adoquinadas se sienten auténticas a pesar de estar reconstruidas.",
          image: {
            src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80",
            alt: "Edificios históricos y calles adoquinadas en el Casco Viejo de Varsovia.",
          },
        },
        {
          title: "Capas modernas e históricas",
          description:
            "La ciudad combina historia reconstruida con arquitectura contemporánea. Caminatas cortas revelan ambas épocas lado a lado.",
          image: {
            src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80",
            alt: "Horizonte de Varsovia mostrando edificios modernos e históricos.",
          },
        },
        {
          title: "Ribera y parques",
          description:
            "El frente del río Vístula y el Parque Lazienki ofrecen pausas tranquilas de las calles de la ciudad, con caminatas fáciles y espacios verdes.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Parque Lazienki con palacio y jardines en Varsovia.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Tren a Estación Central o taxi" },
        { label: "Consejos de transporte", value: "Camina el casco viejo; usa tranvías para el centro moderno" },
        { label: "Entradas", value: "Reserva el Castillo Real y museos principales con antelación" },
        { label: "Zona para alojarse", value: "Área del casco viejo o centro moderno" },
      ],
      checklist: [
        "Reserva horario para el Castillo Real",
        "Reserva el Museo del Alzamiento de Varsovia si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Varsovia",
        "Planifica una pausa diaria en parque o ribera",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Varsovia?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco viejo, centro moderno y parques clave con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar museos?",
          answer:
            "Para el Castillo Real y museos populares como el Museo del Alzamiento de Varsovia, sí. Reservar con antelación ayuda a evitar filas y mantener tu plan.",
        },
        {
          question: "¿Es Varsovia caminable?",
          answer:
            "El casco viejo es muy caminable, y el centro moderno se conecta bien a pie. Usa tranvías o metro para trayectos más largos al Parque Lazienki o Wilanow.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El área del casco viejo te mantiene cerca de lugares históricos y paseos nocturnos, mientras el centro moderno ofrece opciones más contemporáneas con buenas conexiones de transporte.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano en días de museos para evitar multitudes. El casco viejo es agradable por la mañana, y puedes relajarte con un almuerzo largo y tarde tranquila.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Mantén una o dos reservas, luego deja el resto flexible.",
        },
        {
          question: "¿El casco viejo realmente está reconstruido?",
          answer:
            "Sí, el casco viejo fue reconstruido tras la Segunda Guerra Mundial usando documentos históricos y pinturas. Ahora es Patrimonio de la Humanidad de la UNESCO y se siente auténtico a pesar de estar reconstruido.",
        },
      ],
      relatedItineraries: [
        {
          slug: "krakow",
          city: "Cracovia",
          days: 3,
          description: "Casco viejo histórico y colina del castillo.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Plaza del Casco Viejo y vistas del castillo.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio y colinas históricas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    granada: {
      slug: "granada",
      city: "Granada",
      country: "España",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Vistas de montaña"],
      style: ["Palacio de la Alhambra", "Barrios históricos", "Arquitectura morisca"],
      pacing: [
        "Granada recompensa un enfoque centrado. La Alhambra merece una mañana completa, luego explora el Albaicín y Sacromonte para barrios históricos y vistas de montaña.",
        "Reserva entradas para la Alhambra con mucha antelación—esto es esencial. Planifica un día completo alrededor del complejo del palacio, luego usa los otros días para los barrios antiguos y paseos relajados.",
        "Los callejones estrechos y miradores del Albaicín combinan bien con tardes tranquilas. Reserva tiempo para tapas por la noche, donde brilla la cultura gastronómica de Granada.",
      ],
      hero: {
        title: "Granada en 3 días",
        subtitle:
          "Explora la Alhambra, el barrio histórico del Albaicín y vistas de montaña con un ritmo calmado y práctico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1759434613657-422a87ff991a?auto=format&fit=crop&w=1600&q=80",
          alt: "El complejo del palacio de la Alhambra con montañas al fondo.",
        },
      },
      cityStats: [
        { value: "230K", label: "Habitantes en la ciudad" },
        { value: "800+", label: "Años de historia morisca" },
        { value: "3M+", label: "Visitantes al año" },
        { value: "1", label: "Sitio Patrimonio de la Humanidad UNESCO" },
      ],
      fit: {
        forYou: [
          "Un primer viaje centrado en la Alhambra",
          "Barrios históricos y miradores",
          "Vistas de montaña y caminatas fáciles",
          "Arquitectura y cultura morisca",
          "Un plan claro con reserva anticipada",
        ],
        notForYou: [
          "Excursiones fuera de Granada",
          "Plan de vida nocturna",
          "Un plan sin reserva para la Alhambra",
          "Actividades de playa o costa",
          "Tiempo extenso de compras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "La Alhambra",
          summary: "Día completo explorando el complejo del palacio.",
          morning: "Entrada a la Alhambra y Palacios Nazaríes",
          afternoon: "Jardines del Generalife y Alcazaba",
          evening: "Mirador del Albaicín y tapas",
        },
        {
          day: 2,
          title: "Albaicín y Sacromonte",
          summary: "Barrios históricos y vistas de montaña.",
          morning: "Barrio del Albaicín y callejones estrechos",
          afternoon: "Mirador de San Nicolás y miradores",
          evening: "Área de Sacromonte o más exploración del Albaicín",
        },
        {
          day: 3,
          title: "Catedral y centro de la ciudad",
          summary: "Centro histórico y paseos relajados.",
          morning: "Catedral de Granada y Capilla Real",
          afternoon: "Mercado de la Alcaicería y calles comerciales",
          evening: "Última ruta de tapas y paseo nocturno",
        },
      ],
      imageInfoCards: [
        {
          title: "El complejo de la Alhambra",
          description:
            "El palacio, jardines y fortaleza forman uno de los sitios más visitados de España. Reserva entradas semanas antes para tu horario preferido.",
          image: {
            src: "https://images.unsplash.com/photo-1555993536-48e0c8b73fd4?auto=format&fit=crop&w=1200&q=80",
            alt: "Arquitectura morisca intrincada en los Palacios Nazaríes de la Alhambra.",
          },
        },
        {
          title: "Miradores del Albaicín",
          description:
            "El barrio histórico ofrece callejones estrechos y miradores que enmarcan la Alhambra contra las montañas de Sierra Nevada.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Barrio histórico del Albaicín con casas blancas y calles estrechas.",
          },
        },
        {
          title: "Fondo de montaña",
          description:
            "Granada se sitúa al pie de Sierra Nevada, creando vistas dramáticas desde el Albaicín y los terrenos de la Alhambra.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Ciudad de Granada con las montañas de Sierra Nevada al fondo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Autobús al centro de la ciudad o taxi" },
        { label: "Consejos de transporte", value: "Camina el centro histórico; usa autobuses para la Alhambra" },
        { label: "Entradas", value: "Reserva entradas para la Alhambra semanas antes" },
        { label: "Zona para alojarse", value: "Centro de la ciudad o área del Albaicín" },
      ],
      checklist: [
        "Reserva entradas para la Alhambra semanas antes",
        "Reserva horario para los Palacios Nazaríes",
        "Empaca zapatos cómodos para colinas",
        "Guarda mapas offline para Granada",
        "Planifica una parada diaria en mirador",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Granada?",
          answer:
            "Sí para la Alhambra y los barrios históricos principales. Este plan dedica un día completo al palacio, luego cubre el Albaicín y el centro de la ciudad con un ritmo calmado.",
        },
        {
          question: "¿Necesito reservar la Alhambra con antelación?",
          answer:
            "Absolutamente sí. Reserva entradas semanas antes, especialmente en temporada alta. Los Palacios Nazaríes requieren un horario específico que se agota rápidamente.",
        },
        {
          question: "¿Es Granada caminable?",
          answer:
            "El centro histórico es caminable, pero el Albaicín tiene colinas empinadas. Usa zapatos cómodos y toma descansos. La Alhambra requiere autobús o taxi desde el centro.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro de la ciudad te mantiene cerca de la catedral y restaurantes, mientras el Albaicín ofrece ambiente histórico y vistas, aunque con caminatas más empinadas.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para la Alhambra para aprovechar al máximo tu horario. Para el Albaicín, las mañanas son más frescas y menos concurridas.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para lugares de tapas populares, sí—especialmente por la noche. La cultura de tapas de Granada es fuerte, así que planifica algunas paradas pero deja margen para espontaneidad.",
        },
        {
          question: "¿Puedo visitar la Alhambra sin reserva anticipada?",
          answer:
            "Es muy difícil, especialmente en temporada alta. Las entradas del mismo día son raras. Reserva con mucha antelación para asegurar tu fecha y horario preferidos.",
        },
      ],
      relatedItineraries: [
        {
          slug: "seville",
          city: "Sevilla",
          days: 3,
          description: "Plazas históricas y paseos junto al río.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi y barrios caminables.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Museos, parques y plazas clásicas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    lyon: {
      slug: "lyon",
      city: "Lyon",
      country: "Francia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de la comida", "Entusiastas de historia", "Caminantes junto al río"],
      style: ["Historia romana", "Gastronomía", "Barrios junto al río"],
      pacing: [
        "Lyon recompensa un enfoque centrado en la comida. El histórico Vieux Lyon centra el primer día, luego explora la Presqu'ile y Fourviere para sitios romanos y paseos junto al río.",
        "Agrupa el tiempo por barrio para mantener el viaje simple. Vieux Lyon combina con la Colina de Fourviere para historia, mientras la Presqu'ile ofrece compras, mercados y vistas fáciles del río.",
        "Reserva tiempo para comidas largas y visitas a mercados. Los bouchons y mercados de comida de Lyon son parte de la experiencia, así que planifica almuerzos y cenas relajados.",
      ],
      hero: {
        title: "Lyon en 3 días",
        subtitle:
          "Explora historia romana, gastronomía y barrios junto al río con un ritmo calmado centrado en la comida.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1530282279139-9cfdae52582f?auto=format&fit=crop&w=1600&q=80",
          alt: "Vieux Lyon histórico con edificios renacentistas y calles estrechas.",
        },
      },
      cityStats: [
        { value: "500K", label: "Habitantes en la ciudad" },
        { value: "2.000+", label: "Años de historia" },
        { value: "4.000+", label: "Restaurantes y bouchons" },
        { value: "2", label: "Ríos: Ródano y Saona" },
      ],
      fit: {
        forYou: [
          "Una visita centrada en la comida con historia",
          "Paseos junto al río y sitios romanos",
          "Barrios históricos y mercados",
          "Mezcla de cultura y gastronomía",
          "Planificación clara y práctica",
        ],
        notForYou: [
          "Excursiones fuera de Lyon",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Actividades de playa o costa",
          "Tiempo extenso de compras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Vieux Lyon y Fourviere",
          summary: "Barrio histórico y basílica en la colina.",
          morning: "Vieux Lyon y traboules",
          afternoon: "Basílica de Fourviere y teatros romanos",
          evening: "Paseo junto al río y cena en bouchon",
        },
        {
          day: 2,
          title: "Presqu'ile y mercados",
          summary: "Centro de la ciudad y mercados de comida.",
          morning: "Presqu'ile y Plaza Bellecour",
          afternoon: "Mercado Les Halles o calles comerciales",
          evening: "Frente del Ródano y luces nocturnas",
        },
        {
          day: 3,
          title: "Museos y ribera",
          summary: "Sitios culturales y paseos relajados.",
          morning: "Museo de Bellas Artes o Museo Confluence",
          afternoon: "Paseo junto al río Saona",
          evening: "Última comida en bouchon y paseo por el casco viejo",
        },
      ],
      imageInfoCards: [
        {
          title: "Traboules históricos",
          description:
            "Los pasadizos ocultos de Vieux Lyon conectan calles y patios. Estos atajos de la era renacentista son únicos de Lyon.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Pasadizo traboule histórico en Vieux Lyon.",
          },
        },
        {
          title: "Vistas junto al río",
          description:
            "Los ríos Ródano y Saona enmarcan la ciudad. Los paseos junto al río ofrecen vistas de arquitectura histórica y moderna.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Paisaje urbano de Lyon con los ríos Ródano y Saona.",
          },
        },
        {
          title: "Mercados de comida y bouchons",
          description:
            "La cultura gastronómica de Lyon se centra en bouchons y mercados. Planifica tiempo para comidas largas y visitas a mercados.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Mercado de comida colorido en Lyon con productos frescos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Tranvía Rhonexpress o taxi" },
        { label: "Consejos de transporte", value: "Camina Vieux Lyon; usa metro para Fourviere" },
        { label: "Entradas", value: "Reserva museos principales con antelación si visitas" },
        { label: "Zona para alojarse", value: "Vieux Lyon o Presqu'ile" },
      ],
      checklist: [
        "Reserva mesas en restaurantes para bouchons",
        "Reserva museos principales si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Lyon",
        "Planifica una comida larga diaria",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Lyon?",
          answer:
            "Sí para lo esencial. Este plan cubre Vieux Lyon, Fourviere y la Presqu'ile con tiempo para mercados de comida y comidas relajadas.",
        },
        {
          question: "¿Necesito reservar restaurantes?",
          answer:
            "Para bouchons populares, sí—especialmente en fines de semana. La escena gastronómica de Lyon está ocupada, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Es Lyon caminable?",
          answer:
            "Vieux Lyon y la Presqu'ile son muy caminables. La Colina de Fourviere requiere una subida o funicular, pero el centro histórico es plano y fácil.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Vieux Lyon te mantiene en el corazón histórico, mientras la Presqu'ile ofrece ubicación central con fácil acceso a mercados y compras.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Fourviere para evitar multitudes y calor. Vieux Lyon es agradable por la mañana, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar museos?",
          answer:
            "Para museos populares como el Museo de Bellas Artes, reservar ayuda en temporada alta. Verifica con antelación para exposiciones especiales.",
        },
        {
          question: "¿Qué son los traboules?",
          answer:
            "Los traboules son pasadizos ocultos que conectan calles a través de edificios y patios. Son únicos de Lyon y vale la pena explorarlos en Vieux Lyon.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos y cultura de café.",
        },
        {
          slug: "nice",
          city: "Niza",
          days: 3,
          description: "Paseos junto al mar y callejones del casco viejo.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi y barrios caminables.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    salzburg: {
      slug: "salzburg",
      city: "Salzburgo",
      country: "Austria",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de música", "Vistas de montaña", "Arquitectura histórica"],
      style: ["Edificios barrocos", "Fondo de montaña", "Patrimonio musical"],
      pacing: [
        "Salzburgo recompensa un ritmo calmado. El casco viejo y la fortaleza centran el primer día, luego explora jardines de palacios y miradores de montaña que muestran la elegancia barroca de la ciudad.",
        "Agrupa los lugares por área para minimizar caminar. El compacto casco viejo se conecta fácilmente, mientras el Palacio Mirabell y jardines ofrecen un ritmo diferente con espacios verdes y vistas del río.",
        "Reserva tiempo para paseos lentos junto al río Salzach y momentos tranquilos en las plazas del casco viejo. La arquitectura barroca y el fondo de montaña de la ciudad crean una atmósfera pacífica.",
      ],
      hero: {
        title: "Salzburgo en 3 días",
        subtitle:
          "Explora el casco viejo barroco, fortaleza y vistas de montaña con un ritmo calmado y práctico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1750419594123-c2623bab7320?auto=format&fit=crop&w=1600&q=80",
          alt: "Casco viejo de Salzburgo con edificios barrocos y montañas al fondo.",
        },
      },
      cityStats: [
        { value: "150K", label: "Habitantes en la ciudad" },
        { value: "1.000+", label: "Años de historia" },
        { value: "7", label: "Colinas que rodean la ciudad" },
        { value: "1", label: "Sitio Patrimonio de la Humanidad UNESCO" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con arquitectura barroca",
          "Vistas de montaña y caminatas fáciles",
          "Patrimonio musical y sitios históricos",
          "Casco viejo compacto y caminable",
          "Planificación clara y práctica",
        ],
        notForYou: [
          "Excursiones fuera de Salzburgo",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Actividades de playa o costa",
          "Tiempo extenso de compras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco viejo y fortaleza",
          summary: "Centro histórico y castillo en la colina.",
          morning: "Fortaleza Hohensalzburg y funicular",
          afternoon: "Plazas del casco viejo y Getreidegasse",
          evening: "Paseo junto al río Salzach y cena",
        },
        {
          day: 2,
          title: "Palacios y jardines",
          summary: "Palacios barrocos y espacios verdes.",
          morning: "Palacio Mirabell y jardines",
          afternoon: "Palacio Hellbrunn o más tiempo en jardines",
          evening: "Paseo junto al río y luces nocturnas",
        },
        {
          day: 3,
          title: "Patrimonio musical y vistas",
          summary: "Sitios de Mozart y miradores de montaña.",
          morning: "Casa Natal de Mozart o Residencia",
          afternoon: "Mirador Kapuzinerberg o paseo por el casco viejo",
          evening: "Último paseo por el casco viejo y parada en café",
        },
      ],
      imageInfoCards: [
        {
          title: "Casco viejo barroco",
          description:
            "El centro histórico de Salzburgo presenta arquitectura barroca, callejones estrechos y plazas que se sienten como entrar a otra época.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Catedral de Salzburgo con arquitectura barroca.",
          },
        },
        {
          title: "Fondo de montaña",
          description:
            "La ciudad se sitúa al pie de los Alpes, creando vistas dramáticas desde la fortaleza y el frente del río que enmarcan la arquitectura barroca.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Salzburgo con montañas al fondo.",
          },
        },
        {
          title: "Vistas de la fortaleza",
          description:
            "La Fortaleza Hohensalzburg ofrece vistas panorámicas de la ciudad y montañas. El funicular hace la subida fácil.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Fortaleza Hohensalzburg con vista a Salzburgo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús al centro de la ciudad o taxi" },
        { label: "Consejos de transporte", value: "Camina el casco viejo; usa funicular para la fortaleza" },
        { label: "Entradas", value: "Reserva la fortaleza y museos principales con antelación" },
        { label: "Zona para alojarse", value: "Área del casco viejo o cerca de Mirabell" },
      ],
      checklist: [
        "Reserva entradas para la Fortaleza Hohensalzburg",
        "Reserva museos principales si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Salzburgo",
        "Planifica una parada diaria en mirador",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Salzburgo?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco viejo, fortaleza y palacios con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar la fortaleza?",
          answer:
            "Reservar ayuda a evitar filas, especialmente en temporada alta. Las entradas para el funicular y la fortaleza se pueden comprar con antelación o al llegar.",
        },
        {
          question: "¿Es Salzburgo caminable?",
          answer:
            "El casco viejo es muy compacto y caminable. La fortaleza requiere un viaje en funicular, pero el centro histórico es plano y fácil de navegar.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El área del casco viejo te mantiene cerca de lugares históricos y paseos nocturnos, mientras áreas cerca de Mirabell ofrecen calles más tranquilas con fácil acceso a jardines.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para la fortaleza para evitar multitudes y obtener las mejores vistas. El casco viejo es agradable por la mañana, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Salzburgo está ocupada, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Es Salzburgo bueno para amantes de música?",
          answer:
            "Sí. La ciudad es el lugar de nacimiento de Mozart y ofrece varios sitios relacionados con música, conciertos y un fuerte patrimonio musical en todo el casco viejo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Museos clásicos y jardines de palacios.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Plaza del Casco Viejo y vistas del castillo.",
        },
        {
          slug: "munich",
          city: "Múnich",
          days: 3,
          description: "Plazas históricas y pausas en jardines.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    rotterdam: {
      slug: "rotterdam",
      city: "Róterdam",
      country: "Países Bajos",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Aficionados a arquitectura", "Diseño moderno", "Caminantes junto al agua"],
      style: ["Arquitectura moderna", "Paseos junto al agua", "Distritos culturales"],
      pacing: [
        "Róterdam recompensa un enfoque moderno. El centro de la ciudad reconstruido muestra arquitectura innovadora, luego explora distritos junto al agua y áreas culturales que muestran el carácter contemporáneo de la ciudad.",
        "Agrupa los lugares por área para mantener el viaje simple. El centro moderno y el Markthal funcionan como una caminata, mientras el frente del agua y las Casas Cubo ofrecen un ritmo diferente con puentes y diseño contemporáneo.",
        "Reserva tiempo para paseos lentos junto al río Maas y momentos tranquilos en los parques. La arquitectura moderna y el frente del agua de la ciudad crean una atmósfera pacífica y con visión de futuro.",
      ],
      hero: {
        title: "Róterdam en 3 días",
        subtitle:
          "Explora arquitectura moderna, paseos junto al agua y distritos culturales con un ritmo calmado y práctico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1619768708936-2fce8c74cd04?auto=format&fit=crop&w=1600&q=80",
          alt: "Horizonte moderno de Róterdam con arquitectura innovadora y puentes.",
        },
      },
      cityStats: [
        { value: "650K", label: "Habitantes en la ciudad" },
        { value: "85%", label: "Ciudad reconstruida tras la Segunda Guerra Mundial" },
        { value: "1.000+", label: "Puntos de referencia arquitectónicos modernos" },
        { value: "1", label: "Puerto más grande de Europa" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con arquitectura moderna",
          "Paseos junto al agua y puentes",
          "Diseño y cultura contemporáneos",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
        ],
        notForYou: [
          "Excursiones fuera de Róterdam",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Ambiente de casco viejo histórico",
          "Tiempo extenso de compras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro moderno y Markthal",
          summary: "Arquitectura contemporánea y mercado de comida.",
          morning: "Markthal y centro moderno",
          afternoon: "Casas Cubo y área Overblaak",
          evening: "Paseo junto al río Maas",
        },
        {
          day: 2,
          title: "Frente del agua y puentes",
          summary: "Puente Erasmus y distritos junto al río.",
          morning: "Puente Erasmus y Kop van Zuid",
          afternoon: "Museo Marítimo o más frente del agua",
          evening: "Paseo junto al río y luces nocturnas",
        },
        {
          day: 3,
          title: "Museos y parques",
          summary: "Sitios culturales y espacios verdes.",
          morning: "Museo Boijmans Van Beuningen o Kunsthal",
          afternoon: "Het Park o mirador Euromast",
          evening: "Último paseo junto al agua y cena",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura moderna",
          description:
            "El centro de la ciudad reconstruido de Róterdam presenta edificios innovadores, puentes y diseño contemporáneo que lo distingue de otras ciudades holandesas.",
          image: {
            src: "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
            alt: "Casas Cubo icónicas en Róterdam con arquitectura moderna.",
          },
        },
        {
          title: "Paseos junto al agua",
          description:
            "El río Maas y los distritos junto al agua ofrecen paseos tranquilos con vistas de arquitectura moderna y puentes.",
          image: {
            src: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            alt: "Puente Erasmus cruzando el río Maas en Róterdam.",
          },
        },
        {
          title: "Distritos culturales",
          description:
            "Los museos y áreas culturales de la ciudad se combinan con arquitectura moderna, creando una escena cultural con visión de futuro.",
          image: {
            src: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
            alt: "Mercado de comida moderno Markthal en Róterdam.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Tren a Estación Central o taxi" },
        { label: "Consejos de transporte", value: "Camina el centro; usa tranvías para el frente del agua" },
        { label: "Entradas", value: "Reserva museos principales con antelación si visitas" },
        { label: "Zona para alojarse", value: "Centro de la ciudad o cerca del Markthal" },
      ],
      checklist: [
        "Reserva entradas para museos principales si visitas",
        "Reserva restaurantes para lugares populares",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Róterdam",
        "Planifica un paseo diario junto al agua",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Róterdam?",
          answer:
            "Sí para lo esencial. Este plan cubre el centro moderno, frente del agua y sitios culturales clave con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar museos?",
          answer:
            "Para museos populares como el Museo Boijmans Van Beuningen, reservar ayuda en temporada alta. Verifica con antelación para exposiciones especiales.",
        },
        {
          question: "¿Es Róterdam caminable?",
          answer:
            "El centro moderno es muy caminable, y el frente del agua se conecta bien a pie. Usa tranvías o metro para trayectos más largos a museos o Euromast.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro de la ciudad te mantiene cerca del Markthal y arquitectura moderna, mientras áreas cerca del frente del agua ofrecen vistas del río y fácil acceso a puentes.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano en días de museos para evitar multitudes. El Markthal es agradable por la mañana, y puedes relajarte con un almuerzo largo y tarde tranquila.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Róterdam está ocupada, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Róterdam es diferente de Ámsterdam?",
          answer:
            "Sí. Róterdam es más moderna y arquitectónica, reconstruida tras la Segunda Guerra Mundial con diseño contemporáneo. Ámsterdam tiene más canales históricos y edificios antiguos.",
        },
      ],
      relatedItineraries: [
        {
          slug: "amsterdam",
          city: "Ámsterdam",
          days: 3,
          description: "Canales, museos y barrios históricos.",
        },
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos junto al agua y diseño.",
        },
        {
          slug: "berlin",
          city: "Berlín",
          days: 3,
          description: "Historia y barrios creativos.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bergen: {
      slug: "bergen",
      city: "Bergen",
      country: "Noruega",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de fiordos", "Primer viaje", "Caminantes de montaña"],
      style: ["Muelle histórico", "Vistas de montaña", "Paseos junto al agua"],
      pacing: [
        "Bergen recompensa un ritmo calmado. Ancla cada día con un área principal—el histórico Bryggen, un mirador de montaña o un paseo junto al agua—y luego deja tiempo para cafés, mercados y exploración lenta.",
        "El centro compacto facilita agrupar lugares. El centro histórico y Bryggen funcionan como una caminata, mientras la montaña Fløyen ofrece un ritmo diferente con vistas y naturaleza.",
        "Reserva tiempo para el mercado de pescado y momentos tranquilos junto al puerto. El tamaño compacto de la ciudad y el entorno del fiordo crean una atmósfera pacífica y manejable.",
      ],
      hero: {
        title: "Bergen en 3 días",
        subtitle:
          "Explora muelle histórico, miradores de montaña y vistas del fiordo con un ritmo calmado y caminable.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryggen_in_Bergen.jpg",
          alt: "Muelle histórico Bryggen en Bergen con edificios de madera coloridos.",
        },
      },
      cityStats: [
        { value: "280K", label: "Habitantes en la ciudad" },
        { value: "7", label: "Montañas que rodean la ciudad" },
        { value: "900+", label: "Años de historia" },
        { value: "1.2M", label: "Visitantes al año" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con vistas del fiordo",
          "Muelle histórico y caminatas de montaña",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Tiempo junto al agua y mercado",
        ],
        notForYou: [
          "Excursiones fuera de Bergen",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Expediciones largas de senderismo",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Bryggen histórico y centro",
          summary: "Muelle colorido y paseos por el casco antiguo.",
          morning: "Muelle Bryggen y edificios históricos",
          afternoon: "Mercado de pescado y área del puerto",
          evening: "Paseo junto al agua y cena",
        },
        {
          day: 2,
          title: "Montaña Fløyen",
          summary: "Vistas de montaña y caminatas por la naturaleza.",
          morning: "Funicular Fløyen y vistas desde la cumbre",
          afternoon: "Senderos de montaña o regreso al centro",
          evening: "Paseo por el casco antiguo y cafés",
        },
        {
          day: 3,
          title: "Museos y frente del agua",
          summary: "Sitios culturales y vistas del puerto.",
          morning: "Museo Hanseático o Fortaleza Bergenhus",
          afternoon: "Paseo junto al agua y parques",
          evening: "Último paseo por el puerto y vistas al atardecer",
        },
      ],
      imageInfoCards: [
        {
          title: "Muelle histórico",
          description:
            "Los edificios de madera coloridos de Bryggen son Patrimonio de la Humanidad, ofreciendo un vistazo al pasado comercial de Bergen.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bryggen_bergen_2005_2.jpg",
            alt: "Edificios de madera coloridos del muelle Bryggen en Bergen.",
          },
        },
        {
          title: "Miradores de montaña",
          description:
            "Fløyen y otras montañas circundantes ofrecen fácil acceso a vistas panorámicas del fiordo y la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bergen_from_Floyen.jpg",
            alt: "Vista de la ciudad de Bergen y el fiordo desde la montaña Fløyen.",
          },
        },
        {
          title: "Vida junto al agua",
          description:
            "El puerto y el mercado de pescado crean una atmósfera animada y auténtica con mariscos frescos y cultura local.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bergen_fish_market.jpg",
            alt: "Mercado de pescado de Bergen con vendedores y mariscos frescos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el centro; funicular para Fløyen" },
        { label: "Entradas", value: "Reserva funicular Fløyen con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Centro de la ciudad cerca de Bryggen" },
      ],
      checklist: [
        "Reserva entradas para funicular Fløyen",
        "Empaca capas para clima de montaña",
        "Guarda mapas offline para Bergen",
        "Planifica una caminata de montaña",
        "Visita el mercado de pescado",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Bergen?",
          answer:
            "Sí para lo esencial. Este plan cubre Bryggen, Fløyen y sitios culturales clave con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar el funicular Fløyen?",
          answer:
            "Reservar ayuda en temporada alta para evitar esperas. El funicular funciona con frecuencia, pero las entradas anticipadas pueden ahorrar tiempo.",
        },
        {
          question: "¿Es Bergen caminable?",
          answer:
            "El centro histórico es muy caminable, y el frente del agua se conecta bien a pie. Usa el funicular para acceso a la montaña Fløyen.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro de la ciudad cerca de Bryggen te mantiene cerca de sitios históricos y el puerto, con fácil acceso a restaurantes y cafés.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Fløyen para evitar multitudes y obtener vistas claras. El mercado de pescado es agradable por la mañana, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Bergen se centra en mariscos frescos, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Bergen es bueno para vistas del fiordo?",
          answer:
            "Sí. La ciudad se encuentra en un fiordo, y la montaña Fløyen ofrece excelentes vistas panorámicas del puerto y fiordos circundantes.",
        },
      ],
      relatedItineraries: [
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Paseos junto al agua y museos compactos.",
        },
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Encanto del casco antiguo e islas.",
        },
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos junto al agua y diseño.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bologna: {
      slug: "bologna",
      city: "Bolonia",
      country: "Italia",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Amantes de la comida", "Primer viaje", "Aficionados a ciudades universitarias"],
      style: ["Torres medievales", "Mercados de comida", "Plazas históricas"],
      pacing: [
        "Bolonia recompensa un enfoque centrado en la comida. Ancla cada día con un área principal—el centro histórico con sus torres, o el barrio universitario—y luego deja tiempo para comidas largas, paradas en mercados y paseos lentos.",
        "El centro compacto facilita agrupar lugares. Combina las Dos Torres con la Piazza Maggiore para lugares clásicos, luego explora los mercados de comida y el área universitaria para un ritmo diferente.",
        "Reserva tiempo para los mercados de comida y momentos tranquilos en los pórticos. La arquitectura medieval de la ciudad y la cultura gastronómica crean una atmósfera relajada y auténtica.",
      ],
      hero: {
        title: "Bolonia en 2 días",
        subtitle:
          "Explora torres medievales, mercados de comida y plazas históricas con un ritmo calmado y caminable.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bologna_-_Due_Torri.jpg",
          alt: "Dos Torres de Bolonia elevándose sobre el centro histórico de la ciudad.",
        },
      },
      cityStats: [
        { value: "390K", label: "Habitantes en la ciudad" },
        { value: "900+", label: "Años de historia" },
        { value: "38KM", label: "Pórticos en toda la ciudad" },
        { value: "1", label: "Universidad más antigua de Europa" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con arquitectura medieval",
          "Mercados de comida y cocina auténtica",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Ambiente de ciudad universitaria",
        ],
        notForYou: [
          "Excursiones fuera de Bolonia",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de playa o costeras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y torres",
          summary: "Dos Torres y Piazza Maggiore.",
          morning: "Dos Torres y centro histórico",
          afternoon: "Piazza Maggiore y Basílica de San Petronio",
          evening: "Área del mercado de comida y cena",
        },
        {
          day: 2,
          title: "Barrio universitario y mercados",
          summary: "Área universitaria y mercados de comida.",
          morning: "Barrio universitario y pórticos",
          afternoon: "Mercados de comida y tiendas locales",
          evening: "Paseo por el centro histórico y aperitivo",
        },
      ],
      imageInfoCards: [
        {
          title: "Torres medievales",
          description:
            "Las Dos Torres de Bolonia son símbolos icónicos de la ciudad, ofreciendo vistas y un vistazo a la arquitectura medieval.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Asinelli_e_Garisenda.jpg",
            alt: "Las Dos Torres de Bolonia, Asinelli y Garisenda, en el centro histórico.",
          },
        },
        {
          title: "Mercados de comida",
          description:
            "Los mercados de comida de Bolonia muestran el patrimonio culinario de la ciudad con productos frescos, pasta y especialidades locales.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercato_di_Mezzo_Bologna.jpg",
            alt: "Mercado de comida en Bolonia con productos frescos y especialidades locales.",
          },
        },
        {
          title: "Pórticos históricos",
          description:
            "El extenso sistema de pórticos de la ciudad proporciona paseos cubiertos en todo el centro histórico, único en Bolonia.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Portici_di_Bologna.jpg",
            alt: "Pórticos históricos en Bolonia que proporcionan pasajes cubiertos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o tren al centro" },
        { label: "Consejos de transporte", value: "Camina el centro; todo está cerca" },
        { label: "Entradas", value: "Reserva subida a las torres con antelación si visitas" },
        { label: "Zona para alojarse", value: "Centro histórico cerca de Piazza Maggiore" },
      ],
      checklist: [
        "Reserva subida a las Dos Torres si te interesa",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Bolonia",
        "Planifica tiempo para mercados de comida",
        "Prueba especialidades de pasta locales",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Bolonia?",
          answer:
            "Sí para lo esencial. Este plan cubre el centro histórico, torres y mercados de comida con un ritmo calmado que deja margen para comidas y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar las Dos Torres?",
          answer:
            "Reservar ayuda en temporada alta para evitar esperas. La subida a las torres ofrece grandes vistas pero requiere planificación anticipada.",
        },
        {
          question: "¿Es Bolonia caminable?",
          answer:
            "El centro histórico es muy caminable y compacto. Todo está a poca distancia caminando, y los pórticos proporcionan paseos cubiertos.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro histórico cerca de Piazza Maggiore te mantiene cerca de los lugares principales, mercados de comida y restaurantes.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para las torres para evitar multitudes y obtener vistas claras. Los mercados de comida son agradables por la mañana, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Bolonia es conocida por su comida, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Bolonia es buena para la comida?",
          answer:
            "Sí. Bolonia se considera la capital gastronómica de Italia, con excelentes mercados, pasta y cocina auténtica en toda la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "florence",
          city: "Florencia",
          days: 3,
          description: "Arte renacentista y paseos junto al río.",
        },
        {
          slug: "venice",
          city: "Venecia",
          days: 3,
          description: "Paseos por canales e iglesias clásicas.",
        },
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Monumentos antiguos y plazas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bruges: {
      slug: "bruges",
      city: "Brujas",
      country: "Bélgica",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Escapadas románticas", "Primer viaje", "Caminantes lentos"],
      style: ["Plazas medievales", "Paseos por canales", "Iglesias históricas"],
      pacing: [
        "Brujas recompensa un ritmo lento y romántico. Ancla cada día con un área principal—la histórica plaza Markt, o los distritos de canales más tranquilos—y luego deja tiempo para cafés, tiendas de chocolate y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el Markt con el Campanario para lugares clásicos, luego explora los canales y barrios más tranquilos para un ritmo diferente.",
        "Reserva tiempo para paseos en bote por los canales y momentos tranquilos en las plazas. La arquitectura medieval de la ciudad y los canales pacíficos crean una atmósfera relajada y atemporal.",
      ],
      hero: {
        title: "Brujas en 2 días",
        subtitle:
          "Explora plazas medievales, paseos por canales e iglesias históricas con un ritmo calmado y romántico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brugge_grote_markt.jpg",
          alt: "Plaza histórica Markt en Brujas con edificios medievales y la torre del Campanario.",
        },
      },
      cityStats: [
        { value: "118K", label: "Habitantes en la ciudad" },
        { value: "800+", label: "Años de historia" },
        { value: "50+", label: "Puentes sobre canales" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
      ],
      fit: {
        forYou: [
          "Una visita romántica y de ritmo lento",
          "Arquitectura medieval y canales",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Tiempo para cafés y tiendas de chocolate",
        ],
        notForYou: [
          "Excursiones fuera de Brujas",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Ambiente de ciudad moderna",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico y Markt",
          summary: "Plaza Markt y torre del Campanario.",
          morning: "Plaza Markt y torre del Campanario",
          afternoon: "Plaza Burg y edificios históricos",
          evening: "Paseo por canales y cena",
        },
        {
          day: 2,
          title: "Canales y distritos tranquilos",
          summary: "Paseos en bote por canales y barrios más tranquilos.",
          morning: "Paseo en bote por canales",
          afternoon: "Distritos de canales más tranquilos e iglesias",
          evening: "Último paseo por la plaza y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Plazas medievales",
          description:
            "Las plazas Markt y Burg de Brujas muestran arquitectura medieval con fachadas coloridas y edificios históricos.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bruges_Burg.jpg",
            alt: "Plaza histórica Burg en Brujas con arquitectura medieval.",
          },
        },
        {
          title: "Red de canales",
          description:
            "Los canales de la ciudad crean una atmósfera pacífica y romántica con puentes, cisnes y paseos tranquilos junto al agua.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bruges_canals.jpg",
            alt: "Canales pacíficos en Brujas con edificios históricos reflejados en el agua.",
          },
        },
        {
          title: "Iglesias históricas",
          description:
            "Las iglesias y campanarios de Brujas añaden al ambiente medieval, con interiores tranquilos y arte histórico.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Church_of_Our_Lady_Bruges.jpg",
            alt: "Iglesia de Nuestra Señora en Brujas con arquitectura histórica.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Tren desde Bruselas o Gante" },
        { label: "Consejos de transporte", value: "Camina por todas partes; el centro es compacto" },
        { label: "Entradas", value: "Reserva paseos por canales con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Centro histórico cerca del Markt" },
      ],
      checklist: [
        "Reserva paseo en bote por canales",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Brujas",
        "Planifica tiempo para cafés y chocolate",
        "Visita el Campanario si te interesa",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Brujas?",
          answer:
            "Sí para lo esencial. Este plan cubre el centro histórico, canales y lugares clave con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar paseos por canales?",
          answer:
            "Reservar ayuda en temporada alta para evitar esperas. Los paseos por canales son populares y ofrecen grandes vistas de la ciudad desde el agua.",
        },
        {
          question: "¿Es Brujas caminable?",
          answer:
            "El centro histórico es muy caminable y compacto. Todo está a poca distancia caminando, y los canales crean rutas naturales para caminar.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro histórico cerca del Markt te mantiene cerca de los lugares principales, restaurantes y cafés, con fácil acceso a todo.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para evitar multitudes en el Markt y el Campanario. Los canales son agradables durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Brujas se centra en la cocina belga, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Brujas está muy concurrida?",
          answer:
            "Brujas puede estar ocupada, especialmente en temporada alta. Empezar temprano y explorar distritos de canales más tranquilos ayuda a evitar las multitudes más grandes.",
        },
      ],
      relatedItineraries: [
        {
          slug: "brussels",
          city: "Bruselas",
          days: 3,
          description: "Grandes plazas y distritos de museos.",
        },
        {
          slug: "amsterdam",
          city: "Ámsterdam",
          days: 3,
          description: "Canales y barrios históricos.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco antiguo y vistas del castillo.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dubrovnik: {
      slug: "dubrovnik",
      city: "Dubrovnik",
      country: "Croacia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Primer viaje", "Caminantes costeros"],
      style: ["Murallas históricas", "Vistas del Adriático", "Paseos por el casco antiguo"],
      pacing: [
        "Dubrovnik recompensa un ritmo calmado y costero. Ancla cada día con un área principal—el histórico casco antiguo, las murallas de la ciudad, o una isla cercana—y luego deja tiempo para cafés, miradores y paseos lentos.",
        "El casco antiguo compacto facilita explorar a pie. Combina las murallas de la ciudad con la calle principal para lugares clásicos, luego explora calles más tranquilas y miradores para un ritmo diferente.",
        "Reserva tiempo para la isla Lokrum y momentos tranquilos a lo largo de las murallas. La arquitectura histórica de la ciudad y el entorno del Adriático crean una atmósfera relajada y escénica.",
      ],
      hero: {
        title: "Dubrovnik en 3 días",
        subtitle:
          "Explora murallas históricas, vistas del Adriático y paseos por el casco antiguo con un ritmo calmado y costero.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_Old_Town.jpg",
          alt: "Casco antiguo histórico de Dubrovnik con edificios de piedra y techos rojos con vistas al mar Adriático.",
        },
      },
      cityStats: [
        { value: "42K", label: "Habitantes en la ciudad" },
        { value: "1.940M", label: "Longitud de las murallas de la ciudad" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
        { value: "1.2M", label: "Visitantes al año" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con murallas históricas",
          "Vistas del Adriático y paseos costeros",
          "Casco antiguo compacto y caminable",
          "Planificación clara y práctica",
          "Excursiones de un día a islas",
        ],
        notForYou: [
          "Excursiones lejos de Dubrovnik",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades solo de playa",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y calle principal",
          summary: "Centro histórico y Stradun.",
          morning: "Entrada al casco antiguo y Stradun",
          afternoon: "Edificios históricos e iglesias",
          evening: "Paseo junto al agua y cena",
        },
        {
          day: 2,
          title: "Paseo por las murallas",
          summary: "Circuito de murallas y miradores.",
          morning: "Paseo por las murallas y miradores",
          afternoon: "Fuerte Lovrijenac o más murallas",
          evening: "Paseo por el casco antiguo y cafés",
        },
        {
          day: 3,
          title: "Isla Lokrum",
          summary: "Visita a la isla y naturaleza.",
          morning: "Barco a la isla Lokrum",
          afternoon: "Exploración de la isla y playas",
          evening: "Regreso al casco antiguo y vistas al atardecer",
        },
      ],
      imageInfoCards: [
        {
          title: "Murallas históricas",
          description:
            "Las murallas de Dubrovnik ofrecen vistas panorámicas del casco antiguo y el mar Adriático, creando una experiencia única para caminar.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_City_Walls.jpg",
            alt: "Murallas históricas de Dubrovnik con vistas del casco antiguo y el mar.",
          },
        },
        {
          title: "Calles del casco antiguo",
          description:
            "Las calles de piedra caliza y edificios históricos crean una atmósfera atemporal, perfecta para exploración lenta.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Stradun_Dubrovnik.jpg",
            alt: "Stradun, la calle principal del casco antiguo de Dubrovnik con edificios históricos.",
          },
        },
        {
          title: "Vistas del Adriático",
          description:
            "El entorno costero de la ciudad proporciona vistas impresionantes del mar desde las murallas, fortalezas y paseos junto al agua.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubrovnik_Adriatic_View.jpg",
            alt: "Vista del mar Adriático desde Dubrovnik con el casco antiguo al fondo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al casco antiguo" },
        { label: "Consejos de transporte", value: "Camina el casco antiguo; barco para Lokrum" },
        { label: "Entradas", value: "Reserva entradas para murallas con antelación" },
        { label: "Zona para alojarse", value: "Casco antiguo o cerca" },
      ],
      checklist: [
        "Reserva entradas para murallas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Dubrovnik",
        "Planifica visita a la isla Lokrum",
        "Trae protección solar",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Dubrovnik?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco antiguo, murallas y la isla Lokrum con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar entradas para murallas?",
          answer:
            "Sí, se recomienda reservar con antelación, especialmente en temporada alta. El paseo por las murallas es popular y ofrece las mejores vistas de la ciudad.",
        },
        {
          question: "¿Es Dubrovnik caminable?",
          answer:
            "El casco antiguo es muy caminable y compacto. Todo está a poca distancia caminando, aunque el paseo por las murallas requiere buena condición física.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El casco antiguo te mantiene cerca de los lugares principales, aunque áreas cercanas ofrecen buena relación calidad-precio y fácil acceso al centro histórico.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para las murallas para evitar multitudes y calor. El casco antiguo es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Dubrovnik se centra en mariscos, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Vale la pena visitar la isla Lokrum?",
          answer:
            "Sí. Lokrum ofrece un escape pacífico de las multitudes del casco antiguo, con senderos naturales, playas y ruinas históricas en un entorno escénico.",
        },
      ],
      relatedItineraries: [
        {
          slug: "split",
          city: "Split",
          days: 2,
          description: "Palacio de Diocleciano y frente del agua.",
        },
        {
          slug: "venice",
          city: "Venecia",
          days: 3,
          description: "Paseos por canales e iglesias clásicas.",
        },
        {
          slug: "athens",
          city: "Atenas",
          days: 3,
          description: "Sitios antiguos y barrios con cafés.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    helsinki: {
      slug: "helsinki",
      city: "Helsinki",
      country: "Finlandia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Aficionados al diseño", "Primer viaje", "Navegantes de islas"],
      style: ["Diseño junto al agua", "Navegación entre islas", "Cultura de cafés"],
      pacing: [
        "Helsinki recompensa un ritmo calmado y centrado en el diseño. Ancla cada día con un área principal—el distrito del diseño, la isla Suomenlinna, o el frente del agua—y luego deja tiempo para cafés, saunas y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el distrito del diseño con el frente del agua para lugares modernos, luego explora Suomenlinna u otras islas para un ritmo diferente.",
        "Reserva tiempo para la cultura de sauna y momentos tranquilos junto al puerto. El diseño moderno de la ciudad y el entorno de islas crean una atmósfera relajada y con visión de futuro.",
      ],
      hero: {
        title: "Helsinki en 3 días",
        subtitle:
          "Explora diseño junto al agua, navegación entre islas y cultura relajada de cafés con un ritmo calmado y moderno.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Cathedral.jpg",
          alt: "Catedral de Helsinki y Plaza del Senado con arquitectura neoclásica.",
        },
      },
      cityStats: [
        { value: "650K", label: "Habitantes en la ciudad" },
        { value: "330", label: "Islas en el archipiélago" },
        { value: "2M+", label: "Saunas en Finlandia" },
        { value: "1", label: "Capital del diseño de Finlandia" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con diseño moderno",
          "Navegación entre islas y paseos junto al agua",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Cultura de cafés y saunas",
        ],
        notForYou: [
          "Excursiones lejos de Helsinki",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Ambiente de casco antiguo histórico",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Distrito del diseño y centro",
          summary: "Tiendas de diseño y centro histórico.",
          morning: "Distrito del diseño y tiendas",
          afternoon: "Plaza del Senado y Catedral de Helsinki",
          evening: "Paseo junto al agua y cena",
        },
        {
          day: 2,
          title: "Isla Suomenlinna",
          summary: "Isla fortaleza y naturaleza.",
          morning: "Barco a Suomenlinna",
          afternoon: "Exploración de la fortaleza y paseos por la isla",
          evening: "Regreso al centro y cafés",
        },
        {
          day: 3,
          title: "Frente del agua y mercados",
          summary: "Área del puerto y plaza del mercado.",
          morning: "Plaza del Mercado y puerto",
          afternoon: "Catedral Uspenski y Katajanokka",
          evening: "Último paseo junto al agua y atardecer",
        },
      ],
      imageInfoCards: [
        {
          title: "Diseño moderno",
          description:
            "El distrito del diseño de Helsinki muestra el diseño finlandés con tiendas, galerías y arquitectura contemporánea en toda la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Design_District.jpg",
            alt: "Distrito del diseño moderno en Helsinki con arquitectura contemporánea.",
          },
        },
        {
          title: "Fortaleza isleña",
          description:
            "Suomenlinna ofrece una experiencia única de isla con fortificaciones históricas, senderos naturales y vistas del puerto.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Suomenlinna_Helsinki.jpg",
            alt: "Isla fortaleza Suomenlinna en Helsinki con edificios históricos y vistas del puerto.",
          },
        },
        {
          title: "Vida junto al agua",
          description:
            "El puerto y la Plaza del Mercado crean una atmósfera animada con ferries, mercados y cafés junto al agua.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Helsinki_Market_Square.jpg",
            alt: "Plaza del Mercado en Helsinki con vendedores y vistas del puerto.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Tren al centro" },
        { label: "Consejos de transporte", value: "Camina el centro; ferry para Suomenlinna" },
        { label: "Entradas", value: "Reserva entradas para ferry Suomenlinna" },
        { label: "Zona para alojarse", value: "Centro de la ciudad cerca de la Plaza del Senado" },
      ],
      checklist: [
        "Reserva entradas para ferry Suomenlinna",
        "Empaca capas para clima de isla",
        "Guarda mapas offline para Helsinki",
        "Planifica tiempo para sauna si te interesa",
        "Visita tiendas de diseño",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 3 días para Helsinki?",
          answer:
            "Sí para lo esencial. Este plan cubre el distrito del diseño, Suomenlinna y sitios culturales clave con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar ferry Suomenlinna?",
          answer:
            "Las entradas para ferry están disponibles en el puerto, pero reservar con antelación puede ahorrar tiempo en temporada alta. El ferry funciona con frecuencia.",
        },
        {
          question: "¿Es Helsinki caminable?",
          answer:
            "El centro de la ciudad es muy caminable y compacto. Todo está a poca distancia caminando, y el frente del agua se conecta bien a pie.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro de la ciudad cerca de la Plaza del Senado te mantiene cerca de los lugares principales, distrito del diseño y restaurantes, con fácil acceso al puerto.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Suomenlinna para maximizar el tiempo en la isla. El distrito del diseño es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Helsinki se centra en la cocina nórdica, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Helsinki es buena para el diseño?",
          answer:
            "Sí. Helsinki es conocida como una capital del diseño, con excelentes tiendas de diseño, galerías y arquitectura contemporánea en toda la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Encanto del casco antiguo e islas.",
        },
        {
          slug: "copenhagen",
          city: "Copenhague",
          days: 3,
          description: "Paseos junto al agua y diseño.",
        },
        {
          slug: "oslo",
          city: "Oslo",
          days: 3,
          description: "Paseos junto al agua y museos compactos.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    innsbruck: {
      slug: "innsbruck",
      city: "Innsbruck",
      country: "Austria",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Amantes de montañas", "Primer viaje", "Caminantes alpinos"],
      style: ["Vistas alpinas", "Casco antiguo histórico", "Acceso a montañas"],
      pacing: [
        "Innsbruck recompensa un ritmo calmado y alpino. Ancla cada día con un área principal—el histórico casco antiguo, o las montañas Nordkette—y luego deja tiempo para cafés, miradores y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el casco antiguo con el Tejado de Oro para lugares clásicos, luego explora las montañas o áreas cercanas para un ritmo diferente.",
        "Reserva tiempo para miradores de montaña y momentos tranquilos en el casco antiguo. El entorno alpino de la ciudad y la arquitectura histórica crean una atmósfera relajada y escénica.",
      ],
      hero: {
        title: "Innsbruck en 2 días",
        subtitle:
          "Explora vistas alpinas, casco antiguo histórico y fácil acceso a montañas con un ritmo calmado y escénico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Altstadt_10.jpg",
          alt: "Casco antiguo histórico de Innsbruck con edificios coloridos y telón de fondo montañoso.",
        },
      },
      cityStats: [
        { value: "132K", label: "Habitantes en la ciudad" },
        { value: "574M", label: "Elevación del teleférico Nordkette" },
        { value: "800+", label: "Años de historia" },
        { value: "2", label: "Juegos Olímpicos de Invierno organizados" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con vistas alpinas",
          "Casco antiguo histórico y montañas",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Experiencia de teleférico de montaña",
        ],
        notForYou: [
          "Excursiones lejos de Innsbruck",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de playa o costeras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo histórico",
          summary: "Tejado de Oro y paseos por el casco antiguo.",
          morning: "Tejado de Oro y centro histórico",
          afternoon: "Calles del casco antiguo e iglesias",
          evening: "Paseo junto al río y cena",
        },
        {
          day: 2,
          title: "Montañas Nordkette",
          summary: "Teleférico de montaña y vistas.",
          morning: "Teleférico Nordkette y cumbre",
          afternoon: "Caminatas de montaña o regreso al centro",
          evening: "Paseo por el casco antiguo y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Entorno alpino",
          description:
            "El telón de fondo montañoso de Innsbruck crea vistas impresionantes desde el casco antiguo, con fácil acceso a la cordillera Nordkette vía teleférico.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Nordkette.jpg",
            alt: "Montañas Nordkette sobre Innsbruck con teleférico y vistas alpinas.",
          },
        },
        {
          title: "Casco antiguo histórico",
          description:
            "El casco antiguo colorido con el Tejado de Oro muestra arquitectura tirolesa e historia en un centro compacto y caminable.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Roof_Innsbruck.jpg",
            alt: "Tejado de Oro en el casco antiguo histórico de Innsbruck con edificios coloridos.",
          },
        },
        {
          title: "Acceso a montañas",
          description:
            "El teleférico Nordkette proporciona fácil acceso a miradores alpinos y naturaleza, a solo minutos del centro de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Innsbruck_Cable_Car.jpg",
            alt: "Teleférico ascendiendo a las montañas Nordkette desde Innsbruck.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el casco antiguo; teleférico para montañas" },
        { label: "Entradas", value: "Reserva teleférico Nordkette con antelación" },
        { label: "Zona para alojarse", value: "Centro del casco antiguo" },
      ],
      checklist: [
        "Reserva entradas para teleférico Nordkette",
        "Empaca capas para clima de montaña",
        "Guarda mapas offline para Innsbruck",
        "Planifica tiempo para vistas de montaña",
        "Usa zapatos cómodos para caminar",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Innsbruck?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco antiguo y las montañas Nordkette con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar el teleférico Nordkette?",
          answer:
            "Se recomienda reservar con antelación, especialmente en temporada alta. El teleférico ofrece vistas alpinas impresionantes y es una atracción popular.",
        },
        {
          question: "¿Es Innsbruck caminable?",
          answer:
            "El casco antiguo es muy caminable y compacto. Todo está a poca distancia caminando, y la estación del teleférico está cerca del centro.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro del casco antiguo te mantiene cerca de los lugares principales, restaurantes y cafés, con fácil acceso al teleférico.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Nordkette para obtener vistas claras de montaña. El casco antiguo es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Innsbruck se centra en la cocina tirolesa, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Innsbruck es bueno para vistas de montaña?",
          answer:
            "Sí. La ciudad se encuentra en un valle rodeado de montañas, y el teleférico Nordkette proporciona fácil acceso a miradores alpinos impresionantes.",
        },
      ],
      relatedItineraries: [
        {
          slug: "vienna",
          city: "Viena",
          days: 3,
          description: "Museos clásicos y jardines de palacios.",
        },
        {
          slug: "salzburg",
          city: "Salzburgo",
          days: 3,
          description: "Arquitectura barroca y vistas de montaña.",
        },
        {
          slug: "munich",
          city: "Múnich",
          days: 3,
          description: "Plazas históricas y pausas en jardines.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    riga: {
      slug: "riga",
      city: "Riga",
      country: "Letonia",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Aficionados a arquitectura", "Primer viaje", "Caminantes del casco antiguo"],
      style: ["Art nouveau", "Plazas históricas", "Paseos junto al río"],
      pacing: [
        "Riga recompensa un ritmo calmado y arquitectónico. Ancla cada día con un área principal—el distrito art nouveau, o el histórico casco antiguo—y luego deja tiempo para cafés, mercados y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el casco antiguo con el distrito art nouveau para lugares diversos, luego explora el frente del río o mercados para un ritmo diferente.",
        "Reserva tiempo para edificios art nouveau y momentos tranquilos a lo largo del río Daugava. La arquitectura diversa de la ciudad y el entorno del río crean una atmósfera relajada y cultural.",
      ],
      hero: {
        title: "Riga en 2 días",
        subtitle:
          "Explora arquitectura art nouveau, plazas del casco antiguo y paseos junto al río con un ritmo calmado y cultural.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Historic_Centre_of_Riga-112610.jpg",
          alt: "Casco antiguo histórico de Riga con edificios medievales y agujas de iglesias.",
        },
      },
      cityStats: [
        { value: "632K", label: "Habitantes en la ciudad" },
        { value: "800+", label: "Edificios art nouveau" },
        { value: "800+", label: "Años de historia" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con art nouveau",
          "Casco antiguo histórico y arquitectura",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Tiempo cultural y de mercado",
        ],
        notForYou: [
          "Excursiones lejos de Riga",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de playa o costeras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y plazas",
          summary: "Centro histórico y plazas principales.",
          morning: "Casco antiguo y Plaza del Ayuntamiento",
          afternoon: "Catedral del Domo y edificios históricos",
          evening: "Paseo junto al río y cena",
        },
        {
          day: 2,
          title: "Distrito art nouveau",
          summary: "Arquitectura art nouveau y calles.",
          morning: "Distrito art nouveau y edificios",
          afternoon: "Mercado Central o más arquitectura",
          evening: "Paseo por el casco antiguo y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura art nouveau",
          description:
            "Riga tiene una de las colecciones más grandes del mundo de edificios art nouveau, con fachadas ornamentadas y detalles decorativos en toda la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Art_Nouveau.jpg",
            alt: "Edificio art nouveau en Riga con fachada ornamentada y detalles decorativos.",
          },
        },
        {
          title: "Casco antiguo histórico",
          description:
            "El casco antiguo medieval con calles empedradas y edificios históricos crea un centro encantador y caminable.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Dome_Cathedral.jpg",
            alt: "Catedral del Domo en el casco antiguo de Riga con arquitectura histórica.",
          },
        },
        {
          title: "Entorno junto al río",
          description:
            "El río Daugava proporciona un telón de fondo pacífico a la ciudad, con paseos junto al agua y vistas escénicas.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riga_Daugava_River.jpg",
            alt: "Río Daugava en Riga con horizonte de la ciudad y vistas junto al agua.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el centro; todo está cerca" },
        { label: "Entradas", value: "Reserva atracciones principales con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Casco antiguo o distrito art nouveau" },
      ],
      checklist: [
        "Reserva entradas para atracciones principales si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Riga",
        "Planifica tiempo para edificios art nouveau",
        "Visita el Mercado Central",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Riga?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco antiguo y el distrito art nouveau con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar atracciones?",
          answer:
            "Para atracciones principales, reservar con antelación puede ayudar en temporada alta. El casco antiguo y el distrito art nouveau se exploran mejor a pie.",
        },
        {
          question: "¿Es Riga caminable?",
          answer:
            "El centro de la ciudad es muy caminable y compacto. Todo está a poca distancia caminando, y el casco antiguo se conecta bien con el distrito art nouveau.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El casco antiguo te mantiene cerca de los lugares principales, aunque el distrito art nouveau ofrece buena relación calidad-precio y fácil acceso al centro.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para evitar multitudes en las plazas del casco antiguo. El distrito art nouveau es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Riga se centra en la cocina báltica, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Riga es buena para art nouveau?",
          answer:
            "Sí. Riga tiene una de las colecciones más grandes del mundo de edificios art nouveau, con más de 800 ejemplos en toda la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tallinn",
          city: "Tallin",
          days: 2,
          description: "Casco antiguo medieval y murallas.",
        },
        {
          slug: "vilnius",
          city: "Vilna",
          days: 2,
          description: "Arquitectura barroca y calles históricas.",
        },
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Encanto del casco antiguo e islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    split: {
      slug: "split",
      city: "Split",
      country: "Croacia",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Primer viaje", "Caminantes junto al agua"],
      style: ["Palacio romano", "Paseos junto al agua", "Calles históricas"],
      pacing: [
        "Split recompensa un ritmo calmado e histórico. Ancla cada día con un área principal—el Palacio de Diocleciano, o el frente del agua—y luego deja tiempo para cafés, miradores y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el palacio con el casco antiguo para lugares clásicos, luego explora el frente del agua o la colina Marjan para un ritmo diferente.",
        "Reserva tiempo para la colina Marjan y momentos tranquilos a lo largo de la Riva. La historia romana de la ciudad y el entorno del Adriático crean una atmósfera relajada y escénica.",
      ],
      hero: {
        title: "Split en 2 días",
        subtitle:
          "Explora el Palacio de Diocleciano, paseos junto al agua e islas cercanas con un ritmo calmado y costero.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Historical_Complex_of_Split_with_the_Palace_of_Diocletian-108827.jpg",
          alt: "Palacio de Diocleciano en Split con arquitectura romana y edificios históricos.",
        },
      },
      cityStats: [
        { value: "178K", label: "Habitantes en la ciudad" },
        { value: "1.700+", label: "Años de historia" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
        { value: "30K", label: "Metros cuadrados de palacio" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con historia romana",
          "Paseos junto al agua y exploración del palacio",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Excursiones de un día a islas",
        ],
        notForYou: [
          "Excursiones lejos de Split",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades solo de playa",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Palacio de Diocleciano",
          summary: "Palacio romano y casco antiguo.",
          morning: "Entrada al Palacio de Diocleciano y Peristilo",
          afternoon: "Calles del palacio y Catedral de San Duje",
          evening: "Paseo Riva y cena",
        },
        {
          day: 2,
          title: "Colina Marjan y frente del agua",
          summary: "Miradores de la colina y área del puerto.",
          morning: "Caminata por la colina Marjan y miradores",
          afternoon: "Área del frente del agua y playas",
          evening: "Paseo por el casco antiguo y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Palacio romano",
          description:
            "El Palacio de Diocleciano es un monumento romano viviente, con murallas, calles y edificios antiguos integrados en la ciudad moderna.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Peristyle_Split.jpg",
            alt: "Plaza del Peristilo en el Palacio de Diocleciano, Split, con columnas y arquitectura romana.",
          },
        },
        {
          title: "Paseo junto al agua",
          description:
            "El paseo Riva a lo largo del puerto proporciona una atmósfera animada con cafés, vistas y fácil acceso al casco antiguo.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Riva_Split.jpg",
            alt: "Paseo junto al agua Riva en Split con cafés y vistas del puerto.",
          },
        },
        {
          title: "Colina Marjan",
          description:
            "La colina Marjan ofrece paseos tranquilos por la naturaleza y vistas panorámicas de Split, el puerto e islas circundantes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marjan_Hill_Split.jpg",
            alt: "Vista desde la colina Marjan en Split mostrando la ciudad y el mar Adriático.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el centro; todo está cerca" },
        { label: "Entradas", value: "Reserva atracciones del palacio con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Casco antiguo o cerca de la Riva" },
      ],
      checklist: [
        "Reserva entradas para atracciones del palacio si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Split",
        "Planifica tiempo para la colina Marjan",
        "Trae protección solar",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Split?",
          answer:
            "Sí para lo esencial. Este plan cubre el Palacio de Diocleciano y la colina Marjan con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar atracciones del palacio?",
          answer:
            "Para atracciones principales dentro del palacio, reservar con antelación puede ayudar en temporada alta. El palacio en sí es gratis para explorar.",
        },
        {
          question: "¿Es Split caminable?",
          answer:
            "El casco antiguo y el palacio son muy caminables y compactos. Todo está a poca distancia caminando, aunque la colina Marjan requiere algo de caminata cuesta arriba.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El casco antiguo te mantiene cerca del palacio y lugares principales, aunque áreas cerca de la Riva ofrecen buena relación calidad-precio y fácil acceso.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para el palacio para evitar multitudes. La colina Marjan es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Split se centra en mariscos, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Split es bueno para historia romana?",
          answer:
            "Sí. El Palacio de Diocleciano es uno de los monumentos romanos mejor conservados, con arquitectura antigua integrada en el centro moderno de la ciudad.",
        },
      ],
      relatedItineraries: [
        {
          slug: "dubrovnik",
          city: "Dubrovnik",
          days: 3,
          description: "Murallas históricas y vistas del Adriático.",
        },
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Monumentos antiguos y plazas.",
        },
        {
          slug: "athens",
          city: "Atenas",
          days: 3,
          description: "Sitios antiguos y barrios con cafés.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    tallinn: {
      slug: "tallinn",
      city: "Tallin",
      country: "Estonia",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Amantes de historia", "Primer viaje", "Aficionados a ciudades medievales"],
      style: ["Murallas medievales", "Plazas históricas", "Vistas del puerto"],
      pacing: [
        "Tallin recompensa un ritmo calmado y medieval. Ancla cada día con un área principal—el casco antiguo, o la colina Toompea—y luego deja tiempo para cafés, miradores y paseos lentos.",
        "El casco antiguo compacto facilita explorar a pie. Combina la ciudad baja con Toompea para lugares clásicos, luego explora las murallas o el puerto para un ritmo diferente.",
        "Reserva tiempo para las murallas de la ciudad y momentos tranquilos en las plazas. La arquitectura medieval de la ciudad y el entorno del puerto crean una atmósfera relajada e histórica.",
      ],
      hero: {
        title: "Tallin en 2 días",
        subtitle:
          "Explora casco antiguo medieval, murallas de la ciudad y vistas del puerto con un ritmo calmado e histórico.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Old_Town.jpg",
          alt: "Casco antiguo medieval de Tallin con edificios históricos y agujas de iglesias.",
        },
      },
      cityStats: [
        { value: "437K", label: "Habitantes en la ciudad" },
        { value: "800+", label: "Años de historia" },
        { value: "1.9KM", label: "Longitud de las murallas" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con arquitectura medieval",
          "Casco antiguo histórico y murallas",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Tiempo de puerto y miradores",
        ],
        notForYou: [
          "Excursiones lejos de Tallin",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de playa o costeras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y Toompea",
          summary: "Centro medieval y vistas desde la colina.",
          morning: "Entrada al casco antiguo y Plaza del Ayuntamiento",
          afternoon: "Colina Toompea y Catedral de Alejandro Nevski",
          evening: "Paseo por el puerto y cena",
        },
        {
          day: 2,
          title: "Murallas y distritos",
          summary: "Paseo por murallas y distritos históricos.",
          morning: "Paseo por murallas y miradores",
          afternoon: "Distritos históricos e iglesias",
          evening: "Paseo por el casco antiguo y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Casco antiguo medieval",
          description:
            "El casco antiguo de Tallin es uno de los centros medievales mejor conservados de Europa, con calles empedradas y edificios históricos.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Town_Hall_Square.jpg",
            alt: "Plaza del Ayuntamiento en el casco antiguo de Tallin con arquitectura medieval.",
          },
        },
        {
          title: "Murallas de la ciudad",
          description:
            "Las murallas y torres bien conservadas ofrecen vistas del casco antiguo y crean una experiencia única para caminar.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_City_Walls.jpg",
            alt: "Murallas históricas de Tallin con torres medievales y vistas del casco antiguo.",
          },
        },
        {
          title: "Entorno del puerto",
          description:
            "El puerto proporciona un telón de fondo escénico al casco antiguo, con paseos junto al agua y vistas del mar Báltico.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallinn_Harbor.jpg",
            alt: "Puerto en Tallin con casco antiguo y vistas del mar Báltico.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el casco antiguo; todo está cerca" },
        { label: "Entradas", value: "Reserva paseo por murallas con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Centro del casco antiguo" },
      ],
      checklist: [
        "Reserva paseo por murallas si te interesa",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Tallin",
        "Planifica tiempo para la colina Toompea",
        "Visita las plazas del casco antiguo",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Tallin?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco antiguo y las murallas con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar paseo por murallas?",
          answer:
            "Para paseos guiados, reservar con antelación puede ayudar. Las murallas se pueden ver desde varios puntos en todo el casco antiguo.",
        },
        {
          question: "¿Es Tallin caminable?",
          answer:
            "El casco antiguo es muy caminable y compacto. Todo está a poca distancia caminando, aunque la colina Toompea requiere algo de caminata cuesta arriba.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro del casco antiguo te mantiene cerca de los lugares principales, restaurantes y cafés, con fácil acceso a todo.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para evitar multitudes en las plazas del casco antiguo. La colina Toompea es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Tallin se centra en la cocina estonia, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Tallin es bueno para historia medieval?",
          answer:
            "Sí. Tallin tiene uno de los cascos antiguos medievales mejor conservados de Europa, con murallas intactas, edificios históricos y una atmósfera encantadora.",
        },
      ],
      relatedItineraries: [
        {
          slug: "riga",
          city: "Riga",
          days: 2,
          description: "Art nouveau y plazas del casco antiguo.",
        },
        {
          slug: "vilnius",
          city: "Vilna",
          days: 2,
          description: "Arquitectura barroca y calles históricas.",
        },
        {
          slug: "stockholm",
          city: "Estocolmo",
          days: 3,
          description: "Encanto del casco antiguo e islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    vilnius: {
      slug: "vilnius",
      city: "Vilna",
      country: "Lituania",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Aficionados a arquitectura", "Primer viaje", "Caminantes de ciudades barrocas"],
      style: ["Arquitectura barroca", "Calles históricas", "Miradores desde colinas"],
      pacing: [
        "Vilna recompensa un ritmo calmado y barroco. Ancla cada día con un área principal—el casco antiguo, o la Torre Gediminas—y luego deja tiempo para cafés, miradores y paseos lentos.",
        "El centro compacto facilita explorar a pie. Combina el casco antiguo con la Colina Gediminas para lugares clásicos, luego explora Užupis o distritos más tranquilos para un ritmo diferente.",
        "Reserva tiempo para la Torre Gediminas y momentos tranquilos en el casco antiguo. La arquitectura barroca de la ciudad y el entorno de colina crean una atmósfera relajada y cultural.",
      ],
      hero: {
        title: "Vilna en 2 días",
        subtitle:
          "Explora arquitectura barroca, calles históricas y miradores desde colinas con un ritmo calmado y cultural.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vilnius_Old_Town.jpg",
          alt: "Casco antiguo histórico de Vilna con arquitectura barroca y agujas de iglesias.",
        },
      },
      cityStats: [
        { value: "588K", label: "Habitantes en la ciudad" },
        { value: "700+", label: "Años de historia" },
        { value: "40+", label: "Iglesias en el casco antiguo" },
        { value: "UNESCO", label: "Patrimonio de la Humanidad" },
      ],
      fit: {
        forYou: [
          "Un primer viaje con arquitectura barroca",
          "Casco antiguo histórico y vistas desde colinas",
          "Centro compacto y caminable",
          "Planificación clara y práctica",
          "Distritos culturales y artísticos",
        ],
        notForYou: [
          "Excursiones lejos de Vilna",
          "Plan de vida nocturna",
          "Solo museos todo el día",
          "Tiempo extenso de compras",
          "Actividades de playa o costeras",
        ],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y Gediminas",
          summary: "Centro histórico y torre desde la colina.",
          morning: "Casco antiguo y Plaza de la Catedral",
          afternoon: "Torre Gediminas y vistas desde la colina",
          evening: "Paseo por el casco antiguo y cena",
        },
        {
          day: 2,
          title: "Užupis y distritos",
          summary: "Distrito artístico e iglesias históricas.",
          morning: "Distrito Užupis y área artística",
          afternoon: "Iglesias históricas y calles más tranquilas",
          evening: "Último paseo por el casco antiguo y cafés",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura barroca",
          description:
            "El casco antiguo de Vilna muestra arquitectura barroca con iglesias ornamentadas, edificios históricos y calles encantadoras en todo.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vilnius_Cathedral.jpg",
            alt: "Catedral de Vilna con arquitectura barroca en el casco antiguo.",
          },
        },
        {
          title: "Torre Gediminas",
          description:
            "La Torre Gediminas desde la colina ofrece vistas panorámicas de Vilna y el área circundante, accesible a pie o en funicular.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gediminas_Tower_Vilnius.jpg",
            alt: "Torre Gediminas en la colina con vistas del casco antiguo de Vilna.",
          },
        },
        {
          title: "Distrito Užupis",
          description:
            "El distrito artístico Užupis añade una atmósfera creativa y bohemia al casco antiguo, con galerías, cafés y carácter único.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uzupis_Vilnius.jpg",
            alt: "Distrito artístico Užupis en Vilna con edificios coloridos y atmósfera creativa.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Mayo a septiembre para clima cálido" },
        { label: "Traslado del aeropuerto", value: "Autobús del aeropuerto o taxi al centro" },
        { label: "Consejos de transporte", value: "Camina el casco antiguo; todo está cerca" },
        { label: "Entradas", value: "Reserva Torre Gediminas con antelación si es necesario" },
        { label: "Zona para alojarse", value: "Centro del casco antiguo" },
      ],
      checklist: [
        "Reserva Torre Gediminas si te interesa",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Vilna",
        "Planifica tiempo para el distrito Užupis",
        "Visita las iglesias del casco antiguo",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Son suficientes 2 días para Vilna?",
          answer:
            "Sí para lo esencial. Este plan cubre el casco antiguo y la Torre Gediminas con un ritmo calmado que deja margen para cafés y paradas espontáneas.",
        },
        {
          question: "¿Necesito reservar Torre Gediminas?",
          answer:
            "Para la subida a la torre, reservar con antelación puede ayudar en temporada alta. La colina ofrece grandes vistas incluso sin entrar a la torre.",
        },
        {
          question: "¿Es Vilna caminable?",
          answer:
            "El casco antiguo es muy caminable y compacto. Todo está a poca distancia caminando, aunque la Colina Gediminas requiere algo de caminata cuesta arriba.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro del casco antiguo te mantiene cerca de los lugares principales, restaurantes y cafés, con fácil acceso a todo.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para evitar multitudes en las plazas del casco antiguo. La Colina Gediminas es agradable durante todo el día, y puedes relajarte con un almuerzo largo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. La escena gastronómica de Vilna se centra en la cocina lituana, así que reserva algunas comidas con antelación.",
        },
        {
          question: "¿Vilna es buena para arquitectura barroca?",
          answer:
            "Sí. Vilna tiene uno de los cascos antiguos barrocos más grandes de Europa, con más de 40 iglesias y edificios históricos en todo el centro.",
        },
      ],
      relatedItineraries: [
        {
          slug: "riga",
          city: "Riga",
          days: 2,
          description: "Art nouveau y plazas del casco antiguo.",
        },
        {
          slug: "tallinn",
          city: "Tallin",
          days: 2,
          description: "Casco antiguo medieval y murallas.",
        },
        {
          slug: "krakow",
          city: "Cracovia",
          days: 3,
          description: "Casco antiguo y colina del castillo.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    tokyo: {
      slug: "tokyo",
      city: "Tokio",
      country: "Japón",
      days: 4,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de la comida", "Buscadores de cultura"],
      style: ["Templos tradicionales", "Distritos modernos", "Comida excepcional"],
      pacing: [
        "Tokio recompensa un ritmo calmado a través de sus diversos barrios. Enfoca cada día en una zona principal y deja tiempo para visitas a templos, mercados locales y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por grupos de distritos. Combina Shibuya con Harajuku para energía moderna, dedica otro día a Asakusa y Ueno para cultura tradicional, luego explora Shinjuku y Ginza para contraste.",
        "Reserva tiempo sin prisas para paseos por barrios, cenas en izakaya locales y los momentos tranquilos que revelan el carácter de Tokio más allá de los lugares principales.",
      ],
      hero: {
        title: "Tokio en 4 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, equilibrando templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=80",
          alt: "Cruce de Shibuya en Tokio con luces de neón y multitudes.",
        },
      },
      cityStats: [
        { value: "13,9M", label: "Habitantes en el área metropolitana" },
        { value: "23", label: "Barrios especiales en la ciudad" },
        { value: "160.000+", label: "Restaurantes y establecimientos gastronómicos" },
        { value: "2.000+", label: "Templos y santuarios" },
      ],
      fit: {
        forYou: ["Visitas a templos tradicionales", "Exploración de distritos modernos", "Escenas gastronómicas excepcionales", "Tránsito público eficiente", "Barrios seguros y caminables"],
        notForYou: ["Una agenda muy cargada solo de templos", "Excursiones fuera de Tokio", "Vida nocturna como prioridad", "Tiempo de playa", "Estilo mochilero económico"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Tokio moderno",
          summary: "Shibuya, Harajuku y energía moderna.",
          morning: "Cruce de Shibuya y Plaza Hachiko",
          afternoon: "Harajuku y Takeshita Street",
          evening: "Shibuya Sky o cena en barrio",
        },
        {
          day: 2,
          title: "Cultura tradicional",
          summary: "Asakusa, Senso-ji y Parque Ueno.",
          morning: "Templo Senso-ji y Calle Nakamise",
          afternoon: "Parque Ueno y museos",
          evening: "Cena tradicional en Asakusa",
        },
        {
          day: 3,
          title: "Imperial y compras",
          summary: "Palacio Imperial, Ginza y Tsukiji.",
          morning: "Jardines Orientales del Palacio Imperial",
          afternoon: "Distrito Ginza y compras",
          evening: "Zona del Mercado Exterior de Tsukiji",
        },
        {
          day: 4,
          title: "Barrios y comida",
          summary: "Shinjuku, mercados locales y tiempo relajado.",
          morning: "Shinjuku Gyoen o Santuario Meiji",
          afternoon: "Exploración del barrio Shinjuku",
          evening: "Cena en izakaya y Golden Gai",
        },
      ],
      imageInfoCards: [
        {
          title: "Templos tradicionales",
          description:
            "Senso-ji y el Santuario Meiji ofrecen contrastes pacíficos con la energía moderna de Tokio. Las visitas matutinas proporcionan momentos tranquilos antes de que lleguen las multitudes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sensoji_Temple_Tokyo.jpg",
            alt: "Templo Senso-ji en Asakusa con arquitectura tradicional y linternas.",
          },
        },
        {
          title: "Distritos modernos",
          description:
            "Shibuya y Shinjuku muestran el lado contemporáneo de Tokio con luces de neón, tránsito eficiente y vida callejera vibrante que se siente tanto organizada como enérgica.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Shinjuku_Tokyo_Skyline.jpg",
            alt: "Skyline de Shinjuku con rascacielos modernos y letreros de neón.",
          },
        },
        {
          title: "Cultura gastronómica excepcional",
          description:
            "Desde el mercado de pescado de Tsukiji hasta izakaya de barrios, la escena gastronómica de Tokio es de clase mundial. Las comidas largas y los descubrimientos locales son parte de la experiencia.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tsukiji_Market_Tokyo.jpg",
            alt: "Mercado Exterior de Tsukiji con mariscos frescos y puestos de comida.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Marzo a mayo o septiembre a noviembre" },
        { label: "Traslado aeropuerto", value: "Narita Express o Skyliner al centro de la ciudad" },
        { label: "Transporte", value: "Obtén un JR Pass o tarjeta IC para tránsito fácil" },
        { label: "Entradas", value: "Reserva atracciones principales como Tokyo Skytree con antelación" },
        { label: "Zona para alojarte", value: "Áreas de Shibuya, Shinjuku o Ginza" },
      ],
      checklist: [
        "Obtén un JR Pass o tarjeta IC para tránsito",
        "Reserva Tokyo Skytree si visitas",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Tokio",
        "Planifica una experiencia de comida tradicional",
        "Lleva efectivo para establecimientos pequeños",
      ],
      faqs: [
        {
          question: "¿Alcanzan 4 días para Tokio?",
          answer:
            "Sí para lo esencial. Este plan equilibra Tokio tradicional y moderno con suficiente margen para descubrimientos gastronómicos, paseos por barrios y paradas no planificadas.",
        },
        {
          question: "¿Necesito un JR Pass?",
          answer:
            "Para viajes por la ciudad, una tarjeta IC es más práctica. Los JR Passes son mejores para viajes más largos por Japón. Ambos ofrecen fácil acceso al excelente sistema de tránsito de Tokio.",
        },
        {
          question: "¿Es Tokio caminable?",
          answer:
            "Los barrios son caminables, pero Tokio es vasto. Usa el eficiente sistema de metro y tren para moverte entre distritos, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Shibuya o Shinjuku ofrecen buenas conexiones de tránsito y ubicaciones centrales. Ginza proporciona una base más exclusiva con fácil acceso a compras y restaurantes.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para visitas a templos para evitar multitudes. Los mercados como Tsukiji son mejores por la mañana. Las tardes pueden ser más lentas con exploración de barrios.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes de alta gama, sí—especialmente para sushi o kaiseki. Para izakaya y lugares casuales, las llegadas sin reserva son comunes, aunque los lugares populares pueden tener esperas.",
        },
        {
          question: "¿Se habla inglés ampliamente?",
          answer:
            "En áreas turísticas, sí. Muchos restaurantes tienen menús en inglés y las señales de tránsito son bilingües. Aprender frases básicas en japonés ayuda, especialmente fuera de áreas centrales.",
        },
      ],
      relatedItineraries: [
        {
          slug: "seoul",
          city: "Seúl",
          days: 3,
          description: "Palacios antiguos, barrios modernos y escenas gastronómicas dinámicas.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Templos dorados, mercados flotantes y comida callejera vibrante.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Vistas del skyline, mercados tradicionales y escapes fáciles a islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    seoul: {
      slug: "seoul",
      city: "Seúl",
      country: "Corea del Sur",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Entusiastas de la comida"],
      style: ["Palacios antiguos", "Barrios modernos", "Escenas gastronómicas dinámicas"],
      pacing: [
        "Seúl recompensa un ritmo calmado a través de su mezcla de antiguo y moderno. Ancla cada día con una zona principal y deja tiempo para visitas a palacios, mercados de barrios y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por distrito. Combina Gyeongbokgung con Bukchon para cultura tradicional, dedica otro día a Myeongdong e Insadong para compras y comida, luego explora Gangnam para contraste moderno.",
        "Reserva tiempo sin prisas para paseos por aldeas hanok, visitas a mercados locales y las comidas relajadas que muestran la excepcional cultura gastronómica de Seúl.",
      ],
      hero: {
        title: "Seúl en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, mezclando palacios antiguos, barrios modernos y escenas de comida callejera dinámicas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1758509444769-95567facc5b0?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline de Seúl con Torre Namsan y arquitectura moderna.",
        },
      },
      cityStats: [
        { value: "9,7M", label: "Habitantes en la ciudad" },
        { value: "5", label: "Grandes palacios en Seúl" },
        { value: "25", label: "Distritos (gu) en la ciudad" },
        { value: "20.000+", label: "Restaurantes y establecimientos gastronómicos" },
      ],
      fit: {
        forYou: ["Visitas a palacios antiguos", "Aldeas hanok tradicionales", "Mercados gastronómicos vibrantes", "Distritos de compras modernos", "Tránsito público eficiente"],
        notForYou: ["Una agenda muy cargada solo de palacios", "Excursiones fuera de Seúl", "Vida nocturna como prioridad", "Tiempo de playa", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Palacios y tradición",
          summary: "Gyeongbokgung, Bukchon y cultura tradicional.",
          morning: "Palacio Gyeongbokgung y cambio de guardia",
          afternoon: "Paseo por Aldea Hanok de Bukchon",
          evening: "Zona Insadong y cena tradicional",
        },
        {
          day: 2,
          title: "Seúl moderno",
          summary: "Myeongdong, N Seoul Tower y compras.",
          morning: "Distrito de compras Myeongdong",
          afternoon: "N Seoul Tower y Parque Namsan",
          evening: "Área Gangnam o Hongdae para vida nocturna",
        },
        {
          day: 3,
          title: "Mercados y barrios",
          summary: "Mercado Gwangjang, áreas locales y tiempo relajado.",
          morning: "Mercado Gwangjang y comida callejera",
          afternoon: "Dongdaemun o exploración de barrios",
          evening: "Cena tradicional hanjeongsik",
        },
      ],
      imageInfoCards: [
        {
          title: "Palacios antiguos",
          description:
            "Gyeongbokgung y Changdeokgung muestran la historia real de Corea. Las visitas matutinas ofrecen momentos más tranquilos y la oportunidad de ver ceremonias tradicionales.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Changdeokgung_Palace_Seoul.jpg",
            alt: "Palacio Changdeokgung con arquitectura tradicional coreana y jardines.",
          },
        },
        {
          title: "Aldeas hanok",
          description:
            "Bukchon preserva la arquitectura tradicional coreana en un entorno residencial. Los paseos lentos revelan patios, casas de té y calles tranquilas que se sienten alejadas del Seúl moderno.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bukchon_Hanok_Village_Seoul.jpg",
            alt: "Casas hanok tradicionales en Aldea Bukchon con techos de tejas.",
          },
        },
        {
          title: "Cultura gastronómica dinámica",
          description:
            "Desde el Mercado Gwangjang hasta la comida callejera de Myeongdong, la escena gastronómica de Seúl es vibrante y accesible. Las comidas largas y los descubrimientos locales son centrales para la experiencia.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gwangjang_Market_Seoul.jpg",
            alt: "Mercado Gwangjang con puestos de comida y vendedores en Seúl.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a noviembre" },
        { label: "Traslado aeropuerto", value: "Tren expreso AREX o autobús del aeropuerto al centro" },
        { label: "Transporte", value: "Obtén una tarjeta T-money para fácil acceso a metro y autobuses" },
        { label: "Entradas", value: "Reserva tours de palacios y N Seoul Tower con antelación" },
        { label: "Zona para alojarte", value: "Áreas de Myeongdong, Insadong o Gangnam" },
      ],
      checklist: [
        "Obtén una tarjeta T-money para tránsito",
        "Reserva tour del Jardín Secreto de Changdeokgung si te interesa",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Seúl",
        "Planifica una experiencia de comida tradicional",
        "Lleva efectivo para mercados y comida callejera",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Seúl?",
          answer:
            "Sí para lo esencial. Este plan equilibra Seúl tradicional y moderno con suficiente margen para visitas a palacios, mercados gastronómicos y exploración de barrios.",
        },
        {
          question: "¿Necesito reservar visitas a palacios?",
          answer:
            "Para Gyeongbokgung, no se necesita reserva anticipada. Para el Jardín Secreto de Changdeokgung, sí—reserva con antelación ya que los tours son limitados. El cambio de guardia en Gyeongbokgung es gratuito y vale la pena programar tu visita.",
        },
        {
          question: "¿Es Seúl caminable?",
          answer:
            "Los barrios son caminables, pero Seúl está extendido. Usa el eficiente sistema de metro para moverte entre distritos, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Myeongdong ofrece ubicación central y fácil acceso a compras y comida. Insadong proporciona carácter tradicional, mientras que Gangnam ofrece conveniencia moderna.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para visitas a palacios para evitar multitudes y ver el cambio de guardia. Los mercados son mejores por la mañana, y las tardes pueden ser más lentas con paseos por barrios.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para BBQ coreano de alta gama o hanjeongsik, sí—especialmente en fines de semana. Para comida callejera y lugares casuales, las llegadas sin reserva son comunes y parte de la experiencia.",
        },
        {
          question: "¿Se habla inglés ampliamente?",
          answer:
            "En áreas turísticas y con personas jóvenes, sí. Muchos restaurantes tienen menús en inglés y las señales de tránsito son bilingües. Aprender frases básicas en coreano ayuda.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokio",
          days: 4,
          description: "Templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Templos dorados, mercados flotantes y comida callejera vibrante.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Vistas del skyline, mercados tradicionales y escapes fáciles a islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bangkok: {
      slug: "bangkok",
      city: "Bangkok",
      country: "Tailandia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de templos", "Entusiastas de la comida"],
      style: ["Templos dorados", "Mercados flotantes", "Comida callejera vibrante"],
      pacing: [
        "Bangkok recompensa un ritmo calmado a pesar de su energía. Ancla cada día con un templo o zona principal y deja tiempo para visitas a mercados, descubrimientos de comida callejera y paseos en bote por el río.",
        "Agrupa el tiempo por zona. Combina el Gran Palacio con Wat Pho para cultura de templos, dedica otro día a Chatuchak o mercados flotantes, luego explora barrios como Chinatown para comida y vida local.",
        "Reserva tiempo sin prisas para visitas a templos, paseos largos por mercados y las comidas relajadas que muestran la excepcional cultura de comida callejera de Bangkok.",
      ],
      hero: {
        title: "Bangkok en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con templos dorados, mercados flotantes y escenas de comida callejera vibrantes.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1600&q=80",
          alt: "Wat Phra Kaew (Templo del Buda Esmeralda) en Bangkok con arquitectura dorada.",
        },
      },
      cityStats: [
        { value: "10,5M", label: "Habitantes en el área metropolitana" },
        { value: "400+", label: "Templos (wats) en toda la ciudad" },
        { value: "50", label: "Distritos (khet) en Bangkok" },
        { value: "20.000+", label: "Vendedores de comida callejera" },
      ],
      fit: {
        forYou: ["Visitas a templos y cultura", "Mercados flotantes y callejeros", "Comida callejera vibrante", "Experiencias en bote por el río", "Viaje asequible"],
        notForYou: ["Una agenda muy cargada solo de templos", "Tiempo de playa", "Vida nocturna como prioridad", "Centros comerciales extensos", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Grandes templos",
          summary: "Gran Palacio, Wat Pho y cultura de templos.",
          morning: "Gran Palacio y Wat Phra Kaew",
          afternoon: "Wat Pho (Templo del Buda Reclinado)",
          evening: "Wat Arun al atardecer y vistas del río",
        },
        {
          day: 2,
          title: "Mercados y comida",
          summary: "Chatuchak o mercado flotante, comida callejera.",
          morning: "Mercado de Fin de Semana Chatuchak o Damnoen Saduak",
          afternoon: "Exploración del mercado y comida callejera",
          evening: "Paseo gastronómico por Chinatown",
        },
        {
          day: 3,
          title: "Barrios y cultura",
          summary: "Casa Jim Thompson, áreas locales y tiempo relajado.",
          morning: "Casa Jim Thompson o Wat Saket",
          afternoon: "Área Siam o paseo por barrios",
          evening: "Bar en azotea o cena tradicional",
        },
      ],
      imageInfoCards: [
        {
          title: "Templos dorados",
          description:
            "El Gran Palacio y Wat Pho muestran el patrimonio real y religioso de Tailandia. Las visitas matutinas ofrecen temperaturas más frescas y menos multitudes antes de que lleguen los grupos turísticos.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Wat_Pho_Bangkok.jpg",
            alt: "Wat Pho con el Buda Reclinado y arquitectura dorada.",
          },
        },
        {
          title: "Mercados flotantes",
          description:
            "Damnoen Saduak y otros mercados flotantes ofrecen un vistazo a la vida tradicional tailandesa. Las visitas temprano por la mañana proporcionan la mejor experiencia antes del calor y las multitudes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Damnoen_Saduak_Floating_Market.jpg",
            alt: "Mercado flotante con botes y vendedores en el agua.",
          },
        },
        {
          title: "Comida callejera vibrante",
          description:
            "Desde Chinatown hasta mercados locales, la escena de comida callejera de Bangkok es de clase mundial. Los paseos gastronómicos largos y los descubrimientos locales son centrales para la experiencia.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bangkok_Street_Food.jpg",
            alt: "Vendedores de comida callejera y puestos en Bangkok con exhibiciones coloridas.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Noviembre a marzo para clima más fresco y seco" },
        { label: "Traslado aeropuerto", value: "Airport Rail Link o taxi al centro" },
        { label: "Transporte", value: "Usa BTS Skytrain y MRT para distancias largas; tuk-tuks para trayectos cortos" },
        { label: "Entradas", value: "Compra entradas del Gran Palacio en el lugar; reserva tours de mercados flotantes con antelación" },
        { label: "Zona para alojarte", value: "Sukhumvit, Silom o cerca del río" },
      ],
      checklist: [
        "Reserva tour de mercado flotante si visitas",
        "Empaca ropa ligera y transpirable",
        "Trae zapatos cómodos para caminar",
        "Guarda mapas offline para Bangkok",
        "Planifica un paseo de comida callejera",
        "Lleva efectivo para mercados y comida callejera",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Bangkok?",
          answer:
            "Sí para lo esencial. Este plan equilibra templos, mercados y comida con suficiente margen para paseos en bote por el río, paseos por barrios y descubrimientos no planificados.",
        },
        {
          question: "¿Necesito reservar visitas a templos?",
          answer:
            "No se necesita reserva anticipada para la mayoría de templos. Compra entradas en el lugar. Para mercados flotantes, reserva tours con antelación ya que están fuera de la ciudad y requieren transporte.",
        },
        {
          question: "¿Es Bangkok caminable?",
          answer:
            "Los barrios son caminables, pero Bangkok está extendido y puede hacer calor. Usa BTS Skytrain y MRT para distancias largas, luego explora a pie dentro de cada área. Los botes por el río ofrecen tránsito escénico.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Sukhumvit ofrece buen acceso BTS y conveniencia moderna. Silom proporciona ubicación central, mientras que las áreas cerca del río ofrecen vistas escénicas y fácil acceso a botes.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para visitas a templos para evitar calor y multitudes. Los mercados flotantes son mejores al amanecer. Las tardes pueden ser más lentas con paradas interiores o descansos con aire acondicionado.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes de alta gama, sí. Para comida callejera y lugares casuales, las llegadas sin reserva son la norma. Los mercados gastronómicos y vendedores callejeros no requieren reservas.",
        },
        {
          question: "¿Es segura la comida callejera?",
          answer:
            "Sí, generalmente. Busca puestos ocupados con alta rotación. Evita alimentos crudos si eres sensible. Quédate con artículos cocidos y mantente hidratado. La mayoría de viajeros disfrutan la comida callejera sin problemas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokio",
          days: 4,
          description: "Templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        },
        {
          slug: "seoul",
          city: "Seúl",
          days: 3,
          description: "Palacios antiguos, barrios modernos y escenas gastronómicas dinámicas.",
        },
        {
          slug: "singapore",
          city: "Singapur",
          days: 3,
          description: "Arquitectura moderna, barrios diversos y comida excepcional.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    singapore: {
      slug: "singapore",
      city: "Singapur",
      country: "Singapur",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de la comida", "Fans de arquitectura moderna"],
      style: ["Arquitectura moderna", "Barrios diversos", "Comida excepcional"],
      pacing: [
        "Singapur recompensa un ritmo calmado a pesar de su tamaño compacto. Enfoca cada día en una zona principal y deja tiempo para descubrimientos gastronómicos, paseos por barrios y tiempo relajado en jardines.",
        "Agrupa el tiempo por distrito. Combina Marina Bay con Gardens by the Bay para íconos modernos, dedica otro día a Chinatown y Little India para cultura y comida, luego explora Sentosa o barrios para contraste.",
        "Reserva tiempo sin prisas para visitas a centros gastronómicos, paseos largos por jardines y las comidas relajadas que muestran la excepcional cocina multicultural de Singapur.",
      ],
      hero: {
        title: "Singapur en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, combinando arquitectura moderna, barrios diversos y escenas gastronómicas excepcionales.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline de Marina Bay en Singapur con arquitectura moderna y agua.",
        },
      },
      cityStats: [
        { value: "5,6M", label: "Habitantes en la ciudad-estado" },
        { value: "4", label: "Idiomas oficiales" },
        { value: "350+", label: "Parques y jardines" },
        { value: "12.000+", label: "Establecimientos gastronómicos" },
      ],
      fit: {
        forYou: ["Arquitectura moderna", "Escenas gastronómicas diversas", "Tránsito público eficiente", "Calles seguras y limpias", "Tiempo en jardines y parques"],
        notForYou: ["Una agenda muy cargada solo de centros comerciales", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Marina Bay e íconos modernos",
          summary: "Marina Bay, Gardens by the Bay y vistas del skyline.",
          morning: "Área Marina Bay Sands y Merlion",
          afternoon: "Gardens by the Bay y Cloud Forest",
          evening: "Espectáculo de luces de Marina Bay y cena",
        },
        {
          day: 2,
          title: "Barrios culturales",
          summary: "Chinatown, Little India y comida diversa.",
          morning: "Chinatown y Templo de la Reliquia del Diente de Buda",
          afternoon: "Little India y Templo Sri Veeramakaliamman",
          evening: "Cena en centro gastronómico y paseo por barrios",
        },
        {
          day: 3,
          title: "Sentosa o barrios",
          summary: "Isla Sentosa, Orchard Road o tiempo relajado.",
          morning: "Isla Sentosa o Jardines Botánicos",
          afternoon: "Orchard Road o exploración de barrios",
          evening: "Bar en azotea o cena tradicional",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura moderna",
          description:
            "Marina Bay muestra el skyline futurista de Singapur. Los Gardens by the Bay ofrecen un contraste verde con diseño innovador que se siente tanto natural como diseñado.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gardens_by_the_Bay_Singapore.jpg",
            alt: "Gardens by the Bay con Supertree Grove y arquitectura moderna.",
          },
        },
        {
          title: "Barrios diversos",
          description:
            "Chinatown y Little India preservan el patrimonio cultural mientras ofrecen comida excepcional. Los paseos lentos revelan templos, mercados y vida local que se siente auténtica y vibrante.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Chinatown_Singapore.jpg",
            alt: "Chinatown en Singapur con arquitectura tradicional y edificios coloridos.",
          },
        },
        {
          title: "Cultura gastronómica excepcional",
          description:
            "Desde centros gastronómicos hasta restaurantes finos, la escena gastronómica de Singapur es de clase mundial. Las comidas largas y los descubrimientos locales muestran la cocina multicultural de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hawker_Center_Singapore.jpg",
            alt: "Centro gastronómico en Singapur con puestos de comida y cocina diversa.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Todo el año, aunque febrero a abril es más seco" },
        { label: "Traslado aeropuerto", value: "MRT o taxi al centro" },
        { label: "Transporte", value: "Obtén una tarjeta EZ-Link para fácil acceso a MRT y autobuses" },
        { label: "Entradas", value: "Reserva Gardens by the Bay y atracciones principales con antelación" },
        { label: "Zona para alojarte", value: "Áreas de Marina Bay, Orchard Road o Chinatown" },
      ],
      checklist: [
        "Obtén una tarjeta EZ-Link para tránsito",
        "Reserva Gardens by the Bay con antelación",
        "Empaca ropa ligera y transpirable",
        "Guarda mapas offline para Singapur",
        "Planifica una comida en centro gastronómico",
        "Lleva efectivo para centros gastronómicos y mercados",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Singapur?",
          answer:
            "Sí para lo esencial. Este plan equilibra íconos modernos, barrios culturales y comida con suficiente margen para paseos por jardines, exploración de barrios y descubrimientos no planificados.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "Para Gardens by the Bay y Marina Bay Sands SkyPark, sí—reserva con antelación para entrada con horario. La mayoría de templos y barrios no requieren reserva anticipada.",
        },
        {
          question: "¿Es Singapur caminable?",
          answer:
            "Los barrios son caminables, pero Singapur se explora mejor con una mezcla de caminar y tránsito MRT eficiente. La ciudad es compacta y bien conectada.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Marina Bay ofrece conveniencia moderna y vistas del skyline. Orchard Road proporciona compras y ubicación central, mientras que Chinatown ofrece carácter cultural.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Gardens by the Bay para evitar multitudes y calor. Los templos son agradables durante todo el día. Las tardes pueden incluir paradas interiores o descansos con aire acondicionado.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes de alta gama, sí—especialmente en fines de semana. Para centros gastronómicos y lugares casuales, las llegadas sin reserva son la norma. Los centros gastronómicos no requieren reservas.",
        },
        {
          question: "¿Se habla inglés ampliamente?",
          answer:
            "Sí, el inglés es uno de los idiomas oficiales y se habla ampliamente. Las señales están en inglés y la mayoría de locales son fluidos. Esto hace que Singapur sea muy accesible para hablantes de inglés.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokio",
          days: 4,
          description: "Templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Templos dorados, mercados flotantes y comida callejera vibrante.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Vistas del skyline, mercados tradicionales y escapes fáciles a islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "hong-kong": {
      slug: "hong-kong",
      city: "Hong Kong",
      country: "China",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes del skyline", "Entusiastas de la comida"],
      style: ["Vistas del skyline", "Mercados tradicionales", "Escapes fáciles a islas"],
      pacing: [
        "Hong Kong recompensa un ritmo calmado a través de su mezcla de energía urbana y escapes naturales. Enfoca cada día en una zona principal y deja tiempo para visitas a mercados, viajes a islas y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por distrito. Combina Victoria Peak con Central para vistas del skyline, dedica otro día a Kowloon para mercados y cultura, luego explora una isla periférica como Lantau para contraste.",
        "Reserva tiempo sin prisas para paseos por mercados, visitas largas a islas y las comidas relajadas que muestran la excepcional cultura gastronómica de Hong Kong.",
      ],
      hero: {
        title: "Hong Kong en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con vistas del skyline, mercados tradicionales y escapes fáciles a islas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline de Hong Kong con Victoria Harbour y rascacielos modernos.",
        },
      },
      cityStats: [
        { value: "7,5M", label: "Habitantes en la ciudad" },
        { value: "263", label: "Islas en Hong Kong" },
        { value: "40%", label: "Tierra designada como parques nacionales" },
        { value: "11.000+", label: "Restaurantes y establecimientos gastronómicos" },
      ],
      fit: {
        forYou: ["Vistas icónicas del skyline", "Mercados tradicionales", "Viajes de un día a islas", "Tránsito público eficiente", "Escenas gastronómicas diversas"],
        notForYou: ["Una agenda muy cargada solo de compras", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Skyline y Peak",
          summary: "Victoria Peak, Star Ferry y vistas del puerto.",
          morning: "Victoria Peak y Sky Terrace",
          afternoon: "Star Ferry a Kowloon y Tsim Sha Tsui",
          evening: "Avenue of Stars y Symphony of Lights",
        },
        {
          day: 2,
          title: "Mercados y cultura",
          summary: "Temple Street, mercados y barrios locales.",
          morning: "Área del Mercado Nocturno Temple Street",
          afternoon: "Templo Wong Tai Sin o mercados locales",
          evening: "Paseo gastronómico por Kowloon y exploración de barrios",
        },
        {
          day: 3,
          title: "Escape a isla",
          summary: "Isla Lantau, Gran Buda o tiempo relajado.",
          morning: "Isla Lantau y Ngong Ping",
          afternoon: "Gran Buda y Monasterio Po Lin",
          evening: "Regreso a la ciudad o cena en isla",
        },
      ],
      imageInfoCards: [
        {
          title: "Skyline icónico",
          description:
            "Victoria Peak ofrece la vista clásica de Hong Kong. El Star Ferry proporciona una forma escénica de cruzar el puerto mientras disfrutas del skyline desde el nivel del agua.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Victoria_Peak_Hong_Kong.jpg",
            alt: "Vista desde Victoria Peak mostrando el skyline de Hong Kong y el puerto.",
          },
        },
        {
          title: "Mercados tradicionales",
          description:
            "Temple Street y otros mercados muestran la vida local con comida, productos y energía nocturna que se siente auténtica y vibrante.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Temple_Street_Market_Hong_Kong.jpg",
            alt: "Mercado Nocturno Temple Street con puestos y luces nocturnas.",
          },
        },
        {
          title: "Escapes a islas",
          description:
            "Lantau y otras islas periféricas ofrecen contraste natural con la energía urbana de Hong Kong. Los viajes de un día proporcionan senderismo, playas y momentos tranquilos.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Big_Buddha_Lantau.jpg",
            alt: "Estatua del Gran Buda en Isla Lantau con montañas al fondo.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Octubre a abril para clima más fresco y seco" },
        { label: "Traslado aeropuerto", value: "Tren Airport Express o autobús al centro" },
        { label: "Transporte", value: "Obtén una tarjeta Octopus para fácil acceso a MTR, autobuses y ferries" },
        { label: "Entradas", value: "Reserva Peak Tram y atracciones principales con antelación" },
        { label: "Zona para alojarte", value: "Central, Tsim Sha Tsui o Causeway Bay" },
      ],
      checklist: [
        "Obtén una tarjeta Octopus para tránsito",
        "Reserva entradas para Peak Tram con antelación",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Hong Kong",
        "Planifica un viaje de un día a una isla",
        "Lleva efectivo para mercados y comida callejera",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Hong Kong?",
          answer:
            "Sí para lo esencial. Este plan equilibra vistas del skyline, mercados y tiempo en islas con suficiente margen para descubrimientos gastronómicos, paseos por barrios y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "Para Victoria Peak Tram y atracciones principales, sí—reserva con antelación para entrada con horario. Los mercados y barrios no requieren reserva anticipada.",
        },
        {
          question: "¿Es Hong Kong caminable?",
          answer:
            "Los barrios son caminables, pero Hong Kong es montañoso y extendido. Usa el eficiente sistema MTR para distancias largas, luego explora a pie dentro de cada área. El Star Ferry ofrece tránsito escénico.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Central ofrece buen acceso MTR y ubicación central. Tsim Sha Tsui proporciona vistas del puerto y fácil acceso a Kowloon, mientras que Causeway Bay ofrece compras y carácter local.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Victoria Peak para evitar multitudes y obtener vistas más claras. Los mercados son mejores por la noche. Los viajes a islas funcionan bien como excursiones de día completo.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes de alta gama, sí—especialmente en fines de semana. Para dim sum y lugares casuales, las llegadas sin reserva son comunes. Los mercados gastronómicos no requieren reservas.",
        },
        {
          question: "¿Se habla inglés ampliamente?",
          answer:
            "Sí, el inglés se habla ampliamente junto con el cantonés. Las señales son bilingües y la mayoría de locales en áreas turísticas hablan inglés. Esto hace que Hong Kong sea muy accesible.",
        },
      ],
      relatedItineraries: [
        {
          slug: "tokyo",
          city: "Tokio",
          days: 4,
          description: "Templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        },
        {
          slug: "singapore",
          city: "Singapur",
          days: 3,
          description: "Arquitectura moderna, barrios diversos y comida excepcional.",
        },
        {
          slug: "bangkok",
          city: "Bangkok",
          days: 3,
          description: "Templos dorados, mercados flotantes y comida callejera vibrante.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "new-york": {
      slug: "new-york",
      city: "Nueva York",
      country: "EE.UU.",
      days: 4,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de museos", "Exploradores de barrios"],
      style: ["Barrios icónicos", "Museos de clase mundial", "Escenas gastronómicas diversas"],
      pacing: [
        "Nueva York recompensa un ritmo calmado a pesar de su energía. Enfoca cada día en una zona principal y deja tiempo para paseos por barrios, descubrimientos espontáneos de comida y tiempo relajado en parques.",
        "Agrupa el tiempo por distrito y grupos de barrios. Combina los museos de Manhattan con Central Park, dedica otro día a Brooklyn para puentes y vida local, luego explora diferentes barrios de Manhattan para contraste.",
        "Reserva tiempo sin prisas para paseos largos por parques, exploración de barrios y las comidas relajadas que muestran la excepcional diversidad gastronómica de Nueva York.",
      ],
      hero: {
        title: "Nueva York en 4 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, cubriendo barrios icónicos, museos de clase mundial y escenas gastronómicas diversas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/New_York_City_Skyline.jpg",
          alt: "Skyline de Nueva York con edificios icónicos y Central Park.",
        },
      },
      cityStats: [
        { value: "8,3M", label: "Habitantes en la ciudad" },
        { value: "5", label: "Distritos en la ciudad" },
        { value: "100+", label: "Museos y galerías" },
        { value: "24.000+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Monumentos icónicos", "Museos de clase mundial", "Barrios diversos", "Tránsito público eficiente", "Parques y espacios verdes"],
        notForYou: ["Una agenda muy cargada solo de compras", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Núcleo de Manhattan",
          summary: "Central Park, museos y Upper East Side.",
          morning: "Central Park y paseo por el embalse",
          afternoon: "Museo Metropolitano o Museo de Historia Natural",
          evening: "Upper East Side o cena en barrio",
        },
        {
          day: 2,
          title: "Midtown e íconos",
          summary: "Times Square, Empire State y lugares clásicos.",
          morning: "Times Square y área de Broadway",
          afternoon: "Empire State Building o High Line",
          evening: "Distrito de teatros o exploración de barrios",
        },
        {
          day: 3,
          title: "Brooklyn y puentes",
          summary: "Brooklyn Bridge, DUMBO y barrios locales.",
          morning: "Paseo por Brooklyn Bridge desde Manhattan",
          afternoon: "DUMBO y Brooklyn Heights",
          evening: "Cena en barrio de Brooklyn",
        },
        {
          day: 4,
          title: "Barrios y cultura",
          summary: "SoHo, Greenwich Village o tiempo relajado.",
          morning: "Paseo por SoHo o Greenwich Village",
          afternoon: "Exploración de barrios y compras",
          evening: "Cena en West Village o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Skyline icónico",
          description:
            "El skyline de Nueva York es instantáneamente reconocible. Las vistas desde Brooklyn Bridge, Central Park o plataformas de observación muestran la escala y energía de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Bridge_New_York.jpg",
            alt: "Brooklyn Bridge con skyline de Manhattan al fondo.",
          },
        },
        {
          title: "Museos de clase mundial",
          description:
            "El Museo Metropolitano y el Museo de Historia Natural ofrecen colecciones de clase mundial. Planifica una visita enfocada, luego equilíbrala con tiempo en parques y paseos por barrios.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Metropolitan_Museum_New_York.jpg",
            alt: "Edificio del Museo Metropolitano de Arte con gran arquitectura.",
          },
        },
        {
          title: "Barrios diversos",
          description:
            "Desde SoHo hasta Greenwich Village, los barrios de Nueva York tienen cada uno carácter distintivo. Los paseos lentos revelan tiendas locales, cafés y vida residencial.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Greenwich_Village_New_York.jpg",
            alt: "Calle de Greenwich Village con edificios de brownstone y aceras con árboles.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a noviembre" },
        { label: "Traslado aeropuerto", value: "AirTrain y metro o taxi al centro" },
        { label: "Transporte", value: "Obtén una MetroCard para fácil acceso a metro y autobuses" },
        { label: "Entradas", value: "Reserva museos principales y plataformas de observación con antelación" },
        { label: "Zona para alojarte", value: "Manhattan (Midtown, Upper East/West) o Brooklyn" },
      ],
      checklist: [
        "Obtén una MetroCard para tránsito",
        "Reserva entradas de museos principales con antelación",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Nueva York",
        "Planifica un paseo largo por parques",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 4 días para Nueva York?",
          answer:
            "Sí para lo esencial. Este plan equilibra monumentos icónicos, museos y barrios con suficiente margen para tiempo en parques, descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "Para museos principales como el Met y plataformas de observación como Empire State Building, sí—reserva con antelación para entrada con horario y esperas más cortas, sobre todo en temporada alta.",
        },
        {
          question: "¿Es Nueva York caminable?",
          answer:
            "Los barrios son caminables, pero Nueva York es vasta. Usa el eficiente sistema de metro para distancias largas, luego explora a pie dentro de cada área. Caminar entre barrios cercanos también es agradable.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Manhattan ofrece ubicación central y fácil acceso a lugares principales. Midtown proporciona buenas conexiones de tránsito, mientras que Upper East/West ofrece calles más tranquilas cerca de Central Park.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para museos para evitar multitudes. Central Park es agradable durante todo el día. Las tardes pueden incluir paseos por barrios o paradas interiores.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana y para cena. Muchos lugares aceptan llegadas sin reserva para almuerzo. Los mercados gastronómicos y lugares casuales no requieren reservas.",
        },
        {
          question: "¿Es Nueva York segura?",
          answer:
            "Sí, generalmente muy segura, especialmente en áreas turísticas. Usa sentido común, mantente consciente de tu entorno y evita áreas aisladas tarde en la noche. El metro es seguro y eficiente.",
        },
      ],
      relatedItineraries: [
        {
          slug: "london",
          city: "Londres",
          days: 3,
          description: "Íconos, museos y barrios a través del Támesis.",
        },
        {
          slug: "paris",
          city: "París",
          days: 3,
          description: "Monumentos clásicos, museos y barrios de cafés.",
        },
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Barrios en colinas, paseos junto al agua y cocina diversa.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "san-francisco": {
      slug: "san-francisco",
      city: "San Francisco",
      country: "EE.UU.",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de la comida", "Exploradores de barrios"],
      style: ["Barrios en colinas", "Paseos junto al agua", "Cocina diversa"],
      pacing: [
        "San Francisco recompensa un ritmo calmado a través de sus barrios en colinas. Enfoca cada día en una zona principal y deja tiempo para paseos junto al agua, descubrimientos espontáneos de comida y tiempo relajado en parques.",
        "Agrupa el tiempo por distrito. Combina Fisherman's Wharf con North Beach para lugares clásicos, dedica otro día a Golden Gate Bridge y Presidio, luego explora barrios como Mission o Haight-Ashbury para carácter local.",
        "Reserva tiempo sin prisas para paseos largos junto al agua, exploración de barrios y las comidas relajadas que muestran la excepcional diversidad gastronómica de San Francisco.",
      ],
      hero: {
        title: "San Francisco en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con barrios en colinas, paseos junto al agua y cocina diversa.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1600&q=80",
          alt: "Puente Golden Gate en San Francisco con bahía y ciudad al fondo.",
        },
      },
      cityStats: [
        { value: "875K", label: "Habitantes en la ciudad" },
        { value: "43", label: "Colinas en la ciudad" },
        { value: "200+", label: "Parques y espacios verdes" },
        { value: "4.500+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Puente Golden Gate icónico", "Barrios en colinas", "Paseos junto al agua", "Escenas gastronómicas diversas", "Parques y espacios verdes"],
        notForYou: ["Una agenda muy cargada solo de compras", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Golden Gate y Presidio",
          summary: "Puente Golden Gate, Presidio y zona junto al agua.",
          morning: "Paseo o bicicleta por Puente Golden Gate",
          afternoon: "Presidio y Crissy Field",
          evening: "Distrito Marina o cena en barrio",
        },
        {
          day: 2,
          title: "Fisherman's Wharf y Alcatraz",
          summary: "Zona junto al agua, Alcatraz y lugares clásicos.",
          morning: "Tour de Alcatraz (reserva con antelación)",
          afternoon: "Fisherman's Wharf y Pier 39",
          evening: "Cena en barrio North Beach",
        },
        {
          day: 3,
          title: "Barrios y cultura",
          summary: "Mission, Haight-Ashbury o tiempo relajado.",
          morning: "Distrito Mission y murales",
          afternoon: "Haight-Ashbury o Golden Gate Park",
          evening: "Cena en barrio o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Golden Gate icónico",
          description:
            "El Puente Golden Gate es la seña de identidad de San Francisco. Caminar o andar en bicicleta a través ofrece vistas de la bahía y una sensación de la escala y entorno natural de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Golden_Gate_Bridge_Walk.jpg",
            alt: "Personas caminando por Puente Golden Gate con vistas de la bahía.",
          },
        },
        {
          title: "Barrios en colinas",
          description:
            "Las colinas de San Francisco crean barrios distintos con carácter. Desde North Beach hasta Mission, cada área ofrece tiendas locales, cafés y encanto residencial.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/San_Francisco_Hills.jpg",
            alt: "Barrio en colina de San Francisco con casas coloridas y calles empinadas.",
          },
        },
        {
          title: "Paseos junto al agua",
          description:
            "El Embarcadero y Marina ofrecen caminos largos junto al agua. Los paseos lentos proporcionan vistas de la bahía, tiempo en parques y fácil acceso a barrios y comida.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Embarcadero_San_Francisco.jpg",
            alt: "Zona junto al agua Embarcadero en San Francisco con bahía y skyline de la ciudad.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a octubre para clima más cálido y seco" },
        { label: "Traslado aeropuerto", value: "Tren BART o taxi al centro" },
        { label: "Transporte", value: "Obtén una tarjeta Clipper para fácil acceso a Muni y BART" },
        { label: "Entradas", value: "Reserva tours de Alcatraz con mucha antelación" },
        { label: "Zona para alojarte", value: "Union Square, Fisherman's Wharf o áreas Mission" },
      ],
      checklist: [
        "Reserva tour de Alcatraz con mucha antelación",
        "Obtén una tarjeta Clipper para tránsito",
        "Empaca zapatos cómodos para caminar en colinas",
        "Guarda mapas offline para San Francisco",
        "Planifica un paseo largo junto al agua",
        "Lleva capas para clima cambiante",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para San Francisco?",
          answer:
            "Sí para lo esencial. Este plan equilibra lugares icónicos, barrios y tiempo junto al agua con suficiente margen para descubrimientos gastronómicos, paseos por parques y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar Alcatraz con antelación?",
          answer:
            "Sí, absolutamente. Los tours de Alcatraz se agotan semanas antes, especialmente en temporada alta. Reserva lo antes posible a través del sitio web oficial del Servicio de Parques Nacionales.",
        },
        {
          question: "¿Es San Francisco caminable?",
          answer:
            "Los barrios son caminables, pero San Francisco tiene colinas. Usa Muni y BART para distancias largas, luego explora a pie dentro de cada área. Las colinas son parte de la experiencia.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Union Square ofrece ubicación central y buen tránsito. Fisherman's Wharf proporciona acceso junto al agua, mientras que Mission ofrece carácter local y escenas gastronómicas.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Puente Golden Gate para evitar multitudes y niebla. Los tours de Alcatraz tienen horarios establecidos. Las tardes pueden incluir paseos por barrios o paradas interiores.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva para almuerzo. Los mercados gastronómicos y lugares casuales no requieren reservas.",
        },
        {
          question: "¿Qué pasa con el clima?",
          answer:
            "San Francisco tiene microclimas y puede ser fresco incluso en verano. Trae capas—la niebla es común, especialmente cerca del agua. La ciudad es conocida por su clima cambiante.",
        },
      ],
      relatedItineraries: [
        {
          slug: "new-york",
          city: "Nueva York",
          days: 4,
          description: "Barrios icónicos, museos de clase mundial y escenas gastronómicas diversas.",
        },
        {
          slug: "los-angeles",
          city: "Los Ángeles",
          days: 3,
          description: "Playas, barrios icónicos y vibraciones costeras relajadas.",
        },
        {
          slug: "london",
          city: "Londres",
          days: 3,
          description: "Íconos, museos y barrios a través del Támesis.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "los-angeles": {
      slug: "los-angeles",
      city: "Los Ángeles",
      country: "EE.UU.",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de playas", "Buscadores de entretenimiento"],
      style: ["Playas", "Barrios icónicos", "Vibraciones costeras relajadas"],
      pacing: [
        "Los Ángeles recompensa un ritmo calmado a través de sus barrios extendidos. Enfoca cada día en una zona principal y deja tiempo para tiempo en playas, descubrimientos espontáneos de comida y paseos relajados por barrios.",
        "Agrupa el tiempo por región. Combina Santa Monica con Venice para cultura de playa, dedica otro día a Hollywood y Griffith Observatory, luego explora barrios como Beverly Hills o Downtown para contraste.",
        "Reserva tiempo sin prisas para paseos largos por playas, exploración de barrios y las comidas relajadas que muestran la diversa cultura gastronómica de LA.",
      ],
      hero: {
        title: "Los Ángeles en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, equilibrando playas, barrios icónicos y vibraciones costeras relajadas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1756072226051-f6835aec4f9a?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline del centro de Los Ángeles al atardecer con luces de la ciudad.",
        },
      },
      cityStats: [
        { value: "4M", label: "Habitantes en la ciudad" },
        { value: "75", label: "Millas de costa" },
        { value: "88", label: "Ciudades incorporadas en el Condado de LA" },
        { value: "10.000+", label: "Restaurantes en toda el área metropolitana" },
      ],
      fit: {
        forYou: ["Tiempo en playas y paseos costeros", "Barrios icónicos", "Cultura de entretenimiento", "Escenas gastronómicas diversas", "Ritmo relajado"],
        notForYou: ["Una agenda muy cargada solo de parques temáticos", "Solo enfocado en museos", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Playas y costa",
          summary: "Santa Monica, Venice Beach y cultura de playa.",
          morning: "Muelle de Santa Monica y playa",
          afternoon: "Venice Beach boardwalk y canales",
          evening: "Atardecer en playa y cena",
        },
        {
          day: 2,
          title: "Hollywood y vistas",
          summary: "Griffith Observatory, Hollywood y lugares icónicos.",
          morning: "Griffith Observatory y parque",
          afternoon: "Hollywood Walk of Fame y área",
          evening: "Sunset Boulevard o cena en barrio",
        },
        {
          day: 3,
          title: "Barrios y cultura",
          summary: "Beverly Hills, Downtown o tiempo relajado.",
          morning: "Beverly Hills o Downtown LA",
          afternoon: "Exploración de barrios y compras",
          evening: "Cena en barrio o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Playas icónicas",
          description:
            "Santa Monica y Venice Beach muestran la cultura costera de LA por una buena razón. Los paseos largos por playas, visitas a muelles y tiempo relajado junto al agua son centrales para la cultura de LA.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Venice_Beach_Los_Angeles.jpg",
            alt: "Boardwalk de Venice Beach con palmeras y océano.",
          },
        },
        {
          title: "Griffith Observatory",
          description:
            "Griffith Observatory ofrece vistas de la ciudad y una sensación de la escala de LA. El parque que lo rodea proporciona espacio verde y senderos para caminar con panoramas de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Griffith_Observatory_Los_Angeles.jpg",
            alt: "Griffith Observatory con skyline de la ciudad al fondo.",
          },
        },
        {
          title: "Barrios diversos",
          description:
            "Desde Beverly Hills hasta Downtown, los barrios de LA tienen cada uno carácter distintivo. Los paseos o caminatas lentas revelan tiendas locales, cafés y encanto residencial.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Beverly_Hills_Los_Angeles.jpg",
            alt: "Calle de Beverly Hills con palmeras y tiendas exclusivas.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Todo el año, aunque primavera y otoño son más agradables" },
        { label: "Traslado aeropuerto", value: "Autobús FlyAway o taxi al centro" },
        { label: "Transporte", value: "Se recomienda auto de alquiler; Metro para algunas áreas" },
        { label: "Entradas", value: "Reserva atracciones principales como Universal Studios con antelación" },
        { label: "Zona para alojarte", value: "Áreas de Santa Monica, Hollywood o Downtown" },
      ],
      checklist: [
        "Considera auto de alquiler para flexibilidad",
        "Reserva atracciones principales con antelación",
        "Empaca artículos esenciales para playa y protector solar",
        "Guarda mapas offline para Los Ángeles",
        "Planifica un paseo largo por playa",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Los Ángeles?",
          answer:
            "Sí para lo esencial. Este plan equilibra playas, barrios icónicos y cultura de entretenimiento con suficiente margen para descubrimientos gastronómicos, tiempo relajado y paradas no planificadas.",
        },
        {
          question: "¿Necesito un auto en LA?",
          answer:
            "Un auto de alquiler proporciona la mayor flexibilidad, ya que LA está extendido. Existe tránsito público pero es limitado. Los servicios de transporte compartido también están ampliamente disponibles y son convenientes.",
        },
        {
          question: "¿Es Los Ángeles caminable?",
          answer:
            "Los barrios pueden ser caminables, pero LA está muy extendido. Las áreas de playa como Santa Monica y Venice son más caminables. La mayoría de áreas requieren transporte entre ellas.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Santa Monica ofrece acceso a playas y áreas caminables. Hollywood proporciona ubicación central, mientras que Downtown ofrece carácter urbano y buenas conexiones de tránsito.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para playas para evitar multitudes y conseguir estacionamiento. Griffith Observatory es agradable durante todo el día. Las tardes pueden incluir exploración de barrios.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva para almuerzo. Los quioscos de playa y lugares casuales no requieren reservas.",
        },
        {
          question: "¿Qué pasa con el tráfico?",
          answer:
            "El tráfico de LA es real. Planifica tiempo extra para conducir, especialmente durante horas pico. Considera quedarte en un área por día para minimizar tiempo de conducción.",
        },
      ],
      relatedItineraries: [
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Barrios en colinas, paseos junto al agua y cocina diversa.",
        },
        {
          slug: "sydney",
          city: "Sídney",
          days: 3,
          description: "Vistas del puerto, paseos costeros y tiempo relajado en playas.",
        },
        {
          slug: "new-york",
          city: "Nueva York",
          days: 4,
          description: "Barrios icónicos, museos de clase mundial y escenas gastronómicas diversas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    sydney: {
      slug: "sydney",
      city: "Sídney",
      country: "Australia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de playas", "Entusiastas del puerto"],
      style: ["Vistas del puerto", "Paseos costeros", "Tiempo relajado en playas"],
      pacing: [
        "Sídney recompensa un ritmo calmado a través de su puerto y áreas costeras. Enfoca cada día en una zona principal y deja tiempo para paseos por el puerto, tiempo en playas y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por región. Combina la Ópera con Circular Quay para lugares icónicos, dedica otro día a Bondi Beach y paseos costeros, luego explora barrios como The Rocks o Surry Hills para carácter local.",
        "Reserva tiempo sin prisas para paseos largos por el puerto, relajación en playas y las comidas relajadas que muestran la diversa cultura gastronómica de Sídney.",
      ],
      hero: {
        title: "Sídney en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con vistas del puerto, paseos costeros y tiempo relajado en playas.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80",
          alt: "Ópera de Sídney y Puente del Puerto con puerto en primer plano.",
        },
      },
      cityStats: [
        { value: "5,3M", label: "Habitantes en el área metropolitana" },
        { value: "100+", label: "Playas a lo largo de la costa" },
        { value: "70", label: "Islas del puerto" },
        { value: "3.000+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Ópera y Puente del Puerto icónicos", "Paseos por el puerto y viajes en ferry", "Tiempo en playas y paseos costeros", "Escenas gastronómicas diversas", "Ritmo relajado"],
        notForYou: ["Una agenda muy cargada solo de playas", "Solo enfocado en museos", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Íconos del puerto",
          summary: "Ópera de Sídney, Puente del Puerto y Circular Quay.",
          morning: "Tour de Ópera de Sídney o exterior",
          afternoon: "Circular Quay y paseo por Puente del Puerto",
          evening: "Área The Rocks y cena",
        },
        {
          day: 2,
          title: "Playas y costa",
          summary: "Bondi Beach, paseo costero y tiempo en playa.",
          morning: "Bondi Beach y paseo marítimo",
          afternoon: "Paseo costero a Coogee o Bronte",
          evening: "Cena en área de playa o regreso a la ciudad",
        },
        {
          day: 3,
          title: "Barrios y cultura",
          summary: "Royal Botanic Gardens, barrios o tiempo relajado.",
          morning: "Royal Botanic Gardens y Mrs. Macquarie's Chair",
          afternoon: "Surry Hills o exploración de barrios",
          evening: "Cena en barrio o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Puerto icónico",
          description:
            "La Ópera y el Puente del Puerto definen el skyline de Sídney. Los paseos por el puerto y viajes en ferry proporcionan las mejores vistas y una sensación de la relación de la ciudad con el agua.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sydney_Harbour_Ferry.jpg",
            alt: "Ferry en el Puerto de Sídney con Ópera y puente al fondo.",
          },
        },
        {
          title: "Paseos costeros",
          description:
            "El paseo costero de Bondi a Coogee muestra la cultura de playa de Sídney. El sendero ofrece vistas del océano, acceso a playas y un ritmo relajado que se siente tanto activo como pacífico.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bondi_Beach_Sydney.jpg",
            alt: "Bondi Beach en Sídney con arena dorada y océano.",
          },
        },
        {
          title: "Barrios del puerto",
          description:
            "The Rocks preserva carácter histórico cerca del puerto, mientras que barrios como Surry Hills ofrecen cafés locales, tiendas y encanto residencial.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Rocks_Sydney.jpg",
            alt: "Barrio The Rocks en Sídney con edificios históricos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Septiembre a noviembre o marzo a mayo" },
        { label: "Traslado aeropuerto", value: "Tren Airport Link o taxi al centro" },
        { label: "Transporte", value: "Obtén una tarjeta Opal para fácil acceso a ferries, trenes y autobuses" },
        { label: "Entradas", value: "Reserva tours de la Ópera con antelación" },
        { label: "Zona para alojarte", value: "Circular Quay, The Rocks o áreas Bondi" },
      ],
      checklist: [
        "Obtén una tarjeta Opal para tránsito",
        "Reserva tour de la Ópera con antelación",
        "Empaca artículos esenciales para playa y protector solar",
        "Guarda mapas offline para Sídney",
        "Planifica un viaje en ferry por el puerto",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Sídney?",
          answer:
            "Sí para lo esencial. Este plan equilibra íconos del puerto, playas y barrios con suficiente margen para paseos costeros, descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar tours de la Ópera?",
          answer:
            "Sí, reserva con antelación para tours guiados. También puedes ver el exterior y disfrutar las vistas del puerto sin un tour. El edificio es impresionante desde fuera.",
        },
        {
          question: "¿Es Sídney caminable?",
          answer:
            "Las áreas del puerto y barrios son caminables, pero Sídney está extendido. Usa ferries, trenes y autobuses para distancias largas, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Circular Quay ofrece vistas del puerto y fácil acceso a lugares principales. The Rocks proporciona carácter histórico, mientras que Bondi ofrece acceso a playas y vibraciones relajadas.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para playas para evitar multitudes y conseguir buena luz. Las áreas del puerto son agradables durante todo el día. Las tardes pueden incluir paseos por barrios.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva para almuerzo. Los mercados gastronómicos y lugares casuales no requieren reservas.",
        },
        {
          question: "¿Qué pasa con el clima?",
          answer:
            "Sídney tiene un clima templado. Los veranos (dic-feb) son cálidos, los inviernos (jun-ago) son suaves. Trae capas y protector solar todo el año. El clima es generalmente agradable.",
        },
      ],
      relatedItineraries: [
        {
          slug: "melbourne",
          city: "Melbourne",
          days: 3,
          description: "Cultura de callejones, escenas de café y barrios relajados.",
        },
        {
          slug: "los-angeles",
          city: "Los Ángeles",
          days: 3,
          description: "Playas, barrios icónicos y vibraciones costeras relajadas.",
        },
        {
          slug: "san-francisco",
          city: "San Francisco",
          days: 3,
          description: "Barrios en colinas, paseos junto al agua y cocina diversa.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    melbourne: {
      slug: "melbourne",
      city: "Melbourne",
      country: "Australia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes del café", "Buscadores de cultura"],
      style: ["Cultura de callejones", "Escenas de café", "Barrios relajados"],
      pacing: [
        "Melbourne recompensa un ritmo calmado a través de sus callejones y barrios. Enfoca cada día en una zona principal y deja tiempo para paradas en cafés, descubrimientos espontáneos de comida y paseos relajados por barrios.",
        "Agrupa el tiempo por distrito. Combina el CBD con callejones para café y cultura, dedica otro día a St. Kilda o Fitzroy para carácter local, luego explora mercados y barrios para contraste.",
        "Reserva tiempo sin prisas para sesiones largas en cafés, exploración de callejones y las comidas relajadas que muestran la excepcional cultura gastronómica y de café de Melbourne.",
      ],
      hero: {
        title: "Melbourne en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, enfocado en cultura de callejones, escenas de café y barrios relajados.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1757807776083-221d653b161b?auto=format&fit=crop&w=1600&q=80",
          alt: "Skyline de Melbourne con río Yarra y arquitectura moderna.",
        },
      },
      cityStats: [
        { value: "5M", label: "Habitantes en el área metropolitana" },
        { value: "40+", label: "Callejones con arte callejero" },
        { value: "2.000+", label: "Cafés en toda la ciudad" },
        { value: "4.000+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Exploración de callejones", "Cultura de café", "Escenas gastronómicas diversas", "Barrios relajados", "Arte y cultura"],
        notForYou: ["Una agenda muy cargada solo de playas", "Enfoque en monumentos icónicos", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "CBD y callejones",
          summary: "Federation Square, callejones y cultura de café.",
          morning: "Federation Square y Flinders Street Station",
          afternoon: "Exploración de callejones y arte callejero",
          evening: "Cena en CBD o exploración de barrios",
        },
        {
          day: 2,
          title: "Mercados y barrios",
          summary: "Queen Victoria Market, barrios y vida local.",
          morning: "Queen Victoria Market",
          afternoon: "Paseo por barrio Fitzroy o St. Kilda",
          evening: "Cena en barrio y escena local",
        },
        {
          day: 3,
          title: "Cultura y relajación",
          summary: "Royal Botanic Gardens, museos o tiempo relajado.",
          morning: "Royal Botanic Gardens o Galería Nacional",
          afternoon: "Exploración de barrios o compras",
          evening: "Cena relajada o tiempo en café",
        },
      ],
      imageInfoCards: [
        {
          title: "Cultura de callejones",
          description:
            "Los callejones de Melbourne son joyas ocultas con arte callejero, cafés y carácter local. Los paseos lentos revelan murales, cafeterías y una energía creativa que define la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hosier_Lane_Melbourne.jpg",
            alt: "Hosier Lane en Melbourne con arte callejero colorido y murales.",
          },
        },
        {
          title: "Cultura de café",
          description:
            "Melbourne es conocida por su excepcional escena de café. Las sesiones largas en cafés, flat whites y mañanas relajadas son centrales para el ritmo local.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Melbourne_Cafe.jpg",
            alt: "Cafetería en callejón de Melbourne con asientos al aire libre.",
          },
        },
        {
          title: "Barrios relajados",
          description:
            "Fitzroy y St. Kilda muestran el carácter de barrio de Melbourne con tiendas locales, cafés y encanto residencial que se siente tanto creativo como relajado.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Fitzroy_Melbourne.jpg",
            alt: "Barrio Fitzroy en Melbourne con edificios coloridos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Septiembre a noviembre o marzo a mayo" },
        { label: "Traslado aeropuerto", value: "SkyBus o taxi al centro" },
        { label: "Transporte", value: "Obtén una tarjeta myki para fácil acceso a tranvías, trenes y autobuses" },
        { label: "Entradas", value: "Reserva atracciones principales con antelación si es necesario" },
        { label: "Zona para alojarte", value: "CBD, Fitzroy o áreas St. Kilda" },
      ],
      checklist: [
        "Obtén una tarjeta myki para tránsito",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Melbourne",
        "Planifica una sesión larga en café",
        "Explora callejones con arte callejero",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Melbourne?",
          answer:
            "Sí para lo esencial. Este plan equilibra callejones, barrios y mercados con suficiente margen para tiempo en cafés, descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "La mayoría de callejones y barrios no requieren reserva. Para museos principales o eventos especiales, verifica con antelación. Los mercados están abiertos y accesibles.",
        },
        {
          question: "¿Es Melbourne caminable?",
          answer:
            "El CBD y barrios son muy caminables. Los tranvías proporcionan fácil acceso entre áreas. Melbourne es conocida por ser amigable para peatones.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "CBD ofrece ubicación central y fácil acceso a callejones. Fitzroy proporciona carácter local, mientras que St. Kilda ofrece acceso a playas y vibraciones relajadas.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para mercados para evitar multitudes. Los callejones son agradables durante todo el día. Las tardes pueden incluir paseos por barrios o tiempo en cafés.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos cafés y lugares casuales aceptan llegadas sin reserva. Los mercados gastronómicos no requieren reservas.",
        },
        {
          question: "¿Qué pasa con el café?",
          answer:
            "El café de Melbourne es excepcional. No te pierdas probar un flat white y tómate tiempo para explorar diferentes cafés. La cultura del café es una parte central de la experiencia.",
        },
      ],
      relatedItineraries: [
        {
          slug: "sydney",
          city: "Sídney",
          days: 3,
          description: "Vistas del puerto, paseos costeros y tiempo relajado en playas.",
        },
        {
          slug: "amsterdam",
          city: "Ámsterdam",
          days: 3,
          description: "Paseos por canales, museos de clase mundial y barrios relajados.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 4,
          description: "Arquitectura de Gaudí, barrios caminables y playas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    dubai: {
      slug: "dubai",
      city: "Dubái",
      country: "EAU",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Fans de arquitectura moderna", "Buscadores de lujo"],
      style: ["Arquitectura moderna", "Souks tradicionales", "Experiencias en el desierto"],
      pacing: [
        "Dubái recompensa un ritmo calmado a través de su mezcla de moderno y tradicional. Enfoca cada día en una zona principal y deja tiempo para visitas a souks, descubrimientos espontáneos de comida y tiempo relajado junto al agua.",
        "Agrupa el tiempo por distrito. Combina Burj Khalifa con Dubai Mall para íconos modernos, dedica otro día a souks tradicionales y Dubái antiguo, luego explora una experiencia en el desierto o playa para contraste.",
        "Reserva tiempo sin prisas para paseos por souks, visitas largas a centros comerciales y las comidas relajadas que muestran la diversa cultura gastronómica de Dubái.",
      ],
      hero: {
        title: "Dubái en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, combinando arquitectura moderna, souks tradicionales y experiencias en el desierto.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
          alt: "Burj Khalifa en Dubái con skyline moderno.",
        },
      },
      cityStats: [
        { value: "3,4M", label: "Habitantes en la ciudad" },
        { value: "828m", label: "Altura del Burj Khalifa (más alto del mundo)" },
        { value: "200+", label: "Nacionalidades en la ciudad" },
        { value: "365", label: "Días de sol al año" },
      ],
      fit: {
        forYou: ["Arquitectura moderna", "Souks tradicionales", "Experiencias en el desierto", "Compras de lujo", "Escenas gastronómicas diversas"],
        notForYou: ["Una agenda muy cargada solo de centros comerciales", "Solo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Íconos modernos",
          summary: "Burj Khalifa, Dubai Mall y arquitectura moderna.",
          morning: "Plataforma de observación Burj Khalifa",
          afternoon: "Dubai Mall y Dubai Fountain",
          evening: "Espectáculo de fuentes y cena",
        },
        {
          day: 2,
          title: "Dubái tradicional",
          summary: "Gold Souk, Spice Souk y Dubái antiguo.",
          morning: "Gold Souk y Spice Souk",
          afternoon: "Museo de Dubái y Distrito Histórico Al Fahidi",
          evening: "Dubai Creek y cena tradicional",
        },
        {
          day: 3,
          title: "Desierto o playa",
          summary: "Safari en el desierto, tiempo en playa o exploración relajada.",
          morning: "Safari en el desierto o Jumeirah Beach",
          afternoon: "Tiempo en playa o Palm Jumeirah",
          evening: "Cena relajada o regreso del desierto",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura moderna",
          description:
            "Burj Khalifa y el skyline de Dubái muestran diseño moderno ambicioso. La plataforma de observación ofrece vistas de la ciudad, mientras que el área circundante proporciona compras y restaurantes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubai_Marina_Skyline.jpg",
            alt: "Skyline de Dubai Marina con rascacielos modernos.",
          },
        },
        {
          title: "Souks tradicionales",
          description:
            "El Gold Souk y Spice Souk preservan la cultura de mercado tradicional. Los paseos lentos revelan productos locales, regateo y un lado auténtico de Dubái más allá de los íconos modernos.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Gold_Souk_Dubai.jpg",
            alt: "Gold Souk en Dubái con tiendas y arquitectura tradicional.",
          },
        },
        {
          title: "Experiencias en el desierto",
          description:
            "Los safaris en el desierto ofrecen dune bashing, paseos en camello y vistas al atardecer. El contraste entre ciudad y desierto muestra el entorno único de Dubái.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dubai_Desert.jpg",
            alt: "Dunas del desierto en Dubái con colores del atardecer.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Noviembre a marzo para clima más fresco" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Obtén una tarjeta Nol para fácil acceso a Metro y autobuses" },
        { label: "Entradas", value: "Reserva Burj Khalifa y safaris en el desierto con antelación" },
        { label: "Zona para alojarte", value: "Downtown Dubái, Dubai Marina o cerca de la playa" },
      ],
      checklist: [
        "Reserva entradas para Burj Khalifa con antelación",
        "Reserva safari en el desierto si te interesa",
        "Obtén una tarjeta Nol para tránsito",
        "Empaca ropa ligera y transpirable",
        "Guarda mapas offline para Dubái",
        "Lleva efectivo para souks",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Dubái?",
          answer:
            "Sí para lo esencial. Este plan equilibra íconos modernos, souks tradicionales y tiempo en el desierto con suficiente margen para descubrimientos gastronómicos, compras y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "Para Burj Khalifa, sí—reserva con antelación para entrada con horario. Los safaris en el desierto también deben reservarse con anticipación. Los souks y barrios no requieren reserva anticipada.",
        },
        {
          question: "¿Es Dubái caminable?",
          answer:
            "Algunas áreas son caminables, pero Dubái está extendido y puede hacer calor. Usa el Metro para distancias largas, luego explora a pie dentro de cada área. Los taxis también son convenientes.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Downtown Dubái ofrece proximidad a Burj Khalifa y Dubai Mall. Dubai Marina proporciona conveniencia moderna, mientras que las áreas cerca de la playa ofrecen estadías estilo resort.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para evitar calor, especialmente para actividades al aire libre. Los centros comerciales proporcionan descansos con aire acondicionado. Los safaris en el desierto típicamente corren por la tarde y noche.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes de alta gama, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva. Las zonas de comida en centros comerciales no requieren reservas.",
        },
        {
          question: "¿Qué pasa con el código de vestimenta?",
          answer:
            "Dubái es relativamente liberal, pero se aprecia vestimenta respetuosa, especialmente en áreas tradicionales. Las áreas de playa son más relajadas. Cubre hombros y rodillas en souks y mezquitas.",
        },
      ],
      relatedItineraries: [
        {
          slug: "singapore",
          city: "Singapur",
          days: 3,
          description: "Arquitectura moderna, barrios diversos y comida excepcional.",
        },
        {
          slug: "tokyo",
          city: "Tokio",
          days: 4,
          description: "Templos tradicionales, distritos modernos y cultura gastronómica excepcional.",
        },
        {
          slug: "hong-kong",
          city: "Hong Kong",
          days: 3,
          description: "Vistas del skyline, mercados tradicionales y escapes fáciles a islas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    marrakech: {
      slug: "marrakech",
      city: "Marruecos",
      country: "Marruecos",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Buscadores de cultura", "Amantes de mercados"],
      style: ["Medinas históricas", "Souks vibrantes", "Jardines tranquilos"],
      pacing: [
        "Marruecos recompensa un ritmo calmado a pesar de su energía. Enfoca cada día en una zona principal y deja tiempo para visitas a souks, descansos en jardines y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por zona. Combina la medina con souks para cultura tradicional, dedica otro día a jardines y palacios, luego explora barrios como Gueliz para contraste moderno.",
        "Reserva tiempo sin prisas para paseos por souks, visitas largas a jardines y las comidas relajadas que muestran la excepcional cultura gastronómica de Marruecos.",
      ],
      hero: {
        title: "Marruecos en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con medinas históricas, souks vibrantes y jardines tranquilos.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=1600&q=80",
          alt: "Plaza Jemaa el-Fnaa en Marruecos con luces nocturnas y actividad.",
        },
      },
      cityStats: [
        { value: "1M", label: "Habitantes en la ciudad" },
        { value: "700+", label: "Años de historia" },
        { value: "18", label: "Puertas a la medina" },
        { value: "1.000+", label: "Puestos de souk en la medina" },
      ],
      fit: {
        forYou: ["Exploración de medina histórica", "Compras en souks vibrantes", "Visitas a jardines tranquilos", "Experiencias gastronómicas tradicionales", "Inmersión cultural"],
        notForYou: ["Una agenda muy cargada solo de compras", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Medina y souks",
          summary: "Jemaa el-Fnaa, souks y cultura tradicional.",
          morning: "Plaza Jemaa el-Fnaa",
          afternoon: "Exploración de souks y compras",
          evening: "Plaza al atardecer y cena",
        },
        {
          day: 2,
          title: "Palacios y jardines",
          summary: "Palacio Bahía, Jardín Majorelle y tranquilidad.",
          morning: "Palacio Bahía",
          afternoon: "Jardín Majorelle",
          evening: "Barrio Gueliz o regreso a medina",
        },
        {
          day: 3,
          title: "Cultura y relajación",
          summary: "Tumbas Saadíes, barrios o tiempo relajado.",
          morning: "Tumbas Saadíes o paseo por medina",
          afternoon: "Exploración de barrios o hammam",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Medina histórica",
          description:
            "La medina de Marruecos es un sitio del Patrimonio Mundial de la UNESCO con callejones estrechos, arquitectura tradicional y una cualidad laberíntica que recompensa la exploración lenta.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marrakech_Medina.jpg",
            alt: "Callejón estrecho en medina de Marruecos con arquitectura tradicional.",
          },
        },
        {
          title: "Souks vibrantes",
          description:
            "Los souks ofrecen todo desde especias hasta productos de cuero. Los paseos lentos revelan artesanías locales, cultura de regateo y una experiencia de mercado auténtica.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marrakech_Souk.jpg",
            alt: "Souk colorido en Marruecos con especias y productos.",
          },
        },
        {
          title: "Jardines tranquilos",
          description:
            "El Jardín Majorelle y otros espacios verdes proporcionan contraste pacífico con la energía de la medina. Estos oasis ofrecen momentos tranquilos y diseño hermoso.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Majorelle_Garden_Marrakech.jpg",
            alt: "Jardín Majorelle en Marruecos con edificios azules y plantas.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Octubre a abril para clima más fresco" },
        { label: "Traslado aeropuerto", value: "Taxi o autobús del aeropuerto al centro" },
        { label: "Transporte", value: "Camina la medina; taxis para distancias largas" },
        { label: "Entradas", value: "Compra entradas de palacios y jardines en el lugar" },
        { label: "Zona para alojarte", value: "Medina (cerca de Jemaa el-Fnaa) o Gueliz" },
      ],
      checklist: [
        "Empaca zapatos cómodos para caminar",
        "Trae efectivo para souks y mercados",
        "Guarda mapas offline para Marruecos",
        "Planifica una visita a jardines",
        "Respeta costumbres y vestimenta locales",
        "Lleva una botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Marruecos?",
          answer:
            "Sí para lo esencial. Este plan equilibra exploración de medina, souks y jardines con suficiente margen para descubrimientos gastronómicos, experiencias culturales y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "La mayoría de palacios y jardines no requieren reserva anticipada. Compra entradas en el lugar. Para restaurantes populares, las reservas ayudan, especialmente durante temporada alta.",
        },
        {
          question: "¿Es Marruecos caminable?",
          answer:
            "La medina es muy caminable, aunque es un laberinto. Usa puntos de referencia para navegar. Los taxis son útiles para llegar a jardines y barrios fuera de la medina.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "La medina ofrece experiencias auténticas de riad cerca de la acción. Gueliz proporciona conveniencia moderna y es más tranquilo, con fácil acceso a jardines.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para souks para evitar calor y multitudes. Los jardines son agradables durante todo el día. Las noches son animadas en Jemaa el-Fnaa.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente para cena. Muchos lugares aceptan llegadas sin reserva. La comida callejera en Jemaa el-Fnaa no requiere reservas.",
        },
        {
          question: "¿Qué pasa con el regateo?",
          answer:
            "El regateo se espera en souks. Comienza aproximadamente a la mitad del precio solicitado y negocia educadamente. Es parte de la experiencia cultural, así que disfruta el proceso.",
        },
      ],
      relatedItineraries: [
        {
          slug: "cairo",
          city: "El Cairo",
          days: 3,
          description: "Pirámides antiguas, mezquitas históricas y mercados bulliciosos.",
        },
        {
          slug: "istanbul",
          city: "Estambul",
          days: 3,
          description: "Lugares principales del núcleo histórico, vistas en ferry y barrios en capas.",
        },
        {
          slug: "dubai",
          city: "Dubái",
          days: 3,
          description: "Arquitectura moderna, souks tradicionales y experiencias en el desierto.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    cairo: {
      slug: "cairo",
      city: "El Cairo",
      country: "Egipto",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Buscadores de cultura"],
      style: ["Pirámides antiguas", "Mezquitas históricas", "Mercados bulliciosos"],
      pacing: [
        "El Cairo recompensa un ritmo calmado a pesar de su energía. Enfoca cada día en una zona principal y deja tiempo para visitas a mercados, descansos en mezquitas y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por zona. Combina las Pirámides de Giza con una visita matutina, dedica otro día a El Cairo Islámico y mezquitas, luego explora el Museo Egipcio y Khan el-Khalili para cultura y compras.",
        "Reserva tiempo sin prisas para paseos por mercados, visitas largas a museos y las comidas relajadas que muestran la excepcional cultura gastronómica de El Cairo.",
      ],
      hero: {
        title: "El Cairo en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con pirámides antiguas, mezquitas históricas y mercados bulliciosos.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1716639154447-98e6cd8de2e8?auto=format&fit=crop&w=1600&q=80",
          alt: "Pirámides de Giza con Esfinge en primer plano, El Cairo.",
        },
      },
      cityStats: [
        { value: "10M", label: "Habitantes en el área metropolitana" },
        { value: "4.500+", label: "Años de historia" },
        { value: "3", label: "Pirámides principales en Giza" },
        { value: "1.000+", label: "Mezquitas en toda la ciudad" },
      ],
      fit: {
        forYou: ["Visitas a pirámides antiguas", "Exploración de mezquitas históricas", "Compras en mercados bulliciosos", "Visitas a museos", "Inmersión cultural"],
        notForYou: ["Una agenda muy cargada solo de pirámides", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Pirámides de Giza",
          summary: "Gran Pirámide, Esfinge y maravillas antiguas.",
          morning: "Pirámides de Giza y Esfinge",
          afternoon: "Exploración del complejo de pirámides",
          evening: "Regreso a la ciudad y cena",
        },
        {
          day: 2,
          title: "El Cairo Islámico",
          summary: "Mezquitas, calles históricas y cultura.",
          morning: "Mezquita Al-Azhar y área",
          afternoon: "Mercado Khan el-Khalili",
          evening: "Paseo por El Cairo Histórico y cena",
        },
        {
          day: 3,
          title: "Museo y cultura",
          summary: "Museo Egipcio, barrios o tiempo relajado.",
          morning: "Museo Egipcio",
          afternoon: "Exploración de barrios o El Cairo Copto",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Pirámides antiguas",
          description:
            "Las Pirámides de Giza están entre los lugares más icónicos del mundo. Las visitas temprano por la mañana ofrecen mejor luz y menos multitudes, con tiempo para apreciar su escala e historia.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Great_Pyramid_Giza.jpg",
            alt: "Gran Pirámide de Giza con desierto y cielo.",
          },
        },
        {
          title: "Mezquitas históricas",
          description:
            "El Cairo Islámico preserva siglos de arquitectura. Mezquitas como Al-Azhar muestran diseño intrincado y ofrecen momentos pacíficos alejados de la energía de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Azhar_Mosque_Cairo.jpg",
            alt: "Mezquita Al-Azhar en El Cairo con arquitectura islámica.",
          },
        },
        {
          title: "Mercados bulliciosos",
          description:
            "Khan el-Khalili ofrece cultura de mercado tradicional con especias, artesanías y productos locales. Los paseos lentos revelan regateo, vida local y experiencias auténticas.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Khan_el-Khalili_Cairo.jpg",
            alt: "Mercado Khan el-Khalili en El Cairo con tiendas y multitudes.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Octubre a abril para clima más fresco" },
        { label: "Traslado aeropuerto", value: "Taxi o autobús del aeropuerto al centro" },
        { label: "Transporte", value: "Usa taxis o tours organizados para pirámides; camina el centro de la ciudad" },
        { label: "Entradas", value: "Compra entradas de pirámides y museo en el lugar" },
        { label: "Zona para alojarte", value: "Downtown El Cairo o cerca de Khan el-Khalili" },
      ],
      checklist: [
        "Reserva tour de pirámides o organiza transporte",
        "Empaca zapatos cómodos para caminar",
        "Trae efectivo para mercados y propinas",
        "Guarda mapas offline para El Cairo",
        "Planifica una visita a museos",
        "Respeta costumbres y vestimenta locales",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para El Cairo?",
          answer:
            "Sí para lo esencial. Este plan equilibra pirámides, El Cairo Islámico y museos con suficiente margen para visitas a mercados, experiencias culturales y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar visitas a pirámides?",
          answer:
            "Puedes comprar entradas en el lugar, pero los tours organizados ayudan con transporte y contexto. Se recomiendan visitas temprano por la mañana para evitar calor y multitudes.",
        },
        {
          question: "¿Es El Cairo caminable?",
          answer:
            "El Cairo Islámico y downtown son caminables, pero El Cairo es vasto y puede ser caótico. Usa taxis para distancias largas. Las pirámides requieren transporte desde la ciudad.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Downtown El Cairo ofrece ubicación central y buen acceso. Las áreas cerca de Khan el-Khalili proporcionan carácter histórico y fácil acceso a mercados.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza muy temprano para pirámides para evitar calor y multitudes. Los museos y mezquitas son agradables durante todo el día. Los mercados son animados por la tarde y noche.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente para cena. Muchos lugares aceptan llegadas sin reserva. La comida callejera no requiere reservas.",
        },
        {
          question: "¿Qué pasa con la seguridad?",
          answer:
            "El Cairo es generalmente seguro para turistas, pero usa sentido común. Evita áreas aisladas de noche, ten cuidado con objetos de valor y considera tours guiados para pirámides.",
        },
      ],
      relatedItineraries: [
        {
          slug: "marrakech",
          city: "Marruecos",
          days: 3,
          description: "Medinas históricas, souks vibrantes y jardines tranquilos.",
        },
        {
          slug: "istanbul",
          city: "Estambul",
          days: 3,
          description: "Lugares principales del núcleo histórico, vistas en ferry y barrios en capas.",
        },
        {
          slug: "athens",
          city: "Atenas",
          days: 3,
          description: "Sitios antiguos, cafés de barrios y miradores al atardecer.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "buenos-aires": {
      slug: "buenos-aires",
      city: "Buenos Aires",
      country: "Argentina",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de cultura", "Entusiastas de la comida"],
      style: ["Arquitectura europea", "Cultura de tango", "Barrios vibrantes"],
      pacing: [
        "Buenos Aires recompensa un ritmo calmado a través de sus barrios con influencia europea. Enfoca cada día en una zona principal y deja tiempo para cultura de café, descubrimientos espontáneos de comida y paseos nocturnos relajados.",
        "Agrupa el tiempo por barrio. Combina La Boca con San Telmo para cultura colorida, dedica otro día a Recoleta y Palermo para arquitectura y parques, luego explora barrios para carácter local.",
        "Reserva tiempo sin prisas para sesiones largas en cafés, exploración de barrios y las comidas relajadas que muestran la excepcional cultura gastronómica y de vino de Buenos Aires.",
      ],
      hero: {
        title: "Buenos Aires en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, mezclando arquitectura europea, cultura de tango y barrios vibrantes.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1601352682292-ab6ced05c50c?auto=format&fit=crop&w=1600&q=80",
          alt: "Barrio colorido La Boca en Buenos Aires con bailarines de tango.",
        },
      },
      cityStats: [
        { value: "3M", label: "Habitantes en la ciudad" },
        { value: "48", label: "Barrios (barrios)" },
        { value: "100+", label: "Lugares de tango" },
        { value: "4.000+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Arquitectura europea", "Cultura de tango", "Barrios vibrantes", "Cultura de café", "Comida y vino excepcionales"],
        notForYou: ["Una agenda muy cargada solo de museos", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Barrios coloridos",
          summary: "La Boca, San Telmo y cultura de tango.",
          morning: "La Boca y Caminito",
          afternoon: "Mercado San Telmo y área",
          evening: "Espectáculo de tango o cena en barrio",
        },
        {
          day: 2,
          title: "Recoleta y cultura",
          summary: "Cementerio Recoleta, Palermo y arquitectura.",
          morning: "Cementerio Recoleta",
          afternoon: "Barrios Palermo y parques",
          evening: "Cena en Palermo y escena local",
        },
        {
          day: 3,
          title: "Centro de ciudad y cultura",
          summary: "Plaza de Mayo, barrios o tiempo relajado.",
          morning: "Plaza de Mayo y Casa Rosada",
          afternoon: "Exploración de barrios o tiempo en café",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura europea",
          description:
            "La arquitectura de Buenos Aires refleja influencia europea con bulevares grandiosos, edificios ornamentados y una sensación de elegancia del viejo mundo mezclada con carácter local.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Recoleta_Cemetery_Buenos_Aires.jpg",
            alt: "Cementerio Recoleta en Buenos Aires con mausoleos ornamentados.",
          },
        },
        {
          title: "Cultura de tango",
          description:
            "El tango es central para la identidad de Buenos Aires. Desde actuaciones callejeras hasta espectáculos formales, el baile y la música son parte del tejido cultural de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tango_Buenos_Aires.jpg",
            alt: "Bailarines de tango en Buenos Aires con fondo colorido.",
          },
        },
        {
          title: "Barrios vibrantes",
          description:
            "Cada barrio tiene carácter distintivo. Desde colorido La Boca hasta elegante Recoleta, los paseos lentos revelan cafés locales, tiendas y encanto residencial.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Palermo_Buenos_Aires.jpg",
            alt: "Barrio Palermo en Buenos Aires con calles arboladas.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Marzo a mayo o septiembre a noviembre" },
        { label: "Traslado aeropuerto", value: "Taxi o autobús del aeropuerto al centro" },
        { label: "Transporte", value: "Usa metro y autobuses; taxis para conveniencia" },
        { label: "Entradas", value: "Reserva espectáculos de tango con antelación" },
        { label: "Zona para alojarte", value: "Palermo, Recoleta o San Telmo" },
      ],
      checklist: [
        "Reserva espectáculo de tango con antelación",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Buenos Aires",
        "Planifica una sesión larga en café",
        "Prueba carne local y vino",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Buenos Aires?",
          answer:
            "Sí para lo esencial. Este plan equilibra barrios, cultura y comida con suficiente margen para tiempo en cafés, experiencias de tango y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar espectáculos de tango?",
          answer:
            "Sí, reserva con antelación, especialmente para lugares populares. También puedes ver tango callejero en La Boca y San Telmo, que no requiere reserva.",
        },
        {
          question: "¿Es Buenos Aires caminable?",
          answer:
            "Los barrios son caminables, pero Buenos Aires está extendido. Usa el metro para distancias largas, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Palermo ofrece carácter local y buenas escenas gastronómicas. Recoleta proporciona arquitectura elegante, mientras que San Telmo ofrece encanto histórico.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para mercados y para evitar multitudes. Las tardes son perfectas para cultura de café. Las noches son animadas, especialmente para tango y cena.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para parrillas (asadores) populares, sí—especialmente en fines de semana. Muchos cafés aceptan llegadas sin reserva. Los mercados gastronómicos no requieren reservas.",
        },
        {
          question: "¿Qué pasa con la comida?",
          answer:
            "Buenos Aires es conocida por carne excepcional, vino y cocina con influencia italiana. No te pierdas probar una parrilla (asador) y vino Malbec local.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rio-de-janeiro",
          city: "Río de Janeiro",
          days: 3,
          description: "Playas icónicas, miradores de montaña y cultura vibrante.",
        },
        {
          slug: "mexico-city",
          city: "Ciudad de México",
          days: 3,
          description: "Centros históricos, museos de clase mundial y mercados gastronómicos excepcionales.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Museos grandiosos, plazas históricas y mercados gastronómicos vibrantes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "rio-de-janeiro": {
      slug: "rio-de-janeiro",
      city: "Río de Janeiro",
      country: "Brasil",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de playas", "Buscadores de cultura"],
      style: ["Playas icónicas", "Miradores de montaña", "Cultura vibrante"],
      pacing: [
        "Río de Janeiro recompensa un ritmo calmado a través de sus playas y montañas. Enfoca cada día en una zona principal y deja tiempo para tiempo en playas, descubrimientos espontáneos de comida y paseos nocturnos relajados.",
        "Agrupa el tiempo por región. Combina Copacabana con Ipanema para cultura de playa, dedica otro día a Cristo Redentor y Pan de Azúcar para vistas icónicas, luego explora barrios como Santa Teresa para carácter local.",
        "Reserva tiempo sin prisas para paseos largos por playas, miradores de montaña y las comidas relajadas que muestran la excepcional comida y cultura de Río.",
      ],
      hero: {
        title: "Río de Janeiro en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con playas icónicas, miradores de montaña y cultura vibrante.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=80",
          alt: "Estatua de Cristo Redentor en Río de Janeiro con vistas de ciudad y océano.",
        },
      },
      cityStats: [
        { value: "6,7M", label: "Habitantes en el área metropolitana" },
        { value: "23", label: "Playas a lo largo de la costa" },
        { value: "709m", label: "Altura del Pan de Azúcar" },
        { value: "30m", label: "Altura del Cristo Redentor" },
      ],
      fit: {
        forYou: ["Tiempo en playas icónicas", "Miradores de montaña", "Cultura vibrante", "Ritmo relajado", "Comida excepcional"],
        notForYou: ["Una agenda muy cargada solo de museos", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común", "Enfoque en senderismo de montaña"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Playas y costa",
          summary: "Copacabana, Ipanema y cultura de playa.",
          morning: "Playa Copacabana",
          afternoon: "Playa Ipanema y paseo marítimo",
          evening: "Cena en área de playa y atardecer",
        },
        {
          day: 2,
          title: "Miradores icónicos",
          summary: "Cristo Redentor, Pan de Azúcar y vistas de la ciudad.",
          morning: "Cristo Redentor",
          afternoon: "Pan de Azúcar",
          evening: "Cena en barrio o tiempo relajado",
        },
        {
          day: 3,
          title: "Barrios y cultura",
          summary: "Santa Teresa, Lapa o tiempo relajado.",
          morning: "Barrio Santa Teresa",
          afternoon: "Lapa o exploración de barrios",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Playas icónicas",
          description:
            "Copacabana e Ipanema son mundialmente famosas por una buena razón. Los paseos largos por playas, observación de personas y tiempo relajado junto al agua son centrales para la cultura de Río.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Copacabana_Beach_Rio.jpg",
            alt: "Playa Copacabana en Río de Janeiro con arena dorada y océano.",
          },
        },
        {
          title: "Miradores de montaña",
          description:
            "Cristo Redentor y Pan de Azúcar ofrecen vistas espectaculares de la ciudad y océano. Las visitas temprano por la mañana proporcionan cielos más claros y menos multitudes.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sugarloaf_Mountain_Rio.jpg",
            alt: "Pan de Azúcar en Río de Janeiro con teleférico y vistas de la ciudad.",
          },
        },
        {
          title: "Cultura vibrante",
          description:
            "Desde samba hasta arte callejero, la cultura de Río es vibrante y visible. Barrios como Santa Teresa muestran vida local, música y energía creativa.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Santa_Teresa_Rio.jpg",
            alt: "Barrio Santa Teresa en Río con arte callejero colorido.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a octubre para clima más seco y fresco" },
        { label: "Traslado aeropuerto", value: "Taxi o autobús del aeropuerto al centro" },
        { label: "Transporte", value: "Usa metro y autobuses; taxis para conveniencia" },
        { label: "Entradas", value: "Reserva Cristo Redentor y Pan de Azúcar con antelación" },
        { label: "Zona para alojarte", value: "Copacabana, Ipanema o cerca de la playa" },
      ],
      checklist: [
        "Reserva entradas para Cristo Redentor con antelación",
        "Reserva entradas para Pan de Azúcar con antelación",
        "Empaca artículos esenciales para playa y protector solar",
        "Guarda mapas offline para Río",
        "Planifica un paseo largo por playa",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Río?",
          answer:
            "Sí para lo esencial. Este plan equilibra playas, miradores icónicos y barrios con suficiente margen para descubrimientos gastronómicos, tiempo relajado y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones con antelación?",
          answer:
            "Para Cristo Redentor y Pan de Azúcar, sí—reserva con antelación para entrada con horario, especialmente en temporada alta. Las playas no requieren reserva.",
        },
        {
          question: "¿Es Río de Janeiro caminable?",
          answer:
            "Las áreas de playa son caminables, pero Río está extendido y tiene colinas. Usa el metro para distancias largas, luego explora a pie dentro de cada área. Los taxis son convenientes.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Copacabana o Ipanema ofrecen acceso a playas y buen tránsito. Estas áreas son seguras, caminables y centrales para lugares principales.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Cristo Redentor para evitar multitudes y obtener vistas más claras. Las playas son agradables durante todo el día. Las tardes pueden incluir paseos por barrios.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva. Los quioscos de playa y lugares casuales no requieren reservas.",
        },
        {
          question: "¿Qué pasa con la seguridad?",
          answer:
            "Río requiere sentido común. Quédate en áreas turísticas, evita lugares aislados de noche, no muestres objetos de valor y usa taxis oficiales. Las áreas de playa son generalmente seguras durante el día.",
        },
      ],
      relatedItineraries: [
        {
          slug: "buenos-aires",
          city: "Buenos Aires",
          days: 3,
          description: "Arquitectura europea, cultura de tango y barrios vibrantes.",
        },
        {
          slug: "mexico-city",
          city: "Ciudad de México",
          days: 3,
          description: "Centros históricos, museos de clase mundial y mercados gastronómicos excepcionales.",
        },
        {
          slug: "sydney",
          city: "Sídney",
          days: 3,
          description: "Vistas del puerto, paseos costeros y tiempo relajado en playas.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    "mexico-city": {
      slug: "mexico-city",
      city: "Ciudad de México",
      country: "México",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Entusiastas de la comida"],
      style: ["Centros históricos", "Museos de clase mundial", "Mercados gastronómicos excepcionales"],
      pacing: [
        "Ciudad de México recompensa un ritmo calmado a través de sus áreas históricas y modernas. Enfoca cada día en una zona principal y deja tiempo para visitas a mercados, descansos en museos y descubrimientos espontáneos de comida.",
        "Agrupa el tiempo por distrito. Combina el Zócalo con centro histórico para cultura, dedica otro día a museos y Chapultepec, luego explora barrios como Roma o Condesa para carácter local.",
        "Reserva tiempo sin prisas para paseos largos por mercados, visitas a museos y las comidas relajadas que muestran la excepcional cultura gastronómica de Ciudad de México.",
      ],
      hero: {
        title: "Ciudad de México en 3 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con centros históricos, museos de clase mundial y mercados gastronómicos excepcionales.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1533251568747-725d423801d3?auto=format&fit=crop&w=1600&q=80",
          alt: "Palacio de Bellas Artes en Ciudad de México con arquitectura histórica.",
        },
      },
      cityStats: [
        { value: "9,2M", label: "Habitantes en la ciudad" },
        { value: "150+", label: "Museos en toda la ciudad" },
        { value: "700+", label: "Años de historia" },
        { value: "40.000+", label: "Restaurantes en toda la ciudad" },
      ],
      fit: {
        forYou: ["Exploración del centro histórico", "Museos de clase mundial", "Mercados gastronómicos excepcionales", "Barrios vibrantes", "Inmersión cultural"],
        notForYou: ["Una agenda muy cargada solo de museos", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico",
          summary: "Zócalo, Templo Mayor y cultura histórica.",
          morning: "Zócalo y Catedral Metropolitana",
          afternoon: "Templo Mayor y calles históricas",
          evening: "Cena en centro histórico",
        },
        {
          day: 2,
          title: "Museos y cultura",
          summary: "Museo Frida Kahlo, Chapultepec y arte.",
          morning: "Museo Frida Kahlo (reserva con antelación)",
          afternoon: "Parque Chapultepec o Museo de Antropología",
          evening: "Cena en barrio Roma o Condesa",
        },
        {
          day: 3,
          title: "Mercados y barrios",
          summary: "Xochimilco, mercados o tiempo relajado.",
          morning: "Xochimilco o visita a mercado",
          afternoon: "Exploración de barrios",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Centro histórico",
          description:
            "El Zócalo es una de las plazas públicas más grandes del mundo, rodeada de edificios históricos. El área muestra la historia colonial y precolombina de México.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Metropolitan_Cathedral_Mexico_City.jpg",
            alt: "Catedral Metropolitana en Ciudad de México con gran arquitectura.",
          },
        },
        {
          title: "Museos de clase mundial",
          description:
            "El Museo Frida Kahlo y el Museo Nacional de Antropología son de clase mundial. Planifica una visita enfocada, luego equilíbrala con paseos por barrios y comida.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Frida_Kahlo_Museum_Mexico_City.jpg",
            alt: "Museo Frida Kahlo (Casa Azul) en Ciudad de México con paredes azules.",
          },
        },
        {
          title: "Mercados gastronómicos excepcionales",
          description:
            "Desde Mercado de San Juan hasta comida callejera, la escena gastronómica de Ciudad de México es excepcional. Los paseos largos por mercados y descubrimientos locales muestran la cultura culinaria de la ciudad.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercado_Mexico_City.jpg",
            alt: "Mercado gastronómico en Ciudad de México con productos coloridos y vendedores.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Octubre a abril para clima más seco" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Usa Metro y autobuses; Uber es conveniente" },
        { label: "Entradas", value: "Reserva Museo Frida Kahlo con mucha antelación" },
        { label: "Zona para alojarte", value: "Roma, Condesa o centro histórico" },
      ],
      checklist: [
        "Reserva Museo Frida Kahlo con mucha antelación",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Ciudad de México",
        "Planifica una visita a mercados",
        "Prueba comida callejera y especialidades locales",
        "Lleva efectivo para mercados",
      ],
      faqs: [
        {
          question: "¿Alcanzan 3 días para Ciudad de México?",
          answer:
            "Sí para lo esencial. Este plan equilibra centro histórico, museos y barrios con suficiente margen para visitas a mercados, descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar Museo Frida Kahlo?",
          answer:
            "Sí, absolutamente. Reserva con mucha antelación ya que las entradas se agotan semanas antes. El museo es pequeño y popular, así que la planificación anticipada es esencial.",
        },
        {
          question: "¿Es Ciudad de México caminable?",
          answer:
            "Los barrios son caminables, pero Ciudad de México es vasta. Usa el Metro para distancias largas, luego explora a pie dentro de cada área. Uber es conveniente y seguro.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "Roma o Condesa ofrecen carácter local, buenas escenas gastronómicas y seguridad. El centro histórico proporciona proximidad a lugares principales pero puede ser más ruidoso.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para museos para evitar multitudes. Los mercados son mejores por la mañana. Las tardes pueden incluir paseos por barrios o paradas interiores.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva. La comida callejera y mercados no requieren reservas.",
        },
        {
          question: "¿Qué pasa con la comida?",
          answer:
            "La comida de Ciudad de México es excepcional. No te pierdas comida callejera (tacos, elotes), mercados y restaurantes tradicionales. La ciudad es un destino gastronómico.",
        },
      ],
      relatedItineraries: [
        {
          slug: "buenos-aires",
          city: "Buenos Aires",
          days: 3,
          description: "Arquitectura europea, cultura de tango y barrios vibrantes.",
        },
        {
          slug: "rio-de-janeiro",
          city: "Río de Janeiro",
          days: 3,
          description: "Playas icónicas, miradores de montaña y cultura vibrante.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 3,
          description: "Museos grandiosos, plazas históricas y mercados gastronómicos vibrantes.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    bucharest: {
      slug: "bucharest",
      city: "Bucarest",
      country: "Rumania",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de arquitectura", "Buscadores de historia"],
      style: ["Arquitectura grandiosa", "Barrios históricos", "Parques relajados"],
      pacing: [
        "Bucarest recompensa un ritmo calmado a través de su mezcla de arquitectura grandiosa e histórica. Enfoca cada día en una zona principal y deja tiempo para visitas a parques, descubrimientos espontáneos de comida y paseos relajados por barrios.",
        "Agrupa el tiempo por distrito. Combina el Palacio del Parlamento con el centro histórico para contraste, dedica tiempo a Parque Herastrau y barrios, luego explora carácter local.",
        "Reserva tiempo sin prisas para paseos largos por parques, exploración de barrios y las comidas relajadas que muestran la cultura gastronómica de Bucarest.",
      ],
      hero: {
        title: "Bucarest en 2 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, combinando arquitectura grandiosa, barrios históricos y parques relajados.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://images.unsplash.com/photo-1665200658303-ca61225bbaff?auto=format&fit=crop&w=1600&q=80",
          alt: "Palacio del Parlamento en Bucarest con gran arquitectura neoclásica.",
        },
      },
      cityStats: [
        { value: "1,8M", label: "Habitantes en la ciudad" },
        { value: "365K", label: "Metros cuadrados del Palacio del Parlamento" },
        { value: "40+", label: "Parques y jardines" },
        { value: "600+", label: "Años de historia" },
      ],
      fit: {
        forYou: ["Arquitectura grandiosa", "Barrios históricos", "Parques relajados", "Viaje asequible", "Inmersión cultural"],
        notForYou: ["Una agenda muy cargada solo de museos", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Arquitectura grandiosa",
          summary: "Palacio del Parlamento, centro histórico y contraste.",
          morning: "Tour del Palacio del Parlamento",
          afternoon: "Casco Viejo Histórico y Lipscani",
          evening: "Cena en casco viejo y paseo",
        },
        {
          day: 2,
          title: "Parques y barrios",
          summary: "Parque Herastrau, barrios o tiempo relajado.",
          morning: "Parque Herastrau y Museo del Pueblo",
          afternoon: "Exploración de barrios o museos",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Arquitectura grandiosa",
          description:
            "El Palacio del Parlamento es uno de los edificios más grandes del mundo, mostrando escala de la era comunista. El Casco Viejo Histórico ofrece contraste con calles encantadoras y cafés.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Old_Town_Bucharest.jpg",
            alt: "Casco Viejo Histórico en Bucarest con calles adoquinadas.",
          },
        },
        {
          title: "Barrios históricos",
          description:
            "El Casco Viejo (Lipscani) preserva carácter histórico con calles adoquinadas, cafés y una atmósfera relajada que se siente tanto europea como única.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Lipscani_Bucharest.jpg",
            alt: "Calle Lipscani en Casco Viejo de Bucarest con edificios históricos.",
          },
        },
        {
          title: "Parques relajados",
          description:
            "Parque Herastrau ofrece espacio verde y el Museo del Pueblo, mostrando arquitectura tradicional rumana en un entorno pacífico.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Herastrau_Park_Bucharest.jpg",
            alt: "Parque Herastrau en Bucarest con lago y espacio verde.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Autobús o taxi al centro" },
        { label: "Transporte", value: "Usa metro y autobuses; camina el centro" },
        { label: "Entradas", value: "Reserva tour del Palacio del Parlamento con antelación" },
        { label: "Zona para alojarte", value: "Casco Viejo o centro de la ciudad" },
      ],
      checklist: [
        "Reserva tour del Palacio del Parlamento con antelación",
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Bucarest",
        "Planifica una visita a parques",
        "Explora Casco Viejo a pie",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 2 días para Bucarest?",
          answer:
            "Sí para lo esencial. Este plan equilibra arquitectura grandiosa, barrios históricos y parques con suficiente margen para descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar Palacio del Parlamento?",
          answer:
            "Sí, reserva tours con antelación ya que son requeridos para entrar. El edificio es masivo y el tour proporciona contexto para su historia y escala.",
        },
        {
          question: "¿Es Bucarest caminable?",
          answer:
            "El Casco Viejo y centro de la ciudad son muy caminables. Usa el metro para distancias largas, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El Casco Viejo ofrece carácter histórico y fácil acceso a restaurantes y cafés. El centro de la ciudad proporciona buenas conexiones de tránsito.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para Palacio del Parlamento para evitar multitudes. El Casco Viejo es agradable durante todo el día. Las tardes pueden incluir paseos por parques.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva. El Casco Viejo tiene muchas opciones para comida casual.",
        },
        {
          question: "¿Qué pasa con la comida?",
          answer:
            "Bucarest ofrece cocina rumana con influencias de países vecinos. Prueba platos tradicionales como sarmale (rollos de repollo) y vinos locales.",
        },
      ],
      relatedItineraries: [
        {
          slug: "sofia",
          city: "Sofía",
          days: 2,
          description: "Iglesias históricas, vistas de montaña y centro de ciudad caminable.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio, colinas históricas y baños termales.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco viejo, vistas del castillo y paseos fáciles junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    sofia: {
      slug: "sofia",
      city: "Sofía",
      country: "Bulgaria",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Entusiastas de montañas"],
      style: ["Iglesias históricas", "Vistas de montaña", "Centro de ciudad caminable"],
      pacing: [
        "Sofía recompensa un ritmo calmado a través de su centro compacto. Enfoca cada día en una zona principal y deja tiempo para visitas a iglesias, descubrimientos espontáneos de comida y paseos relajados por barrios.",
        "Agrupa el tiempo por zona. Combina las iglesias históricas con el centro de la ciudad para cultura, dedica tiempo a acceso a Montaña Vitosha o parques, luego explora carácter local.",
        "Reserva tiempo sin prisas para paseos largos, visitas a iglesias y las comidas relajadas que muestran la cultura gastronómica de Sofía.",
      ],
      hero: {
        title: "Sofía en 2 días",
        subtitle:
          "Explora lo esencial con tiempo para respirar, con iglesias históricas, vistas de montaña y centro de ciudad caminable.",
        eyebrow: "Guía de viaje",
        image: {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Alexander_Nevsky_Cathedral_Sofia.jpg",
          alt: "Catedral Alexander Nevsky en Sofía con cúpulas doradas.",
        },
      },
      cityStats: [
        { value: "1,2M", label: "Habitantes en la ciudad" },
        { value: "2.290m", label: "Altura de Montaña Vitosha" },
        { value: "50+", label: "Iglesias en toda la ciudad" },
        { value: "7.000+", label: "Años de historia" },
      ],
      fit: {
        forYou: ["Visitas a iglesias históricas", "Acceso a montañas", "Centro caminable", "Viaje asequible", "Inmersión cultural"],
        notForYou: ["Una agenda muy cargada solo de museos", "Tiempo enfocado en playas", "Vida nocturna como prioridad", "Estilo mochilero económico", "Solo fuera de lo común"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro histórico",
          summary: "Catedral Alexander Nevsky, iglesias y cultura.",
          morning: "Catedral Alexander Nevsky",
          afternoon: "Iglesia St. Sofia y paseo por centro",
          evening: "Cena en centro y paseo",
        },
        {
          day: 2,
          title: "Cultura y naturaleza",
          summary: "Complejo Serdika, Vitosha o tiempo relajado.",
          morning: "Complejo Serdika y ruinas romanas",
          afternoon: "Montaña Vitosha o visita a parques",
          evening: "Cena tradicional o tiempo relajado",
        },
      ],
      imageInfoCards: [
        {
          title: "Iglesias históricas",
          description:
            "La Catedral Alexander Nevsky es la seña de identidad de Sofía, con cúpulas doradas y gran escala. La ciudad tiene muchas iglesias históricas mostrando arquitectura ortodoxa.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/St_Sofia_Church_Sofia.jpg",
            alt: "Iglesia St. Sofia en Sofía con arquitectura histórica.",
          },
        },
        {
          title: "Vistas de montaña",
          description:
            "Montaña Vitosha proporciona un telón de fondo natural y fácil acceso desde la ciudad. Los viajes en teleférico o caminatas ofrecen vistas de la ciudad y un contraste con la energía urbana.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vitosha_Mountain_Sofia.jpg",
            alt: "Montaña Vitosha cerca de Sofía con ciudad al fondo.",
          },
        },
        {
          title: "Centro caminable",
          description:
            "El centro de Sofía es compacto y amigable para peatones. Los paseos lentos revelan ruinas romanas, edificios históricos y un ritmo relajado que se siente tanto europeo como único.",
          image: {
            src: "https://commons.wikimedia.org/wiki/Special:FilePath/Serdika_Complex_Sofia.jpg",
            alt: "Complejo Serdika en Sofía con ruinas romanas y edificios modernos.",
          },
        },
      ],
      logistics: [
        { label: "Mejor época", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi al centro" },
        { label: "Transporte", value: "Usa metro y tranvías; camina el centro" },
        { label: "Entradas", value: "La mayoría de lugares no requieren reserva anticipada" },
        { label: "Zona para alojarte", value: "Centro de la ciudad o cerca de Vitosha" },
      ],
      checklist: [
        "Empaca zapatos cómodos para caminar",
        "Guarda mapas offline para Sofía",
        "Planifica una visita a iglesias",
        "Considera Montaña Vitosha si te interesa",
        "Explora centro de la ciudad a pie",
        "Lleva efectivo para algunos establecimientos",
      ],
      faqs: [
        {
          question: "¿Alcanzan 2 días para Sofía?",
          answer:
            "Sí para lo esencial. Este plan equilibra iglesias históricas, centro de la ciudad y tiempo opcional en montaña con suficiente margen para descubrimientos gastronómicos y paradas no planificadas.",
        },
        {
          question: "¿Necesito reservar atracciones?",
          answer:
            "La mayoría de iglesias y lugares no requieren reserva anticipada. Compra entradas en el lugar. El acceso a Montaña Vitosha es directo sin reserva anticipada.",
        },
        {
          question: "¿Es Sofía caminable?",
          answer:
            "El centro de la ciudad es muy caminable y compacto. Usa el metro para distancias largas, luego explora a pie dentro de cada área.",
        },
        {
          question: "¿Dónde me conviene alojarme?",
          answer:
            "El centro de la ciudad ofrece proximidad a lugares principales, restaurantes y cafés. Las áreas cerca de Vitosha proporcionan acceso a montaña y calles más tranquilas.",
        },
        {
          question: "¿A qué hora debería empezar cada día?",
          answer:
            "Empieza temprano para iglesias para evitar multitudes. El centro de la ciudad es agradable durante todo el día. Las tardes pueden incluir paseos por parques o visitas a montaña.",
        },
        {
          question: "¿Necesito reservar restaurantes con antelación?",
          answer:
            "Para restaurantes populares, sí—especialmente en fines de semana. Muchos lugares aceptan llegadas sin reserva. El centro de la ciudad tiene muchas opciones para comida casual.",
        },
        {
          question: "¿Qué pasa con la comida?",
          answer:
            "Sofía ofrece cocina búlgara con influencias de países vecinos. Prueba platos tradicionales como banitsa (pastel de queso) y vinos locales.",
        },
      ],
      relatedItineraries: [
        {
          slug: "bucharest",
          city: "Bucarest",
          days: 2,
          description: "Arquitectura grandiosa, barrios históricos y parques relajados.",
        },
        {
          slug: "budapest",
          city: "Budapest",
          days: 3,
          description: "Vistas del Danubio, colinas históricas y baños termales.",
        },
        {
          slug: "prague",
          city: "Praga",
          days: 3,
          description: "Casco viejo, vistas del castillo y paseos fáciles junto al río.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
  }),
};

export function getCityItinerary(
  locale: ItineraryLocale,
  slug: string
): CityItinerary | undefined {
  return cityItineraries[locale]?.[slug];
}
