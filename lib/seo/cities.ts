export type CitySeo = {
  slug: string;
  name: string;
  country: string;
  days: number;
  description: string;
  highlights: string[];
};

export const cityPages: CitySeo[] = [
  {
    slug: "paris",
    name: "Paris",
    country: "France",
    days: 3,
    description:
      "A 3-day Paris travel guide focused on classic landmarks, cafe culture, and walkable neighborhoods.",
    highlights: ["Eiffel Tower", "Louvre Museum", "Montmartre"],
  },
  {
    slug: "barcelona",
    name: "Barcelona",
    country: "Spain",
    days: 4,
    description:
      "A 4-day Barcelona travel guide packed with Gaudi architecture, beaches, and food markets.",
    highlights: ["Sagrada Familia", "Gothic Quarter", "La Boqueria"],
  },
  {
    slug: "london",
    name: "London",
    country: "United Kingdom",
    days: 3,
    description:
      "A 3-day London travel guide with iconic sights, museums, and neighborhoods across the Thames.",
    highlights: ["Westminster", "British Museum", "Tower Bridge"],
  },
  {
    slug: "rome",
    name: "Rome",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Rome travel guide highlighting ancient history, piazzas, and Italian cuisine.",
    highlights: ["Colosseum", "Vatican Museums", "Trevi Fountain"],
  },
  {
    slug: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    days: 3,
    description:
      "A 3-day Lisbon travel guide focused on historic hills, river walks, and relaxed neighborhoods.",
    highlights: ["Alfama", "Belem", "Praca do Comercio"],
  },
  {
    slug: "prague",
    name: "Prague",
    country: "Czech Republic",
    days: 3,
    description:
      "A 3-day Prague travel guide covering the Old Town, castle views, and easy river strolls.",
    highlights: ["Old Town Square", "Charles Bridge", "Prague Castle"],
  },
  {
    slug: "vienna",
    name: "Vienna",
    country: "Austria",
    days: 3,
    description:
      "A 3-day Vienna travel guide pairing classic museums, palace gardens, and grand avenues.",
    highlights: ["St. Stephen's Cathedral", "Schonbrunn Palace", "MuseumsQuartier"],
  },
  {
    slug: "budapest",
    name: "Budapest",
    country: "Hungary",
    days: 3,
    description:
      "A 3-day Budapest travel guide with Danube views, historic hills, and thermal baths.",
    highlights: ["Parliament", "Buda Castle", "Chain Bridge"],
  },
  {
    slug: "seville",
    name: "Seville",
    country: "Spain",
    days: 3,
    description:
      "A 3-day Seville travel guide centered on plazas, historic quarters, and riverside walks.",
    highlights: ["Seville Cathedral", "Plaza de Espana", "Barrio Santa Cruz"],
  },
  {
    slug: "berlin",
    name: "Berlin",
    country: "Germany",
    days: 3,
    description:
      "A 3-day Berlin travel guide balancing history, creative neighborhoods, and relaxed parks.",
    highlights: ["Brandenburg Gate", "Museum Island", "East Side Gallery"],
  },
  {
    slug: "florence",
    name: "Florence",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Florence travel guide focused on art, river walks, and Renaissance squares.",
    highlights: ["Duomo", "Uffizi Gallery", "Ponte Vecchio"],
  },
  {
    slug: "venice",
    name: "Venice",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Venice travel guide with canal strolls, classic churches, and slow island time.",
    highlights: ["St. Mark's Basilica", "Grand Canal", "Rialto Bridge"],
  },
  {
    slug: "milan",
    name: "Milan",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Milan travel guide mixing cathedral sights, design districts, and aperitivo stops.",
    highlights: ["Duomo di Milano", "Galleria Vittorio Emanuele II", "Navigli"],
  },
  {
    slug: "munich",
    name: "Munich",
    country: "Germany",
    days: 3,
    description:
      "A 3-day Munich travel guide combining historic squares, garden breaks, and easy transit.",
    highlights: ["Marienplatz", "English Garden", "Nymphenburg Palace"],
  },
  {
    slug: "dublin",
    name: "Dublin",
    country: "Ireland",
    days: 3,
    description:
      "A 3-day Dublin travel guide with literary landmarks, cozy pubs, and riverside walks.",
    highlights: ["Trinity College", "Temple Bar", "St. Patrick's Cathedral"],
  },
  {
    slug: "edinburgh",
    name: "Edinburgh",
    country: "United Kingdom",
    days: 3,
    description:
      "A 3-day Edinburgh travel guide featuring castle views, historic lanes, and scenic hikes.",
    highlights: ["Edinburgh Castle", "Royal Mile", "Arthur's Seat"],
  },
  {
    slug: "copenhagen",
    name: "Copenhagen",
    country: "Denmark",
    days: 3,
    description:
      "A 3-day Copenhagen travel guide focused on waterfront strolls, design, and bike-friendly routes.",
    highlights: ["Nyhavn", "Tivoli Gardens", "Rosenborg Castle"],
  },
  {
    slug: "stockholm",
    name: "Stockholm",
    country: "Sweden",
    days: 3,
    description:
      "A 3-day Stockholm travel guide with old town charm, museums, and island-hopping pauses.",
    highlights: ["Gamla Stan", "Vasa Museum", "Djurgarden"],
  },
  {
    slug: "athens",
    name: "Athens",
    country: "Greece",
    days: 3,
    description:
      "A 3-day Athens travel guide blending ancient sites, neighborhood cafes, and sunset viewpoints.",
    highlights: ["Acropolis", "Plaka", "Ancient Agora"],
  },
  {
    slug: "porto",
    name: "Porto",
    country: "Portugal",
    days: 3,
    description:
      "A 3-day Porto travel guide centered on riverside walks, historic lanes, and easy hilltop viewpoints.",
    highlights: ["Ribeira", "Dom Luis I Bridge", "Livraria Lello"],
  },
  {
    slug: "krakow",
    name: "Krakow",
    country: "Poland",
    days: 3,
    description:
      "A 3-day Krakow travel guide focused on the old town, castle hill, and calm neighborhood strolls.",
    highlights: ["Main Market Square", "Wawel Castle", "Kazimierz"],
  },
  {
    slug: "zurich",
    name: "Zurich",
    country: "Switzerland",
    days: 3,
    description:
      "A 3-day Zurich travel guide mixing lakeside walks, compact museums, and relaxed old town time.",
    highlights: ["Lake Zurich", "Old Town", "Kunsthaus Zurich"],
  },
  {
    slug: "brussels",
    name: "Brussels",
    country: "Belgium",
    days: 3,
    description:
      "A 3-day Brussels travel guide balancing grand squares, museum districts, and easy cafe breaks.",
    highlights: ["Grand Place", "Mont des Arts", "Royal Palace"],
  },
  {
    slug: "valencia",
    name: "Valencia",
    country: "Spain",
    days: 3,
    description:
      "A 3-day Valencia travel guide pairing old town sights, park strolls, and a relaxed beach afternoon.",
    highlights: ["City of Arts and Sciences", "Turia Gardens", "Central Market"],
  },
  {
    slug: "oslo",
    name: "Oslo",
    country: "Norway",
    days: 3,
    description:
      "A 3-day Oslo travel guide focused on waterfront walks, compact museums, and quiet park time.",
    highlights: ["Aker Brygge", "Vigeland Park", "Oslo Opera House"],
  },
  {
    slug: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    days: 3,
    description:
      "A 3-day Reykjavik travel guide with walkable downtown stops, cozy cafes, and easy coastal views.",
    highlights: ["Hallgrimskirkja", "Harpa Concert Hall", "Old Harbor"],
  },
  {
    slug: "istanbul",
    name: "Istanbul",
    country: "Turkey",
    days: 3,
    description:
      "A 3-day Istanbul travel guide blending historic core sights, ferry views, and layered neighborhoods.",
    highlights: ["Hagia Sophia", "Blue Mosque", "Grand Bazaar"],
  },
  {
    slug: "naples",
    name: "Naples",
    country: "Italy",
    days: 3,
    description:
      "A 3-day Naples travel guide featuring historic streets, waterfront walks, and slow cafe time.",
    highlights: ["Spaccanapoli", "Castel dell'Ovo", "Naples National Archaeological Museum"],
  },
  {
    slug: "nice",
    name: "Nice",
    country: "France",
    days: 3,
    description:
      "A 3-day Nice travel guide centered on old town lanes, seaside promenades, and scenic viewpoints.",
    highlights: ["Promenade des Anglais", "Old Town", "Castle Hill"],
  },
  {
    slug: "warsaw",
    name: "Warsaw",
    country: "Poland",
    days: 3,
    description:
      "A 3-day Warsaw travel guide blending historic old town, modern districts, and river walks.",
    highlights: ["Old Town Square", "Royal Castle", "Lazienki Park"],
  },
  {
    slug: "granada",
    name: "Granada",
    country: "Spain",
    days: 3,
    description:
      "A 3-day Granada travel guide focused on the Alhambra, historic quarters, and mountain views.",
    highlights: ["Alhambra", "Albaicin", "Generalife"],
  },
  {
    slug: "lyon",
    name: "Lyon",
    country: "France",
    days: 3,
    description:
      "A 3-day Lyon travel guide pairing Roman history, gastronomy, and riverside neighborhoods.",
    highlights: ["Vieux Lyon", "Fourviere Basilica", "Presqu'ile"],
  },
  {
    slug: "salzburg",
    name: "Salzburg",
    country: "Austria",
    days: 3,
    description:
      "A 3-day Salzburg travel guide with baroque architecture, mountain views, and music heritage.",
    highlights: ["Hohensalzburg Fortress", "Mirabell Palace", "Old Town"],
  },
  {
    slug: "rotterdam",
    name: "Rotterdam",
    country: "Netherlands",
    days: 3,
    description:
      "A 3-day Rotterdam travel guide featuring modern architecture, waterfront walks, and cultural districts.",
    highlights: ["Erasmus Bridge", "Markthal", "Cube Houses"],
  },
];

export function getCityBySlug(slug: string): CitySeo | undefined {
  return cityPages.find((city) => city.slug === slug);
}
