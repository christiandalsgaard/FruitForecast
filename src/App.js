import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { registerRootComponent } from "expo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./screens/HomeScreen";

// On web, Expo's HTML template sets body { overflow: hidden; height: 100% }
// which prevents page-level scrolling. We need the page to scroll naturally
// so we reset those constraints here, before any React rendering occurs.
// Also load the Nunito and JetBrains Mono fonts for the fruity theme.
if (Platform.OS === "web") {
  document.documentElement.style.height = "auto";
  document.body.style.height = "auto";
  document.body.style.overflow = "auto";

  // Inject Google Fonts link for the rounded, playful fonts used in theme.js
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap";
  document.head.appendChild(fontLink);
}

function App() {
  return (
    // minHeight: "100vh" ensures the root fills the viewport on web even before
    // content loads, preventing a collapsed flex chain that causes blank screens.
    <View style={styles.root}>
      <SafeAreaProvider>
        <HomeScreen />
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: "100vh",
  },
});

// registerRootComponent mounts the React tree into the DOM on web and registers
// the component with AppRegistry on native. Without this call, the web bundle
// defines the component but never attaches it to the #root element — resulting
// in a blank white page.
registerRootComponent(App);
