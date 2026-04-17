/**
 * Comprehensive produce database with supply chain sourcing data.
 *
 * Each item has:
 *   - peak/shoulder: legacy fallback months (0-indexed) used when no
 *     sourcing data exists for the user's market zone
 *   - sourcing: per-market-zone arrays of source regions. Each source has
 *     its own peak/shoulder months, lat/lon for weather lookups, a weight
 *     (relative market share), and a flag emoji for display.
 *
 * Sourcing data reflects real-world agricultural supply chains:
 *   - US Northeast gets winter produce from California, Mexico, South America
 *   - US West Coast is heavily supplied by California's Central Valley
 *   - Northern Europe gets off-season produce from Spain, Morocco, South Africa
 *
 * Weights are relative (not normalized to 1.0). A source with weight 0.8
 * contributes twice as much as one with weight 0.4 during blending.
 *
 * Three market zones are populated: US_NORTHEAST, US_WEST, NORTHERN_EUROPE.
 * Other zones fall back to the top-level peak/shoulder arrays with climate shift.
 */

export const PRODUCE_DB = [
  // ═══════════════════════════════════════════════════════════════
  // FRUITS
  // ═══════════════════════════════════════════════════════════════

  {
    id: "strawberries", name: "Strawberries", emoji: "🍓", type: "fruit",
    peak: [4, 5], shoulder: [3, 6],
    desc: "Sweet, juicy berries",
    tips: "Look for bright red color with no white shoulders. Smell them — fragrant berries taste best.",
    sourcing: {
      US_NORTHEAST: [
        // Local farms dominate in early summer
        { region: "Northeast US", flag: "🇺🇸", lat: 41.5, lon: -72.8, peak: [5, 6], shoulder: [4, 7], weight: 0.4 },
        // California supplies year-round via Salinas/Watsonville and Oxnard
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 5, 9, 10], shoulder: [1, 6, 11], weight: 0.5 },
        // Mexico fills the winter gap (Baja California)
        { region: "Mexico", flag: "🇲🇽", lat: 30.5, lon: -115.9, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.3 },
      ],
      US_WEST: [
        // California's Central Coast — almost year-round production
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 5, 6, 7, 8, 9, 10], shoulder: [1, 11], weight: 0.8 },
        // Baja California fills any winter gaps
        { region: "Mexico", flag: "🇲🇽", lat: 30.5, lon: -115.9, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        // Local European summer season (UK, Netherlands, Germany)
        { region: "Western Europe", flag: "🇪🇺", lat: 51.5, lon: 0.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.5 },
        // Spain supplies early season and shoulder months
        { region: "Spain", flag: "🇪🇸", lat: 37.2, lon: -3.6, peak: [1, 2, 3, 4], shoulder: [0, 5], weight: 0.5 },
        // Morocco fills deep winter
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.3 },
      ],
    },
  },

  {
    id: "blueberries", name: "Blueberries", emoji: "🫐", type: "fruit",
    peak: [5, 6, 7], shoulder: [4, 8],
    desc: "Antioxidant-rich gems",
    tips: "A dusty silver-blue coating (bloom) means they're fresh. Shake the container — they should move freely.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.4, lon: -71.4, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.4 },
        { region: "Southeast US", flag: "🇺🇸", lat: 31.2, lon: -82.4, peak: [4, 5], shoulder: [3, 6], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -35.0, lon: -71.2, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.3 },
      ],
      US_WEST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.8, lon: -123.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.5 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5], shoulder: [3, 6], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -35.0, lon: -71.2, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Poland", flag: "🇵🇱", lat: 51.9, lon: 19.1, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.2, lon: -6.9, peak: [3, 4, 5], shoulder: [2, 6], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -35.0, lon: -71.2, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.3 },
      ],
    },
  },

  {
    id: "raspberries", name: "Raspberries", emoji: "🫐", type: "fruit",
    peak: [5, 6, 7], shoulder: [8],
    desc: "Delicate summer berries",
    tips: "Check the bottom of the container for staining or mold. Use within 1-2 days of purchase.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5, 6, 9, 10], shoulder: [3, 7, 11], weight: 0.5 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.7, lon: -103.4, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.4 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.4, lon: -71.4, peak: [6, 7], shoulder: [5, 8], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5, 6, 9, 10], shoulder: [3, 7, 11], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.7, lon: -103.4, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 51.5, lon: 0.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.2, lon: -6.9, peak: [2, 3, 4, 5], shoulder: [1, 6], weight: 0.4 },
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.2 },
      ],
    },
  },

  {
    id: "cherries", name: "Cherries", emoji: "🍒", type: "fruit",
    peak: [5, 6], shoulder: [4, 7],
    desc: "Stone fruit classic",
    tips: "Choose firm, glossy cherries with green stems. Darker color usually means sweeter flavor.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 47.5, lon: -120.5, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.5 },
        { region: "California", flag: "🇺🇸", lat: 37.8, lon: -120.3, peak: [4, 5], shoulder: [3, 6], weight: 0.4 },
        { region: "Chile", flag: "🇨🇱", lat: -34.6, lon: -71.0, peak: [11, 0], shoulder: [10, 1], weight: 0.3 },
      ],
      US_WEST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 47.5, lon: -120.5, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.6 },
        { region: "California", flag: "🇺🇸", lat: 37.8, lon: -120.3, peak: [4, 5], shoulder: [3, 6], weight: 0.5 },
      ],
      NORTHERN_EUROPE: [
        { region: "Turkey", flag: "🇹🇷", lat: 40.8, lon: 36.5, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 38.5, lon: -1.0, peak: [4, 5], shoulder: [3, 6], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -34.6, lon: -71.0, peak: [11, 0], shoulder: [10, 1], weight: 0.3 },
      ],
    },
  },

  {
    id: "peaches", name: "Peaches", emoji: "🍑", type: "fruit",
    peak: [6, 7], shoulder: [5, 8],
    desc: "Fuzzy summer sweetness",
    tips: "Smell the stem end — ripe peaches are very fragrant. They should give slightly when pressed.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Southeast US", flag: "🇺🇸", lat: 33.0, lon: -83.6, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.5 },
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.5 },
        { region: "Chile", flag: "🇨🇱", lat: -34.0, lon: -70.7, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.5 },
        { region: "Italy", flag: "🇮🇹", lat: 41.0, lon: 14.3, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.4 },
        { region: "South Africa", flag: "🇿🇦", lat: -33.9, lon: 18.9, peak: [11, 0, 1], shoulder: [10, 2], weight: 0.2 },
      ],
    },
  },

  {
    id: "watermelon", name: "Watermelon", emoji: "🍉", type: "fruit",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Ultimate summer refresher",
    tips: "Look for a yellow field spot and feel for heaviness. A hollow sound when tapped means it's ripe.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Southeast US", flag: "🇺🇸", lat: 32.0, lon: -83.0, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.5 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.0, lon: -104.7, peak: [3, 4, 5], shoulder: [2, 6], weight: 0.3 },
        { region: "Central America", flag: "🌎", lat: 14.6, lon: -90.5, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 35.4, lon: -119.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.0, lon: -104.7, peak: [3, 4, 5], shoulder: [2, 6], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.6 },
        { region: "Italy", flag: "🇮🇹", lat: 40.8, lon: 14.3, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "Brazil", flag: "🇧🇷", lat: -12.0, lon: -38.5, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.2 },
      ],
    },
  },

  {
    id: "cantaloupe", name: "Cantaloupe", emoji: "🍈", type: "fruit",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Sweet melon delight",
    tips: "Press the stem end — it should give slightly and smell sweet. Avoid any with soft spots.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 33.7, lon: -116.2, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.5 },
        { region: "Central America", flag: "🌎", lat: 14.6, lon: -87.0, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.4 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 33.7, lon: -116.2, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.0, lon: -104.7, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.5 },
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [4, 5, 6], shoulder: [3, 7], weight: 0.3 },
        { region: "Brazil", flag: "🇧🇷", lat: -5.8, lon: -35.2, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.2 },
      ],
    },
  },

  {
    id: "apples", name: "Apples", emoji: "🍎", type: "fruit",
    peak: [8, 9, 10], shoulder: [7, 11],
    desc: "Crisp autumn harvest",
    tips: "Firm with no bruising. Store in the fridge — they last weeks longer than on the counter.",
    sourcing: {
      US_NORTHEAST: [
        // Northeast apple country — New York, Massachusetts, Vermont
        { region: "Northeast US", flag: "🇺🇸", lat: 42.6, lon: -73.8, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.5 },
        // Washington State supplies year-round from cold storage
        { region: "Washington State", flag: "🇺🇸", lat: 47.4, lon: -120.3, peak: [8, 9, 10], shoulder: [7, 11, 0, 1, 2, 3], weight: 0.5 },
        // Chile and New Zealand fill the spring gap
        { region: "Chile", flag: "🇨🇱", lat: -35.0, lon: -71.2, peak: [2, 3, 4], shoulder: [1, 5], weight: 0.2 },
      ],
      US_WEST: [
        { region: "Washington State", flag: "🇺🇸", lat: 47.4, lon: -120.3, peak: [8, 9, 10], shoulder: [7, 11, 0, 1, 2, 3], weight: 0.8 },
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 51.5, lon: 0.0, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.5 },
        { region: "New Zealand", flag: "🇳🇿", lat: -39.3, lon: 176.0, peak: [2, 3, 4], shoulder: [1, 5], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -33.9, lon: 18.9, peak: [1, 2, 3, 4], shoulder: [0, 5], weight: 0.2 },
      ],
    },
  },

  {
    id: "pears", name: "Pears", emoji: "🍐", type: "fruit",
    peak: [8, 9, 10], shoulder: [7, 11],
    desc: "Buttery fall fruit",
    tips: "Buy firm and ripen at home. Check the neck — when it gives to gentle pressure, it's ready.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.2, lon: -119.2, peak: [8, 9, 10], shoulder: [7, 11, 0], weight: 0.6 },
        { region: "California", flag: "🇺🇸", lat: 38.5, lon: -121.5, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.3 },
        { region: "Argentina", flag: "🇦🇷", lat: -39.0, lon: -67.0, peak: [1, 2, 3], shoulder: [0, 4], weight: 0.2 },
      ],
      US_WEST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.2, lon: -119.2, peak: [8, 9, 10], shoulder: [7, 11, 0], weight: 0.7 },
        { region: "California", flag: "🇺🇸", lat: 38.5, lon: -121.5, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 51.0, lon: 3.7, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.5 },
        { region: "South Africa", flag: "🇿🇦", lat: -33.9, lon: 18.9, peak: [1, 2, 3], shoulder: [0, 4], weight: 0.3 },
        { region: "Argentina", flag: "🇦🇷", lat: -39.0, lon: -67.0, peak: [1, 2, 3], shoulder: [0, 4], weight: 0.2 },
      ],
    },
  },

  {
    id: "grapes", name: "Grapes", emoji: "🍇", type: "fruit",
    peak: [7, 8, 9], shoulder: [6, 10],
    desc: "Vine-ripened clusters",
    tips: "Stems should be green and flexible. A powdery bloom on the skin is a sign of freshness.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.3, lon: -119.3, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.6 },
        { region: "Chile", flag: "🇨🇱", lat: -30.0, lon: -71.2, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.4 },
        { region: "Mexico", flag: "🇲🇽", lat: 28.6, lon: -111.5, peak: [4, 5], shoulder: [3, 6], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.3, lon: -119.3, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.8 },
        { region: "Chile", flag: "🇨🇱", lat: -30.0, lon: -71.2, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 38.5, lon: -1.0, peak: [7, 8, 9, 10], shoulder: [6, 11], weight: 0.4 },
        { region: "Italy", flag: "🇮🇹", lat: 41.5, lon: 15.5, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -33.9, lon: 18.9, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -30.0, lon: -71.2, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.2 },
      ],
    },
  },

  {
    id: "oranges", name: "Oranges", emoji: "🍊", type: "fruit",
    peak: [11, 0, 1, 2], shoulder: [10, 3],
    desc: "Winter citrus sunshine",
    tips: "Heavy for their size means more juice. Skin color doesn't indicate ripeness — even green ones can be ripe.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Florida", flag: "🇺🇸", lat: 27.8, lon: -81.6, peak: [10, 11, 0, 1, 2, 3], shoulder: [9, 4], weight: 0.5 },
        { region: "California", flag: "🇺🇸", lat: 35.4, lon: -119.0, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.4 },
        { region: "South Africa", flag: "🇿🇦", lat: -32.4, lon: 19.0, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 35.4, lon: -119.0, peak: [11, 0, 1, 2, 3, 4], shoulder: [10, 5], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.0, lon: -110.0, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 39.5, lon: -0.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [9, 4], weight: 0.6 },
        { region: "South Africa", flag: "🇿🇦", lat: -32.4, lon: 19.0, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.3 },
        { region: "Morocco", flag: "🇲🇦", lat: 34.0, lon: -5.0, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
    },
  },

  {
    id: "grapefruits", name: "Grapefruits", emoji: "🍊", type: "fruit",
    peak: [11, 0, 1, 2], shoulder: [10, 3],
    desc: "Tart citrus wake-up",
    tips: "Choose heavy, slightly flattened fruit. Pink and red varieties tend to be sweeter than white.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Florida", flag: "🇺🇸", lat: 27.0, lon: -80.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [9, 4], weight: 0.5 },
        { region: "Texas", flag: "🇺🇸", lat: 26.2, lon: -98.2, peak: [10, 11, 0, 1, 2], shoulder: [9, 3], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -32.4, lon: 19.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 33.5, lon: -116.1, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.6 },
        { region: "Texas", flag: "🇺🇸", lat: 26.2, lon: -98.2, peak: [10, 11, 0, 1, 2], shoulder: [9, 3], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 39.5, lon: -0.4, peak: [10, 11, 0, 1, 2], shoulder: [9, 3], weight: 0.5 },
        { region: "Turkey", flag: "🇹🇷", lat: 36.9, lon: 30.7, peak: [10, 11, 0, 1, 2], shoulder: [9, 3], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -32.4, lon: 19.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.2 },
      ],
    },
  },

  {
    id: "lemons", name: "Lemons", emoji: "🍋", type: "fruit",
    peak: [11, 0, 1, 2, 3], shoulder: [4, 10],
    desc: "Bright and zesty",
    tips: "Thin-skinned lemons yield more juice. Roll on the counter before cutting to release more juice.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 34.4, lon: -119.2, peak: [11, 0, 1, 2, 3, 4], shoulder: [5, 10], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 19.4, lon: -103.5, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.3 },
        { region: "Argentina", flag: "🇦🇷", lat: -26.8, lon: -65.2, peak: [4, 5, 6, 7, 8], shoulder: [3, 9], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 34.4, lon: -119.2, peak: [11, 0, 1, 2, 3, 4, 5], shoulder: [6, 10], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -1.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.6 },
        { region: "Turkey", flag: "🇹🇷", lat: 36.8, lon: 30.7, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -32.4, lon: 19.0, peak: [4, 5, 6, 7], shoulder: [3, 8], weight: 0.2 },
      ],
    },
  },

  {
    id: "limes", name: "Limes", emoji: "🍋", type: "fruit",
    peak: [4, 5, 6, 7, 8], shoulder: [3, 9],
    desc: "Tropical tang",
    tips: "Slightly yellow limes are actually riper and juicier than bright green ones.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Mexico", flag: "🇲🇽", lat: 18.9, lon: -103.9, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.7 },
        { region: "Brazil", flag: "🇧🇷", lat: -23.5, lon: -46.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.2 },
      ],
      US_WEST: [
        { region: "Mexico", flag: "🇲🇽", lat: 18.9, lon: -103.9, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Brazil", flag: "🇧🇷", lat: -23.5, lon: -46.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
        { region: "Mexico", flag: "🇲🇽", lat: 18.9, lon: -103.9, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -1.7, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.2 },
      ],
    },
  },

  {
    id: "mangoes", name: "Mangoes", emoji: "🥭", type: "fruit",
    peak: [4, 5, 6, 7], shoulder: [3, 8],
    desc: "Tropical luxury",
    tips: "Squeeze gently — ripe mangoes give slightly. Smell the stem end for a sweet, fruity aroma.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Mexico", flag: "🇲🇽", lat: 18.5, lon: -96.9, peak: [2, 3, 4, 5, 6], shoulder: [1, 7], weight: 0.5 },
        { region: "Peru", flag: "🇵🇪", lat: -5.2, lon: -80.1, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
        { region: "Brazil", flag: "🇧🇷", lat: -9.5, lon: -40.5, peak: [9, 10, 11, 0, 1], shoulder: [8, 2], weight: 0.2 },
        { region: "India", flag: "🇮🇳", lat: 19.1, lon: 73.0, peak: [3, 4, 5, 6], shoulder: [2, 7], weight: 0.2 },
      ],
      US_WEST: [
        { region: "Mexico", flag: "🇲🇽", lat: 18.5, lon: -96.9, peak: [2, 3, 4, 5, 6, 7], shoulder: [1, 8], weight: 0.7 },
        { region: "Peru", flag: "🇵🇪", lat: -5.2, lon: -80.1, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Brazil", flag: "🇧🇷", lat: -9.5, lon: -40.5, peak: [9, 10, 11, 0, 1], shoulder: [8, 2], weight: 0.3 },
        { region: "Peru", flag: "🇵🇪", lat: -5.2, lon: -80.1, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
        { region: "India", flag: "🇮🇳", lat: 19.1, lon: 73.0, peak: [3, 4, 5, 6], shoulder: [2, 7], weight: 0.3 },
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -4.4, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.2 },
      ],
    },
  },

  {
    id: "pineapple", name: "Pineapple", emoji: "🍍", type: "fruit",
    peak: [2, 3, 4, 5], shoulder: [1, 6],
    desc: "Tropical sweetness",
    tips: "Pluck a center leaf — if it comes out easily, it's ripe. Should smell sweet at the base.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Costa Rica", flag: "🇨🇷", lat: 10.0, lon: -84.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.6 },
        { region: "Honduras", flag: "🇭🇳", lat: 15.5, lon: -88.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.2 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.0, lon: -97.0, peak: [2, 3, 4, 5, 6], shoulder: [1, 7], weight: 0.2 },
      ],
      US_WEST: [
        { region: "Costa Rica", flag: "🇨🇷", lat: 10.0, lon: -84.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.5 },
        { region: "Hawaii", flag: "🇺🇸", lat: 21.3, lon: -157.8, peak: [3, 4, 5, 6, 7], shoulder: [2, 8], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.0, lon: -97.0, peak: [2, 3, 4, 5, 6], shoulder: [1, 7], weight: 0.2 },
      ],
      NORTHERN_EUROPE: [
        { region: "Costa Rica", flag: "🇨🇷", lat: 10.0, lon: -84.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.5 },
        { region: "Ghana", flag: "🇬🇭", lat: 5.6, lon: -0.2, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Ivory Coast", flag: "🇨🇮", lat: 6.8, lon: -5.3, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.2 },
      ],
    },
  },

  {
    id: "bananas", name: "Bananas", emoji: "🍌", type: "fruit",
    peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [],
    desc: "Year-round staple",
    tips: "Buy green and let them ripen. Brown spots mean more sugar. Separate them to slow ripening.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Ecuador", flag: "🇪🇨", lat: -1.8, lon: -79.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
        { region: "Guatemala", flag: "🇬🇹", lat: 14.6, lon: -90.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Colombia", flag: "🇨🇴", lat: 8.0, lon: -76.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
      ],
      US_WEST: [
        { region: "Ecuador", flag: "🇪🇨", lat: -1.8, lon: -79.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
        { region: "Guatemala", flag: "🇬🇹", lat: 14.6, lon: -90.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 17.0, lon: -93.4, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Ecuador", flag: "🇪🇨", lat: -1.8, lon: -79.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Colombia", flag: "🇨🇴", lat: 8.0, lon: -76.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Canary Islands", flag: "🇪🇸", lat: 28.1, lon: -15.4, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
      ],
    },
  },

  {
    id: "avocados", name: "Avocados", emoji: "🥑", type: "fruit",
    peak: [2, 3, 4, 5, 6, 7, 8], shoulder: [1, 9],
    desc: "Creamy perfection",
    tips: "Flick the stem nub — green underneath means ripe. Store unripe ones in a paper bag with a banana.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Mexico", flag: "🇲🇽", lat: 19.4, lon: -102.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.7 },
        { region: "Peru", flag: "🇵🇪", lat: -13.5, lon: -76.0, peak: [3, 4, 5, 6, 7, 8], shoulder: [2, 9], weight: 0.2 },
        { region: "California", flag: "🇺🇸", lat: 34.4, lon: -119.2, peak: [2, 3, 4, 5, 6, 7, 8], shoulder: [1, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "Mexico", flag: "🇲🇽", lat: 19.4, lon: -102.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.5 },
        { region: "California", flag: "🇺🇸", lat: 34.4, lon: -119.2, peak: [2, 3, 4, 5, 6, 7, 8], shoulder: [1, 9], weight: 0.5 },
      ],
      NORTHERN_EUROPE: [
        { region: "Peru", flag: "🇵🇪", lat: -13.5, lon: -76.0, peak: [3, 4, 5, 6, 7, 8], shoulder: [2, 9], weight: 0.3 },
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -4.4, peak: [9, 10, 11, 0, 1, 2], shoulder: [3, 8], weight: 0.3 },
        { region: "Chile", flag: "🇨🇱", lat: -33.0, lon: -71.6, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.2 },
        { region: "Israel", flag: "🇮🇱", lat: 32.1, lon: 34.8, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.2 },
      ],
    },
  },

  {
    id: "plums", name: "Plums", emoji: "🫐", type: "fruit",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Sweet stone fruit",
    tips: "Slight give when pressed means ripe. A whitish bloom on the skin is natural and indicates freshness.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.6 },
        { region: "Chile", flag: "🇨🇱", lat: -34.0, lon: -70.7, peak: [0, 1, 2], shoulder: [11, 3], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.5 },
        { region: "Italy", flag: "🇮🇹", lat: 41.0, lon: 14.3, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "South Africa", flag: "🇿🇦", lat: -33.9, lon: 18.9, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
    },
  },

  {
    id: "pomegranates", name: "Pomegranates", emoji: "🫐", type: "fruit",
    peak: [9, 10, 11], shoulder: [8, 0],
    desc: "Jeweled winter fruit",
    tips: "Heavier is better — it means more juice. Scratch the skin; deep red underneath means ripe seeds.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.3, lon: -119.3, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.6 },
        { region: "Chile", flag: "🇨🇱", lat: -30.0, lon: -71.2, peak: [3, 4, 5], shoulder: [2, 6], weight: 0.2 },
        { region: "Peru", flag: "🇵🇪", lat: -13.5, lon: -76.0, peak: [2, 3, 4], shoulder: [1, 5], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.3, lon: -119.3, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Turkey", flag: "🇹🇷", lat: 37.0, lon: 35.3, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.4 },
        { region: "India", flag: "🇮🇳", lat: 19.1, lon: 73.0, peak: [1, 2, 3], shoulder: [0, 4], weight: 0.2 },
      ],
    },
  },

  {
    id: "cranberries", name: "Cranberries", emoji: "🫐", type: "fruit",
    peak: [9, 10, 11], shoulder: [8],
    desc: "Tart holiday staple",
    tips: "Fresh cranberries should bounce when dropped. Freeze extras — they last months in the freezer.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Massachusetts", flag: "🇺🇸", lat: 41.8, lon: -70.7, peak: [9, 10, 11], shoulder: [8], weight: 0.5 },
        { region: "Wisconsin", flag: "🇺🇸", lat: 44.3, lon: -89.8, peak: [9, 10], shoulder: [8, 11], weight: 0.4 },
      ],
      US_WEST: [
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.2, lon: -123.8, peak: [9, 10, 11], shoulder: [8], weight: 0.6 },
        { region: "Wisconsin", flag: "🇺🇸", lat: 44.3, lon: -89.8, peak: [9, 10], shoulder: [8, 11], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        // Cranberries are less common in Europe — mostly imported from US/Canada
        { region: "Northeast US", flag: "🇺🇸", lat: 41.8, lon: -70.7, peak: [9, 10, 11], shoulder: [8], weight: 0.5 },
        { region: "Canada", flag: "🇨🇦", lat: 49.1, lon: -122.8, peak: [9, 10], shoulder: [8, 11], weight: 0.4 },
      ],
    },
  },

  {
    id: "figs", name: "Figs", emoji: "🫐", type: "fruit",
    peak: [7, 8, 9], shoulder: [6, 10],
    desc: "Honey-sweet delicacy",
    tips: "Ripe figs are soft and may have slight cracks. Use within 1-2 days — they're extremely perishable.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.7 },
        { region: "Turkey", flag: "🇹🇷", lat: 37.8, lon: 27.8, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Turkey", flag: "🇹🇷", lat: 37.8, lon: 27.8, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.3 },
        { region: "Italy", flag: "🇮🇹", lat: 38.1, lon: 13.4, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.2 },
      ],
    },
  },

  {
    id: "persimmons", name: "Persimmons", emoji: "🍊", type: "fruit",
    peak: [9, 10, 11], shoulder: [8],
    desc: "Autumn jewel",
    tips: "Fuyu can be eaten firm; Hachiya must be very soft. Both should have glossy, unbroken skin.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.7 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [9, 10, 11, 0], shoulder: [8, 1], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 39.0, lon: -0.3, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.5 },
        { region: "Italy", flag: "🇮🇹", lat: 41.0, lon: 14.3, peak: [9, 10, 11], shoulder: [8], weight: 0.3 },
        { region: "Israel", flag: "🇮🇱", lat: 32.1, lon: 34.8, peak: [10, 11, 0], shoulder: [9, 1], weight: 0.2 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // VEGETABLES
  // ═══════════════════════════════════════════════════════════════

  {
    id: "asparagus", name: "Asparagus", emoji: "🥦", type: "vegetable",
    peak: [2, 3, 4], shoulder: [1, 5],
    desc: "Spring herald",
    tips: "Look for firm, straight spears with tight tips. Thicker spears are just as tender as thin ones.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 37.3, lon: -121.0, peak: [1, 2, 3, 4], shoulder: [0, 5], weight: 0.4 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.3 },
        { region: "Peru", flag: "🇵🇪", lat: -13.6, lon: -76.1, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 37.3, lon: -121.0, peak: [1, 2, 3, 4, 5], shoulder: [0, 6], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [0, 1, 2], shoulder: [11, 3], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [3, 4, 5], shoulder: [2, 6], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [1, 2, 3, 4], shoulder: [0, 5], weight: 0.3 },
        { region: "Peru", flag: "🇵🇪", lat: -13.6, lon: -76.1, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.3 },
      ],
    },
  },

  {
    id: "artichokes", name: "Artichokes", emoji: "🥦", type: "vegetable",
    peak: [2, 3, 4], shoulder: [9, 10],
    desc: "Thistle treasure",
    tips: "Squeeze them — fresh artichokes squeak. Heavy for size with tight leaves is ideal.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 9, 10], shoulder: [1, 5, 8, 11], weight: 0.8 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 9, 10], shoulder: [1, 5, 8, 11], weight: 0.9 },
      ],
      NORTHERN_EUROPE: [
        { region: "Italy", flag: "🇮🇹", lat: 41.0, lon: 14.3, peak: [2, 3, 4, 5], shoulder: [1, 6], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -1.2, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
        { region: "France", flag: "🇫🇷", lat: 48.6, lon: -3.8, peak: [4, 5, 6], shoulder: [3, 7], weight: 0.2 },
      ],
    },
  },

  {
    id: "peas", name: "Peas", emoji: "🫛", type: "vegetable",
    peak: [3, 4, 5], shoulder: [2, 6],
    desc: "Sweet spring pods",
    tips: "Bright green, plump pods that snap crisply. Eat quickly — sugar converts to starch after picking.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 5], shoulder: [1, 6], weight: 0.4 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [5, 6], shoulder: [4, 7], weight: 0.3 },
        { region: "Guatemala", flag: "🇬🇹", lat: 14.6, lon: -90.5, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [2, 3, 4, 5, 6], shoulder: [1, 7], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 19.4, lon: -103.5, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 1.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.5 },
        { region: "Kenya", flag: "🇰🇪", lat: -0.2, lon: 36.8, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
        { region: "Guatemala", flag: "🇬🇹", lat: 14.6, lon: -90.5, peak: [10, 11, 0, 1], shoulder: [9, 2], weight: 0.2 },
      ],
    },
  },

  {
    id: "spinach", name: "Spinach", emoji: "🥬", type: "vegetable",
    peak: [2, 3, 4, 9, 10], shoulder: [1, 5, 8, 11],
    desc: "Leafy green power",
    tips: "Deep green with no yellowing or sliminess. Baby spinach is more tender; mature is better for cooking.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 10, 11], shoulder: [4, 9], weight: 0.5 },
        { region: "Arizona", flag: "🇺🇸", lat: 32.7, lon: -114.6, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [4, 5, 9, 10], shoulder: [3, 6, 8, 11], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 9, 10, 11], shoulder: [5, 8], weight: 0.7 },
        { region: "Arizona", flag: "🇺🇸", lat: 32.7, lon: -114.6, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [3, 4, 5, 9, 10], shoulder: [2, 6, 8, 11], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
    },
  },

  {
    id: "lettuce", name: "Lettuce", emoji: "🥬", type: "vegetable",
    peak: [3, 4, 5, 9, 10], shoulder: [2, 6, 8, 11],
    desc: "Salad essential",
    tips: "Crisp leaves with no browning on edges. Store with a damp paper towel in a sealed bag.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 10, 11], shoulder: [5, 9], weight: 0.5 },
        { region: "Arizona", flag: "🇺🇸", lat: 32.7, lon: -114.6, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [5, 6, 9, 10], shoulder: [4, 7, 8, 11], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 9, 10, 11], shoulder: [6, 8], weight: 0.7 },
        { region: "Arizona", flag: "🇺🇸", lat: 32.7, lon: -114.6, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [4, 5, 6, 7, 8, 9, 10], shoulder: [3, 11], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
    },
  },

  {
    id: "radishes", name: "Radishes", emoji: "🥬", type: "vegetable",
    peak: [3, 4, 5], shoulder: [2, 6, 9, 10],
    desc: "Peppery crunch",
    tips: "Firm with bright color and fresh greens attached. Smaller radishes tend to be less spicy.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 10, 11], shoulder: [5, 9], weight: 0.4 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [4, 5, 6], shoulder: [3, 7, 9, 10], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 22.0, lon: -100.0, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 9, 10, 11], shoulder: [6, 8], weight: 0.7 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [3, 4, 5, 6], shoulder: [2, 7, 9, 10], weight: 0.6 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
      ],
    },
  },

  {
    id: "tomatoes", name: "Tomatoes", emoji: "🍅", type: "vegetable",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Summer garden star",
    tips: "Never refrigerate — cold kills flavor. Vine-ripe and local will always outshine shipped tomatoes.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 40.0, lon: -74.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.4 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], weight: 0.5 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [4, 5, 6, 7, 8, 9], shoulder: [3, 10], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -2.5, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.2 },
      ],
    },
  },

  {
    id: "corn", name: "Corn", emoji: "🌽", type: "vegetable",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Sweet summer ears",
    tips: "Feel through the husk for plump, even rows. Fresh silk should be slightly sticky and golden.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [7, 8], shoulder: [6, 9], weight: 0.4 },
        { region: "Southeast US", flag: "🇺🇸", lat: 32.0, lon: -83.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.3 },
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.0, lon: -103.0, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 48.0, lon: 2.3, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 42.0, lon: -4.5, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
      ],
    },
  },

  {
    id: "zucchini", name: "Zucchini", emoji: "🥒", type: "vegetable",
    peak: [5, 6, 7, 8], shoulder: [4, 9],
    desc: "Prolific summer squash",
    tips: "Smaller is better — 6-8 inches has the best flavor and texture. Skin should be glossy.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5, 6, 7, 8, 9, 10], shoulder: [3, 11], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -2.5, peak: [3, 4, 5, 6, 7, 8, 9], shoulder: [2, 10], weight: 0.5 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.3 },
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.2 },
      ],
    },
  },

  {
    id: "cucumbers", name: "Cucumbers", emoji: "🥒", type: "vegetable",
    peak: [5, 6, 7, 8], shoulder: [4, 9],
    desc: "Cool and crisp",
    tips: "Firm all over with no soft spots. Unwaxed English cucumbers have better flavor.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.3 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5, 6, 7, 8, 9, 10], shoulder: [3, 11], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [3, 4, 5, 6, 7, 8, 9], shoulder: [2, 10], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -2.5, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
    },
  },

  {
    id: "bell_peppers", name: "Bell Peppers", emoji: "🫑", type: "vegetable",
    peak: [6, 7, 8, 9], shoulder: [5, 10],
    desc: "Colorful crunch",
    tips: "Red, orange, and yellow are just ripe green peppers — sweeter with more vitamins. Choose firm and heavy.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.3 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
      NORTHERN_EUROPE: [
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -2.5, peak: [9, 10, 11, 0, 1, 2, 3, 4], shoulder: [5, 8], weight: 0.5 },
      ],
    },
  },

  {
    id: "eggplant", name: "Eggplant", emoji: "🍆", type: "vegetable",
    peak: [6, 7, 8, 9], shoulder: [5, 10],
    desc: "Purple perfection",
    tips: "Press the skin — it should bounce back. Lighter weight means fewer seeds and less bitterness.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.3 },
        { region: "Northeast US", flag: "🇺🇸", lat: 40.0, lon: -74.0, peak: [7, 8, 9], shoulder: [6, 10], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 36.7, lon: -2.5, peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11], weight: 0.5 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.3 },
        { region: "Turkey", flag: "🇹🇷", lat: 37.0, lon: 35.3, peak: [6, 7, 8, 9], shoulder: [5, 10], weight: 0.2 },
      ],
    },
  },

  {
    id: "green_beans", name: "Green Beans", emoji: "🫛", type: "vegetable",
    peak: [5, 6, 7, 8], shoulder: [4, 9],
    desc: "Snappy summer pods",
    tips: "They should snap cleanly when bent. Avoid any with visible seeds bulging through the pod.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [4, 5, 6, 7, 8, 9, 10], shoulder: [3, 11], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 48.0, lon: 2.3, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.4 },
        { region: "Kenya", flag: "🇰🇪", lat: -0.2, lon: 36.8, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
        { region: "Morocco", flag: "🇲🇦", lat: 33.6, lon: -7.6, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.2 },
      ],
    },
  },

  {
    id: "broccoli", name: "Broccoli", emoji: "🥦", type: "vegetable",
    peak: [9, 10, 11, 2, 3], shoulder: [1, 4, 8],
    desc: "Cruciferous champion",
    tips: "Tight, dark green florets with firm stems. Yellowing means it's past prime. Stems are edible — peel and slice them.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 10, 11], shoulder: [5, 9], weight: 0.5 },
        { region: "Arizona", flag: "🇺🇸", lat: 32.7, lon: -114.6, peak: [11, 0, 1, 2, 3], shoulder: [10, 4], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 9, 10, 11], shoulder: [6, 8], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 1.0, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
    },
  },

  {
    id: "cauliflower", name: "Cauliflower", emoji: "🥦", type: "vegetable",
    peak: [9, 10, 11], shoulder: [8, 0, 1],
    desc: "Versatile florets",
    tips: "Creamy white with no brown spots. Leaves should look fresh. Heavy for its size is a good sign.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 10, 11], shoulder: [5, 9], weight: 0.5 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [9, 10], shoulder: [8, 11], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 9, 10, 11], shoulder: [6, 8], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 1.0, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.4 },
      ],
    },
  },

  {
    id: "brussels_sprouts", name: "Brussels Sprouts", emoji: "🥦", type: "vegetable",
    peak: [9, 10, 11], shoulder: [8, 0],
    desc: "Mini cabbage gems",
    tips: "Small and bright green are sweetest. After a frost they're even sweeter. Cut an X in the base for even cooking.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [9, 10, 11, 0, 1, 2], shoulder: [3, 8], weight: 0.5 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 19.4, lon: -103.5, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [8, 9, 10, 11, 0, 1, 2, 3], shoulder: [4, 7], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 3.0, peak: [8, 9, 10, 11, 0], shoulder: [1, 7], weight: 0.6 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.3 },
      ],
    },
  },

  {
    id: "kale", name: "Kale", emoji: "🥬", type: "vegetable",
    peak: [9, 10, 11, 0, 1], shoulder: [2, 8],
    desc: "Hearty winter green",
    tips: "Smaller leaves are more tender. Frost-kissed kale is sweeter. Massage raw kale with oil to tenderize.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 10, 11], shoulder: [5, 9], weight: 0.4 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [9, 10, 11], shoulder: [4, 5, 8], weight: 0.4 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 9, 10, 11], shoulder: [6, 8], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [9, 10, 11, 0, 1], shoulder: [2, 8], weight: 0.6 },
        { region: "Italy", flag: "🇮🇹", lat: 41.0, lon: 14.3, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
      ],
    },
  },

  {
    id: "sweet_potatoes", name: "Sweet Potatoes", emoji: "🍠", type: "vegetable",
    peak: [9, 10, 11], shoulder: [8, 0, 1],
    desc: "Orange comfort food",
    tips: "Firm with no cracks, soft spots, or sprouting. Store in a cool dark place — never refrigerate.",
    sourcing: {
      US_NORTHEAST: [
        { region: "North Carolina", flag: "🇺🇸", lat: 35.5, lon: -78.6, peak: [8, 9, 10, 11], shoulder: [0, 1, 7], weight: 0.5 },
        { region: "Mississippi", flag: "🇺🇸", lat: 32.3, lon: -90.2, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.3 },
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.5 },
        { region: "North Carolina", flag: "🇺🇸", lat: 35.5, lon: -78.6, peak: [8, 9, 10, 11], shoulder: [0, 1, 7], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "North Carolina", flag: "🇺🇸", lat: 35.5, lon: -78.6, peak: [8, 9, 10, 11], shoulder: [0, 1, 7], weight: 0.3 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.3 },
        { region: "Egypt", flag: "🇪🇬", lat: 30.0, lon: 31.2, peak: [9, 10, 11, 0], shoulder: [8, 1], weight: 0.2 },
      ],
    },
  },

  {
    id: "butternut_squash", name: "Butternut Squash", emoji: "🎃", type: "vegetable",
    peak: [9, 10, 11], shoulder: [8, 0, 1],
    desc: "Autumn warmth",
    tips: "Hard rind with a matte finish and solid stem. Heavy for its size. More beige = more ripe and sweet.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [9, 10, 11], shoulder: [8, 0, 1], weight: 0.4 },
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.0, lon: -103.0, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [8, 9, 10, 11, 0], shoulder: [7, 1], weight: 0.7 },
        { region: "Mexico", flag: "🇲🇽", lat: 20.0, lon: -103.0, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [9, 10, 11], shoulder: [8, 0, 1], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [8, 9, 10, 11], shoulder: [7, 0], weight: 0.3 },
      ],
    },
  },

  {
    id: "pumpkin", name: "Pumpkin", emoji: "🎃", type: "vegetable",
    peak: [9, 10], shoulder: [8, 11],
    desc: "Fall icon",
    tips: "Sugar pumpkins (small) are for eating; jack-o-lantern types are watery. Firm with no soft spots.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -75.0, peak: [9, 10], shoulder: [8, 11], weight: 0.5 },
        { region: "Midwest US", flag: "🇺🇸", lat: 40.0, lon: -89.0, peak: [9, 10], shoulder: [8, 11], weight: 0.4 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.7, lon: -119.8, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.6 },
        { region: "Midwest US", flag: "🇺🇸", lat: 40.0, lon: -89.0, peak: [9, 10], shoulder: [8, 11], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [9, 10], shoulder: [8, 11], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [9, 10, 11], shoulder: [8, 0], weight: 0.3 },
      ],
    },
  },

  {
    id: "carrots", name: "Carrots", emoji: "🥕", type: "vegetable",
    peak: [8, 9, 10, 11, 0, 1, 2], shoulder: [3, 7],
    desc: "Sweet root staple",
    tips: "Firm with bright color. If greens are attached and look fresh, the carrots are very fresh. Remove greens for storage.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.5 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [7, 8, 9, 10, 11], shoulder: [6, 0], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2, 3], shoulder: [4, 10], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [6, 7, 8, 9, 10, 11], shoulder: [0, 5], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [0, 1, 2, 3, 4], shoulder: [5, 11], weight: 0.3 },
        { region: "Israel", flag: "🇮🇱", lat: 32.1, lon: 34.8, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.2 },
      ],
    },
  },

  {
    id: "beets", name: "Beets", emoji: "🥬", type: "vegetable",
    peak: [5, 6, 7, 8, 9, 10], shoulder: [4, 11],
    desc: "Earthy ruby roots",
    tips: "Firm with smooth skin. Small to medium beets are more tender. Fresh greens attached are a bonus — cook those too.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.4 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 10, 11], shoulder: [6, 9], weight: 0.4 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [11, 0, 1, 2], shoulder: [10, 3], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [6, 7, 8, 9, 10], shoulder: [5, 11], weight: 0.5 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [6, 7, 8, 9, 10, 11], shoulder: [5, 0], weight: 0.4 },
      ],
    },
  },

  {
    id: "turnips", name: "Turnips", emoji: "🥬", type: "vegetable",
    peak: [9, 10, 11], shoulder: [0, 1, 2],
    desc: "Earthy winter root",
    tips: "Small turnips are sweeter and more tender. Should feel heavy and firm with no soft spots.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [9, 10, 11], shoulder: [0, 1, 8], weight: 0.4 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [10, 11, 0, 1, 2, 3, 4], shoulder: [5, 9], weight: 0.7 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [9, 10, 11, 0], shoulder: [1, 2, 8], weight: 0.6 },
        { region: "France", flag: "🇫🇷", lat: 48.9, lon: 2.3, peak: [9, 10, 11], shoulder: [0, 1, 8], weight: 0.3 },
      ],
    },
  },

  {
    id: "parsnips", name: "Parsnips", emoji: "🥕", type: "vegetable",
    peak: [10, 11, 0, 1, 2], shoulder: [3, 9],
    desc: "Sweet winter root",
    tips: "Small to medium are best — large ones can have woody cores. Frost makes them sweeter.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -72.0, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.4 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [10, 11, 0, 1, 2, 3], shoulder: [4, 9], weight: 0.7 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 1.0, peak: [9, 10, 11, 0, 1, 2], shoulder: [3, 8], weight: 0.6 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [10, 11, 0, 1, 2], shoulder: [3, 9], weight: 0.3 },
      ],
    },
  },

  {
    id: "celery", name: "Celery", emoji: "🥬", type: "vegetable",
    peak: [8, 9, 10, 11], shoulder: [0, 1, 7],
    desc: "Crisp and clean",
    tips: "Tight, compact bunches that snap cleanly. Darker outer stalks have more flavor; inner stalks are more tender.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.6 },
        { region: "Michigan", flag: "🇺🇸", lat: 43.0, lon: -86.2, peak: [7, 8, 9, 10], shoulder: [6, 11], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.9 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 1.0, peak: [7, 8, 9, 10, 11], shoulder: [0, 6], weight: 0.5 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [0, 1, 2, 3, 4], shoulder: [5, 11], weight: 0.4 },
      ],
    },
  },

  {
    id: "cabbage", name: "Cabbage", emoji: "🥬", type: "vegetable",
    peak: [9, 10, 11, 0, 1, 2], shoulder: [3, 8],
    desc: "Winter workhorse",
    tips: "Heavy and firm with tight leaves. A whole head keeps for weeks in the fridge.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -75.0, peak: [6, 7, 8, 9, 10, 11], shoulder: [0, 5], weight: 0.4 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4], shoulder: [5, 11], weight: 0.3 },
        { region: "Florida", flag: "🇺🇸", lat: 26.5, lon: -80.7, peak: [11, 0, 1, 2, 3], shoulder: [4, 10], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.8 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [7, 8, 9, 10, 11, 0, 1], shoulder: [2, 6], weight: 0.6 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [8, 9, 10, 11, 0], shoulder: [1, 7], weight: 0.3 },
      ],
    },
  },

  {
    id: "onions", name: "Onions", emoji: "🧅", type: "vegetable",
    peak: [3, 4, 5, 6, 7, 8], shoulder: [2, 9],
    desc: "Flavor foundation",
    tips: "Dry papery skin with no soft spots or sprouting. Sweet onions are best for eating raw.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -75.0, peak: [7, 8, 9, 10], shoulder: [6, 11], weight: 0.3 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [3, 4, 5, 6, 7], shoulder: [2, 8], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.2 },
        { region: "Peru", flag: "🇵🇪", lat: -13.5, lon: -76.0, peak: [0, 1, 2, 3, 4], shoulder: [5, 11], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [3, 4, 5, 6, 7, 8], shoulder: [2, 9], weight: 0.5 },
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.2, lon: -119.2, peak: [6, 7, 8, 9], shoulder: [5, 10], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 24.8, lon: -107.4, peak: [0, 1, 2, 3], shoulder: [11, 4], weight: 0.2 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [7, 8, 9, 10], shoulder: [6, 11], weight: 0.4 },
        { region: "Spain", flag: "🇪🇸", lat: 37.4, lon: -3.7, peak: [3, 4, 5, 6], shoulder: [2, 7], weight: 0.3 },
        { region: "Netherlands", flag: "🇳🇱", lat: 52.0, lon: 4.3, peak: [7, 8, 9, 10, 11], shoulder: [0, 6], weight: 0.3 },
      ],
    },
  },

  {
    id: "garlic", name: "Garlic", emoji: "🧄", type: "vegetable",
    peak: [6, 7, 8], shoulder: [5, 9],
    desc: "Aromatic essential",
    tips: "Firm and plump with tight skin. Avoid any with green sprouts — they'll taste bitter.",
    sourcing: {
      US_NORTHEAST: [
        { region: "California", flag: "🇺🇸", lat: 36.8, lon: -121.2, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.4 },
        { region: "China", flag: "🇨🇳", lat: 36.6, lon: 118.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.3 },
        { region: "Mexico", flag: "🇲🇽", lat: 22.0, lon: -102.5, peak: [0, 1, 2, 3], shoulder: [4, 11], weight: 0.2 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.8, lon: -121.2, peak: [5, 6, 7, 8, 9], shoulder: [4, 10], weight: 0.6 },
        { region: "Mexico", flag: "🇲🇽", lat: 22.0, lon: -102.5, peak: [0, 1, 2, 3], shoulder: [4, 11], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Spain", flag: "🇪🇸", lat: 38.0, lon: -2.5, peak: [5, 6, 7, 8], shoulder: [4, 9], weight: 0.4 },
        { region: "France", flag: "🇫🇷", lat: 43.6, lon: 1.4, peak: [6, 7, 8], shoulder: [5, 9], weight: 0.3 },
        { region: "China", flag: "🇨🇳", lat: 36.6, lon: 118.0, peak: [5, 6, 7], shoulder: [4, 8], weight: 0.3 },
      ],
    },
  },

  {
    id: "mushrooms", name: "Mushrooms", emoji: "🍄", type: "vegetable",
    peak: [8, 9, 10, 11], shoulder: [0, 1, 7],
    desc: "Earthy umami",
    tips: "Firm and dry with no sliminess. Closed caps mean milder flavor; open caps are more intense.",
    sourcing: {
      US_NORTHEAST: [
        // Most commercial mushrooms are indoor-grown year-round
        { region: "Pennsylvania", flag: "🇺🇸", lat: 39.9, lon: -75.7, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.6 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
      ],
      US_WEST: [
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.6 },
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.8, lon: -123.0, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.3 },
      ],
      NORTHERN_EUROPE: [
        { region: "Netherlands", flag: "🇳🇱", lat: 51.4, lon: 5.5, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.5 },
        { region: "Poland", flag: "🇵🇱", lat: 51.9, lon: 19.1, peak: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], shoulder: [], weight: 0.4 },
      ],
    },
  },

  {
    id: "potatoes", name: "Potatoes", emoji: "🥔", type: "vegetable",
    peak: [8, 9, 10], shoulder: [7, 11, 0],
    desc: "Versatile classic",
    tips: "Firm with no green spots or sprouting (green = solanine, which is toxic). Store in cool dark place, never with onions.",
    sourcing: {
      US_NORTHEAST: [
        { region: "Idaho", flag: "🇺🇸", lat: 43.6, lon: -114.7, peak: [8, 9, 10], shoulder: [7, 11, 0, 1, 2, 3], weight: 0.4 },
        { region: "Northeast US", flag: "🇺🇸", lat: 42.0, lon: -75.0, peak: [8, 9, 10], shoulder: [7, 11], weight: 0.3 },
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.6, lon: -120.5, peak: [8, 9, 10], shoulder: [7, 11, 0], weight: 0.3 },
      ],
      US_WEST: [
        { region: "Idaho", flag: "🇺🇸", lat: 43.6, lon: -114.7, peak: [8, 9, 10], shoulder: [7, 11, 0, 1, 2, 3], weight: 0.5 },
        { region: "Pacific Northwest", flag: "🇺🇸", lat: 46.6, lon: -120.5, peak: [8, 9, 10], shoulder: [7, 11, 0], weight: 0.3 },
        { region: "California", flag: "🇺🇸", lat: 36.6, lon: -121.6, peak: [3, 4, 5, 6, 7], shoulder: [2, 8], weight: 0.2 },
      ],
      NORTHERN_EUROPE: [
        { region: "Western Europe", flag: "🇪🇺", lat: 52.0, lon: 5.0, peak: [7, 8, 9, 10], shoulder: [6, 11, 0], weight: 0.5 },
        { region: "France", flag: "🇫🇷", lat: 48.9, lon: 2.3, peak: [7, 8, 9, 10], shoulder: [6, 11], weight: 0.3 },
        { region: "Egypt", flag: "🇪🇬", lat: 30.0, lon: 31.2, peak: [0, 1, 2, 3, 4], shoulder: [5, 11], weight: 0.2 },
      ],
    },
  },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
