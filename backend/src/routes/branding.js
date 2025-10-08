const express = require('express');
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/branding
 * Get user's branding settings
 */
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: branding, error } = await supabase
            .from('branding_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
        }

        // Return default branding if none exists
        const defaultBranding = {
            logo_url: null,
            logo_path: null,
            primary_color: '#F3C77E',
            secondary_color: '#702632',
            accent_color: '#d6a856',
            font_family: 'inter',
            menu_layout: 'single-column',
            corner_radius: 12,
            content_spacing: 'comfortable',
            background_pattern: 'none',
            animation_style: 'subtle',
            button_style: 'rounded',
            custom_css: '',
            // Menu-specific defaults
            menu_style: 'minimal',
            item_display: 'full-details',
            price_style: 'inline',
            category_style: 'headers',
            show_item_images: true,
            show_allergens: false,
            show_calories: false,
            compact_mode: false,
            is_active: true
        };

        return res.json(branding || defaultBranding);
    } catch (err) {
        console.error('[GET /api/branding]', err);
        return res.status(500).json({ error: err.message || 'Failed to fetch branding settings' });
    }
});

/**
 * PUT /api/branding
 * Update user's branding settings
 */
router.put('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            logo_url,
            logo_path,
            primary_color,
            secondary_color,
            accent_color,
            font_family,
            menu_layout,
            corner_radius,
            content_spacing,
            background_pattern,
            animation_style,
            button_style,
            custom_css,
            // Menu-specific fields
            menu_style,
            item_display,
            price_style,
            category_style,
            show_item_images,
            show_allergens,
            show_calories,
            compact_mode
        } = req.body;

        // Validate required fields
        if (!primary_color || !secondary_color || !accent_color) {
            return res.status(400).json({ error: 'Missing required color fields' });
        }

        // Validate color format (basic hex validation)
        const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!hexColorRegex.test(primary_color) || !hexColorRegex.test(secondary_color) || !hexColorRegex.test(accent_color)) {
            return res.status(400).json({ error: 'Invalid color format. Colors must be valid hex codes (e.g., #FF5733)' });
        }

        // Validate corner radius
        if (corner_radius !== undefined && (corner_radius < 0 || corner_radius > 50)) {
            return res.status(400).json({ error: 'Corner radius must be between 0 and 50' });
        }

        const brandingData = {
            user_id: userId,
            logo_url: logo_url || null,
            logo_path: logo_path || null,
            primary_color,
            secondary_color,
            accent_color,
            font_family: font_family || 'inter',
            menu_layout: menu_layout || 'single-column',
            corner_radius: corner_radius || 12,
            content_spacing: content_spacing || 'comfortable',
            background_pattern: background_pattern || 'none',
            animation_style: animation_style || 'subtle',
            button_style: button_style || 'rounded',
            custom_css: custom_css || '',
            // Menu-specific fields
            menu_style: menu_style || 'minimal',
            item_display: item_display || 'full-details',
            price_style: price_style || 'inline',
            category_style: category_style || 'headers',
            show_item_images: show_item_images !== undefined ? show_item_images : true,
            show_allergens: show_allergens !== undefined ? show_allergens : false,
            show_calories: show_calories !== undefined ? show_calories : false,
            compact_mode: compact_mode !== undefined ? compact_mode : false,
            is_active: true,
            updated_at: new Date().toISOString()
        };

        // Use upsert to either insert or update
        const { data, error } = await supabase
            .from('branding_settings')
            .upsert(brandingData, {
                onConflict: 'user_id',
                ignoreDuplicates: false
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return res.json(data);
    } catch (err) {
        console.error('[PUT /api/branding]', err);
        return res.status(500).json({ error: err.message || 'Failed to save branding settings' });
    }
});

/**
 * DELETE /api/branding
 * Reset branding settings to defaults
 */
router.delete('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from('branding_settings')
            .delete()
            .eq('user_id', userId);

        if (error) {
            throw error;
        }

        return res.json({ message: 'Branding settings reset to defaults' });
    } catch (err) {
        console.error('[DELETE /api/branding]', err);
        return res.status(500).json({ error: err.message || 'Failed to reset branding settings' });
    }
});

module.exports = router;
