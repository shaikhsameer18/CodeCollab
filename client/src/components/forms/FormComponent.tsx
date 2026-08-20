import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { motion } from "framer-motion"
import { FiLink, FiUser, FiArrowRight, FiKey, FiCode } from "react-icons/fi"

export default function FormComponent() {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }

        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <motion.div 
            className="w-full max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="bg-darkSecondary/80 backdrop-blur-xl rounded-lg shadow-xl border border-darkTertiary/30 p-6">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-600 to-teal-600 flex items-center justify-center shadow-md">
                        <FiCode className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                        Join Workspace
                    </h2>
                </div>
                
                <form onSubmit={joinRoom} className="flex flex-col gap-5">
                    <div className="space-y-2">
                        <label htmlFor="roomId" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <FiLink className="text-teal-500" />
                            Room ID
                        </label>
                        <div className="relative group">
                            <input
                                id="roomId"
                                type="text"
                                name="roomId"
                                placeholder="Enter room ID or create new"
                                className="w-full p-2.5 pl-10 rounded-md bg-darkTertiary/30 border border-darkTertiary/50 text-white 
                                           placeholder:text-gray-500 focus:outline-none focus:border-teal-500/70 transition-all"
                                onChange={handleInputChanges}
                                value={currentUser.roomId}
                            />
                            <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <FiUser className="text-teal-500" />
                            Username
                        </label>
                        <div className="relative group">
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="What should we call you?"
                                className="w-full p-2.5 pl-10 rounded-md bg-darkTertiary/30 border border-darkTertiary/50 text-white 
                                           placeholder:text-gray-500 focus:outline-none focus:border-teal-500/70 transition-all"
                                onChange={handleInputChanges}
                                value={currentUser.username}
                                ref={usernameRef}
                            />
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                        <motion.button
                            type="submit"
                            className="flex items-center justify-center w-full py-2.5 px-4 rounded-md 
                                     bg-gradient-to-r from-primary-600 to-teal-600 text-white font-medium 
                                     transition-all duration-300 hover:shadow-md"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={status === USER_STATUS.ATTEMPTING_JOIN}
                        >
                            <span>Join Session</span>
                            <FiArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                        </motion.button>
                        
                        <motion.button
                            type="button"
                            className="p-2.5 rounded-md bg-darkTertiary/50 text-white hover:bg-darkTertiary/80 transition-all"
                            onClick={createNewRoomId}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="Generate new room ID"
                        >
                            <FiKey className="w-5 h-5" />
                        </motion.button>
                    </div>
                </form>
                
                <div className="mt-6 pt-4 border-t border-darkTertiary/30 text-center">
                    <p className="text-xs text-gray-500">
                        No account needed — you're in the room as soon as you submit.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}