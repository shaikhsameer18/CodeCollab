import ChatInput from "@/components/chats/ChatInput"
import ChatList from "@/components/chats/ChatList"
import useResponsive from "@/hooks/useResponsive"
import { motion } from "framer-motion"

export default function ChatsView() {
    const { viewHeight } = useResponsive()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex max-h-full min-h-[400px] w-full flex-col gap-4 p-6 bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-xl"
            style={{ height: viewHeight }}
        >
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Group Chat
            </h1>
            <ChatList />
            <ChatInput />
        </motion.div>
    )
}