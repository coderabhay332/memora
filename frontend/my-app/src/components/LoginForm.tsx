import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { setTokens } from '../store/reducers/authReducer';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { useLoginMutation } from '../services/api';
import { useNavigate } from 'react-router-dom';

const EnhancedLoginComponent = () => {
  const [loginUser] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields', {
        style: {
          background: '#FEF2F2',
          color: '#DC2626',
          border: '1px solid #FECACA'
        }
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const loginResponse = await loginUser(formData).unwrap();
      if (!loginResponse?.success || !loginResponse?.data?.accessToken) {
        toast.error("Login failed. Please check your credentials.", {
          duration: 3000,
        });
        throw new Error(loginResponse?.message || "Authentication failed");
      }

      const { accessToken, refreshToken } = loginResponse.data;
      dispatch(setTokens({ accessToken, refreshToken }));
      
      toast.success("Welcome back! Login successful", {
        duration: 2000,
        icon: '🎉',
        style: {
          background: '#F0FDF4',
          color: '#166534',
          border: '1px solid #BBF7D0'
        }
      });
      
      navigate('/dashboard'); 
    } catch (error: any) {
      if(error.data?.status === "FETCH_ERROR") {
        toast.error("Network error. Please try again later.", {
          duration: 3000,
        });
        return;
      }

      toast.error(`Login failed: ${error.data?.message || 'Unknown error'}`, {
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontWeight: '500'
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-40" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-50" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Login Container */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md relative z-10 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-3xl shadow-2xl transform rotate-6"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl w-full h-full flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform duration-300">
                <Lock className="w-10 h-10 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-3xl"></div>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-white/80 text-lg">Sign in to your Memora account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="relative group">
              <label className="block text-white/90 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 pl-12 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/15"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="w-5 h-5 text-white/60 group-focus-within:text-purple-300 transition-colors duration-300" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block text-white/90 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-4 pl-12 pr-12 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-transparent transition-all duration-300 backdrop-blur-sm group-hover:bg-white/15"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="w-5 h-5 text-white/60 group-focus-within:text-purple-300 transition-colors duration-300" />
                </div>
                <button 
                  type="button"
                  onClick={togglePassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-400 bg-white/10 border-white/20 rounded focus:ring-purple-400 focus:ring-2 transition-all duration-200"
                />
                <span className="ml-3 text-sm text-white/80 group-hover:text-white transition-colors duration-200">
                  Remember me
                </span>
              </label>
              <button 
                type="button"
                className="text-sm text-purple-300 hover:text-purple-100 transition-colors duration-200 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/70 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button" 
                className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-medium">Google</span>
              </button>
              <button 
                type="button" 
                className="flex items-center justify-center px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 group backdrop-blur-sm"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-medium">Twitter</span>
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-white/80">
              Don't have an account? 
              <button 
                onClick={() => navigate('/signup')} 
                className="text-purple-300 hover:text-purple-100 font-semibold transition-colors duration-200 ml-2 group"
              >
                Sign up here
                <ArrowRight className="w-4 h-4 inline ml-1 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </p>
          </div>

          {/* Features Footer */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex items-center justify-center space-x-6 text-xs text-white/60">
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Fast</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Smart</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </>
  );
};

export default EnhancedLoginComponent;