import { useEffect, useState } from 'react'
import FormComponent from "@/components/forms/FormComponent"
import { motion } from "framer-motion"
import { Highlight, themes } from "prism-react-renderer"

export default function HomePage() {
    const [mounted, setMounted] = useState(false)
    const [text, setText] = useState("")
    const fullText = `function codeCollab() {
  const collaboration = "Seamless";
  const coding = "Efficient";
  return \`\${collaboration} & \${coding} Coding\`;
}

// Join a room to start collaborating!
codeCollab();`

    useEffect(() => {
        setMounted(true)
        if (mounted) {
            let i = 0
            const typingInterval = setInterval(() => {
                setText(fullText.slice(0, i))
                i++
                if (i > fullText.length) {
                    clearInterval(typingInterval)
                }
            }, 50)
            return () => clearInterval(typingInterval)
        }
    }, [mounted])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex flex-col items-center justify-center p-4 sm:p-8">
            <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-evenly gap-12 bg-gray-800 bg-opacity-50 rounded-2xl shadow-2xl p-7 backdrop-blur-sm"
            >
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 text-center">
                        Code Collab Editor
                    </h1>
                    <div className="w-full max-w-md aspect-video bg-gray-900 rounded-lg shadow-inner overflow-hidden">
                        <Highlight theme={themes.nightOwl} code={text} language="javascript">
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                <pre className={`${className} p-4 text-sm md:text-base font-mono whitespace-pre-wrap overflow-auto h-full`} style={style}>
                                    {tokens.map((line, i) => (
                                        <div key={i} {...getLineProps({ line, key: i })}>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token, key })} />
                                            ))}
                                        </div>
                                    ))}
                                </pre>
                            )}
                        </Highlight>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <FormComponent />
                </div>
            </motion.main>
        </div>
    )
}