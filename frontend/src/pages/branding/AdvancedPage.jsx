import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Save, RotateCcw, Code2, Palette, Image, Zap, Eye } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';

const BACKGROUND_PATTERNS = [
    { id: 'none', name: 'None', description: 'Clean solid background' },
    { id: 'gradient', name: 'Gradient', description: 'Subtle color gradient' },
    { id: 'subtle-dots', name: 'Subtle Dots', description: 'Minimal dot pattern' },
    { id: 'grid', name: 'Grid', description: 'Geometric grid lines' },
    { id: 'diagonal', name: 'Diagonal', description: 'Diagonal stripe pattern' },
    { id: 'noise', name: 'Noise', description: 'Textured noise effect' },
    { id: 'organic', name: 'Organic', description: 'Natural flowing shapes' }
];

export default function AdvancedPage() {
    const { branding, setBranding, loading, toast, ping, saveBranding, resetToDefaults } = useBrandingState();
    const [showCSSPreview, setShowCSSPreview] = useState(false);


    const handleCSSChange = (value) => {
        setBranding(prev => ({ ...prev, customCSS: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Advanced Styling</h2>
                    <p className="text-[#a7a7a7] text-sm">Fine-tune your menu with advanced customization options</p>
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
                {/* Advanced Controls */}
                <div className="space-y-6">
                    {/* Background Patterns */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Image size={20} className="text-[#F3C77E]" />
                            Background Patterns
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {BACKGROUND_PATTERNS.map((pattern) => (
                                <button
                                    key={pattern.id}
                                    onClick={() => setBranding(prev => ({ ...prev, backgroundPattern: pattern.id }))}
                                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${branding.backgroundPattern === pattern.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <div className="w-full h-8 mb-2 rounded" style={{
                                        background: pattern.id === 'gradient' ?
                                            `linear-gradient(135deg, ${branding.primaryColor}40, ${branding.accentColor}30)` :
                                            pattern.id === 'subtle-dots' ?
                                                `radial-gradient(circle, ${branding.primaryColor}50 2px, transparent 2px)` :
                                                pattern.id === 'grid' ?
                                                    `linear-gradient(${branding.secondaryColor}40 2px, transparent 2px), linear-gradient(90deg, ${branding.secondaryColor}40 2px, transparent 2px)` :
                                                    pattern.id === 'diagonal' ?
                                                        `repeating-linear-gradient(45deg, transparent, transparent 15px, ${branding.primaryColor}30 15px, ${branding.primaryColor}30 30px)` :
                                                        pattern.id === 'noise' ?
                                                            `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")` :
                                                            pattern.id === 'organic' ?
                                                                `radial-gradient(ellipse at top, ${branding.primaryColor}30, transparent), radial-gradient(ellipse at bottom, ${branding.accentColor}30, transparent)` :
                                                                'transparent',
                                        backgroundSize: pattern.id === 'subtle-dots' ? '20px 20px' :
                                            pattern.id === 'grid' ? '30px 30px' : 'auto'
                                    }}></div>
                                    <h4 className="font-medium text-white text-sm">{pattern.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{pattern.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom CSS */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Code2 size={20} className="text-[#F3C77E]" />
                                Custom CSS
                            </h3>
                            <button
                                onClick={() => setShowCSSPreview(!showCSSPreview)}
                                className="flex items-center gap-2 px-3 py-1 text-sm text-[#F3C77E] hover:bg-[#F3C77E]/10 rounded-lg transition-colors"
                            >
                                <Eye size={16} />
                                {showCSSPreview ? 'Hide' : 'Show'} Preview
                            </button>
                        </div>

                        <textarea
                            value={branding.customCSS || ''}
                            onChange={(e) => handleCSSChange(e.target.value)}
                            placeholder="/* Add your custom CSS here */
.menu-item {
    /* Example: Custom styling for menu items */
    transform: scale(1.02);
    transition: all 0.3s ease;
}

.menu-item:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}"
                            className="w-full h-40 bg-[#0a0908] border border-[#40434E]/40 rounded-xl p-4 text-sm font-mono text-[#d6d6d6] placeholder-[#666] focus:border-[#F3C77E]/50 focus:outline-none resize-none"
                        />

                        <div className="mt-3 text-xs text-[#a7a7a7]">
                            <p>💡 <strong>Pro tip:</strong> Use CSS selectors like <code className="bg-[#40434E]/40 px-1 rounded">.menu-item</code>, <code className="bg-[#40434E]/40 px-1 rounded">.price</code>, or <code className="bg-[#40434E]/40 px-1 rounded">.category</code> to target specific elements.</p>
                        </div>

                        {/* CSS Preview */}
                        {showCSSPreview && branding.customCSS && (
                            <div className="mt-4 p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                                <h4 className="text-sm font-medium text-white mb-2">CSS Preview</h4>
                                <pre className="text-xs text-[#a7a7a7] overflow-x-auto">
                                    <code>{branding.customCSS}</code>
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* CSS Examples */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Sparkles size={20} className="text-[#F3C77E]" />
                            CSS Examples
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                                <h4 className="text-sm font-medium text-white mb-2">Hover Effects</h4>
                                <code className="text-xs text-[#a7a7a7] block">
                                    .menu-item:hover {'{'} transform: translateY(-2px); {'}'}
                                </code>
                            </div>
                            <div className="p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                                <h4 className="text-sm font-medium text-white mb-2">Custom Shadows</h4>
                                <code className="text-xs text-[#a7a7a7] block">
                                    .menu-item {'{'} box-shadow: 0 4px 20px rgba(0,0,0,0.1); {'}'}
                                </code>
                            </div>
                            <div className="p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                                <h4 className="text-sm font-medium text-white mb-2">Custom Borders</h4>
                                <code className="text-xs text-[#a7a7a7] block">
                                    .menu-item {'{'} border-left: 4px solid var(--primary-color); {'}'}
                                </code>
                            </div>
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

