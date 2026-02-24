#!/usr/bin/env node
/**
 * Fetch Unsplash hero image URLs for city guides.
 * Loads UNSPLASH_ACCESS_KEY from .env.local if not in environment.
 * Usage: node scripts/get-unsplash-hero-urls.mjs
 *        node scripts/get-unsplash-hero-urls.mjs --hero-only   (only the 16 city-guide cities)
 *        node scripts/get-unsplash-hero-urls.mjs --hero-only --by-id  (fetch 5 fallback cities by photo ID; use if search hits rate limit)
 * If rate limit is hit, run again later or use --hero-only --by-id for oxford, santa-fe, asheville, savannah, graz.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
let KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!KEY) {
  try {
    const env = readFileSync(join(root, '.env.local'), 'utf8');
    const m = env.match(/^UNSPLASH_ACCESS_KEY=(.+)/m);
    if (m) KEY = m[1].trim();
  } catch (_) {}
}
if (!KEY) {
  console.error('UNSPLASH_ACCESS_KEY not found in env or .env.local');
  process.exit(1);
}

const QUERIES = [
  { slug: 'ghent', city: 'Ghent', query: 'Ghent Belgium Graslei canal medieval' },
  { slug: 'oxford', city: 'Oxford', query: 'Oxford university England Radcliffe Camera' },
  { slug: 'santa-fe', city: 'Santa Fe', query: 'Santa Fe New Mexico adobe' },
  { slug: 'charleston', city: 'Charleston', query: 'Charleston South Carolina Rainbow Row historic' },
  { slug: 'asheville', city: 'Asheville', query: 'Asheville North Carolina Blue Ridge' },
  { slug: 'memphis', city: 'Memphis', query: 'Memphis Tennessee Beale Street Mississippi' },
  { slug: 'savannah', city: 'Savannah', query: 'Savannah Georgia historic square' },
  { slug: 'york', city: 'York', query: 'York England Minster cathedral Shambles' },
  { slug: 'cambridge', city: 'Cambridge', query: 'Cambridge England King\'s College river Cam' },
  { slug: 'basel', city: 'Basel', query: 'Basel Switzerland Rhine Mittlere Brücke' },
  { slug: 'graz', city: 'Graz', query: 'Graz Austria city' },
  { slug: 'baltimore', city: 'Baltimore', query: 'Baltimore Inner Harbor skyline' },
  { slug: 'st-louis', city: 'St. Louis', query: 'St Louis Gateway Arch Missouri' },
  { slug: 'charlotte', city: 'Charlotte', query: 'Charlotte North Carolina skyline' },
  { slug: 'milwaukee', city: 'Milwaukee', query: 'Milwaukee Wisconsin lakefront Art Museum' },
  { slug: 'tucson', city: 'Tucson', query: 'Tucson Arizona desert saguaro mountains' },
  { slug: 'toulon', city: 'Toulon', query: 'Toulon France harbor Mediterranean' },
  { slug: 'birmingham', city: 'Birmingham', query: 'Birmingham England city' },
  { slug: 'dusseldorf', city: 'Düsseldorf', query: 'Düsseldorf Germany Rhine Rheinturm' },
  { slug: 'kuwait-city', city: 'Kuwait City', query: 'Kuwait Towers' },
  { slug: 'almaty', city: 'Almaty', query: 'Almaty Kazakhstan mountains city' },
  { slug: 'dar-es-salaam', city: 'Dar es Salaam', query: 'Dar es Salaam Tanzania waterfront' },
  { slug: 'stuttgart', city: 'Stuttgart', query: 'Stuttgart Germany city' },
  { slug: 'nuremberg', city: 'Nuremberg', query: 'Nuremberg Germany castle' },
  { slug: 'galway', city: 'Galway', query: 'Galway Ireland city' },
  { slug: 'cannes', city: 'Cannes', query: 'Cannes France beach' },
  { slug: 'catania', city: 'Catania', query: 'Catania Sicily city' },
  { slug: 'minneapolis', city: 'Minneapolis', query: 'Minneapolis Minnesota skyline' },
  { slug: 'santo-domingo', city: 'Santo Domingo', query: 'Santo Domingo colonial' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = 'https://api.unsplash.com/search/photos';
const photoBase = 'https://api.unsplash.com/photos';
const HERO_ONLY = process.argv.includes('--hero-only');
const BY_ID = process.argv.includes('--by-id');
// Known Unsplash photo IDs for cities that often get NO_RESULT from search (e.g. due to rate limit)
const PHOTO_IDS = {
  oxford: '73Y466xwLJM',
  'santa-fe': 'LCYgF2kcxTA',
  asheville: '60IeQ4lmDGs',
  savannah: 'r2Uz3Rbs6hE',
  graz: '4vSb71TnB5A',
};
const queriesToRun = HERO_ONLY
  ? QUERIES.filter((q) => ['oxford', 'santa-fe', 'asheville', 'savannah', 'graz'].includes(q.slug))
  : QUERIES;

if (BY_ID && HERO_ONLY) {
  for (const slug of Object.keys(PHOTO_IDS)) {
    try {
      await sleep(500);
      const res = await fetch(`${photoBase}/${PHOTO_IDS[slug]}`, {
        headers: { Authorization: `Client-ID ${KEY}` },
      });
      const data = await res.json();
      const regular = data?.urls?.regular;
      if (regular) {
        const heroUrl = regular.replace(/\?.*$/, '') + '?auto=format&fit=crop&w=1600&q=80';
        console.log(slug + '|' + heroUrl);
      } else {
        console.error(slug + '|NO_RESULT');
      }
    } catch (e) {
      console.error(slug + '|ERROR ' + e.message);
    }
  }
} else {
  for (const { slug, city, query } of queriesToRun) {
    try {
      await sleep(400);
      const url = `${base}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      const res = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}` } });
      const data = await res.json();
      const regular = data?.results?.[0]?.urls?.regular;
      if (regular) {
        const heroUrl = regular.replace(/\?.*$/, '') + '?auto=format&fit=crop&w=1600&q=80';
        console.log(slug + '|' + heroUrl);
      } else {
        console.error(slug + '|NO_RESULT');
      }
    } catch (e) {
      console.error(slug + '|ERROR ' + e.message);
    }
  }
}
