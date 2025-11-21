'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Login page
 * Task 05: Build login page UI and flow
 */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg p-4">
      <Card className="w-full max-w-md border-terminal-border bg-terminal-bg-soft">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-terminal-green">Login</CardTitle>
          <CardDescription className="text-terminal-text-dim">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-terminal-green">
                Email / Username
              </label>
              <Input
                id="email"
                type="text"
                placeholder="user@example.com or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-terminal-bg border-terminal-border text-terminal-text focus:border-terminal-green"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-terminal-green">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-terminal-bg border-terminal-border text-terminal-text focus:border-terminal-green"
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-500">
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-terminal-green text-terminal-bg hover:bg-terminal-green-dim"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

