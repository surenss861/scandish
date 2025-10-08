import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Save, RotateCcw, Grid3X3, LayoutGrid, List, Columns, Eye, Palette, Type, Image } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';

const MENU_LAYOUTS = [
    {
        id: 'single-column',
        name: 'Single Column',
        description: 'Traditional vertical layout',
        icon: <List size={20} />,
        preview: '📋'
    },
    {
        id: 'two-column',
        name: 'Two Column',
        description: 'Side-by-side sections',
        icon: <Columns size={20} />,
        preview: '📊'
    },
    {
        id: 'grid',
        name: 'Grid Layout',
        description: 'Organized grid system',
        icon: <Grid3X3 size={20} />,
        preview: '⊞'
    },
    {
        id: 'card-based',
        name: 'Card Based',
        description: 'Modern card design',
        icon: <LayoutGrid size={20} />,
        preview: '🃏'
    }
];

const MENU_STYLES = [
    { id: 'minimal', name: 'Minimal', description: 'Clean and simple', preview: '⚪' },
    { id: 'elegant', name: 'Elegant', description: 'Sophisticated design', preview: '✨' },
    { id: 'modern', name: 'Modern', description: 'Contemporary style', preview: '🚀' },
    { id: 'classic', name: 'Classic', description: 'Traditional look', preview: '📜' },
    { id: 'luxury', name: 'Luxury', description: 'Premium appearance', preview: '👑' }
];

const ITEM_DISPLAY_OPTIONS = [
    { id: 'name-only', name: 'Name Only', description: 'Just item names' },
    { id: 'name-description', name: 'Name + Description', description: 'Include descriptions' },
    { id: 'name-price', name: 'Name + Price', description: 'Show prices prominently' },
    { id: 'full-details', name: 'Full Details', description: 'Name, description, and price' }
];

const PRICE_DISPLAY_STYLES = [
    { id: 'inline', name: 'Inline', description: 'Price on the same line' },
    { id: 'separate', name: 'Separate Line', description: 'Price below name' },
    { id: 'highlighted', name: 'Highlighted', description: 'Prominent price display' },
    { id: 'minimal', name: 'Minimal', description: 'Subtle price styling' }
];

const CATEGORY_STYLES = [
    { id: 'headers', name: 'Section Headers', description: 'Simple text headers' },
    { id: 'dividers', name: 'Dividers', description: 'Visual separators' },
    { id: 'cards', name: 'Category Cards', description: 'Individual category cards' },
    { id: 'tabs', name: 'Tabbed Layout', description: 'Tabbed navigation' }
];

export default function MenuPage() {
    const { branding, setBranding, loading, toast, ping, saveBranding, resetToDefaults } = useBrandingState();

    // Apply menu styling changes in real-time
    React.useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--menu-layout', branding.menuLayout || 'single-column');
        root.style.setProperty('--menu-style', branding.menuStyle || 'minimal');
        root.style.setProperty('--item-display', branding.itemDisplay || 'full-details');
        root.style.setProperty('--price-style', branding.priceStyle || 'inline');
        root.style.setProperty('--category-style', branding.categoryStyle || 'headers');
    }, [branding.menuLayout, branding.menuStyle, branding.itemDisplay, branding.priceStyle, branding.categoryStyle]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Menu Customization</h2>
                    <p className="text-[#a7a7a7] text-sm">Design how your menu appears to customers</p>
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
                        {loading ? 'Saving...' : 'Save Menu Style'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Menu Controls */}
                <div className="space-y-6">

                    {/* Menu Layout */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Menu size={20} className="text-[#F3C77E]" />
                            Menu Layout
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {MENU_LAYOUTS.map((layout) => (
                                <motion.button
                                    key={layout.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setBranding(prev => ({ ...prev, menuLayout: layout.id }))}
                                    className={`p-4 rounded-xl border transition-all duration-200 text-left ${branding.menuLayout === layout.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-2xl">{layout.preview}</div>
                                        {layout.icon}
                                    </div>
                                    <h4 className="font-medium text-white text-sm">{layout.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{layout.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Menu Style */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Palette size={20} className="text-[#F3C77E]" />
                            Menu Style
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            {MENU_STYLES.map((style) => (
                                <motion.button
                                    key={style.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setBranding(prev => ({ ...prev, menuStyle: style.id }))}
                                    className={`p-3 rounded-xl border transition-all duration-200 text-center ${branding.menuStyle === style.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{style.preview}</div>
                                    <h4 className="font-medium text-white text-xs">{style.name}</h4>
                                    <p className="text-xs text-[#a7a7a7] hidden sm:block">{style.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Item Display */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Type size={20} className="text-[#F3C77E]" />
                            Item Display
                        </h3>
                        <div className="space-y-3">
                            {ITEM_DISPLAY_OPTIONS.map((option) => (
                                <motion.button
                                    key={option.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setBranding(prev => ({ ...prev, itemDisplay: option.id }))}
                                    className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${branding.itemDisplay === option.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{option.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{option.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-[#F3C77E]">💰</span>
                            Price Display
                        </h3>
                        <div className="space-y-3">
                            {PRICE_DISPLAY_STYLES.map((style) => (
                                <motion.button
                                    key={style.id}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => setBranding(prev => ({ ...prev, priceStyle: style.id }))}
                                    className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${branding.priceStyle === style.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{style.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{style.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Category Style */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Grid3X3 size={20} className="text-[#F3C77E]" />
                            Category Style
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {CATEGORY_STYLES.map((style) => (
                                <motion.button
                                    key={style.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setBranding(prev => ({ ...prev, categoryStyle: style.id }))}
                                    className={`p-3 rounded-xl border transition-all duration-200 text-left ${branding.categoryStyle === style.id
                                        ? 'border-[#F3C77E] bg-[#F3C77E]/10'
                                        : 'border-[#40434E]/40 hover:border-[#F3C77E]/50 hover:bg-[#F3C77E]/5'
                                        }`}
                                >
                                    <h4 className="font-medium text-white text-sm">{style.name}</h4>
                                    <p className="text-xs text-[#a7a7a7]">{style.description}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Eye size={20} className="text-[#F3C77E]" />
                            Advanced Options
                        </h3>

                        <div className="space-y-4">
                            {/* Show Images */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-white text-sm">Show Item Images</h4>
                                    <p className="text-xs text-[#a7a7a7]">Display photos for menu items</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branding.showItemImages || false}
                                        onChange={(e) => setBranding(prev => ({ ...prev, showItemImages: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[#40434E]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F3C77E]"></div>
                                </label>
                            </div>

                            {/* Show Allergens */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-white text-sm">Show Allergens</h4>
                                    <p className="text-xs text-[#a7a7a7]">Display allergen information</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branding.showAllergens || false}
                                        onChange={(e) => setBranding(prev => ({ ...prev, showAllergens: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[#40434E]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F3C77E]"></div>
                                </label>
                            </div>

                            {/* Show Calories */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-white text-sm">Show Calories</h4>
                                    <p className="text-xs text-[#a7a7a7]">Display calorie information</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branding.showCalories || false}
                                        onChange={(e) => setBranding(prev => ({ ...prev, showCalories: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[#40434E]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F3C77E]"></div>
                                </label>
                            </div>

                            {/* Compact Mode */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-medium text-white text-sm">Compact Mode</h4>
                                    <p className="text-xs text-[#a7a7a7]">Reduce spacing for more content</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={branding.compactMode || false}
                                        onChange={(e) => setBranding(prev => ({ ...prev, compactMode: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-[#40434E]/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F3C77E]"></div>
                                </label>
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
