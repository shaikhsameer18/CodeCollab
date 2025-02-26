export enum VIEWS {
    FILES = "FILES",
    CHATS = "CHATS",
    CLIENTS = "CLIENTS",
    RUN = "RUN",
    SETTINGS = "SETTINGS",
    EDITOR = "EDITOR",
    CHAT = "CHAT",
    CHATBOT = "CHATBOT",
}

// ✅ Separate Enum for Sidebar Views (Prevents Type Errors)
export const SIDEBAR_VIEWS: VIEWS[] = [
    VIEWS.FILES,
    VIEWS.CHATS,
    VIEWS.CLIENTS,
    VIEWS.RUN,
    VIEWS.SETTINGS,
    VIEWS.CHATBOT,
];

interface ViewContext {
    activeView: VIEWS;
    setActiveView: (activeView: VIEWS) => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isSidebarOpen: boolean) => void;
    viewComponents: Record<VIEWS, JSX.Element>;
    viewIcons: Record<VIEWS, JSX.Element>;
}

export { ViewContext };
