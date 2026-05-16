import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  Users,
  BarChart3,
  Shield,
  ArrowRight,
  Zap,
  Target,
  Clock,
  Star,
  ChevronRight,
  Layout,
  ListChecks,
  TrendingUp,
  Award,
} from 'lucide-react';

function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (id) => visibleSections.has(id);

  const features = [
    {
      icon: <Layout className="w-7 h-7" />,
      title: 'Project Management',
      desc: 'Create projects, add team members, and organize work efficiently with an intuitive interface.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <ListChecks className="w-7 h-7" />,
      title: 'Task Tracking',
      desc: 'Create tasks with priorities, due dates, and assignees. Track progress from To Do → In Progress → Done.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: 'Smart Dashboard',
      desc: 'Get real-time insights with task statistics, status breakdowns, and overdue task alerts.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: 'Role-Based Access',
      desc: 'Admin and Member roles ensure the right people have the right level of control.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Award className="w-7 h-7" />,
      title: 'Leaderboard',
      desc: 'Gamify productivity! See top performers and motivate your team with rankings.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: 'Progress Analytics',
      desc: 'Track project completion, team productivity, and identify bottlenecks at a glance.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  const steps = [
    { num: '01', title: 'Sign Up', desc: 'Create your account as an Admin or Member in seconds.', icon: <Users className="w-6 h-6" /> },
    { num: '02', title: 'Create Projects', desc: 'Set up projects and invite team members to collaborate.', icon: <Target className="w-6 h-6" /> },
    { num: '03', title: 'Assign Tasks', desc: 'Create tasks with priorities & deadlines, assign to team members.', icon: <Zap className="w-6 h-6" /> },
    { num: '04', title: 'Track Progress', desc: 'Monitor everything from your dashboard and stay on top.', icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const techStack = [
    { name: 'React', color: 'text-cyan-400' },
    { name: 'Node.js', color: 'text-green-400' },
    { name: 'Express', color: 'text-yellow-400' },
    { name: 'MySQL', color: 'text-blue-400' },
    { name: 'JWT Auth', color: 'text-purple-400' },
    { name: 'Tailwind CSS', color: 'text-teal-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-hidden">
      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrollY > 50
            ? 'bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              TaskSphere
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-6">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          ></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">Team Task Management System</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-tight mb-8">
            <span className="block bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Manage Tasks.
            </span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
              Empower Teams.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            TaskSphere is a powerful team task management platform where teams can create projects,
            assign tasks, track progress, and boost productivity like a simple version of{' '}
            <span className="text-blue-400 font-medium">Trello</span> &{' '}
            <span className="text-purple-400 font-medium">Asana</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>

          {/* Floating preview card */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative bg-[#12122a]/90 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
              {/* Mini dashboard preview */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-xs text-gray-500 ml-2">TaskSphere Dashboard</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Tasks', value: '48', color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30' },
                  { label: 'In Progress', value: '12', color: 'from-amber-500/20 to-amber-600/20', border: 'border-amber-500/30' },
                  { label: 'Completed', value: '32', color: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30' },
                  { label: 'Overdue', value: '4', color: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`bg-gradient-to-br ${stat.color} border ${stat.border} rounded-xl p-4 text-center`}
                  >
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
              {/* Mini task list */}
              <div className="mt-4 space-y-2">
                {[
                  { title: 'Design landing page', status: 'Done', priority: 'High', statusColor: 'bg-emerald-500', prColor: 'text-red-400' },
                  { title: 'Setup API endpoints', status: 'In Progress', priority: 'Medium', statusColor: 'bg-amber-500', prColor: 'text-yellow-400' },
                  { title: 'Write unit tests', status: 'To Do', priority: 'Low', statusColor: 'bg-gray-500', prColor: 'text-green-400' },
                ].map((task) => (
                  <div key={task.title} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${task.statusColor}`}></div>
                      <span className="text-sm text-gray-300">{task.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs font-medium ${task.prColor}`}>{task.priority}</span>
                      <span className="text-xs text-gray-500">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-2 animate-bounce">
          <span className="text-xs text-gray-500">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6" id="features" data-animate>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Powerful Features</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Everything You Need to
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Manage Your Team
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              From project creation to task tracking and analytics — TaskSphere provides all the tools your team needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-500 hover:border-white/10 hover:scale-[1.02] hover:shadow-2xl ${isVisible('features')
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 px-6" id="how-it-works" data-animate>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div
            className={`text-center mb-20 transition-all duration-1000 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Simple Process</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Get Started in
              </span>{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                4 Easy Steps
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative group transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-300 hover:border-white/10 h-full">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-5xl font-black bg-gradient-to-br from-blue-500/20 to-purple-500/20 bg-clip-text text-transparent">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="relative py-24 px-6" id="tech-stack" data-animate>
        <div className="max-w-4xl mx-auto relative z-10">
          <div
            className={`text-center mb-12 transition-all duration-1000 ${isVisible('tech-stack') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Built With Modern Tech
            </h2>
            <p className="text-gray-500">Powered by industry-standard technologies</p>
          </div>
          <div
            className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-200 ${isVisible('tech-stack') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
          >
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] rounded-full hover:bg-white/[0.06] transition-all duration-300 hover:scale-105"
              >
                <span className={`font-semibold ${tech.color}`}>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6" id="cta" data-animate>
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <div
            className={`relative transition-all duration-1000 ${isVisible('cta') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-3xl p-12 sm:p-16 text-center backdrop-blur-sm">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Ready to Boost Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Team's Productivity?
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Join TaskSphere today and transform the way your team collaborates, tracks tasks, and delivers results.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-semibold text-lg shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Create Account</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-sm text-gray-400">
              © 2026 TaskSphere. Built with ❤️
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>React + Node.js + MySQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
