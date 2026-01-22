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
  }),
};

export function getCityItinerary(
  locale: ItineraryLocale,
  slug: string
): CityItinerary | undefined {
  return cityItineraries[locale]?.[slug];
}
