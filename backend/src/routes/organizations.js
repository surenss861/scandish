const express = require('express');
const { supabase } = require('../services/supabase');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get user's organization
router.get('/mine', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get user's organization
        const { data: member, error: memberError } = await supabase
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

        if (memberError || !member) {
            return res.status(404).json({
                error: 'Organization not found',
                message: 'User is not part of any organization'
            });
        }

        res.json({
            success: true,
            organization: member.organizations,
            role: member.role
        });

    } catch (error) {
        console.error('Error in /api/organizations/mine:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new organization
router.post('/', async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const {
            name,
            description,
            website,
            phone,
            address,
            city,
            state,
            country = 'US',
            timezone = 'America/New_York'
        } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Organization name is required' });
        }

        // Check if user exists in users table, create if not
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (!existingUser && userError) {
            // User doesn't exist, create them
            const { data: userData } = await supabase.auth.getUser();
            const { error: createUserError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email: userData?.user?.email || 'user@example.com'
                });

            if (createUserError) {
                console.error('Failed to create user:', createUserError);
                return res.status(500).json({
                    error: 'Failed to create user profile',
                    message: 'Could not create user in database'
                });
            }
        }

        // Check if user already has an organization
        const { data: existingMember, error: existingError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (existingMember && !existingError) {
            return res.status(400).json({
                error: 'User already has an organization',
                message: 'Each user can only be part of one organization'
            });
        }

        // Generate slug from name
        const slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');

        // Create organization
        const { data: organization, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name,
                slug,
                description: description || null,
                website: website || null,
                phone: phone || null,
                address: address || null,
                city: city || null,
                state: state || null,
                country,
                timezone,
                is_active: true
            })
            .select()
            .single();

        if (orgError) {
            console.error('Error creating organization:', orgError);
            return res.status(500).json({ error: 'Failed to create organization' });
        }

        // Add user as owner of the organization
        const { error: memberError } = await supabase
            .from('organization_members')
            .insert({
                organization_id: organization.id,
                user_id: userId,
                role: 'owner',
                is_active: true
            });

        if (memberError) {
            console.error('Error creating organization member:', memberError);
            // Clean up the organization if member creation fails
            await supabase.from('organizations').delete().eq('id', organization.id);
            return res.status(500).json({ error: 'Failed to create organization membership' });
        }

        res.status(201).json({
            success: true,
            organization,
            role: 'owner'
        });

    } catch (error) {
        console.error('Error in POST /api/organizations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update organization
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user?.id;
        const organizationId = req.params.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Check if user has permission to update this organization
        const { data: member, error: memberError } = await supabase
            .from('organization_members')
            .select('role')
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Organization not found or access denied' });
        }

        // Only owners and admins can update organization details
        if (!['owner', 'admin'].includes(member.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'Only owners and admins can update organization details'
            });
        }

        const updateData = {};
        const allowedFields = ['name', 'description', 'website', 'phone', 'address', 'city', 'state', 'country', 'timezone', 'is_active'];

        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key) && req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        // Update organization
        const { data: updatedOrganization, error: updateError } = await supabase
            .from('organizations')
            .update(updateData)
            .eq('id', organizationId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating organization:', updateError);
            return res.status(500).json({ error: 'Failed to update organization' });
        }

        res.json({
            success: true,
            organization: updatedOrganization
        });

    } catch (error) {
        console.error('Error in PUT /api/organizations/:id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
