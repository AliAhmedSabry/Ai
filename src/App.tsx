import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './components/Login';
import Signup from './components/Signup';

import Home from './Pages/Home';
import Dashboard from './components/Dashboard';
import Documents from './components/Documents';
import Chat from './components/Chat';
import Flashcards from './components/Flashcards';
import Quizzes from './components/Quizzes';
import About from "./Pages/About.tsx";
import StudyTimeline from './Pages/StudyTimeline';

export type Page =
    | 'home'
    | 'dashboard'
    | 'documents'
    | 'chat'
    | 'flashcards'
    | 'quizzes'
    | 'about'
    | 'studyTimeline'
    ;

function AppContent() {
    const { user, loading } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>();

    const handleNavigate = (page: string, documentId?: string) => {
        setCurrentPage(page as Page);
        setSelectedDocumentId(documentId);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return isLogin ? (
            <Login onToggleMode={() => setIsLogin(false)} />
        ) : (
            <Signup onToggleMode={() => setIsLogin(true)} />
        );
    }

    switch (currentPage) {
        case 'home':
            return <Home onNavigate={handleNavigate} />;
        case 'studyTimeline':
            return <StudyTimeline onNavigate={handleNavigate} />;
        case 'about':
            return <About onNavigate={handleNavigate}/>;

        case 'documents':
            return <Documents onNavigate={handleNavigate} />;

        case 'chat':
            return <Chat onNavigate={handleNavigate} documentId={selectedDocumentId} />;

        case 'flashcards':
            return <Flashcards onNavigate={handleNavigate} />;

        case 'quizzes':
            return <Quizzes onNavigate={handleNavigate} />;

        default:
            return <Dashboard onNavigate={handleNavigate} />;
    }
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
