import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../../../tempo-app/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../../lib/theme";
import { useNetwork } from "../../lib/NetworkContext";

type Message = { role: "user" | "assistant"; content: string; suggestions?: string[] };

export default function ChatScreen() {
  const colors = useThemeColors();
  const { isConnected } = useNetwork();
  const memories = useQuery(api.memories.list);
  const persistedMessages = useQuery(api.chatMessages.list, { limit: 50 });
  const saveMessage = useMutation(api.chatMessages.create);
  const clearMessages = useMutation(api.chatMessages.clear);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const chatAction = useAction(api.ai.chat);
  const scrollRef = useRef<ScrollView>(null);

  const memoryCount = memories?.length ?? 0;

  useEffect(() => {
    if (persistedMessages && !historyLoaded) {
      if (persistedMessages.length > 0) {
        const loaded: Message[] = persistedMessages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          suggestions: m.suggestions,
        }));
        setMessages(loaded);
      } else {
        const greeting: Message = {
          role: "assistant",
          content: "Hi! I'm TEMPO. I can help you plan your day, break down overwhelming tasks, or just act as a sounding board. What's on your mind?",
        };
        setMessages([greeting]);
        saveMessage({ role: "assistant", content: greeting.content });
      }
      setHistoryLoaded(true);
    }
  }, [persistedMessages, historyLoaded]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || sending) return;
    if (!isConnected) return;
    setInput("");
    const userMsg: Message = { role: "user", content: text };
    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setSending(true);

    saveMessage({ role: "user", content: text });

    try {
      const res = await chatAction({ message: text });
      const assistantMsg: Message = { role: "assistant", content: res.response, suggestions: res.suggestions };
      setMessages([...newMessages, assistantMsg]);
      saveMessage({ role: "assistant", content: res.response, suggestions: res.suggestions });
    } catch {
      const errorMsg: Message = { role: "assistant", content: "Sorry, I'm having trouble connecting right now." };
      setMessages([...newMessages, errorMsg]);
      saveMessage({ role: "assistant", content: errorMsg.content });
    } finally {
      setSending(false);
    }
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleClearHistory = async () => {
    setMessages([
      { role: "assistant", content: "Hi! I'm TEMPO. I can help you plan your day, break down overwhelming tasks, or just act as a sounding board. What's on your mind?" },
    ]);
    await clearMessages();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={90}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(201,100,66,0.2)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>TEMPO Assistant</Text>
            <Text style={{ color: colors.muted, fontSize: 11 }}>Always here to help you focus.</Text>
          </View>
          <Pressable onPress={handleClearHistory} hitSlop={12}>
            <Ionicons name="refresh-outline" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {!isConnected && (
          <View style={{ marginHorizontal: 16, backgroundColor: "rgba(184,84,80,0.1)", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "rgba(184,84,80,0.2)" }}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.destructive} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>Requires Connection</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>AI chat needs an internet connection to work.</Text>
            </View>
          </View>
        )}

        {isConnected && memoryCount > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(107,158,125,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(107,158,125,0.2)" }}>
              <Ionicons name="bulb-outline" size={14} color={colors.success} />
              <Text style={{ color: colors.success, fontSize: 11, fontWeight: "600" }}>
                TEMPO remembers your context ({memoryCount} {memoryCount === 1 ? "memory" : "memories"})
              </Text>
            </View>
          </View>
        )}

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
                      <Pressable key={idx} onPress={() => handleSend(s)} disabled={!isConnected} style={{ backgroundColor: "rgba(201,100,66,0.1)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(201,100,66,0.2)", opacity: !isConnected ? 0.5 : 1 }}>
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

        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, borderRadius: 20, marginHorizontal: 12, marginBottom: 8, opacity: !isConnected ? 0.5 : 1 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={!isConnected ? "Chat unavailable offline..." : "Ask me anything..."}
            placeholderTextColor={colors.muted}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            editable={isConnected}
            style={{ flex: 1, color: colors.foreground, fontSize: 15, paddingVertical: 6 }}
          />
          <Pressable onPress={() => handleSend()} disabled={!input.trim() || sending || !isConnected} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: !input.trim() || sending || !isConnected ? colors.surfaceLight : colors.primary, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
