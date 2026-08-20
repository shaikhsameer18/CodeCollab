import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { GitHubUser, GitHubRepo, CreateRepoParams } from '../types/github';

interface GitHubContextType {
    isAuthenticated: boolean;
    user: GitHubUser | null;
    loading: boolean;
    error: string | null;
    repos: GitHubRepo[];
    login: (roomId?: string) => void;
    logout: () => void;
    createRepo: (params: CreateRepoParams) => Promise<GitHubRepo>;
    commitAndPush: (message: string, repoUrl: string, files?: string[], fileContents?: Record<string, string>) => Promise<void>;
    createAndPushRepo: (params: CreateRepoParams, message: string, files?: string[], fileContents?: Record<string, string>) => Promise<GitHubRepo>;
    refreshUser: () => Promise<void>;
    getChangedFiles: () => Promise<Array<{path: string, status: string}>>;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export const useGitHub = () => {
    const context = useContext(GitHubContext);
    if (!context) {
        throw new Error('useGitHub must be used within a GitHubProvider');
    }
    return context;
};

interface GitHubProviderProps {
    children: ReactNode;
}

export const GitHubProvider: React.FC<GitHubProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<GitHubUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [repos, setRepos] = useState<GitHubRepo[]>([]);

    const login = (roomId?: string) => {
        if (roomId) {
            sessionStorage.setItem('returnRoomId', roomId);
        }
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/github`;
    };

    const logout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/logout`,
                {},
                { withCredentials: true }
            );
            setIsAuthenticated(false);
            setUser(null);
            setRepos([]);
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const commitAndPush = async (message: string, repoUrl: string, files?: string[], fileContents?: Record<string, string>) => {
        try {
            console.log(`Committing ${files?.length || 0} files to ${repoUrl}`);
            if (!files?.length) {
                throw new Error('No files selected for commit');
            }
            
            // Log file names for debugging
            console.log(`Files to commit: ${files.join(', ')}`);
            console.log(`File contents available for: ${fileContents ? Object.keys(fileContents).join(', ') : 'none'}`);
            
            // Validate file contents
            if (!fileContents) {
                throw new Error('No file contents provided');
            }
            
            const missingContents = files.filter(file => !fileContents[file]);
            if (missingContents.length > 0) {
                console.warn(`Missing contents for files: ${missingContents.join(', ')}`);
                // Still proceed, the server will handle empty files
            }
            
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/commit-push`,
                { message, repoUrl, files, fileContents },
                { withCredentials: true }
            );
            
            console.log('Commit and push successful', response.data);
            
            return response.data;
        } catch (err) {
            console.error('Commit and push error:', err);
            throw err;
        }
    };

    const refreshUser = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/profile`,
                { withCredentials: true }
            );
            setUser(response.data);
            setIsAuthenticated(true);
            setError(null);
        } catch (err) {
            setIsAuthenticated(false);
            setUser(null);
            setError('Failed to fetch user profile');
            console.error('Error fetching profile:', err);
        }
    };

    const createRepo = async (params: CreateRepoParams): Promise<GitHubRepo> => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/create-repo`,
                params,
                { withCredentials: true }
            );
            const newRepo = response.data;
            setRepos((prevRepos) => [...prevRepos, newRepo]);
            return newRepo;
        } catch (err) {
            setError('Failed to create repository');
            throw err;
        }
    };

    const createAndPushRepo = async (params: CreateRepoParams, message: string, files?: string[], fileContents?: Record<string, string>): Promise<GitHubRepo> => {
        try {
            console.log(`Creating repository "${params.name}" with ${files?.length || 0} files`);
            if (!files?.length) {
                throw new Error('No files selected for initial commit');
            }
            
            // Log file names for debugging
            console.log(`Files to commit: ${files.join(', ')}`);
            console.log(`File contents available for: ${fileContents ? Object.keys(fileContents).join(', ') : 'none'}`);
            
            // Validate file contents
            if (!fileContents) {
                throw new Error('No file contents provided');
            }
            
            const missingContents = files.filter(file => !fileContents[file]);
            if (missingContents.length > 0) {
                console.warn(`Missing contents for files: ${missingContents.join(', ')}`);
                // Still proceed, the server will handle empty files
            }
            
            // Use the new single endpoint to create a repo and push code
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/create-and-push`,
                { 
                    repository: params,
                    message,
                    files,
                    fileContents
                },
                { withCredentials: true }
            );
            
            console.log('Repository created successfully', response.data);
            
            const repo = response.data.repository;
            setRepos((prevRepos) => [...prevRepos, repo]);
            return repo;
        } catch (err) {
            console.error('Failed to create repository and push changes:', err);
            setError('Failed to create repository and push changes');
            throw err;
        }
    };

    const getChangedFiles = async (): Promise<Array<{path: string, status: string}>> => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/auth/github/changed-files`,
                { withCredentials: true }
            );
            return response.data.files || [];
        } catch (err) {
            console.error('Error getting changed files:', err);
            return [];
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await refreshUser();
            } catch (err) {
                console.error('Error checking auth:', err);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const value = {
        isAuthenticated,
        user,
        loading,
        error,
        repos,
        login,
        logout,
        createRepo,
        commitAndPush,
        createAndPushRepo,
        refreshUser,
        getChangedFiles,
    };

    return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>;
};

export default GitHubContext; 