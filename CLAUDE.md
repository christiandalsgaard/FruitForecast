# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Fruit Forecast is a React Native / Expo app (SDK 55) that shows which fruits and vegetables are in season based on the user's location. It runs on iOS, Android, and web. There is no backend — all logic runs on-device with free external APIs for weather and geocoding.

## Commands

```bash
npm install              # Install dependencies
npx expo start           # Start dev server (press 'i' for iOS sim, 'w' for web)
eas build --platform ios --profile production   # Production iOS build
eas submit --platform ios --profile production  # Submit to App Store
```

No test suite exists yet.

## Architecture

**Single-screen app.** `HomeScreen.js` is the entire UI — it orchestrates location detection, weather fetching, season scoring, and renders the produce list. There is no navigation (React Navigation is installed but unused).

**Season scoring pipeline:**
1. `getDeviceLocation()` in HomeScreen gets GPS coords (browser geolocation on web, expo-location on native)
2. `getClimateShift(latitude)` in `utils/season.js` returns a month offset based on hemisphere/latitude (e.g., +6 for Southern Hemisphere)
3. `getSeasonScore(item, month, climateShift)` scores each produce item 10–100 based on distance from peak months
4. The FlatList sorts by score descending — peak items float to top

**Caching layer** (`utils/cache.js`): All network calls go through `getCached(key, fetcher, ttl)` which wraps AsyncStorage with TTL-based expiry. This provides offline support after first fetch.

**API keys are optional.** The app works with zero configuration using free APIs (Open-Meteo for weather, Nominatim for geocoding). Optional keys in `src/config/api.js` unlock Mapbox geocoding, Spoonacular recipes, and PostHog analytics.

**Platform branching:** Web uses a plain `<View>` with page-level scrolling (FlatList is unreliable on web). Native uses virtualized FlatList. The split happens in HomeScreen's render. `App.js` also patches web-specific DOM styles on load.

**Design system** (`utils/theme.js`): Traffic-light color scheme — green for peak, yellow for coming soon, red for out of season. Warm peach/cream backgrounds. Platform-specific font stacks (Avenir Next on iOS, Nunito on web).

## Key Data Flow

- `src/data/produce.js` — Static database of 50+ items, each with `peak` and `shoulder` month arrays
- `utils/weather.js` — Fetches Open-Meteo weather + reverse geocodes via Mapbox (if key set) or Nominatim
- `utils/favorites.js` — Persists favorite produce IDs via the cache layer (AsyncStorage)
- `utils/notifications.js` — Schedules push alerts when favorited produce enters peak season
- `utils/analytics.js` — Event tracking, sends to PostHog if key configured, console logs in dev
- `utils/markets.js` / `utils/recipes.js` — Market finder and recipe suggestions (require coords / API key)

## Conventions

- All source code is in `src/` with vanilla JavaScript (no TypeScript, no Flow)
- Components use React Native `StyleSheet.create` — no CSS-in-JS libraries
- Animations use `LayoutAnimation` from React Native, not Reanimated (despite it being installed)
- Cache keys use the pattern `"type:param"` (e.g., `"weather:40.71,-74.01"`)
- The `hasKey()` helper in `config/api.js` gates all optional API features
