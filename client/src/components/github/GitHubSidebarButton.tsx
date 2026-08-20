import React from 'react';
import { FaGithub } from 'react-icons/fa';
import { useGitHub } from '../../context/GitHubContext';

interface GitHubSidebarButtonProps {
    onClick: () => void;
}

const GitHubSidebarButton: React.FC<GitHubSidebarButtonProps> = ({ onClick }) => {
    const { isAuthenticated, user } = useGitHub();

    return (
        <button
            onClick={onClick}
            className="relative flex items-center justify-center p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-darkTertiary/40 transition-all duration-200 group"
            title={isAuthenticated ? `Signed in as ${user?.login}` : 'Connect to GitHub'}
            aria-label={isAuthenticated ? `Signed in as ${user?.login}` : 'Connect to GitHub'}
        >
            <FaGithub size={22} />
            {isAuthenticated && user?.avatar_url && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full overflow-hidden border-2 border-darkSecondary">
                    <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <span className="pointer-events-none absolute left-full ml-2 px-2 py-1 bg-darkTertiary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 hidden md:block">
                {isAuthenticated ? 'GitHub settings' : 'Connect to GitHub'}
            </span>
        </button>
    );
};

export default GitHubSidebarButton; 