#!/usr/bin/env node
/**
 * Fetch Unsplash hero image URLs for city guides.
 * Loads UNSPLASH_ACCESS_KEY from .env.local if not in environment.
 * Usage: node scripts/get-unsplash-hero-urls.mjs
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

const base = 'https://api.unsplash.com/search/photos';
for (const { slug, city, query } of QUERIES) {
  try {
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
