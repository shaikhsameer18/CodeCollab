const STACK = [
    "React",
    "TypeScript",
    "Socket.io",
    "CodeMirror",
    "tldraw",
    "GitHub API",
    "Piston runtime",
]

export default function TechStrip() {
    return (
        <section className="border-t border-darkTertiary/40 py-14">
            <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 md:flex-row md:justify-between md:px-8">
                <span className="font-mono text-xs uppercase tracking-wider text-gray-600">
                    Built on tools you already trust
                </span>
                <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                    {STACK.map((name) => (
                        <li key={name} className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                            {name}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
