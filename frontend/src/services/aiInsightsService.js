/**
 * AI Insights Service
 * 
 * This service handles all interactions with the AI Insights API,
 * providing methods to generate, retrieve, and manage AI-powered analytics.
 */

import { supabase } from '../lib/supabaseClient';

class AIInsightsService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4100';
        this.endpoints = {
            generate: '/api/ai-insights/generate',
            latest: '/api/ai-insights/latest',
            history: '/api/ai-insights/history',
            categories: '/api/ai-insights/categories',
            analytics: '/api/ai-insights/analytics',
            actionTaken: '/api/ai-insights/action-taken',
            benchmarks: '/api/ai-insights/benchmarks',
            templates: '/api/ai-insights/templates',
            health: '/api/ai-insights/health'
        };
    }

    /**
     * Get authentication headers for API requests
     */
    async getAuthHeaders() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
            'Content-Type': 'application/json',
            ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        };
    }

    /**
     * Make authenticated API request
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = await this.getAuthHeaders();
        const config = {
            headers,
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[AIInsightsService] Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Generate comprehensive AI insights for the current user
     * @param {Object} options - Generation options
     * @param {number} options.days - Number of days to analyze (default: 30)
     * @param {boolean} options.force - Force regeneration even if recent insights exist
     * @returns {Promise<Object>} Generated insights data
     */
    async generateInsights(options = {}) {
        const { days = 30, force = false } = options;

        return await this.makeRequest(this.endpoints.generate, {
            method: 'POST',
            body: JSON.stringify({ days, force })
        });
    }

    /**
     * Get the latest AI insights for the current user
     * @returns {Promise<Object>} Latest insights data
     */
    async getLatestInsights() {
        return await this.makeRequest(this.endpoints.latest);
    }

    /**
     * Get insights history for the current user
     * @param {Object} options - Pagination options
     * @param {number} options.limit - Number of records to return (default: 10)
     * @param {number} options.offset - Number of records to skip (default: 0)
     * @returns {Promise<Object>} Insights history data
     */
    async getInsightsHistory(options = {}) {
        const { limit = 10, offset = 0 } = options;
        const params = new URLSearchParams({ limit, offset });

        return await this.makeRequest(`${this.endpoints.history}?${params}`);
    }

    /**
     * Get insights for a specific category
     * @param {string} category - Category name (performance, behavioral, predictive, etc.)
     * @returns {Promise<Object>} Category-specific insights
     */
    async getCategoryInsights(category) {
        const validCategories = ['performance', 'behavioral', 'predictive', 'optimization', 'competitive', 'summary'];

        if (!validCategories.includes(category)) {
            throw new Error(`Invalid category: ${category}. Valid categories: ${validCategories.join(', ')}`);
        }

        return await this.makeRequest(`${this.endpoints.categories}/${category}`);
    }

    /**
     * Get raw analytics data (without AI processing)
     * @param {number} days - Number of days to analyze (default: 30)
     * @returns {Promise<Object>} Analytics data
     */
    async getAnalyticsData(days = 30) {
        const params = new URLSearchParams({ days });
        return await this.makeRequest(`${this.endpoints.analytics}?${params}`);
    }

    /**
     * Mark an insight action as taken
     * @param {Object} actionData - Action details
     * @param {string} actionData.insightType - Type of insight acted upon
     * @param {string} actionData.category - Category of the insight
     * @param {string} actionData.action - Description of action taken
     * @param {number} actionData.outcome - Outcome score (optional)
     * @returns {Promise<Object>} Action tracking result
     */
    async recordActionTaken(actionData) {
        const { insightType, category, action, outcome = null } = actionData;

        if (!insightType || !category || !action) {
            throw new Error('insightType, category, and action are required');
        }

        return await this.makeRequest(this.endpoints.actionTaken, {
            method: 'POST',
            body: JSON.stringify({ insightType, category, action, outcome })
        });
    }

    /**
     * Get industry benchmarks for comparison
     * @param {Object} filters - Optional filters
     * @param {string} filters.category - Benchmark category filter
     * @param {string} filters.metric - Specific metric filter
     * @returns {Promise<Object>} Benchmark data
     */
    async getBenchmarks(filters = {}) {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.metric) params.append('metric', filters.metric);

        const queryString = params.toString();
        const endpoint = queryString ? `${this.endpoints.benchmarks}?${queryString}` : this.endpoints.benchmarks;

        return await this.makeRequest(endpoint);
    }

    /**
     * Get insight templates (for development/admin purposes)
     * @returns {Promise<Object>} Insight templates data
     */
    async getInsightTemplates() {
        return await this.makeRequest(this.endpoints.templates);
    }

    /**
     * Check AI insights service health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        return await this.makeRequest(this.endpoints.health);
    }

    /**
     * Get comprehensive insights dashboard data
     * @param {Object} options - Dashboard options
     * @param {number} options.days - Days to analyze (default: 30)
     * @param {boolean} options.generateIfNeeded - Generate insights if none exist (default: true)
     * @returns {Promise<Object>} Complete dashboard data
     */
    async getDashboardData(options = {}) {
        const { days = 30, generateIfNeeded = true } = options;

        try {
            // Try to get latest insights first
            let insightsData = await this.getLatestInsights();

            // If no insights exist and generation is requested, generate them
            if (!insightsData.hasInsights && generateIfNeeded) {
                console.log('[AIInsightsService] No insights found, generating new insights...');
                insightsData = await this.generateInsights({ days });
            }

            // Get raw analytics data for additional context
            const analyticsData = await this.getAnalyticsData(days);

            // Get industry benchmarks for comparison
            const benchmarksData = await this.getBenchmarks();

            return {
                success: true,
                insights: insightsData.insights || null,
                analytics: analyticsData.analytics || null,
                benchmarks: benchmarksData.benchmarks || [],
                metadata: {
                    hasInsights: insightsData.hasInsights || false,
                    generatedAt: insightsData.metadata?.generatedAt || null,
                    confidence: insightsData.metadata?.confidence || 0,
                    dataQuality: insightsData.metadata?.dataQuality || 'unknown'
                }
            };

        } catch (error) {
            console.error('[AIInsightsService] Failed to get dashboard data:', error);
            throw error;
        }
    }

    /**
     * Get performance summary for quick overview
     * @param {number} days - Days to analyze (default: 7)
     * @returns {Promise<Object>} Performance summary
     */
    async getPerformanceSummary(days = 7) {
        try {
            const analyticsData = await this.getAnalyticsData(days);
            const benchmarksData = await this.getBenchmarks({ category: 'engagement' });

            const summary = analyticsData.analytics?.summary || {};
            const industryBenchmark = benchmarksData.benchmarks?.find(b => b.metric_name === 'click_through_rate');

            return {
                success: true,
                performance: {
                    totalViews: summary.totalViews || 0,
                    totalClicks: summary.totalClicks || 0,
                    clickThroughRate: summary.clickThroughRate || '0',
                    mobilePercentage: analyticsData.analytics?.deviceAnalysis?.mobile?.percentage || '0',
                    industryComparison: industryBenchmark ? {
                        user: parseFloat(summary.clickThroughRate || 0),
                        industry: industryBenchmark.percentile_50,
                        percentile: this.calculatePercentile(parseFloat(summary.clickThroughRate || 0), industryBenchmark)
                    } : null
                },
                metadata: {
                    period: `${days} days`,
                    lastUpdated: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('[AIInsightsService] Failed to get performance summary:', error);
            throw error;
        }
    }

    /**
     * Calculate percentile ranking against industry benchmark
     * @param {number} userValue - User's metric value
     * @param {Object} benchmark - Industry benchmark data
     * @returns {number} Percentile ranking (0-100)
     */
    calculatePercentile(userValue, benchmark) {
        const { percentile_25, percentile_50, percentile_75, percentile_90 } = benchmark;

        if (userValue <= percentile_25) return 25;
        if (userValue <= percentile_50) return 50;
        if (userValue <= percentile_75) return 75;
        if (userValue <= percentile_90) return 90;
        return 95;
    }

    /**
     * Get actionable recommendations from insights
     * @returns {Promise<Array>} Array of actionable recommendations
     */
    async getActionableRecommendations() {
        try {
            const insightsData = await this.getLatestInsights();

            if (!insightsData.hasInsights) {
                return { success: true, recommendations: [] };
            }

            const insights = insightsData.insights;
            const recommendations = [];

            // Extract recommendations from different insight categories
            if (insights.performanceInsights) {
                insights.performanceInsights.forEach(insight => {
                    if (insight.recommendation) {
                        recommendations.push({
                            category: 'Performance',
                            title: insight.title,
                            description: insight.description,
                            recommendation: insight.recommendation,
                            priority: insight.impact || 'medium',
                            confidence: insight.confidence || 0.5
                        });
                    }
                });
            }

            if (insights.optimizationRecommendations) {
                insights.optimizationRecommendations.forEach(rec => {
                    recommendations.push({
                        category: 'Optimization',
                        title: rec.title,
                        description: rec.description,
                        recommendation: rec.actions?.join(' ') || rec.description,
                        priority: rec.priority || 'medium',
                        effort: rec.effort || 'medium',
                        impact: rec.impact || 'medium'
                    });
                });
            }

            if (insights.behavioralInsights) {
                insights.behavioralInsights.forEach(insight => {
                    if (insight.recommendation) {
                        recommendations.push({
                            category: 'Behavior',
                            title: insight.title,
                            description: insight.description,
                            recommendation: insight.recommendation,
                            priority: insight.impact || 'medium',
                            confidence: insight.confidence || 0.5
                        });
                    }
                });
            }

            // Sort by priority and confidence
            recommendations.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 2;
                const bPriority = priorityOrder[b.priority] || 2;

                if (aPriority !== bPriority) return bPriority - aPriority;
                return (b.confidence || 0.5) - (a.confidence || 0.5);
            });

            return { success: true, recommendations };

        } catch (error) {
            console.error('[AIInsightsService] Failed to get actionable recommendations:', error);
            throw error;
        }
    }

    /**
     * Track user interaction with insights (for analytics)
     * @param {string} action - Action taken (view, click, dismiss, etc.)
     * @param {string} insightType - Type of insight interacted with
     * @param {Object} metadata - Additional metadata
     */
    async trackInsightInteraction(action, insightType, metadata = {}) {
        try {
            // This would typically send data to an analytics service
            console.log('[AIInsightsService] Insight interaction tracked:', {
                action,
                insightType,
                metadata,
                timestamp: new Date().toISOString()
            });

            // In a real implementation, you might send this to your analytics API
            // await this.makeRequest('/api/analytics/insight-interaction', {
            //     method: 'POST',
            //     body: JSON.stringify({ action, insightType, metadata })
            // });

        } catch (error) {
            console.error('[AIInsightsService] Failed to track insight interaction:', error);
            // Don't throw error for tracking failures
        }
    }
}

// Create and export a singleton instance
const aiInsightsService = new AIInsightsService();
export default aiInsightsService;
