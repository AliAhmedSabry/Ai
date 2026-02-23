import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader, BookOpen } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Use a local path or a version-synced CDN for the worker
// Using jsDelivr (Highly recommended for v5+)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface Document {
    id: string;
    title: string;
    content: string;
}

interface ChatProps {
    onNavigate: (page: string) => void;
    documentId?: string;
}

export default function Chat({ onNavigate, documentId }: ChatProps) {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Wrapped in useCallback to fix ESLint dependency issues
    const loadDocuments = useCallback(async () => {
        if (!user || !supabase) return;

        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading documents:', error.message);
            return;
        }

        if (data) {
            setDocuments(data as Document[]);
        }
    }, [user]);

    // 2. Used 'void' to acknowledge the floating promise
    useEffect(() => {
        void loadDocuments();
    }, [loadDocuments]);

    useEffect(() => {
        if (documentId && documents.length > 0) {
            const doc = documents.find(d => d.id === documentId);
            if (doc) {
                setSelectedDoc(doc);
                setMessages([{
                    role: 'assistant',
                    content: `Hi! I'm ready to help you learn about "${doc.title}". What would you like to know?`
                }]);
            }
        }
    }, [documentId, documents]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleDocumentSelect = (doc: Document) => {
        setSelectedDoc(doc);
        setMessages([{
            role: 'assistant',
            content: `Hi! I'm ready to help you learn about "${doc.title}". What would you like to know?`
        }]);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        // 3. Added null check for supabase to satisfy TS18047
        if (!input.trim() || !selectedDoc || loading || !supabase || !user) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const sbUrl = import.meta.env.VITE_SUPABASE_URL;
            const sbKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (!sbUrl || !sbKey) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Configuration error: Supabase URL or Key is missing.'
                }]);
                return;
            }

            const response = await fetch(
                `${sbUrl}/functions/v1/chat-with-document`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${sbKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: userMessage.content,
                        documentContent: selectedDoc.content,
                        conversationHistory: messages.slice(-6),
                    }),
                }
            );

            if (!response.ok) {
                // 4. Handle error without throwing locally
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `Service error: ${response.statusText}`
                }]);
                return;
            }

            const data = await response.json();

            if (data.error) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.error }]);
                return;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response from AI' }]);

            // 5. Added ! non-null assertion or check for user.id
            await supabase.from('study_sessions').insert([{
                user_id: user.id,
                session_type: 'chat',
                content_id: selectedDoc.id,
                completed: true,
                duration_minutes: 1,
            }]);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`
            }]);
        } finally {
            setLoading(false);
        }
    };

    // ... Render logic remains the same ...
    if (!selectedDoc) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <nav className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                        <button
                            onClick={() => onNavigate('dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Chat with AI</h1>
                    </div>
                </nav>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Document</h2>

                        {documents.length === 0 ? (
                            <div className="text-center py-8">
                                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">No documents available. Upload a document first!</p>
                                <button
                                    onClick={() => onNavigate('documents')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Go to Documents
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => handleDocumentSelect(doc)}
                                        className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                                    >
                                        <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {doc.content.substring(0, 100)}...
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">{selectedDoc.title}</h1>
                        <p className="text-sm text-gray-600">Chat with AI about this document</p>
                    </div>
                </div>
            </nav>

            <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col">
                <div className="flex-1 bg-white rounded-xl shadow-md p-6 mb-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                                        message.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                    }`}
                                >
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-xl px-4 py-3">
                                    <Loader className="w-5 h-5 animate-spin text-gray-600" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question about this document..."
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}