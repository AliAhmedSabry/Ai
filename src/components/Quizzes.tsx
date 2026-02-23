import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { QuizQuestion } from '../lib/supabase';
import { ArrowLeft, Brain, CheckCircle, XCircle, Award } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
  total_questions: number;
}

interface QuizzesProps {
  onNavigate: (page: string) => void;
}

export default function Quizzes({ onNavigate }: QuizzesProps) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionStart] = useState(Date.now());

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setFinished(false);
  };

  const handleAnswer = () => {
    if (selectedAnswer === null || !selectedQuiz) return;

    const isCorrect = selectedAnswer === selectedQuiz.questions[currentQuestion].correct_answer;
    setAnswers([...answers, isCorrect]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (!selectedQuiz) return;

    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!selectedQuiz) return;

    const score = Math.round((answers.filter(a => a).length / answers.length) * 100);
    const duration = Math.round((Date.now() - sessionStart) / 60000);

    await supabase.from('study_sessions').insert([{
      user_id: user!.id,
      session_type: 'quiz',
      content_id: selectedQuiz.id,
      score,
      completed: true,
      duration_minutes: duration,
    }]);

    setFinished(true);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { text: 'Outstanding!', color: 'text-green-600' };
    if (score >= 70) return { text: 'Great job!', color: 'text-blue-600' };
    if (score >= 50) return { text: 'Good effort!', color: 'text-yellow-600' };
    return { text: 'Keep studying!', color: 'text-orange-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (quizzes.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quizzes Yet</h2>
            <p className="text-gray-600 mb-6">
              Upload a document and generate quizzes to test your knowledge!
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

  if (finished && selectedQuiz) {
    const score = Math.round((answers.filter(a => a).length / answers.length) * 100);
    const scoreMessage = getScoreMessage(score);

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
            <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Award className={`w-20 h-20 mx-auto mb-6 ${scoreMessage.color}`} />
            <h2 className={`text-4xl font-bold mb-2 ${scoreMessage.color}`}>{scoreMessage.text}</h2>
            <p className="text-6xl font-bold text-gray-900 mb-6">{score}%</p>
            <p className="text-gray-600 mb-8">
              You answered {answers.filter(a => a).length} out of {answers.length} questions correctly
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => startQuiz(selectedQuiz)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => {
                  setSelectedQuiz(null);
                  setFinished(false);
                }}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h1>
            </div>
            <div className="text-gray-600">
              Question {currentQuestion + 1} of {selectedQuiz.questions.length}
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / selectedQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{question.question}</h2>
            </div>

            <div className="space-y-3 mb-8">
              {question.options.map((option, index) => {
                let buttonClass = 'w-full text-left p-4 border-2 rounded-lg transition ';

                if (showResult) {
                  if (index === question.correct_answer) {
                    buttonClass += 'border-green-500 bg-green-50';
                  } else if (index === selectedAnswer) {
                    buttonClass += 'border-red-500 bg-red-50';
                  } else {
                    buttonClass += 'border-gray-200 bg-gray-50';
                  }
                } else {
                  buttonClass += index === selectedAnswer
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50';
                }

                return (
                  <button
                    key={index}
                    onClick={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option}</span>
                      {showResult && index === question.correct_answer && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                      {showResult && index === selectedAnswer && index !== question.correct_answer && (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {showResult && question.explanation && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                <p className="text-sm text-blue-800">{question.explanation}</p>
              </div>
            )}

            <div className="flex justify-end">
              {!showResult ? (
                <button
                  onClick={handleAnswer}
                  disabled={selectedAnswer === null}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {currentQuestion < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Quizzes</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
              <p className="text-gray-600 mb-4">{quiz.total_questions} questions</p>
              <button
                onClick={() => startQuiz(quiz)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
