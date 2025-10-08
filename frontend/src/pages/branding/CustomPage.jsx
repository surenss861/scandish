import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, Save, Plus, Trash2, Edit3, Layout, Download, Eye, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import { useAuth } from '../../context/AuthContext';
import TemplateService from '../../services/templateService';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';
import MenuContentService from '../../services/menuContentService';

export default function CustomPage() {
    const { branding, setBranding, loading, toast, ping, saveBranding, resetToDefaults } = useBrandingState();
    const { user } = useAuth();

    // Menu content state
    const [menuContent, setMenuContent] = useState(MenuContentService.getDefaultMenuContent());
    const [editingItem, setEditingItem] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [menuContentLoading, setMenuContentLoading] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Photo upload state
    const [uploadingPhotos, setUploadingPhotos] = useState({});
    const fileInputRef = useRef(null);

    // Menu content management functions
    const addMenuItem = () => {
        const newItem = {
            id: Date.now(),
            name: "",
            description: "",
            price: 0,
            category: "New Category",
            emoji: "🍽️",
            photos: []
        };
        setMenuContent(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setEditingItem(newItem.id);
        setShowAddForm(false);
    };

    const updateMenuItem = (id, field, value) => {
        setMenuContent(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const deleteMenuItem = (id) => {
        setMenuContent(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
        setEditingItem(null);
    };

    const getUniqueCategories = () => {
        return [...new Set(menuContent.items.map(item => item.category))];
    };

    const handleCategoryChange = (itemId, newCategory) => {
        if (newCategory === "New Category") {
            const categoryName = prompt("Enter new category name:");
            if (categoryName && categoryName.trim()) {
                updateMenuItem(itemId, 'category', categoryName.trim());
            }
        } else {
            updateMenuItem(itemId, 'category', newCategory);
        }
    };

    // Photo upload functions
    const handlePhotoUpload = async (itemId, files) => {
        if (!files || files.length === 0) return;

        setUploadingPhotos(prev => ({ ...prev, [itemId]: true }));

        try {
            const uploadedPhotos = [];

            for (const file of files) {
                // Convert file to base64 for storage
                const base64 = await convertToBase64(file);
                uploadedPhotos.push({
                    id: Date.now() + Math.random(),
                    url: base64,
                    name: file.name,
                    size: file.size
                });
            }

            // Update the menu item with new photos
            updateMenuItem(itemId, 'photos', uploadedPhotos);
            ping(`Successfully uploaded ${uploadedPhotos.length} photo(s)!`, 'success');
        } catch (error) {
            console.error('Photo upload failed:', error);
            ping('Failed to upload photos. Please try again.', 'error');
        } finally {
            setUploadingPhotos(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const removePhoto = (itemId, photoId) => {
        const item = menuContent.items.find(item => item.id === itemId);
        if (item) {
            const updatedPhotos = item.photos.filter(photo => photo.id !== photoId);
            updateMenuItem(itemId, 'photos', updatedPhotos);
        }
    };

    const triggerPhotoUpload = (itemId) => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute('data-item-id', itemId);
            fileInputRef.current.click();
        }
    };

    // Load menu content from database
    const loadMenuContent = async () => {
        if (!user?.id) return;

        try {
            setMenuContentLoading(true);
            const savedContent = await MenuContentService.loadMenuContent(user.id);
            if (savedContent) {
                setMenuContent(savedContent);
            }
        } catch (error) {
            console.error('Failed to load menu content:', error);
            ping('Failed to load saved menu content', 'error');
        } finally {
            setMenuContentLoading(false);
        }
    };

    // Save menu content to database
    const saveMenuContent = async () => {
        if (!user?.id) return;

        try {
            setMenuContentLoading(true);
            await MenuContentService.saveMenuContent(user.id, menuContent);
            ping('Menu content saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save menu content:', error);
            ping('Failed to save menu content', 'error');
        } finally {
            setMenuContentLoading(false);
        }
    };

    // Load menu content on component mount
    useEffect(() => {
        loadMenuContent();
        loadTemplates();
    }, [user?.id]);

    // Load templates
    const loadTemplates = async () => {
        try {
            const result = await TemplateService.getTemplates();
            if (result.success) {
                setTemplates(result.templates);
            } else {
                const builtIn = TemplateService.getBuiltInTemplates();
                setTemplates(builtIn.templates);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
            const builtIn = TemplateService.getBuiltInTemplates();
            setTemplates(builtIn.templates);
        }
    };

    // Apply template
    const applyTemplate = async (template) => {
        try {
            // Apply branding settings
            await setBranding(template.branding);

            // Apply menu content
            setMenuContent(template.menuContent);
            await saveMenuContent(template.menuContent);

            toast('Template applied successfully!', 'success');
            setShowTemplates(false);
        } catch (error) {
            console.error('Failed to apply template:', error);
            toast('Failed to apply template. Please try again.', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Custom Menu Content</h2>
                    <p className="text-[#a7a7a7] text-sm">Write and edit your restaurant's menu items</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowTemplates(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2a2926] border border-[#40434E]/40 rounded-xl text-white hover:border-[#F3C77E]/50 transition-colors"
                    >
                        <Layout size={16} />
                        Browse Templates
                    </button>
                    <button
                        onClick={saveMenuContent}
                        disabled={menuContentLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-transform disabled:opacity-60"
                    >
                        <Save size={16} />
                        {menuContentLoading ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Menu Content Editor */}
                <div className="space-y-6">

                    {/* Menu Content */}
                    <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <FileText size={20} className="text-[#F3C77E]" />
                                Menu Content
                            </h3>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="flex items-center gap-2 px-3 py-2 bg-[#F3C77E] text-black rounded-lg text-sm font-medium hover:bg-[#d6a856] transition-colors"
                            >
                                <Plus size={16} />
                                Add Item
                            </button>
                        </div>

                        {/* Restaurant Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">Restaurant Name</label>
                            <input
                                type="text"
                                value={menuContent.title}
                                onChange={(e) => setMenuContent(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#1a1917] border border-[#40434E]/40 rounded-lg text-white placeholder-[#a7a7a7] focus:border-[#F3C77E] focus:outline-none"
                                placeholder="Enter restaurant name"
                            />
                        </div>

                        {/* Menu Items by Category */}
                        {getUniqueCategories().map(category => (
                            <div key={category} className="mb-4">
                                <h4 className="text-sm font-medium text-[#F3C77E] mb-2 flex items-center gap-2">
                                    <span>📋</span> {category}
                                </h4>
                                <div className="space-y-2">
                                    {menuContent.items.filter(item => item.category === category).map(item => (
                                        <div key={item.id} className="bg-[#1a1917] border border-[#40434E]/40 rounded-lg p-3">
                                            {editingItem === item.id ? (
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={item.name}
                                                            onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                                                            placeholder="Item name"
                                                            className="flex-1 px-2 py-1 bg-[#0f0e0c] border border-[#40434E]/40 rounded text-white text-sm placeholder-[#a7a7a7] focus:border-[#F3C77E] focus:outline-none"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={item.emoji}
                                                            onChange={(e) => updateMenuItem(item.id, 'emoji', e.target.value)}
                                                            placeholder="🍽️"
                                                            className="w-12 px-2 py-1 bg-[#0f0e0c] border border-[#40434E]/40 rounded text-center text-white text-sm focus:border-[#F3C77E] focus:outline-none"
                                                        />
                                                    </div>
                                                    <textarea
                                                        value={item.description}
                                                        onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)}
                                                        placeholder="Item description"
                                                        rows={2}
                                                        className="w-full px-2 py-1 bg-[#0f0e0c] border border-[#40434E]/40 rounded text-white text-sm placeholder-[#a7a7a7] focus:border-[#F3C77E] focus:outline-none resize-none"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            value={item.price}
                                                            onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            className="w-20 px-2 py-1 bg-[#0f0e0c] border border-[#40434E]/40 rounded text-white text-sm placeholder-[#a7a7a7] focus:border-[#F3C77E] focus:outline-none"
                                                        />
                                                        <select
                                                            value={item.category}
                                                            onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                                                            className="flex-1 px-2 py-1 bg-[#0f0e0c] border border-[#40434E]/40 rounded text-white text-sm focus:border-[#F3C77E] focus:outline-none"
                                                        >
                                                            {getUniqueCategories().map(cat => (
                                                                <option key={cat} value={cat}>{cat}</option>
                                                            ))}
                                                            <option value="New Category">+ New Category</option>
                                                        </select>
                                                    </div>

                                                    {/* Photo Upload Section */}
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-[#F3C77E]">Food Photos</label>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => triggerPhotoUpload(item.id)}
                                                                disabled={uploadingPhotos[item.id]}
                                                                className="flex items-center gap-2 px-3 py-1 bg-[#2a2926] border border-[#40434E]/40 rounded text-white text-xs hover:border-[#F3C77E]/50 transition-colors disabled:opacity-50"
                                                            >
                                                                <Upload size={12} />
                                                                {uploadingPhotos[item.id] ? 'Uploading...' : 'Add Photos'}
                                                            </button>
                                                            <span className="text-xs text-[#a7a7a7]">
                                                                {item.photos?.length || 0} photo(s)
                                                            </span>
                                                        </div>

                                                        {/* Photo Preview */}
                                                        {item.photos && item.photos.length > 0 && (
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.photos.map((photo) => (
                                                                    <div key={photo.id} className="relative group">
                                                                        <img
                                                                            src={photo.url}
                                                                            alt={photo.name}
                                                                            className="w-16 h-16 object-cover rounded border border-[#40434E]/40"
                                                                        />
                                                                        <button
                                                                            onClick={() => removePhoto(item.id, photo.id)}
                                                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setEditingItem(null)}
                                                            className="px-3 py-1 bg-[#40434E] text-white rounded text-sm hover:bg-[#505050] transition-colors"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => deleteMenuItem(item.id)}
                                                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{item.emoji}</span>
                                                        <div>
                                                            <h5 className="text-white font-medium">{item.name}</h5>
                                                            <p className="text-[#a7a7a7] text-sm">{item.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[#F3C77E] font-bold">${item.price.toFixed(2)}</span>
                                                        <button
                                                            onClick={() => setEditingItem(item.id)}
                                                            className="p-1 text-[#a7a7a7] hover:text-white transition-colors"
                                                        >
                                                            <Edit3 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Hidden file input for photo uploads */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const itemId = parseInt(e.target.getAttribute('data-item-id'));
                            if (itemId && e.target.files) {
                                handlePhotoUpload(itemId, Array.from(e.target.files));
                            }
                            e.target.value = ''; // Reset input
                        }}
                        className="hidden"
                    />
                </div>

                {/* Live Preview */}
                <div>
                    <UnifiedBrandingPreview title={menuContent.title} items={menuContent.items} />
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

            {/* Template Selection Modal */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1917] border border-[#40434E]/40 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#40434E]/40">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">Choose a Template</h2>
                                <p className="text-[#d6d6d6]">Select a professional template to get started quickly</p>
                            </div>
                            <button
                                onClick={() => setShowTemplates(false)}
                                className="p-3 bg-[#2a2926] border border-[#40434E]/40 rounded-lg hover:border-[#F3C77E]/50 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Template Grid */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template, index) => (
                                    <motion.div
                                        key={template.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="bg-[#2a2926] border border-[#40434E]/40 rounded-xl overflow-hidden hover:border-[#F3C77E]/50 transition-all duration-300"
                                    >
                                        {/* Template Preview */}
                                        <div className="h-48 bg-gradient-to-br from-[#40434E]/20 to-[#1a1917] relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#F3C77E]/20 to-transparent"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">🍽️</div>
                                                    <div className="text-sm text-[#d6d6d6]">{template.name}</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
                                            <p className="text-[#d6d6d6] text-sm mb-4 line-clamp-2">
                                                {template.description}
                                            </p>

                                            {/* Template Features */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="px-2 py-1 bg-[#1a1917] text-xs rounded-full text-[#d6d6d6]">
                                                    {template.branding.menuLayout}
                                                </span>
                                                <span className="px-2 py-1 bg-[#1a1917] text-xs rounded-full text-[#d6d6d6]">
                                                    {template.branding.menuStyle}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedTemplate(template)}
                                                    className="flex-1 px-3 py-2 bg-[#1a1917] border border-[#40434E]/40 rounded-lg text-white hover:border-[#F3C77E]/50 transition-colors text-sm"
                                                >
                                                    <Eye className="w-4 h-4 inline mr-2" />
                                                    Preview
                                                </button>
                                                <button
                                                    onClick={() => applyTemplate(template)}
                                                    className="flex-1 px-3 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                                                >
                                                    <Download className="w-4 h-4 inline mr-2" />
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Template Preview Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1a1917] border border-[#40434E]/40 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
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
                                    className="px-6 py-3 bg-gradient-to-r from-[#F3C77E] to-[#d4a574] text-[#080705] rounded-lg hover:shadow-lg transition-all font-medium"
                                >
                                    Apply Template
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
                            <div className="border border-[#40434E]/40 rounded-xl overflow-hidden">
                                <UnifiedBrandingPreview
                                    title={selectedTemplate.menuContent.title}
                                    items={selectedTemplate.menuContent.items}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
