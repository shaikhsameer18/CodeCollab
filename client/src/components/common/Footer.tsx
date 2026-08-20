import { FiGithub } from "react-icons/fi"

export default function Footer() {
    return (
        <footer className="border-t border-darkTertiary/40 bg-dark">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-teal-500">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
                            <polyline points="16 18 22 12 16 6" />
                            <polyline points="8 6 2 12 8 18" />
                        </svg>
                    </div>
                    <span className="font-editorial text-sm font-medium text-gray-300">
                        CodeCollab
                    </span>
                </div>

                <p className="text-sm text-gray-500">
                    Built by{" "}
                    <a
                        href="https://github.com/shaikhsameer18"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 underline underline-offset-2 transition-colors hover:text-teal-300"
                    >
                        shaikhsameer18
                    </a>
                </p>

                <a
                    href="https://github.com/shaikhsameer18/CodeCollabFinal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-white"
                >
                    <FiGithub size={15} /> Source on GitHub
                </a>
            </div>
        </footer>
    )
}
