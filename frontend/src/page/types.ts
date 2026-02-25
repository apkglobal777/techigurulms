// src/components/dashboard/types.ts

export interface ResourceItem {
  id?: string | number; // Optional because new items won't have DB IDs yet
  title: string;
  url: string;
}

export interface CodeSnippetItem {
  id?: string | number;
  language: string;
  code: string;
}

export interface QuizOption {
  id?: string | number;
  text: string;
  isCorrect: boolean;
}

export interface QuizItem {
  id?: string | number;
  question: string;
  options: QuizOption[];
}

export interface VideoItem {
  id: string | number;
  title: string;
  videoKey: string;
  duration: string; // Frontend uses "MM:SS"
  isFree: boolean;
  description: string;
  resources: ResourceItem[];
  codeSnippets: CodeSnippetItem[];
  quizzes: QuizItem[];
}

export interface TopicItem {
  id: string | number;
  title: string;
  videos: VideoItem[];
}

export interface CourseData {
  id?: string;
  _id?: string; // MongoDB ID
  title: string;
  description: string;
  price: string;
  category: string;
  status: 'Active' | 'Inactive' | 'Draft';
  thumbnail: string | null | { url: string }; // Handle both string and object
  topics: TopicItem[];
  studentsEnrolled?: number;
}

export interface CertificateData {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  genre: string;
  link: string;
  status: 'Active' | 'Inactive' | 'Draft';
  thumbnail: string | null;
}