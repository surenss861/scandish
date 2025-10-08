import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Smartphone, Monitor, Tablet } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';

export default function BrandingPreview() {
    const { branding, logo } = useBranding();
    const [previewDevice, setPreviewDevice] = useState('mobile');

    return (
        <div className="bg-[#0f0e0c]/90 backdrop-blur-xl border border-[#40434E]/40 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Eye size={20} className="text-[#F3C77E]" />
                    Live Preview
                </h3>

                {/* Device Selector */}
                <div className="flex items-center gap-2 bg-[#0a0908] rounded-lg p-1 border border-[#40434E]/40">
                    <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-2 rounded transition-all ${previewDevice === 'mobile'
                            ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                            : 'text-[#a7a7a7] hover:text-white'
                            }`}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewDevice('tablet')}
                        className={`p-2 rounded transition-all ${previewDevice === 'tablet'
                            ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                            : 'text-[#a7a7a7] hover:text-white'
                            }`}
                        title="Tablet View"
                    >
                        <Tablet size={16} />
                    </button>
                    <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-2 rounded transition-all ${previewDevice === 'desktop'
                            ? 'bg-[#F3C77E]/10 text-[#F3C77E]'
                            : 'text-[#a7a7a7] hover:text-white'
                            }`}
                        title="Desktop View"
                    >
                        <Monitor size={16} />
                    </button>
                </div>
            </div>

            {/* Simple Preview */}
            <div className="flex justify-center">
                <div className={`bg-[#0a0908] rounded-xl p-4 ${previewDevice === 'mobile' ? 'w-full max-w-[320px]' :
                    previewDevice === 'tablet' ? 'w-full max-w-[600px]' :
                        'w-full'
                    }`}>
                    <div
                        className="bg-white rounded-xl p-6 space-y-4"
                        style={{
                            borderRadius: `${branding.cornerRadius}px`,
                            fontFamily: branding.fontFamily === 'inter' ? '"Inter", system-ui, sans-serif' :
                                branding.fontFamily === 'poppins' ? '"Poppins", system-ui, sans-serif' :
                                    branding.fontFamily === 'playfair' ? '"Playfair Display", serif' :
                                        branding.fontFamily === 'roboto' ? '"Roboto", system-ui, sans-serif' :
                                            branding.fontFamily === 'openSans' ? '"Open Sans", system-ui, sans-serif' :
                                                branding.fontFamily === 'montserrat' ? '"Montserrat", system-ui, sans-serif' :
                                                    branding.fontFamily === 'lora' ? '"Lora", serif' :
                                                        branding.fontFamily === 'sourceSans' ? '"Source Sans Pro", system-ui, sans-serif' :
                                                            '"Inter", system-ui, sans-serif'
                        }}
                    >
                        {/* Header with Logo */}
                        <div className="text-center pb-4 border-b" style={{ borderColor: `${branding.secondaryColor}20` }}>
                            {logo ? (
                                <img src={logo} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
                            ) : (
                                <div className="h-12 flex items-center justify-center mb-2">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold" style={{ color: branding.secondaryColor }}>
                                Your Restaurant
                            </h2>
                        </div>

                        {/* Sample Menu Items */}
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg" style={{ color: branding.primaryColor }}>
                                Featured Items
                            </h3>
                            {[
                                { name: 'Signature Pasta', price: '$18.99', desc: 'House-made pasta with seasonal ingredients' },
                                { name: 'Grilled Salmon', price: '$24.99', desc: 'Fresh Atlantic salmon with herbs' },
                                { name: 'Craft Cocktail', price: '$12.99', desc: 'Artisanal cocktails made fresh' }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-start p-3 rounded-lg"
                                    style={{
                                        backgroundColor: `${branding.accentColor}10`,
                                        borderRadius: `${branding.cornerRadius}px`,
                                        padding: branding.contentSpacing === 'compact' ? '0.5rem' :
                                            branding.contentSpacing === 'spacious' ? '1.5rem' :
                                                branding.contentSpacing === 'luxury' ? '2rem' : '1rem',
                                    }}
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                                    </div>
                                    <span
                                        className="font-bold px-3 py-1 rounded-lg text-white"
                                        style={{
                                            backgroundColor: branding.primaryColor
                                        }}
                                    >
                                        {item.price}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Branded Footer */}
                        <div className="text-center pt-4 border-t" style={{ borderColor: `${branding.secondaryColor}20` }}>
                            <p className="text-xs" style={{ color: branding.secondaryColor }}>
                                Powered by {logo ? 'Your Brand' : 'Scandish'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
