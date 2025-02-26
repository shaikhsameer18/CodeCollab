import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useSocket } from "@/context/SocketContext"
import { ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import { formatDate } from "@/utils/formateDate"
import { FormEvent, useRef, useState } from "react"
// import { LuSendHorizonal } from "react-icons/lu"
import { v4 as uuidV4 } from "uuid"
import { motion } from "framer-motion"

export default function ChatInput() {
    const { currentUser } = useAppContext()
    const { socket } = useSocket()
    const { setMessages } = useChatRoom()
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [inputValue, setInputValue] = useState("")

    const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (inputValue.trim().length > 0) {
            const message: ChatMessage = {
                id: uuidV4(),
                message: inputValue.trim(),
                username: currentUser.username,
                timestamp: formatDate(new Date().toISOString()),
            }
            socket.emit(SocketEvent.SEND_MESSAGE, { message })
            setMessages((messages) => [...messages, message])
            setInputValue("")
        }
    }

    return (
        <form
            onSubmit={handleSendMessage}
            className="flex justify-between rounded-lg bg-gray-800 bg-opacity-50 backdrop-blur-sm shadow-lg overflow-hidden"
        >
            <input
                type="text"
                className="w-full flex-grow bg-transparent p-3 text-white placeholder-gray-400 outline-none"
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                ref={inputRef}
            />
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white transition-colors duration-300 hover:from-purple-600 hover:to-pink-600"
                type="submit"
            >
                {/* <LuSendHorizonal size={24} /> */}
            </motion.button>
        </form>
    )
}