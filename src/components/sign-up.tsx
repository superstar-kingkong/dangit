import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, Loader2, ArrowRight, KeyRound } from 'lucide-react';
import { signInWithOTP, verifyOTP } from '../lib/supabase';

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
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    otp: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setErrors({ email: 'Please enter a valid email' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signInWithOTP(formData.email);
      
      if (error) {
        setErrors({ email: error.message || 'Failed to send OTP' });
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Check your email for the login code!');
      setStep('otp');
      setIsLoading(false);
      
    } catch (error: any) {
      setErrors({ email: 'Something went wrong. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      setErrors({ otp: 'Please enter the verification code' });
      return;
    }

    if (formData.otp.length !== 6) {
      setErrors({ otp: 'Code must be 6 digits' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await verifyOTP(formData.email, formData.otp);
      
      if (error) {
        setErrors({ otp: 'Invalid code. Please try again.' });
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Success! Pass user data to parent
        onComplete({
          name: formData.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || formData.email
        });
      }
      
    } catch (error: any) {
      setErrors({ otp: 'Verification failed. Please try again.' });
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setErrors({});
    setFormData(prev => ({ ...prev, otp: '' }));
    
    try {
      const { error } = await signInWithOTP(formData.email);
      
      if (error) {
        setErrors({ otp: 'Failed to resend code' });
      } else {
        setSuccessMessage('New code sent! Check your email.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setErrors({ otp: 'Failed to resend code' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      
      {/* CLEANED: Header without status bar */}
      <div className="px-6 pt-8 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">
            <span className="text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text">DANG</span>
            <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">IT</span>
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Get Started' : 'Verify Your Email'}
          </h2>
          <p className="text-gray-600">
            {step === 'email' 
              ? 'Sign in or create an account with email' 
              : `We sent a code to ${formData.email}`
            }
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="max-w-md mx-auto pb-8">
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              
              {/* CLEANED: Name Field without "Optional" text */}
              <div>
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e: any) => handleInputChange('name', e.target.value)}
                  icon={User}
                  className="border-gray-300 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Help us personalize your experience
                </p>
              </div>

              {/* Email Field */}
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e: any) => handleInputChange('email', e.target.value)}
                  icon={Mail}
                  className={`border-gray-300 focus:border-indigo-500 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.email}
                  </p>
                )}
              </div>

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
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-xl">
                <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Passwordless Login
                </h3>
                <p className="text-sm text-indigo-800">
                  We'll send a 6-digit code to your email. No password needed - 
                  it's more secure and way easier!
                </p>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              
              {/* OTP Input */}
              <div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      handleInputChange('otp', value);
                    }}
                    className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 focus:outline-none transition-all duration-200 text-center text-2xl font-mono tracking-widest border-gray-300 focus:border-indigo-500 ${
                      errors.otp ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                    autoFocus
                  />
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 mt-2 flex items-center justify-center gap-1">
                    <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                    {errors.otp}
                  </p>
                )}
                <p className="text-sm text-gray-600 text-center mt-2">
                  Enter the 6-digit code from your email
                </p>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full h-12 text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <Check className="w-5 h-5" />
                  </>
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                >
                  Resend Code
                </button>
                
                <div className="text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setFormData(prev => ({ ...prev, otp: '' }));
                      setErrors({});
                      setSuccessMessage('');
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Change Email
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Check your spam folder if you don't see the email. 
                  The code expires in 10 minutes.
                </p>
              </div>
            </form>
          )}

          {/* What you get */}
          <div className="mt-8 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              What you get with DANGIT:
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                <span>Save unlimited content from anywhere</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
                <span>AI-powered organization and smart search</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5"></div>
                <span>Access across all your devices</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div>
                <span>Automatic categorization with tags</span>
              </li>
            </ul>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center mt-6 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
