import React, { createContext, useContext, useState, ReactNode } from "react";

interface Message {
    sender: "user" | "ai";
    content: string;
}

interface ChatbotContextType {
    messages: Message[];
    addMessage: (msg: Message) => void;
}

export const ChatbotContext = createContext<ChatbotContextType | null>(null);

export const ChatbotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const addMessage = (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
    };

    return (
        <ChatbotContext.Provider value={{ messages, addMessage }}>
            {children}
        </ChatbotContext.Provider>
    );
};

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error("useChatbot must be used within a ChatbotProvider");
    }
    return context;
};
