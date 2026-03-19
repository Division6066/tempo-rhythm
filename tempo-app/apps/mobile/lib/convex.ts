import { ConvexReactClient } from "convex/react";
import { Platform } from "react-native";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.warn(
    "EXPO_PUBLIC_CONVEX_URL is not set. Set it in .env.local to your Convex deployment URL (e.g. https://precious-wildcat-890.eu-west-1.convex.cloud)"
  );
}

export const convex = new ConvexReactClient(
  CONVEX_URL || "https://precious-wildcat-890.eu-west-1.convex.cloud"
);

const webStorage = {
  getItem: async (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key: string, value: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

let nativeStorage = webStorage;

if (Platform.OS !== "web") {
  try {
    const SecureStore = require("expo-secure-store");
    nativeStorage = {
      getItem: async (key: string) => {
        return await SecureStore.getItemAsync(key);
      },
      setItem: async (key: string, value: string) => {
        await SecureStore.setItemAsync(key, value);
      },
      removeItem: async (key: string) => {
        await SecureStore.deleteItemAsync(key);
      },
    };
  } catch {
    nativeStorage = webStorage;
  }
}

export const secureStorage = Platform.OS === "web" ? webStorage : nativeStorage;
