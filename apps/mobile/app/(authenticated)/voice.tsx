// Voice lab — walkie-talkie capture (batch flow). Hidden from the tab bar
// (href: null in the layout); navigate to /(authenticated)/voice to test.

import { useQuery } from "convex/react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { voiceApi } from "@/lib/voice/apiRefs";
import { useVoiceNoteRecorder } from "@/lib/voice/useVoiceNoteRecorder";

export default function VoiceLabScreen() {
  const { phase, notice, startRecording, stopAndTranscribe } =
    useVoiceNoteRecorder();
  const notes = useQuery(voiceApi.listMine, {});

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={["top"]}>
      <ScrollView className="flex-1">
        <View className="max-w-3xl w-full mx-auto px-8 pb-12 pt-8">
          <Text className="text-[#ededed] text-3xl font-bold mb-2">
            Voice notes
          </Text>
          <Text className="text-[#a1a1aa] text-base mb-6">
            Hold a thought? Say it. The text lands below — recordings are
            deleted right after transcription.
          </Text>

          {phase === "idle" ? (
            <Pressable
              onPress={() => void startRecording()}
              className="rounded-xl bg-[#D97757] px-5 py-3 self-start"
            >
              <Text className="text-white font-semibold">Record a note</Text>
            </Pressable>
          ) : null}
          {phase === "recording" ? (
            <Pressable
              onPress={() => void stopAndTranscribe()}
              className="rounded-xl bg-[#D97757] px-5 py-3 self-start"
            >
              <Text className="text-white font-semibold">
                Stop &amp; transcribe
              </Text>
            </Pressable>
          ) : null}
          {phase === "uploading" ? (
            <Text className="text-[#a1a1aa] text-base">Saving your note…</Text>
          ) : null}

          {notice ? (
            <Text className="text-[#a1a1aa] text-sm mt-4">{notice}</Text>
          ) : null}

          <View className="mt-8">
            {notes === undefined ? (
              <Text className="text-[#a1a1aa] text-sm">Loading…</Text>
            ) : notes.length === 0 ? (
              <Text className="text-[#a1a1aa] text-sm">
                No voice notes yet — the first one can be ten seconds of
                anything.
              </Text>
            ) : (
              notes.map((note) => (
                <View
                  key={note._id}
                  className="rounded-xl border border-[#27272a] p-4 mb-3"
                >
                  <Text className="text-[#71717a] text-xs mb-1">
                    {note.status === "done"
                      ? "Transcript ready"
                      : note.status === "transcribing"
                        ? "Transcribing…"
                        : note.status === "failed"
                          ? "That one didn't transcribe — safe to retry"
                          : "Saved"}
                  </Text>
                  {note.transcript ? (
                    <Text className="text-[#ededed] text-base">
                      {note.transcript}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
