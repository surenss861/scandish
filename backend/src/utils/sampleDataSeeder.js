// Sample Data Seeder for Scandish
// Populates database with realistic test data for demo purposes

const { supabase } = require('../services/supabase');

class SampleDataSeeder {

    /**
     * Seed sample data for a user
     * @param {string} userId - User ID to seed data for
     * @param {string} userEmail - User email for reference
     */
    async seedUserData(userId, userEmail) {
        try {
            console.log(`[Seeder] Seeding sample data for user: ${userEmail}`);

            // 1. Create sample user profile
            await this.createUserProfile(userId, userEmail);

            // 2. Create sample menus
            const menus = await this.createSampleMenus(userId);

            // 3. Create sample analytics events
            await this.createAnalyticsEvents(menus);

            // 4. Create sample organization (for enterprise features)
            await this.createSampleOrganization(userId);

            // 5. Set user to Pro plan for testing
            await this.createSubscription(userId);

            console.log(`[Seeder] Sample data seeded successfully for ${userEmail}`);
            return true;
        } catch (error) {
            console.error('[Seeder] Failed to seed sample data:', error);
            return false;
        }
    }

    /**
     * Create user profile
     */
    async createUserProfile(userId, userEmail) {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: userId,
                email: userEmail,
                restaurant_name: 'Demo Restaurant',
                phone: '(555) 123-4567'
            });

        if (error && error.code !== '23505') { // Ignore duplicate key errors
            throw error;
        }
    }

    /**
     * Create sample menus with items
     */
    async createSampleMenus(userId) {
        const menuTemplates = [
            {
                slug: 'main-menu',
                title: 'Main Menu',
                description: 'Our signature dishes and favorites',
                items: [
                    { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomato sauce, and basil', price: 16.99, category: 'Pizza', emoji: '🍕', sort_order: 0 },
                    { name: 'Caesar Salad', description: 'Crisp romaine, parmesan, croutons, caesar dressing', price: 12.99, category: 'Salads', emoji: '🥗', sort_order: 1 },
                    { name: 'Pasta Carbonara', description: 'Traditional Roman pasta with eggs, cheese, and pancetta', price: 18.99, category: 'Pasta', emoji: '🍝', sort_order: 2 },
                    { name: 'Grilled Salmon', description: 'Atlantic salmon with seasonal vegetables', price: 24.99, category: 'Seafood', emoji: '🐟', sort_order: 3 },
                    { name: 'Tiramisu', description: 'Classic Italian dessert with coffee and mascarpone', price: 8.99, category: 'Desserts', emoji: '🍰', sort_order: 4 }
                ]
            },
            {
                slug: 'drinks-menu',
                title: 'Beverages',
                description: 'Craft cocktails, wines, and specialty drinks',
                items: [
                    { name: 'Craft Beer', description: 'Local brewery selection on tap', price: 6.99, category: 'Beer', emoji: '🍺', sort_order: 0 },
                    { name: 'House Wine', description: 'Red or white wine by the glass', price: 9.99, category: 'Wine', emoji: '🍷', sort_order: 1 },
                    { name: 'Craft Cocktail', description: 'Artisanal cocktails made fresh', price: 12.99, category: 'Cocktails', emoji: '🍸', sort_order: 2 },
                    { name: 'Fresh Juice', description: 'Daily selection of cold-pressed juices', price: 5.99, category: 'Non-Alcoholic', emoji: '🧃', sort_order: 3 }
                ]
            }
        ];

        const createdMenus = [];

        for (const menuTemplate of menuTemplates) {
            // Create menu
            const { data: menu, error: menuError } = await supabase
                .from('menus')
                .upsert({
                    user_id: userId,
                    slug: menuTemplate.slug,
                    title: menuTemplate.title,
                    description: menuTemplate.description,
                    is_active: true
                })
                .select()
                .single();

            if (menuError && menuError.code !== '23505') {
                console.error('Menu creation error:', menuError);
                continue;
            }

            if (menu) {
                createdMenus.push(menu);

                // Create menu items
                const itemsPayload = menuTemplate.items.map(item => ({
                    menu_id: menu.id,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    category: item.category,
                    emoji: item.emoji,
                    sort_order: item.sort_order,
                    is_available: true
                }));

                const { error: itemsError } = await supabase
                    .from('menu_items')
                    .upsert(itemsPayload);

                if (itemsError) {
                    console.error('Menu items creation error:', itemsError);
                }
            }
        }

        return createdMenus;
    }

    /**
     * Create realistic analytics events
     */
    async createAnalyticsEvents(menus) {
        if (!menus || menus.length === 0) return;

        const events = [];
        const now = new Date();

        // Generate 30 days of analytics data
        for (let d = 0; d < 30; d++) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);

            // Generate 15-60 events per day
            const eventsPerDay = Math.floor(Math.random() * 45) + 15;

            for (let e = 0; e < eventsPerDay; e++) {
                const eventDate = new Date(date);
                eventDate.setHours(
                    Math.floor(Math.random() * 14) + 7, // 7 AM to 9 PM
                    Math.floor(Math.random() * 60),
                    Math.floor(Math.random() * 60)
                );

                const menu = menus[Math.floor(Math.random() * menus.length)];
                const isMobile = Math.random() > 0.22; // 78% mobile

                // Menu view event
                events.push({
                    event_type: 'menu_view',
                    menu_slug: menu.slug,
                    menu_id: menu.id,
                    timestamp: eventDate.toISOString(),
                    is_mobile: isMobile,
                    is_bot: false,
                    user_agent: isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
                    ip_hash: Math.random().toString(36).substring(7),
                    session_id: Math.random().toString(36).substring(7),
                    device_type: isMobile ? 'mobile' : 'desktop'
                });

                // 25% chance of item click
                if (Math.random() > 0.75) {
                    const itemNames = [
                        'Margherita Pizza', 'Caesar Salad', 'Pasta Carbonara', 'Grilled Salmon', 'Tiramisu',
                        'Craft Beer', 'House Wine', 'Craft Cocktail', 'Fresh Juice'
                    ];

                    events.push({
                        event_type: 'item_click',
                        menu_slug: menu.slug,
                        menu_id: menu.id,
                        item_name: itemNames[Math.floor(Math.random() * itemNames.length)],
                        timestamp: new Date(eventDate.getTime() + Math.random() * 60000).toISOString(),
                        is_mobile: isMobile,
                        is_bot: false,
                        user_agent: isMobile ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
                        ip_hash: Math.random().toString(36).substring(7),
                        session_id: Math.random().toString(36).substring(7),
                        device_type: isMobile ? 'mobile' : 'desktop'
                    });
                }
            }
        }

        // Batch insert analytics events
        const batchSize = 100;
        for (let i = 0; i < events.length; i += batchSize) {
            const batch = events.slice(i, i + batchSize);
            const { error } = await supabase
                .from('analytics_events')
                .insert(batch);

            if (error) {
                console.error('Analytics events insert error:', error);
            }
        }

        console.log(`[Seeder] Created ${events.length} analytics events`);
    }

    /**
     * Create sample organization for multi-location testing
     */
    async createSampleOrganization(userId) {
        // First, create organization
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .upsert({
                name: 'Demo Restaurant Group',
                slug: 'demo-restaurant-group',
                description: 'Sample restaurant chain for testing',
                address: '123 Business Ave, New York, NY 10001',
                phone: '(555) 987-6543',
                is_active: true
            })
            .select()
            .single();

        if (orgError && orgError.code !== '23505') {
            console.error('Organization creation error:', orgError);
            return;
        }

        if (!org) return;

        // Create organization member
        await supabase
            .from('organization_members')
            .upsert({
                organization_id: org.id,
                user_id: userId,
                role: 'owner',
                is_active: true
            });

        // Create sample locations
        const locations = [
            { name: 'Downtown Location', address: '123 Main St, New York, NY', manager: 'Sarah Johnson' },
            { name: 'Airport Branch', address: '456 Terminal Dr, New York, NY', manager: 'Mike Chen' },
            { name: 'Midtown Restaurant', address: '789 Broadway, New York, NY', manager: 'Lisa Rodriguez' }
        ];

        for (const loc of locations) {
            await supabase
                .from('locations')
                .upsert({
                    organization_id: org.id,
                    name: loc.name,
                    slug: loc.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    address: loc.address,
                    city: 'New York',
                    state: 'NY',
                    country: 'US',
                    manager_name: loc.manager,
                    is_active: true
                });
        }

        console.log('[Seeder] Created sample organization with 3 locations');
    }

    /**
     * Create Pro subscription for testing
     */
    async createSubscription(userId) {
        const { error } = await supabase
            .from('subscriptions')
            .upsert({
                user_id: userId,
                plan: 'pro',
                status: 'active',
                whop_customer_id: 'demo_customer_' + userId.substring(0, 8)
            });

        if (error && error.code !== '23505') {
            console.error('Subscription creation error:', error);
        }
    }

    /**
     * Seed data for current user (public method)
     */
    async seedCurrentUser(user) {
        if (!user?.id || !user?.email) {
            console.error('[Seeder] Invalid user data');
            return false;
        }

        return await this.seedUserData(user.id, user.email);
    }

    /**
     * Clear all sample data for a user
     */
    async clearUserData(userId) {
        try {
            console.log(`[Seeder] Clearing sample data for user: ${userId}`);

            // Delete in reverse dependency order
            await supabase.from('analytics_events').delete().eq('menu_id',
                supabase.from('menus').select('id').eq('user_id', userId)
            );
            await supabase.from('menu_items').delete().eq('menu_id',
                supabase.from('menus').select('id').eq('user_id', userId)
            );
            await supabase.from('menus').delete().eq('user_id', userId);
            await supabase.from('organization_members').delete().eq('user_id', userId);
            await supabase.from('subscriptions').delete().eq('user_id', userId);

            console.log('[Seeder] Sample data cleared');
            return true;
        } catch (error) {
            console.error('[Seeder] Failed to clear data:', error);
            return false;
        }
    }
}

module.exports = { SampleDataSeeder: new SampleDataSeeder() };

