import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdArrowForward, MdSchool, MdCheckCircle, MdFavorite } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { api } from '../services/api';

const PERKS = [
  'Find classmates with matching vibes 💖',
  'Instantly chat via direct messages 💬',
  'Share Streak and your Stories 💓',
  'Discover the daily campus gossip 🏫',
  '100% private — university emails only 🔒',
];

const RECENT = [
];

export default function Auth() {
  const { theme } = useTheme();
  const { login } = useUser();
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      let data;
      if (isLogin) {
        data = await api.auth.login(email, password);
      } else {
        data = await api.auth.register(email, password, fullName);
      }
      login(data.token, data);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen satoshi transition-colors duration-300 ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      <style>{`
        .input-field {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'};
          padding: 14px 0 12px;
          font-size: 15px;
          font-family: 'Satoshi', sans-serif;
          color: ${dark ? '#e0e3de' : '#1a2e1e'};
          outline: none;
          transition: border-color 0.25s;
        }
        .input-field::placeholder { color: ${dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}; }
        .input-field:focus { border-bottom-color: #ee2a7b; }
        .input-wrap { position: relative; }
        .input-bar {
          position: absolute; bottom: 0; left: 0;
          height: 1.5px; width: 0;
          background: linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7);
          transition: width 0.4s ease;
        }
        .input-field:focus ~ .input-bar { width: 100%; }
        .live-dot { animation: blink 1.4s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .slide-in { animation: slideIn 0.45s cubic-bezier(.22,1,.36,1) both; }
        @keyframes slideIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .avatar-ring { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 border-b px-6 py-4 flex items-center justify-between backdrop-blur-xl ${dark ? 'bg-black/90 border-zinc-900' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Cactus Logo" className="h-8 w-auto object-contain" />
          <span className="cabinet text-xl font-900 tracking-tight text-insta-grad">Cactus</span>
        </div>
        <Link to="/" className={`flex items-center gap-1.5 text-xs font-600 satoshi transition-colors ${dark ? 'text-zinc-500 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-800'}`}>
          <MdArrowBack className="text-sm" /> Back to home
        </Link>
      </nav>

      <div className="flex min-h-screen pt-[57px]">

        {/* LEFT PANEL — social proof */}
        <div className={`hidden lg:flex lg:w-[48%] xl:w-[52%] relative flex-col justify-between p-14 overflow-hidden border-r ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-100'}`}>
          {/* bg orbs */}
          <div className={`absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none ${dark ? 'bg-pink-500/[0.05]' : 'bg-rose-400/[0.08]'}`} />
          <div className={`absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none ${dark ? 'bg-violet-500/[0.04]' : 'bg-amber-400/[0.06]'}`} />

          {/* Top — headline */}
          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 border rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest mb-10 ${dark ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
              <span className="w-1.5 h-1.5 rounded-full live-dot bg-rose-500" />
              5,000+ classmates active now
            </div>

            <h1 className="cabinet text-5xl xl:text-6xl font-900 leading-[1.0] tracking-tight mb-6">
              Find your<br />
              <span className="text-insta-grad">
                campus spark. ✨
              </span>
            </h1>
            <p className={`satoshi text-base leading-relaxed max-w-sm mb-10 ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Join the cute, private campus matching network built for college students. Find your study partner, cafe date, or next big crush.
            </p>

            {/* Perks */}
            <div className="space-y-4">
              {PERKS.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <MdCheckCircle className={`text-lg flex-shrink-0 ${dark ? 'text-pink-400' : 'text-rose-500'}`} />
                  <span className={`satoshi text-sm font-500 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>


        </div>

        {/* RIGHT PANEL — form */}
        <div className={`flex-1 flex items-center justify-center px-6 py-12 ${dark ? 'bg-black' : 'bg-[#FAFBF9]'}`}>
          <div className="w-full max-w-[400px] slide-in">

            {/* Toggle tabs */}
            <div className={`flex p-1 rounded-2xl border mb-10 ${dark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              {['Sign In', 'Join Cactus'].map((label, i) => {
                const active = isLogin ? i === 0 : i === 1;
                return (
                  <button key={label}
                    onClick={() => { setIsLogin(i === 0); setError(''); }}
                    className={`flex-1 py-3 text-sm font-700 cabinet rounded-xl transition-all duration-200 cursor-pointer ${active
                      ? 'bg-insta-grad text-white shadow-md'
                      : (dark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-400 hover:text-slate-700')}`}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Heading */}
            <div className="mb-8">
              <h2 className="cabinet text-3xl font-900 leading-tight mb-2">
                {isLogin ? "Welcome back! 🌸" : "Find your people. 💖"}
              </h2>
              <p className={`satoshi text-sm ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>
                {isLogin ? 'Sign in with your university account.' : 'Create your free account in 30 seconds.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className={`text-xs satoshi font-600 border px-4 py-3 rounded-xl mb-6 ${dark ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-rose-600 bg-rose-50 border-rose-200'}`}>
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-7" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-wrap">
                  <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>My Sweet Name</label>
                  <input className="input-field" type="text" placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} />
                  <div className="input-bar" />
                </div>
              )}

              <div className="input-wrap">
                <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1.5 satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>University Email Address</label>
                <input className="input-field" type="email" placeholder="yourname@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                <div className="input-bar" />
              </div>

              <div className="input-wrap">
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-[10px] font-bold uppercase tracking-widest satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Secret Password</label>
                  {isLogin && (
                    <a href="#" className={`text-[10px] satoshi transition-colors ${dark ? 'text-zinc-500 hover:text-pink-400' : 'text-slate-400 hover:text-rose-600'}`}>Forgot?</a>
                  )}
                </div>
                <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <div className="input-bar" />
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-4 rounded-2xl font-800 cabinet text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2 bg-insta-grad text-white shadow-md hover:brightness-110">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Matching sparks...
                  </>
                ) : (
                  <>
                    <MdFavorite className="text-lg animate-heartbeat" />
                    {isLogin ? 'Enter Feed' : 'Join the Fun'}
                    <MdArrowForward className="text-base" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <p className={`satoshi text-sm text-center mt-8 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="font-700 cabinet transition-colors text-pink-500 hover:text-pink-600 cursor-pointer">
                {isLogin ? 'Join now' : 'Sign in'}
              </button>
            </p>

            {/* Trust note */}
            <div className={`flex items-center justify-center gap-2 mt-6 text-[10px] satoshi ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>
              <span>💖</span>
              <span>Campus only · Friends matching · Free forever</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}