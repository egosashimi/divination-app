# Soul Compass

A private, offline, all-in-one divination and self-reflection web app. It's built mobile-first for adding to the iPhone home screen.

- No accounts, no server, no tracking. Everything (profile, journal, photos) is stored on the device.
- Works offline after the first visit (service worker).
- Plain HTML, CSS and JavaScript modules. No build step and no dependencies.

## Install on iPhone

Open the site in Safari, tap **Share**, then **Add to Home Screen**.

## What's inside

| Area | Readings |
| --- | --- |
| Cards and oracles | Tarot (Rider-Waite, Thoth or Marseille naming; 12 spreads incl. Celtic Cross, relationship, career, timing, year ahead, shadow work, yes/no), Lenormand (lines, 9-card box, Grand Tableau), playing-card cartomancy, oracle decks (animal guides, archetypes, moon, goddesses, angel words), tarot birth cards |
| Casting and lots | I Ching (coins or yarrow odds, changing lines, relating hexagram), Elder Futhark runes (incl. casting), Ogham, geomancy (full shield chart, judge, witnesses, perfection), pendulum, three-dice, cleromancy, Kau Cim with moon blocks, lithomancy, bibliomancy |
| Signs and symbols | Tea leaves, coffee grounds, wax, fire, water, clouds, mirror (photo + symbol guide), cledonism, onomancy |
| Astrology | Natal chart wheel (Placidus, whole sign, equal; tropical or sidereal), aspects, dignities, fixed stars, Chiron; transits and 12-month exact hits; Vedic (nakshatras, Vimshottari dashas, Jaimini karakas, South Indian chart); Hellenistic (sect, Egyptian bounds, lots, profections); draconic, evolutionary, esoteric and lunar lenses; solar/lunar returns and progressions; horary and Prashna; electional day finder; relocation / astrocartography lines; compatibility; sky now with planetary hours |
| Chinese and Eastern | Chinese zodiac (true lunar new year incl. leap months), BaZi four pillars with ten gods and luck pillars, Feng Shui Kua and bagua, Wu Xing, Ayurveda dosha, Vastu, Tibetan year elements |
| Numerology | Core numbers (Pythagorean or Chaldean), karmic debt, personal year/month/day, pinnacles and challenges, Lo Shu grid, names, house numbers, angel numbers, gematria (Hebrew, Greek, English ciphers), sacred geometry |
| Body readings | Palmistry (incl. Samudrika marks), face, iris map overlay, tongue (TCM), fingerprints, ears, feet. Each has photo capture and a guided reading |
| Energy | Chakra check-in (7 + 12-chakra map), aura colors with aura portrait, Human Design (type, authority, profile, centers, channels, bodygraph), Gene Keys sequences, meridian clock, yin/yang, breathwork, crystals, solfeggio and binaural tones |
| Dreams and inner work | Dream journal with automatic symbol detection and recurring-symbol tracking, symbol dictionary, shadow work, inner child, active imagination, synchronicity log, lucid dreaming |
| Personality and purpose | Enneagram, four temperaments, 12 archetypes, Big Five (Mini-IPIP), Jungian type, DISC, values, life-purpose map, soul themes |
| Nature and cycles | Moon phases, wheel of the year (computed solstices and cross-quarters), Celtic tree sign, Maya Tzolkin/Haab/Long Count, correspondences, plant symbolism, life cycles (returns), year ahead, retrogrades and eclipses |

**Compass** combines everything you've used into one reading for a question. It draws fresh tarot cards and an I Ching hexagram, finds themes that recur across systems, and shows where the traditions agree and where they pull apart. It can also copy a ready-made prompt to paste into an AI assistant.

## Accuracy notes

- The ephemeris follows Paul Schlyter's method: about 1 arcminute for the Sun and Moon and a few arcminutes for the planets, 1900 to 2100. Chiron is approximate (about 2 degrees). The lunar node is the mean node.
- Eclipses are found from new and full moons near the nodes. Their type (total, partial, penumbral) isn't computed.
- The tests in `test/run.mjs` check positions against a published ephemeris, Chinese New Year dates, BaZi pillars, the Maya Long Count and more.

## Development

```sh
python3 -m http.server 8765          # serve locally, then open http://localhost:8765
node test/run.mjs                    # calculation tests
node test/smoke.cjs                  # every screen renders without errors (needs Playwright)
node test/flows.cjs                  # questionnaires, saving, journal, Compass
node scripts/sw-manifest.mjs         # refresh the offline precache list
```

Deployment: `.github/workflows/pages.yml` runs the tests, stamps the service worker and publishes to GitHub Pages on every push to `main`.

## Structure

```
index.html, manifest.webmanifest, sw.js
css/app.css
js/app.js            router and shell
js/registry.js       every tool and group
js/core/             ephemeris, charts, Chinese calendar, numerology, storage, UI helpers
js/data/             tarot, I Ching, runes, symbols, quizzes, and other reference text
js/tools/            one module per area
js/views/            Today, Compass, Journal, Profile
```

The interpretive text is either original summary writing or drawn from public-domain sources. The app presents these practices as cultural traditions and tools for reflection, not as scientific prediction or medical advice.
