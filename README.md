# 🍎 Fruit Forecast

A seasonal produce guide that uses your location to show which fruits and vegetables are currently in season at the supermarket. Items are ranked by how in-season they are, with peak produce at the top.

## Features

- **Location-aware** — Detects your climate zone via GPS and adjusts season data for your hemisphere and latitude
- **50+ fruits & vegetables** — Comprehensive database with peak/shoulder season data
- **Season ranking** — Every item scored and ranked by freshness for the selected month
- **Month selector** — Browse any month to plan ahead
- **Type filter** — Switch between All, Fruits, or Vegetables
- **Expandable cards** — Tap any item to see a full 12-month season calendar and shopping tips
- **Weather context** — Shows current temperature and humidity
- **Smooth native animations** — LayoutAnimation-powered expand/collapse

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Expo CLI**: `npm install -g @expo/eas-cli`
- **Apple Developer Account** ($99/year) — required for App Store submission
- **Xcode** 15+ on a Mac (for iOS simulator testing)

### Installation

```bash
cd FruitForecast
npm install
```

### Run in development

```bash
# Start the Expo dev server
npx expo start

# Press 'i' to open iOS simulator
# Or scan the QR code with Expo Go on your phone
```

---

## Preparing for App Store Submission

### Step 1 — Configure your identifiers

Edit `app.json` and replace these placeholders:

| Field | Replace with |
|---|---|
| `ios.bundleIdentifier` | Your reverse-domain ID, e.g. `com.janedoe.fruitforecast` |
| `extra.eas.projectId` | Your EAS project ID (created in step 2) |

Edit `eas.json` and replace:

| Field | Replace with |
|---|---|
| `submit.production.ios.appleId` | Your Apple ID email |
| `submit.production.ios.ascAppId` | Your App Store Connect app ID |
| `submit.production.ios.appleTeamId` | Your Apple team ID |

### Step 2 — Create the EAS project

```bash
# Log in to your Expo account
eas login

# Link the project
eas init
```

### Step 3 — Create app icons and splash screen

You need to provide these image assets in `assets/images/`:

| File | Size | Description |
|---|---|---|
| `icon.png` | 1024×1024 px | App icon (no transparency, no rounded corners) |
| `splash.png` | 1284×2778 px | Splash/launch screen image |
| `adaptive-icon.png` | 1024×1024 px | Android adaptive icon foreground |

> **Tip**: Use a tool like [Icon Kitchen](https://icon.kitchen) or Figma to create these.

### Step 4 — Build for iOS

```bash
# Create a production build
eas build --platform ios --profile production
```

EAS Build will handle provisioning profiles and signing certificates automatically. The first time, it will prompt you to log in to your Apple Developer account.

### Step 5 — Submit to App Store

```bash
eas submit --platform ios --profile production
```

This uploads your build to App Store Connect. Then:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app
3. Fill in the metadata:
   - **App Name**: Fruit Forecast
   - **Subtitle**: Seasonal Produce Guide
   - **Category**: Food & Drink
   - **Description**: (see below)
   - **Keywords**: seasonal, produce, fruits, vegetables, in season, grocery, fresh, farming, local
   - **Screenshots**: Take screenshots from the simulator (⌘+S in Simulator)
4. Submit for review

### Suggested App Store Description

> Know what's fresh before you shop. Fruit Forecast shows you which fruits and vegetables are in peak season right now, ranked by freshness and tailored to your location.
>
> Browse 50+ items with season calendars, shopping tips, and peak indicators. Plan ahead by selecting any month. Whether you're meal planning, eating seasonally, or just want the tastiest produce — Fruit Forecast has you covered.
>
> Features:
> • Location-aware season data adjusted for your climate zone
> • Ranked produce list showing what's freshest right now
> • Detailed season calendars for every item
> • Expert shopping tips to pick the best produce
> • Filter by fruits or vegetables
> • Browse any month to plan ahead

### Step 6 — Privacy and compliance

In App Store Connect, you'll need to answer:

- **Privacy Policy URL** — Required. You can use a simple hosted page stating you only collect location data locally on-device and do not transmit it to any server.
- **Data collection** — Select "Location" → "Functionality" → "Not linked to identity"
- **Encryption** — The app does NOT use non-exempt encryption (already set in `app.json`)

---

## Project Structure

```
FruitForecast/
├── app.json                    # Expo config (app name, icons, permissions)
├── eas.json                    # EAS Build + Submit config
├── babel.config.js             # Babel config with Reanimated plugin
├── package.json                # Dependencies
├── assets/
│   └── images/                 # App icon, splash screen (you provide these)
├── src/
│   ├── App.js                  # Root component
│   ├── screens/
│   │   └── HomeScreen.js       # Main screen with FlatList
│   ├── components/
│   │   ├── MonthSelector.js    # Horizontal month picker
│   │   ├── InfoBar.js          # Location/weather/season pills
│   │   ├── FilterBar.js        # Stats + type filter buttons
│   │   └── ProduceCard.js      # Expandable produce item card
│   ├── data/
│   │   └── produce.js          # Produce database (50+ items)
│   └── utils/
│       ├── season.js           # Scoring, climate shift, helpers
│       └── theme.js            # Colors, fonts, design tokens
```

---

## Extending the App

**Add a real weather API**: Replace the simulated weather in `HomeScreen.js` with a fetch to OpenWeatherMap or WeatherAPI. You'll need a free API key.

**Add navigation**: Install `@react-navigation/native` (already in dependencies) and add a Detail screen for each produce item with recipes, nutrition info, etc.

**Add push notifications**: Use `expo-notifications` to alert users when their favorite produce enters peak season.

**Localize for other regions**: The climate shift system already supports Southern Hemisphere and tropical regions. You could expand the produce database with region-specific items.

---

## License

MIT — Use freely for personal and commercial projects.
