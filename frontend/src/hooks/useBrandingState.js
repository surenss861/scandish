import { useState, useEffect } from 'react';
import { BrandingService } from '../services/brandingService';

// Global state for branding - persists across page navigation
let globalBrandingState = {
    primaryColor: '#F3C77E',
    secondaryColor: '#702632',
    accentColor: '#d6a856',
    fontFamily: 'inter',
    menuLayout: 'single-column',
    cornerRadius: 12,
    contentSpacing: 'comfortable',
    backgroundPattern: 'none',
    animationStyle: 'subtle',
    buttonStyle: 'rounded',
    customCSS: '',
    // Menu-specific settings
    menuStyle: 'minimal',
    itemDisplay: 'full-details',
    priceStyle: 'inline',
    categoryStyle: 'headers',
    showItemImages: true,
    showAllergens: false,
    showCalories: false,
    compactMode: false
};

let globalLogoState = null;
let globalLogoUrlState = '';

// Listeners for state changes
const listeners = new Set();

const notifyListeners = () => {
    listeners.forEach(listener => listener());
};

// Load branding from database
const loadBrandingFromDatabase = async () => {
    try {
        const brandingData = await BrandingService.getBranding();
        if (brandingData) {
            globalBrandingState = {
                primaryColor: brandingData.primary_color || globalBrandingState.primaryColor,
                secondaryColor: brandingData.secondary_color || globalBrandingState.secondaryColor,
                accentColor: brandingData.accent_color || globalBrandingState.accentColor,
                fontFamily: brandingData.font_family || globalBrandingState.fontFamily,
                menuLayout: brandingData.menu_layout || globalBrandingState.menuLayout,
                cornerRadius: brandingData.corner_radius || globalBrandingState.cornerRadius,
                contentSpacing: brandingData.content_spacing || globalBrandingState.contentSpacing,
                backgroundPattern: brandingData.background_pattern || globalBrandingState.backgroundPattern,
                animationStyle: brandingData.animation_style || globalBrandingState.animationStyle,
                buttonStyle: brandingData.button_style || globalBrandingState.buttonStyle,
                customCSS: brandingData.custom_css || globalBrandingState.customCSS,
                // Menu-specific settings
                menuStyle: brandingData.menu_style || globalBrandingState.menuStyle,
                itemDisplay: brandingData.item_display || globalBrandingState.itemDisplay,
                priceStyle: brandingData.price_style || globalBrandingState.priceStyle,
                categoryStyle: brandingData.category_style || globalBrandingState.categoryStyle,
                showItemImages: brandingData.show_item_images !== undefined ? brandingData.show_item_images : globalBrandingState.showItemImages,
                showAllergens: brandingData.show_allergens !== undefined ? brandingData.show_allergens : globalBrandingState.showAllergens,
                showCalories: brandingData.show_calories !== undefined ? brandingData.show_calories : globalBrandingState.showCalories,
                compactMode: brandingData.compact_mode !== undefined ? brandingData.compact_mode : globalBrandingState.compactMode
            };
            globalLogoUrlState = brandingData.logo_url || '';
            notifyListeners();
        }
    } catch (error) {
        console.error('Error loading branding from database:', error);
        // Continue with default values if database load fails
    }
};

// Save branding to database
const saveBrandingToDatabase = async (branding) => {
    try {
        const brandingData = {
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
            custom_css: branding.customCSS,
            logo_url: globalLogoUrlState,
            // Menu-specific settings
            menu_style: branding.menuStyle,
            item_display: branding.itemDisplay,
            price_style: branding.priceStyle,
            category_style: branding.categoryStyle,
            show_item_images: branding.showItemImages,
            show_allergens: branding.showAllergens,
            show_calories: branding.showCalories,
            compact_mode: branding.compactMode
        };

        await BrandingService.saveBranding(brandingData);
        console.log('Branding saved to database successfully');
    } catch (error) {
        console.error('Error saving branding to database:', error);
        throw error;
    }
};

// Apply branding to DOM elements
const applyBrandingToDOM = (branding) => {
    // Apply CSS custom properties to the document root
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);
    root.style.setProperty('--brand-accent', branding.accentColor);
    root.style.setProperty('--brand-corner-radius', `${branding.cornerRadius}px`);
    root.style.setProperty('--brand-menu-layout', branding.menuLayout);
    root.style.setProperty('--brand-content-spacing', branding.contentSpacing);
    root.style.setProperty('--brand-animation-style', branding.animationStyle);
    root.style.setProperty('--brand-button-style', branding.buttonStyle);

    // Apply font family
    if (branding.fontFamily) {
        const fontFamily = getFontFamilyCSS(branding.fontFamily);
        root.style.setProperty('--brand-font-family', fontFamily);
    }

    // Apply background pattern only to live preview (handled in UnifiedBrandingPreview component)
    // Remove global background pattern application
};

// Helper function to get font family CSS
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


export const useBrandingState = () => {
    const [branding, setBrandingState] = useState(globalBrandingState);
    const [logo, setLogoState] = useState(globalLogoState);
    const [logoUrl, setLogoUrlState] = useState(globalLogoUrlState);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

    // Subscribe to global state changes
    useEffect(() => {
        const listener = () => {
            setBrandingState(globalBrandingState);
            setLogoState(globalLogoState);
            setLogoUrlState(globalLogoUrlState);
        };

        listeners.add(listener);

        // Load branding from database and apply initial branding to DOM
        loadBrandingFromDatabase();
        applyBrandingToDOM(globalBrandingState);

        return () => listeners.delete(listener);
    }, []);

    const setBranding = async (newBranding) => {
        if (typeof newBranding === 'function') {
            globalBrandingState = newBranding(globalBrandingState);
        } else {
            globalBrandingState = { ...globalBrandingState, ...newBranding };
        }
        applyBrandingToDOM(globalBrandingState);
        notifyListeners();

        // Debounce database saves to avoid too many API calls
        clearTimeout(setBranding.saveTimeout);
        setBranding.saveTimeout = setTimeout(async () => {
            try {
                await saveBrandingToDatabase(globalBrandingState);
            } catch (error) {
                console.error('Failed to save branding to database:', error);
            }
        }, 1000); // Save after 1 second of inactivity
    };

    const setLogo = (newLogo) => {
        globalLogoState = newLogo;
        notifyListeners();
    };

    const setLogoUrl = (newLogoUrl) => {
        globalLogoUrlState = newLogoUrl;
        notifyListeners();
    };

    const ping = (msg, type = "success") => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(''), 3000);
    };

    const isValidHexColor = (color) => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    };

    const handleColorChange = (colorType, value) => {
        if (value === '' || isValidHexColor(value)) {
            setBranding(prev => ({ ...prev, [colorType]: value }));
        }
    };

    const saveBranding = async () => {
        setLoading(true);
        try {
            await saveBrandingToDatabase(globalBrandingState);
            ping('✅ Branding saved to your account!');
        } catch (error) {
            console.error('Failed to save branding:', error);
            ping('Failed to save branding', 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetToDefaults = async () => {
        try {
            setLogo(null);
            setLogoUrl('');
            const defaultBranding = {
                primaryColor: '#F3C77E',
                secondaryColor: '#702632',
                accentColor: '#d6a856',
                fontFamily: 'inter',
                menuLayout: 'single-column',
                cornerRadius: 12,
                contentSpacing: 'comfortable',
                backgroundPattern: 'none',
                animationStyle: 'subtle',
                buttonStyle: 'rounded',
                customCSS: ''
            };
            setBranding(defaultBranding);
            await BrandingService.resetBranding();
            ping('✅ Branding reset to defaults and saved to your account!');
        } catch (error) {
            console.error('Failed to reset branding:', error);
            ping('Failed to reset branding', 'error');
        }
    };

    const exportBranding = () => {
        try {
            const brandingData = {
                ...globalBrandingState,
                logoUrl: globalLogoUrlState,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(brandingData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scandish-branding-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            ping('✅ Branding settings exported successfully!');
        } catch (error) {
            console.error('Failed to export branding:', error);
            ping('Failed to export branding', 'error');
        }
    };

    const importBranding = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);

                    // Validate imported data
                    if (!importedData.primaryColor || !importedData.secondaryColor || !importedData.accentColor) {
                        throw new Error('Invalid branding file format');
                    }

                    // Apply imported branding
                    const normalizeMenuLayout = (value) => {
                        switch ((value || '').toLowerCase()) {
                            case 'single-column':
                            case 'singlecolumn':
                                return 'single-column';
                            case 'two-column':
                            case 'twocolumn':
                            case 'two column':
                                return 'two-column';
                            case 'grid':
                                return 'grid';
                            case 'card':
                            case 'card-based':
                            case 'card based':
                                return 'card-based';
                            case 'classic':
                            case 'minimal':
                            default:
                                return 'single-column';
                        }
                    };

                    const normalizedLayout = normalizeMenuLayout(importedData.menuLayout);
                    const normalizedStyle = (importedData.menuStyle || '').toLowerCase() || (importedData.menuLayout === 'minimal' ? 'minimal' : 'minimal');

                    setBranding({
                        primaryColor: importedData.primaryColor,
                        secondaryColor: importedData.secondaryColor,
                        accentColor: importedData.accentColor,
                        fontFamily: importedData.fontFamily || 'inter',
                        menuLayout: normalizedLayout,
                        menuStyle: normalizedStyle,
                        cornerRadius: importedData.cornerRadius || 12,
                        contentSpacing: importedData.contentSpacing || 'comfortable',
                        backgroundPattern: importedData.backgroundPattern || 'none',
                        animationStyle: importedData.animationStyle || 'subtle',
                        buttonStyle: importedData.buttonStyle || 'rounded',
                        customCSS: importedData.customCSS || ''
                    });

                    if (importedData.logoUrl) {
                        setLogoUrl(importedData.logoUrl);
                    }

                    ping('✅ Branding settings imported successfully!');
                    resolve();
                } catch (error) {
                    console.error('Failed to import branding:', error);
                    ping('Failed to import branding: Invalid file format', 'error');
                    reject(error);
                }
            };
            reader.onerror = () => {
                ping('Failed to read branding file', 'error');
                reject(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        });
    };

    return {
        branding,
        setBranding,
        logo,
        setLogo,
        logoUrl,
        setLogoUrl,
        loading,
        setLoading,
        toast,
        setToast,
        ping,
        isValidHexColor,
        handleColorChange,
        saveBranding,
        resetToDefaults,
        exportBranding,
        importBranding
    };
};
