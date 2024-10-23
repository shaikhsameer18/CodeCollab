import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function ConnectionStatusPage() {
    return (
        <div className="flex h-screen min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
            <ConnectionError />
        </div>
    )
}

function ConnectionError() {
    const navigate = useNavigate()

    const reloadPage = () => {
        window.location.reload()
    }

    const gotoHomePage = () => {
        navigate("/")
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-2xl backdrop-blur-sm"
        >
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
                Connection Error
            </h1>
            <p className="text-xl font-medium text-gray-300 mb-8">
                Oops! Something went wrong. Please try again.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold transition duration-300 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    onClick={reloadPage}
                >
                    Try Again
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-3 rounded-md bg-gray-700 text-white font-semibold transition duration-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    onClick={gotoHomePage}
                >
                    Go to HomePage
                </motion.button>
            </div>
        </motion.div>
    )
}