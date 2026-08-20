import { motion } from "framer-motion"
import FormComponent from "@/components/forms/FormComponent"
import LiveEditorDemo from "@/components/landing/LiveEditorDemo"

export default function Hero() {
    return (
        <section id="top" className="relative overflow-hidden pt-16 md:pt-20">
            {/* Ambient light field */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-24 right-0 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
                <div className="absolute top-40 -left-24 h-80 w-80 rounded-full bg-primary-500/10 blur-3xl" />
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
            </div>

            <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-10 md:grid-cols-2 md:items-center md:px-8 md:pb-28 md:pt-16">
                {/* Copy + join form */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-teal-300">
                        Real-time · Browser-only · Free
                    </span>

                    <h1 className="mt-6 font-editorial text-[2.6rem] font-medium leading-[1.08] tracking-tight text-white sm:text-6xl">
                        Same file.
                        <br />
                        Same second.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-400">
                            Every cursor, live.
                        </span>
                    </h1>

                    <p className="mt-6 max-w-md text-lg leading-relaxed text-gray-400">
                        Open a room and share the link — your team's edits land instantly,
                        with a whiteboard, an AI pair programmer, and one-click GitHub
                        pushes built in. Nobody installs anything.
                    </p>

                    <div id="join" className="mt-8 scroll-mt-24">
                        <FormComponent />
                    </div>
                </motion.div>

                {/* Signature: live multiplayer demo */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                    className="flex justify-center md:justify-end"
                >
                    <LiveEditorDemo />
                </motion.div>
            </div>
        </section>
    )
}
