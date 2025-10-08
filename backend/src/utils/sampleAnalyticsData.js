/**
 * Sample Analytics Data Generator
 * 
 * This utility generates realistic sample analytics data for testing the AI insights system.
 */

const { supabase } = require('../services/supabase');

class SampleAnalyticsData {
    /**
     * Generate sample analytics data for a user
     * @param {string} userId - User ID
     * @param {string} userEmail - User email
     * @param {number} days - Number of days to generate data for
     */
    static async generateSampleData(userId, userEmail, days = 30) {
        try {
            console.log(`[SampleAnalyticsData] Generating sample data for user ${userId}`);

            // First ensure user exists
            await this.ensureUserExists(userId, userEmail);

            // Generate sample menus
            const menuIds = await this.generateSampleMenus(userId);

            // Generate sample menu items
            const menuItems = await this.generateSampleMenuItems(menuIds);

            // Generate sample analytics events
            await this.generateSampleAnalyticsEvents(menuIds, days);

            // Generate sample branding settings
            await this.generateSampleBrandingSettings(userId);

            console.log(`[SampleAnalyticsData] Successfully generated sample data for user ${userId}`);
            return {
                success: true,
                menusCreated: menuIds.length,
                itemsCreated: menuItems.length,
                eventsCreated: days * 25 // Approximate events per day
            };

        } catch (error) {
            console.error('[SampleAnalyticsData] Error generating sample data:', error);
            throw error;
        }
    }

    /**
     * Ensure user exists in database
     */
    static async ensureUserExists(userId, userEmail) {
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (!existingUser) {
            console.log(`[SampleAnalyticsData] Creating user record for ${userId}`);
            await supabase
                .from('users')
                .insert({
                    id: userId,
                    email: userEmail,
                    restaurant_name: 'Sample Restaurant',
                    phone: '(555) 123-4567',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            // Create subscription
            await supabase
                .from('subscriptions')
                .insert({
                    user_id: userId,
                    plan: 'pro',
                    status: 'active',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
        }
    }

    /**
     * Generate sample menus
     */
    static async generateSampleMenus(userId) {
        const sampleMenus = [
            {
                title: 'Main Menu',
                slug: 'main-menu',
                description: 'Our signature dishes and favorites'
            },
            {
                title: 'Beverages',
                slug: 'beverages',
                description: 'Craft cocktails, wines, and specialty drinks'
            },
            {
                title: 'Desserts',
                slug: 'desserts',
                description: 'Sweet treats to end your meal perfectly'
            }
        ];

        const menuIds = [];

        for (const menu of sampleMenus) {
            const { data, error } = await supabase
                .from('menus')
                .insert({
                    user_id: userId,
                    title: menu.title,
                    slug: menu.slug,
                    description: menu.description,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select('id')
                .single();

            if (error && error.code !== '23505') { // Ignore duplicate key errors
                console.error('[SampleAnalyticsData] Error creating menu:', error);
            } else if (data) {
                menuIds.push(data.id);
            }
        }

        return menuIds;
    }

    /**
     * Generate sample menu items
     */
    static async generateSampleMenuItems(menuIds) {
        const sampleItems = [
            // Main Menu Items
            {
                name: 'Margherita Pizza',
                description: 'Fresh mozzarella, tomato sauce, and basil on our signature crust',
                price: 16.99,
                category: 'Pizza',
                emoji: '🍕'
            },
            {
                name: 'Caesar Salad',
                description: 'Crisp romaine, parmesan, croutons, and house-made caesar dressing',
                price: 12.99,
                category: 'Salads',
                emoji: '🥗'
            },
            {
                name: 'Pasta Carbonara',
                description: 'Traditional Roman pasta with eggs, cheese, and pancetta',
                price: 18.99,
                category: 'Pasta',
                emoji: '🍝'
            },
            {
                name: 'Grilled Salmon',
                description: 'Atlantic salmon with seasonal vegetables and herb butter',
                price: 24.99,
                category: 'Seafood',
                emoji: '🐟'
            },
            {
                name: 'Chicken Parmesan',
                description: 'Breaded chicken breast with marinara and mozzarella',
                price: 19.99,
                category: 'Chicken',
                emoji: '🍗'
            },
            // Beverage Items
            {
                name: 'Craft Beer',
                description: 'Local brewery selection on tap',
                price: 6.99,
                category: 'Beer',
                emoji: '🍺'
            },
            {
                name: 'House Wine',
                description: 'Red or white wine by the glass',
                price: 9.99,
                category: 'Wine',
                emoji: '🍷'
            },
            {
                name: 'Craft Cocktail',
                description: 'Artisanal cocktails made fresh by our bartender',
                price: 12.99,
                category: 'Cocktails',
                emoji: '🍸'
            },
            {
                name: 'Fresh Juice',
                description: 'Daily selection of cold-pressed juices',
                price: 5.99,
                category: 'Non-Alcoholic',
                emoji: '🧃'
            },
            // Dessert Items
            {
                name: 'Tiramisu',
                description: 'Classic Italian dessert with coffee and mascarpone',
                price: 8.99,
                category: 'Desserts',
                emoji: '🍰'
            },
            {
                name: 'Chocolate Lava Cake',
                description: 'Warm chocolate cake with molten center and vanilla ice cream',
                price: 9.99,
                category: 'Desserts',
                emoji: '🍫'
            },
            {
                name: 'Cheesecake',
                description: 'New York style cheesecake with berry compote',
                price: 7.99,
                category: 'Desserts',
                emoji: '🧀'
            }
        ];

        const createdItems = [];

        for (let i = 0; i < menuIds.length; i++) {
            const menuId = menuIds[i];
            const itemsForMenu = sampleItems.slice(i * 4, (i + 1) * 4);

            for (let j = 0; j < itemsForMenu.length; j++) {
                const item = itemsForMenu[j];
                const { data, error } = await supabase
                    .from('menu_items')
                    .insert({
                        menu_id: menuId,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        emoji: item.emoji,
                        is_available: true,
                        sort_order: j,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (error && error.code !== '23505') {
                    console.error('[SampleAnalyticsData] Error creating menu item:', error);
                } else if (data) {
                    createdItems.push(data.id);
                }
            }
        }

        return createdItems;
    }

    /**
     * Generate sample analytics events
     */
    static async generateSampleAnalyticsEvents(menuIds, days) {
        const menuSlugs = await this.getMenuSlugs(menuIds);
        const itemNames = [
            'Margherita Pizza', 'Caesar Salad', 'Pasta Carbonara', 'Grilled Salmon',
            'Chicken Parmesan', 'Craft Beer', 'House Wine', 'Craft Cocktail',
            'Fresh Juice', 'Tiramisu', 'Chocolate Lava Cake', 'Cheesecake'
        ];

        const events = [];

        // Generate events for each day
        for (let d = 0; d < days; d++) {
            const date = new Date();
            date.setDate(date.getDate() - d);

            // Generate 15-50 events per day with realistic patterns
            const eventsPerDay = Math.floor(Math.random() * 35) + 15;

            for (let e = 0; e < eventsPerDay; e++) {
                // Random time during business hours (7 AM to 10 PM)
                const eventDate = new Date(date);
                eventDate.setHours(
                    Math.floor(Math.random() * 15) + 7, // 7 AM to 9 PM
                    Math.floor(Math.random() * 60),
                    Math.floor(Math.random() * 60)
                );

                const menuSlug = menuSlugs[Math.floor(Math.random() * menuSlugs.length)];
                const isMobile = Math.random() > 0.25; // 75% mobile
                const sessionId = `session_${d}_${e}`;

                // Menu view event
                events.push({
                    event_type: 'menu_view',
                    menu_slug: menuSlug,
                    timestamp: eventDate.toISOString(),
                    is_mobile: isMobile,
                    is_bot: false,
                    user_agent: isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
                    ip_hash: Math.random().toString(36).substring(7),
                    session_id: sessionId,
                    device_type: isMobile ? 'mobile' : 'desktop'
                });

                // 30% chance of item click after view
                if (Math.random() > 0.7) {
                    const itemName = itemNames[Math.floor(Math.random() * itemNames.length)];

                    events.push({
                        event_type: 'item_click',
                        menu_slug: menuSlug,
                        item_name: itemName,
                        timestamp: new Date(eventDate.getTime() + Math.random() * 30000).toISOString(),
                        is_mobile: isMobile,
                        is_bot: false,
                        user_agent: isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
                        ip_hash: Math.random().toString(36).substring(7),
                        session_id: sessionId,
                        device_type: isMobile ? 'mobile' : 'desktop'
                    });
                }
            }
        }

        // Insert events in batches
        const batchSize = 100;
        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);
            const { error } = await supabase
                .from('analytics_events')
                .insert(batch);

            if (error) {
                console.error('[SampleAnalyticsData] Error inserting analytics events:', error);
            }
        }
    }

    /**
     * Generate sample branding settings
     */
    static async generateSampleBrandingSettings(userId) {
        const { error } = await supabase
            .from('branding_settings')
            .insert({
                user_id: userId,
                primary_color: '#F3C77E',
                secondary_color: '#702632',
                accent_color: '#d6a856',
                font_family: 'inter',
                logo_url: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (error && error.code !== '23505') {
            console.error('[SampleAnalyticsData] Error creating branding settings:', error);
        }
    }

    /**
     * Get menu slugs from menu IDs
     */
    static async getMenuSlugs(menuIds) {
        const { data, error } = await supabase
            .from('menus')
            .select('slug')
            .in('id', menuIds);

        if (error) {
            console.error('[SampleAnalyticsData] Error getting menu slugs:', error);
            return [];
        }

        return data.map(menu => menu.slug);
    }

    /**
     * Clear all sample data for a user
     */
    static async clearSampleData(userId) {
        try {
            // Delete in order to respect foreign key constraints
            await supabase.from('analytics_events').delete().in('menu_slug', [
                'main-menu', 'beverages', 'desserts'
            ]);

            await supabase.from('menu_items').delete().in('menu_id',
                await this.getMenuIdsByUser(userId)
            );

            await supabase.from('menus').delete().eq('user_id', userId);
            await supabase.from('branding_settings').delete().eq('user_id', userId);
            await supabase.from('subscriptions').delete().eq('user_id', userId);
            await supabase.from('users').delete().eq('id', userId);

            console.log(`[SampleAnalyticsData] Cleared all sample data for user ${userId}`);
            return { success: true };
        } catch (error) {
            console.error('[SampleAnalyticsData] Error clearing sample data:', error);
            throw error;
        }
    }

    /**
     * Get menu IDs for a user
     */
    static async getMenuIdsByUser(userId) {
        const { data, error } = await supabase
            .from('menus')
            .select('id')
            .eq('user_id', userId);

        if (error) {
            console.error('[SampleAnalyticsData] Error getting menu IDs:', error);
            return [];
        }

        return data.map(menu => menu.id);
    }
}

module.exports = { SampleAnalyticsData };


