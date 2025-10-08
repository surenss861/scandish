import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Palette,
    Upload,
    Eye,
    Save,
    RotateCcw,
    Image,
    Loader2,
    Settings,
    Code2,
    Smartphone,
    Monitor,
    Tablet
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../services/storageService';
import { BrandingService } from '../services/brandingService';
import VibeCoder from './VibeCoder';

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

export default function CustomBranding() {
    const { user } = useAuth();
    const { isPro, upgradeTo } = usePlan();
    const [logo, setLogo] = useState(null);

    // Soft wall removed: feature always accessible
    const [logoUrl, setLogoUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [branding, setBranding] = useState({
        primaryColor: '#F3C77E',
        secondaryColor: '#702632',
        accentColor: '#d6a856',
        fontFamily: 'inter',
        menuLayout: 'classic',
        cornerRadius: 12,
        contentSpacing: 'comfortable',
        backgroundPattern: 'none',
        animationStyle: 'subtle',
        buttonStyle: 'rounded',
        customCSS: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');
    const [previewDevice, setPreviewDevice] = useState('mobile');

    const ping = (msg, type = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(''), 3000);
    };

    // Color validation helper
    const isValidHexColor = (color) => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    };

    // Handle color input changes with validation
    const handleColorChange = (colorType, value) => {
        if (value === '' || isValidHexColor(value)) {
            setBranding(prev => ({ ...prev, [colorType]: value }));
        }
    };

    // Load branding data on component mount
    useEffect(() => {
        const loadBranding = async () => {
            try {
                const brandingData = await BrandingService.getBranding();

                // Update state with loaded data
                if (brandingData.logo_url) {
                    setLogo(brandingData.logo_url);
                    setLogoUrl(brandingData.logo_url);
                }

                setBranding({
                    primaryColor: brandingData.primary_color || '#F3C77E',
                    secondaryColor: brandingData.secondary_color || '#702632',
                    accentColor: brandingData.accent_color || '#d6a856',
                    fontFamily: brandingData.font_family || 'inter',
                    menuLayout: brandingData.menu_layout || 'classic',
                    cornerRadius: brandingData.corner_radius || 12,
                    contentSpacing: brandingData.content_spacing || 'comfortable',
                    backgroundPattern: brandingData.background_pattern || 'none',
                    animationStyle: brandingData.animation_style || 'subtle',
                    buttonStyle: brandingData.button_style || 'rounded',
                    customCSS: brandingData.custom_css || ''
                });

                // Apply loaded branding to page
                applyBrandingToPage({
                    logoUrl: brandingData.logo_url,
                    primaryColor: brandingData.primary_color || '#F3C77E',
                    secondaryColor: brandingData.secondary_color || '#702632',
                    accentColor: brandingData.accent_color || '#d6a856',
                    fontFamily: brandingData.font_family || 'inter',
                    menuLayout: brandingData.menu_layout || 'classic',
                    cornerRadius: brandingData.corner_radius || 12,
                    contentSpacing: brandingData.content_spacing || 'comfortable',
                    backgroundPattern: brandingData.background_pattern || 'none',
                    animationStyle: brandingData.animation_style || 'subtle',
                    buttonStyle: brandingData.button_style || 'rounded',
                    customCSS: brandingData.custom_css || ''
                });
            } catch (error) {
                console.error('Failed to load branding:', error);
                // Don't show error toast for initial load failure
            }
        };

        if (user) {
            loadBranding();
        }
    }, [user]);

    // Apply branding changes in real-time to preview
    useEffect(() => {
        applyBrandingToPage({
            logoUrl,
            ...branding
        });
    }, [branding, logoUrl]);

    const onLogoDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                setUploading(true);

                // Create preview
                const previewUrl = StorageService.createPreviewUrl(file);
                setLogo(previewUrl);

                // Upload to storage
                const { url } = await StorageService.uploadPhoto(file, user?.id || '', 'branding');
                setLogoUrl(url);

                ping('✅ Logo uploaded successfully!');
            } catch (err) {
                ping(err.message || 'Failed to upload logo', 'error');
                setLogo(null);
            } finally {
                setUploading(false);
            }
        }
    }, [user]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onLogoDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        disabled: false
    });

    const saveBranding = async () => {
        setLoading(true);
        try {
            const brandingData = {
                logo_url: logoUrl,
                logo_path: null, // We don't store the path separately
                primary_color: branding.primaryColor,
                secondary_color: branding.secondaryColor,
                accent_color: branding.accentColor,
                font_family: branding.fontFamily,
                menu_layout: branding.menuLayout,
                corner_radius: branding.cornerRadius,
                content_spacing: branding.contentSpacing,
                background_pattern: branding.backgroundPattern,
                animation_style: branding.animationStyle,
                button_style: branding.buttonStyle,
                custom_css: branding.customCSS
            };

            // Save to database
            await BrandingService.saveBranding(brandingData);

            // Apply styles immediately to document
            applyBrandingToPage({
                logoUrl,
                ...branding
            });

            ping('✅ Branding saved and applied!');
        } catch (error) {
            console.error('Failed to save branding:', error);
            ping('Failed to save branding', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyBrandingToPage = (brandingData) => {
        const root = document.documentElement;

        // Apply CSS custom properties
        root.style.setProperty('--primary-color', brandingData.primaryColor);
        root.style.setProperty('--secondary-color', brandingData.secondaryColor);
        root.style.setProperty('--accent-color', brandingData.accentColor);
        root.style.setProperty('--border-radius', `${brandingData.cornerRadius}px`);

        // Apply font family
        const fontMap = {
            'inter': '"Inter", system-ui, sans-serif',
            'poppins': '"Poppins", system-ui, sans-serif',
            'playfair': '"Playfair Display", serif',
            'roboto': '"Roboto", system-ui, sans-serif',
            'openSans': '"Open Sans", system-ui, sans-serif',
            'montserrat': '"Montserrat", system-ui, sans-serif',
            'lora': '"Lora", serif',
            'sourceSans': '"Source Sans Pro", system-ui, sans-serif'
        };

        root.style.setProperty('--font-family', fontMap[brandingData.fontFamily] || fontMap.inter);

        // Apply spacing
        const spacingMap = {
            'compact': '0.5rem',
            'comfortable': '1rem',
            'spacious': '1.5rem',
            'luxury': '2rem'
        };
        root.style.setProperty('--content-spacing', spacingMap[brandingData.contentSpacing]);

        // Remove existing custom CSS
        const existingStyle = document.getElementById('scandish-custom-css');
        if (existingStyle) existingStyle.remove();

        // Apply custom CSS
        if (brandingData.customCSS) {
            const style = document.createElement('style');
            style.id = 'scandish-custom-css';
            style.textContent = brandingData.customCSS;
            document.head.appendChild(style);
        }
    };

    const resetToDefaults = async () => {
        try {
            // Reset database
            await BrandingService.resetBranding();

            // Reset local state
            setLogo(null);
            setLogoUrl('');
            setBranding({
                primaryColor: '#F3C77E',
                secondaryColor: '#702632',
                accentColor: '#d6a856',
                fontFamily: 'inter',
                menuLayout: 'classic',
                cornerRadius: 12,
                contentSpacing: 'comfortable',
                backgroundPattern: 'none',
                animationStyle: 'subtle',
                buttonStyle: 'rounded',
                customCSS: ''
            });

            // Reset CSS properties
            const root = document.documentElement;
            root.style.removeProperty('--primary-color');
            root.style.removeProperty('--secondary-color');
            root.style.removeProperty('--accent-color');
            root.style.removeProperty('--border-radius');
            root.style.removeProperty('--font-family');
            root.style.removeProperty('--content-spacing');

            const existingStyle = document.getElementById('scandish-custom-css');
            if (existingStyle) existingStyle.remove();

            ping('✅ Branding reset to defaults!');
        } catch (error) {
            console.error('Failed to reset branding:', error);
            ping('Failed to reset branding', 'error');
        }
    };

    // Paywall removed - all features now accessible

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Custom Branding</h2>
                    <p className="text-[#a7a7a7] text-sm">Customize your menu appearance</p>
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

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Assets & Typography */}
                <div className="space-y-6">
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Image size={20} className="text-[#F3C77E]" />
                            Restaurant Logo
                        </h3>

                        <div
                            {...getRootProps()}
                            className={`w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${isDragActive
                                ? "border-[#F3C77E] bg-[#F3C77E]/10"
                                : uploading
                                    ? "border-[#F3C77E]/50 bg-[#F3C77E]/5 cursor-not-allowed"
                                    : "border-[#40434E]/40 hover:border-[#F3C77E]"
                                }`}
                        >
                            <input {...getInputProps()} disabled={uploading} />

                            {uploading ? (
                                <div className="text-center text-[#F3C77E]">
                                    <Loader2 size={32} className="mx-auto mb-2 animate-spin" />
                                    <p>Uploading logo...</p>
                                </div>
                            ) : logo ? (
                                <div className="relative">
                                    <img src={logo} alt="Logo preview" className="max-h-32 max-w-full object-contain" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                                        <p className="text-white text-sm">Click to change</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-[#a7a7a7]">
                                    <Upload size={32} className="mx-auto mb-2" />
                                    <p className="font-medium">Upload Your Logo</p>
                                    <p className="text-sm mt-1">PNG, JPG, SVG • Max 2MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Color Customization */}
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

                    {/* Typography & Layout */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Typography & Layout</h3>

                        <div className="space-y-4">
                            {/* Font Family */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Font Family</label>
                                <select
                                    value={branding.fontFamily}
                                    onChange={(e) => setBranding(prev => ({ ...prev, fontFamily: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white"
                                >
                                    <option value="inter">Inter (Modern & Clean)</option>
                                    <option value="poppins">Poppins (Friendly & Round)</option>
                                    <option value="playfair">Playfair Display (Elegant)</option>
                                    <option value="roboto">Roboto (Professional)</option>
                                    <option value="openSans">Open Sans (Readable)</option>
                                    <option value="montserrat">Montserrat (Stylish)</option>
                                    <option value="lora">Lora (Editorial)</option>
                                    <option value="sourceSans">Source Sans Pro</option>
                                </select>
                            </div>

                            {/* Menu Layout Style */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Menu Layout</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'classic', name: 'Classic List' },
                                        { id: 'grid', name: 'Modern Grid' },
                                        { id: 'card', name: 'Card Style' },
                                        { id: 'minimal', name: 'Minimal' },
                                        { id: 'magazine', name: 'Magazine' },
                                        { id: 'restaurant', name: 'Restaurant' }
                                    ].map((layout) => (
                                        <button
                                            key={layout.id}
                                            onClick={() => setBranding(prev => ({ ...prev, menuLayout: layout.id }))}
                                            className={`p-2 border rounded-lg transition-colors text-xs ${branding.menuLayout === layout.id
                                                ? 'border-[#F3C77E] bg-[#F3C77E]/10 text-[#F3C77E]'
                                                : 'border-[#40434E]/40 hover:border-[#F3C77E] text-white'
                                                }`}
                                        >
                                            {layout.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Corner Radius ({branding.cornerRadius}px)</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    value={branding.cornerRadius}
                                    onChange={(e) => setBranding(prev => ({ ...prev, cornerRadius: parseInt(e.target.value) }))}
                                    className="w-full accent-[#F3C77E]"
                                />
                                <div className="flex justify-between text-xs text-[#666] mt-1">
                                    <span>Sharp</span>
                                    <span>Rounded</span>
                                </div>
                            </div>

                            {/* Content Spacing */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Content Spacing</label>
                                <select
                                    value={branding.contentSpacing}
                                    onChange={(e) => setBranding(prev => ({ ...prev, contentSpacing: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white"
                                >
                                    <option value="compact">Compact</option>
                                    <option value="comfortable">Comfortable</option>
                                    <option value="spacious">Spacious</option>
                                    <option value="luxury">Luxury (Extra Space)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Vibe Coder - AI Code Generation */}
                    <VibeCoder
                        onCodeGenerated={(code) => {
                            setBranding(prev => ({ ...prev, customCSS: code }));
                        }}
                        initialCode={branding.customCSS}
                    />

                    {/* Advanced Styling */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Settings size={20} className="text-[#F3C77E]" />
                            Advanced Styling
                        </h3>

                        <div className="space-y-4">
                            {/* Background Options */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Background Pattern</label>
                                <select
                                    value={branding.backgroundPattern}
                                    onChange={(e) => setBranding(prev => ({ ...prev, backgroundPattern: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white"
                                >
                                    <option value="none">None</option>
                                    <option value="subtle-dots">Subtle Dots</option>
                                    <option value="grid">Grid Lines</option>
                                    <option value="diagonal">Diagonal Lines</option>
                                    <option value="organic">Organic Shapes</option>
                                    <option value="noise">Paper Texture</option>
                                    <option value="gradient">Gradient Overlay</option>
                                </select>
                            </div>

                            {/* Animation Style */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Page Animations</label>
                                <select
                                    value={branding.animationStyle}
                                    onChange={(e) => setBranding(prev => ({ ...prev, animationStyle: e.target.value }))}
                                    className="w-full px-3 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white"
                                >
                                    <option value="subtle">Subtle Fade</option>
                                    <option value="smooth">Smooth Slide</option>
                                    <option value="bouncy">Bouncy Spring</option>
                                    <option value="elegant">Elegant Float</option>
                                    <option value="none">No Animations</option>
                                </select>
                            </div>

                            {/* Button Style */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2">Button Style</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'rounded', name: 'Rounded' },
                                        { id: 'sharp', name: 'Sharp' },
                                        { id: 'pill', name: 'Pill' },
                                        { id: 'outline', name: 'Outline' }
                                    ].map((style) => (
                                        <button
                                            key={style.id}
                                            onClick={() => setBranding(prev => ({ ...prev, buttonStyle: style.id }))}
                                            className={`p-2 border rounded-lg transition-colors text-xs ${branding.buttonStyle === style.id
                                                ? 'border-[#F3C77E] bg-[#F3C77E]/10 text-[#F3C77E]'
                                                : 'border-[#40434E]/40 hover:border-[#F3C77E] text-white'
                                                }`}
                                        >
                                            {style.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom CSS Editor */}
                            <div>
                                <label className="block text-sm font-medium text-[#d6d6d6] mb-2 flex items-center gap-2">
                                    <Code2 size={16} />
                                    Custom CSS
                                    <span className="text-xs text-[#666]">(or use Vibe Coder above)</span>
                                </label>
                                <textarea
                                    value={branding.customCSS}
                                    onChange={(e) => setBranding(prev => ({ ...prev, customCSS: e.target.value }))}
                                    className="w-full px-3 py-3 bg-[#0a0908] border border-[#40434E]/40 rounded-lg text-white text-xs font-mono h-24 resize-none"
                                    placeholder="/* Add your custom CSS here or use the Vibe Coder above */
.menu-item {
  transition: all 0.3s ease;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}"
                                />
                                <p className="text-xs text-[#666] mt-1">Advanced users can add custom CSS for complete control</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview & Export */}
                <div className="space-y-6">
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Eye size={20} className="text-[#F3C77E]" />
                                Live Preview
                            </h3>

                            {/* Device Selector */}
                            <div className="flex items-center gap-2 bg-[#0a0908] rounded-lg p-1 border border-[#40434E]/40">
                                <button
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={`p-2 rounded transition-all ${previewDevice === 'mobile'
                                        ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                                        : 'text-[#a7a7a7] hover:text-white'
                                        }`}
                                    title="Mobile View"
                                >
                                    <Smartphone size={16} />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('tablet')}
                                    className={`p-2 rounded transition-all ${previewDevice === 'tablet'
                                        ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                                        : 'text-[#a7a7a7] hover:text-white'
                                        }`}
                                    title="Tablet View"
                                >
                                    <Tablet size={16} />
                                </button>
                                <button
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={`p-2 rounded transition-all ${previewDevice === 'desktop'
                                        ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                                        : 'text-[#a7a7a7] hover:text-white'
                                        }`}
                                    title="Desktop View"
                                >
                                    <Monitor size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Preview Container with Device Sizing */}
                        <div className="flex justify-center">
                            <motion.div
                                key={previewDevice}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`bg-[#0a0908] rounded-xl p-4 ${previewDevice === 'mobile' ? 'w-full max-w-[320px]' :
                                    previewDevice === 'tablet' ? 'w-full max-w-[600px]' :
                                        'w-full'
                                    }`}
                            >
                                {/* Menu Preview with ALL Custom Branding */}
                                <div
                                    className="bg-white rounded-xl p-6 space-y-4 relative overflow-hidden"
                                    style={{
                                        background: branding.backgroundPattern === 'gradient'
                                            ? `linear-gradient(135deg, ${branding.primaryColor}30, ${branding.accentColor}20)`
                                            : `linear-gradient(135deg, ${branding.primaryColor}10, ${branding.accentColor}05)`,
                                        borderRadius: `${branding.cornerRadius}px`,
                                        fontFamily: branding.fontFamily === 'inter' ? '"Inter", system-ui, sans-serif' :
                                            branding.fontFamily === 'poppins' ? '"Poppins", system-ui, sans-serif' :
                                                branding.fontFamily === 'playfair' ? '"Playfair Display", serif' :
                                                    branding.fontFamily === 'roboto' ? '"Roboto", system-ui, sans-serif' :
                                                        branding.fontFamily === 'openSans' ? '"Open Sans", system-ui, sans-serif' :
                                                            branding.fontFamily === 'montserrat' ? '"Montserrat", system-ui, sans-serif' :
                                                                branding.fontFamily === 'lora' ? '"Lora", serif' :
                                                                    branding.fontFamily === 'sourceSans' ? '"Source Sans Pro", system-ui, sans-serif' :
                                                                        '"Inter", system-ui, sans-serif'
                                    }}
                                >
                                    {/* Background Pattern Overlays */}
                                    {branding.backgroundPattern === 'subtle-dots' && (
                                        <div
                                            className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: `radial-gradient(circle, ${branding.secondaryColor} 1px, transparent 1px)`,
                                                backgroundSize: '20px 20px'
                                            }}
                                        />
                                    )}
                                    {branding.backgroundPattern === 'grid' && (
                                        <div
                                            className="absolute inset-0 opacity-10 pointer-events-none"
                                            style={{
                                                backgroundImage: `linear-gradient(${branding.secondaryColor} 1px, transparent 1px), linear-gradient(90deg, ${branding.secondaryColor} 1px, transparent 1px)`,
                                                backgroundSize: '30px 30px'
                                            }}
                                        />
                                    )}
                                    {branding.backgroundPattern === 'diagonal' && (
                                        <div
                                            className="absolute inset-0 opacity-10 pointer-events-none"
                                            style={{
                                                backgroundImage: `repeating-linear-gradient(45deg, ${branding.secondaryColor}, ${branding.secondaryColor} 1px, transparent 1px, transparent 10px)`
                                            }}
                                        />
                                    )}
                                    {branding.backgroundPattern === 'noise' && (
                                        <div
                                            className="absolute inset-0 opacity-30 pointer-events-none"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.3'/%3E%3C/svg%3E")`
                                            }}
                                        />
                                    )}
                                    {branding.backgroundPattern === 'organic' && (
                                        <div
                                            className="absolute inset-0 opacity-20 pointer-events-none"
                                            style={{
                                                backgroundImage: `radial-gradient(circle at 20% 30%, ${branding.primaryColor}40 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${branding.accentColor}40 0%, transparent 50%)`
                                            }}
                                        />
                                    )}
                                    {/* Header with Logo */}
                                    <div className="text-center pb-4 border-b" style={{ borderColor: `${branding.secondaryColor}20` }}>
                                        {logo ? (
                                            <img src={logo} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
                                        ) : (
                                            <div className="h-12 flex items-center justify-center mb-2">
                                                <span className="text-2xl">🍽️</span>
                                            </div>
                                        )}
                                        <h2 className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                                            Your Restaurant
                                        </h2>
                                    </div>

                                    {/* Sample Menu Items */}
                                    <div className={`relative z-10 ${branding.menuLayout === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'
                                        }`}>
                                        <h3 className="font-semibold text-lg" style={{ color: branding.primaryColor }}>
                                            Featured Items
                                        </h3>
                                        {[
                                            { name: 'Signature Pasta', price: '$18.99', desc: 'House-made pasta with seasonal ingredients' },
                                            { name: 'Grilled Salmon', price: '$24.99', desc: 'Fresh Atlantic salmon with herbs' },
                                            { name: 'Craft Cocktail', price: '$12.99', desc: 'Artisanal cocktails made fresh' }
                                        ].map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                    type: branding.animationStyle === 'bouncy' ? 'spring' :
                                                        branding.animationStyle === 'smooth' ? 'tween' :
                                                            branding.animationStyle === 'elegant' ? 'tween' : 'tween',
                                                    stiffness: branding.animationStyle === 'bouncy' ? 260 : 100,
                                                    damping: branding.animationStyle === 'bouncy' ? 20 : 10
                                                }}
                                                className={`flex justify-between items-start ${branding.menuLayout === 'card' ? 'shadow-md hover:shadow-lg' :
                                                    branding.menuLayout === 'minimal' ? 'border-b border-gray-200 pb-3 last:border-0' :
                                                        branding.menuLayout === 'magazine' ? 'border-l-4 pl-4' :
                                                            ''
                                                    }`}
                                                style={{
                                                    backgroundColor: branding.menuLayout === 'minimal' ? 'transparent' :
                                                        branding.menuLayout === 'card' ? 'white' :
                                                            `${branding.accentColor}10`,
                                                    borderRadius: branding.menuLayout === 'minimal' ? '0' : `${branding.cornerRadius}px`,
                                                    padding: branding.contentSpacing === 'compact' ? '0.5rem' :
                                                        branding.contentSpacing === 'spacious' ? '1.5rem' :
                                                            branding.contentSpacing === 'luxury' ? '2rem' : '1rem',
                                                    borderLeftColor: branding.menuLayout === 'magazine' ? branding.primaryColor : 'transparent',
                                                    transition: branding.animationStyle === 'none' ? 'none' : 'all 0.3s ease'
                                                }}
                                            >
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                                </div>
                                                <span
                                                    className={`font-bold px-3 py-1 whitespace-nowrap ml-2 ${branding.buttonStyle === 'pill' ? 'rounded-full' :
                                                        branding.buttonStyle === 'sharp' ? 'rounded-none' : 'rounded-lg'
                                                        }`}
                                                    style={{
                                                        color: branding.buttonStyle === 'outline' ? branding.primaryColor : 'white',
                                                        backgroundColor: branding.buttonStyle === 'outline' ? 'transparent' : branding.primaryColor,
                                                        border: branding.buttonStyle === 'outline' ? `2px solid ${branding.primaryColor}` : 'none'
                                                    }}
                                                >
                                                    {item.price}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Branded Footer */}
                                    <div className="text-center pt-4 border-t relative z-10" style={{ borderColor: `${branding.secondaryColor}20` }}>
                                        <p className="text-xs" style={{ color: branding.secondaryColor }}>
                                            Powered by {logo ? 'Your Brand' : 'Scandish'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Usage Guidelines */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Branding Guidelines</h3>
                        <div className="space-y-3 text-sm text-[#d6d6d6]">
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Logo:</strong> Upload PNG/SVG for best quality. Max 2MB size.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Colors:</strong> Primary for highlights, Secondary for headers, Accent for buttons.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Preview:</strong> Changes apply to all your menu pages automatically.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-[#F3C77E]">•</span>
                                <span><strong>Mobile:</strong> Branding optimized for mobile and desktop viewing.</span>
                            </div>
                        </div>
                    </div>
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
