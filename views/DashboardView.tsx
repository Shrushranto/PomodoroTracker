import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { User, StudySession } from '../types';
import * as geminiService from '../services/geminiService';
import { getUserSessions } from '../services/mockBackend';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardViewProps {
  user: User;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ user }) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  useEffect(() => {
    const data = getUserSessions(user.id);
    setSessions(data);
  }, [user.id]);

  const totalHoursFloat = user.totalSeconds / 3600;
  // Calculate percentage, capped at 100% for the visual bar, but stats show real numbers
  const progressPercent = Math.min((totalHoursFloat / 400) * 100, 100);
  const isMaster = totalHoursFloat >= 400;

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Prepare chart data (Current Week: Sunday to Saturday)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Calculate the date for the Sunday of the current week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate the specific day for this iteration (Sunday + i)
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    
    const dayStart = d.setHours(0,0,0,0);
    const dayEnd = d.setHours(23,59,59,999);
    
    const daySeconds = sessions
      .filter(s => s.startTime >= dayStart && s.startTime <= dayEnd)
      .reduce((acc, curr) => acc + curr.durationSeconds, 0);

    return {
      day: new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short' }),
      hours: parseFloat((daySeconds / 3600).toFixed(1))
    };
  });

  const getAiInsight = async () => {
    setIsLoadingAi(true);
    const summary = await geminiService.getStudySummary(sessions);
    setAiSummary(summary);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Welcome back, {user.name} 👋
          {isMaster && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-bounce">
              🏆 400h Master
            </span>
          )}
        </h2>
      </div>

      {/* Progress Card */}
      <Card className={`bg-gradient-to-br border-primary-900/50 ${isMaster ? 'from-amber-900/30 to-slate-900 border-amber-500/30' : 'from-slate-800 to-slate-900'}`}>
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-slate-400 font-medium">400-Hour Challenge</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${isMaster ? 'text-amber-400' : 'text-white'}`}>
                {formatTotalTime(user.totalSeconds)}
              </span>
              <span className="text-slate-500">/ 400h Goal</span>
            </div>
          </div>
          <div className="text-right">
             <p className={`font-bold ${isMaster ? 'text-amber-400' : 'text-primary-400'}`}>
               {((totalHoursFloat / 400) * 100).toFixed(1)}%
             </p>
             <p className="text-xs text-slate-500">{isMaster ? 'Goal Exceeded!' : 'Completed'}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out relative ${isMaster ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : 'bg-gradient-to-r from-primary-600 to-indigo-500'}`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        {isMaster && <p className="text-xs text-amber-500 mt-2 text-center font-semibold">🌟 You have achieved mastery! Keep pushing boundaries!</p>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card title="This Week's Focus">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                <Tooltip 
                  cursor={{fill: '#334155', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.hours > 0 ? (isMaster ? '#f59e0b' : '#0ea5e9') : '#334155'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* AI Insight Card */}
        <Card title="AI Coach Insights" className="relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>
          </div>
          
          <div className="relative z-10 min-h-[200px] flex flex-col justify-between">
            {aiSummary ? (
              <div className="prose prose-invert">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                 <p className="text-slate-500 mb-4">Analyze your recent sessions to get personalized advice.</p>
                 <button 
                   onClick={getAiInsight} 
                   disabled={isLoadingAi}
                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                 >
                   {isLoadingAi ? 'Analyzing...' : 'Generate Report'}
                 </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};