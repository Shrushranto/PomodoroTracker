import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { TimerView } from './views/TimerView';
import { CalendarView } from './views/CalendarView';
import { LeaderboardView } from './views/LeaderboardView';
import { User, ViewState, StudySession } from './types';
import * as backend from './services/mockBackend';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.AUTH);

  // --- Lifted Timer State ---
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [timerAccumulated, setTimerAccumulated] = useState(0); // in ms
  const [timerSubject, setTimerSubject] = useState('');
  const [timerNotes, setTimerNotes] = useState('');

  // Initialize Auth Check
  useEffect(() => {
    const storedUser = backend.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setView(ViewState.DASHBOARD);
    }
  }, []);

  // Timer Tick Logic
  useEffect(() => {
    let interval: number;
    if (timerActive) {
      // Ensure we have a start time if active (handling race conditions or strict mode double invokes)
      if (!timerStartTime) setTimerStartTime(Date.now());

      interval = window.setInterval(() => {
        const now = Date.now();
        // Calculate elapsed time: Accumulated previous time + (Current Time - Start Time)
        const currentSegment = timerStartTime ? now - timerStartTime : 0;
        const totalMs = timerAccumulated + currentSegment;
        setTimerSeconds(Math.floor(totalMs / 1000));
      }, 1000);
    } else {
      // When paused, display the static accumulated time
      setTimerSeconds(Math.floor(timerAccumulated / 1000));
    }
    return () => clearInterval(interval);
  }, [timerActive, timerStartTime, timerAccumulated]);

  const handleLogin = async (email: string, username: string) => {
    const loggedInUser = await backend.login(email, username);
    setUser(loggedInUser);
    setView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
    setView(ViewState.AUTH);
  };

  // Timer Handlers
  const handleTimerToggle = () => {
    if (timerActive) {
      // Pause
      const now = Date.now();
      const delta = timerStartTime ? now - timerStartTime : 0;
      setTimerAccumulated(prev => prev + delta);
      setTimerStartTime(null);
      setTimerActive(false);
    } else {
      // Start
      setTimerStartTime(Date.now());
      setTimerActive(true);
    }
  };

  const handleTimerStop = async () => {
    if (!user) return;
    
    // Pause internally to calculate final precise time
    let finalSeconds = timerSeconds;
    if (timerActive && timerStartTime) {
      const now = Date.now();
      const delta = now - timerStartTime;
      finalSeconds = Math.floor((timerAccumulated + delta) / 1000);
    }

    if (finalSeconds < 60) {
      alert("Session too short to save (minimum 1 minute).");
      resetTimerState();
      return;
    }

    if (!timerSubject) {
      alert("Please enter a subject.");
      return;
    }

    const newSession: StudySession = {
      id: `sess_${Date.now()}`,
      userId: user.id,
      startTime: Date.now() - (finalSeconds * 1000),
      endTime: Date.now(),
      durationSeconds: finalSeconds,
      subject: timerSubject,
      notes: timerNotes
    };

    await backend.saveSession(newSession);
    
    // Refresh user stats
    const updatedUser = backend.getCurrentUser();
    if (updatedUser) setUser(updatedUser);

    resetTimerState();
  };

  const resetTimerState = () => {
    setTimerActive(false);
    setTimerSeconds(0);
    setTimerAccumulated(0);
    setTimerStartTime(null);
    setTimerSubject('');
    setTimerNotes('');
  };

  const renderView = () => {
    if (!user) return <AuthView onLogin={handleLogin} />;

    switch (view) {
      case ViewState.DASHBOARD:
        return <DashboardView user={user} />;
      case ViewState.TIMER:
        return (
          <TimerView 
            seconds={timerSeconds}
            isActive={timerActive}
            subject={timerSubject}
            notes={timerNotes}
            onToggle={handleTimerToggle}
            onStop={handleTimerStop}
            onSubjectChange={setTimerSubject}
            onNotesChange={setTimerNotes}
          />
        );
      case ViewState.CALENDAR:
        return <CalendarView userId={user.id} />;
      case ViewState.LEADERBOARD:
        return <LeaderboardView currentUserId={user.id} />;
      default:
        return <DashboardView user={user} />;
    }
  };

  return (
    <Layout 
      user={user} 
      currentView={view} 
      onNavigate={setView}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;