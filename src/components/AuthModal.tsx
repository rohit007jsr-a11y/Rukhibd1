import React, { useState } from 'react';
import { User } from '../types';
import { sendOtpApi, verifyOtpApi, registerUserApi, loginUserApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { X, Mail, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const { loginUser } = useAuth();

  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtpApi(email, mode);
      setLoading(false);
      if (res.devOtp) setDevOtp(res.devOtp);
      setStep('otp');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to send OTP code.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOtpApi(email, otpCode);
      setLoading(false);
      if (mode === 'signup') {
        setStep('details');
      } else {
        const res = await loginUserApi(email, password);
        loginUser(res.user);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid verification code.');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg('Name and mobile phone number are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await registerUserApi({
        email,
        fullName,
        phone,
        address,
        password,
      });
      loginUser(res.user);
      setLoading(false);
      onSuccess(res.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border-2 border-[#111111] shadow-[8px_8px_0px_#111111] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 bg-[#111111] text-white flex items-center justify-between border-b-2 border-[#E63946]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#E63946]" />
            <h2 className="font-heading font-black text-sm uppercase tracking-wider">
              {mode === 'signup' ? 'Create Rukhi Account' : 'Customer Sign In'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:text-[#E63946] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border-2 border-[#E63946] text-[#E63946] text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-heading font-black text-base text-[#111111] uppercase">
                  Enter Your Email
                </h3>
                <p className="text-xs text-gray-500 font-body">
                  We'll send a 6-digit verification OTP code to your email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#111111] uppercase mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. hossain@gmail.com"
                    className="w-full pl-9 p-2.5 bg-[#F7F7F5] border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] text-white font-heading font-black text-xs uppercase py-3.5 flex items-center justify-center gap-2 border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send OTP Code</span>}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                  className="text-xs font-heading font-bold text-gray-600 hover:text-[#E63946] underline uppercase"
                >
                  {mode === 'signup' ? 'Already registered? Sign In' : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-heading font-black text-base text-[#111111] uppercase">
                  Verify 6-Digit OTP
                </h3>
                <p className="text-xs text-gray-500 font-body">
                  Code sent to <span className="font-bold text-[#111111]">{email}</span>
                </p>
                {devOtp && (
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono font-bold">
                    DEV CODE: {devOtp}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#111111] uppercase mb-1">
                  6-Digit Verification Code *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full p-3 text-center tracking-[0.5em] font-heading font-black text-lg bg-[#F7F7F5] border-2 border-[#111111] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] text-white font-heading font-black text-xs uppercase py-3.5 flex items-center justify-center gap-2 border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Continue</span>}
              </button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-heading font-black text-base text-[#111111] uppercase">
                  Complete Profile
                </h3>
                <p className="text-xs text-gray-500 font-body">
                  Provide delivery details for 1-click COD checkout.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tanvir Ahmed"
                    className="w-full p-2 bg-[#F7F7F5] border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full p-2 bg-[#F7F7F5] border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-heading font-bold text-[#111111] uppercase mb-1">
                    Default Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House 12, Road 4, Uttara, Dhaka"
                    className="w-full p-2 bg-[#F7F7F5] border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111111] text-white font-heading font-black text-xs uppercase py-3.5 flex items-center justify-center gap-2 border-2 border-[#111111] shadow-[4px_4px_0px_#E63946] hover:bg-[#E63946] transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
