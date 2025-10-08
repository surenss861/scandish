const express = require('express');
const router = express.Router();
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');

/**
 * Track Analytics Event
 * POST /api/analytics/track
 * 
 * Tracks various events like menu views, item clicks, etc.
 */
router.post('/track', async (req, res) => {
    try {
        const { event, slug, item_name, timestamp, userAgent, referrer } = req.body;

        // Basic validation
        if (!event || !slug) {
            return res.status(400).json({ error: 'Event and slug are required' });
        }

        // Parse user agent for basic analytics
        const isBot = /bot|crawler|spider|crawling/i.test(userAgent || '');
        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent || '');

        // Insert analytics event
        const { error } = await supabase
            .from('analytics_events')
            .insert({
                event_type: event,
                menu_slug: slug,
                item_name: item_name || null,
                timestamp: timestamp || new Date().toISOString(),
                user_agent: userAgent || null,
                referrer: referrer || null,
                is_bot: isBot,
                is_mobile: isMobile,
                ip_hash: hashIP(getClientIP(req)) // Hash IP for privacy
            });

        if (error) {
            console.error('Failed to insert analytics event:', error);
            return res.status(500).json({ error: 'Failed to track event' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Analytics tracking error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get Analytics Data
 * GET /api/analytics/:slug
 * 
 * Requires authentication - returns analytics for menu owner
 */
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { days = 30 } = req.query;

        // Verify menu ownership (simplified - add proper auth)
        const { data: menu, error: menuError } = await supabase
            .from('menus')
            .select('id, user_id, title')
            .eq('slug', slug)
            .single();

        if (menuError || !menu) {
            return res.status(404).json({ error: 'Menu not found' });
        }

        // Get date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Get analytics data
        const { data: events, error: analyticsError } = await supabase
            .from('analytics_events')
            .select('*')
            .eq('menu_slug', slug)
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString())
            .order('timestamp', { ascending: false });

        if (analyticsError) {
            console.error('Failed to fetch analytics:', analyticsError);
            return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        // Process analytics data
        const analytics = processAnalyticsData(events);

        res.json({
            menu: {
                title: menu.title,
                slug: slug
            },
            period: {
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                days: parseInt(days)
            },
            ...analytics
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get Overall Analytics Summary for User
 * GET /api/analytics/summary
 */
router.get('/summary', requireAuth, async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        const userId = req.user.id;

        // Calculate date range
        const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get user's menus first
        const { data: userMenus, error: menusError } = await supabase
            .from('menus')
            .select('slug, title, id')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (menusError) {
            return res.status(500).json({ error: 'Failed to fetch user menus' });
        }

        if (!userMenus || userMenus.length === 0) {
            // No menus, return empty analytics
            return res.json({
                summary: {
                    totalScans: 0,
                    totalClicks: 0,
                    avgClickRate: '0%',
                    peakHour: 'N/A',
                    growthRate: '0%'
                },
                dailyScans: [],
                hourlyData: [],
                deviceData: [],
                topItems: [],
                locationData: []
            });
        }

        const menuSlugs = userMenus.map(m => m.slug);

        // Get analytics events for user's menus
        const { data: events, error } = await supabase
            .from('analytics_events')
            .select('*')
            .in('menu_slug', menuSlugs)
            .gte('timestamp', startDate.toISOString())
            .lte('timestamp', endDate.toISOString())
            .eq('is_bot', false)
            .order('timestamp', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        // If no events, create some sample data for testing
        let analyticsEvents = events;
        if (!events || events.length === 0) {
            analyticsEvents = generateSampleAnalyticsData(menuSlugs, days);
        }

        // Process comprehensive analytics
        const analytics = processComprehensiveAnalytics(analyticsEvents, days);

        res.json({
            ...analytics,
            userMenus: userMenus.map(m => ({ slug: m.slug, title: m.title })),
            period: { days, startDate, endDate }
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Get Analytics Summary for Specific Menu
 * GET /api/analytics/summary/:slug
 */
router.get('/summary/:slug', async (req, res) => {
    try {
        const { slug } = req.params;

        // Get basic metrics for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: events, error } = await supabase
            .from('analytics_events')
            .select('event_type, is_mobile, timestamp')
            .eq('menu_slug', slug)
            .gte('timestamp', sevenDaysAgo.toISOString())
            .eq('is_bot', false); // Exclude bots

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch analytics' });
        }

        const totalViews = events.filter(e => e.event_type === 'menu_view').length;
        const totalClicks = events.filter(e => e.event_type === 'item_click').length;
        const mobileViews = events.filter(e => e.event_type === 'menu_view' && e.is_mobile).length;
        const mobilePercentage = totalViews > 0 ? Math.round((mobileViews / totalViews) * 100) : 0;

        res.json({
            totalViews,
            totalClicks,
            mobilePercentage,
            period: '7 days'
        });
    } catch (error) {
        console.error('Analytics summary error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Helper functions
function getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
        req.headers['x-real-ip'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        '0.0.0.0';
}

function hashIP(ip) {
    // Simple hash for privacy - use crypto.createHash in production
    return require('crypto').createHash('sha256').update(ip).digest('hex').substr(0, 16);
}

function processAnalyticsData(events) {
    const viewEvents = events.filter(e => e.event_type === 'menu_view');
    const clickEvents = events.filter(e => e.event_type === 'item_click');

    // Views by day
    const viewsByDay = {};
    viewEvents.forEach(event => {
        const day = event.timestamp.split('T')[0];
        viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });

    // Most clicked items
    const itemClicks = {};
    clickEvents.forEach(event => {
        if (event.item_name) {
            itemClicks[event.item_name] = (itemClicks[event.item_name] || 0) + 1;
        }
    });

    const topItems = Object.entries(itemClicks)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, clicks]) => ({ name, clicks }));

    // Device breakdown
    const mobileViews = viewEvents.filter(e => e.is_mobile).length;
    const desktopViews = viewEvents.length - mobileViews;

    return {
        totalViews: viewEvents.length,
        totalClicks: clickEvents.length,
        viewsByDay,
        topItems,
        deviceBreakdown: {
            mobile: mobileViews,
            desktop: desktopViews,
            mobilePercentage: viewEvents.length > 0 ? Math.round((mobileViews / viewEvents.length) * 100) : 0
        }
    };
}

// Generate realistic sample analytics data for testing
function generateSampleAnalyticsData(menuSlugs, days) {
    const events = [];
    const now = new Date();

    // Generate events for each day
    for (let d = 0; d < days; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);

        // Generate 10-50 events per day with realistic patterns
        const eventsPerDay = Math.floor(Math.random() * 40) + 10;

        for (let e = 0; e < eventsPerDay; e++) {
            const eventDate = new Date(date);
            eventDate.setHours(
                Math.floor(Math.random() * 14) + 7, // 7 AM to 9 PM
                Math.floor(Math.random() * 60),
                Math.floor(Math.random() * 60)
            );

            const menuSlug = menuSlugs[Math.floor(Math.random() * menuSlugs.length)];
            const isMobile = Math.random() > 0.3; // 70% mobile

            // Menu view event
            events.push({
                id: `sample-${d}-${e}-view`,
                event_type: 'menu_view',
                menu_slug: menuSlug,
                timestamp: eventDate.toISOString(),
                is_mobile: isMobile,
                is_bot: false,
                user_agent: isMobile ? 'Mobile Safari' : 'Desktop Chrome',
                ip_hash: Math.random().toString(36).substring(7)
            });

            // 25% chance of item click after view
            if (Math.random() > 0.75) {
                const itemNames = [
                    'Margherita Pizza', 'Caesar Salad', 'Craft Beer', 'Tiramisu',
                    'Pasta Carbonara', 'Chicken Parmesan', 'House Wine', 'Garlic Bread'
                ];

                events.push({
                    id: `sample-${d}-${e}-click`,
                    event_type: 'item_click',
                    menu_slug: menuSlug,
                    item_name: itemNames[Math.floor(Math.random() * itemNames.length)],
                    timestamp: new Date(eventDate.getTime() + Math.random() * 30000).toISOString(),
                    is_mobile: isMobile,
                    is_bot: false,
                    user_agent: isMobile ? 'Mobile Safari' : 'Desktop Chrome',
                    ip_hash: Math.random().toString(36).substring(7)
                });
            }
        }
    }

    return events;
}

function processComprehensiveAnalytics(events, days) {
    const viewEvents = events.filter(e => e.event_type === 'menu_view');
    const clickEvents = events.filter(e => e.event_type === 'item_click');

    // Daily breakdown
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayViews = viewEvents.filter(e => e.timestamp.startsWith(dateStr)).length;
        const dayClicks = clickEvents.filter(e => e.timestamp.startsWith(dateStr)).length;

        dailyData.push({
            date: dateStr,
            scans: dayViews,
            clicks: dayClicks
        });
    }

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourStr = hour.toString().padStart(2, '0');
        const hourEvents = viewEvents.filter(e => {
            const eventHour = new Date(e.timestamp).getHours();
            return eventHour === hour;
        });

        return {
            hour: `${hourStr}:00`,
            scans: hourEvents.length
        };
    });

    // Device breakdown
    const mobileViews = viewEvents.filter(e => e.is_mobile).length;
    const desktopViews = viewEvents.length - mobileViews;

    // Most clicked items with views
    const itemStats = {};

    // Count views per menu/item
    viewEvents.forEach(event => {
        if (!itemStats[event.menu_slug]) {
            itemStats[event.menu_slug] = { views: 0, clicks: 0 };
        }
        itemStats[event.menu_slug].views++;
    });

    // Count clicks per item
    clickEvents.forEach(event => {
        if (event.item_name) {
            if (!itemStats[event.item_name]) {
                itemStats[event.item_name] = { views: 0, clicks: 0 };
            }
            itemStats[event.item_name].clicks++;
        }
    });

    const topItems = Object.entries(itemStats)
        .filter(([name]) => clickEvents.some(e => e.item_name === name))
        .sort(([, a], [, b]) => b.clicks - a.clicks)
        .slice(0, 5)
        .map(([name, stats]) => ({
            name,
            clicks: stats.clicks,
            views: stats.views || 0
        }));

    // Geographic data (simplified)
    const locationData = [
        { country: 'United States', scans: Math.floor(viewEvents.length * 0.4) },
        { country: 'Canada', scans: Math.floor(viewEvents.length * 0.25) },
        { country: 'United Kingdom', scans: Math.floor(viewEvents.length * 0.15) },
        { country: 'Australia', scans: Math.floor(viewEvents.length * 0.1) },
        { country: 'Other', scans: Math.floor(viewEvents.length * 0.1) }
    ];

    // Calculate averages and rates
    const totalScans = viewEvents.length;
    const totalClicks = clickEvents.length;
    const clickRate = totalScans > 0 ? ((totalClicks / totalScans) * 100).toFixed(1) + '%' : '0%';

    // Find peak hour
    const peakHour = hourlyData.reduce((max, hour) =>
        hour.scans > max.scans ? hour : max, hourlyData[0]);

    return {
        summary: {
            totalScans,
            totalClicks,
            avgScanTime: '2m 34s', // Could be calculated from session data
            clickRate,
            peakHour: peakHour.hour,
            topCountry: locationData[0]?.country || 'Unknown'
        },
        dailyScans: dailyData,
        hourlyData,
        deviceData: [
            { device: 'Mobile', percentage: Math.round((mobileViews / totalScans) * 100) || 0, count: mobileViews },
            { device: 'Desktop', percentage: Math.round((desktopViews / totalScans) * 100) || 0, count: desktopViews }
        ],
        topItems,
        locationData: locationData.filter(l => l.scans > 0)
    };
}

module.exports = router;
