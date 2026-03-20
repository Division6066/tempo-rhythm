import { useState, useEffect, useCallback, useRef } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  wasOffline: boolean;
  isSyncing: boolean;
};

type NetworkStatusHook = NetworkStatus & {
  setSyncing: (syncing: boolean) => void;
};

export function useNetworkStatus(): NetworkStatusHook {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const wasOfflineRef = useRef(false);
  const wasOfflineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable;

      if (!connected) {
        wasOfflineRef.current = true;
      }

      if (connected && wasOfflineRef.current) {
        setWasOffline(true);
        if (wasOfflineTimerRef.current) clearTimeout(wasOfflineTimerRef.current);
        wasOfflineTimerRef.current = setTimeout(() => {
          setWasOffline(false);
          wasOfflineRef.current = false;
        }, 3000);
      }

      setIsConnected(connected);
      setIsInternetReachable(reachable);
    });

    return () => {
      unsubscribe();
      if (wasOfflineTimerRef.current) clearTimeout(wasOfflineTimerRef.current);
    };
  }, []);

  const setSyncing = useCallback((syncing: boolean) => {
    setIsSyncing(syncing);
  }, []);

  return { isConnected, isInternetReachable, wasOffline, isSyncing, setSyncing };
}
