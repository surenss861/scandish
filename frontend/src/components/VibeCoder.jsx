import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    Sparkles,
    Copy,
    Play,
    RotateCcw,
    Download,
    Wand2,
    Terminal,
    Loader2,
    Check,
    AlertCircle,
    MessageSquare,
    Send,
    FileText,
    Palette,
    ChefHat,
    Coffee,
    Pizza,
    Menu,
    Star,
    Zap
} from 'lucide-react';

// Restaurant-specific templates and suggestions
const RESTAURANT_TEMPLATES = [
    {
        category: "Fine Dining",
        icon: "🍽️",
        templates: [
            "Elegant wine list with hover effects",
            "Sophisticated menu with gold accents",
            "Classic French restaurant styling",
            "Luxury seafood menu design"
        ]
    },
    {
        category: "Casual Dining",
        icon: "🍕",
        templates: [
            "Warm family restaurant menu",
            "Pizza place with Italian vibes",
            "Comfort food menu with cozy feel",
            "American diner style layout"
        ]
    },
    {
        category: "Fast Casual",
        icon: "🥗",
        templates: [
            "Modern health food menu",
            "Quick service with clean design",
            "Build-your-own bowl interface",
            "Fresh ingredients showcase"
        ]
    },
    {
        category: "Coffee & Cafe",
        icon: "☕",
        templates: [
            "Cozy coffee shop menu",
            "Artisan bakery display",
            "Brunch menu with warm colors",
            "Specialty drinks presentation"
        ]
    }
];

const MENU_COMPONENTS = [
    { name: "Menu Header", icon: "📋", code: "Create an elegant menu header with restaurant name and logo" },
    { name: "Category Sections", icon: "📂", code: "Design category dividers for appetizers, mains, desserts" },
    { name: "Menu Items", icon: "🍽️", code: "Style individual menu items with prices and descriptions" },
    { name: "Price Tags", icon: "💰", code: "Create attractive price displays and callouts" },
    { name: "Special Items", icon: "⭐", code: "Highlight chef's specials and popular items" },
    { name: "Footer Info", icon: "📍", code: "Add contact info, hours, and location details" }
];

const LANGUAGE_OPTIONS = [
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'scss', label: 'SCSS', icon: '💎' }
];

export default function VibeCoder({ onCodeGenerated, initialCode = '' }) {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState('css');
    const [generatedCode, setGeneratedCode] = useState(initialCode);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hi! I'm your restaurant menu AI assistant. I can help you create beautiful, functional menu designs. What would you like to build today?",
            timestamp: new Date()
        }
    ]);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'templates', 'components'
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const textareaRef = useRef(null);
    const chatEndRef = useRef(null);

    const addChatMessage = (type, content, code = null) => {
        const newMessage = {
            id: Date.now(),
            type,
            content,
            code,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, newMessage]);
    };

    const generateCode = async (customPrompt = null) => {
        const userPrompt = customPrompt || prompt.trim();
        if (!userPrompt) return;

        // Add user message to chat
        addChatMessage('user', userPrompt);

        setIsGenerating(true);
        setError('');
        setSuccess('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiUrl}/api/ai/vibe-coder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: userPrompt,
                    language,
                    context: 'Restaurant menu styling and branding - specialized AI assistant for restaurant owners'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate code');
            }

            const result = await response.json();

            if (result.success) {
                setGeneratedCode(result.code);

                // Add AI response to chat
                addChatMessage('ai', `I've generated ${language.toUpperCase()} code for your restaurant menu. Here's what I created:`, result.code);

                setHistory(prev => [{
                    id: Date.now(),
                    prompt: userPrompt,
                    language,
                    code: result.code,
                    timestamp: new Date()
                }, ...prev.slice(0, 9)]); // Keep last 10 items

                if (onCodeGenerated) {
                    onCodeGenerated(result.code);
                }
                setSuccess('✨ Code generated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                throw new Error(result.error || 'Failed to generate code');
            }
        } catch (err) {
            setError(err.message || 'Failed to generate code');
            addChatMessage('ai', `Sorry, I encountered an error: ${err.message}. Please try again or rephrase your request.`);
            setTimeout(() => setError(''), 5000);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setPrompt(template);
        generateCode(template);
    };

    const handleComponentSelect = (component) => {
        setPrompt(component.code);
        generateCode(component.code);
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setSuccess('📋 Code copied to clipboard!');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to copy code');
            setTimeout(() => setError(''), 3000);
        }
    };

    const applyCode = () => {
        if (onCodeGenerated && generatedCode.trim()) {
            onCodeGenerated(generatedCode);
            setSuccess('🎯 Code applied to your branding! Changes are now live in the preview.');
            setTimeout(() => setSuccess(''), 4000);
        } else {
            setError('No code to apply. Generate some code first!');
            setTimeout(() => setError(''), 3000);
        }
    };

    const loadFromHistory = (item) => {
        setPrompt(item.prompt);
        setLanguage(item.language);
        setGeneratedCode(item.code);
        setShowHistory(false);
    };

    const clearCode = () => {
        setGeneratedCode('');
        setPrompt('');
        setError('');
        setSuccess('');
    };

    const downloadCode = () => {
        const blob = new Blob([generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vibe-coder-${language}-${Date.now()}.${language}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (initialCode) {
            setGeneratedCode(initialCode);
        }
    }, [initialCode]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#0f0e0c] to-[#1a1816] backdrop-blur-xl border border-[#40434E]/40 rounded-2xl overflow-hidden shadow-2xl"
        >
            {/* Enhanced Header with Gradient Background */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F3C77E]/5 via-[#d6a856]/5 to-[#F3C77E]/5 animate-pulse"></div>
                <div className="relative flex items-center justify-between p-5 border-b border-[#40434E]/40">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-xl shadow-lg shadow-[#F3C77E]/20">
                            <ChefHat size={22} className="text-black" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-[#d6d6d6] bg-clip-text text-transparent">Menu AI Assistant</h3>
                            <p className="text-sm text-[#a7a7a7] mt-0.5">Your specialized restaurant coding companion ✨</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-[#0a0908] rounded-lg p-1 border border-[#40434E]/30">
                            {[
                                { id: 'chat', label: 'Chat', icon: MessageSquare },
                                { id: 'templates', label: 'Templates', icon: FileText },
                                { id: 'components', label: 'Components', icon: Code2 }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black shadow-lg'
                                        : 'text-[#d6d6d6] hover:text-white hover:bg-[#40434E]/20'
                                        }`}
                                >
                                    <tab.icon size={14} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={clearCode}
                            className="p-2 text-[#a7a7a7] hover:text-[#F3C77E] transition-all hover:bg-[#40434E]/20 rounded-lg"
                            title="Clear all"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex h-[500px]">
                {/* Sidebar with Enhanced Styling */}
                <div className="w-80 border-r border-[#40434E]/40 bg-gradient-to-b from-[#171613]/80 to-[#0a0908]/80 overflow-y-auto">
                    {activeTab === 'chat' && (
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <div className="p-1.5 bg-[#F3C77E]/10 rounded-lg">
                                    <Zap size={16} className="text-[#F3C77E]" />
                                </div>
                                Quick Actions
                            </div>
                            <div className="space-y-2">
                                {[
                                    { text: "Make my menu more elegant", emoji: "✨" },
                                    { text: "Add hover animations", emoji: "🎨" },
                                    { text: "Create a wine list design", emoji: "🍷" },
                                    { text: "Style the price tags", emoji: "💰" },
                                    { text: "Add a specials section", emoji: "⭐" }
                                ].map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => generateCode(suggestion.text)}
                                        disabled={isGenerating}
                                        className="w-full text-left p-3 text-sm text-[#d6d6d6] hover:text-white hover:bg-[#40434E]/30 rounded-xl transition-all duration-300 border border-transparent hover:border-[#F3C77E]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <span className="text-lg">{suggestion.emoji}</span>
                                        <span className="flex-1">{suggestion.text}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="p-4 space-y-4 max-h-full overflow-y-auto">
                            <div className="flex items-center gap-2 text-sm text-[#d6d6d6]">
                                <Star size={16} className="text-[#F3C77E]" />
                                Restaurant Templates
                            </div>
                            {RESTAURANT_TEMPLATES.map((category, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-[#F3C77E]">
                                        <span className="text-lg">{category.icon}</span>
                                        {category.category}
                                    </div>
                                    <div className="space-y-1">
                                        {category.templates.map((template, tIndex) => (
                                            <button
                                                key={tIndex}
                                                onClick={() => handleTemplateSelect(template)}
                                                className="w-full text-left p-2 text-xs text-[#d6d6d6] hover:text-white hover:bg-[#40434E]/20 rounded transition-colors"
                                            >
                                                {template}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'components' && (
                        <div className="p-4 space-y-4 max-h-full overflow-y-auto">
                            <div className="flex items-center gap-2 text-sm text-[#d6d6d6]">
                                <Code2 size={16} className="text-[#F3C77E]" />
                                Menu Components
                            </div>
                            <div className="space-y-2">
                                {MENU_COMPONENTS.map((component, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleComponentSelect(component)}
                                        className="w-full flex items-center gap-3 p-3 text-xs text-[#d6d6d6] hover:text-white hover:bg-[#40434E]/20 rounded transition-colors border border-[#40434E]/20"
                                    >
                                        <span className="text-lg">{component.icon}</span>
                                        <div>
                                            <div className="font-medium">{component.name}</div>
                                            <div className="text-[#666] truncate">{component.code}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Chat Area with Better Styling */}
                <div className="flex-1 flex flex-col bg-gradient-to-b from-[#0a0908]/50 to-[#000000]/50">
                    {/* Chat Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                        {chatMessages.map((message) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {message.type === 'ai' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F3C77E]/30">
                                        <ChefHat size={18} className="text-black" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                                    <motion.div
                                        whileHover={{ scale: 1.01 }}
                                        className={`p-4 rounded-2xl ${message.type === 'user'
                                            ? 'bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black shadow-lg'
                                            : 'bg-[#171613] text-white border border-[#40434E]/40 shadow-md'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        {message.code && (
                                            <div className="mt-3 relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs text-[#F3C77E] font-mono">{language.toUpperCase()}</span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => navigator.clipboard.writeText(message.code)}
                                                            className="p-1 text-[#a7a7a7] hover:text-white transition-colors"
                                                            title="Copy code"
                                                        >
                                                            <Copy size={12} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (onCodeGenerated && message.code) {
                                                                    onCodeGenerated(message.code);
                                                                    setSuccess('🎯 Code applied to your branding! Changes are now live.');
                                                                    setTimeout(() => setSuccess(''), 4000);
                                                                }
                                                            }}
                                                            className="p-2 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg hover:shadow-lg hover:shadow-[#F3C77E]/30 transition-all duration-200 hover:scale-105"
                                                            title="Apply code to your branding"
                                                        >
                                                            <Play size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <pre className="bg-[#0a0908] border border-[#40434E]/40 rounded p-3 text-xs text-[#d6d6d6] overflow-x-auto max-h-48">
                                                    <code>{message.code}</code>
                                                </pre>
                                            </div>
                                        )}
                                    </motion.div>
                                    <div className="text-xs text-[#666] mt-1.5 ml-1">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {message.type === 'user' && (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#40434E] to-[#2a2c35] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                        <span className="text-base">👤</span>
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-[#F3C77E] to-[#d6a856] rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#F3C77E]/30">
                                    <ChefHat size={18} className="text-black animate-pulse" />
                                </div>
                                <div className="bg-[#171613] text-white border border-[#40434E]/40 p-4 rounded-2xl shadow-md">
                                    <div className="flex items-center gap-3">
                                        <Loader2 size={18} className="animate-spin text-[#F3C77E]" />
                                        <span className="text-sm">Cooking up some code...</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Enhanced Input Area */}
                    <div className="p-5 border-t border-[#40434E]/40 bg-[#0a0908]/80 backdrop-blur-sm">
                        <div className="flex gap-3">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-4 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white text-sm focus:border-[#F3C77E]/60 focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/20 transition-all"
                            >
                                {LANGUAGE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.icon} {option.label}
                                    </option>
                                ))}
                            </select>

                            <div className="flex-1 relative">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe what you want to create for your restaurant menu..."
                                    className="w-full px-5 py-3 bg-[#171613] border border-[#40434E]/40 rounded-xl text-white placeholder-[#666] resize-none focus:border-[#F3C77E]/60 focus:outline-none focus:ring-2 focus:ring-[#F3C77E]/20 pr-14 transition-all"
                                    rows={2}
                                    disabled={isGenerating}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            generateCode();
                                        }
                                    }}
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => generateCode()}
                                    disabled={!prompt.trim() || isGenerating}
                                    className="absolute right-3 top-3 p-2.5 bg-gradient-to-r from-[#F3C77E] to-[#d6a856] text-black rounded-lg hover:shadow-lg hover:shadow-[#F3C77E]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Messages */}
            <AnimatePresence>
                {(error || success) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-3 mx-4 mb-4 rounded-lg flex items-center gap-2 ${error
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                            : 'bg-green-500/10 border border-green-500/30 text-green-400'
                            }`}
                    >
                        {error ? <AlertCircle size={16} /> : <Check size={16} />}
                        <span className="text-sm">{error || success}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
