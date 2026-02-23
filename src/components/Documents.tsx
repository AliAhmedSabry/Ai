import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { parseFile } from '../lib/fileParser';
import { ArrowLeft, Upload, FileText, Trash2, MessageSquare, CreditCard, Brain, Loader } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  file_type: string;
  created_at: string;
}

interface DocumentsProps {
  onNavigate: (page: string, documentId?: string) => void;
}

export default function Documents({ onNavigate }: DocumentsProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState<{ type: string; id: string } | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    if (!user) return;
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const { content } = await parseFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setContent(content);
    } catch (error) {
      console.error('File parsing error:', error);
      alert(error instanceof Error ? error.message : 'Error reading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      alert('You must be logged in to upload documents');
      return;
    }

    if (!title || !content) {
      alert('Please provide both a title and content for your document');
      return;
    }

    setUploading(true);

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured. Please check your environment variables.');
      }

      const { data, error } = await supabase
          .from('documents')
          .insert([
            {
              user_id: user.id,
              title,
              content,
              file_type: 'text',
            },
          ])
          .select()
          .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Failed to upload document to database');
      }

      setDocuments([data, ...documents]);
      setTitle('');
      setContent('');
      alert('Document uploaded successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Document upload error:', error);
      alert(`Error uploading document: ${errorMessage}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    if (!supabase) {
      alert('Supabase is not configured');
      return;
    }

    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (!error) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const generateFlashcards = async (doc: Document) => {
    setGenerating({ type: 'flashcards', id: doc.id });

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flashcards`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentContent: doc.content,
              documentTitle: doc.title,
              count: 10,
            }),
          }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.flashcards || !Array.isArray(data.flashcards)) {
        throw new Error('Invalid response format');
      }

      if (data.flashcards.length === 0) {
        throw new Error('No flashcards generated');
      }

      const flashcardsToInsert = data.flashcards.map((fc: { question: string; answer: string; difficulty: string }) => ({
        user_id: user!.id,
        document_id: doc.id,
        question: fc.question,
        answer: fc.answer,
        difficulty: fc.difficulty,
      }));

      if (!supabase) {
        throw new Error('Supabase is not configured');
      }

      await supabase.from('flashcards').insert(flashcardsToInsert);
      alert(`Generated ${data.flashcards.length} flashcards! Go to Flashcards to study them.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error generating flashcards: ${errorMessage}`);
    } finally {
      setGenerating(null);
    }
  };

  const generateQuiz = async (doc: Document) => {
    setGenerating({ type: 'quiz', id: doc.id });

    try {
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing');
      }

      const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentContent: doc.content,
              documentTitle: doc.title,
              questionCount: 5,
            }),
          }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid response format');
      }

      if (data.questions.length === 0) {
        throw new Error('No quiz questions generated');
      }

      if (!supabase) {
        throw new Error('Supabase is not configured');
      }

      await supabase.from('quizzes').insert([{
        user_id: user!.id,
        document_id: doc.id,
        title: data.title || 'Untitled Quiz',
        questions: data.questions,
        total_questions: data.questions.length,
      }]);

      alert('Quiz generated! Go to Quizzes to take it.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error generating quiz: ${errorMessage}`);
    } finally {
      setGenerating(null);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload New Document</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Choose File
                    <input
                        type="file"
                        accept=".pdf,.txt,.md,.doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                  </label>
                  <span className="text-sm text-gray-600">
                  Supported: PDF, TXT, MD, DOC, DOCX
                </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Content
                </label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste or type your study material here..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                  onClick={handleSubmit}
                  disabled={uploading || !title || !content}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Documents</h2>

            {loading ? (
                <div className="text-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                </div>
            ) : documents.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents yet. Upload your first document to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                  {documents.map((doc) => (
                      <div key={doc.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{doc.title}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(doc.created_at).toLocaleDateString()} • {doc.content.length} characters
                            </p>
                          </div>
                          <button
                              onClick={() => handleDelete(doc.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                              onClick={() => onNavigate('chat', doc.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Chat with AI
                          </button>

                          <button
                              onClick={() => generateFlashcards(doc)}
                              disabled={generating?.id === doc.id && generating?.type === 'flashcards'}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm disabled:opacity-50"
                          >
                            {generating?.id === doc.id && generating?.type === 'flashcards' ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <CreditCard className="w-4 h-4" />
                            )}
                            Generate Flashcards
                          </button>

                          <button
                              onClick={() => generateQuiz(doc)}
                              disabled={generating?.id === doc.id && generating?.type === 'quiz'}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50"
                          >
                            {generating?.id === doc.id && generating?.type === 'quiz' ? (
                                <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                                <Brain className="w-4 h-4" />
                            )}
                            Generate Quiz
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
