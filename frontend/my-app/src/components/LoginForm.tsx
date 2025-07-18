import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Twitter, Loader2 } from 'lucide-react';
import Button from './Button';
import { setTokens } from '../store/reducers/authReducer';
import { useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

import { useLoginMutation } from '../services/api'; // Adjust the import path as necessary
import { data, Navigate, useNavigate } from 'react-router-dom';
const LoginComponent = () => {
  const [loginUser] = useLoginMutation();
  const Navigate = useNavigate();
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
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const loginResponse = await loginUser(formData).unwrap();
      if (!loginResponse?.success || !loginResponse?.data?.accessToken) {
        toast("Login failed. Please check your credentials.", {
          duration: 3000,
        });
        throw new Error(loginResponse?.message || "Authentication failed");
      }

      const { accessToken, refreshToken } = loginResponse.data;
      dispatch(setTokens({ accessToken, refreshToken }));
      toast("Login successful!", {
        duration: 2000,
        icon: '✅',
      });
      Navigate('/dashboard'); 
    } catch (error: any) {
      if(error.data.status === "FETCH_ERROR") {
          toast("Network error. Please try again later.", {
            duration: 3000,
          });
          return;
      }

     
      toast(`Login failed ${error.data.message}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-40 w-60 h-60 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-bounce"></div>
      </div>

      {/* Login Container */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-md relative z-10 transform transition-all duration-300 hover:scale-105 hover:shadow-3xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="Enter your email"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="w-5 h-5 text-white/50" />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 pl-12 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              placeholder="Enter your password"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="w-5 h-5 text-white/50" />
            </div>
            <Button 
              onClick={togglePassword}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </Button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-purple-400 bg-white/10 border-white/20 rounded focus:ring-purple-400 focus:ring-2"
              />
              <span className="ml-2 text-sm text-white/70">Remember me</span>
            </label>
            <a href="#" className="text-sm text-purple-300 hover:text-purple-100 transition-colors duration-200">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </span>
          </button>

          {/* Social Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button 
              type="button" 
              className="flex items-center justify-center px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              <Twitter className="w-5 h-5 mr-2" />
              Twitter
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-white/70">
            Don't have an account? 
            <button onClick={() => Navigate('/signup')} className="text-purple-300 hover:text-purple-100 font-medium transition-colors duration-200 ml-1">
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;

