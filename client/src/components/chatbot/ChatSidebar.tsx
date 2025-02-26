import React, { useState, useContext } from "react";
import { ChatbotContext } from "@/context/ChatbotContext";
import { sendMessageToChatbot } from "@/api/index";
import ChatMessage from "@/components/chatbot/ChatMessage";

const ChatSidebar: React.FC = () => {
    const chatbotContext = useContext(ChatbotContext);

    if (!chatbotContext) {
        throw new Error("ChatSidebar must be used within a ChatbotProvider.");
    }

    const { messages, addMessage } = chatbotContext;
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        addMessage({ sender: "user", content: input });
        setInput("");
        setLoading(true);

        try {
            await sendMessageToChatbot(input, (chunk: string) => {
                addMessage({ sender: "ai", content: chunk });
            });
        } catch {
            addMessage({ sender: "ai", content: "❌ Error fetching response." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-900 h-full p-4 rounded-lg shadow-lg">
            {/* ✅ Updated Title Styling */}
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                AI Chatbot
            </h1>


            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => (
                    <ChatMessage key={idx} sender={msg.sender} content={msg.content} />
                ))}
            </div>

            {/* Input Box & Send Button */}
            <div className="flex items-center p-3 bg-gray-800 rounded-md">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    className="flex-1 p-2 bg-gray-700 text-white rounded-l-md border border-gray-600 focus:outline-none"
                    disabled={loading}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-r-md transition-colors duration-300 hover:from-purple-600 hover:to-pink-600 disabled:bg-gray-500"
                >
                    {loading ? "..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default ChatSidebar;
