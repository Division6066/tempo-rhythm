"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "assistant"; content: string; suggestions?: string[] };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm TEMPO. I can help you plan your day, break down overwhelming tasks, or just act as a sounding board. What's on your mind?" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatAction = useAction(api.ai.chat);
  const createTask = useMutation(api.tasks.create);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

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
  };

  const handleAction = async (action: string) => {
    if (action.startsWith("Create task:")) {
      const title = action.replace("Create task:", "").trim();
      await createTask({ title, status: "inbox" });
      setMessages([...messages, { role: "assistant", content: `Added "${title}" to your inbox.` }]);
    } else {
      handleSend(action);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="text-primary" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">TEMPO Assistant</h1>
            <p className="text-xs text-muted-foreground">Always here to help you focus.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 mb-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-accent text-accent-foreground" : "bg-card border border-border text-primary"}`}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`flex flex-col gap-2 max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`p-4 rounded-2xl ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm text-foreground prose prose-invert prose-p:leading-snug prose-p:my-1"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.suggestions.map((s, idx) => (
                        <button key={idx} onClick={() => handleAction(s)} className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full border border-primary/20 transition-colors cursor-pointer">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
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
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2 shrink-0 bg-card p-2 rounded-2xl border border-border">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask me anything..." className="bg-transparent border-none focus-visible:ring-0 text-base" />
          <Button type="submit" disabled={!input.trim() || sending} size="icon" className="rounded-xl shrink-0">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
