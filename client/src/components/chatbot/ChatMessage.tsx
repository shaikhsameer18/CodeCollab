import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { FiClipboard, FiCheck } from "react-icons/fi";

interface ChatMessageProps {
    sender: "user" | "ai";
    content: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, content }) => {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className={`flex w-full my-3 ${sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
                className={`relative p-5 rounded-xl shadow-lg transition-all duration-300 ${sender === "user"
                    ? "ml-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "bg-gray-700 text-gray-200 border border-gray-600"
                    }`}
                style={{
                    maxWidth: "90%",
                    minWidth: "40%",
                    wordBreak: "break-word",
                    fontSize: "1rem",
                }}
            >
                {/* Sender Name */}
                <h3 className="text-base font-semibold opacity-80 mb-3">
                    {sender === "user" ? "You" : "Chatbot"}
                </h3>
                {/* Render Markdown with Syntax Highlighting & Copy Button */}
                <Markdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const codeContent = String(children).trim();
                            return match ? (
                                <div className="relative group">
                                    {/* Copy Button */}
                                    <button
                                        onClick={() => handleCopy(codeContent)}
                                        className="absolute top-3 right-3 bg-gray-700 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                        {copied === codeContent ? (
                                            <FiCheck className="text-green-400" size={18} />
                                        ) : (
                                            <FiClipboard className="text-gray-300" size={18} />
                                        )}
                                    </button>
                                    {/* Code Block */}
                                    <SyntaxHighlighter
                                        {...props}
                                        style={oneDark}
                                        language={match[1]}
                                        PreTag="div"
                                        className="rounded-md p-4 text-lg"
                                        // Explicitly set ref to null to avoid type mismatch
                                        ref={null}
                                    >
                                        {codeContent}
                                    </SyntaxHighlighter>
                                </div>
                            ) : (
                                <code className="bg-gray-700 px-2 py-1 rounded text-sm">{children}</code>
                            );
                        },
                    }}
                >
                    {content}
                </Markdown>
            </div>
        </div>
    );
};

export default ChatMessage;