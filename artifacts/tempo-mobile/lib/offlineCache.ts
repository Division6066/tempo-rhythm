import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEYS = {
  TODAY_TASKS: "@tempo_cache_today_tasks",
  INBOX_TASKS: "@tempo_cache_inbox_tasks",
  ALL_TASKS: "@tempo_cache_all_tasks",
  PROJECTS: "@tempo_cache_projects",
  DAILY_PLANS: "@tempo_cache_daily_plans",
  STAGED_SUGGESTIONS: "@tempo_cache_staged_suggestions",
} as const;

export async function cacheTodayTasks(tasks: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.TODAY_TASKS, JSON.stringify(tasks));
  } catch {}
}

export async function getCachedTodayTasks(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.TODAY_TASKS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheInboxTasks(tasks: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.INBOX_TASKS, JSON.stringify(tasks));
  } catch {}
}

export async function getCachedInboxTasks(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.INBOX_TASKS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheAllTasks(tasks: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.ALL_TASKS, JSON.stringify(tasks));
  } catch {}
}

export async function getCachedAllTasks(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.ALL_TASKS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheProjects(projects: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch {}
}

export async function getCachedProjects(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheDailyPlans(plans: any[]) {
  try {
    await AsyncStorage.setItem(CACHE_KEYS.DAILY_PLANS, JSON.stringify(plans));
  } catch {}
}

export async function getCachedDailyPlans(): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(CACHE_KEYS.DAILY_PLANS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheStagedSuggestions(key: string, suggestions: any[]) {
  try {
    await AsyncStorage.setItem(`${CACHE_KEYS.STAGED_SUGGESTIONS}_${key}`, JSON.stringify(suggestions));
  } catch {}
}

export async function getCachedStagedSuggestions(key: string): Promise<any[] | null> {
  try {
    const data = await AsyncStorage.getItem(`${CACHE_KEYS.STAGED_SUGGESTIONS}_${key}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function clearAllCaches() {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch {}
}
