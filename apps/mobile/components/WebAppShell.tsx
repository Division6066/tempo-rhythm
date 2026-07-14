import { ExternalLink, RefreshCw } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { WEB_APP_URL } from '@/config/appConfig';

export function WebAppShell() {
  const [reloadKey, setReloadKey] = useState(0);
  const [hasLoadError, setHasLoadError] = useState(false);

  const retry = useCallback(() => {
    setHasLoadError(false);
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  const openInBrowser = useCallback(async () => {
    const canOpen = await Linking.canOpenURL(WEB_APP_URL);
    if (canOpen) {
      await Linking.openURL(WEB_APP_URL);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top', 'bottom']}>
      <View className="flex-1 bg-[#0a0a0a]">
        {hasLoadError ? (
          <ConnectionRecovery onOpenInBrowser={openInBrowser} onRetry={retry} />
        ) : (
          <WebView
            key={reloadKey}
            allowsBackForwardNavigationGestures={true}
            applicationNameForUserAgent="TempoRhythmExpoShell"
            className="flex-1 bg-[#0a0a0a]"
            domStorageEnabled={true}
            onError={() => setHasLoadError(true)}
            onHttpError={() => setHasLoadError(true)}
            onLoad={() => setHasLoadError(false)}
            renderLoading={() => <ShellLoading />}
            source={{ uri: WEB_APP_URL }}
            startInLoadingState={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function ShellLoading() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-[#0a0a0a] px-8">
      <ActivityIndicator color="#ededed" size="large" />
      <View className="gap-2">
        <Text className="text-center text-[#ededed] text-lg font-semibold">
          Opening Tempo Rhythm
        </Text>
        <Text className="text-center text-[#a1a1aa] text-sm leading-6">
          Your planner is loading inside the Expo shell. This usually takes a
          moment on the first launch.
        </Text>
      </View>
    </View>
  );
}

type ConnectionRecoveryProps = {
  onOpenInBrowser: () => void;
  onRetry: () => void;
};

function ConnectionRecovery({
  onOpenInBrowser,
  onRetry,
}: ConnectionRecoveryProps) {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-[#0a0a0a] px-8">
      <View className="gap-3">
        <Text className="text-center text-[#ededed] text-2xl font-semibold">
          We couldn't reach the web app
        </Text>
        <Text className="text-center text-[#a1a1aa] text-base leading-7">
          Check your connection, then try again. If you are testing locally,
          set EXPO_PUBLIC_WEB_APP_URL to your tunnel or simulator-friendly URL.
        </Text>
      </View>

      <View className="w-full gap-3">
        <Pressable
          accessibilityHint="Reloads the hosted web app inside the Expo shell."
          accessibilityLabel="Try loading Tempo Rhythm again"
          accessibilityRole="button"
          accessible={true}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-[#ededed] px-5 py-3"
          onPress={onRetry}
        >
          <RefreshCw color="#0a0a0a" size={18} />
          <Text className="text-center text-[#0a0a0a] font-semibold">
            Try again
          </Text>
        </Pressable>

        <Pressable
          accessibilityHint="Opens the hosted web app in your device browser."
          accessibilityLabel="Open Tempo Rhythm in the browser"
          accessibilityRole="link"
          accessible={true}
          className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-[#3f3f46] px-5 py-3"
          onPress={onOpenInBrowser}
        >
          <ExternalLink color="#ededed" size={18} />
          <Text className="text-center text-[#ededed] font-semibold">
            Open in browser
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
