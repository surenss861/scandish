import { supabase } from '../lib/supabaseClient';

class ProfileService {
    /**
     * Get user profile data
     */
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            return null;
        }
    }

    /**
     * Create or update user profile
     */
    async saveUserProfile(userId, profileData) {
        try {
            console.log('Saving profile for user:', userId, 'with data:', profileData);

            // First, check if user record exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
                console.error('Error checking existing user:', fetchError);
                throw fetchError;
            }

            if (existingUser) {
                // User exists, update the record
                console.log('Updating existing user profile');
                const { data, error } = await supabase
                    .from('users')
                    .update({
                        restaurant_name: profileData.restaurantName || null,
                        phone: profileData.phone || null,
                        address: profileData.address || null,
                        website: profileData.website || null,
                        description: profileData.description || null
                    })
                    .eq('id', userId)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating user profile:', error);
                    throw error;
                }

                return data;
            } else {
                // User doesn't exist, create new record
                console.log('Creating new user profile');
                const { data, error } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: profileData.email,
                        restaurant_name: profileData.restaurantName || null,
                        phone: profileData.phone || null,
                        address: profileData.address || null,
                        website: profileData.website || null,
                        description: profileData.description || null
                    })
                    .select()
                    .single();

                if (error) {
                    console.error('Error creating user profile:', error);
                    throw error;
                }

                return data;
            }
        } catch (error) {
            console.error('Error in saveUserProfile:', error);
            throw error;
        }
    }

    /**
     * Update notification preferences (if we add a notifications table later)
     */
    async updateNotificationPreferences(userId, preferences) {
        try {
            // For now, we'll store this in localStorage
            // In the future, we could create a user_preferences table
            localStorage.setItem(`notification_preferences_${userId}`, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error updating notification preferences:', error);
            return false;
        }
    }

    /**
     * Get notification preferences
     */
    getNotificationPreferences(userId) {
        try {
            const stored = localStorage.getItem(`notification_preferences_${userId}`);
            return stored ? JSON.parse(stored) : {
                emailUpdates: true,
                billingReminders: true,
                newFeatures: true,
                securityAlerts: true
            };
        } catch (error) {
            console.error('Error getting notification preferences:', error);
            return {
                emailUpdates: true,
                billingReminders: true,
                newFeatures: true,
                securityAlerts: true
            };
        }
    }
}

export default new ProfileService();
