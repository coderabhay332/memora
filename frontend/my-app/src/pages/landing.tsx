import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Brain, MessageSquare, FileText, Search, CheckCircle } from 'lucide-react';

const MemoraLanding = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Intelligence",
      description: "Leverage advanced AI to organize and retrieve your knowledge instantly"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Smart Chat Interface",
      description: "Interact with your notes through natural conversations"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Intelligent Search",
      description: "Find exactly what you need with semantic search capabilities"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and protected at all times"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Rich Note Taking",
      description: "Create, edit, and organize notes with powerful editing tools"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Optimized performance for seamless user experience"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      content: "Memora transformed how I manage my knowledge. It's like having a second brain that actually works!"
    },
    {
      name: "Michael Roberts",
      role: "Software Engineer",
      content: "The AI chat feature is incredible. I can find information in seconds that used to take me hours."
    },
    {
      name: "Emily Watson",
      role: "Designer",
      content: "Clean, intuitive, and powerful. Memora is exactly what I needed for my creative workflow."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <span className="text-2xl font-bold text-black">memora</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-black transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-black transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-black transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-6 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-8">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Your AI-Powered Knowledge Base</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Remember Everything<br />
              <span className="text-gray-600">That Matters</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Memora is your intelligent second brain. Capture, organize, and retrieve your thoughts 
              with the power of AI. Never lose an important idea again.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <button 
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 text-lg font-semibold shadow-lg"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-black border-2 border-black rounded-xl hover:bg-gray-50 transition-all duration-200 text-lg font-semibold">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-black" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-black" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-black" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
            <div className="bg-gray-100 rounded-2xl border-4 border-black shadow-2xl overflow-hidden">
              <div className="bg-black px-4 py-3 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-8 bg-white">
                <div className="grid grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                      <div className="h-2 bg-gray-100 rounded mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to build your perfect knowledge management system
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-black transition-all duration-200 hover:shadow-lg"
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Capture Your Thoughts",
                description: "Create notes, jot down ideas, or import existing documents. Memora makes it effortless."
              },
              {
                step: "02",
                title: "Let AI Organize",
                description: "Our intelligent system automatically categorizes and connects your information."
              },
              {
                step: "03",
                title: "Retrieve Instantly",
                description: "Find what you need through search or chat. Your knowledge is always at your fingertips."
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Loved by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about Memora
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl border-2 border-gray-200">
                <p className="text-gray-800 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-bold text-black">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of professionals who've already made the switch to smarter knowledge management.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center space-x-2 text-lg font-semibold mx-auto shadow-lg"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black text-lg font-bold">M</span>
                </div>
                <span className="text-xl font-bold">memora</span>
              </div>
              <p className="text-gray-400 text-sm">
                Your intelligent second brain for the modern age.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2025 Memora. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MemoraLanding;