import { supabase } from '../lib/supabaseClient';

/**
 * Service for managing menu content in the branding editor
 * This is separate from the main menu management system
 */

export class MenuContentService {
    /**
     * Save menu content for branding preview
     * @param {string} userId - User ID
     * @param {Object} menuContent - Menu content object
     * @returns {Promise<Object>} - Saved menu content
     */
    static async saveMenuContent(userId, menuContent) {
        try {
            const { data, error } = await supabase
                .from('menu_content')
                .upsert({
                    user_id: userId,
                    title: menuContent.title,
                    items: JSON.stringify(menuContent.items),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving menu content:', error);
                throw error;
            }

            const savedContent = {
                ...data,
                items: JSON.parse(data.items || '[]')
            };

            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('menuContentUpdated', {
                detail: { menuContent: savedContent }
            }));

            return savedContent;
        } catch (error) {
            console.error('MenuContentService.saveMenuContent error:', error);
            throw new Error('Failed to save menu content');
        }
    }

    /**
     * Load menu content for branding preview
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} - Menu content or null if not found
     */
    static async loadMenuContent(userId) {
        try {
            const { data, error } = await supabase
                .from('menu_content')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error loading menu content:', error);
                throw error;
            }

            if (!data) {
                return null;
            }

            return {
                ...data,
                items: JSON.parse(data.items || '[]')
            };
        } catch (error) {
            console.error('MenuContentService.loadMenuContent error:', error);
            throw new Error('Failed to load menu content');
        }
    }

    /**
     * Get default menu content
     * @returns {Object} - Default menu content
     */
    static getDefaultMenuContent() {
        return {
            title: "My Restaurant",
            items: [
                {
                    id: 1,
                    name: "Grilled Salmon",
                    description: "Fresh Atlantic salmon with herbs and lemon",
                    price: 24.99,
                    category: "Mains",
                    emoji: "🐟",
                    photos: []
                },
                {
                    id: 2,
                    name: "Caesar Salad",
                    description: "Crisp romaine lettuce with parmesan and croutons",
                    price: 12.99,
                    category: "Appetizers",
                    emoji: "🥗",
                    photos: []
                },
                {
                    id: 3,
                    name: "Chocolate Cake",
                    description: "Rich chocolate cake with vanilla ice cream",
                    price: 8.99,
                    category: "Desserts",
                    emoji: "🍰",
                    photos: []
                }
            ]
        };
    }

    /**
     * Delete menu content for user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    static async deleteMenuContent(userId) {
        try {
            const { error } = await supabase
                .from('menu_content')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting menu content:', error);
                throw error;
            }
        } catch (error) {
            console.error('MenuContentService.deleteMenuContent error:', error);
            throw new Error('Failed to delete menu content');
        }
    }
}

export default MenuContentService;
