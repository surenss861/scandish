import React from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '../components/DashboardSidebar.jsx';
import MenuTemplates from '../components/MenuTemplates.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function MenuTemplatesPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#080705] text-[#FFFFFA] flex">
            <DashboardSidebar activeSection="templates" />

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
                            Menu Templates
                        </h1>
                        <p className="text-[#d6d6d6]">
                            Choose from professionally designed menu templates to get started quickly
                        </p>
                    </div>

                    {/* Templates Component */}
                    <MenuTemplates />
                </motion.div>
            </div>
        </div>
    );
}





