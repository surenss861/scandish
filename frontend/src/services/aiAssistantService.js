/**
 * AI Assistant Service for interacting with Ollama backend
 * Provides advanced AI capabilities for menu and branding assistance
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class AIAssistantService {
    /**
     * Check if Ollama service is available
     */
    async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ollama/health`);
            const data = await response.json();
            return {
                success: response.ok,
                available: data.available,
                models: data.models || [],
                error: data.error
            };
        } catch (error) {
            return {
                success: false,
                available: false,
                error: 'Failed to connect to AI service'
            };
        }
    }

    /**
     * Get available AI models
     */
    async getAvailableModels() {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/ollama/models`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to fetch available models'
            };
        }
    }

    /**
     * Pull a specific model
     */
    async pullModel(modelName) {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/ollama/models/pull`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ modelName })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to pull model'
            };
        }
    }

    /**
     * Generate menu suggestions
     */
    async generateMenuSuggestions(cuisineType, preferences = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ollama/generate-menu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cuisine: cuisineType,
                    dietary: preferences.dietary || '',
                    style: preferences.style || 'modern',
                    itemsCount: preferences.itemsCount || 8
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Menu generation error:', error);
            return {
                success: false,
                error: 'Failed to generate menu suggestions'
            };
        }
    }

    /**
     * Generate branding suggestions
     */
    async generateBrandingSuggestions(restaurantConcept) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ollama/branding-ideas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurantName: restaurantConcept.name || 'My Restaurant',
                    cuisine: restaurantConcept.cuisine || 'modern',
                    style: restaurantConcept.style || 'contemporary',
                    elements: restaurantConcept.elements || ['colors', 'typography', 'layout']
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Branding generation error:', error);
            return {
                success: false,
                error: 'Failed to generate branding suggestions'
            };
        }
    }

    /**
     * Optimize existing menu content
     */
    async optimizeMenuContent(menuItems, optimizationGoals = []) {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/ollama/optimize/menu`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    menuItems,
                    optimizationGoals
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to optimize menu content'
            };
        }
    }

    /**
     * Generate marketing copy
     */
    async generateMarketingCopy(restaurantInfo, contentType = 'social_media') {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/ollama/generate/marketing`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    restaurantInfo,
                    contentType
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to generate marketing copy'
            };
        }
    }

    /**
     * Analyze competitors
     */
    async analyzeCompetitors(competitorData) {
        try {
            const token = localStorage.getItem('supabase.auth.token');
            const response = await fetch(`${API_BASE_URL}/api/ollama/analyze/competitors`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    competitorData
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            return {
                success: false,
                error: 'Failed to analyze competitors'
            };
        }
    }

    /**
     * General AI chat
     */
    async chat(message, context = '') {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ollama/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: message,
                    model: 'llama3.1:8b'
                })
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Chat error:', error);
            return {
                success: false,
                error: 'Failed to get AI response'
            };
        }
    }

    /**
     * Get restaurant-specific suggestions based on current branding
     */
    async getPersonalizedSuggestions(branding, menuContent) {
        const restaurantInfo = {
            branding,
            menuContent,
            context: 'personalized_suggestions'
        };

        const prompt = `Based on the current branding and menu content, provide personalized suggestions for improvement.`;

        return await this.chat(prompt, JSON.stringify(restaurantInfo));
    }

    /**
     * Generate seasonal menu items
     */
    async generateSeasonalMenuItems(season, cuisineType, currentMenu = []) {
        const restaurantInfo = {
            season,
            cuisineType,
            currentMenu,
            context: 'seasonal_menu'
        };

        const prompt = `Generate seasonal menu items for ${season} in ${cuisineType} cuisine, considering the current menu items.`;

        return await this.chat(prompt, JSON.stringify(restaurantInfo));
    }

    /**
     * Suggest pricing strategies
     */
    async suggestPricingStrategies(menuItems, location, targetAudience) {
        const restaurantInfo = {
            menuItems,
            location,
            targetAudience,
            context: 'pricing_strategy'
        };

        const prompt = `Suggest optimal pricing strategies for the menu items considering the location and target audience.`;

        return await this.chat(prompt, JSON.stringify(restaurantInfo));
    }

    /**
     * Generate promotional content
     */
    async generatePromotionalContent(restaurantInfo, promotionType, details) {
        const context = {
            restaurantInfo,
            promotionType,
            details,
            context: 'promotional_content'
        };

        const prompt = `Generate promotional content for a ${promotionType} promotion with these details: ${JSON.stringify(details)}`;

        return await this.chat(prompt, JSON.stringify(context));
    }
}

export default new AIAssistantService();

