import { VIEWS } from "@/types/view";
import cn from "classnames";

interface ViewButtonProps {
    viewName: VIEWS; // ✅ Ensuring `viewName` is always from `VIEWS`
    icon: JSX.Element;
    isActive: boolean;
    onClick: () => void;
}

const SidebarButton = ({ viewName, icon, isActive, onClick }: ViewButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "relative flex items-center justify-center p-2 rounded-md transition-colors duration-200",
                {
                    "bg-gray-700": isActive, // ✅ Active state styling
                    "hover:bg-gray-700": !isActive,
                }
            )}
            aria-label={`Toggle ${viewName} view`}
        >
            {icon}
        </button>
    );
};

export default SidebarButton;
