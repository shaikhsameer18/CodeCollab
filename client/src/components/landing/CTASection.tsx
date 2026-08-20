import { FiArrowUp } from "react-icons/fi"

export default function CTASection() {
    const scrollToJoin = () => {
        document.getElementById("join")?.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    return (
        <section className="relative border-t border-darkTertiary/40 py-24">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-teal-500/[0.04]" />
            <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
                <h2 className="font-editorial text-3xl font-medium leading-tight text-white sm:text-4xl">
                    Your next session is one link away.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-gray-400">
                    Pick a room ID, share it, and start coding — the room stays open
                    for as long as someone's in it.
                </p>
                <button
                    onClick={scrollToJoin}
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-600 to-teal-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:shadow-glow"
                >
                    <FiArrowUp className="rotate-[-45deg]" /> Create a room
                </button>
            </div>
        </section>
    )
}
