/**
 * @screen: capture
 * @platform: mobile
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @mutations: tasks.captureQuick (Convex Long Run 2)
 * @auth: required
 * @env: NEXT_PUBLIC_CONVEX_URL
 */
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const router = useRouter();
  const [text, setText] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-4 p-4">
        <Text className="text-xl font-semibold text-foreground">Capture</Text>
        <TextInput
          accessibilityLabel="Capture text"
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Type a thought…"
          className="min-h-32 rounded-lg border border-border bg-card p-3 text-base text-foreground"
        />
        {/*
          @action saveCapture
          @mutation: tasks.createFromCapture
          @auth: required
          @env: NEXT_PUBLIC_CONVEX_URL
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Save capture"
          hitSlop={8}
          onPress={() => router.back()}
          className="rounded-lg bg-primary px-4 py-3"
        >
          <Text className="text-center text-sm font-medium text-primary-foreground">Save</Text>
        </Pressable>
        {/*
          @action dismissCapture
          @navigate: back
        */}
        <Pressable
          accessible
          accessibilityRole="button"
          accessibilityLabel="Cancel capture"
          hitSlop={8}
          onPress={() => router.back()}
        >
          <Text className="text-center text-sm text-muted-foreground">Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
