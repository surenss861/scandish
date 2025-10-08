const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class BrandingService {
    /**
     * Get user's branding settings
     * @returns {Promise<Object>} Branding settings
     */
    static async getBranding() {
        try {
            // Get token from Supabase session
            const { data: { session } } = await import('../lib/supabaseClient').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/branding`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch branding: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching branding:', error);
            throw error;
        }
    }

    /**
     * Save user's branding settings
     * @param {Object} brandingData - Branding settings to save
     * @returns {Promise<Object>} Saved branding settings
     */
    static async saveBranding(brandingData) {
        try {
            // Get token from Supabase session
            const { data: { session } } = await import('../lib/supabaseClient').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/branding`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(brandingData),
            });

            if (!response.ok) {
                throw new Error(`Failed to save branding: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving branding:', error);
            throw error;
        }
    }

    /**
     * Reset branding settings to defaults
     * @returns {Promise<Object>} Success message
     */
    static async resetBranding() {
        try {
            // Get token from Supabase session
            const { data: { session } } = await import('../lib/supabaseClient').then(m => m.supabase.auth.getSession());
            const token = session?.access_token;
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/api/branding`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to reset branding: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error resetting branding:', error);
            throw error;
        }
    }
}
