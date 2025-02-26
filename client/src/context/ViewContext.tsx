import ChatsView from "@/components/sidebar/sidebar-views/ChatsView";
import FilesView from "@/components/sidebar/sidebar-views/FilesView";
import RunView from "@/components/sidebar/sidebar-views/RunView";
import SettingsView from "@/components/sidebar/sidebar-views/SettingsView";
import UsersView from "@/components/sidebar/sidebar-views/UsersView";
import ChatbotView from "@/components/sidebar/sidebar-views/ChatbotView"; // ✅ Added Chatbot View
// import EditorView from "@/components/sidebar/sidebar-views/EditorView"; // ✅ Placeholder for Editor View
// import ChatView from "@/components/sidebar/sidebar-views/ChatView"; // ✅ Placeholder for Chat View
import useWindowDimensions from "@/hooks/useWindowDimensions";
import { VIEWS, ViewContext as ViewContextType } from "@/types/view";
import { ReactNode, createContext, useContext, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { LuFiles } from "react-icons/lu";
import { PiChats, PiPlay, PiUsers } from "react-icons/pi";
import { FaRobot } from "react-icons/fa";
import { IoCodeSlash } from "react-icons/io5";

const ViewContext = createContext<ViewContextType | null>(null);

export const useViews = (): ViewContextType => {
    const context = useContext(ViewContext);
    if (!context) {
        throw new Error("useViews must be used within a ViewContextProvider");
    }
    return context;
};

function ViewContextProvider({ children }: { children: ReactNode }) {
    const { isMobile } = useWindowDimensions();
    const [activeView, setActiveView] = useState<VIEWS>(VIEWS.FILES);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(!isMobile);

    // ✅ Ensure all views are defined (Fixes TypeScript error)
    const [viewComponents] = useState<Record<VIEWS, JSX.Element>>({
        [VIEWS.FILES]: <FilesView />,
        [VIEWS.CLIENTS]: <UsersView />,
        [VIEWS.SETTINGS]: <SettingsView />,
        [VIEWS.CHATS]: <ChatsView />,
        [VIEWS.RUN]: <RunView />,
        [VIEWS.CHATBOT]: <ChatbotView />, // ✅ Added
        [VIEWS.EDITOR]: <div>Editor Placeholder</div>, // ✅ Placeholder for EDITOR
        [VIEWS.CHAT]: <div>Chat Placeholder</div>, // ✅ Placeholder for CHAT
    });

    const [viewIcons] = useState<Record<VIEWS, JSX.Element>>({
        [VIEWS.FILES]: <LuFiles size={28} />,
        [VIEWS.CLIENTS]: <PiUsers size={30} />,
        [VIEWS.SETTINGS]: <IoSettingsOutline size={28} />,
        [VIEWS.CHATS]: <PiChats size={30} />,
        [VIEWS.RUN]: <PiPlay size={28} />,
        [VIEWS.CHATBOT]: <FaRobot size={28} />, // ✅ Added Chatbot Icon
        [VIEWS.EDITOR]: <IoCodeSlash size={28} />, // ✅ Added Editor Icon
        [VIEWS.CHAT]: <PiChats size={28} />, // ✅ Added Chat Icon
    });

    return (
        <ViewContext.Provider
            value={{
                activeView,
                setActiveView,
                isSidebarOpen,
                setIsSidebarOpen,
                viewComponents,
                viewIcons,
            }}
        >
            {children}
        </ViewContext.Provider>
    );
}

export { ViewContextProvider };
export default ViewContext;
