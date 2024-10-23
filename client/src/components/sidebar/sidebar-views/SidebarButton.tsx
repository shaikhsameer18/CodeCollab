import { useChatRoom } from "@/context/ChatContext"
import { useViews } from "@/context/ViewContext"
import { VIEWS } from "@/types/view"
import cn from "classnames"

interface ViewButtonProps {
    viewName: VIEWS
    icon: JSX.Element
}

const ViewButton = ({ viewName, icon }: ViewButtonProps) => {
    const { activeView, setActiveView, isSidebarOpen, setIsSidebarOpen } =
        useViews()
    const { isNewMessage } = useChatRoom()

    const handleViewClick = () => {
        if (viewName === activeView) {
            setIsSidebarOpen(!isSidebarOpen)
        } else {
            setIsSidebarOpen(true)
            setActiveView(viewName)
        }
    }

    return (
        <button
            onClick={handleViewClick}
            className={cn(
                "relative flex items-center justify-center p-2 rounded-md transition-colors duration-200",
                {
                    "bg-gray-700": activeView === viewName,
                    "hover:bg-gray-700": activeView !== viewName,
                }
            )}
            aria-label={`Toggle ${viewName} view`}
        >
            {icon}
            {viewName === VIEWS.CHATS && isNewMessage && (
                <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-primary" aria-hidden="true" />
            )}
        </button>
    )
}

export default ViewButton