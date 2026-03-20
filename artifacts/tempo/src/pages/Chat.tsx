import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAiChat, useCreateTask, useListMemories, getListTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Bot, User, Brain, Trash2, Calendar, ListTodo, Zap, Volume2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string; suggestions?: string[]; timestamp?: number };

const STORAGE_KEY = "tempo-chat-history";
const MAX_STORED_MESSAGES = 50;

const QUICK_PROMPTS = [
  { label: "Plan my day", icon: Calendar, prompt: "Help me plan my day based on my current tasks and energy levels." },
  { label: "Break down a task", icon: ListTodo, prompt: "I have a task I need help breaking down into smaller steps." },
  { label: "Focus help", icon: Zap, prompt: "I'm struggling to focus right now. Can you help me pick one thing to work on?" },
  { label: "Brain dump", icon: Brain, prompt: "I need to do a brain dump — let me tell you everything on my mind and you help me organize it." },
];

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveMessages(messages: Message[]) {
  try {
    const trimmed = messages.slice(-MAX_STORED_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {}
}

export default function Chat() {
  const [, setLocation] = useLocation();
  const stored = loadMessages();
  const [messages, setMessages] = useState<Message[]>(
    stored.length > 0
      ? stored
      : [{ role: "assistant", content: "Hi! I'm TEMPO. I can help you plan your day, break down overwhelming tasks, or just act as a sounding board. What's on your mind?", timestamp: Date.now() }]
  );
  const [input, setInput] = useState("");
  const [showMemory, setShowMemory] = useState(false);

  const chatMutation = useAiChat();
  const createTaskMutation = useCreateTask();
  const { data: memories } = useListMemories({ query: { enabled: showMemory, queryKey: ["listMemories"] } });
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  const handleSend = useCallback(async (text: string = input) => {
    if (!text.trim() || chatMutation.isPending) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const res = await chatMutation.mutateAsync({
        data: { message: text }
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.response,
        suggestions: res.suggestions,
        timestamp: Date.now()
      }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now.", timestamp: Date.now() }]);
    }
  }, [input, messages, chatMutation]);

  const handleAction = async (action: string) => {
    if (action.startsWith("Create task:")) {
      const title = action.replace("Create task:", "").trim();
      await createTaskMutation.mutateAsync({ data: { title, status: "inbox" } });
      queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
      setMessages(prev => [...prev, { role: "assistant", content: `Added "${title}" to your inbox.`, timestamp: Date.now() }]);
    } else {
      handleSend(action);
    }
  };

  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [loadingTtsIdx, setLoadingTtsIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleReadAloud = async (text: string, idx: number) => {
    if (speakingIdx === idx) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setSpeakingIdx(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setLoadingTtsIdx(idx);
    try {
      const baseUrl = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
      const cleanText = text.replace(/[#*_`~\[\]()>]/g, "");
      const token = localStorage.getItem("tempo_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${baseUrl}/api/tts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: cleanText }),
      });
      if (!res.ok) throw new Error("TTS request failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audio.onerror = () => {
        setSpeakingIdx(null);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      audioRef.current = audio;
      setSpeakingIdx(idx);
      await audio.play();
    } catch {
      setSpeakingIdx(null);
    } finally {
      setLoadingTtsIdx(null);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const clearHistory = () => {
    const fresh: Message[] = [{ role: "assistant", content: "Chat history cleared. What would you like to work on?", timestamp: Date.now() }];
    setMessages(fresh);
    saveMessages(fresh);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold">TEMPO Assistant</h1>
            <p className="text-xs text-muted-foreground">Always here to help you focus.</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={showMemory ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowMemory(!showMemory)}
            title="AI Memory"
          >
            <Brain size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            onClick={clearHistory}
            title="Clear chat"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {showMemory && memories && (
        <div className="mb-4 bg-card rounded-xl border border-border p-4 max-h-48 overflow-y-auto shrink-0">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
            <Brain size={12} /> What TEMPO remembers
          </h3>
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No memories yet. Chat with me to build context.</p>
          ) : (
            <div className="space-y-2">
              {memories.slice(0, 10).map((mem) => (
                <div key={mem.id} className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                  <span className={`inline-block px-1 py-0.5 rounded text-[10px] mr-1 ${mem.tier === "warm" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"}`}>
                    {mem.tier}
                  </span>
                  <span className="text-foreground">{mem.content}</span>
                </div>
              ))}
            </div>
          )}
          <Button variant="link" size="sm" className="text-xs mt-2 h-auto p-0 text-primary" onClick={() => setLocation("/memories")}>
            View all memories
          </Button>
        </div>
      )}

      {messages.length <= 1 && (
        <div className="grid grid-cols-2 gap-2 mb-4 shrink-0">
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleSend(qp.prompt)}
              className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors text-left"
            >
              <qp.icon size={16} className="text-primary shrink-0" />
              <span className="text-sm font-medium">{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      <ScrollArea className="flex-1 px-2 mb-4" ref={scrollRef}>
        <div className="space-y-6 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border border-border text-primary"}`}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm text-foreground prose prose-neutral prose-p:leading-snug prose-p:my-1"}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === "assistant" && (
                  <button
                    onClick={() => handleReadAloud(msg.content, i)}
                    disabled={loadingTtsIdx === i}
                    className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-full transition-colors ${
                      speakingIdx === i
                        ? "bg-primary/20 text-primary"
                        : loadingTtsIdx === i
                          ? "text-muted-foreground cursor-wait"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                    title={speakingIdx === i ? "Stop reading" : "Read aloud"}
                  >
                    {loadingTtsIdx === i ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                    {loadingTtsIdx === i ? "Loading..." : speakingIdx === i ? "Stop" : "Read aloud"}
                  </button>
                )}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(s)}
                        className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-card border border-border text-primary flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border rounded-tl-sm flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex gap-2 shrink-0 bg-card p-2 rounded-2xl border border-border"
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="bg-transparent border-none focus-visible:ring-0 text-base"
        />
        <Button
          type="submit"
          disabled={!input.trim() || chatMutation.isPending}
          size="icon"
          className="rounded-xl shrink-0"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
