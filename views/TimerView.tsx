import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import * as geminiService from '../services/geminiService';

interface TimerViewProps {
  seconds: number;
  isActive: boolean;
  subject: string;
  notes: string;
  onToggle: () => void;
  onStop: () => Promise<void>;
  onSubjectChange: (val: string) => void;
  onNotesChange: (val: string) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({ 
  seconds, 
  isActive, 
  subject, 
  notes, 
  onToggle, 
  onStop, 
  onSubjectChange, 
  onNotesChange 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);

  // Format helper: HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStopClick = async () => {
    setIsSaving(true);
    try {
      await onStop();
      setQuote(null); // Clear quote on save
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const fetchMotivation = async () => {
    const q = await geminiService.getMotivationalQuote(seconds / 3600);
    setQuote(q);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <Card className="text-center py-12 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className="relative z-10">
          <div className="text-7xl md:text-8xl font-mono font-bold text-white mb-8 tracking-wider">
            {formatTime(seconds)}
          </div>
          
          <div className="flex justify-center gap-4 mb-8">
            <Button 
              onClick={onToggle} 
              variant={isActive ? 'secondary' : 'primary'}
              className="w-32 h-12 text-lg"
            >
              {isActive ? 'Pause' : 'Start'}
            </Button>
            {(seconds > 0 || isActive) && (
              <Button 
                onClick={handleStopClick} 
                variant="danger"
                className="w-32 h-12 text-lg"
                isLoading={isSaving}
              >
                Finish
              </Button>
            )}
          </div>

          {!isActive && seconds === 0 && (
             <p className="text-slate-400">Ready to focus? Start the timer.</p>
          )}

          {isActive && (
             <div className="text-primary-300 animate-pulse">Focus Mode Active</div>
          )}
        </div>
      </Card>

      <Card title="Session Details">
        <div className="space-y-4">
          <Input 
            label="Subject / Topic" 
            placeholder="e.g. Linear Algebra, React Hooks..."
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
          />
          <div className="flex flex-col gap-1">
             <label className="text-sm font-medium text-slate-300">Notes (Optional)</label>
             <textarea 
               className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors h-24 resize-none"
               placeholder="Briefly describe what you accomplished..."
               value={notes}
               onChange={(e) => onNotesChange(e.target.value)}
             />
          </div>
        </div>
      </Card>

      {/* AI Motivation Section */}
      <div className="flex justify-center">
        {!quote ? (
          <Button variant="ghost" onClick={fetchMotivation} className="text-sm">
            ✨ Get AI Motivation
          </Button>
        ) : (
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-lg text-center max-w-lg">
            <p className="italic text-indigo-200">"{quote}"</p>
          </div>
        )}
      </div>
    </div>
  );
};