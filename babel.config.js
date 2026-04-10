module.exports = function (api) {
  api.cache(true);
  return {
    // babel-preset-expo handles JSX, TypeScript, and all Expo-specific transforms.
    // react-native-reanimated/plugin was removed — Reanimated is not used in this project
    // and the plugin causes issues with web bundling.
    presets: ["babel-preset-expo"],
  };
};
