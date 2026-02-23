import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, RotateCw, ChevronLeft, ChevronRight, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastery_level: number;
}

interface FlashcardsProps {
  onNavigate: (page: string) => void;
}

export default function Flashcards({ onNavigate }: FlashcardsProps) {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setFlashcards(data);
    }
    setLoading(false);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleMastery = async (correct: boolean) => {
    const card = flashcards[currentIndex];
    const newMasteryLevel = correct
      ? Math.min(card.mastery_level + 1, 5)
      : Math.max(card.mastery_level - 1, 0);

    await supabase
      .from('flashcards')
      .update({
        mastery_level: newMasteryLevel,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', card.id);

    const updatedCards = [...flashcards];
    updatedCards[currentIndex].mastery_level = newMasteryLevel;
    setFlashcards(updatedCards);

    handleNext();
  };

  const finishSession = async () => {
    const duration = Math.round((Date.now() - sessionStart) / 60000);

    await supabase.from('study_sessions').insert([{
      user_id: user!.id,
      session_type: 'flashcard',
      content_id: flashcards[currentIndex]?.id,
      completed: true,
      duration_minutes: duration,
    }]);

    onNavigate('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (flashcards.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Flashcards Yet</h2>
            <p className="text-gray-600 mb-6">
              Upload a document and generate flashcards to start studying!
            </p>
            <button
              onClick={() => onNavigate('documents')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Go to Documents
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Flashcards</h1>
          </div>
          <button
            onClick={finishSession}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Finish Session
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-gray-700">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Mastery:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < currentCard.mastery_level ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="perspective-1000 mb-8">
          <div
            onClick={handleFlip}
            className={`relative w-full h-96 cursor-pointer transition-transform duration-500 transform-style-3d ${
              flipped ? 'rotate-y-180' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute w-full h-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className={`mb-4 px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[currentCard.difficulty]}`}>
                {currentCard.difficulty}
              </div>
              <p className="text-2xl font-bold text-gray-900 text-center mb-4">
                {currentCard.question}
              </p>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <RotateCw className="w-4 h-4" />
                <span>Click to flip</span>
              </div>
            </div>

            <div
              className="absolute w-full h-full bg-blue-600 text-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center backface-hidden rotate-y-180"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <p className="text-xl text-center mb-8">
                {currentCard.answer}
              </p>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <RotateCw className="w-4 h-4" />
                <span>Click to flip back</span>
              </div>
            </div>
          </div>
        </div>

        {flipped && (
          <div className="mb-6 flex gap-4 justify-center">
            <button
              onClick={() => handleMastery(false)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <XCircle className="w-5 h-5" />
              Need Practice
            </button>
            <button
              onClick={() => handleMastery(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <CheckCircle className="w-5 h-5" />
              Got It!
            </button>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-md transition"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 shadow-md transition"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
