import React, { createContext, useContext, useEffect, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";
import { useNetworkStatus, NetworkStatus } from "./useNetworkStatus";
import { getQueue, removeFromQueue, clearQueue, getQueueLength, QueuedMutation } from "./offlineQueue";

type NetworkContextValue = NetworkStatus & {
  pendingCount: number;
};

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isInternetReachable: true,
  wasOffline: false,
  isSyncing: false,
  pendingCount: 0,
});

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const status = useNetworkStatus();
  const pendingCountRef = useRef(0);
  const [pendingCount, setPendingCount] = React.useState(0);
  const prevConnected = useRef(status.isConnected);
  const syncingRef = useRef(false);

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);

  useEffect(() => {
    getQueueLength().then((count) => {
      pendingCountRef.current = count;
      setPendingCount(count);
    });
  }, [status.isConnected]);

  const replayQueue = useCallback(async () => {
    if (syncingRef.current) return;
    const queue = await getQueue();
    if (queue.length === 0) return;

    syncingRef.current = true;
    status.setSyncing(true);
    pendingCountRef.current = queue.length;
    setPendingCount(queue.length);

    for (const mutation of queue) {
      try {
        let success = false;
        switch (mutation.type) {
          case "createTask":
            await createTask(mutation.args as any);
            success = true;
            break;
          case "updateTask":
            await updateTask(mutation.args as any);
            success = true;
            break;
          default:
            success = false;
            break;
        }
        if (success) {
          await removeFromQueue(mutation.id);
          pendingCountRef.current--;
          setPendingCount(pendingCountRef.current);
        }
      } catch {
        // leave failed mutations in queue for next sync
      }
    }

    const remaining = await getQueueLength();
    if (remaining === 0) {
      await clearQueue();
    }
    pendingCountRef.current = remaining;
    setPendingCount(remaining);
    syncingRef.current = false;
    status.setSyncing(false);
  }, [status.setSyncing, createTask, updateTask]);

  useEffect(() => {
    if (status.isConnected && !prevConnected.current) {
      replayQueue();
    }
    prevConnected.current = status.isConnected;
  }, [status.isConnected, replayQueue]);

  return (
    <NetworkContext.Provider
      value={{
        isConnected: status.isConnected,
        isInternetReachable: status.isInternetReachable,
        wasOffline: status.wasOffline,
        isSyncing: status.isSyncing,
        pendingCount,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}
