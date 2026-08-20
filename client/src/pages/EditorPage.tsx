import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import GitHubModal from "@/components/github/GitHubModal"
import GitHubCommitModal from "@/components/github/GitHubCommitModal"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { motion } from "framer-motion"
import { FiCode } from "react-icons/fi"

export default function EditorPage() {
    useUserActivity()
    useFullScreen()

    const navigate = useNavigate()
    const { roomId } = useParams<{ roomId: string }>()
    const { status, setCurrentUser, currentUser } = useAppContext()
    const { socket } = useSocket()
    const location = useLocation()
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false)
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(false)

    useEffect(() => {
        if (currentUser.username.length > 0) return

        const username = location.state?.username as string | undefined
        if (username === undefined) {
            navigate("/", { state: { roomId } })
        } else if (roomId) {
            const user: User = { username, roomId }
            setCurrentUser(user)
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [currentUser.username, location.state, navigate, roomId, setCurrentUser, socket])

    if (status === USER_STATUS.ATTEMPTING_JOIN) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gradient-ocean">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card text-center"
                >
                    <div className="flex items-center justify-center mb-4 relative">
                        <FiCode className="absolute z-10 h-10 w-10 text-primary-400" />
                        <div className="animate-spin absolute inset-0 rounded-full border-4 border-primary-800 border-t-primary-400"></div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Connecting to Room</h2>
                    <p className="text-gray-400 mb-4">Establishing connection to {roomId}...</p>
                    <div className="w-full h-1.5 bg-darkTertiary rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
            </div>
        )
    }

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-screen w-screen overflow-hidden bg-dark"
        >
            <SplitterComponent>
                <Sidebar onOpenGitHub={() => setIsGitHubModalOpen(true)} />
                <WorkSpace />
            </SplitterComponent>

            <GitHubModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
                onCommit={() => {
                    setIsGitHubModalOpen(false)
                    setIsCommitModalOpen(true)
                }}
            />
            <GitHubCommitModal
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
            />
        </motion.div>
    )
}