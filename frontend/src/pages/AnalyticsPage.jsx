import React from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import SimpleAnalytics from '../components/SimpleAnalytics.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function AnalyticsPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#080705] text-[#FFFFFA] flex">
            <DashboardSidebar activeSection="analytics" />

            <div className="flex-1 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-7xl mx-auto"
                >
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Menu Analytics
                        </h1>
                        <p className="text-[#d6d6d6]">
                            Track your menu performance and understand customer behavior
                        </p>
                    </div>

                    {/* Analytics Component */}
                    <SimpleAnalytics />
                </motion.div>
            </div>
        </div>
    );
}





