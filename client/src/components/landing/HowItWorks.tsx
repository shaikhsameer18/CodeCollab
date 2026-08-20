import { motion } from "framer-motion"
import { FiLink2, FiSend, FiCode } from "react-icons/fi"

const STEPS = [
    {
        n: "01",
        icon: FiLink2,
        title: "Create a room",
        body: "Hit “generate” for a room ID, or make up your own. No account, no install.",
    },
    {
        n: "02",
        icon: FiSend,
        title: "Send the link",
        body: "Drop the URL in Slack, Discord, or a classroom chat. Anyone who opens it is in.",
    },
    {
        n: "03",
        icon: FiCode,
        title: "Build together",
        body: "Edit, run, sketch on the whiteboard, and push to GitHub — all in the same room.",
    },
]

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative border-t border-darkTertiary/40 py-24">
            <div className="mx-auto max-w-7xl px-5 md:px-8">
                <div className="mb-16 max-w-lg">
                    <span className="font-mono text-xs uppercase tracking-wider text-primary-400">
                        The whole flow
                    </span>
                    <h2 className="mt-3 font-editorial text-3xl font-medium text-white sm:text-4xl">
                        Three steps, one link
                    </h2>
                </div>

                <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
                    {/* Connecting rail, desktop only */}
                    <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-darkTertiary to-transparent md:block" />

                    {STEPS.map((step, i) => (
                        <motion.div
                            key={step.n}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="relative"
                        >
                            <div className="relative z-10 flex items-center gap-3">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-darkTertiary bg-dark">
                                    <step.icon className="h-5 w-5 text-teal-400" />
                                </div>
                                <span className="font-editorial text-2xl text-gray-700">{step.n}</span>
                            </div>
                            <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-400">
                                {step.body}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
