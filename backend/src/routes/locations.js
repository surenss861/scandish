const express = require('express');
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get all locations for a user's organization
router.get('/mine', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user's organization and locations
        const { data: organization, error: orgError } = await supabase
            .from('organization_members')
            .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          slug,
          description,
          logo_url,
          website,
          phone,
          address,
          city,
          state,
          country,
          timezone,
          is_active,
          created_at
        )
      `)
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (orgError || !organization) {
            return res.status(404).json({
                error: 'Organization not found',
                message: 'User is not part of any organization'
            });
        }

        // Get all locations for this organization
        const { data: locations, error: locationsError } = await supabase
            .from('locations')
            .select(`
        id,
        name,
        slug,
        address,
        city,
        state,
        postal_code,
        country,
        phone,
        email,
        manager_name,
        timezone,
        is_active,
        created_at,
        updated_at
      `)
            .eq('organization_id', organization.organization_id)
            .order('created_at', { ascending: false });

        if (locationsError) {
            console.error('Error fetching locations:', locationsError);
            return res.status(500).json({ error: 'Failed to fetch locations' });
        }

        // Get menu data for each location
        const locationIds = locations.map(loc => loc.id);
        const { data: menus, error: menuError } = await supabase
            .from('menus')
            .select('id, name, location_id, is_active')
            .in('location_id', locationIds)
            .eq('is_active', true);

        if (!menuError && menus) {
            // Group menus by location
            const menusByLocation = menus.reduce((acc, menu) => {
                if (!acc[menu.location_id]) {
                    acc[menu.location_id] = [];
                }
                acc[menu.location_id].push(menu.name);
                return acc;
            }, {});

            // Add menu data to each location
            locations.forEach(location => {
                location.menu_names = menusByLocation[location.id] || [];
                location.menu_count = location.menu_names.length;
            });
        } else {
            // If no menus found, initialize empty arrays
            locations.forEach(location => {
                location.menu_names = [];
                location.menu_count = 0;
            });
        }

        // Calculate organization stats
        const totalMenus = locations.reduce((sum, loc) => sum + (loc.menu_count || 0), 0);
        const totalScans = 0; // This would come from analytics in a real implementation

        res.json({
            organization: {
                ...organization.organizations,
                totalLocations: locations.length,
                totalMenus,
                totalScans,
                monthlyRevenue: 0 // This would come from billing analytics
            },
            locations: locations.map(location => ({
                ...location,
                menus: location.menu_names || [], // Real menu names from database
                scans: 0, // This would come from analytics
                manager: location.manager_name,
                phone: location.phone,
                email: location.email,
                status: location.is_active ? 'active' : 'inactive',
                zipCode: location.postal_code
            }))
        });

    } catch (error) {
        console.error('Error in /api/locations/mine:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new location
router.post('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            name,
            address,
            city,
            state,
            zipCode,
            phone,
            manager,
            email,
            description
        } = req.body;

        if (!name || !address) {
            return res.status(400).json({ error: 'Name and address are required' });
        }

        // Get user's organization or create one if it doesn't exist
        let { data: member, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            // User doesn't have an organization, create one automatically
            const { data: userData } = await supabase.auth.getUser();
            const userEmail = userData?.user?.email || 'user@example.com';

            // Create organization
            const { data: organization, error: orgError } = await supabase
                .from('organizations')
                .insert({
                    name: 'My Restaurant',
                    slug: `my-restaurant-${Date.now()}`,
                    description: 'My restaurant organization',
                    is_active: true
                })
                .select()
                .single();

            if (orgError || !organization) {
                return res.status(500).json({
                    error: 'Failed to create organization',
                    message: 'Could not create organization for user'
                });
            }

            // Add user as owner of the organization
            const { error: memberError2 } = await supabase
                .from('organization_members')
                .insert({
                    organization_id: organization.id,
                    user_id: userId,
                    role: 'owner',
                    is_active: true
                });

            if (memberError2) {
                return res.status(500).json({
                    error: 'Failed to create organization membership',
                    message: 'Could not add user to organization'
                });
            }

            // Update member data
            member = {
                organization_id: organization.id,
                role: 'owner'
            };
        }

        // Check if user has permission to create locations
        if (!['owner', 'admin', 'manager'].includes(member.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'Only owners, admins, and managers can create locations'
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        // Create location
        const { data: location, error: locationError } = await supabase
            .from('locations')
            .insert({
                organization_id: member.organization_id,
                name,
                slug,
                address,
                city: city || null,
                state: state || null,
                postal_code: zipCode || null,
                phone: phone || null,
                email: email || null,
                manager_name: manager || null,
                is_active: true
            })
            .select()
            .single();

        if (locationError) {
            console.error('Error creating location:', locationError);
            return res.status(500).json({ error: 'Failed to create location' });
        }

        res.status(201).json({
            success: true,
            location: {
                ...location,
                manager: location.manager_name,
                phone: location.phone,
                email: location.email,
                status: location.is_active ? 'active' : 'inactive',
                zipCode: location.postal_code,
                menus: [], // New location starts with no menus
                scans: 0,
                menu_count: 0
            }
        });

    } catch (error) {
        console.error('Error in POST /api/locations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update a location
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const locationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user has permission to update this location
        const { data: member, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Get the location to verify it belongs to user's organization
        const { data: location, error: locationError } = await supabase
            .from('locations')
            .select('organization_id')
            .eq('id', locationId)
            .single();

        if (locationError || !location || location.organization_id !== member.organization_id) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Check permissions
        if (!['owner', 'admin', 'manager'].includes(member.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'Only owners, admins, and managers can update locations'
            });
        }

        const updateData = {};
        const allowedFields = ['name', 'address', 'city', 'state', 'zipCode', 'phone', 'email', 'manager', 'description', 'status'];

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key) && req.body[key] !== undefined) {
                // Map frontend field names to database field names
                if (key === 'manager') {
                    updateData['manager_name'] = req.body[key];
                } else if (key === 'zipCode') {
                    updateData['postal_code'] = req.body[key];
                } else if (key === 'status') {
                    updateData['is_active'] = req.body[key] === 'active';
                } else {
                    updateData[key] = req.body[key];
                }
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Update location
        const { data: updatedLocation, error: updateError } = await supabase
            .from('locations')
            .update(updateData)
            .eq('id', locationId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating location:', updateError);
            return res.status(500).json({ error: 'Failed to update location' });
        }

        // Get current menu data for this location
        const { data: menus, error: menuError } = await supabase
            .from('menus')
            .select('name')
            .eq('location_id', locationId)
            .eq('is_active', true);

        const menuNames = menuError ? [] : menus.map(menu => menu.name);

        res.json({
            success: true,
            location: {
                ...updatedLocation,
                manager: updatedLocation.manager_name,
                phone: updatedLocation.phone,
                email: updatedLocation.email,
                status: updatedLocation.is_active ? 'active' : 'inactive',
                zipCode: updatedLocation.postal_code,
                menus: menuNames,
                scans: 0,
                menu_count: menuNames.length
            }
        });

    } catch (error) {
        console.error('Error in PUT /api/locations/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a location
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const locationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user has permission to delete this location
        const { data: member, error: memberError } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Only owners and admins can delete locations
        if (!['owner', 'admin'].includes(member.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'Only owners and admins can delete locations'
            });
        }

        // Get the location to verify it belongs to user's organization
        const { data: location, error: locationError } = await supabase
            .from('locations')
            .select('organization_id')
            .eq('id', locationId)
            .single();

        if (locationError || !location || location.organization_id !== member.organization_id) {
            return res.status(404).json({ error: 'Location not found' });
        }

        // Check if location has active menus
        const { data: menus, error: menusError } = await supabase
            .from('menus')
            .select('id')
            .eq('location_id', locationId)
            .eq('is_active', true);

        if (menusError) {
            console.error('Error checking menus:', menusError);
            return res.status(500).json({ error: 'Failed to check location dependencies' });
        }

        if (menus && menus.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete location',
                message: 'Location has active menus. Please deactivate or delete menus first.'
            });
        }

        // Delete location
        const { error: deleteError } = await supabase
            .from('locations')
            .delete()
            .eq('id', locationId);

        if (deleteError) {
            console.error('Error deleting location:', deleteError);
            return res.status(500).json({ error: 'Failed to delete location' });
        }

        res.json({ success: true, message: 'Location deleted successfully' });

    } catch (error) {
        console.error('Error in DELETE /api/locations/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
