import { MessageSquare, BookOpen, Clock, Shield, Zap, Users, ArrowRight, CheckCircle2, Loader2, X, Send, Info, Lock, FileText, Sparkles, Award, Twitter, Facebook, Instagram, Github, Linkedin, Youtube, User, Mail, LogOut } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FeedbackModal from './components/FeedbackModal';
// Simple CountUp component
interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

function CountUp({ end, duration = 2, suffix = '', prefix = '' }: CountUpProps) {
  const [count, setCount] = useState(0);
  const startTimestamp = useRef<number | null>(null);
  useEffect(() => {
    let raf: number;
    function animate(ts: number) {
      if (!startTimestamp.current) startTimestamp.current = ts;
      const progress = Math.min((ts - startTimestamp.current) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    }
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return (
    <span>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isContactLoading, setIsContactLoading] = useState(false);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Salaan! Sideen kaa caawin karnaa maanta? 😊 ' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!name || !email || !message) {
      toast.error('Please provide name, email, and message');
      return;
    }

    setIsContactLoading(true);

    try {
      const res = await fetch('https://send-email-umber-three.vercel.app/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Feedback submitted successfully! We will get back to you soon.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        toast.error(data.message || data.error || 'Failed to send feedback. Please try again.');
      }
    } catch (err) {
      toast.error('Error connecting to server. Please check your connection and try again.');
      console.error('Submit error:', err);
    } finally {
      setIsContactLoading(false);
    }
  };

  // Chatbot functions
  const scrollToBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sanitizeBotText = (raw: string): string => {
    if (!raw) return '';
    let text = raw;
    // Remove fenced code blocks and inline code
    text = text.replace(/```[\s\S]*?```/g, ' ');
    text = text.replace(/`([^`]*)`/g, '$1');
    // Remove bold/italic markers **, __, *, _
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');
    // Remove headings and blockquotes
    text = text.replace(/^\s*#+\s*/gm, '');
    text = text.replace(/^\s*>\s?/gm, '');
    // Remove leading list markers (-, *, •, 1., 1))
    text = text.replace(/^\s*[\-*•]+\s+/gm, '');
    text = text.replace(/^\s*\d+[\.)]\s+/gm, '');
    // Normalize whitespace
    text = text.replace(/[\t ]+/g, ' ');
    text = text.replace(/\s*\n\s*/g, '\n').trim();
    return text;
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // Add user message to chat
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('https://34.136.183.217.sslip.io/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'web_user_' + Date.now(),
          message: userMessage
        })
      });

      const data = await response.json();

      if (response.ok && data && data.length > 0) {
        // Add bot responses (sanitized)
        data.forEach((msg: any) => {
          const clean = sanitizeBotText(String(msg?.text ?? ''));
          if (clean) {
            setChatMessages(prev => [...prev, { sender: 'bot', text: clean }]);
          }
        });
      } else {
        setChatMessages(prev => [...prev, {
          sender: 'bot',
          text: 'Waan ka xumahay, laakiin ma haysto macluumaad ku saabsan weeydiintada . Ma ku caawin karaa wax kale oo la xiriira adeegyada Jaamacadda Ummadda Soomaaliyeed?'
        }]);
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: 'Waan ka xumahay, Fadlan hubi internetkaaga.🤗'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleEndChat = () => {
    setIsFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    setIsFeedbackSubmitting(true);
    try {
      const response = await fetch('https://send-email-umber-three.vercel.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          feedback: feedbackData
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Thank you for your feedback!');
        setIsFeedbackOpen(false);
        setIsChatOpen(false);
        // Reset chat optionally
        setChatMessages([{ sender: 'bot', text: 'Salaan! Sideen kaa caawin karnaa maanta? 😊 ' }]);
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error('Error connecting to server.');
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 animate-fade-in-down">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 transition-transform duration-300 hover:scale-110">
            <img src="/download.jpg" alt="Umadda Logo" className="w-9 h-9 rounded-full object-cover border-2 border-blue-600 shadow-sm" />
            {/* <MessageSquare className="w-8 h-8 text-blue-600" /> */}
            <span className="text-2xl font-bold text-gray-900">Umadda Assistance</span>
          </div>
          {/* Mobile nav toggle button */}
          <button
            className="md:hidden flex items-center px-3 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50 focus:outline-none"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((open) => !open)}
          >
            {navOpen ? (
              // X (close) icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">How It Works</a>
            <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">Benefits</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">About</a>
            <a href="#blog" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">Blog</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors hover:underline hover:underline-offset-8 hover:scale-110 duration-200">Contact</a>
            {/* <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-blue-300/40 duration-200 animate-bounce-once">
              Get Started
            </button> */}
          </div>
          {/* Mobile nav menu */}
          {navOpen && (
            <div className="absolute top-full left-0 w-full bg-white shadow-lg border-b border-gray-200 flex flex-col items-center py-4 space-y-4 md:hidden animate-fade-in-down z-50">
              <a href="#features" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>How It Works</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>Benefits</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>About</a>
              <a href="#blog" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>Blog</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 text-lg transition-colors" onClick={() => setNavOpen(false)}>Contact</a>
            </div>
          )}
        </nav>
      </header>

      <main className="pt-20">
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 md:py-5">

          {/* Decorative background accents */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-0 -left-10 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Your Intelligent
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"> Campus Assistant</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Get instant answers to all your university questions. From admissions to academics, Ummadda Assistance is here to help 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setIsChatOpen(true)} className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-110 shadow-lg hover:shadow-2xl flex items-center justify-center space-x-2 animate-fade-in-up group">
                    <span>Try Umadda Assisitance Now</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  {/* <button className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold border-2 border-gray-200 hover:border-blue-600 transition-all transform hover:scale-110 relative overflow-hidden group">
                    Watch Demo
                  </button> */}
                </div>
                <div className="flex items-center space-x-8 pt-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      <CountUp end={10000} duration={2} suffix="+" />
                    </div>
                    <div className="text-sm text-gray-600">Students Helped</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      <CountUp end={98} duration={2} suffix="%" />
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      <CountUp end={24} duration={2} suffix="/7" />
                    </div>
                    <div className="text-sm text-gray-600">Available</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-4 text-gray-700">
                      Waa maxay shuruudaha gelitaanka?
                    </div>
                    <div className="bg-blue-600 text-white rounded-2xl p-4 ml-8">
                      Aad baan ugu faraxsanahay inaan kaa caawiyo! Shuruudaha gelitaankeenu waxaa ka mid ah...
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 text-gray-700">
                      Goormaa semester-ku bilaabanayaa?
                    </div>
                    <div className="bg-blue-600 text-white rounded-2xl p-4 ml-8">
                      Semester-ka dayrta wuxuu bilaabanayaa Sebtember 1-deeda...
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full blur-3xl opacity-50"></div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600">Everything you need for a seamless campus experience</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8" />,
                  title: 'Instant Responses',
                  description: 'Get answers to your questions in seconds, not hours or days.',
                  color: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: <Clock className="w-8 h-8" />,
                  title: '24/7 Availability',
                  description: 'Access help anytime, anywhere. We never sleep so you can focus on your studies.',
                  color: 'from-blue-400 to-cyan-500'
                },
                {
                  icon: <BookOpen className="w-8 h-8" />,
                  title: 'Comprehensive Knowledge',
                  description: 'From courses to campus events, Ummadda Assistance knows everything about your university.',
                  color: 'from-green-400 to-emerald-500'
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: 'Secure & Private',
                  description: 'Your conversations are encrypted and private. Your data is always protected.',
                  color: 'from-purple-400 to-pink-500'
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: 'Multi-Language Support',
                  description: 'Communicate in your preferred language. We speak over 50 languages.',
                  color: 'from-red-400 to-rose-500'
                },
                {
                  icon: <MessageSquare className="w-8 h-8" />,
                  title: 'Natural Conversations',
                  description: 'Chat naturally like you would with a friend. No complicated commands needed.',
                  color: 'from-cyan-400 to-blue-500'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 animate-fade-in-up hover:scale-105 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 relative overflow-hidden"
                >
                  <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-125 transition-transform duration-300 animate-spin-slow group-hover:animate-none`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-200">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4 group-hover:text-blue-500 transition-colors duration-200">{feature.description}</p>
                  <button className="text-sm font-semibold text-blue-600 flex items-center space-x-2 group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
          <div className="absolute -top-12 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-10 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Getting started is simple and takes less than a minute</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Ask Your Question', description: 'Type or speak your question in natural language. No need for special commands.', icon: <MessageSquare className="w-8 h-8 text-blue-600" /> },
                { step: '02', title: 'AI Processing', description: 'Our advanced AI understands your question and searches our knowledge base.', icon: <Sparkles className="w-8 h-8 text-cyan-600" /> },
                { step: '03', title: 'Get Your Answer', description: 'Receive accurate, helpful answers instantly with relevant links and resources.', icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" /> }
              ].map((step, index) => (
                <div key={index} className="relative animate-fade-in-up">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow hover:scale-105 duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-6xl font-bold text-blue-100 group-hover:text-blue-400 transition-colors duration-200">{step.step}</div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-200">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-blue-500 transition-colors duration-200">{step.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 animate-bounce-x">
                      <ArrowRight className="w-8 h-8 text-blue-300 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="benefits" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Students Love Umadda Assistance
                </h2>
                <div className="space-y-6">
                  {[
                    'Never wait in long office queues again',
                    'Access information instantly from anywhere',
                    'Get personalized answers to your specific questions',
                    'Available during exams, holidays, and after hours',
                    'Reduce stress with quick, reliable information',
                    'Free for all registered students'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-4 group hover:scale-105 transition-transform duration-200 animate-fade-in-up">
                      <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1 group-hover:animate-bounce" />
                      <p className="text-lg text-gray-700 group-hover:text-blue-600 transition-colors duration-200">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 text-white">
                <div className="space-y-6">
                  <h3 className="text-3xl font-bold">Try Umadda Assistance Today</h3>
                  <p className="text-lg text-blue-100">
                    Join thousands of students who are already experiencing the future of campus support.
                  </p>
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(true)}
                      className="w-full bg-white text-blue-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-110 shadow-lg animate-fade-in-up flex items-center justify-center gap-2"
                    >
                      Get Started Free
                    </button>
                  </div>
                  <p className="text-sm text-blue-100 text-center">
                    No credit card required • Set up in 2 minutes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg">
                <Info className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">About Umadda Assistance</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Umadda Assistance is dedicated to providing students with instant, reliable, and secure support for all their university needs.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 hover:border-blue-200 animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">Making campus life easier, more accessible, and stress-free for everyone through innovative AI technology.</p>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 hover:border-cyan-200 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-cyan-600 transition-colors">Our Community</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">Trusted by thousands of students who rely on our platform daily for instant university support.</p>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100 hover:border-purple-200 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">Our Technology</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">Powered by advanced AI and natural language processing to deliver accurate, instant responses.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"></div>

          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full mb-6 transform hover:scale-110 transition-all duration-300 shadow-2xl shadow-green-500/50 hover:shadow-green-500/70">
                <Shield className="w-12 h-12 text-white animate-pulse" />
              </div>
              <h2 className="text-5xl font-bold text-white mb-6">Bank-Level Security</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">Your privacy and security are our top priorities. All conversations are encrypted with industry-leading security measures.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:bg-white/15 transform hover:-translate-y-2 animate-fade-in-up">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">End-to-End Encryption</h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">All your conversations are encrypted with AES-256 encryption, the same standard used by banks and government agencies.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-blue-400/50 transition-all duration-300 hover:bg-white/15 transform hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Data Protection</h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">Your personal information is never sold or shared with third parties. You maintain full control over your data.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:bg-white/15 transform hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Regular Security Audits</h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">Our systems undergo regular security audits and penetration testing to ensure maximum protection.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:border-cyan-400/50 transition-all duration-300 hover:bg-white/15 transform hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">GDPR Compliant</h3>
                    <p className="text-gray-300 leading-relaxed group-hover:text-white transition-colors">Fully compliant with GDPR and international data protection regulations to safeguard your rights.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Privacy Section */}
        <section id="privacy" className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg shadow-purple-300">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Privacy Policy</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">We respect your privacy and are committed to protecting your personal information at all times.</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 shadow-xl border border-purple-100 animate-fade-in-up">
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group hover:bg-white/80 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">No Third-Party Sharing</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">Your information is never sold or shared with third parties for marketing purposes.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group hover:bg-white/80 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">Full Data Control</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">You have complete control over your data. Request deletion or export at any time.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group hover:bg-white/80 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Transparent Practices</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">We maintain full transparency about how we collect, use, and protect your data.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group hover:bg-white/80 p-4 rounded-2xl transition-all duration-300 transform hover:-translate-x-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Minimal Data Collection</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors">We only collect the minimum data necessary to provide you with the best service.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute top-10 right-20 w-64 h-64 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1.5s' }}></div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg shadow-orange-300">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Latest from Our Blog</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">Read the latest tips, news, and stories from Umadda Assistance.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-blue-200 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">TIPS & TRICKS</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">How to Get the Most from Campus AI</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-900 transition-colors">Discover strategies to maximize your experience with Umadda Assistance.</p>
                  <button className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-green-200 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.1s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">SECURITY</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-green-600 transition-colors">Staying Secure Online</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-900 transition-colors">Best practices for keeping your data safe while using digital services.</p>
                  <button className="flex items-center space-x-2 text-green-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 hover:border-purple-200 animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">SUCCESS STORIES</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors">Student Success Stories</h3>
                  <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-900 transition-colors">Hear from students who have benefited from our platform.</p>
                  <button className="flex items-center space-x-2 text-purple-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Contact Section */}
        <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
          <div className="absolute -top-8 right-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-cyan-100 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 transform hover:scale-110 hover:rotate-6 transition-all duration-300 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 mb-8">Have questions or need help? Reach out to our support team anytime.</p>
            <form className="max-w-xl mx-auto space-y-4 text-left" onSubmit={handleSubmit}>
              <div className="flex items-center bg-white rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <div className="pl-4 text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-4 rounded-full focus:outline-none"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="flex items-center bg-white rounded-full border border-gray-200 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <div className="pl-4 text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-4 rounded-full focus:outline-none"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-300 transition-all">
                <textarea
                  placeholder="Your Message"
                  className="w-full px-6 py-4 rounded-2xl focus:outline-none"
                  rows={4}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isContactLoading}
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isContactLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </section>


        <section className="py-20 bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.25),transparent_40%)]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Campus Experience?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Start chatting with Ummadda Assistance today and discover how easy campus life can be.
              </p>
              <button onClick={() => setIsChatOpen(true)} className="relative overflow-hidden bg-white text-blue-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-110 shadow-xl inline-flex items-center space-x-2 animate-fade-in-up group">
                <span>Launch Umadda Assisstance</span>
                <ArrowRight className="w-5 h-5 group-hover:animate-bounce-x" />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-200/0 via-blue-200/40 to-transparent translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700"></span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.15),transparent_35%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/download.jpg" alt="Umadda Logo" className="w-9 h-9 rounded-full object-cover border-2 border-blue-600 shadow-sm" />

                {/* <MessageSquare className="w-6 h-6 text-blue-500" /> */}
                <span className="text-xl font-bold text-white">Umadda Assistance</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your intelligent campus assistant, available 24/7 to help you succeed.
              </p>
              <div className="flex items-center space-x-3">
                <a href="#" aria-label="Twitter" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" aria-label="Facebook" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" aria-label="Instagram" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" aria-label="LinkedIn" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" aria-label="GitHub" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" aria-label="YouTube" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Umadda Assisitance. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in z-50 border border-gray-100">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Umadda AI</h3>
                <div className="flex items-center space-x-1.5 opacity-90">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEndChat}
                className="p-2 hover:bg-white/20 rounded-full transition-colors group"
                title="End Chat"
              >
                <LogOut className="w-5 h-5 text-white group-hover:text-red-200" />
              </button>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs mr-2 mt-1 shrink-0">AI</div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none'
                    } animate-fade-in-up`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-1 p-3 bg-white rounded-2xl rounded-bl-none shadow-sm border border-gray-100 items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={handleChatSubmit} className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your question..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all transform hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-400">Powered by Umadda AI</span>
            </div>
          </form>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-110 z-50 flex items-center justify-center group"
      >
        {isChatOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageSquare className="w-7 h-7 group-hover:animate-bounce" />
        )}
      </button>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
        isLoading={isFeedbackSubmitting}
      />

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}





export default App;

