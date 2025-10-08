import React from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import MultiLocationManager from '../components/MultiLocationManager.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MultiLocationPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#080705] text-[#FFFFFA] flex">
            <DashboardSidebar activeSection="locations" />

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
                            Multi-Location Management
                        </h1>
                        <p className="text-[#d6d6d6]">
                            Manage multiple restaurant locations from a single dashboard
                        </p>
                    </div>

                    {/* Multi-Location Component */}
                    <MultiLocationManager />
                </motion.div>
            </div>
        </div>
    );
}





