export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalSeconds: number; // Total study time in seconds
}

export interface StudySession {
  id: string;
  userId: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  durationSeconds: number;
  subject: string;
  notes: string;
}

export interface Quote {
  text: string;
  author: string;
}

export enum ViewState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  TIMER = 'TIMER',
  CALENDAR = 'CALENDAR',
  LEADERBOARD = 'LEADERBOARD',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}