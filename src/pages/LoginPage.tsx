import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, TrendingUp, Shield, Zap, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Portfolio Analytics',
    description: 'Real-time insights into your fixed deposit portfolio',
  },
  {
    icon: Shield,
    title: 'Institutional Security',
    description: 'Bank-grade security with audit trails and compliance',
  },
  {
    icon: Zap,
    title: 'AI-Powered Intelligence',
    description: 'Smart recommendations and automated workflows',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Guest guard - redirect to dashboard if already logged in
  // NOTE: useEffect navigation avoids early-return during render which can
  // cause "Rendered fewer hooks than expected" when hooks order changes.
  // We navigate after render so hook execution remains stable.
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % FEATURES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Welcome to NyneOS FinFlow!');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error || 'Login failed');
        triggerShake();
        toast.error(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
      triggerShake();
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex main-bg">
      {/* Left Side - Animated Showcase */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #F97316 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
              filter: 'blur(50px)',
              right: '10%',
              bottom: '20%',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, -40, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Dot Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(249,115,22,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gradient">NyneOS</h1>
                <p className="text-sm text-[var(--text-muted)]">FinFlow</p>
              </div>
            </div>
            <p className="text-xl text-[var(--text-muted)]">
              Institutional Treasury Intelligence
            </p>
          </motion.div>

          {/* Live Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="glass-card p-6 inline-block">
              <p className="text-sm text-[var(--text-muted)] mb-1">Portfolio Managed on Platform</p>
              <motion.p
                className="text-4xl font-mono font-bold text-[var(--accent)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ₹28.15 Cr
              </motion.p>
            </div>
          </motion.div>

          {/* Feature Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <p className="text-sm text-[var(--text-muted)] mb-4">Trusted by Treasury teams across India</p>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const Icon = FEATURES[currentFeature].icon;
                    return <Icon className="w-6 h-6 text-[var(--accent)]" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                    {FEATURES[currentFeature].title}
                  </h3>
                  <p className="text-[var(--text-muted)]">
                    {FEATURES[currentFeature].description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Feature Indicators */}
            <div className="flex gap-2 mt-4">
              {FEATURES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentFeature
                      ? 'w-6 bg-[var(--accent)]'
                      : 'bg-[var(--border-hover)]'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: shake ? [0, -10, 10, -10, 10, 0] : 0
          }}
          transition={{ 
            duration: shake ? 0.4 : 0.5,
            ease: shake ? "easeInOut" : "easeOut"
          }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">NyneOS</h1>
              <p className="text-xs text-[var(--text-muted)]">FinFlow</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                Welcome Back
              </h2>
              <p className="text-[var(--text-muted)]">
                Sign in to access your treasury dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field w-full pl-12"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field w-full pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] text-center flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                Secured with 256-bit encryption and multi-factor authentication
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-[var(--text-subtle)] mt-6">
            © 2026 NyneOS Technologies Pvt. Ltd. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
