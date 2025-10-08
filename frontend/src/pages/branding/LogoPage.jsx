import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, Loader2, X } from 'lucide-react';
import { useBrandingState } from '../../hooks/useBrandingState';
import UnifiedBrandingPreview from '../../components/UnifiedBrandingPreview';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';

export default function LogoPage() {
    const { user } = useAuth();
    const { logo, setLogo, logoUrl, setLogoUrl, loading, setLoading, toast, setToast, ping } = useBrandingState();
    const [uploading, setUploading] = useState(false);

    const onLogoDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                setUploading(true);

                // Validate file size (2MB limit)
                if (file.size > 2 * 1024 * 1024) {
                    throw new Error('File size must be less than 2MB');
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    throw new Error('Please upload an image file (PNG, JPG, SVG)');
                }

                const previewUrl = StorageService.createPreviewUrl(file);
                setLogo(previewUrl);
                const { url } = await StorageService.uploadPhoto(file, user?.id || '', 'branding');
                setLogoUrl(url);
                ping('✅ Logo uploaded successfully!');
            } catch (err) {
                console.error('Logo upload error:', err);
                ping(err.message || 'Failed to upload logo', 'error');
                setLogo(null);
                setLogoUrl('');
            } finally {
                setUploading(false);
            }
        }
    }, [user, setUploading, setLogo, setLogoUrl, ping]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onLogoDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const removeLogo = () => {
        setLogo(null);
        setLogoUrl('');
        ping('Logo removed');
    };

    return (
        <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Logo Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-[#0f0e0c] to-[#1a1816] backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8 shadow-xl"
                >
                    <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-[#F3C77E]/10 rounded-xl">
                            <Image size={24} className="text-[#F3C77E]" />
                        </div>
                        Restaurant Logo
                    </h3>

                    <div
                        {...getRootProps()}
                        className={`group w-full h-80 border-2 border-dashed rounded-3xl flex items-center justify-center cursor-pointer transition-all duration-300 ${isDragActive
                            ? "border-[#F3C77E] bg-gradient-to-br from-[#F3C77E]/20 to-[#d6a856]/10 scale-[1.02]"
                            : uploading
                                ? "border-[#F3C77E]/50 bg-[#F3C77E]/5 cursor-not-allowed"
                                : "border-[#40434E]/40 hover:border-[#F3C77E]/60 hover:bg-[#F3C77E]/5"
                            }`}
                    >
                        <input {...getInputProps()} disabled={uploading} />

                        {uploading ? (
                            <div className="text-center text-[#F3C77E]">
                                <Loader2 size={48} className="mx-auto mb-4 animate-spin" />
                                <p className="font-medium text-lg">Uploading logo...</p>
                            </div>
                        ) : logo ? (
                            <div className="relative p-8">
                                <img src={logo} alt="Logo preview" className="max-h-64 max-w-full object-contain rounded-xl shadow-2xl" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex flex-col items-center justify-center gap-4">
                                    <Upload size={32} className="text-white" />
                                    <p className="text-white text-lg font-medium">Click to change logo</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeLogo();
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                                    >
                                        <X size={16} />
                                        Remove Logo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-[#a7a7a7] group-hover:text-[#F3C77E] transition-colors p-8">
                                <div className="p-6 bg-[#F3C77E]/10 rounded-3xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                                    <Upload size={48} className="text-[#F3C77E]" />
                                </div>
                                <p className="text-xl font-semibold text-white mb-2">Upload Your Logo</p>
                                <p className="text-sm mb-2">PNG, JPG, SVG</p>
                                <p className="text-xs text-[#666]">Max 2MB • Best results: 512x512px</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Guidelines Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-6"
                >
                    {/* Best Practices */}
                    <div className="bg-gradient-to-br from-[#0f0e0c] to-[#1a1816] backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-2xl">💡</span>
                            Logo Best Practices
                        </h3>
                        <div className="space-y-4 text-sm text-[#d6d6d6]">
                            <div className="flex items-start gap-3 p-4 bg-[#0a0908] rounded-xl">
                                <span className="text-[#F3C77E] text-xl">✓</span>
                                <div>
                                    <p className="font-medium text-white mb-1">File Format</p>
                                    <p>PNG with transparent background works best. SVG is ideal for scalability.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-[#0a0908] rounded-xl">
                                <span className="text-[#F3C77E] text-xl">✓</span>
                                <div>
                                    <p className="font-medium text-white mb-1">Dimensions</p>
                                    <p>Recommended size: 512x512px or larger. Square logos work best.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-[#0a0908] rounded-xl">
                                <span className="text-[#F3C77E] text-xl">✓</span>
                                <div>
                                    <p className="font-medium text-white mb-1">File Size</p>
                                    <p>Keep under 2MB for fast loading. Compress large files before uploading.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-[#0a0908] rounded-xl">
                                <span className="text-[#F3C77E] text-xl">✓</span>
                                <div>
                                    <p className="font-medium text-white mb-1">Visibility</p>
                                    <p>Ensure your logo is clearly visible on both light and dark backgrounds.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Live Preview */}
            <UnifiedBrandingPreview />

            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-2xl backdrop-blur-xl border text-white shadow-2xl ${toast.type === "error"
                        ? "bg-red-500/90 border-red-400/40"
                        : "bg-[#0f0e0c]/90 border-[#40434E]/40"
                        }`}
                >
                    <span className="text-sm font-medium">{toast.message}</span>
                </motion.div>
            )}
        </div>
    );
}

