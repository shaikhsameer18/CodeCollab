import SidebarButton from "@/components/sidebar/sidebar-views/SidebarButton";
import ChatbotView from "@/components/sidebar/sidebar-views/ChatbotView";
import GitHubSidebarButton from "@/components/github/GitHubSidebarButton";
import { useViews } from "@/context/ViewContext";
import { useAppContext } from "@/context/AppContext";
import { useSocket } from "@/context/SocketContext";
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { VIEWS, SIDEBAR_VIEWS } from "@/types/view";
import { ACTIVITY_STATE } from "@/types/app";
import { SocketEvent } from "@/types/socket";
import { IoCodeSlash } from "react-icons/io5";
import { MdOutlineDraw } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import { FiUsers, FiSettings, FiCode, FiTerminal, FiFolder, FiMessageSquare } from "react-icons/fi";
import cn from "classnames";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
    onOpenGitHub: () => void;
}

export default function Sidebar({ onOpenGitHub }: SidebarProps) {
    const { activeView, setActiveView, viewComponents, isSidebarOpen } = useViews();
    const { activityState, setActivityState } = useAppContext();
    const { socket } = useSocket();
    const { isMobile } = useWindowDimensions();

    // Sidebar Icons Mapping with improved consistency
    const viewIcons: Record<VIEWS, JSX.Element> = {
        [VIEWS.FILES]: <FiFolder size={22} />,
        [VIEWS.CHATS]: <FiMessageSquare size={22} />,
        [VIEWS.CLIENTS]: <FiUsers size={22} />,
        [VIEWS.RUN]: <FiTerminal size={22} />,
        [VIEWS.SETTINGS]: <FiSettings size={22} />,
        [VIEWS.CHATBOT]: <FaRobot size={22} />,
        [VIEWS.EDITOR]: <FiCode size={22} />,
        [VIEWS.CHAT]: <FiMessageSquare size={22} />,
    };

    // Sidebar Components Mapping
    const updatedViewComponents: Record<VIEWS, JSX.Element> = {
        ...viewComponents,
        [VIEWS.CHATBOT]: <ChatbotView />,
        [VIEWS.EDITOR]: <div>Editor View</div>,
        [VIEWS.CHAT]: <div>Chat View</div>,
    };

    // Whiteboard & Coding Mode Toggle Logic
    const changeState = () => {
        const newState =
            activityState === ACTIVITY_STATE.CODING
                ? ACTIVITY_STATE.DRAWING
                : ACTIVITY_STATE.CODING;
        setActivityState(newState);
        socket.emit(SocketEvent.REQUEST_DRAWING);

        // Close sidebar on mobile devices
        if (isMobile) {
            setActiveView(VIEWS.FILES);
        }
    };

    return (
        <aside className="flex h-full">
            {/* Sidebar Navigation (Icons) */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    "fixed bottom-0 left-0 z-50 flex h-16 w-full flex-row md:flex-col justify-around md:justify-start",
                    "self-end overflow-auto border-t border-darkTertiary/30 bg-darkSecondary/95 backdrop-blur-xl p-2",
                    "md:static md:h-full md:w-16 md:border-r md:border-t-0 md:pt-6 md:border-darkTertiary/30 md:shadow-[1px_0_5px_rgba(0,0,0,0.2)]"
                )}
            >
                {/* Icon Buttons */}
                <div className="md:space-y-4 flex flex-row md:flex-col items-center md:items-center">
                    {SIDEBAR_VIEWS.map((view) => (
                        <SidebarButton
                            key={view}
                            viewName={view}
                            icon={viewIcons[view]}
                            isActive={activeView === view}
                            onClick={() => setActiveView(view)}
                        />
                    ))}
                </div>

                {/* GitHub connect/commit entry point - lives here, not as a
                    separate app-wide sidebar, so the editor only ever shows
                    one icon rail */}
                <div className="md:mt-auto md:mb-4">
                    <GitHubSidebarButton onClick={onOpenGitHub} />
                </div>

                {/* Mode Toggle Button - Fixed at bottom for desktop */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "flex items-center justify-center p-2.5 rounded-lg",
                        "bg-gradient-to-r from-primary-600 to-teal-600 text-white shadow-md",
                        "transition-all duration-300 hover:shadow-glow md:mt-auto md:mb-6"
                    )}
                    onClick={changeState}
                    aria-label={activityState === ACTIVITY_STATE.CODING ? "Switch to Drawing" : "Switch to Coding"}
                >
                    {activityState === ACTIVITY_STATE.CODING ? (
                        <MdOutlineDraw size={22} />
                    ) : (
                        <IoCodeSlash size={22} />
                    )}
                </motion.button>
            </motion.div>

            {/* Sidebar Content Panel */}
            <AnimatePresence mode="wait">
                {activeView && isSidebarOpen && (
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "absolute left-0 top-0 z-10 h-[calc(100vh-64px)] w-full max-w-[350px]",
                            "bg-darkSecondary/95 backdrop-blur-xl border-r border-darkTertiary/30 shadow-lg",
                            "flex flex-col overflow-hidden md:static md:h-full md:border-l-0"
                        )}
                    >
                        <motion.div 
                            className="p-4 pt-5 pb-3 border-b border-darkTertiary/30 bg-gradient-to-r from-darkSecondary to-darkSecondary/80"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h2 className="text-xl font-medium text-white flex items-center gap-2.5 pb-1 font-sans ml-1">
                                <span className="text-primary-400">{viewIcons[activeView]}</span>
                                <span className="tracking-wide">{activeView}</span>
                            </h2>
                        </motion.div>
                        <motion.div 
                            className="flex-1 overflow-auto scrollable p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {updatedViewComponents[activeView]}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </aside>
    );
}