import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
    BookOpen, FileText, CreditCard, Brain,
    TrendingUp, LogOut, ArrowRight, LayoutDashboard
} from 'lucide-react';
import FloatingLetters from "./FloatingLetters.tsx";

interface Stats {
    totalDocuments: number;
    totalFlashcards: number;
    totalQuizzes: number;
    studySessions: number;
    averageScore: number;
}

interface DashboardProps {
    onNavigate: (page: string) => void;
}

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export default function Dashboard({ onNavigate }: DashboardProps) {
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalDocuments: 0,
        totalFlashcards: 0,
        totalQuizzes: 0,
        studySessions: 0,
        averageScore: 0,
    });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        if (!user || !supabase) return;
        try {
            const [documents, flashcards, quizzes, sessions] = await Promise.all([
                supabase.from('documents').select('id', { count: 'exact', head: true }),
                supabase.from('flashcards').select('id', { count: 'exact', head: true }),
                supabase.from('quizzes').select('id', { count: 'exact', head: true }),
                supabase.from('study_sessions').select('score, completed'),
            ]);

            const completedSessions = sessions.data?.filter(s => s.completed && s.score !== null) || [];
            const avgScore = completedSessions.length > 0
                ? completedSessions.reduce((acc, s) => acc + (s.score || 0), 0) / completedSessions.length
                : 0;

            setStats({
                totalDocuments: documents.count || 0,
                totalFlashcards: flashcards.count || 0,
                totalQuizzes: quizzes.count || 0,
                studySessions: sessions.data?.length || 0,
                averageScore: Math.round(avgScore),
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void loadStats();
    }, [loadStats]);

    const statCards = [
        { icon: FileText, label: 'Documents', value: stats.totalDocuments, color: 'from-blue-500 to-blue-600' },
        { icon: CreditCard, label: 'Flashcards', value: stats.totalFlashcards, color: 'from-green-500 to-green-600' },
        { icon: Brain, label: 'Quizzes', value: stats.totalQuizzes, color: 'from-purple-500 to-purple-600' },
        { icon: TrendingUp, label: 'Sessions', value: stats.studySessions, color: 'from-orange-500 to-orange-600' },
    ];

    const actions = [
        { label: 'Upload Document', icon: FileText, page: 'documents', color: 'from-blue-600 to-indigo-600', desc: 'Add new study material' },
        { label: 'Study Flashcards', icon: CreditCard, page: 'flashcards', color: 'from-green-600 to-teal-600', desc: 'Test your memory' },
        { label: 'Take Quiz', icon: Brain, page: 'quizzes', color: 'from-purple-600 to-pink-600', desc: 'Challenge yourself' },
        { label: 'Chat with AI', icon: BookOpen, page: 'chat', color: 'from-indigo-600 to-blue-700', desc: 'Ask anything about docs' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
            <FloatingLetters />

            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <BookOpen className="w-6 h-6 text-white"/>
                        </div>
                        <button
                            className="text-xl font-bold text-gray-900 tracking-tight"
                            onClick={() => onNavigate('home')}
                        >
                            AI Study <span className="text-blue-600">Assistant</span>
                        </button>
                    </motion.div>

                    <div className="flex items-center gap-6">
                        <span className="hidden sm:block text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {user?.email}
                        </span>
                        <button
                            onClick={signOut}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                        >
                            <LogOut className="w-4 h-4"/>
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                        Welcome back, <span className="text-blue-600">Scholar</span>!
                    </h2>
                    <p className="text-lg text-gray-600">Your learning engine is ready. What's the goal for today?</p>
                </motion.div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                            <LayoutDashboard className="w-12 h-12 text-blue-600 opacity-20" />
                        </motion.div>
                        <p className="mt-4 text-gray-500 font-medium">Synchronizing your progress...</p>
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {statCards.map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-2xl shadow-sm border border-blue-50 p-6 flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-3 shadow-lg shadow-blue-200`}>
                                            <stat.icon className="w-6 h-6 text-white"/>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
                                        <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Performance & Quick Actions Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Performance Chart */}
                            <motion.div
                                variants={itemVariants}
                                className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-blue-50 p-8 flex flex-col justify-center"
                            >
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600"/> Performance
                                </h3>
                                <div className="text-center">
                                    <div className="relative inline-flex items-center justify-center mb-4">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                            <motion.circle
                                                cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                strokeDasharray={364.4}
                                                initial={{ strokeDashoffset: 364.4 }}
                                                animate={{ strokeDashoffset: 364.4 - (364.4 * stats.averageScore) / 100 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className="text-blue-600"
                                            />
                                        </svg>
                                        <span className="absolute text-3xl font-black text-gray-900">{stats.averageScore}%</span>
                                    </div>
                                    <p className="text-gray-600 font-medium">Average Mastery</p>
                                    <p className="text-xs text-gray-400 mt-1">Based on {stats.studySessions} sessions</p>
                                </div>
                            </motion.div>

                            {/* Quick Actions */}
                            <div className="lg:col-span-2">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Launch Pad</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {actions.map((action, index) => (
                                        <motion.button
                                            key={index}
                                            variants={itemVariants}
                                            onClick={() => onNavigate(action.page)}
                                            className={`relative group overflow-hidden bg-gradient-to-br ${action.color} p-6 rounded-2xl text-left transition-all shadow-lg hover:shadow-2xl`}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="relative z-10 flex flex-col h-full justify-between">
                                                <action.icon className="w-10 h-10 text-white/90 mb-4" />
                                                <div>
                                                    <h4 className="text-xl font-bold text-white mb-1">{action.label}</h4>
                                                    <p className="text-blue-100 text-sm opacity-80">{action.desc}</p>
                                                </div>
                                            </div>
                                            {/* Decorative Arrow */}
                                            <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-white/20 group-hover:text-white/100 transition-all transform group-hover:translate-x-2" />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}