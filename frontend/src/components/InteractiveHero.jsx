import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import QrPreview from "./QrPreview.jsx";

const demoSteps = [
    {
        title: "Customer scans QR code",
        description: "No app downloads, works instantly",
        emoji: "📱",
        color: "from-blue-400 to-blue-600"
    },
    {
        title: "Beautiful menu loads",
        description: "Mobile-optimized, easy to read",
        emoji: "🍽️",
        color: "from-green-400 to-green-600"
    },
    {
        title: "You update prices instantly",
        description: "Changes go live immediately",
        emoji: "⚡",
        color: "from-purple-400 to-purple-600"
    },
    {
        title: "Same QR, fresh menu",
        description: "No reprinting ever again",
        emoji: "♻️",
        color: "from-amber-400 to-amber-600"
    }
];

const mockMenuUpdate = [
    { item: "Margherita Pizza", oldPrice: "$16.99", newPrice: "$18.99" },
    { item: "Caesar Salad", oldPrice: "$12.99", newPrice: "$13.99" },
    { item: "Craft Beer", oldPrice: "$6.99", newPrice: "$7.99" }
];

export default function InteractiveHero() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPriceUpdate, setShowPriceUpdate] = useState(false);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % demoSteps.length);

            // Show price update animation on step 2
            if (currentStep === 2) {
                setShowPriceUpdate(true);
                setTimeout(() => setShowPriceUpdate(false), 2000);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isPlaying, currentStep]);

    const resetDemo = () => {
        setCurrentStep(0);
        setShowPriceUpdate(false);
        setIsPlaying(true);
    };

    return (
        <section className="relative px-8 md:px-16 lg:px-32 py-24 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#702632]/10 via-transparent to-[#F3C77E]/10 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="fade-in-bottom"
                    >
                        {/* Urgency badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F3C77E]/20 to-[#d6a856]/20 border border-[#F3C77E]/30 rounded-full px-4 py-2 mb-6"
                        >
                            <span className="w-2 h-2 bg-[#F3C77E] rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-[#F3C77E]">
                                🔥 Founders Pricing - Lock in $9/mo forever
                            </span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                            Scandish — <span className="bg-gradient-to-r from-[#F3C77E] via-[#d6a856] to-[#F3C77E] bg-clip-text text-transparent">Instant QR Menus</span>
                        </h1>

                        <p className="text-lg md:text-xl text-[#d6d6d6] mb-8 leading-relaxed">
                            Edit your menu in seconds. No PDFs, no designers. Just{" "}
                            <span className="text-[#F3C77E] font-medium">scan & serve</span> with a modern QR code menu that updates instantly.
                        </p>

                        {/* Value props with animations */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {[
                                { icon: "💰", text: "Save $200+/month on printing" },
                                { icon: "⚡", text: "Updates in 5 seconds" },
                                { icon: "📱", text: "Works on any phone" },
                                { icon: "🚀", text: "Setup in 10 minutes" }
                            ].map((prop, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1) }}
                                    className="flex items-center gap-3 text-[#d6d6d6]"
                                >
                                    <span className="text-xl">{prop.icon}</span>
                                    <span className="text-sm">{prop.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                to="/login"
                                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-[#F3C77E] via-[#d6a856] to-[#F3C77E] text-[#080705] font-bold text-lg transition-all duration-300 shadow-lg shadow-[#F3C77E]/25 hover:shadow-[#F3C77E]/40 hover:scale-105 overflow-hidden"
                            >
                                <span className="relative z-10">Get Started Now</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-[#d6a856]/30 to-[#F3C77E]/30 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>
                            <button
                                onClick={resetDemo}
                                className="group relative px-6 py-4 rounded-xl border border-[#F3C77E] text-[#F3C77E] hover:bg-[#F3C77E] hover:text-[#080705] transition-all duration-300 font-semibold flex items-center gap-2"
                            >
                                <Play size={18} className="group-hover:animate-bounce" />
                                Watch Demo
                            </button>
                            <Link
                                to="/demo"
                                className="group relative px-6 py-4 rounded-xl border border-[#702632] text-[#702632] hover:bg-[#702632] hover:text-white transition-all duration-300 font-semibold flex items-center gap-2"
                            >
                                <span>👀</span>
                                See Live Menu
                            </Link>
                        </motion.div>

                        {/* Trust line */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-sm text-[#a7a7a7] mt-6 flex items-center gap-2"
                        >
                            <span className="text-[#F3C77E]">✓</span>
                            Setup in 5 minutes • Cancel anytime • 30-day money-back guarantee
                        </motion.p>
                    </motion.div>

                    {/* Right - Interactive Demo */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        {/* Demo container */}
                        <div className="relative bg-[#0f0e0c]/80 backdrop-blur-xl border border-[#40434E]/40 rounded-3xl p-8 shadow-2xl shadow-black/50">
                            {/* Demo controls */}
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-[#F3C77E]">Live Demo</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className="p-2 rounded-lg bg-[#40434E]/20 text-[#F3C77E] hover:bg-[#40434E]/30 transition-colors"
                                    >
                                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <button
                                        onClick={resetDemo}
                                        className="p-2 rounded-lg bg-[#40434E]/20 text-[#F3C77E] hover:bg-[#40434E]/30 transition-colors"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Animated demo steps */}
                            <div className="space-y-6">
                                {demoSteps.map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0.3, scale: 0.95 }}
                                        animate={{
                                            opacity: currentStep === idx ? 1 : 0.3,
                                            scale: currentStep === idx ? 1 : 0.95
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className={`relative p-4 rounded-xl border transition-all duration-500 ${currentStep === idx
                                            ? 'border-[#F3C77E]/50 bg-[#F3C77E]/5'
                                            : 'border-[#40434E]/30 bg-[#40434E]/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xl shadow-lg`}>
                                                {step.emoji}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-[#FFFFFA] mb-1">{step.title}</h4>
                                                <p className="text-sm text-[#a7a7a7]">{step.description}</p>
                                            </div>
                                        </div>

                                        {/* Active step indicator */}
                                        {currentStep === idx && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 3, ease: "linear" }}
                                                className="absolute bottom-0 left-0 h-1 bg-[#F3C77E] rounded-b-xl"
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Live price update simulation */}
                            <AnimatePresence>
                                {showPriceUpdate && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                        className="absolute inset-4 bg-[#080705]/95 backdrop-blur-xl border border-[#F3C77E]/50 rounded-2xl p-6 shadow-2xl"
                                    >
                                        <div className="text-center">
                                            <h4 className="text-lg font-bold text-[#F3C77E] mb-4">
                                                ⚡ Live Price Update
                                            </h4>
                                            <div className="space-y-3">
                                                {mockMenuUpdate.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm">
                                                        <span className="text-[#d6d6d6]">{item.item}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="line-through text-red-400">{item.oldPrice}</span>
                                                            <span className="text-[#F3C77E] font-bold">{item.newPrice}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-xs text-[#a7a7a7] mt-4">
                                                Changes are live instantly!
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* QR Code showcase */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 text-center"
                        >
                            <div className="relative inline-block">
                                <QrPreview url="https://scandish.ca/demo" size={200} />

                                {/* Animated scan indicator */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.1, 1],
                                        opacity: [0.5, 0.8, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="absolute inset-0 border-4 border-[#F3C77E] rounded-2xl"
                                />

                                {/* Scan line animation */}
                                <motion.div
                                    animate={{ y: [0, 180, 0] }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                    className="absolute left-4 w-[calc(100%-2rem)] h-0.5 bg-[#F3C77E] shadow-lg shadow-[#F3C77E]/50"
                                />
                            </div>

                            <p className="text-sm text-[#a7a7a7] mt-4">
                                Try scanning this demo QR code!
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

