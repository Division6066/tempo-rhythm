import React from "react";
import { View, Text } from "react-native";
import { colors } from "./theme";

type Props = { content: string };

export function MarkdownPreview({ content }: Props) {
  const lines = content.split("\n");

  return (
    <View>
      {lines.map((line, i) => {
        if (line.startsWith("### ")) {
          return (
            <Text key={i} style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginTop: 12, marginBottom: 4 }}>
              {line.slice(4)}
            </Text>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <Text key={i} style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginTop: 14, marginBottom: 6 }}>
              {line.slice(3)}
            </Text>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <Text key={i} style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 16, marginBottom: 8 }}>
              {line.slice(2)}
            </Text>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
              <Text style={{ color: colors.primary, fontSize: 15, marginRight: 8 }}>{"•"}</Text>
              <Text style={{ color: colors.foreground, fontSize: 15, lineHeight: 22, flex: 1 }}>
                {renderInline(line.slice(2))}
              </Text>
            </View>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) {
            return (
              <View key={i} style={{ flexDirection: "row", marginBottom: 4, paddingLeft: 8 }}>
                <Text style={{ color: colors.muted, fontSize: 15, marginRight: 8, minWidth: 20 }}>{match[1]}.</Text>
                <Text style={{ color: colors.foreground, fontSize: 15, lineHeight: 22, flex: 1 }}>
                  {renderInline(match[2])}
                </Text>
              </View>
            );
          }
        }
        if (line.startsWith("> ")) {
          return (
            <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: colors.primary, paddingLeft: 12, marginVertical: 4, opacity: 0.9 }}>
              <Text style={{ color: colors.muted, fontSize: 15, lineHeight: 22, fontStyle: "italic" }}>
                {line.slice(2)}
              </Text>
            </View>
          );
        }
        if (line.startsWith("```")) {
          return null;
        }
        if (line.startsWith("---") || line.startsWith("***")) {
          return <View key={i} style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />;
        }
        if (line.trim() === "") {
          return <View key={i} style={{ height: 8 }} />;
        }
        return (
          <Text key={i} style={{ color: colors.foreground, fontSize: 15, lineHeight: 22, marginBottom: 4 }}>
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );
}

function renderInline(text: string) {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`(.+?)`/);

    let earliest = null;
    let earliestIdx = remaining.length;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < earliestIdx) {
      earliest = { type: "bold", match: boldMatch };
      earliestIdx = boldMatch.index;
    }
    if (codeMatch && codeMatch.index !== undefined && codeMatch.index < earliestIdx) {
      earliest = { type: "code", match: codeMatch };
      earliestIdx = codeMatch.index;
    }
    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < earliestIdx && (!earliest || earliest.type !== "bold")) {
      earliest = { type: "italic", match: italicMatch };
      earliestIdx = italicMatch.index;
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }

    if (earliest.type === "bold") {
      parts.push(
        <Text key={`b${keyIdx++}`} style={{ fontWeight: "700" }}>
          {earliest.match[1]}
        </Text>
      );
    } else if (earliest.type === "italic") {
      parts.push(
        <Text key={`i${keyIdx++}`} style={{ fontStyle: "italic" }}>
          {earliest.match[1]}
        </Text>
      );
    } else if (earliest.type === "code") {
      parts.push(
        <Text key={`c${keyIdx++}`} style={{ fontFamily: "monospace", backgroundColor: "rgba(108,99,255,0.15)", paddingHorizontal: 4, borderRadius: 4, fontSize: 13 }}>
          {earliest.match[1]}
        </Text>
      );
    }

    remaining = remaining.slice(earliestIdx + earliest.match[0].length);
  }

  return parts;
}
