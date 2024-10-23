import { ChangeEvent, useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Play, ChevronDown } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useRunCode } from '@/context/RunCodeContext'
import useResponsive from '@/hooks/useResponsive'

export default function RunView() {
    const { viewHeight } = useResponsive()
    const {
        setInput,
        output,
        isRunning,
        supportedLanguages,
        selectedLanguage,
        setSelectedLanguage,
        runCode,
    } = useRunCode()

    const [inputValue, setInputValue] = useState('')

    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const lang = JSON.parse(e.target.value)
        setSelectedLanguage(lang)
    }

    const copyOutput = () => {
        navigator.clipboard.writeText(output)
        toast.success('Output copied to clipboard')
    }

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        setInput(e.target.value)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4 p-6 bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-xl"
            style={{ height: viewHeight }}
        >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Run Code
            </h2>
            <div className="flex flex-col gap-4 h-full">
                <div className="relative">
                    <select
                        className="w-full p-3 pr-10 bg-gray-800 rounded-md text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={JSON.stringify(selectedLanguage)}
                        onChange={handleLanguageChange}
                    >
                        {supportedLanguages
                            .sort((a, b) => (a.language > b.language ? 1 : -1))
                            .map((lang, i) => (
                                <option key={i} value={JSON.stringify(lang)}>
                                    {lang.language + (lang.version ? ` (${lang.version})` : '')}
                                </option>
                            ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                <textarea
                    className="flex-grow p-3 bg-gray-800 rounded-md text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Write your input here..."
                    value={inputValue}
                    onChange={handleInputChange}
                />
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={runCode}
                    disabled={isRunning}
                >
                    <Play className="mr-2" size={20} />
                    Run
                </motion.button>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-300">Output:</span>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={copyOutput}
                        title="Copy Output"
                        className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors duration-300"
                    >
                        <Copy size={18} className="text-gray-400" />
                    </motion.button>
                </div>
                <div className="flex-grow p-3 bg-gray-800 rounded-md text-white overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{output}</pre>
                </div>
            </div>
        </motion.div>
    )
}