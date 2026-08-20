import Navbar from "@/components/landing/Navbar"
import Hero from "@/components/landing/Hero"
import HowItWorks from "@/components/landing/HowItWorks"
import FeatureBento from "@/components/landing/FeatureBento"
import TechStrip from "@/components/landing/TechStrip"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/common/Footer"

export default function HomePage() {
    return (
        <div className="min-h-screen w-full bg-dark">
            <Navbar />
            <main>
                <Hero />
                <HowItWorks />
                <FeatureBento />
                <TechStrip />
                <CTASection />
            </main>
            <Footer />
        </div>
    )
}
