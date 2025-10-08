import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Menu,
    BarChart3,
    Palette,
    User,
    CreditCard,
    Settings,
    ChevronLeft,
    Crown,
    Lock,
    Brain,
    Building2,
    Layout,
    Megaphone,
    BookOpen,
    Bell,
    MessageCircle
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export default function DashboardSidebar({ activeSection, onSectionChange, isCollapsed, onToggleCollapse }) {
    const { isPro, isStarter, isFree, upgradeTo } = usePlan();
    const navigate = useNavigate();

    // Debug logging for component mount and props
    useEffect(() => {
        console.log('🔄 DashboardSidebar mounted/updated');
        console.log('🔄 activeSection:', activeSection);
        console.log('🔄 onSectionChange type:', typeof onSectionChange);
        console.log('🔄 isCollapsed:', isCollapsed);
        console.log('🔄 Plan status - isFree:', isFree, 'isStarter:', isStarter, 'isPro:', isPro);
    }, [activeSection, onSectionChange, isCollapsed, isFree, isStarter, isPro]);

    // Create navigation items with proper availability based on plan
    const navigationItems = useMemo(() => [
        {
            id: 'menus',
            label: 'My Menus',
            icon: Menu,
            badge: null,
            available: true,
            requiresPlan: null
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            badge: null,
            available: true,
            requiresPlan: 'starter'
        },
        {
            id: 'locations',
            label: 'Locations',
            icon: Building2,
            badge: null,
            available: true,
            requiresPlan: 'starter'
        },
        {
            id: 'branding',
            label: 'Custom Branding',
            icon: Palette,
            badge: null,
            available: true,
            requiresPlan: null,
            route: '/branding/logo'
        },
        {
            id: 'templates',
            label: 'Templates',
            icon: Layout,
            badge: 'NEW',
            available: true,
            requiresPlan: 'starter'
        },
        {
            id: 'marketing',
            label: 'Marketing',
            icon: Megaphone,
            badge: null,
            available: true,
            requiresPlan: null
        },
        {
            id: 'read-before-buy',
            label: 'Read Before You Buy',
            icon: BookOpen,
            badge: null,
            available: true,
            requiresPlan: null
        },
        {
            id: 'updates',
            label: 'Updates',
            icon: Bell,
            badge: null,
            available: true,
            requiresPlan: null
        },
        {
            id: 'contact',
            label: 'Contact',
            icon: MessageCircle,
            badge: null,
            available: true,
            requiresPlan: null
        },
        {
            id: 'account',
            label: 'Account & Billing',
            icon: User,
            badge: null,
            available: true,
            requiresPlan: null
        }
    ], [isFree]);

    const handleItemClick = (item) => {
        console.log('🔍 Sidebar click:', item.id, 'available:', item.available);
        console.log('🔍 Item details:', { id: item.id, available: item.available, requiresPlan: item.requiresPlan });
        console.log('🔍 Item has route:', !!item.route);
        console.log('🔍 onSectionChange function:', typeof onSectionChange);

        // Check if this is a dashboard section (not a separate route)
        const dashboardSections = ['menus', 'templates', 'marketing', 'read-before-buy', 'updates', 'contact', 'analytics', 'locations', 'account'];
        console.log('🔍 Dashboard sections:', dashboardSections);
        console.log('🔍 Is in dashboard sections:', dashboardSections.includes(item.id));

        if (dashboardSections.includes(item.id)) {
            console.log('✅ Changing dashboard section to:', item.id);
            if (typeof onSectionChange === 'function') {
                try {
                    onSectionChange(item.id);
                    console.log('✅ onSectionChange called successfully');
                } catch (error) {
                    console.error('❌ Error calling onSectionChange:', error);
                }
            } else {
                console.error('❌ onSectionChange is not a function:', typeof onSectionChange);
                // Fallback: try to navigate to dashboard with section
                try {
                    navigate(`/dashboard?section=${item.id}`);
                    console.log('✅ Fallback navigation called');
                } catch (navError) {
                    console.error('❌ Fallback navigation failed:', navError);
                }
            }
        } else if (item.route) {
            console.log('🌐 Navigating to:', item.route);
            try {
                navigate(item.route);
                console.log('✅ navigate called successfully');
            } catch (error) {
                console.error('❌ Error calling navigate:', error);
            }
        }
    };

    return (
        <motion.div
            initial={{ width: isCollapsed ? 80 : 280 }}
            animate={{ width: isCollapsed ? 80 : 280 }}
            transition={{ duration: 0.3 }}
            className="relative h-full bg-[#0f0e0c]/90 backdrop-blur-xl border-r border-[#40434E]/40 flex flex-col"
        >
            {/* Header */}
            <div className="p-6 border-b border-[#40434E]/40">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div>
                            <h2 className="text-lg font-bold text-white">Dashboard</h2>
                            <p className="text-xs text-[#a7a7a7] capitalize">{isPro ? '🍾 Pro' : isStarter ? '🍷 Starter' : '🥗 Free'} Plan</p>
                        </div>
                    )}
                    <button
                        onClick={onToggleCollapse}
                        className="p-2 rounded-lg hover:bg-[#40434E]/20 transition-colors"
                    >
                        <ChevronLeft
                            size={16}
                            className={`text-[#a7a7a7] transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        const isLocked = false;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-[#F3C77E]/20 border border-[#F3C77E]/30 text-[#F3C77E]'
                                    : isLocked
                                        ? 'text-[#666] hover:bg-[#40434E]/10 cursor-pointer'
                                        : 'text-[#d6d6d6] hover:bg-[#40434E]/20 hover:text-white'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon size={20} />

                                </div>

                                {!isCollapsed && (
                                    <>
                                        <span className="flex-1 text-left text-sm font-medium">
                                            {item.label}
                                        </span>


                                    </>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </nav>

            {/* Upgrade CTA for Free Users */}
            {isFree && !isCollapsed && (
                <div className="p-4 border-t border-[#40434E]/40">
                    <div className="p-4 bg-gradient-to-r from-[#F3C77E]/10 to-[#d6a856]/10 border border-[#F3C77E]/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={16} className="text-[#F3C77E]" />
                            <span className="text-sm font-semibold text-[#F3C77E]">Upgrade Available</span>
                        </div>
                        <p className="text-xs text-[#d6d6d6] mb-3">
                            Unlock photos, remove watermarks, and get up to 5 menus
                        </p>
                        <button
                            onClick={() => upgradeTo('starter')}
                            className="w-full px-3 py-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg text-sm font-medium hover:scale-105 transition-transform"
                        >
                            Upgrade to Starter
                        </button>
                    </div>
                </div>
            )}

            {/* Upgrade CTA for Starter Users */}
            {isStarter && !isCollapsed && (
                <div className="p-4 border-t border-[#40434E]/40">
                    <div className="p-4 bg-gradient-to-r from-[#702632]/10 to-[#912F40]/10 border border-[#702632]/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={16} className="text-[#702632]" />
                            <span className="text-sm font-semibold text-[#702632]">Go Pro</span>
                        </div>
                        <p className="text-xs text-[#d6d6d6] mb-3">
                            Get analytics, custom branding, and unlimited menus
                        </p>
                        <button
                            onClick={() => upgradeTo('pro')}
                            className="w-full px-3 py-2 bg-gradient-to-r from-[#702632] to-[#912F40] text-white rounded-lg text-sm font-medium hover:scale-105 transition-transform"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            )}

        </motion.div>
    );
}


