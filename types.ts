export enum AppState {
  SETUP = 'SETUP',
  INTERVIEW = 'INTERVIEW',
  REPORT = 'REPORT'
}

export interface JobConfig {
  role: string;
  level: string;
  description: string;
  topics: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface EvaluationMetric {
  category: string;
  score: number; // 0-100
  feedback: string;
}

export interface FinalReport {
  summary: string;
  hireRecommendation: 'Strong Hire' | 'Hire' | 'Weak Hire' | 'No Hire';
  metrics: EvaluationMetric[];
  strengths: string[];
  weaknesses: string[];
}

// Chart data types
export interface RadarDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}
