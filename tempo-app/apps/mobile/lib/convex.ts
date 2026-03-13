import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || "";

export const convex = new ConvexReactClient(CONVEX_URL);

export const secureStorage = {
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
