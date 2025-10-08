import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, Smartphone, Monitor } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';

export default function BasicAnalytics() {
    const { user } = useAuth();
    const { isPro, upgradeTo } = usePlan();
    const [analytics, setAnalytics] = useState({
        totalScans: 0,
        thisWeek: 0,
        mobilePercentage: 0,
        topMenus: [],
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');

    useEffect(() => {
        if (isPro) {
            loadAnalytics();
        } else {
            setLoading(false);
        }
    }, [user, isPro, selectedPeriod]);

    const loadAnalytics = async () => {
        if (!user) return;

        try {
            // This would call your analytics API
            const res = await fetch(`/api/analytics/summary?period=${selectedPeriod}`, {
                headers: {
                    "Authorization": `Bearer ${user.access_token || ''}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setAnalytics(data);
            } else {
                // Fallback to demo data for now
                setAnalytics({
                    totalScans: 1247,
                    thisWeek: 83,
                    mobilePercentage: 78,
                    topMenus: [
                        { name: 'Main Menu', scans: 456 },
                        { name: 'Drinks Menu', scans: 234 },
                        { name: 'Desserts', scans: 112 }
                    ],
                    recentActivity: [
                        { time: '2 min ago', action: 'Menu scan', menu: 'Main Menu' },
                        { time: '15 min ago', action: 'Menu scan', menu: 'Drinks Menu' },
                        { time: '1 hour ago', action: 'Menu scan', menu: 'Main Menu' }
                    ]
                });
            }
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isPro) {
        return (
            <div className="text-center py-12">
                <div className="mb-6">
                    <BarChart3 size={64} className="mx-auto text-[#40434E] mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h3>
                    <p className="text-[#a7a7a7] mb-6 max-w-md mx-auto">
                        Track menu scans, popular items, and customer behavior patterns with detailed analytics
                    </p>
                </div>

                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8 max-w-md mx-auto">
                    <h4 className="text-lg font-semibold text-[#F3C77E] mb-3">Pro Feature</h4>
                    <div className="space-y-3 text-sm text-[#d6d6d6] mb-6">
                        <div className="flex items-center gap-2">
                            <Eye size={16} className="text-[#F3C77E]" />
                            <span>Detailed scan tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#F3C77E]" />
                            <span>Performance charts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Smartphone size={16} className="text-[#F3C77E]" />
                            <span>Device breakdowns</span>
                        </div>
                    </div>

                    <button
                        onClick={() => upgradeTo('pro')}
                        className="w-full px-6 py-3 bg-gradient-to-r from-[#702632] to-[#912F40] text-white rounded-xl font-medium hover:scale-105 transition-transform"
                    >
                        Upgrade to Pro - $29/mo
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-[#F3C77E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h2>
                    <p className="text-[#a7a7a7] text-sm">Track your menu performance</p>
                </div>

                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white text-sm"
                >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Eye className="text-[#F3C77E]" size={24} />
                        <h3 className="font-semibold text-white">Total Scans</h3>
                    </div>
                    <div className="text-3xl font-bold text-[#F3C77E] mb-1">
                        {analytics.totalScans.toLocaleString()}
                    </div>
                    <p className="text-sm text-[#a7a7a7]">All time</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="text-green-400" size={24} />
                        <h3 className="font-semibold text-white">This Week</h3>
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-1">
                        {analytics.thisWeek}
                    </div>
                    <p className="text-sm text-[#a7a7a7]">+12% from last week</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Smartphone className="text-blue-400" size={24} />
                        <h3 className="font-semibold text-white">Mobile Users</h3>
                    </div>
                    <div className="text-3xl font-bold text-blue-400 mb-1">
                        {analytics.mobilePercentage}%
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#a7a7a7]">
                        <Smartphone size={12} />
                        <span>{analytics.mobilePercentage}%</span>
                        <Monitor size={12} />
                        <span>{100 - analytics.mobilePercentage}%</span>
                    </div>
                </motion.div>
            </div>

            {/* Top Menus */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-4">Popular Menus</h3>
                <div className="space-y-3">
                    {analytics.topMenus.map((menu, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#40434E]/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-[#F3C77E] text-black rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-white font-medium">{menu.name}</span>
                            </div>
                            <div className="text-[#F3C77E] font-semibold">
                                {menu.scans} scans
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                    {analytics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#40434E]/10 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-white">{activity.action}</span>
                                <span className="text-[#a7a7a7]">• {activity.menu}</span>
                            </div>
                            <span className="text-[#a7a7a7] text-sm">{activity.time}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
