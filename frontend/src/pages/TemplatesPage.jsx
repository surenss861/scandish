import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Download, Eye, Palette, Menu, Clock, Users, Zap, ChevronRight, Grid, List, Heart, Share2 } from 'lucide-react';
import { useBrandingState } from '../hooks/useBrandingState';
import { useAuth } from '../context/AuthContext';
import TemplateService from '../services/templateService';
import UnifiedBrandingPreview from '../components/UnifiedBrandingPreview';

export default function TemplatesPage() {
    const { setBranding } = useBrandingState();
    const { user } = useAuth();

    const [templates, setTemplates] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [applyingTemplate, setApplyingTemplate] = useState(false);

    // Load templates and categories
    useEffect(() => {
        loadTemplates();
        loadCategories();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const result = await TemplateService.getTemplates();
            if (result.success) {
                setTemplates(result.templates);
            } else {
                // Fallback to built-in templates
                const builtIn = TemplateService.getBuiltInTemplates();
                setTemplates(builtIn.templates);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            // Fallback to built-in templates
            const builtIn = TemplateService.getBuiltInTemplates();
            setTemplates(builtIn.templates);
        } finally {
            setIsLoading(false);
        }
    };

    const loadCategories = () => {
        const cats = TemplateService.getTemplateCategories();
        setCategories(cats);
    };

    // Filter templates based on category and search
    const filteredTemplates = templates.filter(template => {
        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Apply template to branding
    const applyTemplate = async (template) => {
        if (!user) {
            alert('Please log in to apply templates');
            return;
        }

        setApplyingTemplate(true);
        try {
            // Apply branding settings
            await setBranding(template.branding);

            // Show success message
            alert(`Template "${template.name}" applied successfully!`);

            // Close preview if open
            setSelectedTemplate(null);
        } catch (error) {
            console.error('Failed to apply template:', error);
            alert('Failed to apply template. Please try again.');
        } finally {
            setApplyingTemplate(false);
        }
    };

    // Preview template
    const previewTemplate = (template) => {
        setSelectedTemplate(template);
    };

    // Get category icon
    const getCategoryIcon = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.icon || '🎨';
    };

    // Get category name
    const getCategoryName = (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category?.name || 'Unknown';
    };

    return (
        <div className="min-h-screen bg-[#0f0e0c] text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-4">Restaurant Templates</h1>
                        <p className="text-xl opacity-90 mb-8">
                            Professional, ready-to-use templates for every restaurant type
                        </p>

                        {/* Search and Filters */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search templates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-0 bg-white/90 text-[#080705] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F3C77E]"
                                />
                            </div>

                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-sm font-medium">Filter by category:</span>
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-2 rounded-lg bg-white/90 text-[#080705] border-0 focus:outline-none focus:ring-2 focus:ring-[#F3C77E]"
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.icon} {category.name} ({category.count})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* View Controls */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold">
                            {selectedCategory === 'all' ? 'All Templates' : getCategoryName(selectedCategory)}
                        </h2>
                        <span className="text-[#d6d6d6]">
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-[#F3C77E] text-[#080705]' : 'bg-[#1a1917] text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-[#F3C77E] text-[#080705]' : 'bg-[#1a1917] text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Templates Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-[#1a1917] border border-[#40434E]/40 rounded-xl p-6 animate-pulse">
                                <div className="h-48 bg-[#2a2926] rounded-lg mb-4"></div>
                                <div className="h-4 bg-[#2a2926] rounded mb-2"></div>
                                <div className="h-3 bg-[#2a2926] rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                        {filteredTemplates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={`bg-[#1a1917] border border-[#40434E]/40 rounded-xl overflow-hidden hover:border-[#F3C77E]/50 transition-all duration-300 ${viewMode === 'list' ? 'flex' : ''
                                    }`}
                            >
                                {/* Template Preview */}
                                <div className={`${viewMode === 'list' ? 'w-64 h-48' : 'h-48'} bg-gradient-to-br from-[#2a2926] to-[#1a1917] relative overflow-hidden`}>
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#F3C77E]/20 to-transparent"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-4xl mb-2">{getCategoryIcon(template.category)}</div>
                                            <div className="text-sm text-[#d6d6d6]">{template.name}</div>
                                        </div>
                                    </div>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => previewTemplate(template)}
                                            className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => applyTemplate(template)}
                                            disabled={applyingTemplate}
                                            className="p-3 bg-[#F3C77E] text-[#080705] rounded-full hover:bg-[#d4a574] transition-colors disabled:opacity-50"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Template Info */}
                                <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
                                            <div className="flex items-center gap-2 text-sm text-[#d6d6d6]">
                                                <span>{getCategoryIcon(template.category)}</span>
                                                <span>{getCategoryName(template.category)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-[#F3C77E] fill-current" />
                                            <span className="text-sm text-[#d6d6d6]">4.8</span>
                                        </div>
                                    </div>

                                    <p className="text-[#d6d6d6] text-sm mb-4 line-clamp-2">
                                        {template.description}
                                    </p>

                                    {/* Template Features */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-[#2a2926] text-xs rounded-full text-[#d6d6d6]">
                                            {template.branding.menuLayout}
                                        </span>
                                        <span className="px-2 py-1 bg-[#2a2926] text-xs rounded-full text-[#d6d6d6]">
                                            {template.branding.menuStyle}
                                        </span>
                                        <span className="px-2 py-1 bg-[#2a2926] text-xs rounded-full text-[#d6d6d6]">
                                            {template.branding.fontFamily}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => previewTemplate(template)}
                                            className="flex-1 px-4 py-2 bg-[#2a2926] border border-[#40434E]/40 rounded-lg text-white hover:border-[#F3C77E]/50 transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4 inline mr-2" />
                                            Preview
                                        </button>
                                        <button
                                            onClick={() => applyTemplate(template)}
                                            disabled={applyingTemplate}
                                            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 text-sm font-medium"
                                        >
                                            {applyingTemplate ? (
                                                <>
                                                    <Clock className="w-4 h-4 inline mr-2 animate-spin" />
                                                    Applying...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4 inline mr-2" />
                                                    Apply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* No Results */}
                {!isLoading && filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-white mb-2">No templates found</h3>
                        <p className="text-[#d6d6d6] mb-6">
                            Try adjusting your search or filter criteria
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg hover:shadow-lg transition-all"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1917] border border-[#40434E]/40 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#40434E]/40">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">{selectedTemplate.name}</h2>
                                <p className="text-[#d6d6d6]">{selectedTemplate.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => applyTemplate(selectedTemplate)}
                                    disabled={applyingTemplate}
                                    className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                                >
                                    {applyingTemplate ? 'Applying...' : 'Apply Template'}
                                </button>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="p-3 bg-[#2a2926] border border-[#40434E]/40 rounded-lg hover:border-[#F3C77E]/50 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Template Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Live Preview</h3>
                                    <div className="border border-[#40434E]/40 rounded-xl overflow-hidden">
                                        <UnifiedBrandingPreview
                                            title={selectedTemplate.menuContent.title}
                                            items={selectedTemplate.menuContent.items}
                                        />
                                    </div>
                                </div>

                                {/* Template Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Template Details</h3>

                                    {/* Branding Settings */}
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-[#F3C77E] mb-2">Color Scheme</h4>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-6 rounded border border-[#40434E]/40"
                                                    style={{ backgroundColor: selectedTemplate.branding.primaryColor }}
                                                ></div>
                                                <div
                                                    className="w-6 h-6 rounded border border-[#40434E]/40"
                                                    style={{ backgroundColor: selectedTemplate.branding.secondaryColor }}
                                                ></div>
                                                <div
                                                    className="w-6 h-6 rounded border border-[#40434E]/40"
                                                    style={{ backgroundColor: selectedTemplate.branding.accentColor }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-[#F3C77E] mb-2">Typography</h4>
                                            <p className="text-sm text-[#d6d6d6] capitalize">{selectedTemplate.branding.fontFamily}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-[#F3C77E] mb-2">Layout</h4>
                                            <p className="text-sm text-[#d6d6d6] capitalize">{selectedTemplate.branding.menuLayout}</p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-medium text-[#F3C77E] mb-2">Style</h4>
                                            <p className="text-sm text-[#d6d6d6] capitalize">{selectedTemplate.branding.menuStyle}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

