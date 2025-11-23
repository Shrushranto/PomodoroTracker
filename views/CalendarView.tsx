import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { getUserSessions } from '../services/mockBackend';
import { StudySession } from '../types';

interface CalendarViewProps {
  userId: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ userId }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  useEffect(() => {
    setSessions(getUserSessions(userId));
  }, [userId]);

  // Calendar Logic
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - startDay + 1;
    if (day <= 0 || day > daysInMonth) return null;
    return day;
  });

  const changeMonth = (delta: number) => {
    setSelectedDate(new Date(currentYear, currentMonth + delta, 1));
  };

  const getSessionsForDay = (day: number) => {
    const start = new Date(currentYear, currentMonth, day, 0, 0, 0).getTime();
    const end = new Date(currentYear, currentMonth, day, 23, 59, 59).getTime();
    return sessions.filter(s => s.startTime >= start && s.startTime <= end);
  };

  const selectedDaySessions = getSessionsForDay(selectedDate.getDate());
  
  // Calculate total duration for selected day
  const totalSecondsForDay = selectedDaySessions.reduce((acc, s) => acc + s.durationSeconds, 0);

  const formatTotalDuration = (seconds: number) => {
    if (seconds === 0) return "0 min";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    
    if (h === 0) {
      return `${m} min`;
    }
    return `${h}h ${m}m`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">←</button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300">→</button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-xs font-bold text-slate-500 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            if (!day) return <div key={idx} className="h-24 bg-slate-900/50 rounded-lg opacity-50"></div>;
            
            const daySessions = getSessionsForDay(day);
            const totalSeconds = daySessions.reduce((acc, s) => acc + s.durationSeconds, 0);
            const totalHours = totalSeconds / 3600;
            const hasActivity = totalSeconds > 0;
            const isSelected = selectedDate.getDate() === day;

            return (
              <div 
                key={idx}
                onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                className={`h-24 rounded-lg p-2 cursor-pointer transition-colors border flex flex-col justify-between
                  ${isSelected ? 'border-primary-500 bg-slate-800' : 'border-slate-800 bg-slate-900 hover:bg-slate-800'}
                `}
              >
                <span className={`text-sm font-medium ${isSelected ? 'text-primary-400' : 'text-slate-400'}`}>{day}</span>
                {hasActivity && (
                  <div className="mt-1">
                    <div className="text-xs font-bold text-white">
                        {totalHours < 1 ? Math.floor(totalSeconds / 60) + 'm' : totalHours.toFixed(1) + 'h'}
                    </div>
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {daySessions.slice(0, 4).map(s => (
                        <div key={s.id} className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Details Panel */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-lg font-semibold text-white">
          Activity for {selectedDate.toLocaleDateString()}
        </h3>
        
        {selectedDaySessions.length === 0 ? (
          <div className="text-slate-500 text-center py-8 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            No study sessions logged.
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {selectedDaySessions.map(session => (
              <Card key={session.id} className="!p-4 bg-slate-800/80 hover:bg-slate-800 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-primary-200">{session.subject}</h4>
                  <span className="text-xs font-mono text-slate-400">
                    {Math.max(1, Math.floor(session.durationSeconds / 60))} min
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                {session.notes && (
                  <p className="text-sm text-slate-300 bg-slate-900/50 p-2 rounded italic">"{session.notes}"</p>
                )}
              </Card>
            ))}
            <div className="text-right font-medium text-slate-300 pt-3 border-t border-slate-700">
               Total: {formatTotalDuration(totalSecondsForDay)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};