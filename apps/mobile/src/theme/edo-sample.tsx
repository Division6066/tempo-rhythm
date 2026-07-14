import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  type EdoDirection,
  type EdoLanguage,
  createEdoSampleModel,
  edoSampleCopy,
  edoTheme,
} from "./edo-sample-model";

export { edoTheme };

export function KanjiRomajiPair() {
  return (
    <View
      accessibilityLabel={`${edoSampleCopy.kanji}, ${edoSampleCopy.romaji}`}
      testID="kanji-romaji-pair"
      style={{
        gap: edoTheme.spacing.xs,
      }}
    >
      <Text
        style={{
          color: edoTheme.colors.sumi,
          fontFamily: edoTheme.type.kanji,
          fontSize: edoTheme.spacing.xxl,
          lineHeight: edoTheme.spacing.xxl + edoTheme.spacing.sm,
        }}
      >
        {edoSampleCopy.kanji}
      </Text>
      <Text
        style={{
          color: edoTheme.colors.sumiMuted,
          fontFamily: edoTheme.type.annotation,
          fontSize: edoTheme.spacing.md - edoTheme.spacing.xs,
          letterSpacing: edoTheme.spacing.xs / 2,
          textTransform: "uppercase",
        }}
      >
        {edoSampleCopy.romaji}
      </Text>
    </View>
  );
}

export function EnsoRing({
  direction = "ltr",
}: {
  direction?: EdoDirection;
}) {
  const accentBorder =
    direction === "rtl"
      ? { borderLeftColor: edoTheme.colors.vermilion }
      : { borderRightColor: edoTheme.colors.vermilion };

  return (
    <View
      accessibilityLabel="Enso ring"
      testID="enso-ring"
      style={{
        borderColor: edoTheme.colors.indigo,
        borderRadius: edoTheme.radii.full,
        borderWidth: edoTheme.spacing.xs,
        height: edoTheme.spacing.xxl,
        width: edoTheme.spacing.xxl,
        ...accentBorder,
      }}
    />
  );
}

export function EdoSampleScreen({
  language = "en",
}: {
  language?: EdoLanguage;
}) {
  const { copy, direction } = createEdoSampleModel(language);
  const isRtl = direction === "rtl";

  return (
    <SafeAreaView
      style={{
        backgroundColor: edoTheme.colors.washi,
        flex: 1,
      }}
    >
      <View
        testID="edo-sample-screen"
        style={{
          alignItems: isRtl ? "flex-end" : "flex-start",
          backgroundColor: edoTheme.colors.washi,
          flex: 1,
          gap: edoTheme.spacing.lg,
          padding: edoTheme.spacing.lg,
        }}
      >
        <View
          style={{
            alignItems: "center",
            flexDirection: isRtl ? "row-reverse" : "row",
            gap: edoTheme.spacing.md,
          }}
        >
          <EnsoRing direction={direction} />
          <KanjiRomajiPair />
        </View>
        <View
          testID="edo-token-card"
          style={{
            backgroundColor: edoTheme.colors.washiRaised,
            borderColor: edoTheme.colors.goldLeaf,
            borderRadius: edoTheme.radii.lg,
            borderWidth: 1,
            gap: edoTheme.spacing.sm,
            padding: edoTheme.spacing.md,
            width: "100%",
          }}
        >
          <Text
            style={{
              color: edoTheme.colors.sumi,
              fontFamily: edoTheme.type.display,
              fontSize: edoTheme.spacing.xl,
            }}
          >
            {copy.title}
          </Text>
          <Text
            style={{
              color: edoTheme.colors.sumiMuted,
              fontFamily: edoTheme.type.body,
              fontSize: edoTheme.spacing.md,
            }}
          >
            {copy.body}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

export { renderEdoThemeSampleHtml } from "./edo-browser-sample";
