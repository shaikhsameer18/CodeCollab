import { motion } from 'framer-motion'
import { Share2, Copy, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

import Users from '@/components/common/Users'
import { useAppContext } from '@/context/AppContext'
import { useSocket } from '@/context/SocketContext'
import useResponsive from '@/hooks/useResponsive'
import { USER_STATUS } from '@/types/user'

export default function UsersView() {
    const navigate = useNavigate()
    const { viewHeight } = useResponsive()
    const { setStatus } = useAppContext()
    const { socket } = useSocket()

    const copyURL = async () => {
        const url = window.location.href
        try {
            await navigator.clipboard.writeText(url)
            toast.success('URL copied to clipboard')
        } catch (error) {
            toast.error('Unable to copy URL to clipboard')
            console.error(error)
        }
    }

    const shareURL = async () => {
        const url = window.location.href
        try {
            await navigator.share({ url })
        } catch (error) {
            toast.error('Unable to share URL')
            console.error(error)
        }
    }

    const leaveRoom = () => {
        socket.disconnect()
        setStatus(USER_STATUS.DISCONNECTED)
        navigate('/', { replace: true })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 p-6 bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-xl"
            style={{ height: viewHeight }}
        >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Users
            </h2>
            <Users />
            <div className="mt-auto grid grid-cols-3 gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 bg-gray-800 rounded-md text-white hover:bg-gray-700 transition-colors duration-300"
                    onClick={shareURL}
                    title="Share Link"
                >
                    <Share2 size={20} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 bg-gray-800 rounded-md text-white hover:bg-gray-700 transition-colors duration-300"
                    onClick={copyURL}
                    title="Copy Link"
                >
                    <Copy size={20} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md text-white"
                    onClick={leaveRoom}
                    title="Leave room"
                >
                    <LogOut size={20} />
                </motion.button>
            </div>
        </motion.div>
    )
}