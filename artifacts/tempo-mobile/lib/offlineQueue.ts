import AsyncStorage from "@react-native-async-storage/async-storage";

const QUEUE_KEY = "@tempo_offline_queue";

export type QueuedMutation = {
  id: string;
  type: "createTask" | "updateTask";
  args: Record<string, any>;
  timestamp: number;
};

let queueLock: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  let release: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  const result = queueLock.then(fn).finally(() => release());
  queueLock = next;
  return result;
}

export async function getQueue(): Promise<QueuedMutation[]> {
  return withLock(async () => {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });
}

export async function addToQueue(mutation: Omit<QueuedMutation, "id" | "timestamp">): Promise<void> {
  return withLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue: QueuedMutation[] = raw ? JSON.parse(raw) : [];
      queue.push({
        ...mutation,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {}
  });
}

export async function removeFromQueue(id: string): Promise<void> {
  return withLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue: QueuedMutation[] = raw ? JSON.parse(raw) : [];
      const filtered = queue.filter((item) => item.id !== id);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
    } catch {}
  });
}

export async function clearQueue(): Promise<void> {
  return withLock(async () => {
    try {
      await AsyncStorage.removeItem(QUEUE_KEY);
    } catch {}
  });
}

export async function getQueueLength(): Promise<number> {
  return withLock(async () => {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      const queue: QueuedMutation[] = raw ? JSON.parse(raw) : [];
      return queue.length;
    } catch {
      return 0;
    }
  });
}
