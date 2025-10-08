import { supabase } from '../lib/supabaseClient';

const STORAGE_BUCKET = 'menu-photos';

export class StorageService {
    /**
     * Upload a photo to Supabase Storage
     * @param {File} file - The image file to upload
     * @param {string} userId - User ID for organizing files
     * @param {string} menuId - Menu ID for organizing files
     * @returns {Promise<{url: string, path: string}>} - Public URL and storage path
     */
    static async uploadPhoto(file, userId, menuId) {
        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }

            // Validate file size (max 2MB for logos)
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (file.size > maxSize) {
                throw new Error('Image must be smaller than 2MB');
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${userId}/${menuId}/${fileName}`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(filePath);

            return {
                url: publicUrl,
                path: filePath
            };
        } catch (error) {
            console.error('Photo upload failed:', error);
            throw new Error(error.message || 'Failed to upload photo');
        }
    }

    /**
     * Delete a photo from Supabase Storage
     * @param {string} filePath - The storage path of the file to delete
     * @returns {Promise<boolean>} - Success status
     */
    static async deletePhoto(filePath) {
        try {
            const { error } = await supabase.storage
                .from(STORAGE_BUCKET)
                .remove([filePath]);

            if (error) {
                throw error;
            }

            return true;
        } catch (error) {
            console.error('Photo deletion failed:', error);
            return false;
        }
    }

    /**
     * Get optimized image URL with transformations
     * @param {string} publicUrl - Original public URL
     * @param {object} options - Transformation options
     * @returns {string} - Optimized URL
     */
    static getOptimizedUrl(publicUrl, options = {}) {
        const {
            width = 400,
            height = 300,
            quality = 80,
            format = 'webp'
        } = options;

        // For now, return the original URL
        // In production, you could use Supabase's image transformations
        // or a service like Cloudinary
        return publicUrl;
    }

    /**
     * Create a preview URL for immediate display
     * @param {File} file - The image file
     * @returns {string} - Object URL for preview
     */
    static createPreviewUrl(file) {
        return URL.createObjectURL(file);
    }

    /**
     * Revoke a preview URL to free memory
     * @param {string} url - The object URL to revoke
     */
    static revokePreviewUrl(url) {
        URL.revokeObjectURL(url);
    }
}
