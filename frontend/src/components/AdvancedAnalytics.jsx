import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Eye,
    Smartphone,
    Monitor,
    Clock,
    Calendar,
    MapPin,
    MousePointer,
    RefreshCw
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';

// Simple Chart Components (replace with recharts or similar in production)
function BarChart({ data, height = 200 }) {
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="space-y-2">
            <div className="flex items-end justify-between gap-2" style={{ height }}>
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-1 flex-1">
                        <div className="flex flex-col justify-end h-full">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(item.value / maxValue) * 80}%` }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gradient-to-t from-[#F3C77E] to-[#d6a856] rounded-t-sm min-h-[4px] w-full"
                            />
                        </div>
                        <span className="text-xs text-[#a7a7a7] text-center break-all">
                            {item.label}
                        </span>
                        <span className="text-xs font-medium text-[#F3C77E]">
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LineChart({ data, height = 120 }) {
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((item, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: 100 - ((item.value / maxValue) * 80)
    }));

    const pathData = points.reduce((acc, point, index) => {
        return acc + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, '');

    return (
        <div className="relative" style={{ height }}>
            <svg width="100%" height="100%" className="overflow-visible">
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map(y => (
                    <line
                        key={y}
                        x1="0%"
                        x2="100%"
                        y1={`${y}%`}
                        y2={`${y}%`}
                        stroke="rgba(64, 67, 78, 0.2)"
                        strokeWidth="1"
                    />
                ))}

                {/* Area under curve */}
                <path
                    d={`${pathData} L 100 100 L 0 100 Z`}
                    fill="url(#gradient)"
                    fillOpacity="0.1"
                />

                {/* Line */}
                <motion.path
                    d={pathData}
                    fill="none"
                    stroke="#F3C77E"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />

                {/* Data points */}
                {points.map((point, index) => (
                    <motion.circle
                        key={index}
                        cx={`${point.x}%`}
                        cy={`${point.y}%`}
                        r="3"
                        fill="#F3C77E"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    />
                ))}

                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#F3C77E" />
                        <stop offset="100%" stopColor="#d6a856" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

export default function AdvancedAnalytics() {
    const { user } = useAuth();
    const { isPro, upgradeTo } = usePlan();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('7d');
    const [selectedMenu, setSelectedMenu] = useState('all');
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        if (isPro) {
            loadAnalytics();
            loadMenus();
        } else {
            setLoading(false);
        }
    }, [user, isPro, selectedPeriod, selectedMenu]);

    const loadMenus = async () => {
        if (!user) return;

        try {
            const res = await fetch("/api/menus/mine/list", {
                headers: { "Authorization": `Bearer ${user.access_token || ''}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMenus(data.menus || []);
            }
        } catch (error) {
            console.error("Failed to load menus:", error);
        }
    };

    const loadAnalytics = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Try to load real analytics data
            const res = await fetch(`/api/analytics/summary?period=${selectedPeriod}`, {
                headers: { "Authorization": `Bearer ${user.access_token || ''}` }
            });

            if (res.ok) {
                const realData = await res.json();
                setAnalytics(realData);
                return;
            }

            // Fallback to demo data if API fails
            const generateDemoData = () => {
                const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
                const today = new Date();

                const dailyScans = Array.from({ length: days }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() - (days - 1 - i));
                    return {
                        date: date.toISOString().split('T')[0],
                        scans: Math.floor(Math.random() * 50) + 10,
                        clicks: Math.floor(Math.random() * 20) + 5
                    };
                });

                const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
                    hour: `${hour}:00`,
                    scans: Math.floor(Math.random() * 20) + (hour >= 11 && hour <= 14 ? 30 : hour >= 17 && hour <= 21 ? 25 : 5)
                }));

                const deviceData = [
                    { device: 'Mobile', percentage: 78, count: 1247 },
                    { device: 'Desktop', percentage: 22, count: 352 }
                ];

                const topItems = [
                    { name: 'Margherita Pizza', clicks: 156, views: 892 },
                    { name: 'Caesar Salad', clicks: 134, views: 743 },
                    { name: 'Craft Beer', clicks: 98, views: 567 },
                    { name: 'Tiramisu', clicks: 87, views: 432 },
                    { name: 'Pasta Carbonara', clicks: 76, views: 398 }
                ];

                const locationData = [
                    { country: 'United States', scans: 456 },
                    { country: 'Canada', scans: 234 },
                    { country: 'United Kingdom', scans: 123 },
                    { country: 'Australia', scans: 98 },
                    { country: 'Germany', scans: 67 }
                ];

                return {
                    summary: {
                        totalScans: dailyScans.reduce((sum, day) => sum + day.scans, 0),
                        totalClicks: dailyScans.reduce((sum, day) => sum + day.clicks, 0),
                        avgScanTime: '2m 34s',
                        clickRate: '12.4%',
                        peakHour: '12:00 PM',
                        topCountry: 'United States'
                    },
                    dailyScans,
                    hourlyData,
                    deviceData,
                    topItems,
                    locationData
                };
            };

            const demoData = generateDemoData();
            setAnalytics(demoData);

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
                    <h3 className="text-2xl font-bold text-white mb-2">Advanced Analytics</h3>
                    <p className="text-[#a7a7a7] mb-6 max-w-md mx-auto">
                        Get detailed insights into your menu performance with charts, trends, and customer behavior analytics
                    </p>
                </div>

                <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-8 max-w-md mx-auto">
                    <h4 className="text-lg font-semibold text-[#F3C77E] mb-3">🍾 Pro Feature</h4>
                    <div className="space-y-3 text-sm text-[#d6d6d6] mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-[#F3C77E]" />
                            <span>Interactive charts & graphs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-[#F3C77E]" />
                            <span>Trend analysis & forecasting</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MousePointer size={16} className="text-[#F3C77E]" />
                            <span>Item-level click tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-[#F3C77E]" />
                            <span>Geographic insights</span>
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
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#F3C77E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#a7a7a7]">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Advanced Analytics</h2>
                    <p className="text-[#a7a7a7] text-sm">Detailed insights into your menu performance</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedMenu}
                        onChange={(e) => setSelectedMenu(e.target.value)}
                        className="px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white text-sm"
                    >
                        <option value="all">All Menus</option>
                        {menus.map(menu => (
                            <option key={menu.id} value={menu.slug}>{menu.title}</option>
                        ))}
                    </select>

                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-3 py-2 bg-[#0f0e0c] border border-[#40434E]/40 rounded-lg text-white text-sm"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                    </select>

                    <button
                        onClick={loadAnalytics}
                        className="p-2 bg-[#F3C77E]/20 hover:bg-[#F3C77E]/30 rounded-lg transition-colors"
                    >
                        <RefreshCw size={16} className="text-[#F3C77E]" />
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: Eye, label: 'Total Scans', value: analytics.summary.totalScans.toLocaleString(), color: 'text-[#F3C77E]' },
                    { icon: MousePointer, label: 'Item Clicks', value: analytics.summary.totalClicks.toLocaleString(), color: 'text-blue-400' },
                    { icon: Clock, label: 'Avg. Scan Time', value: analytics.summary.avgScanTime, color: 'text-green-400' },
                    { icon: TrendingUp, label: 'Click Rate', value: analytics.summary.clickRate, color: 'text-purple-400' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <stat.icon className={stat.color} size={24} />
                            <h3 className="font-semibold text-white">{stat.label}</h3>
                        </div>
                        <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                            {stat.value}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Daily Scans Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-[#F3C77E]" />
                        Daily Menu Scans
                    </h3>
                    <LineChart data={analytics.dailyScans.map(d => ({ label: d.date.slice(5), value: d.scans }))} />
                </motion.div>

                {/* Hourly Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-[#F3C77E]" />
                        Peak Hours
                    </h3>
                    <BarChart data={analytics.hourlyData.filter((_, i) => i % 3 === 0).map(d => ({ label: d.hour, value: d.scans }))} height={150} />
                </motion.div>
            </div>

            {/* Device & Location Analytics */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Device Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Smartphone size={20} className="text-[#F3C77E]" />
                        Device Usage
                    </h3>
                    <div className="space-y-4">
                        {analytics.deviceData.map((device, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {device.device === 'Mobile' ? <Smartphone size={16} /> : <Monitor size={16} />}
                                        <span className="text-white font-medium">{device.device}</span>
                                    </div>
                                    <span className="text-[#F3C77E] font-semibold">{device.percentage}%</span>
                                </div>
                                <div className="w-full bg-[#40434E]/20 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${device.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                                        className="bg-gradient-to-r from-[#F3C77E] to-[#d6a856] h-2 rounded-full"
                                    />
                                </div>
                                <p className="text-xs text-[#a7a7a7]">{device.count.toLocaleString()} scans</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Top Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#F3C77E]" />
                        Popular Items
                    </h3>
                    <div className="space-y-3">
                        {analytics.topItems.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-[#40434E]/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 bg-[#F3C77E] text-black rounded-full flex items-center justify-center text-xs font-bold">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <span className="text-white font-medium block">{item.name}</span>
                                        <span className="text-xs text-[#a7a7a7]">{item.views} views</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#F3C77E] font-semibold">{item.clicks}</div>
                                    <div className="text-xs text-[#a7a7a7]">clicks</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Geographic Data */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
            >
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-[#F3C77E]" />
                    Geographic Distribution
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analytics.locationData.map((location, index) => (
                        <div key={index} className="text-center p-4 bg-[#40434E]/10 rounded-lg">
                            <div className="text-[#F3C77E] font-bold text-xl mb-1">{location.scans}</div>
                            <div className="text-white text-sm">{location.country}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
