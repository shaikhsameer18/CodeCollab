// import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, FolderOpen } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { v4 as uuidV4 } from 'uuid'
// import cn from 'classnames'

import FileStructureView from '@/components/files/FileStructureView'
import { useFileSystem } from '@/context/FileContext'
import useResponsive from '@/hooks/useResponsive'
import { FileSystemItem } from '@/types/file'

export default function FilesView() {
    const { downloadFilesAndFolders, updateDirectory } = useFileSystem()
    const { viewHeight, minHeightReached } = useResponsive()

    const handleOpenDirectory = async () => {
        if ('showDirectoryPicker' in window) {
            try {
                const directoryHandle = await window.showDirectoryPicker()
                toast.loading('Getting files and folders...')
                const structure = await readDirectory(directoryHandle)
                updateDirectory('', structure)
                toast.success('Files and folders loaded successfully')
            } catch (error) {
                console.error('Error opening directory:', error)
                toast.error('Failed to open directory')
            }
        } else {
            toast.error('The File System Access API is not supported in this browser.')
        }
    }

    const readDirectory = async (
        directoryHandle: FileSystemDirectoryHandle
    ): Promise<FileSystemItem[]> => {
        const children: FileSystemItem[] = []
        const blackList = ['node_modules', '.git', '.vscode', '.next']

        for await (const entry of directoryHandle.values()) {
            if (blackList.includes(entry.name)) continue

            if (entry.kind === 'file') {
                const file = await entry.getFile()
                children.push({
                    id: uuidV4(),
                    name: entry.name,
                    type: 'file',
                    content: await file.text(),
                })
            } else if (entry.kind === 'directory') {
                children.push({
                    id: uuidV4(),
                    name: entry.name,
                    type: 'directory',
                    children: await readDirectory(entry),
                    isOpen: false,
                })
            }
        }
        return children
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 p-6 bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-xl"
            style={{ height: viewHeight, maxHeight: viewHeight }}
        >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Files
            </h2>
            <FileStructureView />
            <AnimatePresence>
                {!minHeightReached && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-2 pt-4 border-t border-gray-700"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-start w-full p-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                            onClick={handleOpenDirectory}
                        >
                            <FolderOpen className="mr-2" size={20} />
                            Open File/Folder
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center justify-start w-full p-3 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
                            onClick={downloadFilesAndFolders}
                        >
                            <Archive className="mr-2" size={20} />
                            Download Code
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}