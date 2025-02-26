import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton";
import ChatbotView from "@/components/sidebar/sidebar-views/ChatbotView";
import { useViews } from "@/context/ViewContext";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { VIEWS, SIDEBAR_VIEWS } from "@/types/view";
import { ACTIVITY_STATE } from "@/types/app";
import { SocketEvent } from "@/types/socket";
import { IoCodeSlash } from "react-icons/io5";
import { MdOutlineDraw } from "react-icons/md";
import { FaRobot, FaUserFriends } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { VscFiles, VscTerminal } from "react-icons/vsc";
import cn from "classnames";
import { motion } from "framer-motion";

export default function Sidebar() {
    const { activeView, setActiveView, viewComponents } = useViews();
    const { activityState, setActivityState } = useAppContext();
    const { socket } = useSocket();
    const { isMobile } = useWindowDimensions();

    // ✅ Sidebar Icons Mapping (Uses SIDEBAR_VIEWS)
    const updatedViewIcons: Record<VIEWS, JSX.Element> = {
        [VIEWS.FILES]: <VscFiles size={24} />,
        [VIEWS.CHATS]: <IoCodeSlash size={24} />,
        [VIEWS.CLIENTS]: <FaUserFriends size={24} />,
        [VIEWS.RUN]: <VscTerminal size={24} />,
        [VIEWS.SETTINGS]: <IoSettingsOutline size={24} />,
        [VIEWS.CHATBOT]: <FaRobot size={24} />,
        [VIEWS.EDITOR]: <IoCodeSlash size={24} />, // Add appropriate icon
        [VIEWS.CHAT]: <IoCodeSlash size={24} />, // Add appropriate icon
    };

    // ✅ Sidebar Components Mapping (Uses SIDEBAR_VIEWS)
    const updatedViewComponents: Record<VIEWS, JSX.Element> = {
        ...viewComponents,
        [VIEWS.CHATBOT]: <ChatbotView />,
        [VIEWS.EDITOR]: <div>Editor View</div>, // Add appropriate component
        [VIEWS.CHAT]: <div>Chat View</div>, // Add appropriate component
    };

    // ✅ Whiteboard & Coding Mode Toggle Logic
    const changeState = () => {
        const newState =
            activityState === ACTIVITY_STATE.CODING
                ? ACTIVITY_STATE.DRAWING
                : ACTIVITY_STATE.CODING;
        setActivityState(newState);
        socket.emit(SocketEvent.REQUEST_DRAWING);

        // Close sidebar on mobile devices
        if (isMobile) {
            setActiveView(VIEWS.FILES); // ✅ Default view when switching modes
        }
    };

    return (
        <aside className="flex w-full md:h-full md:max-h-full md:min-h-full md:w-auto">
            {/* Sidebar Navigation with Vertical Spacing */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-16 w-full flex-col space-y-4 self-end overflow-auto border-t border-gray-700 bg-gray-800 bg-opacity-90 backdrop-blur-sm p-3 md:static md:h-full md:w-16 md:border-r md:border-t-0 md:p-2 md:pt-4"
                )}
            >
                {/* Render Sidebar Buttons with Proper Spacing */}
                {SIDEBAR_VIEWS.map((view) => (
                    <SidebarButton
                        key={view}
                        viewName={view}
                        icon={updatedViewIcons[view]}
                        isActive={activeView === view}
                        onClick={() => setActiveView(view)}
                    />
                ))}

                {/* Whiteboard & Coding Toggle Button */}
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

            {/* Show Selected View */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "absolute left-0 top-0 z-20 w-full flex-grow flex-col bg-gray-800 bg-opacity-90 backdrop-blur-sm md:static md:w-72"
                )}
            >
                {updatedViewComponents[activeView]}
            </motion.div>
        </aside>
    );
}