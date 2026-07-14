import { Text, View, type ViewProps } from "react-native";

import { tempoColors, tempoFonts, tempoRadii, tempoSpacing } from "../theme/tokens";

type KanjiRomajiPairProps = Omit<ViewProps, "children"> & {
  kanji: string;
  romaji: string;
  label?: string;
  kanjiTestID?: string;
  romajiTestID?: string;
};

export function KanjiRomajiPair({
  kanji,
  romaji,
  label,
  testID = "kanji-romaji-pair",
  kanjiTestID = "kanji-romaji-kanji",
  romajiTestID = "kanji-romaji-romaji",
  style,
  ...viewProps
}: KanjiRomajiPairProps) {
  const accessibilityLabel = label ?? `${kanji}, ${romaji}`;

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessible={true}
      style={[styles.root, style]}
      testID={testID}
      {...viewProps}
    >
      <Text style={styles.kanji} testID={kanjiTestID}>
        {kanji}
      </Text>
      <Text style={styles.romaji} testID={romajiTestID}>
        {romaji}
      </Text>
    </View>
  );
}

const styles = {
  root: {
    alignItems: "center",
    backgroundColor: tempoColors.creamRaised,
    borderColor: tempoColors.line,
    borderRadius: tempoRadii["2xl"],
    borderWidth: 1,
    gap: tempoSpacing[2],
    paddingHorizontal: tempoSpacing[6],
    paddingVertical: tempoSpacing[5],
  },
  kanji: {
    color: tempoColors.ink,
    fontFamily: tempoFonts.serif,
    fontSize: 56,
    fontWeight: "600",
    lineHeight: 64,
  },
  romaji: {
    color: tempoColors.dustGrey,
    fontFamily: tempoFonts.mono,
    fontSize: 14,
    letterSpacing: 1.6,
    lineHeight: 20,
    textTransform: "uppercase",
  },
} as const;
