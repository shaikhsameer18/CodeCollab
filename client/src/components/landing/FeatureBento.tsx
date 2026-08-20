import { motion } from "framer-motion"
import { FiGitBranch, FiEdit3, FiPlay, FiUsers, FiCpu } from "react-icons/fi"
import cn from "classnames"

interface Tile {
    title: string
    body: string
    icon: React.ElementType
    span: string
    visual: React.ReactNode
}

function MiniDiff() {
    return (
        <div className="mt-4 rounded-lg border border-darkTertiary/60 bg-dark/60 p-3 font-mono text-[11px] leading-relaxed">
            <div className="text-gray-600">room/mergeSort.ts</div>
            <div className="text-red-400/80">- return arr.sort()</div>
            <div className="text-teal-300">+ return mergeSort(arr)</div>
            <div className="flex items-center gap-1.5 pt-1 text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-400" /> Maya · 2 lines · just now
            </div>
        </div>
    )
}

function MiniCommit() {
    return (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-darkTertiary/60 bg-dark/60 px-3 py-2.5 font-mono text-[11px] text-gray-400">
            <FiGitBranch className="text-primary-400" size={13} />
            <span className="text-gray-300">fix: room sync race</span>
            <span className="ml-auto text-gray-600">main</span>
        </div>
    )
}

function MiniPrompt() {
    return (
        <div className="mt-4 rounded-lg border border-darkTertiary/60 bg-dark/60 p-3 font-mono text-[11px] text-gray-400">
            <span className="text-signal">→</span> "why is this loop O(n²)?"
        </div>
    )
}

const TILES: Tile[] = [
    {
        title: "Real-time sync",
        body: "Every keystroke, cursor, and file-tree change replicates over WebSockets in milliseconds — see exactly where teammates are working.",
        icon: FiUsers,
        span: "md:col-span-2 md:row-span-2",
        visual: <MiniDiff />,
    },
    {
        title: "GitHub, built in",
        body: "Pick a repo, write a message, push. No terminal, no local clone.",
        icon: FiGitBranch,
        span: "md:col-span-1",
        visual: <MiniCommit />,
    },
    {
        title: "AI pair programmer",
        body: "Ask a coding question in the sidebar without leaving the room.",
        icon: FiCpu,
        span: "md:col-span-1",
        visual: <MiniPrompt />,
    },
    {
        title: "Whiteboard mode",
        body: "Flip the same room into a shared canvas for diagrams and architecture sketches, then flip back.",
        icon: FiEdit3,
        span: "md:col-span-2",
        visual: null,
    },
    {
        title: "Run any language",
        body: "Execute the open file against a real runtime and see stdout inline — dozens of languages supported.",
        icon: FiPlay,
        span: "md:col-span-2",
        visual: null,
    },
]

export default function FeatureBento() {
    return (
        <section id="features" className="relative border-t border-darkTertiary/40 py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
                <div className="mb-14 max-w-lg">
                    <span className="font-mono text-xs uppercase tracking-wider text-primary-400">
                        Inside a room
                    </span>
                    <h2 className="mt-3 font-editorial text-3xl font-medium text-white sm:text-4xl">
                        One tab. Everything your team needs.
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[220px]">
                    {TILES.map((tile, i) => (
                        <motion.div
                            key={tile.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl border border-darkTertiary/50 bg-darkSecondary/60 p-6",
                                "transition-colors hover:border-primary-500/30",
                                tile.span,
                            )}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-darkTertiary/60 text-teal-400 transition-colors group-hover:text-primary-400">
                                    <tile.icon size={17} />
                                </div>
                                <h3 className="font-semibold text-white">{tile.title}</h3>
                            </div>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-400">
                                {tile.body}
                            </p>
                            {tile.visual}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
