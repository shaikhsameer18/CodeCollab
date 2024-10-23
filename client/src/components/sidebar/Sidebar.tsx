import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton"
import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { SocketEvent } from "@/types/socket"
import { VIEWS } from "@/types/view"
import { IoCodeSlash } from "react-icons/io5"
import { MdOutlineDraw } from "react-icons/md"
import cn from "classnames"
import { motion } from "framer-motion"

export default function Sidebar() {
    const {
        activeView,
        isSidebarOpen,
        viewComponents,
        viewIcons,
        setIsSidebarOpen,
    } = useViews()
    const { minHeightReached } = useResponsive()
    const { activityState, setActivityState } = useAppContext()
    const { socket } = useSocket()
    const { isMobile } = useWindowDimensions()

    const changeState = () => {
        if (activityState === ACTIVITY_STATE.CODING) {
            setActivityState(ACTIVITY_STATE.DRAWING)
            socket.emit(SocketEvent.REQUEST_DRAWING)
        } else {
            setActivityState(ACTIVITY_STATE.CODING)
        }

        if (isMobile) {
            setIsSidebarOpen(false)
        }
    }

    return (
        <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-16 w-full gap-6 self-end overflow-auto border-t border-gray-700 bg-gray-800 bg-opacity-90 backdrop-blur-sm p-3 md:static md:h-full md:w-16 md:flex-col md:border-r md:border-t-0 md:p-2 md:pt-4",
                    {
                        "hidden": minHeightReached,
                    }
                )}
            >
                {Object.values(VIEWS).map((view) => (
                    <SidebarButton key={view} viewName={view} icon={viewIcons[view]} />
                ))}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="self-end p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-pink-600"
                    onClick={changeState}
                    aria-label={activityState === ACTIVITY_STATE.CODING ? "Switch to Drawing" : "Switch to Coding"}
                >
                    {activityState === ACTIVITY_STATE.CODING ? (
                        <MdOutlineDraw size={24} />
                    ) : (
                        <IoCodeSlash size={24} />
                    )}
                </motion.button>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: isSidebarOpen ? 1 : 0, x: isSidebarOpen ? 0 : -50 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "absolute left-0 top-0 z-20 w-full flex-grow flex-col bg-gray-800 bg-opacity-90 backdrop-blur-sm md:static md:w-72",
                    {
                        "hidden": !isSidebarOpen,
                    }
                )}
            >
                {viewComponents[activeView]}
            </motion.div>
        </aside>
    )
}