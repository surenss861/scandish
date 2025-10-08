/**
 * AI Insights Engine
 * 
 * This service generates AI-powered insights from collected analytics data.
 * It processes user data and provides actionable recommendations.
 */

const { supabase } = require('./supabase');

class AIInsightsEngine {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Generate comprehensive AI insights from analytics data
     * @param {Object} analyticsData - Collected analytics data
     * @returns {Object} AI-generated insights
     */
    async generateInsights(analyticsData) {
        const cacheKey = `insights_${analyticsData.user.id}_${Date.now()}`;

        try {
            console.log(`[AIInsightsEngine] Generating insights for user ${analyticsData.user.id}`);

            // Generate different types of insights
            const [
                performanceInsights,
                behavioralInsights,
                predictiveInsights,
                optimizationRecommendations,
                competitiveInsights,
                summary
            ] = await Promise.all([
                this.generatePerformanceInsights(analyticsData),
                this.generateBehavioralInsights(analyticsData),
                this.generatePredictiveInsights(analyticsData),
                this.generateOptimizationRecommendations(analyticsData),
                this.generateCompetitiveInsights(analyticsData),
                this.generateSummary(analyticsData)
            ]);

            const insights = {
                performanceInsights,
                behavioralInsights,
                predictiveInsights,
                optimizationRecommendations,
                competitiveInsights,
                summary,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    confidence: this.calculateConfidence(analyticsData),
                    dataQuality: analyticsData.metadata.dataQuality,
                    analysisType: analyticsData.metadata.recommendedAnalysis,
                    userId: analyticsData.user.id
                }
            };

            // Store insights in database
            await this.storeInsights(analyticsData.user.id, insights);

            return insights;

        } catch (error) {
            console.error('[AIInsightsEngine] Error generating insights:', error);
            throw error;
        }
    }

    /**
     * Generate performance insights
     */
    async generatePerformanceInsights(analyticsData) {
        const { analytics, menus } = analyticsData;
        const { processed } = analytics;

        const insights = {
            overallPerformance: {
                score: this.calculatePerformanceScore(processed),
                rating: this.getPerformanceRating(processed),
                trend: this.calculateTrend(processed)
            },
            keyMetrics: {
                totalViews: processed.summary.totalViews,
                clickThroughRate: parseFloat(processed.summary.clickThroughRate),
                averageSessionDuration: processed.summary.averageSessionDuration,
                bounceRate: parseFloat(processed.summary.bounceRate)
            },
            topPerformers: {
                menus: processed.menuAnalysis.slice(0, 3),
                items: processed.itemAnalysis.slice(0, 5)
            },
            areasForImprovement: this.identifyImprovementAreas(processed),
            recommendations: this.generatePerformanceRecommendations(processed)
        };

        return insights;
    }

    /**
     * Generate behavioral insights
     */
    async generateBehavioralInsights(analyticsData) {
        const { analytics } = analyticsData;
        const { processed } = analytics;

        const insights = {
            userBehavior: {
                peakHours: processed.timeAnalysis.peakHours,
                peakDays: processed.timeAnalysis.peakDays,
                devicePreference: processed.deviceAnalysis,
                engagementLevel: processed.engagement.engagementLevel
            },
            customerJourney: {
                averageJourneyLength: processed.behavior.averageSessionLength,
                conversionRate: processed.behavior.conversionRate,
                commonPaths: processed.behavior.commonPaths
            },
            retention: {
                estimatedReturnVisitors: processed.behavior.returnVisitors,
                retentionScore: processed.engagement.userRetention.retentionScore
            },
            patterns: {
                seasonalTrends: this.analyzeSeasonalTrends(processed),
                timePatterns: this.analyzeTimePatterns(processed),
                priceSensitivity: this.analyzePriceSensitivity(processed)
            }
        };

        return insights;
    }

    /**
     * Generate predictive insights
     */
    async generatePredictiveInsights(analyticsData) {
        const { analytics, menus } = analyticsData;
        const { processed } = analytics;

        const insights = {
            growthProjections: {
                trafficGrowth: this.projectTrafficGrowth(processed),
                revenuePotential: this.calculateRevenuePotential(processed, menus),
                customerAcquisition: this.estimateCustomerAcquisition(processed)
            },
            demandForecasting: {
                peakPeriods: this.forecastPeakPeriods(processed),
                seasonalDemand: this.forecastSeasonalDemand(processed),
                menuItemDemand: this.forecastMenuItemDemand(processed)
            },
            riskAssessment: {
                trafficRisks: this.assessTrafficRisks(processed),
                performanceRisks: this.assessPerformanceRisks(processed),
                competitiveRisks: this.assessCompetitiveRisks(processed)
            },
            opportunities: {
                marketExpansion: this.identifyExpansionOpportunities(processed),
                productOpportunities: this.identifyProductOpportunities(processed),
                timingOpportunities: this.identifyTimingOpportunities(processed)
            }
        };

        return insights;
    }

    /**
     * Generate optimization recommendations
     */
    async generateOptimizationRecommendations(analyticsData) {
        const { analytics, menus, branding } = analyticsData;
        const { processed } = analytics;

        const recommendations = {
            immediate: this.generateImmediateRecommendations(processed),
            shortTerm: this.generateShortTermRecommendations(processed, menus),
            longTerm: this.generateLongTermRecommendations(processed, branding),
            priority: this.prioritizeRecommendations(processed)
        };

        return recommendations;
    }

    /**
     * Generate competitive insights
     */
    async generateCompetitiveInsights(analyticsData) {
        const { analytics, sampleData } = analyticsData;
        const { processed } = analytics;

        const insights = {
            marketPosition: this.analyzeMarketPosition(processed, sampleData),
            competitiveAdvantages: this.identifyCompetitiveAdvantages(processed),
            gaps: this.identifyMarketGaps(processed, sampleData),
            benchmarks: this.calculateBenchmarks(processed, sampleData)
        };

        return insights;
    }

    /**
     * Generate executive summary
     */
    async generateSummary(analyticsData) {
        const { analytics, menus, user } = analyticsData;
        const { processed } = analytics;

        return {
            restaurantName: user.restaurantName || 'Your Restaurant',
            period: `${analytics.period.days} days`,
            keyFindings: this.extractKeyFindings(processed),
            topInsights: this.extractTopInsights(processed),
            recommendedActions: this.extractRecommendedActions(processed),
            businessImpact: this.calculateBusinessImpact(processed, menus),
            nextSteps: this.generateNextSteps(processed, menus)
        };
    }

    // Helper methods for insight generation

    calculatePerformanceScore(processed) {
        const ctr = parseFloat(processed.summary.clickThroughRate);
        const engagement = processed.engagement.engagementLevel;
        const bounceRate = parseFloat(processed.summary.bounceRate);

        let score = 0;

        // Click-through rate scoring (0-40 points)
        if (ctr >= 20) score += 40;
        else if (ctr >= 15) score += 30;
        else if (ctr >= 10) score += 20;
        else if (ctr >= 5) score += 10;

        // Engagement scoring (0-30 points)
        if (engagement === 'high') score += 30;
        else if (engagement === 'medium') score += 20;
        else if (engagement === 'low') score += 10;

        // Bounce rate scoring (0-30 points)
        if (bounceRate <= 30) score += 30;
        else if (bounceRate <= 50) score += 20;
        else if (bounceRate <= 70) score += 10;

        return Math.min(score, 100);
    }

    getPerformanceRating(processed) {
        const score = this.calculatePerformanceScore(processed);
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'average';
        return 'needs-improvement';
    }

    calculateTrend(processed) {
        // Simplified trend calculation based on current metrics
        const ctr = parseFloat(processed.summary.clickThroughRate);
        const engagement = processed.engagement.engagementLevel;

        if (ctr >= 15 && engagement === 'high') return 'improving';
        if (ctr >= 10 && engagement === 'medium') return 'stable';
        return 'declining';
    }

    identifyImprovementAreas(processed) {
        const areas = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);
        const bounceRate = parseFloat(processed.summary.bounceRate);

        if (ctr < 10) areas.push('click-through rate');
        if (bounceRate > 60) areas.push('user engagement');
        if (processed.summary.averageSessionDuration < 2) areas.push('session duration');
        if (processed.behavior.bounceRate > 50) areas.push('user retention');

        return areas;
    }

    generatePerformanceRecommendations(processed) {
        const recommendations = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);
        const bounceRate = parseFloat(processed.summary.bounceRate);

        if (ctr < 10) {
            recommendations.push('Improve menu item descriptions and add high-quality photos');
            recommendations.push('Optimize menu layout for better item visibility');
        }

        if (bounceRate > 60) {
            recommendations.push('Add more engaging content to reduce bounce rate');
            recommendations.push('Improve page loading speed and mobile experience');
        }

        if (processed.summary.averageSessionDuration < 2) {
            recommendations.push('Add interactive elements to increase session duration');
            recommendations.push('Implement menu categories for better navigation');
        }

        return recommendations;
    }

    analyzeSeasonalTrends(processed) {
        // Simplified seasonal analysis
        return {
            currentSeason: this.getCurrentSeason(),
            recommendations: [
                'Consider seasonal menu updates',
                'Adjust pricing for seasonal demand',
                'Plan marketing campaigns around seasonal trends'
            ]
        };
    }

    analyzeTimePatterns(processed) {
        const peakHours = processed.timeAnalysis.peakHours;
        return {
            peakTimes: peakHours,
            recommendations: [
                'Schedule social media posts during peak hours',
                'Offer special promotions during off-peak times',
                'Optimize staffing based on traffic patterns'
            ]
        };
    }

    analyzePriceSensitivity(processed) {
        const items = processed.itemAnalysis;
        const highPriceItems = items.filter(item => item.price && item.price > 15);
        const lowPriceItems = items.filter(item => item.price && item.price < 10);

        return {
            highPricePerformance: highPriceItems.length > 0 ? 'good' : 'unknown',
            lowPricePerformance: lowPriceItems.length > 0 ? 'excellent' : 'unknown',
            recommendations: [
                'Test price adjustments on underperforming items',
                'Bundle high-value items to increase perceived value',
                'Use psychological pricing strategies'
            ]
        };
    }

    projectTrafficGrowth(processed) {
        const currentViews = processed.summary.totalViews;
        const ctr = parseFloat(processed.summary.clickThroughRate);

        // Simple growth projection based on current performance
        const growthRate = ctr > 15 ? 1.2 : ctr > 10 ? 1.1 : 1.05;

        return {
            current: currentViews,
            projected: Math.round(currentViews * growthRate),
            growthRate: `${((growthRate - 1) * 100).toFixed(1)}%`,
            confidence: ctr > 15 ? 'high' : ctr > 10 ? 'medium' : 'low'
        };
    }

    calculateRevenuePotential(processed, menus) {
        const clicks = processed.summary.totalClicks;
        const avgItemPrice = this.calculateAverageItemPrice(processed);

        return {
            currentClicks: clicks,
            estimatedRevenue: Math.round(clicks * avgItemPrice * 0.3), // 30% conversion estimate
            potentialRevenue: Math.round(clicks * avgItemPrice * 0.5), // 50% potential
            improvement: Math.round(clicks * avgItemPrice * 0.2) // 20% improvement
        };
    }

    calculateAverageItemPrice(processed) {
        const items = processed.itemAnalysis;
        if (items.length === 0) return 15; // Default average

        const totalPrice = items.reduce((sum, item) => sum + (item.price || 15), 0);
        return totalPrice / items.length;
    }

    estimateCustomerAcquisition(processed) {
        const views = processed.summary.totalViews;
        const returnVisitors = processed.behavior.returnVisitors;

        return {
            newVisitors: views - returnVisitors.estimatedReturnVisitors,
            returnVisitors: returnVisitors.estimatedReturnVisitors,
            acquisitionRate: returnVisitors.returnVisitorRate,
            recommendations: [
                'Implement customer retention strategies',
                'Create loyalty programs',
                'Improve user experience for first-time visitors'
            ]
        };
    }

    forecastPeakPeriods(processed) {
        const peakHours = processed.timeAnalysis.peakHours;
        const peakDays = processed.timeAnalysis.peakDays;

        return {
            hourly: peakHours,
            daily: peakDays,
            recommendations: [
                'Prepare for increased traffic during peak hours',
                'Schedule staff accordingly',
                'Have backup systems ready for high-traffic periods'
            ]
        };
    }

    forecastSeasonalDemand(processed) {
        return {
            current: 'normal',
            forecast: {
                nextMonth: 'increasing',
                nextQuarter: 'peak',
                nextYear: 'stable'
            },
            recommendations: [
                'Plan inventory for seasonal changes',
                'Adjust marketing strategies seasonally',
                'Prepare for holiday traffic spikes'
            ]
        };
    }

    forecastMenuItemDemand(processed) {
        const topItems = processed.itemAnalysis.slice(0, 5);

        return {
            highDemand: topItems.slice(0, 2),
            growingDemand: topItems.slice(2, 4),
            decliningDemand: topItems.slice(4),
            recommendations: [
                'Increase inventory for high-demand items',
                'Promote growing demand items',
                'Review declining demand items for improvements'
            ]
        };
    }

    assessTrafficRisks(processed) {
        const views = processed.summary.totalViews;
        const bounceRate = parseFloat(processed.summary.bounceRate);

        const risks = [];
        if (views < 100) risks.push('Low traffic volume');
        if (bounceRate > 70) risks.push('High bounce rate');
        if (processed.behavior.averageSessionLength < 1) risks.push('Low engagement');

        return {
            risks,
            severity: risks.length > 2 ? 'high' : risks.length > 1 ? 'medium' : 'low',
            mitigation: [
                'Improve SEO and marketing efforts',
                'Optimize user experience',
                'Add engaging content'
            ]
        };
    }

    assessPerformanceRisks(processed) {
        const ctr = parseFloat(processed.summary.clickThroughRate);

        const risks = [];
        if (ctr < 5) risks.push('Very low click-through rate');
        if (processed.summary.averageSessionDuration < 1) risks.push('Poor session quality');

        return {
            risks,
            severity: risks.length > 1 ? 'high' : risks.length > 0 ? 'medium' : 'low',
            mitigation: [
                'Improve menu item descriptions',
                'Add high-quality photos',
                'Optimize menu layout'
            ]
        };
    }

    assessCompetitiveRisks(processed) {
        return {
            risks: ['Market saturation', 'Price competition'],
            severity: 'medium',
            mitigation: [
                'Differentiate your menu offerings',
                'Focus on unique value propositions',
                'Build strong customer relationships'
            ]
        };
    }

    identifyExpansionOpportunities(processed) {
        return {
            opportunities: [
                'Mobile optimization improvements',
                'New menu categories',
                'Social media integration'
            ],
            priority: 'high',
            impact: 'significant'
        };
    }

    identifyProductOpportunities(processed) {
        const lowPerformingItems = processed.itemAnalysis.filter(item => item.clicks < 3);

        return {
            opportunities: [
                'Improve underperforming menu items',
                'Add trending food categories',
                'Create seasonal specials'
            ],
            priority: 'medium',
            impact: 'moderate'
        };
    }

    identifyTimingOpportunities(processed) {
        const peakHours = processed.timeAnalysis.peakHours;

        return {
            opportunities: [
                'Promote during off-peak hours',
                'Create lunch specials',
                'Implement happy hour promotions'
            ],
            priority: 'high',
            impact: 'significant'
        };
    }

    generateImmediateRecommendations(processed) {
        const recommendations = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);

        if (ctr < 10) {
            recommendations.push({
                action: 'Improve menu item descriptions',
                impact: 'high',
                effort: 'low',
                timeline: '1-2 days'
            });
        }

        if (processed.summary.bounceRate > 60) {
            recommendations.push({
                action: 'Add engaging content to menu pages',
                impact: 'medium',
                effort: 'medium',
                timeline: '3-5 days'
            });
        }

        return recommendations;
    }

    generateShortTermRecommendations(processed, menus) {
        return [
            {
                action: 'Optimize menu layout for mobile devices',
                impact: 'high',
                effort: 'medium',
                timeline: '1-2 weeks'
            },
            {
                action: 'Add high-quality photos to menu items',
                impact: 'high',
                effort: 'high',
                timeline: '2-3 weeks'
            },
            {
                action: 'Implement menu categories for better navigation',
                impact: 'medium',
                effort: 'medium',
                timeline: '1 week'
            }
        ];
    }

    generateLongTermRecommendations(processed, branding) {
        return [
            {
                action: 'Develop seasonal menu strategy',
                impact: 'high',
                effort: 'high',
                timeline: '1-2 months'
            },
            {
                action: 'Create customer loyalty program',
                impact: 'high',
                effort: 'high',
                timeline: '2-3 months'
            },
            {
                action: 'Implement advanced analytics tracking',
                impact: 'medium',
                effort: 'medium',
                timeline: '1 month'
            }
        ];
    }

    prioritizeRecommendations(processed) {
        const allRecommendations = [
            ...this.generateImmediateRecommendations(processed),
            ...this.generateShortTermRecommendations(processed, []),
            ...this.generateLongTermRecommendations(processed, null)
        ];

        return allRecommendations.sort((a, b) => {
            const aScore = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) +
                (a.effort === 'low' ? 3 : a.effort === 'medium' ? 2 : 1);
            const bScore = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) +
                (b.effort === 'low' ? 3 : b.effort === 'medium' ? 2 : 1);
            return bScore - aScore;
        });
    }

    analyzeMarketPosition(processed, sampleData) {
        const industryBenchmarks = sampleData?.industryBenchmarks || {};
        const ctr = parseFloat(processed.summary.clickThroughRate);
        const industryCTR = industryBenchmarks.averageClickThroughRate || 15;

        return {
            clickThroughRate: {
                current: ctr,
                industry: industryCTR,
                position: ctr > industryCTR ? 'above' : 'below',
                gap: Math.abs(ctr - industryCTR)
            },
            mobileOptimization: {
                current: parseFloat(processed.deviceAnalysis.mobile.percentage),
                industry: industryBenchmarks.mobilePercentage || 70,
                position: 'competitive'
            },
            recommendations: [
                'Benchmark against industry standards',
                'Focus on areas below industry average',
                'Leverage competitive advantages'
            ]
        };
    }

    identifyCompetitiveAdvantages(processed) {
        const advantages = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);

        if (ctr > 20) advantages.push('High click-through rate');
        if (processed.engagement.engagementLevel === 'high') advantages.push('Strong user engagement');
        if (parseFloat(processed.summary.bounceRate) < 40) advantages.push('Low bounce rate');

        return {
            advantages,
            strength: advantages.length > 2 ? 'strong' : advantages.length > 1 ? 'moderate' : 'weak',
            recommendations: [
                'Leverage existing advantages',
                'Build on strong performance areas',
                'Use advantages in marketing'
            ]
        };
    }

    identifyMarketGaps(processed, sampleData) {
        return {
            gaps: [
                'Mobile optimization opportunities',
                'Social media integration',
                'Customer retention programs'
            ],
            opportunities: [
                'Implement mobile-first design',
                'Add social sharing features',
                'Create loyalty programs'
            ]
        };
    }

    calculateBenchmarks(processed, sampleData) {
        const industryBenchmarks = sampleData?.industryBenchmarks || {};

        return {
            clickThroughRate: {
                current: parseFloat(processed.summary.clickThroughRate),
                industry: industryBenchmarks.averageClickThroughRate || 15,
                percentile: this.calculatePercentile(parseFloat(processed.summary.clickThroughRate), industryBenchmarks.averageClickThroughRate || 15)
            },
            sessionDuration: {
                current: processed.summary.averageSessionDuration,
                industry: industryBenchmarks.averageSessionDuration || 180,
                percentile: this.calculatePercentile(processed.summary.averageSessionDuration, industryBenchmarks.averageSessionDuration || 180)
            }
        };
    }

    calculatePercentile(current, industry) {
        if (current >= industry * 1.5) return 90;
        if (current >= industry * 1.2) return 75;
        if (current >= industry) return 50;
        if (current >= industry * 0.8) return 25;
        return 10;
    }

    extractKeyFindings(processed) {
        const findings = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);

        findings.push(`${processed.summary.totalViews} total menu views`);
        findings.push(`${ctr}% click-through rate`);

        if (processed.timeAnalysis.peakHours.length > 0) {
            const peakHour = processed.timeAnalysis.peakHours[0];
            findings.push(`Peak traffic at ${peakHour.hour}:00 with ${peakHour.count} views`);
        }

        return findings;
    }

    extractTopInsights(processed) {
        const insights = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);

        if (ctr > 15) {
            insights.push('Your menu has excellent engagement with a high click-through rate');
        } else if (ctr < 5) {
            insights.push('Your menu needs optimization to improve click-through rates');
        }

        if (processed.summary.bounceRate > 70) {
            insights.push('High bounce rate indicates users are leaving quickly - consider improving content');
        }

        return insights;
    }

    extractRecommendedActions(processed) {
        const actions = [];
        const ctr = parseFloat(processed.summary.clickThroughRate);

        if (ctr < 10) {
            actions.push('Improve menu item descriptions and add photos');
        }

        if (processed.summary.bounceRate > 60) {
            actions.push('Add more engaging content to reduce bounce rate');
        }

        return actions;
    }

    calculateBusinessImpact(processed, menus) {
        const views = processed.summary.totalViews;
        const clicks = processed.summary.totalClicks;
        const avgPrice = this.calculateAverageItemPrice(processed);

        return {
            potentialRevenue: Math.round(clicks * avgPrice * 0.3),
            conversionRate: ((clicks / views) * 100).toFixed(2),
            improvementPotential: Math.round(clicks * avgPrice * 0.2),
            roi: 'High - Menu optimization has significant revenue potential'
        };
    }

    generateNextSteps(processed, menus) {
        return [
            'Review and implement immediate recommendations',
            'Set up regular analytics monitoring',
            'Plan A/B tests for menu improvements',
            'Schedule monthly insight reviews'
        ];
    }

    calculateConfidence(analyticsData) {
        const { metadata } = analyticsData;
        let confidence = 0.5; // Base confidence

        if (metadata.hasEnoughData) confidence += 0.2;
        if (metadata.dataQuality.overall === 'high') confidence += 0.2;
        if (analyticsData.analytics.totalEvents > 100) confidence += 0.1;

        return Math.min(confidence, 1.0);
    }

    getCurrentSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'fall';
        return 'winter';
    }

    async storeInsights(userId, insights) {
        try {
            // First ensure user exists
            const { data: userExists } = await supabase
                .from('users')
                .select('id')
                .eq('id', userId)
                .single();

            if (!userExists) {
                console.log(`[AIInsightsEngine] User ${userId} doesn't exist, creating user record`);
                await supabase
                    .from('users')
                    .insert({
                        id: userId,
                        email: 'user@example.com',
                        restaurant_name: 'My Restaurant',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
            }

            // Create or update insights record
            const { error } = await supabase
                .from('user_insights')
                .upsert({
                    user_id: userId,
                    insights: JSON.stringify(insights),
                    generated_at: new Date().toISOString(),
                    confidence: insights.metadata.confidence,
                    data_quality: insights.metadata.dataQuality.overall,
                    analysis_type: insights.metadata.analysisType
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                console.error('[AIInsightsEngine] Failed to store insights:', error);
            }
        } catch (error) {
            console.error('[AIInsightsEngine] Error storing insights:', error);
        }
    }
}

module.exports = { AIInsightsEngine };
