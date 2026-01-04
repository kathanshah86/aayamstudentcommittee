import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthSectionProps {
  onSuccess: () => void;
}

const AuthSection = ({ onSuccess }: AuthSectionProps) => {
  const { signIn, signUp, user, signOut, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        toast.success('Account created! Please check your email to verify.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsSignUp(false);
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        toast.success('Logged in successfully!');
        onSuccess();
      }
    }

    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="animate-fade-in text-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // User is already logged in
  if (user) {
    return (
      <div className="animate-fade-in">
        <h2 className="text-center text-3xl font-black text-primary mb-8">My Account</h2>
        <div className="max-w-[400px] mx-auto">
          <div className="bg-card p-8 rounded-2xl shadow-xl text-center">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-lg font-medium mb-2">{user.email}</p>
            <p className="text-sm text-muted-foreground mb-6">You are logged in</p>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-center text-3xl font-black text-primary mb-8">
        {isSignUp ? 'Create Account' : 'Login'}
      </h2>
      <div className="max-w-[400px] mx-auto">
        <div className="bg-card p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-center mb-6">
            {isSignUp ? 'Sign up to join AAYAM' : 'Welcome Back'}
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="auth-email">Email</Label>
              <Input 
                id="auth-email" 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="auth-pass">Password</Label>
              <Input 
                id="auth-pass" 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                onKeyDown={(e) => e.key === 'Enter' && !isSignUp && handleSubmit()}
              />
            </div>
            {isSignUp && (
              <div>
                <Label htmlFor="auth-confirm">Confirm Password</Label>
                <Input 
                  id="auth-confirm" 
                  type="password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            )}
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
            </Button>
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp 
                  ? 'Already have an account? Login' 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSection;
