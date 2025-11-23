import React from 'react';
import { User, ViewState } from '../types';
import { Button } from './ui/Button';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  currentView, 
  onNavigate,
  onLogout 
}) => {
  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">{children}</div>;

  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: ViewState.TIMER, label: 'Timer', icon: '⏱️' },
    { id: ViewState.CALENDAR, label: 'History', icon: '📅' },
    { id: ViewState.LEADERBOARD, label: 'Leaderboard', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Focus400</h1>
        <Button variant="ghost" onClick={onLogout} className="!p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </Button>
      </div>

      {/* Sidebar Navigation (Desktop) / Bottom Nav (Mobile) */}
      <aside className="fixed bottom-0 w-full md:relative md:w-64 md:h-screen bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 flex md:flex-col justify-between z-10">
        <div className="flex-1 overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-800">
             <div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-primary-200 font-bold overflow-hidden border border-primary-700">
               {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"/> : user.name[0]}
             </div>
             <div className="overflow-hidden">
               <h2 className="font-semibold text-white truncate">{user.name}</h2>
               <p className="text-xs text-slate-400">{(user.totalSeconds / 3600).toFixed(1)} hrs logged</p>
             </div>
          </div>

          <nav className="flex md:flex-col p-2 md:p-4 gap-1 md:gap-2 justify-around md:justify-start">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors w-full ${
                  currentView === item.id 
                    ? 'bg-primary-600/10 text-primary-400' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-xl md:text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="hidden md:block p-4 border-t border-slate-800">
           <Button variant="ghost" onClick={onLogout} className="w-full justify-start text-slate-400 hover:text-white">
             🚪 Logout
           </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};