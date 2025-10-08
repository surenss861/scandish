import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

const demoItems = [
    {
        name: "Margherita Pizza",
        description: "Fresh mozzarella, basil, tomato sauce on wood-fired crust",
        price: 18.99,
        category: "Pizza",
        emoji: "🍕"
    },
    {
        name: "Caesar Salad",
        description: "Crisp romaine, parmesan, croutons, house-made dressing",
        price: 14.99,
        category: "Salads",
        emoji: "🥗"
    },
    {
        name: "Craft Beer Selection",
        description: "Local IPA, Wheat, and Seasonal on tap",
        price: 7.99,
        category: "Drinks",
        emoji: "🍺"
    }
];

const steps = [
    {
        id: "welcome",
        title: "Welcome to QuickMenu! 🎉",
        subtitle: "Let's get your restaurant set up in 3 quick steps"
    },
    {
        id: "restaurant",
        title: "Tell us about your restaurant",
        subtitle: "This information will appear on your digital menu"
    },
    {
        id: "demo",
        title: "Let's add some demo items",
        subtitle: "We'll start you off with a few sample items you can customize"
    },
    {
        id: "complete",
        title: "You're all set! 🚀",
        subtitle: "Your menu is live and ready for customers"
    }
];

export default function OnboardingWizard({ onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [restaurantData, setRestaurantData] = useState({
        name: "",
        cuisine: "",
        location: "",
        slug: ""
    });

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            onComplete?.({
                restaurant: restaurantData,
                demoItems: demoItems
            });
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateSlug = (name) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);
    };

    const handleRestaurantChange = (field, value) => {
        const updates = { [field]: value };
        if (field === 'name') {
            updates.slug = generateSlug(value);
        }
        setRestaurantData(prev => ({ ...prev, ...updates }));
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return restaurantData.name.trim().length > 0;
            default:
                return true;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-2xl bg-[#0f0e0c]/95 backdrop-blur-xl border border-[#40434E]/40 rounded-3xl shadow-2xl shadow-black/50"
            >
                {/* Progress bar */}
                <div className="absolute top-0 left-0 h-1 bg-[#40434E]/30 rounded-t-3xl overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[#F3C77E] to-[#d6a856]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Skip button */}
                <button
                    onClick={onSkip}
                    className="absolute top-6 right-6 text-sm text-[#a7a7a7] hover:text-[#FFFFFA] transition-colors"
                >
                    Skip setup
                </button>

                <div className="p-8 md:p-12">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                        <span className="text-sm text-[#F3C77E] font-semibold">
                            Step {currentStep + 1} of {steps.length}
                        </span>
                        <div className="flex gap-1">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-2 h-2 rounded-full transition-colors ${idx <= currentStep ? 'bg-[#F3C77E]' : 'bg-[#40434E]/40'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Step content */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-[#FFFFFA] mb-3">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="text-[#d6d6d6]">
                                    {steps[currentStep].subtitle}
                                </p>
                            </div>

                            {/* Step-specific content */}
                            {currentStep === 0 && (
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center mx-auto shadow-lg">
                                        <Sparkles className="text-[#080705]" size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-left">
                                            <Check className="text-[#F3C77E] shrink-0" size={20} />
                                            <span className="text-[#d6d6d6]">Set up your restaurant profile</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-left">
                                            <Check className="text-[#F3C77E] shrink-0" size={20} />
                                            <span className="text-[#d6d6d6]">Add sample menu items</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-left">
                                            <Check className="text-[#F3C77E] shrink-0" size={20} />
                                            <span className="text-[#d6d6d6]">Generate your QR code</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                                                Restaurant Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={restaurantData.name}
                                                onChange={(e) => handleRestaurantChange('name', e.target.value)}
                                                placeholder="Tony's Pizza"
                                                className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                                                Cuisine Type
                                            </label>
                                            <input
                                                type="text"
                                                value={restaurantData.cuisine}
                                                onChange={(e) => handleRestaurantChange('cuisine', e.target.value)}
                                                placeholder="Italian, Mexican, etc."
                                                className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={restaurantData.location}
                                            onChange={(e) => handleRestaurantChange('location', e.target.value)}
                                            placeholder="City, State"
                                            className="w-full rounded-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-[#d6d6d6]">
                                            Menu URL
                                        </label>
                                        <div className="flex">
                                            <span className="flex items-center px-3 bg-[#40434E]/20 border border-[#40434E]/40 border-r-0 rounded-l-xl text-sm text-[#a7a7a7]">
                                                quickmenu.app/
                                            </span>
                                            <input
                                                type="text"
                                                value={restaurantData.slug}
                                                onChange={(e) => handleRestaurantChange('slug', e.target.value)}
                                                placeholder="tonys-pizza"
                                                className="flex-1 rounded-r-xl px-4 py-3 bg-[#171613] border border-[#40434E]/40 text-white placeholder-[#9a9a9a] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <p className="text-[#d6d6d6]">
                                            We'll add these sample items to get you started. You can edit or remove them anytime.
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {demoItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-4 p-4 bg-[#171613] border border-[#40434E]/40 rounded-xl"
                                            >
                                                <span className="text-2xl">{item.emoji}</span>
                                                <div className="flex-1">
                                                    <div className="font-medium text-[#FFFFFA]">{item.name}</div>
                                                    <div className="text-sm text-[#a7a7a7]">{item.description}</div>
                                                </div>
                                                <div className="text-[#F3C77E] font-semibold">
                                                    ${item.price}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="text-center space-y-6">
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse">
                                        <Check className="text-[#080705]" size={32} />
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[#d6d6d6] text-lg">
                                            <strong className="text-[#FFFFFA]">{restaurantData.name}</strong> is ready to serve digital menus!
                                        </p>

                                        <div className="bg-[#171613] border border-[#40434E]/40 rounded-xl p-4">
                                            <div className="text-sm text-[#a7a7a7] mb-2">Your menu URL:</div>
                                            <code className="text-[#F3C77E] font-mono">
                                                quickmenu.app/{restaurantData.slug || 'your-restaurant'}
                                            </code>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                                            <div className="text-center">
                                                <div className="text-[#F3C77E] font-bold">✅</div>
                                                <div className="text-[#d6d6d6]">Menu Created</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#F3C77E] font-bold">✅</div>
                                                <div className="text-[#d6d6d6]">QR Code Ready</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-[#F3C77E] font-bold">✅</div>
                                                <div className="text-[#d6d6d6]">Live & Scannable</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-12 pt-6 border-t border-[#40434E]/30">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#40434E]/40 text-[#a7a7a7] hover:text-[#FFFFFA] hover:border-[#F3C77E]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>

                        <div className="text-sm text-[#a7a7a7]">
                            {currentStep + 1} of {steps.length}
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!isStepValid()}
                            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] font-semibold hover:from-[#d6a856] hover:to-[#F3C77E] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#F3C77E]/25"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>
                                    Launch Menu
                                    <Sparkles size={16} />
                                </>
                            ) : (
                                <>
                                    Continue
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

