-- ============================================================================
-- AI INSIGHTS SCHEMA - Supabase Setup
-- ============================================================================
-- This script creates tables and functions for storing and managing AI-generated insights
-- Run this in your Supabase SQL Editor after the main setup
-- ============================================================================

-- ============================================================================
-- INSIGHTS TABLES
-- ============================================================================

/*
 * user_insights - Store AI-generated insights for each user
 */
CREATE TABLE IF NOT EXISTS public.user_insights (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    insights jsonb NOT NULL,
    generated_at timestamptz NOT NULL DEFAULT now(),
    confidence numeric(3,2) DEFAULT 0.0,
    data_quality text DEFAULT 'unknown',
    analysis_type text DEFAULT 'basic',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

/*
 * insight_templates - Reusable insight templates for different scenarios
 */
CREATE TABLE IF NOT EXISTS public.insight_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category text NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    description_template text NOT NULL,
    recommendation_template text NOT NULL,
    conditions jsonb NOT NULL,
    priority text DEFAULT 'medium',
    is_active boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

/*
 * insight_metrics - Track performance of different insight types
 */
CREATE TABLE IF NOT EXISTS public.insight_metrics (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    insight_type text NOT NULL,
    category text NOT NULL,
    generated_at timestamptz NOT NULL,
    confidence numeric(3,2),
    was_acted_upon boolean DEFAULT false,
    action_taken_at timestamptz,
    outcome_score numeric(3,2),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

/*
 * analytics_aggregates - Pre-computed analytics for faster insights
 */
CREATE TABLE IF NOT EXISTS public.analytics_aggregates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    menu_id uuid REFERENCES public.menus(id) ON DELETE CASCADE,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    period_type text NOT NULL, -- 'daily', 'weekly', 'monthly'
    metrics jsonb NOT NULL,
    computed_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, menu_id, period_start, period_type)
);

/*
 * industry_benchmarks - Store industry-wide performance benchmarks
 */
CREATE TABLE IF NOT EXISTS public.industry_benchmarks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category text NOT NULL,
    metric_name text NOT NULL,
    metric_value numeric(10,4) NOT NULL,
    sample_size integer NOT NULL,
    percentile_25 numeric(10,4),
    percentile_50 numeric(10,4),
    percentile_75 numeric(10,4),
    percentile_90 numeric(10,4),
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(category, metric_name, period_start)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User insights indexes
CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON public.user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_generated_at ON public.user_insights(generated_at);
CREATE INDEX IF NOT EXISTS idx_user_insights_confidence ON public.user_insights(confidence);

-- Insight templates indexes
CREATE INDEX IF NOT EXISTS idx_insight_templates_category ON public.insight_templates(category);
CREATE INDEX IF NOT EXISTS idx_insight_templates_type ON public.insight_templates(type);
CREATE INDEX IF NOT EXISTS idx_insight_templates_active ON public.insight_templates(is_active) WHERE is_active = true;

-- Insight metrics indexes
CREATE INDEX IF NOT EXISTS idx_insight_metrics_user_id ON public.insight_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_metrics_type ON public.insight_metrics(insight_type);
CREATE INDEX IF NOT EXISTS idx_insight_metrics_generated_at ON public.insight_metrics(generated_at);

-- Analytics aggregates indexes
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_user_id ON public.analytics_aggregates(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_menu_id ON public.analytics_aggregates(menu_id);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_period ON public.analytics_aggregates(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregates_type ON public.analytics_aggregates(period_type);

-- Industry benchmarks indexes
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_category ON public.industry_benchmarks(category);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_metric ON public.industry_benchmarks(metric_name);
CREATE INDEX IF NOT EXISTS idx_industry_benchmarks_period ON public.industry_benchmarks(period_start, period_end);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- User insights policies
CREATE POLICY "user_insights_select_own" ON public.user_insights 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_insights_insert_own" ON public.user_insights 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_insights_update_own" ON public.user_insights 
    FOR UPDATE USING (auth.uid() = user_id);

-- Insight templates policies (public read)
CREATE POLICY "insight_templates_select_public" ON public.insight_templates 
    FOR SELECT USING (is_active = true);

-- Insight metrics policies
CREATE POLICY "insight_metrics_select_own" ON public.insight_metrics 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insight_metrics_insert_own" ON public.insight_metrics 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "insight_metrics_update_own" ON public.insight_metrics 
    FOR UPDATE USING (auth.uid() = user_id);

-- Analytics aggregates policies
CREATE POLICY "analytics_aggregates_select_own" ON public.analytics_aggregates 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_aggregates_insert_own" ON public.analytics_aggregates 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Industry benchmarks policies (public read)
CREATE POLICY "industry_benchmarks_select_public" ON public.industry_benchmarks 
    FOR SELECT USING (true);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

/*
 * Function to get latest insights for a user
 */
CREATE OR REPLACE FUNCTION get_latest_user_insights(user_id uuid)
RETURNS TABLE (
    insights jsonb,
    generated_at timestamptz,
    confidence numeric,
    data_quality text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ui.insights,
        ui.generated_at,
        ui.confidence,
        ui.data_quality
    FROM public.user_insights ui
    WHERE ui.user_id = get_latest_user_insights.user_id
    ORDER BY ui.generated_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/*
 * Function to calculate analytics aggregates for a user
 */
CREATE OR REPLACE FUNCTION calculate_analytics_aggregates(
    target_user_id uuid,
    start_date timestamptz,
    end_date timestamptz,
    period_type text DEFAULT 'daily'
)
RETURNS void AS $$
DECLARE
    menu_record RECORD;
    current_period timestamptz;
    period_end timestamptz;
    metrics jsonb;
BEGIN
    -- Get user's menus
    FOR menu_record IN 
        SELECT id, slug, title FROM public.menus 
        WHERE user_id = target_user_id AND is_active = true
    LOOP
        -- Calculate aggregates for each period
        current_period := start_date;
        
        WHILE current_period < end_date LOOP
            -- Calculate period end based on period type
            IF period_type = 'daily' THEN
                period_end := current_period + interval '1 day';
            ELSIF period_type = 'weekly' THEN
                period_end := current_period + interval '1 week';
            ELSIF period_type = 'monthly' THEN
                period_end := current_period + interval '1 month';
            ELSE
                RAISE EXCEPTION 'Invalid period_type: %', period_type;
            END IF;
            
            -- Calculate metrics for this period
            SELECT jsonb_build_object(
                'total_views', COUNT(*) FILTER (WHERE event_type = 'menu_view'),
                'total_clicks', COUNT(*) FILTER (WHERE event_type = 'item_click'),
                'mobile_views', COUNT(*) FILTER (WHERE event_type = 'menu_view' AND is_mobile = true),
                'desktop_views', COUNT(*) FILTER (WHERE event_type = 'menu_view' AND is_mobile = false),
                'unique_sessions', COUNT(DISTINCT session_id),
                'click_through_rate', 
                    CASE 
                        WHEN COUNT(*) FILTER (WHERE event_type = 'menu_view') > 0 
                        THEN (COUNT(*) FILTER (WHERE event_type = 'item_click')::numeric / 
                              COUNT(*) FILTER (WHERE event_type = 'menu_view')) * 100
                        ELSE 0
                    END
            ) INTO metrics
            FROM public.analytics_events ae
            WHERE ae.menu_slug = menu_record.slug
                AND ae.timestamp >= current_period
                AND ae.timestamp < period_end
                AND ae.is_bot = false;
            
            -- Insert or update aggregate
            INSERT INTO public.analytics_aggregates (
                user_id, menu_id, period_start, period_end, period_type, metrics
            ) VALUES (
                target_user_id, menu_record.id, current_period, period_end, period_type, metrics
            )
            ON CONFLICT (user_id, menu_id, period_start, period_type)
            DO UPDATE SET 
                period_end = EXCLUDED.period_end,
                metrics = EXCLUDED.metrics,
                computed_at = now();
            
            -- Move to next period
            current_period := period_end;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

/*
 * Function to get industry benchmarks for a metric
 */
CREATE OR REPLACE FUNCTION get_industry_benchmark(
    metric_category text,
    metric_name text,
    target_percentile numeric DEFAULT 50
)
RETURNS TABLE (
    benchmark_value numeric,
    sample_size integer,
    period_start timestamptz,
    period_end timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN target_percentile = 25 THEN ib.percentile_25
            WHEN target_percentile = 50 THEN ib.percentile_50
            WHEN target_percentile = 75 THEN ib.percentile_75
            WHEN target_percentile = 90 THEN ib.percentile_90
            ELSE ib.percentile_50
        END as benchmark_value,
        ib.sample_size,
        ib.period_start,
        ib.period_end
    FROM public.industry_benchmarks ib
    WHERE ib.category = metric_category
        AND ib.metric_name = metric_name
    ORDER BY ib.period_start DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE INSIGHT TEMPLATES
-- ============================================================================

-- Insert sample insight templates
INSERT INTO public.insight_templates (category, type, title, description_template, recommendation_template, conditions) VALUES
('performance', 'high_ctr', 'Excellent Click-Through Rate', 
 'Your menu has an outstanding click-through rate of {ctr}%, which is {comparison} the industry average.',
 'Maintain your current strategy and consider expanding successful elements to other menus.',
 '{"min_ctr": 20, "comparison_threshold": 1.2}'),

('performance', 'low_ctr', 'Low Engagement Alert',
 'Your click-through rate of {ctr}% indicates customers are viewing but not engaging with menu items.',
 'Improve menu descriptions, add photos, and make items more visually appealing to increase engagement.',
 '{"max_ctr": 10, "min_views": 50}'),

('behavior', 'mobile_heavy', 'Mobile-First Customer Base',
 '{mobile_percentage}% of your customers view menus on mobile devices, indicating a mobile-first audience.',
 'Optimize your menu for mobile viewing with larger text, simplified navigation, and touch-friendly design.',
 '{"min_mobile_percentage": 70, "min_views": 100}'),

('optimization', 'peak_hours', 'Peak Performance Hours',
 'Your menu performs best during {peak_hours}, with {peak_views} views at peak time.',
 'Schedule promotional activities and ensure menu is optimized during peak hours.',
 '{"min_views": 50, "peak_threshold": 0.8}'),

('predictive', 'growth_trend', 'Positive Growth Trend',
 'Your menu views are {trend_direction} by {trend_percentage}% per week, showing {trend_quality} growth.',
 'Capitalize on growing interest by optimizing peak hours and popular items.',
 '{"min_data_points": 14, "trend_threshold": 5}'),

('competitive', 'above_average', 'Above Industry Performance',
 'Your {metric_name} of {user_value} is {percentage}% above the industry average of {industry_value}.',
 'Maintain your competitive advantage with consistent menu quality and innovation.',
 '{"min_improvement": 20, "min_sample_size": 100}'),

('recommendation', 'menu_optimization', 'Menu Layout Optimization',
 'Reorder your menu to highlight high-performing items and improve low-performing ones.',
 'Move {top_item} to the top of its category and consider updating {low_items} descriptions.',
 '{"min_items": 5, "performance_variance": 0.3}');

-- ============================================================================
-- SAMPLE INDUSTRY BENCHMARKS
-- ============================================================================

-- Insert sample industry benchmarks (these would be updated regularly with real data)
INSERT INTO public.industry_benchmarks (category, metric_name, metric_value, sample_size, percentile_25, percentile_50, percentile_75, percentile_90, period_start, period_end) VALUES
('engagement', 'click_through_rate', 15.2, 1000, 8.5, 15.2, 22.1, 28.7, 
 '2024-01-01 00:00:00+00', '2024-01-31 23:59:59+00'),

('traffic', 'mobile_percentage', 72.3, 1000, 65.1, 72.3, 79.8, 85.2,
 '2024-01-01 00:00:00+00', '2024-01-31 23:59:59+00'),

('performance', 'average_session_duration', 180, 1000, 120, 180, 240, 300,
 '2024-01-01 00:00:00+00', '2024-01-31 23:59:59+00'),

('conversion', 'bounce_rate', 45.2, 1000, 35.1, 45.2, 55.8, 65.3,
 '2024-01-01 00:00:00+00', '2024-01-31 23:59:59+00'),

('revenue', 'average_order_value', 28.50, 500, 22.30, 28.50, 35.20, 42.80,
 '2024-01-01 00:00:00+00', '2024-01-31 23:59:59+00');

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Verify the setup
SELECT 
    'AI Insights Schema Setup Complete! 🧠' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
        'user_insights', 'insight_templates', 'insight_metrics', 
        'analytics_aggregates', 'industry_benchmarks'
    )) as tables_created,
    (SELECT COUNT(*) FROM public.insight_templates) as insight_templates,
    (SELECT COUNT(*) FROM public.industry_benchmarks) as industry_benchmarks,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%insight%') as functions_created;

-- ============================================================================
-- USAGE INSTRUCTIONS
-- ============================================================================

/*
 * To use the AI Insights system:
 * 
 * 1. Analytics Collection:
 *    - The AnalyticsCollector service will gather data from all user tables
 *    - Data is processed and stored in analytics_aggregates for performance
 * 
 * 2. Insight Generation:
 *    - The AIInsightsEngine generates insights using AI/ML algorithms
 *    - Insights are stored in user_insights table
 *    - Templates from insight_templates guide insight generation
 * 
 * 3. Benchmarking:
 *    - Compare user performance against industry_benchmarks
 *    - Use get_industry_benchmark() function for comparisons
 * 
 * 4. Metrics Tracking:
 *    - Track insight performance in insight_metrics table
 *    - Monitor which insights lead to user actions
 * 
 * 5. Automation:
 *    - Set up cron jobs to run calculate_analytics_aggregates() regularly
 *    - Schedule insight generation for all active users
 * 
 * Example queries:
 * 
 * -- Get latest insights for a user
 * SELECT * FROM get_latest_user_insights('user-uuid-here');
 * 
 * -- Calculate daily aggregates for last 30 days
 * SELECT calculate_analytics_aggregates(
 *     'user-uuid-here',
 *     now() - interval '30 days',
 *     now(),
 *     'daily'
 * );
 * 
 * -- Get industry benchmark for click-through rate
 * SELECT * FROM get_industry_benchmark('engagement', 'click_through_rate', 75);
 */

SELECT 'AI Insights system ready! Use the AnalyticsCollector and AIInsightsEngine services to generate intelligent analytics.' as next_step;
