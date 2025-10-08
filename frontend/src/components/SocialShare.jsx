import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, MessageCircle, Instagram, Copy, CheckCircle } from 'lucide-react';

export default function SocialShare({ menuTitle, menuUrl, className = "" }) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareText = `Check out ${menuTitle}'s digital menu! 🍽️`;
    const fullUrl = window.location.origin + menuUrl;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const shareOptions = [
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            action: () => {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, '_blank');
            }
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            action: () => {
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`, '_blank');
            }
        },
        {
            name: 'Instagram Story',
            icon: Instagram,
            color: 'text-pink-500',
            bg: 'bg-pink-500/10',
            action: () => {
                // Instagram doesn't have direct sharing, so copy link and show instructions
                copyToClipboard();
                alert('Link copied! Open Instagram, create a story, and paste the link in your bio or story text.');
            }
        },
        {
            name: 'Copy Link',
            icon: Copy,
            color: 'text-gray-400',
            bg: 'bg-gray-400/10',
            action: copyToClipboard
        }
    ];

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all text-white text-sm"
            >
                <Share2 size={16} />
                Share Menu
            </button>

            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Share Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-[200px]"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                            Share this menu
                        </h3>

                        <div className="space-y-2">
                            {shareOptions.map((option) => {
                                const Icon = option.icon;

                                return (
                                    <button
                                        key={option.name}
                                        onClick={() => {
                                            option.action();
                                            setShowMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg hover:${option.bg} transition-colors text-left`}
                                    >
                                        <Icon size={18} className={option.color} />
                                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                                            {option.name}
                                        </span>
                                        {option.name === 'Copy Link' && copied && (
                                            <CheckCircle size={14} className="text-green-500 ml-auto" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Share Stats */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 text-center">
                                Help spread the word about great food! 🍽️
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}

// Floating share button for mobile
export function FloatingShareButton({ menuTitle, menuUrl }) {
    return (
        <div className="fixed bottom-6 left-6 z-40 md:hidden">
            <SocialShare
                menuTitle={menuTitle}
                menuUrl={menuUrl}
                className="transform"
            />
        </div>
    );
}
