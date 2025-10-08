import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield,
    Users,
    BarChart3,
    DollarSign,
    AlertTriangle,
    TrendingUp,
    Eye,
    RefreshCw,
    Download,
    Search,
    Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminPanel() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');

    useEffect(() => {
        // Check if user is admin (in production, verify this on backend)
        const isAdmin = user?.email === 'admin@scandish.ca' || user?.user_metadata?.role === 'admin' || true; // Temporary: allow all users
        if (!isAdmin) {
            window.location.href = '/dashboard';
            return;
        }

        loadAdminData();
    }, [user]);

    const loadAdminData = async () => {
        try {
            setLoading(true);

            // In production, these would be real API calls
            // For now, generate realistic demo data
            const demoStats = {
                totalUsers: 1247,
                totalMenus: 892,
                totalScans: 45678,
                revenue: {
                    mrr: 8940,
                    growth: '+23%',
                    churn: '3.2%'
                },
                planDistribution: {
                    free: 856,
                    starter: 312,
                    pro: 79
                },
                topRestaurants: [
                    { name: "Tony's Pizza", plan: 'pro', scans: 2341, revenue: 29 },
                    { name: "Café Luna", plan: 'starter', scans: 1876, revenue: 9 },
                    { name: "Bella's Italian", plan: 'pro', scans: 1654, revenue: 29 }
                ]
            };

            const demoUsers = Array.from({ length: 20 }, (_, i) => ({
                id: i + 1,
                email: `restaurant${i + 1}@example.com`,
                restaurantName: `Restaurant ${i + 1}`,
                plan: ['free', 'starter', 'pro'][Math.floor(Math.random() * 3)],
                menuCount: Math.floor(Math.random() * 5) + 1,
                totalScans: Math.floor(Math.random() * 1000) + 50,
                joinedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
                lastActive: new Date(2024, 11, Math.floor(Math.random() * 20) + 1)
            }));

            setStats(demoStats);
            setUsers(demoUsers);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
        return matchesSearch && matchesPlan;
    });

    const exportData = () => {
        const csvData = [
            ['Email', 'Restaurant', 'Plan', 'Menus', 'Scans', 'Joined', 'Last Active'],
            ...filteredUsers.map(user => [
                user.email,
                user.restaurantName,
                user.plan,
                user.menuCount,
                user.totalScans,
                user.joinedAt.toISOString().split('T')[0],
                user.lastActive.toISOString().split('T')[0]
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scandish-users-export.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080705] flex items-center justify-center">
                <div className="text-center">
                    <Shield size={32} className="mx-auto text-[#F3C77E] mb-4 animate-pulse" />
                    <p className="text-[#a7a7a7]">Loading admin panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080705] text-white">
            {/* Header */}
            <header className="border-b border-[#40434E]/40 bg-[#0f0e0c]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Shield className="text-[#F3C77E]" size={28} />
                            <div>
                                <h1 className="text-2xl font-bold">Scandish Admin Panel</h1>
                                <p className="text-[#a7a7a7] text-sm">Platform monitoring and management</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadAdminData}
                                className="p-2 bg-[#F3C77E]/20 hover:bg-[#F3C77E]/30 rounded-lg transition-colors"
                            >
                                <RefreshCw size={16} className="text-[#F3C77E]" />
                            </button>
                            <a
                                href="/dashboard"
                                className="px-4 py-2 border border-[#40434E]/50 rounded-lg hover:border-[#F3C77E]/50 transition-colors"
                            >
                                Back to Dashboard
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Users className="text-blue-400" size={24} />
                            <h3 className="font-semibold">Total Users</h3>
                        </div>
                        <div className="text-3xl font-bold text-blue-400 mb-1">
                            {stats.totalUsers.toLocaleString()}
                        </div>
                        <p className="text-xs text-[#a7a7a7]">Registered restaurants</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <Eye className="text-[#F3C77E]" size={24} />
                            <h3 className="font-semibold">Total Scans</h3>
                        </div>
                        <div className="text-3xl font-bold text-[#F3C77E] mb-1">
                            {stats.totalScans.toLocaleString()}
                        </div>
                        <p className="text-xs text-[#a7a7a7]">QR code scans</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <DollarSign className="text-green-400" size={24} />
                            <h3 className="font-semibold">Monthly Revenue</h3>
                        </div>
                        <div className="text-3xl font-bold text-green-400 mb-1">
                            ${stats.revenue.mrr.toLocaleString()}
                        </div>
                        <p className="text-xs text-green-400">{stats.revenue.growth} growth</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="text-purple-400" size={24} />
                            <h3 className="font-semibold">Active Menus</h3>
                        </div>
                        <div className="text-3xl font-bold text-purple-400 mb-1">
                            {stats.totalMenus.toLocaleString()}
                        </div>
                        <p className="text-xs text-[#a7a7a7]">Live digital menus</p>
                    </motion.div>
                </div>

                {/* Plan Distribution */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
                        <div className="space-y-4">
                            {Object.entries(stats.planDistribution).map(([plan, count]) => {
                                const total = Object.values(stats.planDistribution).reduce((a, b) => a + b, 0);
                                const percentage = Math.round((count / total) * 100);

                                return (
                                    <div key={plan} className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="capitalize text-white">{plan}</span>
                                            <span className="text-[#F3C77E]">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-[#40434E]/20 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="bg-gradient-to-r from-[#F3C77E] to-[#d6a856] h-2 rounded-full"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                    >
                        <h3 className="text-lg font-semibold mb-4">Top Performing Restaurants</h3>
                        <div className="space-y-3">
                            {stats.topRestaurants.map((restaurant, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-[#40434E]/10 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 bg-[#F3C77E] text-black rounded-full flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <span className="text-white font-medium block">{restaurant.name}</span>
                                            <span className="text-xs text-[#a7a7a7] capitalize">{restaurant.plan} plan</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[#F3C77E] font-bold">{restaurant.scans.toLocaleString()}</div>
                                        <div className="text-xs text-[#a7a7a7]">${restaurant.revenue}/mo</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* User Management */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">User Management</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={exportData}
                                className="flex items-center gap-2 px-3 py-2 bg-[#F3C77E]/20 hover:bg-[#F3C77E]/30 rounded-lg transition-colors text-sm"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#a7a7a7]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search restaurants..."
                                className="w-full pl-10 pr-4 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white placeholder-[#a7a7a7] focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/50"
                            />
                        </div>

                        <select
                            value={filterPlan}
                            onChange={(e) => setFilterPlan(e.target.value)}
                            className="px-3 py-2 bg-[#171613] border border-[#40434E]/40 rounded-lg text-white"
                        >
                            <option value="all">All Plans</option>
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                        </select>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#40434E]/40">
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Restaurant</th>
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Plan</th>
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Menus</th>
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Scans</th>
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Joined</th>
                                    <th className="text-left py-3 text-[#a7a7a7] text-sm font-medium">Last Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.slice(0, 10).map((user) => (
                                    <tr key={user.id} className="border-b border-[#40434E]/20 hover:bg-[#40434E]/10 transition-colors">
                                        <td className="py-3">
                                            <div>
                                                <div className="font-medium text-white">{user.restaurantName}</div>
                                                <div className="text-xs text-[#a7a7a7]">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${user.plan === 'pro' ? 'bg-purple-400/20 text-purple-400' :
                                                user.plan === 'starter' ? 'bg-blue-400/20 text-blue-400' :
                                                    'bg-gray-400/20 text-gray-400'
                                                }`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="py-3 text-[#d6d6d6]">{user.menuCount}</td>
                                        <td className="py-3 text-[#F3C77E] font-medium">{user.totalScans.toLocaleString()}</td>
                                        <td className="py-3 text-[#d6d6d6]">{user.joinedAt.toLocaleDateString()}</td>
                                        <td className="py-3 text-[#a7a7a7]">{user.lastActive.toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length > 10 && (
                        <div className="mt-4 text-center">
                            <p className="text-[#a7a7a7] text-sm">
                                Showing 10 of {filteredUsers.length} users
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );

    // exportData function is already defined in the component above
}
