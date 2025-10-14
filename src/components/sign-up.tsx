import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, Loader2, ArrowRight } from 'lucide-react';

interface SignUpProps {
  onComplete: (userData: { name: string; email: string }) => void;
}

// Simple UI components
const Button = ({ children, onClick, disabled, className, type = 'button' }: any) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg active:scale-95'
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ className, icon: Icon, ...props }: any) => (
  <div className="relative">
    {Icon && <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />}
    <input
      {...props}
      className={`w-full px-4 py-4 ${Icon ? 'pl-12' : ''} rounded-xl border-2 focus:outline-none transition-all duration-200 ${className}`}
    />
  </div>
);

export function SignUp({ onComplete }: SignUpProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isSignUp && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isSignUp && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (isSignUp && !agreedToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      // Pass user data to parent component
      onComplete({
        name: formData.name || formData.email.split('@')[0],
        email: formData.email
      });
    }, 1500);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onComplete({
        name: 'Google User',
        email: 'user@gmail.com'
      });
    }, 1000);
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    return { strength: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-4 pb-2">
        <span className="text-sm font-medium text-gray-900">9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <div className="w-6 h-3 border border-gray-900 rounded-sm relative">
              <div className="absolute inset-0.5 bg-green-500 rounded-sm"></div>
            </div>
            <span className="text-sm font-medium">100%</span>
          </div>
        </div>
      </div>

      {/* Fixed Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-2">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Join DANGIT' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600">
            {isSignUp ? 'Save and organize everything' : 'Access your saved content'}
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-md mx-auto pb-8">
          
          {/* Google Sign In */}
          <div className="mb-6">
            <Button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full h-12 border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Please wait...' : 'Continue with Google'}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field - Sign Up Only */}
            {isSignUp && (
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  icon={User}
                  className={`border-gray-300 focus:border-indigo-500 ${
                    errors.name ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                icon={Mail}
                className={`border-gray-300 focus:border-indigo-500 ${
                  errors.email ? 'border-red-500 focus:border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 focus:outline-none transition-all duration-200 border-gray-300 focus:border-indigo-500 ${
                    errors.password ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength - Sign Up Only */}
              {isSignUp && formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength 
                            ? passwordStrength.color 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  {passwordStrength.label && (
                    <p className={`text-xs ${
                      passwordStrength.strength === 3 ? 'text-green-600' : 
                      passwordStrength.strength === 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Password strength: {passwordStrength.label}
                    </p>
                  )}
                </div>
              )}
              
              {errors.password && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password - Sign Up Only */}
            {isSignUp && (
              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  icon={Lock}
                  className={`border-gray-300 focus:border-indigo-500 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                />
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Terms Agreement - Sign Up Only */}
            {isSignUp && (
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
                      Terms of Service
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.terms}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Switch Mode */}
          <div className="text-center pt-6">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                setAgreedToTerms(false);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>

          {/* Additional Info for Sign Up */}
          {isSignUp && (
            <div className="mt-8 p-4 bg-indigo-50 rounded-xl">
              <h3 className="font-semibold text-indigo-900 mb-2">What you get:</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                <li>• Save unlimited content from anywhere</li>
                <li>• AI-powered organization and search</li>
                <li>• Access across all your devices</li>
                <li>• Smart categories and tags</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}