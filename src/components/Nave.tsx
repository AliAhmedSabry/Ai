import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext'; // Adjust path based on your folder structure

interface NavbarProps {
    onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
    const { user, signOut } = useAuth();

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-blue-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

                {/* Logo & Brand */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white"
                        onClick={() => onNavigate('dashboard')}
                        />
                    </div>
                    <button
                        className="text-xl font-bold text-gray-900 tracking-tight hover:opacity-80 transition-opacity"
                        onClick={() => onNavigate('home')}
                    >
                        AI Study <span className="text-blue-600">Assistant</span>
                    </button>
                </motion.div>

                {/* User Actions */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {user?.email && (
                        <span className="hidden sm:block text-sm font-medium text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                            {user.email}
                        </span>
                    )}

                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-semibold group"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform"/>
                        <span className="text-sm sm:text-base">Sign Out</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;