/**
 * Template Service for managing restaurant branding templates
 * Provides professional, ready-to-use templates for different restaurant types
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class TemplateService {
    /**
     * Get all available templates
     */
    async getTemplates() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch templates:', error);
            return { success: false, error: 'Failed to fetch templates' };
        }
    }

    /**
     * Get templates by category
     */
    async getTemplatesByCategory(category) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates/category/${category}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch templates by category:', error);
            return { success: false, error: 'Failed to fetch templates' };
        }
    }

    /**
     * Get a specific template by ID
     */
    async getTemplate(templateId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch template:', error);
            return { success: false, error: 'Failed to fetch template' };
        }
    }

    /**
     * Apply a template to user's branding
     */
    async applyTemplate(templateId, userId) {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to apply template:', error);
            return { success: false, error: 'Failed to apply template' };
        }
    }

    /**
     * Get built-in templates (fallback when API is not available)
     */
    getBuiltInTemplates() {
        return {
            success: true,
            templates: [
                // Italian Restaurant Templates
                {
                    id: 'italian-classic',
                    name: 'Classic Italian',
                    category: 'italian',
                    description: 'Traditional Italian restaurant with warm colors and elegant typography',
                    preview: '/templates/italian-classic-preview.jpg',
                    branding: {
                        primaryColor: '#8B4513',
                        secondaryColor: '#D2691E',
                        accentColor: '#F4A460',
                        fontFamily: 'playfair',
                        menuLayout: 'single-column',
                        menuStyle: 'elegant',
                        cornerRadius: 8,
                        contentSpacing: 'comfortable',
                        animationStyle: 'smooth',
                        buttonStyle: 'rounded',
                        backgroundPattern: 'gradient'
                    },
                    menuContent: {
                        title: 'Bella Vista',
                        items: [
                            {
                                id: 1,
                                name: 'Spaghetti Carbonara',
                                description: 'Classic Roman pasta with eggs, pecorino cheese, and pancetta',
                                price: 18.99,
                                category: 'Pasta',
                                emoji: '🍝'
                            },
                            {
                                id: 2,
                                name: 'Margherita Pizza',
                                description: 'Fresh mozzarella, San Marzano tomatoes, and basil',
                                price: 16.99,
                                category: 'Pizza',
                                emoji: '🍕'
                            },
                            {
                                id: 3,
                                name: 'Tiramisu',
                                description: 'Traditional Italian dessert with coffee and mascarpone',
                                price: 8.99,
                                category: 'Desserts',
                                emoji: '🍰'
                            }
                        ]
                    }
                },
                {
                    id: 'italian-modern',
                    name: 'Modern Italian',
                    category: 'italian',
                    description: 'Contemporary Italian with clean lines and bold colors',
                    preview: '/templates/italian-modern-preview.jpg',
                    branding: {
                        primaryColor: '#2C3E50',
                        secondaryColor: '#E74C3C',
                        accentColor: '#F39C12',
                        fontFamily: 'montserrat',
                        menuLayout: 'two-column',
                        menuStyle: 'modern',
                        cornerRadius: 12,
                        contentSpacing: 'spacious',
                        animationStyle: 'bounce',
                        buttonStyle: 'pill',
                        backgroundPattern: 'subtle-dots'
                    },
                    menuContent: {
                        title: 'Nonna\'s Kitchen',
                        items: [
                            {
                                id: 1,
                                name: 'Truffle Risotto',
                                description: 'Creamy Arborio rice with wild mushrooms and truffle oil',
                                price: 24.99,
                                category: 'Risotto',
                                emoji: '🍄'
                            },
                            {
                                id: 2,
                                name: 'Burrata Caprese',
                                description: 'Fresh burrata with heirloom tomatoes and basil oil',
                                price: 14.99,
                                category: 'Appetizers',
                                emoji: '🧀'
                            }
                        ]
                    }
                },

                // Asian Restaurant Templates
                {
                    id: 'asian-fusion',
                    name: 'Asian Fusion',
                    category: 'asian',
                    description: 'Modern Asian fusion with vibrant colors and contemporary design',
                    preview: '/templates/asian-fusion-preview.jpg',
                    branding: {
                        primaryColor: '#E53E3E',
                        secondaryColor: '#FFD700',
                        accentColor: '#38A169',
                        fontFamily: 'poppins',
                        menuLayout: 'grid',
                        menuStyle: 'modern',
                        cornerRadius: 16,
                        contentSpacing: 'comfortable',
                        animationStyle: 'smooth',
                        buttonStyle: 'rounded',
                        backgroundPattern: 'organic'
                    },
                    menuContent: {
                        title: 'Zen Garden',
                        items: [
                            {
                                id: 1,
                                name: 'Dragon Roll',
                                description: 'Spicy tuna, avocado, and cucumber with eel sauce',
                                price: 15.99,
                                category: 'Sushi',
                                emoji: '🍣'
                            },
                            {
                                id: 2,
                                name: 'Pad Thai',
                                description: 'Stir-fried rice noodles with shrimp and tamarind sauce',
                                price: 13.99,
                                category: 'Noodles',
                                emoji: '🍜'
                            }
                        ]
                    }
                },

                // American Restaurant Templates
                {
                    id: 'american-diner',
                    name: 'Classic Diner',
                    category: 'american',
                    description: 'Retro American diner with vintage charm and comfort food',
                    preview: '/templates/american-diner-preview.jpg',
                    branding: {
                        primaryColor: '#DC2626',
                        secondaryColor: '#F59E0B',
                        accentColor: '#FFFFFF',
                        fontFamily: 'roboto',
                        menuLayout: 'single-column',
                        menuStyle: 'classic',
                        cornerRadius: 4,
                        contentSpacing: 'compact',
                        animationStyle: 'none',
                        buttonStyle: 'sharp',
                        backgroundPattern: 'diagonal'
                    },
                    menuContent: {
                        title: 'Mama\'s Diner',
                        items: [
                            {
                                id: 1,
                                name: 'Classic Burger',
                                description: 'Beef patty with lettuce, tomato, onion, and special sauce',
                                price: 12.99,
                                category: 'Burgers',
                                emoji: '🍔'
                            },
                            {
                                id: 2,
                                name: 'Chicken & Waffles',
                                description: 'Crispy fried chicken with fluffy Belgian waffles',
                                price: 14.99,
                                category: 'Breakfast',
                                emoji: '🧇'
                            }
                        ]
                    }
                },

                // Fine Dining Templates
                {
                    id: 'fine-dining-luxury',
                    name: 'Luxury Fine Dining',
                    category: 'fine-dining',
                    description: 'Upscale fine dining with sophisticated elegance and premium feel',
                    preview: '/templates/fine-dining-luxury-preview.jpg',
                    branding: {
                        primaryColor: '#1A1A1A',
                        secondaryColor: '#C0C0C0',
                        accentColor: '#FFD700',
                        fontFamily: 'playfair',
                        menuLayout: 'single-column',
                        menuStyle: 'luxury',
                        cornerRadius: 0,
                        contentSpacing: 'spacious',
                        animationStyle: 'subtle',
                        buttonStyle: 'outline',
                        backgroundPattern: 'gradient'
                    },
                    menuContent: {
                        title: 'Le Château',
                        items: [
                            {
                                id: 1,
                                name: 'Wagyu Beef Tenderloin',
                                description: 'A5 Wagyu with truffle jus and seasonal vegetables',
                                price: 89.99,
                                category: 'Main Course',
                                emoji: '🥩'
                            },
                            {
                                id: 2,
                                name: 'Lobster Thermidor',
                                description: 'Maine lobster with cognac cream and gruyère cheese',
                                price: 65.99,
                                category: 'Seafood',
                                emoji: '🦞'
                            }
                        ]
                    }
                },

                // Casual Dining Templates
                {
                    id: 'casual-modern',
                    name: 'Modern Casual',
                    category: 'casual',
                    description: 'Contemporary casual dining with fresh, approachable design',
                    preview: '/templates/casual-modern-preview.jpg',
                    branding: {
                        primaryColor: '#2563EB',
                        secondaryColor: '#10B981',
                        accentColor: '#F59E0B',
                        fontFamily: 'inter',
                        menuLayout: 'card-based',
                        menuStyle: 'modern',
                        cornerRadius: 12,
                        contentSpacing: 'comfortable',
                        animationStyle: 'smooth',
                        buttonStyle: 'rounded',
                        backgroundPattern: 'subtle-dots'
                    },
                    menuContent: {
                        title: 'The Local',
                        items: [
                            {
                                id: 1,
                                name: 'Farm Fresh Salad',
                                description: 'Mixed greens with seasonal vegetables and house vinaigrette',
                                price: 11.99,
                                category: 'Salads',
                                emoji: '🥗'
                            },
                            {
                                id: 2,
                                name: 'Artisan Sandwich',
                                description: 'House-made bread with local ingredients and fresh herbs',
                                price: 13.99,
                                category: 'Sandwiches',
                                emoji: '🥪'
                            }
                        ]
                    }
                },

                // Coffee Shop Templates
                {
                    id: 'coffee-shop-cozy',
                    name: 'Cozy Coffee Shop',
                    category: 'coffee',
                    description: 'Warm and inviting coffee shop with rustic charm',
                    preview: '/templates/coffee-shop-cozy-preview.jpg',
                    branding: {
                        primaryColor: '#8B4513',
                        secondaryColor: '#D2B48C',
                        accentColor: '#F5DEB3',
                        fontFamily: 'lora',
                        menuLayout: 'single-column',
                        menuStyle: 'minimal',
                        cornerRadius: 8,
                        contentSpacing: 'comfortable',
                        animationStyle: 'subtle',
                        buttonStyle: 'rounded',
                        backgroundPattern: 'noise'
                    },
                    menuContent: {
                        title: 'Brew & Bean',
                        items: [
                            {
                                id: 1,
                                name: 'Signature Latte',
                                description: 'House blend espresso with steamed milk and latte art',
                                price: 4.99,
                                category: 'Coffee',
                                emoji: '☕'
                            },
                            {
                                id: 2,
                                name: 'Avocado Toast',
                                description: 'Sourdough with smashed avocado, cherry tomatoes, and seeds',
                                price: 8.99,
                                category: 'Breakfast',
                                emoji: '🥑'
                            }
                        ]
                    }
                },

                // Fast Casual Templates
                {
                    id: 'fast-casual-healthy',
                    name: 'Healthy Fast Casual',
                    category: 'fast-casual',
                    description: 'Fresh and healthy fast casual with vibrant, energetic design',
                    preview: '/templates/fast-casual-healthy-preview.jpg',
                    branding: {
                        primaryColor: '#22C55E',
                        secondaryColor: '#3B82F6',
                        accentColor: '#F59E0B',
                        fontFamily: 'poppins',
                        menuLayout: 'grid',
                        menuStyle: 'modern',
                        cornerRadius: 16,
                        contentSpacing: 'spacious',
                        animationStyle: 'bounce',
                        buttonStyle: 'pill',
                        backgroundPattern: 'organic'
                    },
                    menuContent: {
                        title: 'Green Bowl',
                        items: [
                            {
                                id: 1,
                                name: 'Power Bowl',
                                description: 'Quinoa, kale, chickpeas, and tahini dressing',
                                price: 12.99,
                                category: 'Bowls',
                                emoji: '🥗'
                            },
                            {
                                id: 2,
                                name: 'Acai Smoothie',
                                description: 'Acai berries, banana, and coconut milk',
                                price: 7.99,
                                category: 'Smoothies',
                                emoji: '🥤'
                            }
                        ]
                    }
                }
            ]
        };
    }

    /**
     * Get template categories
     */
    getTemplateCategories() {
        return [
            {
                id: 'all',
                name: 'All Templates',
                description: 'Browse all available templates',
                icon: '🎨',
                count: 12
            },
            {
                id: 'italian',
                name: 'Italian',
                description: 'Traditional and modern Italian restaurant styles',
                icon: '🍝',
                count: 2
            },
            {
                id: 'asian',
                name: 'Asian',
                description: 'Asian fusion and traditional Asian cuisine',
                icon: '🍜',
                count: 1
            },
            {
                id: 'american',
                name: 'American',
                description: 'Classic American diner and comfort food',
                icon: '🍔',
                count: 1
            },
            {
                id: 'fine-dining',
                name: 'Fine Dining',
                description: 'Upscale and luxury dining experiences',
                icon: '🍷',
                count: 1
            },
            {
                id: 'casual',
                name: 'Casual',
                description: 'Relaxed and approachable dining',
                icon: '🍽️',
                count: 1
            },
            {
                id: 'coffee',
                name: 'Coffee Shop',
                description: 'Coffee shops and cafes',
                icon: '☕',
                count: 1
            },
            {
                id: 'fast-casual',
                name: 'Fast Casual',
                description: 'Quick service with quality ingredients',
                icon: '🥗',
                count: 1
            }
        ];
    }

    /**
     * Search templates
     */
    searchTemplates(query) {
        const templates = this.getBuiltInTemplates().templates;
        const searchQuery = query.toLowerCase();

        return templates.filter(template =>
            template.name.toLowerCase().includes(searchQuery) ||
            template.description.toLowerCase().includes(searchQuery) ||
            template.category.toLowerCase().includes(searchQuery)
        );
    }

    /**
     * Get featured templates
     */
    getFeaturedTemplates() {
        const templates = this.getBuiltInTemplates().templates;
        return templates.slice(0, 6); // First 6 templates as featured
    }

    /**
     * Get template preview data
     */
    getTemplatePreview(templateId) {
        const templates = this.getBuiltInTemplates().templates;
        const template = templates.find(t => t.id === templateId);

        if (!template) {
            return null;
        }

        return {
            id: template.id,
            name: template.name,
            category: template.category,
            description: template.description,
            branding: template.branding,
            menuContent: template.menuContent,
            preview: template.preview
        };
    }
}

export default new TemplateService();

