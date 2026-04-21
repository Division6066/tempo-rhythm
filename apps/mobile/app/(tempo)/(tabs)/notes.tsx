/**
 * @screen: notes
 * @tier: A
 * @platform: mobile
 * @prd: §4 Screen 4, §13
 * @source: docs/design/claude-export/design-system/mobile/mobile-screens-a.jsx
 * @summary: Notes index with search, filters, and note create CTA.
 */
import { mockNotes } from "@tempo/mock-data";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Screen() {
  const [query, setQuery] = useState("");
  const [showIdeasOnly, setShowIdeasOnly] = useState(false);
  const notes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mockNotes.filter((note) => {
      if (showIdeasOnly && note.type !== "idea") return false;
      if (q.length === 0) return true;
      return note.title.toLowerCase().includes(q) || note.excerpt.toLowerCase().includes(q);
    });
  }, [query, showIdeasOnly]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 gap-3 p-6">
        <Text className="text-2xl font-semibold text-foreground">Notes</Text>

        {/* @behavior: Filter visible notes by free-text title/excerpt matching as user types.
            @convex-query-needed: notes.search
            @source: mobile-screens-a.jsx search field
            @prd: §4 Screen 4
        */}
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search notes"
          placeholderTextColor="#8a7f72"
          className="rounded-xl border border-border bg-card px-4 py-3 text-foreground"
        />

        {/* @behavior: Toggle notes list between all notes and type=idea subset.
            @convex-query-needed: notes.listByType
            @source: mobile-screens-a.jsx filter pills
            @prd: §4 Screen 4
        */}
        <Pressable
          onPress={() => setShowIdeasOnly((current) => !current)}
          className={`rounded-full px-4 py-2 ${showIdeasOnly ? "bg-foreground" : "bg-card"}`}
        >
          <Text className={`text-xs ${showIdeasOnly ? "text-background" : "text-muted-foreground"}`}>
            {showIdeasOnly ? "Showing: Ideas only" : "Showing: All note types"}
          </Text>
        </Pressable>

        <View className="gap-2">
          {notes.map((note) => (
            <Pressable key={note.id} className="rounded-xl border border-border bg-card p-3">
              {/* @behavior: Open note detail editor for the selected note id.
                  @navigate: /(tempo)/(tabs)/notes/[id]
                  @source: mobile-screens-a.jsx note row tap
                  @prd: §4 Screen 5
              */}
              <Text className="text-base font-medium text-foreground">{note.title}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">{note.excerpt}</Text>
              <Text className="mt-2 text-xs text-muted-foreground">{note.updatedAtLabel}</Text>
            </Pressable>
          ))}
        </View>

        {/* @behavior: Open capture composer pre-seeded for note creation.
            @navigate: /(tempo)/capture?mode=note
            @source: mobile-screens-a.jsx quick-note FAB
            @prd: §4 Screen 4
        */}
        <Pressable className="mt-auto rounded-full bg-foreground px-5 py-3">
          <Text className="text-center text-sm font-medium text-background">Quick note</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
