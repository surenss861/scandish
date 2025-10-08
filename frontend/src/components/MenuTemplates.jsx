import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Zap,
    Coffee,
    Pizza,
    Utensils,
    Wine,
    Truck,
    Star,
    Clock,
    CheckCircle
} from 'lucide-react';

const MENU_TEMPLATES = [
    {
        id: 'quick-cafe',
        name: 'Quick Café',
        description: 'Perfect for coffee shops and casual cafés',
        icon: Coffee,
        color: 'from-amber-400 to-orange-500',
        category: 'Café',
        items: [
            { name: 'Espresso', description: 'Rich and bold coffee shot', price: 3.50, category: 'Coffee', emoji: '☕', sort_order: 0 },
            { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 4.75, category: 'Coffee', emoji: '☕', sort_order: 1 },
            { name: 'Avocado Toast', description: 'Fresh avocado on artisan bread', price: 9.95, category: 'Food', emoji: '🥑', sort_order: 2 },
            { name: 'Croissant', description: 'Buttery, flaky French pastry', price: 3.25, category: 'Pastries', emoji: '🥐', sort_order: 3 },
            { name: 'Fresh Juice', description: 'Daily selection of cold-pressed juices', price: 6.50, category: 'Beverages', emoji: '🧃', sort_order: 4 }
        ]
    },
    {
        id: 'pizza-place',
        name: 'Pizza Restaurant',
        description: 'Classic pizza joint with appetizers and drinks',
        icon: Pizza,
        color: 'from-red-400 to-red-600',
        category: 'Pizza',
        items: [
            { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, and basil', price: 16.99, category: 'Pizza', emoji: '🍕', sort_order: 0 },
            { name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella cheese', price: 18.99, category: 'Pizza', emoji: '🍕', sort_order: 1 },
            { name: 'Garlic Bread', description: 'Warm bread with garlic butter and herbs', price: 7.99, category: 'Appetizers', emoji: '🍞', sort_order: 2 },
            { name: 'Caesar Salad', description: 'Crisp romaine with parmesan and croutons', price: 11.99, category: 'Salads', emoji: '🥗', sort_order: 3 },
            { name: 'Craft Beer', description: 'Local brewery selection on tap', price: 5.99, category: 'Beverages', emoji: '🍺', sort_order: 4 }
        ]
    },
    {
        id: 'fine-dining',
        name: 'Fine Dining',
        description: 'Elegant restaurant with premium offerings',
        icon: Utensils,
        color: 'from-purple-400 to-purple-600',
        category: 'Fine Dining',
        items: [
            { name: 'Pan-Seared Salmon', description: 'Atlantic salmon with seasonal vegetables', price: 28.95, category: 'Entrées', emoji: '🐟', sort_order: 0 },
            { name: 'Filet Mignon', description: 'Tender beef with truffle butter', price: 38.95, category: 'Entrées', emoji: '🥩', sort_order: 1 },
            { name: 'Lobster Bisque', description: 'Rich and creamy lobster soup', price: 14.95, category: 'Starters', emoji: '🦞', sort_order: 2 },
            { name: 'Crème Brûlée', description: 'Classic French dessert with vanilla bean', price: 12.95, category: 'Desserts', emoji: '🍮', sort_order: 3 },
            { name: 'Wine Pairing', description: 'Sommelier-selected wine by the glass', price: 12.00, category: 'Wine', emoji: '🍷', sort_order: 4 }
        ]
    },
    {
        id: 'food-truck',
        name: 'Food Truck',
        description: 'Mobile food service with quick bites',
        icon: Truck,
        color: 'from-green-400 to-green-600',
        category: 'Food Truck',
        items: [
            { name: 'Gourmet Burger', description: 'Grass-fed beef with artisan toppings', price: 13.95, category: 'Burgers', emoji: '🍔', sort_order: 0 },
            { name: 'Fish Tacos', description: 'Fresh catch with cabbage slaw and lime', price: 11.95, category: 'Tacos', emoji: '🌮', sort_order: 1 },
            { name: 'Loaded Fries', description: 'Crispy fries with cheese and bacon', price: 8.95, category: 'Sides', emoji: '🍟', sort_order: 2 },
            { name: 'Craft Soda', description: 'House-made sodas and flavored waters', price: 3.50, category: 'Drinks', emoji: '🥤', sort_order: 3 },
            { name: 'Churros', description: 'Cinnamon sugar churros with chocolate', price: 6.95, category: 'Desserts', emoji: '🍩', sort_order: 4 }
        ]
    },
    {
        id: 'wine-bar',
        name: 'Wine Bar',
        description: 'Sophisticated wine bar with small plates',
        icon: Wine,
        color: 'from-rose-400 to-rose-600',
        category: 'Wine Bar',
        items: [
            { name: 'Charcuterie Board', description: 'Artisanal meats, cheeses, and accompaniments', price: 24.95, category: 'Boards', emoji: '🧀', sort_order: 0 },
            { name: 'Pinot Noir', description: 'Oregon Pinot Noir, glass', price: 14.00, category: 'Red Wine', emoji: '🍷', sort_order: 1 },
            { name: 'Sauvignon Blanc', description: 'New Zealand Sauvignon Blanc, glass', price: 12.00, category: 'White Wine', emoji: '🥂', sort_order: 2 },
            { name: 'Bruschetta', description: 'Toasted bread with tomato and basil', price: 9.95, category: 'Small Plates', emoji: '🍅', sort_order: 3 },
            { name: 'Chocolate Mousse', description: 'Rich chocolate mousse with berries', price: 8.95, category: 'Desserts', emoji: '🍫', sort_order: 4 }
        ]
    }
];

export default function MenuTemplates({ onSelectTemplate, onClose }) {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    const handleSelectTemplate = (template) => {
        setSelectedTemplate(template);
        setPreviewMode(true);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            onSelectTemplate(selectedTemplate);
            onClose();
        }
    };

    const handleBack = () => {
        setPreviewMode(false);
        setSelectedTemplate(null);
    };

    if (previewMode && selectedTemplate) {
        return (
            <div className="space-y-6">
                {/* Preview Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Template Preview</h2>
                        <p className="text-[#a7a7a7] text-sm">{selectedTemplate.name} - {selectedTemplate.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 border border-[#40434E]/50 text-[#d6d6d6] rounded-xl hover:border-[#F3C77E]/50 transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleUseTemplate}
                            className="px-6 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-xl font-medium hover:scale-105 transition-transform"
                        >
                            Use This Template
                        </button>
                    </div>
                </div>

                {/* Template Preview */}
                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
                    <div className="bg-white rounded-xl p-6">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h3>
                            <div className="w-16 h-0.5 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] mx-auto"></div>
                        </div>

                        {/* Group items by category */}
                        {Object.entries(
                            selectedTemplate.items.reduce((acc, item) => {
                                const cat = item.category || 'Items';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(item);
                                return acc;
                            }, {})
                        ).map(([category, items]) => (
                            <div key={category} className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                    {category}
                                </h4>
                                <div className="space-y-3">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-lg">{item.emoji}</span>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{item.name}</h5>
                                                    <p className="text-sm text-gray-600">{item.description}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Choose a Template</h2>
                    <p className="text-[#a7a7a7] text-sm">Quick start with professionally designed menus</p>
                </div>

                <button
                    onClick={onClose}
                    className="text-[#a7a7a7] hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MENU_TEMPLATES.map((template) => {
                    const Icon = template.icon;

                    return (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className="group relative bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6 cursor-pointer hover:border-[#F3C77E]/50 transition-all duration-300"
                            onClick={() => handleSelectTemplate(template)}
                        >
                            {/* Template Icon */}
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon size={28} className="text-white" />
                            </div>

                            {/* Template Info */}
                            <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                            <p className="text-[#a7a7a7] text-sm mb-4">{template.description}</p>

                            {/* Template Stats */}
                            <div className="flex items-center justify-between text-xs text-[#a7a7a7] mb-4">
                                <span className="flex items-center gap-1">
                                    <Utensils size={12} />
                                    {template.items.length} items
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={12} />
                                    {template.category}
                                </span>
                            </div>

                            {/* Preview Button */}
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-1">
                                    {template.items.slice(0, 4).map((item, idx) => (
                                        <span key={idx} className="text-lg">{item.emoji}</span>
                                    ))}
                                    {template.items.length > 4 && (
                                        <span className="text-[#F3C77E] text-xs ml-1">+{template.items.length - 4}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-[#F3C77E] text-sm font-medium group-hover:gap-2 transition-all">
                                    <Clock size={14} />
                                    <span>2 min setup</span>
                                </div>
                            </div>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F3C77E]/5 via-transparent to-[#F3C77E]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    );
                })}
            </div>

            {/* Custom Template Option */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6 text-center"
            >
                <Zap size={32} className="mx-auto text-[#F3C77E] mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Start from Scratch</h3>
                <p className="text-[#a7a7a7] text-sm mb-4">
                    Build your menu from the ground up with complete creative control
                </p>
                <button
                    onClick={() => onSelectTemplate(null)}
                    className="px-6 py-2 border border-[#F3C77E] text-[#F3C77E] rounded-xl hover:bg-[#F3C77E] hover:text-black transition-all font-medium"
                >
                    Start Blank Menu
                </button>
            </motion.div>

            {/* Template Benefits */}
            <div className="bg-[#F3C77E]/10 border border-[#F3C77E]/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-[#F3C77E] mb-2">✨ Template Benefits</h4>
                <div className="grid md:grid-cols-3 gap-4 text-xs text-[#d6d6d6]">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#F3C77E]" />
                        <span>Professional design</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#F3C77E]" />
                        <span>Industry-tested pricing</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-[#F3C77E]" />
                        <span>Ready to customize</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
