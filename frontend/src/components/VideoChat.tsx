"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface VideoChatProps {
    videoId: string;
    language?: string;
}

export function VideoChat({ videoId, language = "auto" }: VideoChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            
            // Fetch token for FastAPI authentication
            const tokenRes = await fetch("/api/auth/token");
            let token = "";
            if (tokenRes.ok) {
                const data = await tokenRes.json();
                token = data.token;
            }

            const response = await fetch(`${apiUrl}/chat/${videoId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ question: userMsg, lang: language }),
            });

            if (!response.ok) throw new Error("Failed to get answer");

            if (response.body) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let fullAnswer = "";
                let lastUpdateTime = 0;

                // Append an empty assistant message to start accumulating
                setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // Final flush
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { role: "assistant", content: fullAnswer };
                            return newMessages;
                        });
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    fullAnswer += chunk;
                    
                    const now = Date.now();
                    if (now - lastUpdateTime > 50) {
                        lastUpdateTime = now;
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            newMessages[newMessages.length - 1] = { role: "assistant", content: fullAnswer };
                            return newMessages;
                        });
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I couldn't process your question. Please try again." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Chat with Video
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                    Ask specific questions about the video content.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-70">
                        <Bot className="w-8 h-8" />
                        <p className="text-sm">What would you like to know about this video?</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground border border-border"}`}>
                                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div
                                className={`px-4 py-2 rounded-lg max-w-[80%] text-sm md:text-base ${
                                    msg.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                        : "bg-muted text-foreground border border-border rounded-tl-none whitespace-pre-wrap"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="flex gap-3 flex-row">
                        <div className="w-8 h-8 rounded-full bg-muted text-foreground border border-border flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="px-4 py-3 rounded-lg bg-muted text-foreground border border-border rounded-tl-none flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-border bg-background flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-transparent border-none outline-none px-3 text-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="p-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-opacity"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
