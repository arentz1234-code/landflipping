'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, Play } from 'lucide-react';
import { enableDemoMode } from '@/lib/demo-data';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleDemoLogin = () => {
    setDemoLoading(true);
    enableDemoMode();
    toast.success('Welcome to Demo Mode!');
    router.push('/');
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Check if this is the first user (make them admin)
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true });

          const isFirstUser = count === 0;

          // Check if there's a pending invitation for this email
          let assignedRole: 'admin' | 'member' | 'viewer' = 'member';

          if (isFirstUser) {
            assignedRole = 'admin';
          } else {
            const { data: invitation } = await supabase
              .from('invitations')
              .select('role')
              .eq('email', email.toLowerCase())
              .single();

            if (invitation) {
              assignedRole = invitation.role;
              // Delete the invitation after use
              await supabase.from('invitations').delete().eq('email', email.toLowerCase());
            }
          }

          // Create team member profile
          const { error: profileError } = await supabase
            .from('team_members')
            .insert({
              id: data.user.id,
              full_name: fullName,
              email: email,
              role: assignedRole,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
          }

          toast.success('Account created! Please check your email to verify.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Welcome back!');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Land Flipping CRM</h1>
          <p className="text-gray-500 mt-2">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <Button type="submit" loading={loading} className="w-full">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleDemoLogin}
              loading={demoLoading}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-2" />
              Try Demo Mode
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              No account needed - explore with sample data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
