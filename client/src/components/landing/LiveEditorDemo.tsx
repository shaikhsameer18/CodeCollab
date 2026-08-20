import { useEffect, useState } from "react"
import { Highlight, themes } from "prism-react-renderer"

/**
 * The hero's signature element: a simulated multiplayer editing session.
 * This isn't decorative chrome around the pitch — it *is* the pitch. Three
 * collaborators type different lines of the same file at once, which is
 * the one thing CodeCollab actually does that a screenshot can't convey.
 */

interface Collaborator {
    name: string
    color: string // tailwind text/bg color token
    dot: string
}

const COLLABORATORS: Collaborator[] = [
    { name: "You", color: "text-primary-300", dot: "bg-primary-400" },
    { name: "Maya", color: "text-teal-300", dot: "bg-teal-400" },
    { name: "Theo", color: "text-signal", dot: "bg-signal" },
]

// Each line is "typed" by one collaborator, in this order, looping.
const LINES: { text: string; by: 0 | 1 | 2 }[] = [
    { text: "function mergeRoomState(local, incoming) {", by: 0 },
    { text: "  // Maya is editing the diff resolver", by: 1 },
    { text: "  const patch = diff(local.files, incoming.files)", by: 1 },
    { text: "", by: 0 },
    { text: "  broadcast(SocketEvent.SYNC_FILE_STRUCTURE, patch)", by: 0 },
    { text: "", by: 0 },
    { text: "  // Theo just joined room #a53f — syncing now", by: 2 },
    { text: "  return applyPatch(local, patch)", by: 2 },
    { text: "}", by: 0 },
]

const CHAR_MS = 18
const LINE_PAUSE_MS = 260
const LOOP_PAUSE_MS = 2200

export default function LiveEditorDemo() {
    const [lineIndex, setLineIndex] = useState(0)
    const [charIndex, setCharIndex] = useState(0)
    const [reduceMotion, setReduceMotion] = useState(false)

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReduceMotion(mq.matches)
        const listener = () => setReduceMotion(mq.matches)
        mq.addEventListener("change", listener)
        return () => mq.removeEventListener("change", listener)
    }, [])

    useEffect(() => {
        if (reduceMotion) return

        const currentLine = LINES[lineIndex]
        const atLineEnd = charIndex >= currentLine.text.length

        const timer = setTimeout(
            () => {
                if (!atLineEnd) {
                    setCharIndex((c) => c + 1)
                    return
                }
                if (lineIndex < LINES.length - 1) {
                    setLineIndex((l) => l + 1)
                    setCharIndex(0)
                } else {
                    setLineIndex(0)
                    setCharIndex(0)
                }
            },
            atLineEnd
                ? lineIndex === LINES.length - 1
                    ? LOOP_PAUSE_MS
                    : LINE_PAUSE_MS
                : CHAR_MS,
        )

        return () => clearTimeout(timer)
    }, [charIndex, lineIndex, reduceMotion])

    const activeBy = LINES[lineIndex].by
    const activeCollaborator = COLLABORATORS[activeBy]

    const renderedLines = LINES.map((line, i) => {
        if (reduceMotion) return line.text
        if (i < lineIndex) return line.text
        if (i === lineIndex) return line.text.slice(0, charIndex)
        return ""
    })
    const fullSource = renderedLines.join("\n")

    return (
        <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-darkTertiary/60 bg-darkSecondary/90 shadow-2xl shadow-black/40 backdrop-blur-xl">
            {/* Window chrome + file tabs */}
            <div className="flex items-center justify-between border-b border-darkTertiary/50 bg-darkTertiary/30 px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <span className="ml-2 rounded bg-darkPrimary/60 px-2.5 py-1 font-mono text-xs text-primary-300 ring-1 ring-primary-500/20">
                        room.ts
                    </span>
                </div>

                {/* Presence stack */}
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {COLLABORATORS.map((c) => (
                            <span
                                key={c.name}
                                title={c.name}
                                className={`flex h-6 w-6 items-center justify-center rounded-full ${c.dot} text-[10px] font-semibold text-darkPrimary ring-2 ring-darkSecondary`}
                            >
                                {c.name[0]}
                            </span>
                        ))}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
                        </span>
                        live
                    </span>
                </div>
            </div>

            {/* Code body */}
            <div className="relative px-1 py-4">
                <Highlight theme={themes.nightOwl} code={fullSource} language="javascript">
                    {({ className, style, tokens, getLineProps, getTokenProps }) => (
                        <pre className={`${className} px-3 text-[13px] leading-relaxed md:text-sm`} style={{ ...style, background: "transparent" }}>
                            {tokens.map((line, i) => {
                                const isActive = !reduceMotion && i === lineIndex
                                const isBeingTyped = isActive && charIndex < LINES[i].text.length
                                const by = COLLABORATORS[LINES[i]?.by ?? 0]
                                return (
                                    <div
                                        key={i}
                                        {...getLineProps({ line, key: i })}
                                        className={`relative flex gap-4 rounded px-2 ${isActive ? "bg-white/[0.03]" : ""}`}
                                    >
                                        <span className="select-none text-gray-600">{i + 1}</span>
                                        <span className="flex-1">
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token, key })} />
                                            ))}
                                            {isBeingTyped && (
                                                <span
                                                    className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-caret-blink ${by.dot}`}
                                                />
                                            )}
                                        </span>
                                        {isBeingTyped && by.name !== "You" && (
                                            <span
                                                className={`absolute -right-1 top-0 -translate-y-1/2 translate-x-full whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-medium ${by.color} bg-darkTertiary ring-1 ring-white/10 hidden lg:block`}
                                            >
                                                {by.name}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </pre>
                    )}
                </Highlight>
            </div>

            {/* Status strip */}
            <div className="flex items-center justify-between border-t border-darkTertiary/50 bg-darkTertiary/20 px-4 py-2 font-mono text-[11px] text-gray-500">
                <span>
                    <span className={activeCollaborator.color}>{activeCollaborator.name}</span> is editing
                </span>
                <span>JavaScript · UTF-8</span>
            </div>
        </div>
    )
}
