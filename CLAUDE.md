# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Fruit Forecast is a React Native / Expo app (SDK 55) that shows which fruits and vegetables are in season based on the user's location. It runs on iOS, Android, and web. There is no backend — all logic runs on-device with free external APIs for weather and geocoding. Deployed to Vercel at `https://dist-ruby-three-40.vercel.app/`.

## Commands

```bash
npm install              # Install dependencies
npx expo start           # Start dev server (press 'i' for iOS sim, 'w' for web)
npx expo export --platform web   # Build for web (outputs to dist/)
eas build --platform ios --profile production   # Production iOS build
eas submit --platform ios --profile production  # Submit to App Store
```

No test suite exists yet.

## Architecture

**Two-tab app.** Bottom tab navigation (React Navigation) with Home and Profile tabs. Shared state (location, scoring, weather) is lifted to `App.js` and passed as props to both screens.

**Home tab** (`screens/HomeScreen.js`): Presentational component showing the produce list sorted by score. Receives all data as props from App.js.

**Profile tab** (`screens/ProfileScreen.js`): Five collapsible sections — My Favorites (with live scores), Season Journal (purchase log timeline), My Region (location/market zone settings), Notifications (toggle alerts), About (data sources, clear cache).

**Season scoring pipeline (source-aware, weather-adjusted):**
1. `App.js` detects location → determines market zone via `data/marketZones.js`
2. `utils/scoring.js` computes per-item scores using source region data (cosine curve, 1-100 continuous)
3. `utils/weatherAdjust.js` fetches Open-Meteo archive + climate normals for source regions
4. Scores = weighted blend of source region seasonality + weather anomaly adjustment
5. Progressive rendering: base scores show immediately, weather refines async

**Caching layer** (`utils/cache.js`): Platform-aware — uses `localStorage` on web, `AsyncStorage` on native. All network calls go through `getCached(key, fetcher, ttl)` with TTL-based expiry.

**Persistence layers:**
- `utils/favorites.js` — favorite produce IDs (Set, persisted via cache)
- `utils/journal.js` — shopping log entries (array of {id, produceId, date, note, score})
- `utils/preferences.js` — user prefs (saved region, notification toggle, distance unit)

**API keys are optional.** The app works with zero configuration using free APIs (Open-Meteo for weather, Nominatim for geocoding, Overpass for markets). Optional keys in `src/config/api.js` unlock Mapbox geocoding, Spoonacular recipes, and PostHog analytics.

**Platform branching:** Web uses plain `<View>` with page-level scrolling (FlatList unreliable on web). Native uses virtualized FlatList. `App.js` patches web-specific DOM styles on load. Tab bar height adjusts per platform.

**Design system** (`utils/theme.js`): Traffic-light color scheme — green for peak, yellow for coming soon, red for out of season. Warm peach/cream backgrounds. Platform-specific font stacks (Avenir Next on iOS, Nunito on web).

## Key Data Flow

- `src/data/produce.js` — 50+ items with `peak`, `shoulder`, and `sourcing` data per market zone
- `src/data/marketZones.js` — 9 market zones with bounding boxes + nearest-centroid fallback
- `utils/scoring.js` — cosine-curve scoring engine with multi-source blending
- `utils/weatherAdjust.js` — Open-Meteo archive + climate normals → anomaly → score adjustment
- `utils/weather.js` — user-location weather + reverse geocoding
- `utils/cache.js` — platform-aware storage (localStorage web, AsyncStorage native)
- `utils/journal.js` — CRUD for shopping log entries
- `utils/preferences.js` — user preference persistence
- `utils/favorites.js` — favorite produce ID persistence
- `utils/notifications.js` — local push alerts (native only, no-op on web)
- `utils/analytics.js` — PostHog event tracking (optional)
- `utils/markets.js` — OpenStreetMap Overpass API for nearby farmer's markets
- `utils/recipes.js` — Spoonacular recipe suggestions (optional API key)

## Conventions

- All source code is in `src/` with vanilla JavaScript (no TypeScript, no Flow)
- Components use React Native `StyleSheet.create` — no CSS-in-JS libraries
- Animations use `LayoutAnimation` from React Native, not Reanimated (despite it being installed)
- Cache keys use the pattern `"type:param"` (e.g., `"weather:40.71,-74.01"`)
- The `hasKey()` helper in `config/api.js` gates all optional API features
- RegionPicker modal is rendered at the App.js level (not per-screen) so it works from both tabs
- Empty states are handled in every section — no blank/broken UI when data is missing
