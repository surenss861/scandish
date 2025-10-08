import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Palette, Image, Type, Layout, Sparkles, ChefHat, Download, Upload, Menu, FileText, Globe } from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar.jsx';
import { useBrandingState } from '../../hooks/useBrandingState';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { MenuContentService } from '../../services/menuContentService';
import { CustomBrandingUpgradePrompt } from '../../components/PlanUpgradePrompt';
import { usePlan } from '../../context/PlanContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const brandingTabs = [
    { id: 'logo', label: 'Logo', icon: Image, path: '/branding/logo' },
    { id: 'colors', label: 'Colors', icon: Palette, path: '/branding/colors' },
    { id: 'typography', label: 'Typography', icon: Type, path: '/branding/typography' },
    { id: 'layout', label: 'Layout', icon: Layout, path: '/branding/layout' },
    { id: 'custom', label: 'Custom', icon: FileText, path: '/branding/custom' },
    { id: 'menu', label: 'Menu', icon: Menu, path: '/branding/menu' },
    { id: 'advanced', label: 'Advanced', icon: Sparkles, path: '/branding/advanced' },
];

export default function BrandingLayout() {
    const { exportBranding, importBranding } = useBrandingState();
    const { user } = useAuth();
    const { isFree } = usePlan();
    const [isImporting, setIsImporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [locations, setLocations] = useState([]);
    const [publishLoading, setPublishLoading] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Handle section changes from sidebar
    const handleSectionChange = (sectionId) => {
        if (sectionId === 'branding') {
            // Already in branding, do nothing
            return;
        }
        // Navigate to dashboard with the selected section
        navigate(`/dashboard?section=${sectionId}`);
    };

    // Load user's locations for publishing
    const loadLocations = async () => {
        if (!user?.id) return;

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('No active session found');
            }

            const response = await fetch('/api/locations/mine', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations || []);
            }
        } catch (error) {
            console.error('Failed to load locations:', error);
        }
    };

    // Handle publishing menu to a location
    const handlePublishMenu = async (locationId) => {
        if (!user?.id || !locationId) return;

        try {
            setPublishLoading(true);

            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError || !session) {
                throw new Error('No active session found');
            }

            // Get current live preview state (not localStorage)
            const brandingData = JSON.parse(localStorage.getItem('branding') || '{}');

            // Get current menu content from the live preview
            let currentMenuContent = null;
            try {
                currentMenuContent = await MenuContentService.loadMenuContent(session.user.id);
            } catch (error) {
                console.log('No saved menu content found, using default');
            }

            // Capture the exact live preview state
            const previewElement = document.querySelector('[data-menu-preview="true"]');
            let livePreviewData = null;

            if (previewElement) {
                try {
                    const menuItemsData = previewElement.getAttribute('data-menu-items');
                    const brandingDataAttr = previewElement.getAttribute('data-branding-state');
                    const menuContentData = previewElement.getAttribute('data-menu-content');

                    livePreviewData = {
                        menuItems: menuItemsData ? JSON.parse(menuItemsData) : null,
                        branding: brandingDataAttr ? JSON.parse(brandingDataAttr) : brandingData,
                        menuContent: menuContentData ? JSON.parse(menuContentData) : null
                    };
                } catch (e) {
                    console.log('Could not parse live preview data:', e);
                    livePreviewData = {
                        menuItems: null,
                        branding: brandingData,
                        menuContent: currentMenuContent
                    };
                }
            }

            console.log('Live preview data captured:', livePreviewData);
            console.log('Session:', session);
            console.log('Location ID:', locationId);

            // Create menu data for the location with live preview state
            const menuData = {
                title: (livePreviewData?.branding?.title || brandingData.title || 'Custom Menu'),
                location_id: locationId,
                content: {
                    // Include all branding settings from live preview
                    ...(livePreviewData?.branding || brandingData),
                    // Include current menu content if available
                    menuContent: livePreviewData?.menuContent || currentMenuContent,
                    // Include current menu items from live preview
                    currentMenuItems: livePreviewData?.menuItems,
                    // Include timestamp of when menu was published
                    publishedAt: new Date().toISOString(),
                    // Mark as live preview capture
                    isLivePreview: true,
                    // Include the complete live preview state
                    livePreviewState: {
                        branding: livePreviewData?.branding || brandingData,
                        menuContent: livePreviewData?.menuContent || currentMenuContent,
                        menuItems: livePreviewData?.menuItems,
                        captureTime: new Date().toISOString(),
                        previewElementFound: !!previewElement
                    }
                }
            };

            console.log('Menu data to send:', menuData);

            const response = await fetch('/api/menus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`
                },
                body: JSON.stringify(menuData)
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.error || errorData.message || 'Failed to publish menu');
            }

            const result = await response.json();
            setShowPublishModal(false);
            alert(`Menu published successfully to ${locations.find(loc => loc.id === locationId)?.name}!`);

        } catch (error) {
            console.error('Failed to publish menu:', error);
            const errorMessage = error.message || 'Unknown error occurred';
            alert(`Failed to publish menu: ${errorMessage}`);
        } finally {
            setPublishLoading(false);
        }
    };

    // Load locations when component mounts
    useEffect(() => {
        if (user?.id) {
            loadLocations();
        }
    }, [user?.id]);


    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    // Export menu as image/PDF
    const exportMenuAsImage = async (format) => {
        try {
            setShowExportMenu(false);

            // Find the menu preview element
            const previewElement = document.querySelector('[data-menu-preview]') ||
                document.querySelector('.max-w-md.mx-auto.rounded-2xl') ||
                document.querySelector('.bg-white.rounded-2xl');

            if (!previewElement) {
                alert('Menu preview not found. Please try again.');
                return;
            }

            if (format === 'pdf') {
                // For PDF, we'll use html2canvas + jsPDF
                const canvas = await html2canvas(previewElement, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    width: previewElement.offsetWidth,
                    height: previewElement.offsetHeight
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save('menu.pdf');
            } else {
                // For PNG/JPG
                const canvas = await html2canvas(previewElement, {
                    backgroundColor: format === 'jpg' ? '#ffffff' : null,
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    width: previewElement.offsetWidth,
                    height: previewElement.offsetHeight
                });

                const link = document.createElement('a');
                link.download = `menu.${format}`;
                link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : format}`, 0.95);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Show success message
            setTimeout(() => {
                alert(`Menu exported as ${format.toUpperCase()} successfully!`);
            }, 100);

        } catch (error) {
            console.error('Export failed:', error);
            alert(`Failed to export menu as ${format.toUpperCase()}. Please try again.`);
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsImporting(true);
            try {
                await importBranding(file);
            } catch (error) {
                console.error('Import failed:', error);
            } finally {
                setIsImporting(false);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        exportBranding();
                        break;
                    case 'o':
                        e.preventDefault();
                        handleImportClick();
                        break;
                    default:
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [exportBranding, handleImportClick]);

    // Close export menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showExportMenu && !event.target.closest('.export-menu-container')) {
                setShowExportMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showExportMenu]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#080705] via-[#0a0908] to-[#0c0b0a] text-[#FFFFFA] flex">
            <DashboardSidebar activeSection="branding" onSectionChange={handleSectionChange} />

            <div className="flex-1 flex flex-col">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 bg-[#080705]/95 backdrop-blur-xl border-b border-[#40434E]/20 px-8 py-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] bg-clip-text text-transparent">
                                    Custom Branding
                                </h1>
                                <p className="text-[#d6d6d6] text-lg">
                                    Create a unique visual identity for your restaurant menu
                                </p>
                            </div>
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <button
                                            onClick={exportBranding}
                                            className="flex items-center gap-2 px-3 py-2 text-sm border border-[#40434E]/50 text-[#d6d6d6] rounded-lg hover:border-[#F3C77E]/50 transition-all duration-200"
                                            title="Export branding settings (Ctrl+S)"
                                            aria-label="Export branding settings"
                                        >
                                            <Download size={16} />
                                            Export Settings
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => setShowPublishModal(true)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:scale-105 transition-all duration-200 font-medium"
                                        title="Publish menu to a location"
                                        aria-label="Publish menu"
                                    >
                                        <Globe size={16} />
                                        Publish Menu
                                    </button>
                                    <div className="relative group export-menu-container">
                                        <button
                                            onClick={() => setShowExportMenu(!showExportMenu)}
                                            className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg hover:scale-105 transition-all duration-200 font-medium"
                                            title="Export menu as image"
                                            aria-label="Export menu as image"
                                        >
                                            <Download size={16} />
                                            Export Menu
                                        </button>
                                        {showExportMenu && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#0f0e0c] border border-[#40434E]/40 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                <button
                                                    onClick={() => exportMenuAsImage('png')}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-[#F3C77E]/10 transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">PNG</div>
                                                    <div>
                                                        <div className="font-medium">PNG Image</div>
                                                        <div className="text-xs text-[#a7a7a7]">High quality, transparent background</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => exportMenuAsImage('jpg')}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-[#F3C77E]/10 transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">JPG</div>
                                                    <div>
                                                        <div className="font-medium">JPG Image</div>
                                                        <div className="text-xs text-[#a7a7a7]">Standard quality, white background</div>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => exportMenuAsImage('pdf')}
                                                    className="w-full px-4 py-3 text-left text-white hover:bg-[#F3C77E]/10 transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">PDF</div>
                                                    <div>
                                                        <div className="font-medium">PDF Document</div>
                                                        <div className="text-xs text-[#a7a7a7]">Print-ready, scalable</div>
                                                    </div>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleImportClick}
                                        disabled={isImporting}
                                        className="flex items-center gap-2 px-3 py-2 text-sm border border-[#40434E]/50 text-[#d6d6d6] rounded-lg hover:border-[#F3C77E]/50 transition-all duration-200 disabled:opacity-50"
                                        title="Import branding settings (Ctrl+O)"
                                        aria-label="Import branding settings"
                                    >
                                        <Upload size={16} />
                                        {isImporting ? 'Importing...' : 'Import'}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[#a7a7a7]">Live Preview</p>
                                    <p className="text-xs text-[#666]">Changes apply instantly</p>
                                </div>
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border-b border-[#40434E]/20 px-8 py-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex gap-1 overflow-x-auto pb-2">
                            {brandingTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <NavLink
                                        key={tab.id}
                                        to={tab.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap group relative ${isActive
                                                ? 'bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black shadow-lg scale-105'
                                                : 'text-[#d6d6d6] hover:text-white hover:bg-[#40434E]/30 hover:scale-102'
                                            }`}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon size={20} className={isActive ? 'text-black' : 'text-[#F3C77E] group-hover:text-white'} />
                                                <span>{tab.label}</span>
                                                {isActive && (
                                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 px-8 py-8">
                    <div className="max-w-7xl mx-auto">
                        <CustomBrandingUpgradePrompt>
                            <Outlet />
                        </CustomBrandingUpgradePrompt>
                    </div>
                </div>
            </div>

            {/* Publish Menu Modal */}
            {showPublishModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f0e0c] border border-[#40434E]/40 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Globe className="text-green-400" size={24} />
                                    Publish Menu
                                </h3>
                                <p className="text-sm text-[#a7a7a7] mt-1">Choose a location to publish your menu</p>
                            </div>
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="text-[#a7a7a7] hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {locations.length === 0 ? (
                            <div className="text-center py-8">
                                <Globe className="mx-auto text-[#a7a7a7] mb-4" size={48} />
                                <h4 className="text-lg font-semibold text-white mb-2">No Locations Found</h4>
                                <p className="text-[#a7a7a7] text-sm mb-6">
                                    You need to create a location first before publishing a menu.
                                </p>
                                <button
                                    onClick={() => {
                                        setShowPublishModal(false);
                                        navigate('/dashboard?section=locations');
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium hover:scale-105 transition-all duration-200"
                                >
                                    Go to Locations
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                                {locations.map((location) => (
                                    <button
                                        key={location.id}
                                        onClick={() => handlePublishMenu(location.id)}
                                        disabled={publishLoading}
                                        className="w-full p-4 bg-[#40434E]/10 border border-[#40434E]/40 rounded-xl hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-white mb-1">{location.name}</h4>
                                                <p className="text-sm text-[#a7a7a7]">{location.address}</p>
                                                {location.city && location.state && (
                                                    <p className="text-xs text-[#666]">{location.city}, {location.state}</p>
                                                )}
                                            </div>
                                            <div className={`w-3 h-3 rounded-full ${location.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="flex-1 px-6 py-3 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden file input for import */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}