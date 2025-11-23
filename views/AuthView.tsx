import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface AuthViewProps {
  onLogin: (email: string, username: string) => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !username) return;
    
    setIsLoading(true);
    try {
      await onLogin(email, username);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent mb-2">Focus400</h1>
        <p className="text-slate-400">Join the 400-Hour Study Challenge</p>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input 
            label="Username" 
            type="text" 
            placeholder="Scholar123" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Start Studying
          </Button>
        </form>
      </Card>
      
      <div className="mt-8 text-center text-sm text-slate-500">
         <div>
            <span className="block font-bold text-white text-lg">400h</span>
            Goal to Mastery
         </div>
      </div>
    </div>
  );
};