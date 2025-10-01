"use client";

import { useState} from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight} from "lucide-react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { useRouter } from "next/navigation"
import Image from "next/image"

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
    const router = useRouter()
    const [isloading, setIsLoading] = useState(true);


    const handleVideoLoaded = () => {
        setIsLoading(false);
    }


    useGSAP(() => {
        gsap.set('#video-frame', {
            clipPath: "polygon(14% 0, 72% 0, 90% 90%, 0 100%)",
            borderRadius: '0 0 40% 10%'
        })

        gsap.from("#video-frame", {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            borderRadius: "0% 0% 0% 0%",
            ease: "power1.inOut",
            scrollTrigger: {
                trigger: "#video-frame",
                start: "center center",
                end: "bottom center",
                scrub: true,
            },
        });
    })

    // Animate hero text
    useGSAP(() => {
        const tl = gsap.timeline()

        tl.from(".hero-title", {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.5
        })
            .from(".hero-subtitle", {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5")
            .from(".hero-cta", {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power3.out"
            }, "-=0.5")
    })

    return (
        <div className="relative h-dvh w-screen overflow-hidden">
            {isloading && (
                <div className="flex items-center justify-center absolute h-dvh w-screen z-[100] overflow-hidden bg-background">
                    <div className="three-body">
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                        <div className="three-body__dot"></div>
                    </div>
                </div>
            )}

            <div id="video-frame" className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg">
                <div>
                    <video
                        src="./videos/hero-4.mp4"
                        autoPlay
                        loop
                        muted
                        className="absolute left-0 top-0 size-full object-cover object-center brightness-75"
                        onLoadedData={handleVideoLoaded}
                    />
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/10 z-20" />

                {/* Hero Content */}
                <div className="absolute left-0 top-0 z-40 size-full flex items-center">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                        <div className="max-w-4xl">
                            <h1 className="hero-title text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6">
                                Find Your Perfect
                                <span className="block text-primary mt-2">Dream Car</span>
                            </h1>

                            <p className="hero-subtitle text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mb-8">
                                Discover premium vehicles for rent or purchase. Experience luxury, performance, and style in every journey.
                            </p>

                            <div className="hero-cta flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base sm:text-lg px-8 py-6"
                                    onClick={() => router.push('/cars')}
                                >
                                    <Image
                                          src="/logocar.png"
                                          alt="CarZone Logo"
                                          width={75}
                                          height={40}
                                          className="object-contain"
                                        />
                                    Browse All Cars
                                    <ArrowRight className="h-5 w-5" />
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground text-base sm:text-lg px-8 py-6"
                                    onClick={() => {
                                        const element = document.getElementById('featured-cars');
                                        element?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    View Featured
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom decorative text */}
            <div className="special-font hero-heading z-10 absolute bottom-5 right-5 text-primary/90 text-2xl sm:text-4xl md:text-7xl pointer-events-none">
                C<b>a</b>rZ<b>o</b>ne
            </div>
        </div>
    )
}

export default Hero