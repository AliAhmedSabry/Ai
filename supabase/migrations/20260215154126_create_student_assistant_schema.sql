/*
  # AI Student Assistant Database Schema

  ## Overview
  Complete database schema for an AI-powered student assistant application that supports
  document management, flashcards, quizzes, and study session tracking.

  ## New Tables

  ### 1. documents
  Stores uploaded documents and their extracted content for AI processing
  - `id` (uuid, primary key) - Unique document identifier
  - `user_id` (uuid, foreign key) - References auth.users, owner of document
  - `title` (text) - Document title/name
  - `content` (text) - Extracted text content from document
  - `file_url` (text, nullable) - URL to original file if stored
  - `file_type` (text) - Type of document (pdf, txt, docx, etc.)
  - `created_at` (timestamptz) - When document was uploaded
  - `updated_at` (timestamptz) - Last modification time

  ### 2. flashcards
  Stores AI-generated flashcards from documents
  - `id` (uuid, primary key) - Unique flashcard identifier
  - `user_id` (uuid, foreign key) - References auth.users, owner of flashcard
  - `document_id` (uuid, foreign key, nullable) - Source document if generated from one
  - `question` (text) - Front of flashcard
  - `answer` (text) - Back of flashcard
  - `difficulty` (text) - easy, medium, hard
  - `mastery_level` (integer) - User's mastery (0-5), default 0
  - `last_reviewed` (timestamptz, nullable) - When last studied
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. quizzes
  Stores AI-generated quizzes with questions and answers
  - `id` (uuid, primary key) - Unique quiz identifier
  - `user_id` (uuid, foreign key) - References auth.users, owner of quiz
  - `document_id` (uuid, foreign key, nullable) - Source document if generated from one
  - `title` (text) - Quiz title
  - `questions` (jsonb) - Array of question objects with answers
  - `total_questions` (integer) - Number of questions in quiz
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. study_sessions
  Tracks user study sessions and progress
  - `id` (uuid, primary key) - Unique session identifier
  - `user_id` (uuid, foreign key) - References auth.users
  - `session_type` (text) - flashcard, quiz, chat
  - `content_id` (uuid, nullable) - ID of flashcard set, quiz, or document
  - `score` (integer, nullable) - Score if applicable
  - `duration_minutes` (integer) - How long the session lasted
  - `completed` (boolean) - Whether session was completed
  - `created_at` (timestamptz) - Session start time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Notes
  - All timestamps use timestamptz for timezone awareness
  - UUIDs used for all primary keys for security and scalability
  - Foreign keys ensure referential integrity
  - Indexes added for frequently queried fields
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  file_url text,
  file_type text NOT NULL DEFAULT 'text',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  question text NOT NULL,
  answer text NOT NULL,
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  mastery_level integer DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  last_reviewed timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  title text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_questions integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create study_sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text NOT NULL CHECK (session_type IN ('flashcard', 'quiz', 'chat')),
  content_id uuid,
  score integer,
  duration_minutes integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for flashcards table
CREATE POLICY "Users can view own flashcards"
  ON flashcards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flashcards"
  ON flashcards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON flashcards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON flashcards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for quizzes table
CREATE POLICY "Users can view own quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for study_sessions table
CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS flashcards_user_id_idx ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS flashcards_document_id_idx ON flashcards(document_id);
CREATE INDEX IF NOT EXISTS quizzes_user_id_idx ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS quizzes_document_id_idx ON quizzes(document_id);
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_created_at_idx ON study_sessions(created_at DESC);