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
  hero: {
    title: string;
    subtitle: string;
    eyebrow?: string;
  };
  fit: {
    forYou: string[];
    notForYou: string[];
  };
  dayPlans: DayPlan[];
  logistics: LogisticsItem[];
  checklist: string[];
  faqs: FaqItem[];
  relatedItineraries: RelatedItinerary[];
  primaryCtaHref: string;
  secondaryCtaHref?: string;
};

const cityItineraries: Record<ItineraryLocale, Record<string, CityItinerary>> = {
  en: {
    rome: {
      slug: "rome",
      city: "Rome",
      country: "Italy",
      days: 3,
      pace: "Balanced",
      idealFor: ["First-timers", "History lovers", "Food-first travelers"],
      style: ["Classic sights", "Walkable neighborhoods", "Cafe breaks"],
      hero: {
        title: "Rome in 3 days",
        subtitle:
          "Hit the essentials with room to breathe, focusing on ancient icons, piazzas, and easy food stops.",
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A first trip with iconic landmarks", "A mix of history and cafes", "Short walking routes"],
        notForYou: ["A packed schedule of museums only", "Day trips outside the city", "Late-night nightlife focus"],
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
      logistics: [
        { label: "Best time", value: "April to June or September to October" },
        { label: "Airport transfer", value: "Train to Termini or fixed-rate taxi" },
        { label: "Transit tips", value: "Walk core sights; use Metro for Vatican" },
        { label: "Ticketing", value: "Book Colosseum and Vatican in advance" },
        { label: "Neighborhood stay", value: "Centro Storico or Monti" },
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
            "Yes for the core highlights. This plan focuses on the essentials with a relaxed pace and short transfers.",
        },
        {
          question: "Should I buy skip-the-line tickets?",
          answer:
            "Yes. Pre-booking for the Colosseum and Vatican saves hours and makes the schedule reliable.",
        },
        {
          question: "Do I need a transit pass?",
          answer:
            "Most sights are walkable. A 24- or 48-hour pass helps for Vatican day and longer hops.",
        },
        {
          question: "Where should I stay?",
          answer:
            "Centro Storico keeps you central, while Monti offers a local feel with easy access to the Colosseum.",
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
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A short visit focused on the core sights", "Easy walks with breaks", "A clear, simple plan"],
        notForYou: ["A deep museum-only itinerary", "Day trips outside Rome", "Late-night nightlife focus"],
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
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A clear plan with breathing room", "A mix of art and city walks", "Simple metro hops"],
        notForYou: ["Day trips outside the city", "A packed museum-only schedule", "Late-night nightlife focus"],
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
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A mix of architecture and easy walks", "Clear, simple days", "Time by the sea"],
        notForYou: ["A packed museum schedule", "Late-night nightlife focus", "Day trips outside the city"],
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
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A walkable city with short distances", "A mix of museums and parks", "Easy, quiet evenings"],
        notForYou: ["A packed schedule of tours", "Long day trips", "Late-night nightlife focus"],
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
        eyebrow: "City itinerary",
      },
      fit: {
        forYou: ["A clear plan with short transfers", "A mix of museums and landmarks", "Walkable river routes"],
        notForYou: ["Day trips outside London", "A packed schedule of shows", "Late-night nightlife focus"],
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
  },
  es: {
    rome: {
      slug: "rome",
      city: "Roma",
      country: "Italia",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de historia", "Viajeros de buena comida"],
      style: ["Lugares clasicos", "Barrios caminables", "Pausas en cafe"],
      hero: {
        title: "Roma en 3 dias",
        subtitle:
          "Recorre lo esencial con tiempo para respirar, centrado en iconos antiguos, plazas y comidas faciles.",
        eyebrow: "Itinerario por ciudad",
      },
      fit: {
        forYou: ["Un primer viaje con iconos", "Mezcla de historia y cafe", "Rutas a pie sin prisa"],
        notForYou: ["Solo museos todo el dia", "Excursiones fuera de la ciudad", "Plan de vida nocturna"],
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
          title: "Vaticano y paseo al rio",
          summary: "Museos, San Pedro y el Tiber.",
          morning: "Museos Vaticanos y Capilla Sixtina",
          afternoon: "Basilica de San Pedro y Castel Sant'Angelo",
          evening: "Aperitivo en Trastevere y paseo",
        },
        {
          day: 3,
          title: "Plazas y comida",
          summary: "Fuentes, mercados y gelato clasico.",
          morning: "Fontana di Trevi, Plaza de Espana, tiendas",
          afternoon: "Piazza Navona y Campo de' Fiori",
          evening: "Ruta de gelato y atardecer en Pincio",
        },
      ],
      logistics: [
        { label: "Mejor epoca", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Tren a Termini o taxi tarifa fija" },
        { label: "Transporte", value: "Camina el centro; Metro para Vaticano" },
        { label: "Entradas", value: "Reserva Coliseo y Vaticano con antelacion" },
        { label: "Zona para alojarte", value: "Centro Storico o Monti" },
      ],
      checklist: [
        "Reserva entrada al Coliseo",
        "Reserva Museos Vaticanos",
        "Calzado comodo para caminar",
        "Mapas offline de Roma",
        "Pausa lenta de cafe cada dia",
        "Botella de agua reutilizable",
      ],
      faqs: [
        {
          question: "Alcanzan 3 dias para Roma?",
          answer:
            "Si para los puntos clave. Este plan prioriza lo esencial con ritmo relajado y traslados cortos.",
        },
        {
          question: "Conviene comprar entradas sin cola?",
          answer:
            "Si. Reservar Coliseo y Vaticano ahorra horas y hace el plan mas fiable.",
        },
        {
          question: "Necesito pase de transporte?",
          answer:
            "Muchas zonas son caminables. Un pase de 24 o 48 horas ayuda para el Vaticano y trayectos largos.",
        },
        {
          question: "Donde hospedarse?",
          answer:
            "Centro Storico te deja en el centro. Monti es mas local y cerca del Coliseo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "paris",
          city: "Paris",
          days: 3,
          description: "Monumentos clasicos, museos y barrios con cafe.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos faciles.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    madrid: {
      slug: "madrid",
      city: "Madrid",
      country: "Espana",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de museos", "Viajeros a pie"],
      style: ["Paseos por el centro", "Parques tranquilos", "Museos clave"],
      hero: {
        title: "Madrid en 2 dias",
        subtitle:
          "Recorre lo esencial con traslados cortos, combinando museos, plazas y parques.",
        eyebrow: "Itinerario por ciudad",
      },
      fit: {
        forYou: ["Un plan claro y caminable", "Museos y parques en equilibrio", "Ritmo realista"],
        notForYou: ["Excursiones fuera de la ciudad", "Plan muy cargado", "Vida nocturna como prioridad"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro clasico y museos",
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
          afternoon: "Plaza de Espana y Templo de Debod",
          evening: "Barrio de las Letras y paseo tranquilo",
        },
      ],
      logistics: [
        { label: "Mejor epoca", value: "Marzo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro, bus o taxi" },
        { label: "Transporte", value: "Centro caminable; Metro para trayectos largos" },
        { label: "Entradas", value: "Reserva Prado y Palacio si quieres horarios fijos" },
        { label: "Zona para alojarte", value: "Centro, Letras o Malasana" },
      ],
      checklist: [
        "Reserva entrada al Prado si vas",
        "Calzado comodo para caminar",
        "Botella de agua reutilizable",
        "Mapa offline del Metro",
        "Pausa lenta de cafe cada dia",
        "Lleva protector solar en verano",
      ],
      faqs: [
        {
          question: "Alcanzan 2 dias para Madrid?",
          answer:
            "Si para los puntos clave. Este plan prioriza el centro y mantiene un ritmo tranquilo.",
        },
        {
          question: "Necesito pase de transporte?",
          answer:
            "El centro se puede recorrer a pie, pero el Metro ayuda si quieres ahorrar tiempo.",
        },
        {
          question: "Conviene reservar el Prado?",
          answer:
            "Si. Reservar con antelacion te da un horario claro y evita filas.",
        },
        {
          question: "Donde hospedarse?",
          answer:
            "Centro y Barrio de las Letras son practicos; Malasana ofrece un ambiente mas local.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Iconos antiguos, plazas y paseos faciles.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi, barrios caminables y playa.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 2,
          description: "Monumentos clasicos y paseos junto al rio.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    paris: {
      slug: "paris",
      city: "Paris",
      country: "Francia",
      days: 2,
      pace: "Equilibrado",
      idealFor: ["Primer viaje", "Amantes de arte", "Viajeros tranquilos"],
      style: ["Monumentos clasicos", "Paseos por el rio", "Barrios caminables"],
      hero: {
        title: "Paris en 2 dias",
        subtitle:
          "Veras lo esencial con distancias cortas, combinando arte, plazas y paseos por el Sena.",
        eyebrow: "Itinerario por ciudad",
      },
      fit: {
        forYou: ["Un fin de semana con lo basico", "Rutas a pie sin prisa", "Pocas conexiones en Metro"],
        notForYou: ["Excursiones fuera de la ciudad", "Un plan solo de museos", "Vida nocturna como prioridad"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Centro historico y el Sena",
          summary: "Louvre exterior, jardines y paseo por el rio.",
          morning: "Louvre exterior y Jardines de Tullerias",
          afternoon: "Ile de la Cite y Notre-Dame exterior",
          evening: "Paseo por el Sena y Puente Nuevo",
        },
        {
          day: 2,
          title: "Eiffel y barrios clasicos",
          summary: "Torre Eiffel y vistas emblematicas.",
          morning: "Torre Eiffel y Campo de Marte",
          afternoon: "Invalides y paseo por la orilla",
          evening: "Arco del Triunfo al atardecer",
        },
      ],
      logistics: [
        { label: "Mejor epoca", value: "Mayo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "RER B o taxi tarifa fija" },
        { label: "Transporte", value: "Centro caminable; Metro para distancias largas" },
        { label: "Entradas", value: "Reserva Torre Eiffel y Louvre si vas" },
        { label: "Zona para alojarte", value: "Le Marais o Saint-Germain" },
      ],
      checklist: [
        "Reserva Torre Eiffel si vas a subir",
        "Reserva Louvre si quieres entrar",
        "Lleva una chaqueta ligera",
        "Mapa offline del Metro",
        "Pausa lenta de cafe cada dia",
        "Calzado comodo para caminar",
      ],
      faqs: [
        {
          question: "Alcanzan 2 dias para Paris?",
          answer:
            "Si para los puntos clave. El plan prioriza distancias cortas y visitas esenciales.",
        },
        {
          question: "Necesito reservar museos?",
          answer:
            "Para el Louvre o exposiciones populares, si. Facilita el acceso y evita filas.",
        },
        {
          question: "Conviene un pase de transporte?",
          answer:
            "Un carnet o pase diario es util si usaras el Metro varias veces.",
        },
        {
          question: "Donde hospedarse?",
          answer:
            "Le Marais y Saint-Germain son centricos y faciles para caminar.",
        },
      ],
      relatedItineraries: [
        {
          slug: "rome",
          city: "Roma",
          days: 3,
          description: "Iconos antiguos, plazas y paseos faciles.",
        },
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos faciles.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
    barcelona: {
      slug: "barcelona",
      city: "Barcelona",
      country: "Espana",
      days: 3,
      pace: "Equilibrado",
      idealFor: ["Amantes de arquitectura", "Primer viaje", "Paseos con mar"],
      style: ["Gaudi esencial", "Barrios caminables", "Tiempo al aire libre"],
      hero: {
        title: "Barcelona en 3 dias",
        subtitle:
          "Combina iconos de Gaudi con paseos por barrios y un ritmo relajado junto al mar.",
        eyebrow: "Itinerario por ciudad",
      },
      fit: {
        forYou: ["Arquitectura y paseos faciles", "Plan claro por dias", "Tiempo de playa sin prisa"],
        notForYou: ["Solo museos todo el dia", "Vida nocturna como prioridad", "Excursiones fuera de la ciudad"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Casco antiguo y mar",
          summary: "Gothic Quarter, parque y paseo costero.",
          morning: "Barrio Gotico y Catedral de Barcelona",
          afternoon: "El Born y Parc de la Ciutadella",
          evening: "Paseo por la Barceloneta",
        },
        {
          day: 2,
          title: "Gaudi y Eixample",
          summary: "Sagrada Familia y modernismo en calles amplias.",
          morning: "Sagrada Familia",
          afternoon: "Passeig de Gracia y fachadas modernistas",
          evening: "Paseo por Gracia",
        },
        {
          day: 3,
          title: "Parques y miradores",
          summary: "Vistas de la ciudad y tiempo tranquilo.",
          morning: "Park Guell temprano",
          afternoon: "Jardines de Montjuic y miradores",
          evening: "Placa d'Espanya y paseo corto",
        },
      ],
      logistics: [
        { label: "Mejor epoca", value: "Abril a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Aerobus o tren a Passeig de Gracia" },
        { label: "Transporte", value: "Centro caminable; Metro para trayectos largos" },
        { label: "Entradas", value: "Reserva Sagrada Familia y Park Guell" },
        { label: "Zona para alojarte", value: "Eixample o El Born" },
      ],
      checklist: [
        "Reserva Sagrada Familia",
        "Compra entrada a Park Guell",
        "Proteccion solar y agua",
        "Mapa offline de la ciudad",
        "Pausa lenta de cafe cada dia",
        "Calzado comodo para caminar",
      ],
      faqs: [
        {
          question: "Alcanzan 3 dias para Barcelona?",
          answer:
            "Si para lo esencial. El plan combina iconos y paseos con ritmo tranquilo.",
        },
        {
          question: "Debo reservar entradas de Gaudi?",
          answer:
            "Si. Sagrada Familia y Park Guell se agotan y es mejor asegurar horarios.",
        },
        {
          question: "Se puede caminar todo?",
          answer:
            "El centro es caminable, y el Metro ayuda para Montjuic o distancias largas.",
        },
        {
          question: "Donde hospedarse?",
          answer:
            "Eixample es central y practico; El Born es animado y cerca del casco antiguo.",
        },
      ],
      relatedItineraries: [
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos faciles.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 2,
          description: "Monumentos clasicos y paseos junto al rio.",
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
        title: "Lisboa en 3 dias",
        subtitle:
          "Un plan sereno por barrios historicos, miradores y paseos junto al Tajo.",
        eyebrow: "Itinerario por ciudad",
      },
      fit: {
        forYou: ["Caminatas con vistas y descansos", "Barrios con ambiente local", "Ritmo realista"],
        notForYou: ["Plan muy cargado", "Excursiones fuera de la ciudad", "Vida nocturna como prioridad"],
      },
      dayPlans: [
        {
          day: 1,
          title: "Baixa y Alfama",
          summary: "Centro historico y miradores clasicos.",
          morning: "Baixa y Plaza del Comercio",
          afternoon: "Alfama y Castillo de San Jorge exterior",
          evening: "Mirador al atardecer y paseo corto",
        },
        {
          day: 2,
          title: "Belem tranquilo",
          summary: "Paseo junto al rio y monumentos clave.",
          morning: "Torre de Belem y paseo por el rio",
          afternoon: "Monasterio de los Jeronimos y jardines",
          evening: "Regreso lento por la ribera",
        },
        {
          day: 3,
          title: "Barrios y miradores",
          summary: "Calles con tranvia y vistas amplias.",
          morning: "Chiado y Bairro Alto",
          afternoon: "Mirador de Sao Pedro de Alcantara",
          evening: "Cais do Sodre y paseo junto al agua",
        },
      ],
      logistics: [
        { label: "Mejor epoca", value: "Marzo a junio o septiembre a octubre" },
        { label: "Traslado aeropuerto", value: "Metro o taxi" },
        { label: "Transporte", value: "Tranvia y Metro; muchas calles con cuestas" },
        { label: "Entradas", value: "Reserva Jeronimos si quieres entrar" },
        { label: "Zona para alojarte", value: "Baixa, Chiado o Alfama" },
      ],
      checklist: [
        "Calzado comodo para cuestas",
        "Reserva Jeronimos si vas",
        "Lleva una chaqueta ligera",
        "Mapa offline de la ciudad",
        "Pausa lenta de cafe cada dia",
        "Proteccion solar en verano",
      ],
      faqs: [
        {
          question: "Alcanzan 3 dias para Lisboa?",
          answer:
            "Si para los puntos clave. El plan mantiene recorridos cortos y con descansos.",
        },
        {
          question: "Necesito usar tranvia?",
          answer:
            "No es obligatorio, pero ayuda en las cuestas y para recorrer barrios distantes.",
        },
        {
          question: "Conviene reservar Jeronimos?",
          answer:
            "Si quieres entrar, es recomendable reservar para evitar esperas largas.",
        },
        {
          question: "Donde hospedarse?",
          answer:
            "Baixa es central; Chiado es comodo y Alfama es mas tradicional.",
        },
      ],
      relatedItineraries: [
        {
          slug: "barcelona",
          city: "Barcelona",
          days: 3,
          description: "Arquitectura de Gaudi, barrios caminables y playa.",
        },
        {
          slug: "madrid",
          city: "Madrid",
          days: 2,
          description: "Museos, plazas centrales y paseos faciles.",
        },
        {
          slug: "paris",
          city: "Paris",
          days: 2,
          description: "Monumentos clasicos y paseos junto al rio.",
        },
      ],
      primaryCtaHref: "/",
      secondaryCtaHref: "/cities",
    },
  },
};

export function getCityItinerary(
  locale: ItineraryLocale,
  slug: string
): CityItinerary | undefined {
  return cityItineraries[locale]?.[slug];
}
