import React from 'react';
import { motion } from 'framer-motion';
import { Type, Save, RotateCcw } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';

const FONT_OPTIONS = [
    { id: 'inter', name: 'Inter', description: 'Modern & Clean', category: 'Sans-serif' },
    { id: 'poppins', name: 'Poppins', description: 'Friendly & Round', category: 'Sans-serif' },
    { id: 'playfair', name: 'Playfair Display', description: 'Elegant & Serif', category: 'Serif' },
    { id: 'roboto', name: 'Roboto', description: 'Professional', category: 'Sans-serif' },
    { id: 'openSans', name: 'Open Sans', description: 'Readable & Clear', category: 'Sans-serif' },
    { id: 'montserrat', name: 'Montserrat', description: 'Stylish & Modern', category: 'Sans-serif' },
    { id: 'lora', name: 'Lora', description: 'Editorial & Classic', category: 'Serif' },
    { id: 'sourceSans', name: 'Source Sans Pro', description: 'Adobe Font', category: 'Sans-serif' }
];

export default function TypographyPage() {
    const { branding, setBranding, loading, toast, ping, saveBranding, resetToDefaults } = useBrandingState();

    // Apply font changes in real-time
    React.useEffect(() => {
        const root = document.documentElement;
        const fontFamily = getFontFamilyCSS(branding.fontFamily);
        root.style.setProperty('--brand-font-family', fontFamily);
    }, [branding.fontFamily]);

    const getFontFamilyCSS = (fontFamily) => {
        switch (fontFamily) {
            case 'poppins': return '"Poppins", system-ui, sans-serif';
            case 'playfair': return '"Playfair Display", serif';
            case 'roboto': return '"Roboto", system-ui, sans-serif';
            case 'openSans': return '"Open Sans", system-ui, sans-serif';
            case 'montserrat': return '"Montserrat", system-ui, sans-serif';
            case 'lora': return '"Lora", serif';
            case 'sourceSans': return '"Source Sans Pro", system-ui, sans-serif';
            default: return '"Inter", system-ui, sans-serif';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-2xl shadow-lg">
                        <Type className="text-black" size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Typography & Fonts</h2>
                        <p className="text-[#d6d6d6] text-lg">Choose fonts that match your restaurant's personality and style</p>
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

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Font Controls */}
                <div className="space-y-6">
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Type size={20} className="text-[#F3C77E]" />
                            Font Family
                        </h3>

                        <div className="space-y-3">
                            {FONT_OPTIONS.map((font) => (
                                <button
                                    key={font.id}
                                    onClick={() => setBranding(prev => ({ ...prev, fontFamily: font.id }))}
                                    className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${branding.fontFamily === font.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-white" style={{
                                                fontFamily: font.id === 'inter' ? '"Inter", system-ui, sans-serif' :
                                                    font.id === 'poppins' ? '"Poppins", system-ui, sans-serif' :
                                                        font.id === 'playfair' ? '"Playfair Display", serif' :
                                                            font.id === 'roboto' ? '"Roboto", system-ui, sans-serif' :
                                                                font.id === 'openSans' ? '"Open Sans", system-ui, sans-serif' :
                                                                    font.id === 'montserrat' ? '"Montserrat", system-ui, sans-serif' :
                                                                        font.id === 'lora' ? '"Lora", serif' :
                                                                            font.id === 'sourceSans' ? '"Source Sans Pro", system-ui, sans-serif' :
                                                                                '"Inter", system-ui, sans-serif'
                                            }}>
                                                {font.name}
                                            </h4>
                                            <p className="text-sm text-[#a7a7a7]">{font.description}</p>
                                            <span className="text-xs text-[#666]">{font.category}</span>
                                        </div>
                                        <div className="text-2xl" style={{
                                            fontFamily: font.id === 'inter' ? '"Inter", system-ui, sans-serif' :
                                                font.id === 'poppins' ? '"Poppins", system-ui, sans-serif' :
                                                    font.id === 'playfair' ? '"Playfair Display", serif' :
                                                        font.id === 'roboto' ? '"Roboto", system-ui, sans-serif' :
                                                            font.id === 'openSans' ? '"Open Sans", system-ui, sans-serif' :
                                                                font.id === 'montserrat' ? '"Montserrat", system-ui, sans-serif' :
                                                                    font.id === 'lora' ? '"Lora", serif' :
                                                                        font.id === 'sourceSans' ? '"Source Sans Pro", system-ui, sans-serif' :
                                                                            '"Inter", system-ui, sans-serif'
                                        }}>
                                            Aa
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Guidelines */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Font Guidelines</h3>
                        <div className="space-y-3 text-sm text-[#d6d6d6]">
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Sans-serif fonts</strong> (Inter, Poppins, Roboto) work best for modern, clean menus</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Serif fonts</strong> (Playfair, Lora) add elegance and sophistication</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Readability</strong> is key - ensure text is clear on mobile devices</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Consistency</strong> - use the same font throughout your menu</span>
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

