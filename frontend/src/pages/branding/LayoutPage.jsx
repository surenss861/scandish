import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Save, RotateCcw, CornerDownRight, Space, Palette, Zap } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';

const LAYOUT_OPTIONS = [
    { id: 'classic', name: 'Classic', description: 'Traditional menu layout', icon: '📋' },
    { id: 'card', name: 'Card', description: 'Modern card-based design', icon: '🃏' },
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple', icon: '⚪' },
    { id: 'magazine', name: 'Magazine', description: 'Editorial style layout', icon: '📰' },
    { id: 'grid', name: 'Grid', description: 'Organized grid system', icon: '⊞' }
];

const SPACING_OPTIONS = [
    { id: 'compact', name: 'Compact', description: 'Tight spacing for more content' },
    { id: 'comfortable', name: 'Comfortable', description: 'Balanced spacing (recommended)' },
    { id: 'spacious', name: 'Spacious', description: 'Generous white space' },
    { id: 'luxury', name: 'Luxury', description: 'Premium spacing for upscale feel' }
];

const ANIMATION_OPTIONS = [
    { id: 'none', name: 'None', description: 'No animations' },
    { id: 'subtle', name: 'Subtle', description: 'Gentle transitions' },
    { id: 'smooth', name: 'Smooth', description: 'Fluid animations' },
    { id: 'bouncy', name: 'Bouncy', description: 'Playful and energetic' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated motion' }
];

const BUTTON_STYLES = [
    { id: 'rounded', name: 'Rounded', description: 'Soft rounded corners' },
    { id: 'pill', name: 'Pill', description: 'Fully rounded ends' },
    { id: 'sharp', name: 'Sharp', description: 'Clean square edges' },
    { id: 'outline', name: 'Outline', description: 'Transparent with border' }
];

export default function LayoutPage() {
    const { branding, setBranding, loading, toast, ping, saveBranding, resetToDefaults } = useBrandingState();

    // Map legacy/UX labels to supported internal layout ids used by the Live Preview
    const mapLayoutId = React.useCallback((id) => {
        switch (id) {
            case 'classic':
            case 'minimal':
                return 'single-column';
            case 'magazine':
                return 'two-column';
            case 'card':
                return 'card-based';
            case 'grid':
            default:
                return 'grid';
        }
    }, []);

    // Apply layout changes in real-time
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--brand-corner-radius', `${branding.cornerRadius}px`);
        root.style.setProperty('--brand-menu-layout', branding.menuLayout);
    }, [branding.cornerRadius, branding.menuLayout]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Layout & Style</h2>
                    <p className="text-[#a7a7a7] text-sm">Customize your menu's layout, spacing, and visual style</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-2 px-4 py-2 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-colors"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <button
                        onClick={saveBranding}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-60"
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Branding'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Layout Controls */}
                <div className="space-y-6">
                    {/* Menu Layout */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Layout size={20} className="text-[#F3C77E]" />
                            Menu Layout
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {LAYOUT_OPTIONS.map((layout) => (
                                <button
                                    key={layout.id}
                                    onClick={() => setBranding(prev => ({ ...prev, menuLayout: mapLayoutId(layout.id) }))}
                                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${branding.menuLayout === mapLayoutId(layout.id)
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">{layout.icon}</div>
                                    <h4 className="font-medium text-white text-sm">{layout.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{layout.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Corner Radius */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CornerDownRight size={20} className="text-[#F3C77E]" />
                            Corner Radius
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="range"
                                min="0"
                                max="24"
                                value={branding.cornerRadius}
                                onChange={(e) => setBranding(prev => ({ ...prev, cornerRadius: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-[#40434E]/40 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-sm text-[#a7a7a7]">
                                <span>Sharp (0px)</span>
                                <span className="text-[#F3C77E] font-medium">{branding.cornerRadius}px</span>
                                <span>Rounded (24px)</span>
                            </div>
                            <div className="flex justify-center">
                                <div
                                    className="w-16 h-16 bg-[#F3C77E] flex items-center justify-center text-black font-bold"
                                    style={{ borderRadius: `${branding.cornerRadius}px` }}
                                >
                                    {branding.cornerRadius}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Spacing */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Space size={20} className="text-[#F3C77E]" />
                            Content Spacing
                        </h3>
                        <div className="space-y-3">
                            {SPACING_OPTIONS.map((spacing) => (
                                <button
                                    key={spacing.id}
                                    onClick={() => setBranding(prev => ({ ...prev, contentSpacing: spacing.id }))}
                                    className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${branding.contentSpacing === spacing.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{spacing.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{spacing.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Animation Style */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-[#F3C77E]" />
                            Animation Style
                        </h3>
                        <div className="space-y-3">
                            {ANIMATION_OPTIONS.map((animation) => (
                                <button
                                    key={animation.id}
                                    onClick={() => setBranding(prev => ({ ...prev, animationStyle: animation.id }))}
                                    className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${branding.animationStyle === animation.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{animation.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{animation.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Button Style */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-[#F3C77E]" />
                            Button Style
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {BUTTON_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setBranding(prev => ({ ...prev, buttonStyle: style.id }))}
                                    className={`p-3 rounded-xl border transition-all duration-200 text-left ${branding.buttonStyle === style.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{style.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{style.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div>
                    <UnifiedBrandingPreview />
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl ${toast.type === "error"
                        ? "bg-red-500/90 border-red-400/40"
                        : "bg-[#0f0e0c]/90 border-[#40434E]/40"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <span className={toast.type === "error" ? "text-red-200" : "text-[#F3C77E]"}>
                            {toast.type === "error" ? "⚠️" : "✓"}
                        </span>
                        <span className="text-sm font-medium">{toast.message}</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

