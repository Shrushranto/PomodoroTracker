import { User, StudySession } from '../types';

// Constants for LocalStorage keys
const USERS_KEY = 'focus400_users';
const SESSIONS_KEY = 'focus400_sessions';
const CURRENT_USER_KEY = 'focus400_currentUser';

// Mock Initial Data - Empty as requested
const MOCK_USERS: User[] = [];

// --- Helpers ---

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  return JSON.parse(stored);
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getStoredSessions = (): StudySession[] => {
  const stored = localStorage.getItem(SESSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSessions = (sessions: StudySession[]) => {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
};

// --- API Methods ---

export const login = async (email: string, username: string): Promise<User> => {
  // Simulating network delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const users = getStoredUsers();
  let user = users.find(u => u.email === email);
  
  if (!user) {
    // Create new user with provided username
    user = {
      id: `u_${Date.now()}`,
      name: username || email.split('@')[0], // Fallback if empty, though UI enforces it
      email,
      avatar: `https://picsum.photos/seed/${email}/200`,
      totalSeconds: 0
    };
    users.push(user);
    saveUsers(users);
  }
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveSession = async (session: StudySession): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const sessions = getStoredSessions();
  sessions.push(session);
  saveSessions(sessions);

  // Update User Total
  const users = getStoredUsers();
  const userIndex = users.findIndex(u => u.id === session.userId);
  if (userIndex !== -1) {
    users[userIndex].totalSeconds += session.durationSeconds;
    saveUsers(users);
    
    // Update local current user state if matched
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === session.userId) {
      currentUser.totalSeconds = users[userIndex].totalSeconds;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  }
};

export const getUserSessions = (userId: string): StudySession[] => {
  const sessions = getStoredSessions();
  return sessions.filter(s => s.userId === userId).sort((a, b) => b.startTime - a.startTime);
};

export const getLeaderboard = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const users = getStoredUsers();
  // Sort by total seconds descending
  return users.sort((a, b) => b.totalSeconds - a.totalSeconds);
};