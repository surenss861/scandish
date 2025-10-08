/**
 * Comprehensive Analytics Data Collector
 * 
 * This service collects all user data from Supabase and prepares it for AI analysis.
 * It aggregates data from multiple sources to provide a complete picture of user behavior.
 */

const { supabase } = require('./supabase');

class AnalyticsCollector {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Collect comprehensive analytics data for a user
     * @param {string} userId - User ID
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Object} Comprehensive analytics data
     */
    async collectUserAnalytics(userId, days = 30) {
        const cacheKey = `analytics_${userId}_${days}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            // Collect data from multiple sources in parallel
            const [
                userProfile,
                userMenus,
                analyticsEvents,
                subscriptionData,
                brandingData,
                organizationData,
                menuItems,
                sampleData
            ] = await Promise.all([
                this.getUserProfile(userId),
                this.getUserMenus(userId),
                this.getAnalyticsEvents(userId, startDate),
                this.getSubscriptionData(userId),
                this.getBrandingData(userId),
                this.getOrganizationData(userId),
                this.getMenuItems(userId),
                this.getSampleData(userId, startDate)
            ]);

            const analyticsData = {
                // User Information
                user: {
                    id: userId,
                    email: userProfile?.email,
                    restaurantName: userProfile?.restaurant_name,
                    phone: userProfile?.phone,
                    createdAt: userProfile?.created_at,
                    subscription: subscriptionData
                },

                // Menu Information
                menus: {
                    total: userMenus.length,
                    active: userMenus.filter(m => m.is_active).length,
                    items: menuItems,
                    data: userMenus.map(menu => ({
                        id: menu.id,
                        title: menu.title,
                        slug: menu.slug,
                        description: menu.description,
                        isActive: menu.is_active,
                        createdAt: menu.created_at,
                        organizationId: menu.organization_id,
                        locationId: menu.location_id
                    }))
                },

                // Analytics Events
                analytics: {
                    totalEvents: analyticsEvents.length,
                    period: {
                        start: startDate.toISOString(),
                        end: new Date().toISOString(),
                        days: days
                    },
                    events: analyticsEvents,
                    processed: this.processAnalyticsEvents(analyticsEvents, userMenus, menuItems)
                },

                // Branding & Customization
                branding: brandingData,

                // Organization Data (if applicable)
                organization: organizationData,

                // Sample Data for AI Training
                sampleData: sampleData,

                // Metadata
                metadata: {
                    collectedAt: new Date().toISOString(),
                    dataQuality: this.assessDataQuality(analyticsEvents, userMenus),
                    hasEnoughData: analyticsEvents.length >= 10,
                    recommendedAnalysis: this.recommendAnalysisType(analyticsEvents, userMenus)
                }
            };

            // Cache the results
            this.cache.set(cacheKey, {
                data: analyticsData,
                timestamp: Date.now()
            });

            return analyticsData;

        } catch (error) {
            console.error(`[AnalyticsCollector] Error collecting data for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get user profile information
     */
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            // If user doesn't exist, create a basic user record
            if (error.code === 'PGRST116') {
                console.log(`[AnalyticsCollector] User ${userId} not found, creating basic profile`);
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: 'user@example.com',
                        restaurant_name: 'My Restaurant',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (createError) {
                    console.error('[AnalyticsCollector] Failed to create user:', createError);
                    return null;
                }
                return newUser;
            }
            throw error;
        }

        return data;
    }

    /**
     * Get all user menus
     */
    async getUserMenus(userId) {
        const { data, error } = await supabase
            .from('menus')
            .select(`
                id, title, slug, description, is_active, created_at, updated_at,
                organization_id, location_id
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    }

    /**
     * Get analytics events for user's menus
     */
    async getAnalyticsEvents(userId, startDate) {
        // First get user's menu slugs
        const { data: userMenus } = await supabase
            .from('menus')
            .select('slug')
            .eq('user_id', userId);

        if (!userMenus || userMenus.length === 0) {
            return [];
        }

        const menuSlugs = userMenus.map(m => m.slug);

        const { data, error } = await supabase
            .from('analytics_events')
            .select('*')
            .in('menu_slug', menuSlugs)
            .gte('timestamp', startDate.toISOString())
            .eq('is_bot', false)
            .order('timestamp', { ascending: false });

        if (error) {
            throw error;
        }

        return data || [];
    }

    /**
     * Get subscription data
     */
    async getSubscriptionData(userId) {
        const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data || {
            plan: 'free',
            status: 'active',
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Get branding data
     */
    async getBrandingData(userId) {
        const { data, error } = await supabase
            .from('branding_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data || null;
    }

    /**
     * Get organization data if user is part of one
     */
    async getOrganizationData(userId) {
        const { data, error } = await supabase
            .from('organization_members')
            .select(`
                role, is_active, joined_at,
                organizations (
                    id, name, slug, description, city, state, country
                ),
                locations (
                    id, name, slug, address, city, state
                )
            `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data || null;
    }

    /**
     * Get all menu items for user's menus
     */
    async getMenuItems(userId) {
        const { data, error } = await supabase
            .from('menus')
            .select(`
                id, title, slug,
                menu_items (
                    id, name, description, price, category, emoji, 
                    image_url, is_available, sort_order, created_at
                )
            `)
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) {
            throw error;
        }

        // Flatten menu items with menu context
        const allItems = [];
        data?.forEach(menu => {
            menu.menu_items?.forEach(item => {
                allItems.push({
                    ...item,
                    menuId: menu.id,
                    menuTitle: menu.title,
                    menuSlug: menu.slug
                });
            });
        });

        return allItems;
    }

    /**
     * Get sample data for AI training (if user has minimal data)
     */
    async getSampleData(userId, startDate) {
        // Get industry benchmarks and sample data patterns
        const { data: industryData } = await supabase
            .from('analytics_events')
            .select('*')
            .gte('timestamp', startDate.toISOString())
            .eq('is_bot', false)
            .limit(1000);

        return {
            industryBenchmarks: this.calculateIndustryBenchmarks(industryData || []),
            samplePatterns: this.generateSamplePatterns(),
            recommendations: this.generateBaseRecommendations()
        };
    }

    /**
     * Process analytics events into meaningful insights
     */
    processAnalyticsEvents(events, menus, menuItems) {
        const viewEvents = events.filter(e => e.event_type === 'menu_view');
        const clickEvents = events.filter(e => e.event_type === 'item_click');

        // Time-based analysis
        const hourlyDistribution = this.getHourlyDistribution(viewEvents);
        const dailyDistribution = this.getDailyDistribution(viewEvents);
        const weeklyTrends = this.getWeeklyTrends(viewEvents);

        // Device and location analysis
        const deviceBreakdown = this.getDeviceBreakdown(viewEvents);
        const geographicData = this.getGeographicData(events);

        // Menu performance analysis
        const menuPerformance = this.getMenuPerformance(viewEvents, clickEvents, menus);
        const itemPerformance = this.getItemPerformance(clickEvents, menuItems);

        // Engagement metrics
        const engagementMetrics = this.calculateEngagementMetrics(viewEvents, clickEvents);

        // Behavioral patterns
        const behavioralPatterns = this.analyzeBehavioralPatterns(events);

        return {
            timeAnalysis: {
                hourly: hourlyDistribution,
                daily: dailyDistribution,
                weekly: weeklyTrends,
                peakHours: this.findPeakHours(hourlyDistribution),
                peakDays: this.findPeakDays(dailyDistribution)
            },
            deviceAnalysis: deviceBreakdown,
            geographicAnalysis: geographicData,
            menuAnalysis: menuPerformance,
            itemAnalysis: itemPerformance,
            engagement: engagementMetrics,
            behavior: behavioralPatterns,
            summary: {
                totalViews: viewEvents.length,
                totalClicks: clickEvents.length,
                clickThroughRate: viewEvents.length > 0 ? (clickEvents.length / viewEvents.length * 100).toFixed(2) : 0,
                averageSessionDuration: this.calculateAverageSessionDuration(events),
                bounceRate: this.calculateBounceRate(viewEvents, clickEvents)
            }
        };
    }

    /**
     * Calculate industry benchmarks
     */
    calculateIndustryBenchmarks(industryData) {
        const viewEvents = industryData.filter(e => e.event_type === 'menu_view');
        const clickEvents = industryData.filter(e => e.event_type === 'item_click');

        return {
            averageClickThroughRate: viewEvents.length > 0 ? (clickEvents.length / viewEvents.length * 100) : 0,
            mobilePercentage: viewEvents.filter(e => e.is_mobile).length / viewEvents.length * 100,
            peakHour: this.findPeakHour(viewEvents),
            averageSessionDuration: 180, // 3 minutes average
            industryStandards: {
                goodClickThroughRate: 15,
                excellentClickThroughRate: 25,
                mobileOptimalPercentage: 70,
                peakHours: [12, 13, 19, 20], // Lunch and dinner
                averageItemsPerMenu: 25
            }
        };
    }

    /**
     * Generate sample patterns for AI training
     */
    generateSamplePatterns() {
        return {
            seasonalTrends: {
                winter: { hotBeverages: 1.3, soups: 1.2, comfortFood: 1.1 },
                summer: { coldBeverages: 1.4, salads: 1.3, lightMeals: 1.2 },
                spring: { freshItems: 1.2, seasonalSpecials: 1.1 },
                fall: { warmItems: 1.2, seasonalProduce: 1.1 }
            },
            timePatterns: {
                breakfast: { coffee: 2.0, pastries: 1.5, healthyOptions: 1.3 },
                lunch: { quickMeals: 1.4, salads: 1.2, sandwiches: 1.3 },
                dinner: { mainCourses: 1.5, desserts: 1.2, beverages: 1.1 }
            },
            pricePatterns: {
                lowPrice: { impulsePurchases: 1.3, volumeSales: 1.2 },
                midPrice: { balancedSales: 1.0, popularItems: 1.1 },
                highPrice: { premiumSales: 0.8, specialOccasions: 1.2 }
            }
        };
    }

    /**
     * Generate base recommendations
     */
    generateBaseRecommendations() {
        return {
            menuOptimization: [
                "Place high-performing items at the top of each category",
                "Use appetizing descriptions with sensory words",
                "Add photos to items with low engagement",
                "Consider seasonal menu updates"
            ],
            pricingStrategy: [
                "Test price increases on popular items",
                "Bundle complementary items",
                "Offer daily specials during slow periods",
                "Use psychological pricing (e.g., $9.99 vs $10.00)"
            ],
            marketingInsights: [
                "Focus on mobile optimization (70% of traffic)",
                "Promote during peak hours (12-1 PM, 7-8 PM)",
                "Use social proof and customer reviews",
                "Create urgency with limited-time offers"
            ]
        };
    }

    // Helper methods for data processing
    getHourlyDistribution(events) {
        const hourly = Array.from({ length: 24 }, () => 0);
        events.forEach(event => {
            const hour = new Date(event.timestamp).getHours();
            hourly[hour]++;
        });
        return hourly.map((count, hour) => ({ hour, count }));
    }

    getDailyDistribution(events) {
        const daily = {};
        events.forEach(event => {
            const day = event.timestamp.split('T')[0];
            daily[day] = (daily[day] || 0) + 1;
        });
        return daily;
    }

    getWeeklyTrends(events) {
        const weekly = Array.from({ length: 7 }, () => 0);
        events.forEach(event => {
            const dayOfWeek = new Date(event.timestamp).getDay();
            weekly[dayOfWeek]++;
        });
        return weekly.map((count, day) => ({
            day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            count
        }));
    }

    getDeviceBreakdown(events) {
        const mobile = events.filter(e => e.is_mobile).length;
        const desktop = events.length - mobile;
        return {
            mobile: { count: mobile, percentage: events.length > 0 ? (mobile / events.length * 100).toFixed(1) : 0 },
            desktop: { count: desktop, percentage: events.length > 0 ? (desktop / events.length * 100).toFixed(1) : 0 }
        };
    }

    getGeographicData(events) {
        // Simplified geographic analysis based on country codes
        const countries = {};
        events.forEach(event => {
            const country = event.country_code || 'Unknown';
            countries[country] = (countries[country] || 0) + 1;
        });

        return Object.entries(countries)
            .map(([country, count]) => ({ country, count, percentage: (count / events.length * 100).toFixed(1) }))
            .sort((a, b) => b.count - a.count);
    }

    getMenuPerformance(viewEvents, clickEvents, menus) {
        return menus.map(menu => {
            const menuViews = viewEvents.filter(e => e.menu_slug === menu.slug).length;
            const menuClicks = clickEvents.filter(e => e.menu_slug === menu.slug).length;
            const ctr = menuViews > 0 ? (menuClicks / menuViews * 100).toFixed(2) : 0;

            return {
                menuId: menu.id,
                title: menu.title,
                slug: menu.slug,
                views: menuViews,
                clicks: menuClicks,
                clickThroughRate: parseFloat(ctr),
                performance: this.categorizePerformance(parseFloat(ctr))
            };
        });
    }

    getItemPerformance(clickEvents, menuItems) {
        const itemStats = {};

        clickEvents.forEach(event => {
            if (event.item_name) {
                if (!itemStats[event.item_name]) {
                    itemStats[event.item_name] = { clicks: 0, views: 0 };
                }
                itemStats[event.item_name].clicks++;
            }
        });

        // Add menu item context
        menuItems.forEach(item => {
            if (itemStats[item.name]) {
                itemStats[item.name].menuItem = item;
                itemStats[item.name].category = item.category;
                itemStats[item.name].price = item.price;
            }
        });

        return Object.entries(itemStats)
            .map(([name, stats]) => ({
                name,
                ...stats,
                performance: this.categorizeItemPerformance(stats.clicks)
            }))
            .sort((a, b) => b.clicks - a.clicks);
    }

    calculateEngagementMetrics(viewEvents, clickEvents) {
        const totalViews = viewEvents.length;
        const totalClicks = clickEvents.length;

        return {
            clickThroughRate: totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(2) : 0,
            engagementLevel: this.categorizeEngagement(totalViews > 0 ? totalClicks / totalViews : 0),
            conversionPotential: this.calculateConversionPotential(totalViews, totalClicks),
            userRetention: this.estimateUserRetention(viewEvents)
        };
    }

    analyzeBehavioralPatterns(events) {
        const sessions = this.groupEventsBySession(events);

        return {
            averageSessionLength: this.calculateAverageSessionLength(sessions),
            bounceRate: this.calculateBounceRateFromSessions(sessions),
            userJourney: this.analyzeUserJourney(sessions),
            returnVisitors: this.estimateReturnVisitors(events)
        };
    }

    // Utility methods
    categorizePerformance(ctr) {
        if (ctr >= 20) return 'excellent';
        if (ctr >= 15) return 'good';
        if (ctr >= 10) return 'average';
        if (ctr >= 5) return 'below-average';
        return 'poor';
    }

    categorizeItemPerformance(clicks) {
        if (clicks >= 20) return 'star-performer';
        if (clicks >= 10) return 'high-performer';
        if (clicks >= 5) return 'average';
        if (clicks >= 2) return 'low-performer';
        return 'underperforming';
    }

    categorizeEngagement(rate) {
        if (rate >= 0.2) return 'high';
        if (rate >= 0.15) return 'medium';
        if (rate >= 0.1) return 'low';
        return 'very-low';
    }

    calculateConversionPotential(views, clicks) {
        const baseRate = views > 0 ? clicks / views : 0;
        const potential = Math.min(baseRate * 1.5, 0.3); // Max 30% potential
        return {
            current: (baseRate * 100).toFixed(1),
            potential: (potential * 100).toFixed(1),
            improvement: ((potential - baseRate) * 100).toFixed(1)
        };
    }

    estimateUserRetention(events) {
        // Simplified retention calculation
        const uniqueSessions = new Set(events.map(e => e.session_id)).size;
        const totalEvents = events.length;
        const avgEventsPerSession = totalEvents / uniqueSessions;

        return {
            uniqueSessions,
            averageEventsPerSession: avgEventsPerSession.toFixed(1),
            retentionScore: Math.min(avgEventsPerSession / 3, 1) // Normalized to 0-1
        };
    }

    groupEventsBySession(events) {
        const sessions = {};
        events.forEach(event => {
            const sessionId = event.session_id || 'anonymous';
            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
            }
            sessions[sessionId].push(event);
        });
        return Object.values(sessions);
    }

    calculateAverageSessionLength(sessions) {
        if (sessions.length === 0) return 0;

        const totalDuration = sessions.reduce((sum, session) => {
            if (session.length < 2) return sum;
            const start = new Date(session[0].timestamp);
            const end = new Date(session[session.length - 1].timestamp);
            return sum + (end - start);
        }, 0);

        return Math.round(totalDuration / sessions.length / 1000 / 60); // minutes
    }

    calculateBounceRateFromSessions(sessions) {
        const singleEventSessions = sessions.filter(s => s.length === 1).length;
        return sessions.length > 0 ? ((singleEventSessions / sessions.length) * 100).toFixed(1) : 0;
    }

    analyzeUserJourney(sessions) {
        const journeys = sessions.map(session => {
            const events = session.map(e => e.event_type);
            return {
                length: events.length,
                path: events.join(' → '),
                hasConversion: events.includes('item_click')
            };
        });

        return {
            averageJourneyLength: journeys.reduce((sum, j) => sum + j.length, 0) / journeys.length,
            conversionRate: journeys.filter(j => j.hasConversion).length / journeys.length * 100,
            commonPaths: this.findCommonPaths(journeys)
        };
    }

    findCommonPaths(journeys) {
        const pathCounts = {};
        journeys.forEach(journey => {
            const path = journey.path;
            pathCounts[path] = (pathCounts[path] || 0) + 1;
        });

        return Object.entries(pathCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([path, count]) => ({ path, count }));
    }

    estimateReturnVisitors(events) {
        const uniqueSessions = new Set(events.map(e => e.session_id)).size;
        const totalEvents = events.length;
        const avgEventsPerSession = totalEvents / uniqueSessions;

        // Estimate return visitors based on session behavior
        const returnVisitorRate = Math.min(avgEventsPerSession / 5, 0.3); // Max 30%
        return {
            estimatedReturnVisitors: Math.round(uniqueSessions * returnVisitorRate),
            returnVisitorRate: (returnVisitorRate * 100).toFixed(1),
            confidence: avgEventsPerSession > 2 ? 'high' : 'medium'
        };
    }

    findPeakHours(hourlyDistribution) {
        const sorted = hourlyDistribution.sort((a, b) => b.count - a.count);
        return sorted.slice(0, 3).map(h => ({ hour: h.hour, count: h.count }));
    }

    findPeakDays(dailyDistribution) {
        const sorted = Object.entries(dailyDistribution)
            .sort(([, a], [, b]) => b - a);
        return sorted.slice(0, 3).map(([day, count]) => ({ day, count }));
    }

    calculateAverageSessionDuration(events) {
        const sessions = this.groupEventsBySession(events);
        return this.calculateAverageSessionLength(sessions);
    }

    calculateBounceRate(viewEvents, clickEvents) {
        const singleEventSessions = new Set();
        const multiEventSessions = new Set();

        viewEvents.forEach(event => {
            if (event.session_id) {
                singleEventSessions.add(event.session_id);
            }
        });

        clickEvents.forEach(event => {
            if (event.session_id) {
                multiEventSessions.add(event.session_id);
                singleEventSessions.delete(event.session_id);
            }
        });

        const totalSessions = singleEventSessions.size + multiEventSessions.size;
        return totalSessions > 0 ? ((singleEventSessions.size / totalSessions) * 100).toFixed(1) : 0;
    }

    findPeakHour(events) {
        const hourly = this.getHourlyDistribution(events);
        return hourly.reduce((max, hour) => hour.count > max.count ? hour : max).hour;
    }

    assessDataQuality(events, menus) {
        const score = {
            dataVolume: events.length >= 100 ? 'excellent' : events.length >= 50 ? 'good' : events.length >= 10 ? 'fair' : 'poor',
            timeRange: this.assessTimeRange(events),
            menuCoverage: menus.length >= 1 ? 'good' : 'poor',
            eventTypes: this.assessEventTypes(events)
        };

        const overallScore = Object.values(score).filter(s => s === 'excellent' || s === 'good').length / 4;
        return {
            ...score,
            overall: overallScore >= 0.75 ? 'high' : overallScore >= 0.5 ? 'medium' : 'low'
        };
    }

    assessTimeRange(events) {
        if (events.length === 0) return 'poor';

        const timestamps = events.map(e => new Date(e.timestamp));
        const min = Math.min(...timestamps);
        const max = Math.max(...timestamps);
        const days = (max - min) / (1000 * 60 * 60 * 24);

        if (days >= 30) return 'excellent';
        if (days >= 14) return 'good';
        if (days >= 7) return 'fair';
        return 'poor';
    }

    assessEventTypes(events) {
        const eventTypes = new Set(events.map(e => e.event_type));
        if (eventTypes.size >= 3) return 'excellent';
        if (eventTypes.size >= 2) return 'good';
        return 'fair';
    }

    recommendAnalysisType(events, menus) {
        if (events.length < 10) return 'basic';
        if (events.length < 100) return 'standard';
        if (menus.length > 1) return 'comprehensive';
        return 'advanced';
    }
}

module.exports = { AnalyticsCollector };
