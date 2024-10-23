import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { SyntheticEvent, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function ChatList() {
    const {
        messages,
        isNewMessage,
        setIsNewMessage,
        lastScrollHeight,
        setLastScrollHeight,
    } = useChatRoom()
    const { currentUser } = useAppContext()
    const messagesContainerRef = useRef<HTMLDivElement | null>(null)

    const handleScroll = (e: SyntheticEvent) => {
        const container = e.target as HTMLDivElement
        setLastScrollHeight(container.scrollTop)
    }

    useEffect(() => {
        if (!messagesContainerRef.current) return
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }, [messages])

    useEffect(() => {
        if (isNewMessage) {
            setIsNewMessage(false)
        }
        if (messagesContainerRef.current)
            messagesContainerRef.current.scrollTop = lastScrollHeight
    }, [isNewMessage, setIsNewMessage, lastScrollHeight])

    return (
        <div
            className="flex-grow overflow-auto rounded-lg bg-gray-800 bg-opacity-50 p-4 backdrop-blur-sm shadow-inner"
            ref={messagesContainerRef}
            onScroll={handleScroll}
        >
            <AnimatePresence>
                {messages.map((message, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 w-[80%] self-end break-words rounded-lg px-4 py-3 shadow-md ${message.username === currentUser.username
                            ? "ml-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : "bg-gray-700 text-gray-200"
                            }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold">
                                {message.username}
                            </span>
                            <span className="text-xs opacity-75">
                                {message.timestamp}
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.message}</p>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}