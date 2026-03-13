import { useState, useRef } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type Message = { role: "user" | "assistant"; content: string; suggestions?: string[] };

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm TEMPO. I can help you plan your day, break down overwhelming tasks, or just act as a sounding board. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatAction = useAction(api.ai.chat);
  const createTask = useMutation(api.tasks.create);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || sending) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setSending(true);
    try {
      const res = await chatAction({ message: text });
      setMessages([...newMessages, { role: "assistant", content: res.response, suggestions: res.suggestions }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setSending(false);
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(108,99,255,0.2)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>TEMPO Assistant</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Always here to help you focus.</Text>
          </View>
        </View>

        <ScrollView ref={scrollRef} style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((msg, i) => (
            <View key={i} style={{ flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, marginBottom: 16, alignItems: "flex-start" }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: msg.role === "user" ? colors.primary : colors.surface, alignItems: "center", justifyContent: "center", borderWidth: msg.role === "assistant" ? 1 : 0, borderColor: colors.border }}>
                <Ionicons name={msg.role === "user" ? "person" : "sparkles"} size={14} color={msg.role === "user" ? "#fff" : colors.primary} />
              </View>
              <View style={{ maxWidth: "78%", gap: 8 }}>
                <View style={{ backgroundColor: msg.role === "user" ? colors.primary : colors.surface, borderRadius: 16, padding: 14, borderWidth: msg.role === "assistant" ? 1 : 0, borderColor: colors.border }}>
                  <Text style={{ color: msg.role === "user" ? "#fff" : colors.foreground, fontSize: 14, lineHeight: 20 }}>{msg.content}</Text>
                </View>
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {msg.suggestions.map((s, idx) => (
                      <Pressable key={idx} onPress={() => handleSend(s)} style={{ backgroundColor: "rgba(108,99,255,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(108,99,255,0.2)" }}>
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
          {sending && (
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border }}>
                <Ionicons name="sparkles" size={14} color={colors.primary} />
              </View>
              <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.border, flexDirection: "row", gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, opacity: 0.5 }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, opacity: 0.5 }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, opacity: 0.5 }} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 20, marginHorizontal: 12, marginBottom: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.muted}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            style={{ flex: 1, color: colors.foreground, fontSize: 15, paddingVertical: 6 }}
          />
          <Pressable onPress={() => handleSend()} disabled={!input.trim() || sending} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: !input.trim() || sending ? colors.surfaceLight : colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
