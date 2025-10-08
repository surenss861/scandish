import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, RotateCcw } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';

const COLOR_PRESETS = [
    { name: 'Scandish Gold', primary: '#F3C77E', secondary: '#702632', accent: '#d6a856' },
    { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#1E40AF', accent: '#60A5FA' },
    { name: 'Forest Green', primary: '#10B981', secondary: '#047857', accent: '#34D399' },
    { name: 'Sunset Orange', primary: '#F97316', secondary: '#C2410C', accent: '#FB923C' },
    { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#6D28D9', accent: '#A78BFA' },
    { name: 'Rose Pink', primary: '#EC4899', secondary: '#BE185D', accent: '#F472B6' },
    { name: 'Midnight', primary: '#1F2937', secondary: '#111827', accent: '#374151' },
    { name: 'Crimson', primary: '#DC2626', secondary: '#991B1B', accent: '#EF4444' },
    { name: 'Emerald', primary: '#059669', secondary: '#047857', accent: '#10B981' },
    { name: 'Amber', primary: '#D97706', secondary: '#B45309', accent: '#F59E0B' }
];

export default function ColorsPage() {
    const { branding, setBranding, loading, toast, ping, isValidHexColor, handleColorChange, saveBranding, resetToDefaults } = useBrandingState();

    // Apply branding changes in real-time
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--brand-primary', branding.primaryColor);
        root.style.setProperty('--brand-secondary', branding.secondaryColor);
        root.style.setProperty('--brand-accent', branding.accentColor);
    }, [branding.primaryColor, branding.secondaryColor, branding.accentColor]);


    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-2xl shadow-lg">
                        <Palette className="text-black" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Brand Colors</h2>
                        <p className="text-[#d6d6d6] text-lg">Customize your menu's color scheme and brand identity</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-2 px-6 py-3 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-all duration-200 hover:scale-105"
                    >
                        <RotateCcw size={18} />
                        Reset to Defaults
                    </button>
                    <button
                        onClick={saveBranding}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-all duration-200 disabled:opacity-60 shadow-lg"
                    >
                        <Save size={18} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid xl:grid-cols-3 gap-8">
                {/* Color Controls */}
                <div className="space-y-6">
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-[#F3C77E]" />
                            Brand Colors
                        </h3>

                        {/* Quick Color Presets */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-[#d6d6d6] mb-3">Quick Presets</label>
                            <div className="grid grid-cols-2 gap-3">
                                {COLOR_PRESETS.map((preset, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setBranding(prev => ({
                                                ...prev,
                                                primaryColor: preset.primary,
                                                secondaryColor: preset.secondary,
                                                accentColor: preset.accent
                                            }));
                                        }}
                                        className="group p-4 rounded-xl border border-[#40434E]/40 hover:border-[#F3C77E]/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#F3C77E]/10"
                                        title={preset.name}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                                        </div>
                                        <p className="text-xs text-[#a7a7a7] group-hover:text-white transition-colors text-left">
                                            {preset.name}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Colors */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: branding.primaryColor }}></div>
                                    Primary Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="w-16 h-16 rounded-xl border-2 border-[#40434E]/40 bg-transparent cursor-pointer hover:border-[#F3C77E]/50 transition-colors"
                                            style={{
                                                backgroundColor: branding.primaryColor,
                                                boxShadow: `0 0 0 2px ${branding.primaryColor}20`
                                            }}
                                        />
                                        <div className="absolute inset-0 rounded-xl border-2 border-white/20 pointer-events-none"></div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={branding.primaryColor}
                                            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                                            className={`w-full px-4 py-3 bg-[#171613] border rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-[#F3C77E]/20 transition-all ${branding.primaryColor && !isValidHexColor(branding.primaryColor)
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-[#40434E]/40 focus:border-[#F3C77E]/50'
                                                }`}
                                            placeholder="#F3C77E"
                                        />
                                        <p className="text-xs text-[#666] mt-1">Used for buttons, highlights, and accents</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: branding.secondaryColor }}></div>
                                    Secondary Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={branding.secondaryColor}
                                            onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                            className="w-16 h-16 rounded-xl border-2 border-[#40434E]/40 bg-transparent cursor-pointer hover:border-[#F3C77E]/50 transition-colors"
                                            style={{
                                                backgroundColor: branding.secondaryColor,
                                                boxShadow: `0 0 0 2px ${branding.secondaryColor}20`
                                            }}
                                        />
                                        <div className="absolute inset-0 rounded-xl border-2 border-white/20 pointer-events-none"></div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={branding.secondaryColor}
                                            onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                                            className={`w-full px-4 py-3 bg-[#171613] border rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-[#F3C77E]/20 transition-all ${branding.secondaryColor && !isValidHexColor(branding.secondaryColor)
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-[#40434E]/40 focus:border-[#F3C77E]/50'
                                                }`}
                                            placeholder="#702632"
                                        />
                                        <p className="text-xs text-[#666] mt-1">Used for headers, text, and borders</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: branding.accentColor }}></div>
                                    Accent Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={branding.accentColor}
                                            onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                                            className="w-16 h-16 rounded-xl border-2 border-[#40434E]/40 bg-transparent cursor-pointer hover:border-[#F3C77E]/50 transition-colors"
                                            style={{
                                                backgroundColor: branding.accentColor,
                                                boxShadow: `0 0 0 2px ${branding.accentColor}20`
                                            }}
                                        />
                                        <div className="absolute inset-0 rounded-xl border-2 border-white/20 pointer-events-none"></div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={branding.accentColor}
                                            onChange={(e) => handleColorChange('accentColor', e.target.value)}
                                            className={`w-full px-4 py-3 bg-[#171613] border rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-[#F3C77E]/20 transition-all ${branding.accentColor && !isValidHexColor(branding.accentColor)
                                                ? 'border-red-500/50 focus:border-red-500'
                                                : 'border-[#40434E]/40 focus:border-[#F3C77E]/50'
                                                }`}
                                            placeholder="#d6a856"
                                        />
                                        <p className="text-xs text-[#666] mt-1">Used for backgrounds and subtle highlights</p>
                                    </div>
                                </div>
                            </div>

                            {/* Color Harmony Helper */}
                            <div className="mt-6 p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                                <h4 className="text-sm font-medium text-white mb-3">Color Harmony</h4>
                                <div className="flex items-center gap-2 text-xs text-[#a7a7a7]">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: branding.primaryColor }}></div>
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: branding.secondaryColor }}></div>
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: branding.accentColor }}></div>
                                    <span className="ml-2">Your current color palette</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="xl:col-span-2">
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

