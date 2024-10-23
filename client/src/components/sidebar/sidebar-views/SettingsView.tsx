import { ChangeEvent, useEffect } from "react"
import { motion } from "framer-motion"
import { RefreshCw, ChevronDown } from "lucide-react"

import Select from "@/components/common/Select"
import { useSettings } from "@/context/SettingContext"
import useResponsive from "@/hooks/useResponsive"
import { editorFonts } from "@/resources/Fonts"
import { editorThemes } from "@/resources/Themes"
import { langNames } from "@uiw/codemirror-extensions-langs"

export default function SettingsView() {
    const {
        theme,
        setTheme,
        language,
        setLanguage,
        fontSize,
        setFontSize,
        fontFamily,
        setFontFamily,
        showGitHubCorner,
        setShowGitHubCorner,
        resetSettings,
    } = useSettings()
    const { viewHeight } = useResponsive()

    const handleFontFamilyChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontFamily(e.target.value)
    const handleThemeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setTheme(e.target.value)
    const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setLanguage(e.target.value)
    const handleFontSizeChange = (e: ChangeEvent<HTMLSelectElement>) =>
        setFontSize(parseInt(e.target.value))
    const handleShowGitHubCornerChange = (e: ChangeEvent<HTMLInputElement>) =>
        setShowGitHubCorner(e.target.checked)

    useEffect(() => {
        const editor = document.querySelector(
            ".cm-editor > .cm-scroller"
        ) as HTMLElement
        if (editor) {
            editor.style.fontFamily = `${fontFamily}, monospace`
        }
    }, [fontFamily])

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 p-6 bg-gray-900 bg-opacity-75 backdrop-blur-md rounded-lg shadow-xl overflow-auto"
            style={{ height: viewHeight }}
        >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                Settings
            </h2>
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <Select
                        onChange={handleFontFamilyChange}
                        value={fontFamily}
                        options={editorFonts}
                        title="Font Family"
                        className="flex-grow w-full sm:w-auto"
                    />
                    <div className="relative w-full sm:w-24">
                        <select
                            value={fontSize}
                            onChange={handleFontSizeChange}
                            className="w-full appearance-none bg-gray-800 text-white rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-6"
                            title="Font Size"
                        >
                            {[...Array(13).keys()].map((size) => (
                                <option key={size} value={size + 12}>
                                    {size + 12}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none mt-3" size={16} />
                    </div>
                </div>
                <Select
                    onChange={handleThemeChange}
                    value={theme}
                    options={Object.keys(editorThemes)}
                    title="Theme"
                />
                <Select
                    onChange={handleLanguageChange}
                    value={language}
                    options={langNames}
                    title="Language"
                />
                <div className="flex items-center justify-between">
                    <span className="text-gray-300">Show GitHub corner</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            onChange={handleShowGitHubCornerChange}
                            checked={showGitHubCorner}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-auto flex items-center justify-center p-3 bg-gray-800 rounded-md text-white hover:bg-gray-700 transition-colors duration-300"
                onClick={resetSettings}
            >
                <RefreshCw className="mr-2" size={20} />
                Reset to default
            </motion.button>
        </motion.div>
    )
}