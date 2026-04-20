import "@expo/metro-runtime";

if (__DEV__) {
  try {
    const keepAwake = require("expo-keep-awake");

    // Expo's dev wrapper enables keep-awake before Android always has a current
    // activity, which can throw an unhandled rejection during startup.
    keepAwake.useKeepAwake = () => {};
  } catch {
    // Ignore missing optional dev dependency.
  }
}

const { App } = require("expo-router/build/qualified-entry");
const { renderRootComponent } = require("expo-router/build/renderRootComponent");

renderRootComponent(App);
