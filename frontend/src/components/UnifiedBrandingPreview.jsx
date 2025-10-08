import React, { useState, useEffect } from 'react';
import { useBrandingState } from '../hooks/useBrandingState';
import { useAuth } from '../context/AuthContext';
import MenuContentService from '../services/menuContentService';

export default function UnifiedBrandingPreview({ title, items }) {
    const { branding, logoUrl } = useBrandingState();
    const { user } = useAuth();
    const [savedMenuContent, setSavedMenuContent] = useState(null);
    const [loadingContent, setLoadingContent] = useState(false);

    // Load saved menu content if no items provided
    useEffect(() => {
        if ((!items || items.length === 0) && user?.id) {
            setLoadingContent(true);
            MenuContentService.loadMenuContent(user.id)
                .then(content => {
                    if (content) {
                        setSavedMenuContent(content);
                    }
                })
                .catch(error => {
                    console.error('Failed to load saved menu content:', error);
                })
                .finally(() => {
                    setLoadingContent(false);
                });
        }
    }, [items, user?.id]);

    // Listen for menu content updates
    useEffect(() => {
        const handleMenuContentUpdate = (event) => {
            if (event.detail?.menuContent) {
                setSavedMenuContent(event.detail.menuContent);
            }
        };

        window.addEventListener('menuContentUpdated', handleMenuContentUpdate);
        return () => {
            window.removeEventListener('menuContentUpdated', handleMenuContentUpdate);
        };
    }, []);

    // Use provided items, saved content, or default sample items
    const menuItems = items || savedMenuContent?.items || [
        {
            id: 1,
            name: "Grilled Salmon",
            description: "Fresh Atlantic salmon with herbs and lemon",
            price: 24.99,
            category: "Mains",
            emoji: "🐟"
        },
        {
            id: 2,
            name: "Caesar Salad",
            description: "Crisp romaine lettuce with parmesan and croutons",
            price: 12.99,
            category: "Appetizers",
            emoji: "🥗"
        },
        {
            id: 3,
            name: "Chocolate Cake",
            description: "Rich chocolate cake with vanilla ice cream",
            price: 8.99,
            category: "Desserts",
            emoji: "🍰"
        }
    ];

    // Use provided title, saved title, or default
    const menuTitle = title || savedMenuContent?.title || "Sample Restaurant";

    // Group menu items by category
    const groupedItems = menuItems.reduce((acc, item) => {
        const category = item.category || 'Menu Items';
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    // Get font family CSS
    const getFontFamily = () => {
        switch (branding.fontFamily) {
            case 'poppins': return '"Poppins", system-ui, sans-serif';
            case 'playfair': return '"Playfair Display", serif';
            case 'roboto': return '"Roboto", system-ui, sans-serif';
            case 'openSans': return '"Open Sans", system-ui, sans-serif';
            case 'montserrat': return '"Montserrat", system-ui, sans-serif';
            case 'lora': return '"Lora", serif';
            case 'sourceSans': return '"Source Sans Pro", system-ui, sans-serif';
            case 'inter': return '"Inter", system-ui, sans-serif';
            default: return '"Inter", system-ui, sans-serif';
        }
    };

    // Get layout styles based on menu layout
    const getLayoutStyles = () => {
        const baseStyles = {
            fontFamily: getFontFamily(),
            '--brand-primary': branding.primaryColor,
            '--brand-secondary': branding.secondaryColor,
            '--brand-accent': branding.accentColor,
            '--brand-background': branding.backgroundColor || '#ffffff',
            '--brand-font-family': getFontFamily(),
            '--corner-radius': `${branding.cornerRadius}px`,
        };

        return baseStyles;
    };

    // Get animation class based on animation style
    const getAnimationClass = () => {
        switch (branding.animationStyle) {
            case 'subtle':
                return 'hover:scale-[1.02] transition-transform duration-200';
            case 'smooth':
                return 'hover:scale-[1.03] transition-all duration-300 ease-out';
            case 'bouncy':
                return 'hover:scale-[1.05] transition-all duration-200 ease-bounce';
            case 'elegant':
                return 'hover:scale-[1.025] transition-all duration-500 ease-in-out';
            case 'none':
            default:
                return 'transition-colors duration-200';
        }
    };

    // Get button styles based on button style
    const getButtonStyles = () => {
        switch (branding.buttonStyle) {
            case 'rounded':
                return { borderRadius: `${branding.cornerRadius}px` };
            case 'sharp':
                return { borderRadius: '0px' };
            case 'pill':
                return { borderRadius: '9999px' };
            default:
                return { borderRadius: `${branding.cornerRadius}px` };
        }
    };

    // Get spacing based on content spacing
    const getSpacing = () => {
        switch (branding.contentSpacing) {
            case 'compact':
                return '1rem';
            case 'spacious':
                return '2rem';
            case 'comfortable':
            default:
                return '1.5rem';
        }
    };

    // Get menu items container classes based on layout
    const getMenuItemsContainerClasses = () => {
        const gap = branding.contentSpacing === 'compact' ? 'gap-3' : branding.contentSpacing === 'spacious' ? 'gap-8' : 'gap-5';
        const spaceY = branding.contentSpacing === 'compact' ? 'space-y-2' : branding.contentSpacing === 'spacious' ? 'space-y-6' : 'space-y-4';
        switch (branding.menuLayout) {
            case 'two-column':
                return `grid grid-cols-1 sm:grid-cols-2 ${gap}`;
            case 'grid':
                return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${gap}`;
            case 'card-based':
                return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gap}`;
            default:
                return spaceY;
        }
    };

    // Get menu item classes based on layout and style
    const getMenuItemClasses = () => {
        const padding = getPaddingClassFromSpacing();
        const baseClasses = `rounded-lg ${padding} transition-shadow ${getAnimationClass()}`;

        // First apply menu layout specific classes
        let layoutClasses = '';
        switch (branding.menuLayout) {
            case 'grid':
                layoutClasses = 'hover:shadow-md';
                break;
            case 'card-based':
                layoutClasses = 'shadow-sm hover:shadow-md';
                break;
            default:
                layoutClasses = '';
        }

        // Then apply menu style classes
        let styleClasses = '';
        switch (branding.menuStyle) {
            case 'minimal':
                styleClasses = 'bg-white border-0 shadow-none';
                break;
            case 'elegant':
                styleClasses = 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg';
                break;
            case 'modern':
                styleClasses = 'bg-white border-2 border-gray-300 shadow-xl';
                break;
            case 'classic':
                styleClasses = 'bg-amber-50 border border-amber-200 shadow-md';
                break;
            case 'luxury':
                styleClasses = 'bg-gradient-to-br from-gray-900 to-black text-white border border-gray-700 shadow-2xl';
                break;
            default:
                styleClasses = 'bg-white border border-gray-200 shadow-sm';
        }

        return `${baseClasses} ${layoutClasses} ${styleClasses}`.trim();
    };

    // Helper to map content spacing to padding classes
    const getPaddingClassFromSpacing = () => {
        if (branding.compactMode) return 'p-3 sm:p-4';
        switch (branding.contentSpacing) {
            case 'compact':
                return 'p-3 sm:p-4';
            case 'spacious':
                return 'p-6 sm:p-8';
            case 'comfortable':
            default:
                return 'p-4 sm:p-6';
        }
    };

    // Get item display style based on item display setting
    const getItemDisplayStyle = () => {
        const baseStyle = 'block';

        // Don't add border-b for grid and card layouts
        if (branding.menuLayout === 'grid' || branding.menuLayout === 'card-based') {
            return baseStyle;
        }

        // Add border-b for single column layouts
        if (branding.itemDisplay === 'name-only') {
            return `${baseStyle} border-b border-gray-100 pb-2`;
        } else {
            return `${baseStyle} border-b border-gray-100 pb-3`;
        }
    };

    // Get text color classes based on menu style and background
    const getTextColorClasses = () => {
        const isDarkBackground = branding.backgroundColor === '#1a1a1a' || branding.backgroundColor === '#000000';

        if (branding.menuStyle === 'luxury' || isDarkBackground) {
            return {
                title: 'text-white',
                description: 'text-gray-300',
                calories: 'text-gray-400'
            };
        }
        return {
            title: 'text-gray-800',
            description: 'text-gray-600',
            calories: 'text-gray-500'
        };
    };

    // Get price style based on price display setting
    const getPriceStyle = () => {
        const isDarkBackground = branding.backgroundColor === '#1a1a1a' || branding.backgroundColor === '#000000';

        switch (branding.priceStyle) {
            case 'inline':
                return 'font-bold';
            case 'separate':
                return 'font-bold';
            case 'minimal':
                return isDarkBackground ? 'font-medium text-gray-400' : 'font-medium text-gray-500';
            default:
                return 'font-bold';
        }
    };

    // Get category style based on category style setting
    const getCategoryStyle = () => {
        const isDarkBackground = branding.backgroundColor === '#1a1a1a' || branding.backgroundColor === '#000000';

        switch (branding.categoryStyle) {
            case 'headers':
                return {
                    color: isDarkBackground ? '#ffffff' : '#000000'
                };
            case 'dividers':
                return {
                    borderBottom: `2px solid var(--brand-primary)`,
                    paddingBottom: '0.5rem',
                    marginBottom: '1rem',
                    color: isDarkBackground ? '#ffffff' : '#000000'
                };
            case 'badges':
                return {
                    backgroundColor: 'var(--brand-primary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    display: 'inline-block',
                    marginBottom: '0.75rem'
                };
            case 'icons':
                return {
                    icon: '📋 '
                };
            default:
                return {
                    color: isDarkBackground ? '#ffffff' : '#000000'
                };
        }
    };

    const layoutStyles = getLayoutStyles();
    const buttonStyles = getButtonStyles();
    const spacing = getSpacing();

    // Show loading state if content is being loaded
    if (loadingContent) {
        return (
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden p-6">
                <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F3C77E] mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm">Loading menu content...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            data-menu-preview="true"
            data-menu-items={JSON.stringify(menuItems)}
            data-branding-state={JSON.stringify(branding)}
            data-menu-content={JSON.stringify(savedMenuContent)}
            className="relative w-full max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden"
            style={{
                ...layoutStyles,
                backgroundColor: 'var(--brand-background)',
                color: branding.backgroundColor === '#1a1a1a' || branding.backgroundColor === '#000000' ? '#ffffff' : '#000000'
            }}
        >
            {/* Background Pattern */}
            {branding.backgroundPattern !== 'none' && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: branding.backgroundPattern === 'gradient'
                            ? `linear-gradient(135deg, ${branding.primaryColor}40, ${branding.accentColor}30)`
                            : branding.backgroundPattern === 'subtle-dots'
                                ? `radial-gradient(circle, ${branding.primaryColor}50 2px, transparent 2px)`
                                : branding.backgroundPattern === 'grid'
                                    ? `linear-gradient(${branding.secondaryColor}40 2px, transparent 2px), linear-gradient(90deg, ${branding.secondaryColor}40 2px, transparent 2px)`
                                    : branding.backgroundPattern === 'diagonal'
                                        ? `repeating-linear-gradient(45deg, transparent, transparent 15px, ${branding.primaryColor}30 15px, ${branding.primaryColor}30 30px)`
                                        : branding.backgroundPattern === 'noise'
                                            ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.2'/%3E%3C/svg%3E")`
                                            : branding.backgroundPattern === 'organic'
                                                ? `radial-gradient(ellipse at top, ${branding.primaryColor}30, transparent), radial-gradient(ellipse at bottom, ${branding.accentColor}30, transparent)`
                                                : 'transparent',
                        backgroundSize: branding.backgroundPattern === 'subtle-dots' ? '20px 20px' :
                            branding.backgroundPattern === 'grid' ? '30px 30px' : 'auto',
                        opacity: 0.6,
                    }}
                />
            )}

            {/* Main Content */}
            <div className="relative p-4 sm:p-6 lg:p-8 min-h-[400px]">
                {/* Header with Logo */}
                <div className="flex items-center gap-4 mb-4 sm:mb-6 relative z-10">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt="Restaurant Logo"
                            className="w-12 h-12 object-contain"
                            style={{ borderRadius: `var(--corner-radius)` }}
                        />
                    )}
                    <div>
                        <h2
                            className="text-2xl font-bold"
                            style={{
                                color: 'var(--brand-secondary)',
                                fontFamily: 'var(--brand-font-family)'
                            }}
                        >
                            {menuTitle}
                        </h2>
                        <p
                            className="text-sm opacity-75"
                            style={{
                                color: branding.backgroundColor === '#1a1a1a' || branding.backgroundColor === '#000000'
                                    ? 'var(--brand-accent)'
                                    : 'var(--brand-primary)'
                            }}
                        >
                            Authentic flavors, crafted with love
                        </p>
                    </div>
                </div>

                {/* Menu Categories */}
                <div className="relative z-10" style={{ marginBottom: spacing }}>
                    {Object.entries(groupedItems).map(([categoryName, categoryItems], categoryIndex) => {
                        const categoryStyle = getCategoryStyle();
                        return (
                            <div key={categoryName} style={{ marginBottom: categoryIndex < Object.keys(groupedItems).length - 1 ? spacing : 0 }}>
                                <h3
                                    className="text-lg font-semibold mb-3"
                                    style={{
                                        color: 'var(--brand-primary)',
                                        fontFamily: 'var(--brand-font-family)',
                                        ...categoryStyle
                                    }}
                                >
                                    {categoryStyle.icon} {categoryName}
                                </h3>

                                {/* Menu Items using dynamic layout */}
                                <div className={getMenuItemsContainerClasses()}>
                                    {categoryItems.map(item => {
                                        const renderMenuItem = (item) => (
                                            <div key={item.id} className={`${getItemDisplayStyle()} ${getMenuItemClasses()}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        {/* Food Photos */}
                                                        {item.photos && item.photos.length > 0 && (
                                                            <div className="mb-2">
                                                                <div className="flex gap-1 overflow-x-auto">
                                                                    {item.photos.slice(0, 3).map((photo, index) => (
                                                                        <img
                                                                            key={photo.id || index}
                                                                            src={photo.url}
                                                                            alt={photo.name || `Food photo ${index + 1}`}
                                                                            className="w-12 h-12 object-cover rounded border border-[#40434E]/20"
                                                                        />
                                                                    ))}
                                                                    {item.photos.length > 3 && (
                                                                        <div className="w-12 h-12 bg-[#40434E]/20 rounded border border-[#40434E]/20 flex items-center justify-center text-xs text-[#a7a7a7]">
                                                                            +{item.photos.length - 3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center">
                                                            {item.emoji && (
                                                                <span className="text-lg mr-2">{item.emoji}</span>
                                                            )}
                                                            <h4 className={`font-medium ${getTextColorClasses().title}`}>
                                                                {item.name}
                                                            </h4>
                                                        </div>
                                                        {(branding.itemDisplay === 'name-description' || branding.itemDisplay === 'full-details') && item.description && (
                                                            <p className={`text-sm ${getTextColorClasses().description} mt-1`}>
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        {branding.showAllergens && (branding.itemDisplay === 'full-details') && (
                                                            <div className="flex gap-1 mt-2">
                                                                <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">Gluten</span>
                                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Dairy</span>
                                                            </div>
                                                        )}
                                                        {branding.showCalories && (branding.itemDisplay === 'full-details') && (
                                                            <p className={`text-xs ${getTextColorClasses().calories} mt-1`}>
                                                                {Math.floor(Math.random() * 400) + 200} calories
                                                            </p>
                                                        )}
                                                    </div>
                                                    {(branding.itemDisplay === 'name-price' || branding.itemDisplay === 'full-details') && (
                                                        <div className={`ml-4 font-bold ${getPriceStyle()}`} style={{ color: 'var(--brand-primary)' }}>
                                                            {item.price === "" || item.price === null || isNaN(item.price)
                                                                ? "Market Price"
                                                                : `$${Number(item.price).toFixed(2)}`}
                                                        </div>
                                                    )}
                                                </div>
                                                {branding.priceStyle === 'separate' && (branding.itemDisplay === 'name-description' || branding.itemDisplay === 'full-details') && (
                                                    <div className={`font-bold ${getPriceStyle()}`} style={{ color: 'var(--brand-primary)' }}>
                                                        {item.price === "" || item.price === null || isNaN(item.price)
                                                            ? "Market Price"
                                                            : `$${Number(item.price).toFixed(2)}`}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                        return renderMenuItem(item);
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Call to Action */}
                <div className="mt-6 text-center relative z-10">
                    <button
                        className={`px-8 py-3 font-medium text-white ${getAnimationClass()}`}
                        style={{
                            ...buttonStyles,
                            backgroundColor: 'var(--brand-secondary)',
                            fontFamily: 'var(--brand-font-family)'
                        }}
                    >
                        View Full Menu
                    </button>
                </div>
            </div>

            {/* Custom CSS Preview */}
            {branding.customCSS && (
                <div className="mt-4 p-4 bg-[#0a0908] rounded-xl border border-[#40434E]/20">
                    <h4 className="text-sm font-medium text-white mb-2">Custom CSS Applied</h4>
                    <pre className="text-xs text-[#a7a7a7] overflow-x-auto">
                        <code>{branding.customCSS}</code>
                    </pre>
                </div>
            )}
        </div>
    );
}