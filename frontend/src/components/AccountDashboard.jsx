import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileService from '../services/profileService';
import { usePlan } from '../context/PlanContext';
import {
    CreditCard,
    Settings,
    Download,
    Calendar,
    Crown,
    CheckCircle,
    LogOut,
    Edit3,
    BarChart3,
    User,
    Building,
    Globe,
    MapPin,
    Mail,
    Clock,
    Star,
    ArrowUpRight,
    Plus,
    MoreHorizontal,
    Eye,
    EyeOff,
    CreditCard as CardIcon,
    Receipt,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const AccountDashboard = ({ user, onSignOut }) => {
    const { userPlan, refreshPlan } = usePlan();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState({
        restaurantName: '',
        phone: '',
        address: '',
        website: '',
        description: ''
    });

    // Account creation date (you can modify this to get from user data)
    const accountCreatedDate = new Date('2024-01-15');

    // Calendar component for account created date
    const CalendarComponent = ({ date }) => {
        const [currentMonth, setCurrentMonth] = useState(date.getMonth());
        const [currentYear, setCurrentYear] = useState(date.getFullYear());

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

        const days = [];
        const startDate = 1;
        const endDate = daysInMonth;

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
        }

        // Add days of the month
        for (let day = startDate; day <= endDate; day++) {
            const isAccountCreatedDay = day === date.getDate() && currentMonth === date.getMonth() && currentYear === date.getFullYear();
            days.push(
                <div
                    key={day}
                    className={`w-8 h-8 flex items-center justify-center text-sm rounded-full ${isAccountCreatedDay
                            ? 'bg-[#F3C77E] text-[#080705] font-bold'
                            : 'text-[#d6d6d6] hover:bg-[#40434E]/30'
                        }`}
                >
                    {day}
                </div>
            );
        }

        const navigateMonth = (direction) => {
            if (direction === 'prev') {
                if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                } else {
                    setCurrentMonth(currentMonth - 1);
                }
            } else {
                if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                } else {
                    setCurrentMonth(currentMonth + 1);
                }
            }
        };

        return (
            <div className="bg-[#171613] border border-[#40434E]/40 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-[#40434E]/30 rounded"
                    >
                        <ChevronLeft className="w-4 h-4 text-[#d6d6d6]" />
                    </button>
                    <h4 className="text-sm font-medium text-white">
                        {monthNames[currentMonth]} {currentYear}
                    </h4>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-[#40434E]/30 rounded"
                    >
                        <ChevronRight className="w-4 h-4 text-[#d6d6d6]" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} className="w-8 h-6 flex items-center justify-center text-xs text-[#a7a7a7] font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>

                <div className="mt-2 text-xs text-[#F3C77E] text-center">
                    Account created: {date.toLocaleDateString()}
                </div>
            </div>
        );
    };

    // Load profile data on mount
    useEffect(() => {
        const loadProfileData = async () => {
            if (!user?.id) return;

            setLoading(true);
            try {
                const profile = await ProfileService.getUserProfile(user.id);
                if (profile) {
                    setProfileData({
                        restaurantName: profile.restaurant_name || '',
                        phone: profile.phone || '',
                        address: profile.address || '',
                        website: profile.website || '',
                        description: profile.description || ''
                    });
                }
            } catch (err) {
                console.error('Error loading profile data:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        loadProfileData();
    }, [user?.id]);

    // Auto-enable editing when switching to settings tab
    useEffect(() => {
        if (activeTab === 'settings') {
            setIsEditing(true);
        }
    }, [activeTab]);

    // Check for successful upgrade redirect
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');

        if (success === 'true') {
            // Refresh plan data after successful upgrade
            setTimeout(() => {
                refreshPlan();
                // Clear the URL parameter
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 2000);
        }
    }, [refreshPlan]);

    // Handle tab changes safely
    const handleTabChange = (tabId) => {
        try {
            setActiveTab(tabId);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Error changing tab:', err);
            setError('Failed to switch tab. Please refresh the page.');
        }
    };

    // Save profile data to Supabase
    const handleSaveProfile = async () => {
        if (!user?.id) return;

        setSaving(true);
        setError(null);

        try {
            await ProfileService.saveUserProfile(user.id, {
                ...profileData,
                email: user.email
            });

            setSaveSuccess(true);
            setIsEditing(false);

            // Hide success message after 3 seconds
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            let errorMessage = 'Failed to save profile data. Please try again.';

            if (err.message) {
                if (err.message.includes('column') && err.message.includes('does not exist')) {
                    errorMessage = 'Database schema needs to be updated. Please contact support.';
                } else if (err.message.includes('permission denied') || err.message.includes('RLS')) {
                    errorMessage = 'Permission denied. Please check your authentication.';
                } else {
                    errorMessage = `Error: ${err.message}`;
                }
            }

            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };


    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'upgrade', label: 'Upgrade', icon: Crown },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    // Memoize plan info to prevent re-rendering issues
    const planInfo = useMemo(() => {
        switch (userPlan) {
            case 'starter':
                return {
                    name: 'Starter Plan',
                    icon: '⭐',
                    color: 'text-[#F3C77E]',
                    price: '$19.99',
                    features: ['Up to 3 menus', 'Unlimited menu items', 'Basic analytics', 'Email support']
                };
            case 'pro':
                return {
                    name: 'Pro Plan',
                    icon: '🚀',
                    color: 'text-[#912F40]',
                    price: '$49.99',
                    features: ['Unlimited menus', 'Advanced analytics', 'Custom branding', 'Priority support', 'API access']
                };
            default:
                return {
                    name: 'Free Plan',
                    icon: '🍽️',
                    color: 'text-[#40434E]',
                    price: 'Free',
                    features: ['1 menu', 'Up to 20 items', 'Basic features']
                };
        }
    }, [userPlan]);

    // Available upgrade plans
    const upgradePlans = [
        {
            id: 'starter',
            name: 'Starter Plan',
            icon: '⭐',
            price: '$9',
            period: 'month',
            color: 'text-[#F3C77E]',
            bgColor: 'from-[#F3C77E]/20 to-[#F3C77E]/10',
            borderColor: 'border-[#F3C77E]/30',
            features: [
                'Up to 3 menus',
                'Unlimited menu items',
                'Basic analytics',
                'Email support',
                'Custom QR codes'
            ],
            stripePriceId: 'price_1SCSYcIrWFeHqnZlc0NbLtZC', // Starter Plan Price ID ($9/month)
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro Plan',
            icon: '🚀',
            price: '$29',
            period: 'month',
            color: 'text-[#912F40]',
            bgColor: 'from-[#912F40]/20 to-[#912F40]/10',
            borderColor: 'border-[#912F40]/30',
            features: [
                'Unlimited menus',
                'Advanced analytics',
                'Custom branding',
                'Priority support',
                'API access',
                'White-label options',
                'Custom domains'
            ],
            stripePriceId: 'price_1SCSZPIrWFeHqnZl8rTrEUkg', // Pro Plan Price ID ($29/month)
            popular: true
        }
    ];

    // Handle Stripe checkout
    const handleUpgrade = async (planId) => {
        try {
            const plan = upgradePlans.find(p => p.id === planId);
            if (!plan) return;

            // Create Stripe checkout session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: plan.stripePriceId,
                    userId: user?.id,
                    userEmail: user?.email,
                    planId: planId
                })
            });

            const { sessionId, url } = await response.json();

            if (url) {
                // Redirect to Stripe Checkout
                window.location.href = url;
            } else {
                setError('Failed to create checkout session. Please try again.');
            }
        } catch (err) {
            console.error('Error creating checkout session:', err);
            setError('Failed to start upgrade process. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-[#080705]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#FFFFFA]">Account & Billing</h1>
                    <p className="mt-2 text-[#40434E]">Manage your restaurant's digital presence</p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-[#40434E] mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-[#F3C77E] text-[#F3C77E]'
                                        : 'border-transparent text-[#40434E] hover:text-[#FFFFFA] hover:border-[#912F40]'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-[#912F40]/10 border border-[#912F40]/30 rounded-lg">
                        <p className="text-[#912F40]">{error}</p>
                    </div>
                )}

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >

                            {/* Profile Information */}
                            <div className="bg-[#1a1a1a] rounded-lg border border-[#40434E] p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-[#FFFFFA]">Profile Information</h3>
                                    <button
                                        onClick={() => setActiveTab('settings')}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3C77E] text-[#FFFFFA] rounded-lg hover:bg-[#912F40] transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Email Address */}
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-[#40434E]/30 rounded-lg">
                                            <Mail className="w-5 h-5 text-[#F3C77E]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#40434E]">Email Address</p>
                                            <p className="text-[#FFFFFA]">{user?.email || 'Not set'}</p>
                                        </div>
                                    </div>

                                    {/* Restaurant Name */}
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-[#40434E]/30 rounded-lg">
                                            <Building className="w-5 h-5 text-[#F3C77E]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#40434E]">Restaurant Name</p>
                                            <p className="text-[#FFFFFA]">{profileData.restaurantName || 'Not set'}</p>
                                        </div>
                                    </div>

                                    {/* Account Created with Calendar */}
                                    <div className="flex flex-col space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-[#40434E]/30 rounded-lg">
                                                <Calendar className="w-5 h-5 text-[#F3C77E]" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-[#40434E]">Account Created</p>
                                                <p className="text-[#FFFFFA]">{accountCreatedDate.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <CalendarComponent date={accountCreatedDate} />
                                    </div>

                                    {/* Last Login */}
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-[#40434E]/30 rounded-lg">
                                            <Clock className="w-5 h-5 text-[#F3C77E]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#40434E]">Last Login</p>
                                            <p className="text-[#FFFFFA]">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'billing' && (
                        <motion.div
                            key="billing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Current Plan */}
                            <div className="bg-[#1a1a1a] rounded-lg border border-[#40434E] p-6">
                                <h3 className="text-lg font-semibold text-[#FFFFFA] mb-6">Current Plan</h3>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="text-3xl">{planInfo.icon}</div>
                                            <div>
                                                <h4 className={`text-2xl font-semibold ${planInfo.color}`}>
                                                    {planInfo.name}
                                                </h4>
                                                <p className="text-[#40434E]">Active subscription</p>
                                                <p className="text-lg font-medium text-[#FFFFFA] mt-1">{planInfo.price}/month</p>
                                            </div>
                                        </div>
                                        {userPlan !== 'pro' && (
                                            <button
                                                onClick={() => setActiveTab('upgrade')}
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#912F40] text-[#FFFFFA] rounded-lg hover:bg-[#F3C77E] hover:text-[#080705] transition-colors"
                                            >
                                                <Crown className="w-5 h-5" />
                                                Upgrade Plan
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-[#40434E] pt-6">
                                        <h5 className="text-sm font-medium text-[#40434E] mb-3">Plan Features</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {planInfo.features.map((feature, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <CheckCircle className="w-4 h-4 text-[#F3C77E]" />
                                                    <span className="text-sm text-[#FFFFFA]">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'upgrade' && (
                        <motion.div
                            key="upgrade"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Upgrade Plans */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-[#FFFFFA] mb-2">Choose Your Plan</h3>
                                <p className="text-[#40434E]">Upgrade to unlock more features and grow your restaurant</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {upgradePlans.map((plan) => (
                                    <motion.div
                                        key={plan.id}
                                        whileHover={{ scale: 1.03, y: -8 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className={`relative bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-3xl border-2 ${plan.borderColor} p-10 shadow-2xl backdrop-blur-xl ${plan.popular ? 'ring-4 ring-[#F3C77E]/40 shadow-[#F3C77E]/20' : 'hover:border-[#F3C77E]/50'
                                            }`}
                                    >
                                        {/* Popular Badge */}
                                        {plan.popular && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                                            >
                                                <span className="bg-gradient-to-r from-[#912F40] via-[#F3C77E] to-[#912F40] text-[#FFFFFA] px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                                    ⭐ Most Popular
                                                </span>
                                            </motion.div>
                                        )}

                                        {/* Plan Icon */}
                                        <div className="text-center mb-8">
                                            <motion.div
                                                whileHover={{ rotate: 5, scale: 1.1 }}
                                                className="inline-block p-6 rounded-3xl shadow-xl bg-gradient-to-br from-[#F3C77E]/20 to-[#912F40]/20 border border-[#F3C77E]/30"
                                            >
                                                <div className="text-5xl mb-4">{plan.icon}</div>
                                            </motion.div>
                                        </div>

                                        {/* Plan Info */}
                                        <div className="text-center mb-10">
                                            <h4 className={`text-3xl font-bold ${plan.color} mb-3`}>
                                                {plan.name}
                                            </h4>
                                            <div className="flex items-baseline justify-center mb-2">
                                                <span className="text-5xl font-bold text-[#FFFFFA]">{plan.price}</span>
                                                <span className="text-xl text-[#F3C77E] ml-2">/{plan.period}</span>
                                            </div>
                                            <p className="text-[#40434E] text-sm">
                                                {plan.id === 'starter' ? 'Perfect for growing restaurants' : 'Everything you need to succeed'}
                                            </p>
                                        </div>

                                        {/* Features */}
                                        <div className="space-y-4 mb-10">
                                            {plan.features.map((feature, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="flex items-center space-x-4"
                                                >
                                                    <div className="p-1 bg-[#F3C77E]/20 rounded-full">
                                                        <CheckCircle className="w-5 h-5 text-[#F3C77E] flex-shrink-0" />
                                                    </div>
                                                    <span className="text-[#FFFFFA] text-sm font-medium">{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Upgrade Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleUpgrade(plan.id)}
                                            className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg ${plan.id === 'pro'
                                                ? 'bg-gradient-to-r from-[#912F40] to-[#F3C77E] text-[#FFFFFA] hover:shadow-xl hover:shadow-[#912F40]/30 hover:from-[#F3C77E] hover:to-[#912F40]'
                                                : 'bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] hover:shadow-xl hover:shadow-[#F3C77E]/30 hover:from-[#d6a856] hover:to-[#F3C77E]'
                                                }`}
                                        >
                                            🚀 Upgrade to {plan.name}
                                        </motion.button>

                                        {/* Subtle glow effect */}
                                        <div className={`absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 ${plan.popular ? 'opacity-100' : 'group-hover:opacity-50'
                                            } ${plan.id === 'pro'
                                                ? 'bg-gradient-to-br from-[#912F40]/5 to-transparent'
                                                : 'bg-gradient-to-br from-[#F3C77E]/5 to-transparent'
                                            }`} />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Current Plan Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-2xl border-2 border-[#F3C77E]/20 p-8 max-w-4xl mx-auto shadow-xl backdrop-blur-xl"
                            >
                                <h4 className="text-xl font-bold text-[#FFFFFA] mb-6 text-center">Your Current Plan</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className="p-4 rounded-2xl bg-gradient-to-br from-[#F3C77E]/20 to-[#912F40]/20 border border-[#F3C77E]/30"
                                        >
                                            <div className="text-3xl">{planInfo.icon}</div>
                                        </motion.div>
                                        <div>
                                            <h5 className={`text-2xl font-bold ${planInfo.color}`}>
                                                {planInfo.name}
                                            </h5>
                                            <p className="text-[#F3C77E] text-lg font-semibold">{planInfo.price}/month</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveTab('billing')}
                                        className="bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-[#080705] px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#F3C77E]/25 transition-all duration-200"
                                    >
                                        View Details →
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Profile Settings */}
                            <div className="bg-[#1a1a1a] rounded-lg border border-[#40434E] p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#FFFFFA]">Profile Settings</h3>
                                        <p className="text-[#40434E]">Update your restaurant information</p>
                                    </div>
                                    {isEditing && (
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 text-[#40434E] border border-[#40434E] rounded-lg hover:bg-[#40434E]/20 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F3C77E] text-[#FFFFFA] rounded-lg hover:bg-[#912F40] disabled:opacity-50 transition-colors"
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-4 h-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Success/Error Messages */}
                                {saveSuccess && (
                                    <div className="mb-4 p-4 bg-[#F3C77E]/10 border border-[#F3C77E]/30 rounded-lg">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-[#F3C77E] mr-2" />
                                            <p className="text-[#F3C77E]">Profile updated successfully!</p>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="mb-4 p-4 bg-[#912F40]/10 border border-[#912F40]/30 rounded-lg">
                                        <p className="text-[#912F40]">{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { icon: Building, label: 'Restaurant Name', key: 'restaurantName', type: 'text', placeholder: 'Your Restaurant Name' },
                                        { icon: Globe, label: 'Phone Number', key: 'phone', type: 'text', placeholder: '+1 (555) 123-4567' },
                                        { icon: Globe, label: 'Website', key: 'website', type: 'url', placeholder: 'https://yourrestaurant.com' },
                                        { icon: MapPin, label: 'Address', key: 'address', type: 'text', placeholder: '123 Main St, City, State' }
                                    ].map((field, index) => {
                                        const Icon = field.icon;
                                        return (
                                            <div key={field.key} className="space-y-2">
                                                <label className="block text-sm font-medium text-[#40434E]">
                                                    {field.label}
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Icon className="h-5 w-5 text-[#F3C77E]" />
                                                    </div>
                                                    <input
                                                        type={field.type}
                                                        value={profileData[field.key] || ''}
                                                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                                                        disabled={!isEditing}
                                                        placeholder={field.placeholder}
                                                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F3C77E] focus:border-[#F3C77E] ${isEditing
                                                            ? 'border-[#40434E] bg-[#2a2a2a] text-[#FFFFFA]'
                                                            : 'border-[#40434E] bg-[#1a1a1a] text-[#40434E]'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Description */}
                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-[#40434E] mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={profileData.description || ''}
                                        onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                                        disabled={!isEditing}
                                        rows={4}
                                        placeholder="Tell customers about your restaurant, cuisine, and what makes you special..."
                                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#F3C77E] focus:border-[#F3C77E] ${isEditing
                                            ? 'border-[#40434E] bg-[#2a2a2a] text-[#FFFFFA]'
                                            : 'border-[#40434E] bg-[#1a1a1a] text-[#40434E]'
                                            }`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccountDashboard;