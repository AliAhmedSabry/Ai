import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check for missing environment variables and warn instead of crashing
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('⚠️  Missing Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)');
  console.warn('⚠️  Please create a .env file with your Supabase credentials');
  console.warn('⚠️  The app will load but Supabase features will not work');
}

// Create client with session persistence - detect if we're in browser environment
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type Database = {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          file_url: string | null;
          file_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          file_url?: string | null;
          file_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          file_url?: string | null;
          file_type?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          question: string;
          answer: string;
          difficulty: 'easy' | 'medium' | 'hard';
          mastery_level: number;
          last_reviewed: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          question: string;
          answer: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          mastery_level?: number;
          last_reviewed?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          question?: string;
          answer?: string;
          difficulty?: 'easy' | 'medium' | 'hard';
          mastery_level?: number;
          last_reviewed?: string | null;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          title: string;
          questions: QuizQuestion[];
          total_questions: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          title: string;
          questions?: QuizQuestion[];
          total_questions?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          title?: string;
          questions?: QuizQuestion[];
          total_questions?: number;
          created_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: 'flashcard' | 'quiz' | 'chat';
          content_id: string | null;
          score: number | null;
          duration_minutes: number;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type: 'flashcard' | 'quiz' | 'chat';
          content_id?: string | null;
          score?: number | null;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: 'flashcard' | 'quiz' | 'chat';
          content_id?: string | null;
          score?: number | null;
          duration_minutes?: number;
          completed?: boolean;
          created_at?: string;
        };
      };
    };
  };
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
};
