import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/chatbot/ChatMessage";
import { sendMessageToChatbot } from "@/api";

interface Message {
    sender: "user" | "ai";
    content: string;
}

export default function ChatbotView() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage: Message = { sender: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            await sendMessageToChatbot(input, (chunk) => {
                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage?.sender === "ai") {
                        return [
                            ...prev.slice(0, -1),
                            { sender: "ai", content: lastMessage.content + chunk },
                        ];
                    } else {
                        return [...prev, { sender: "ai", content: chunk }];
                    }
                });
            });
        } catch {
            setMessages((prev) => [
                ...prev,
                { sender: "ai", content: "❌ **Error:** AI service unavailable." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter Key Press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 p-6 rounded-lg shadow-lg">
            {/* ✅ Chat Title with Gradient */}
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                AI Chatbot
            </h1>

            {/* ✅ Chat Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-lg shadow-inner">
                {messages.map((msg, idx) => (
                    <ChatMessage key={idx} sender={msg.sender} content={msg.content} />
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* ✅ Input Field & Send Button */}
            <div className="flex items-center bg-gray-800 rounded-md mt-4 w-full">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask something..."
                    className="flex-grow p-3 bg-gray-700 text-white rounded-l-md border border-gray-600 focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="w-16 h-12 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-md hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-500 transition-all duration-300"
                >
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
}
