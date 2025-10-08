import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext();

export const useBranding = () => {
    const context = useContext(BrandingContext);
    if (!context) {
        throw new Error('useBranding must be used within a BrandingProvider');
    }
    return context;
};

export const BrandingProvider = ({ children }) => {
    const [branding, setBranding] = useState({
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
    });
    const [logo, setLogo] = useState(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState('');

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
            console.log('Saving branding:', { logoUrl, ...branding });
            ping('✅ Branding saved and applied!');
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
            setBranding({
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
            });
            ping('✅ Branding reset to defaults!');
        } catch (error) {
            console.error('Failed to reset branding:', error);
            ping('Failed to reset branding', 'error');
        }
    };

    const value = {
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
        resetToDefaults
    };

    return (
        <BrandingContext.Provider value={value}>
            {children}
        </BrandingContext.Provider>
    );
};
