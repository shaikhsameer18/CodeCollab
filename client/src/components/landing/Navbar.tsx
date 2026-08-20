import { FiGithub } from "react-icons/fi"

function LogoMark() {
    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-teal-500 shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5 text-white">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        </div>
    )
}

export default function Navbar() {
    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    return (
        <header className="sticky top-0 z-40 border-b border-darkTertiary/40 bg-dark/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
                <a href="#top" className="flex items-center gap-2.5">
                    <LogoMark />
                    <span className="font-editorial text-lg font-semibold tracking-tight text-white">
                        CodeCollab
                    </span>
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    <button onClick={() => scrollTo("how-it-works")} className="text-sm text-gray-400 transition-colors hover:text-white">
                        How it works
                    </button>
                    <button onClick={() => scrollTo("features")} className="text-sm text-gray-400 transition-colors hover:text-white">
                        Features
                    </button>
                    <a
                        href="https://github.com/shaikhsameer18/CodeCollabFinal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
                    >
                        <FiGithub size={15} /> GitHub
                    </a>
                </nav>

                <button
                    onClick={() => scrollTo("join")}
                    className="rounded-lg bg-gradient-to-r from-primary-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-glow"
                >
                    Launch workspace
                </button>
            </div>
        </header>
    )
}
