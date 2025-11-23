import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { User } from '../types';
import { getLeaderboard } from '../services/mockBackend';

interface LeaderboardViewProps {
  currentUserId: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getLeaderboard();
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Top Scholars 🏆</h2>
        <p className="text-slate-400">Race to 400 Hours</p>
      </div>

      <Card className="overflow-hidden !p-0">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading rankings...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No users yet. Be the first to join the challenge!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {users.map((user, index) => {
              const formattedTime = formatTotalTime(user.totalSeconds);
              const totalHours = user.totalSeconds / 3600;
              const progress = Math.min((totalHours / 400) * 100, 100);
              const isCurrentUser = user.id === currentUserId;
              const isMaster = totalHours >= 400;
              
              let rankBadge = null;
              if (index === 0) rankBadge = '🥇';
              if (index === 1) rankBadge = '🥈';
              if (index === 2) rankBadge = '🥉';

              return (
                <div 
                  key={user.id} 
                  className={`p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors ${isCurrentUser ? 'bg-primary-900/10' : ''}`}
                >
                  <div className="w-8 text-center font-bold text-slate-500">
                    {rankBadge || `#${index + 1}`}
                  </div>
                  
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className={`w-12 h-12 rounded-full object-cover border-2 ${isMaster ? 'border-amber-500' : 'border-slate-700'}`}
                    />
                    {isCurrentUser && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${isCurrentUser ? 'text-primary-300' : 'text-white'}`}>
                          {user.name} {isCurrentUser && '(You)'}
                        </span>
                        {isMaster && (
                          <span title="400 Hour Club" className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/50">
                            🏆 400h Club
                          </span>
                        )}
                      </div>
                      <span className={`font-mono font-bold ${isMaster ? 'text-amber-400' : 'text-white'}`}>
                        {formattedTime}
                      </span>
                    </div>
                    
                    {/* Mini Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isMaster ? 'bg-amber-500' : (index === 0 ? 'bg-yellow-500' : 'bg-primary-600')}`} 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      
      <div className="text-center text-xs text-slate-500 mt-4">
        Rankings update automatically after every session.
      </div>
    </div>
  );
};