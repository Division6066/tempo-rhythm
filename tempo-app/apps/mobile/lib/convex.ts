import { ConvexReactClient } from "convex/react";
import { Platform } from "react-native";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  throw new Error(
    "EXPO_PUBLIC_CONVEX_URL is not set. Please set it in .env.local to your Convex deployment URL."
  );
}

export const convex = new ConvexReactClient(CONVEX_URL);

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
