import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { 
  MdHome, MdChat, MdPerson, MdFavorite, MdWbSunny, MdNightsStay, MdHowToVote
} from 'react-icons/md';

export default function Layout({ children }) {
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const dark = theme === 'dark';

  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (dark) {
      return isActive 
        ? "flex items-center gap-4 py-3 px-4 text-pink-500 font-bold bg-pink-500/10 rounded-xl transition-all duration-300 scale-[1.02]"
        : "flex items-center gap-4 py-3 px-4 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-all duration-300 active:scale-95";
    } else {
      return isActive 
        ? "flex items-center gap-4 py-3 px-4 text-rose-600 font-bold bg-rose-50 border border-rose-100 rounded-xl transition-all duration-300 shadow-sm scale-[1.02]"
        : "flex items-center gap-4 py-3 px-4 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-300 active:scale-95";
    }
  };

  const getMobileLinkClass = (path) => {
    const isActive = location.pathname === path;
    if (dark) {
      return isActive
        ? "flex flex-col items-center gap-1 text-pink-500 font-bold transition-all scale-105"
        : "flex flex-col items-center gap-1 text-zinc-500 transition-all";
    } else {
      return isActive
        ? "flex flex-col items-center gap-1 text-rose-600 font-bold transition-all scale-105"
        : "flex flex-col items-center gap-1 text-slate-500 transition-all";
    }
  };

  return (
    <div className={dark ? "dark bg-black text-[#e0e3de] min-h-screen" : "bg-[#FAFBF9] text-slate-800 min-h-screen"}>
      
      {/* Mobile Top Bar */}
      <header className={dark ? "flex justify-between items-center px-6 h-16 md:hidden bg-black/80 backdrop-blur-xl border-b border-zinc-900 fixed top-0 w-full z-40" : "flex justify-between items-center px-6 h-16 md:hidden bg-white/90 backdrop-blur-xl border-b border-slate-200 fixed top-0 w-full z-40 shadow-sm"}>
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Cactus Logo" className="h-6 w-auto object-contain" />
          <span className="cabinet text-xl font-900 tracking-tight text-insta-grad">Cactus</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new Event('toggle-widgets'))} 
            className={`p-2 rounded-lg transition-all md:hidden ${dark ? 'text-pink-400 hover:bg-zinc-900' : 'text-rose-600 hover:bg-slate-100'}`}
            title="Toggle Debate & Polls Panel"
          >
            <MdHowToVote className="text-xl animate-pulse" />
          </button>
          <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${dark ? 'text-pink-400 hover:bg-zinc-900' : 'text-rose-600 hover:bg-slate-100'}`}>
            {dark ? <MdWbSunny className="text-xl" /> : <MdNightsStay className="text-xl" />}
          </button>
          <div className={`w-8 h-8 rounded-full overflow-hidden border-2 ${dark ? 'border-pink-500/30' : 'border-rose-200'}`}>
            <img className="w-full h-full object-cover" alt="User avatar" src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} />
          </div>
        </div>
      </header>

      <div className="flex min-h-screen">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className={dark ? "hidden md:flex flex-col py-8 px-6 gap-y-6 h-screen w-64 fixed border-r border-zinc-900 bg-black z-50 overflow-y-auto" : "hidden md:flex flex-col py-8 px-6 gap-y-6 h-screen w-64 fixed border-r border-slate-200 bg-white z-50 shadow-sm overflow-y-auto"}>
          <div className="flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="Cactus Logo" className="h-7 w-auto object-contain" />
              <span className="cabinet text-2xl font-900 tracking-tight text-insta-grad">Cactus</span>
            </Link>
            <button onClick={toggleTheme} className={`p-2 rounded-lg transition-all ${dark ? 'text-pink-400 hover:bg-zinc-900' : 'text-rose-600 hover:bg-slate-100 border border-slate-200'}`}>
              {dark ? <MdWbSunny className="text-lg" /> : <MdNightsStay className="text-lg" />}
            </button>
          </div>
          
          <nav className="flex flex-col gap-y-2">
            <Link to="/feed" className={getLinkClass('/feed')}>
              <MdHome className="text-2xl" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link to="/chat" className={getLinkClass('/chat')}>
              <MdChat className="text-2xl" />
              <span className="text-sm font-medium">Messages</span>
            </Link>
            <Link to="/alerts" className={getLinkClass('/alerts')}>
              <MdFavorite className="text-2xl" />
              <span className="text-sm font-medium">Heartbeats</span>
            </Link>
            <Link to="/profile" className={getLinkClass('/profile')}>
              <MdPerson className="text-2xl" />
              <span className="text-sm font-medium">My Space</span>
            </Link>
          </nav>
          
          <div className="mt-auto flex flex-col gap-3">
            <div className={`p-4 rounded-xl border transition-all duration-300 ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-rose-50/50 border-rose-100'}`}>
              <p className={`text-[10px] uppercase tracking-widest mb-1.5 font-bold ${dark ? 'text-pink-400' : 'text-rose-600'}`}>Cactus Plus ⚡</p>
              <p className={`text-xs leading-relaxed mb-3 ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>See who's viewing your profile & find study collaborators.</p>
              <button className={`w-full py-2 text-xs font-bold rounded-lg transition-all bg-insta-grad text-white hover:brightness-110 shadow-sm active:scale-95`}>Get Plus ⚡</button>
            </div>
            <button 
              onClick={logout}
              className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all ${dark ? 'text-rose-400/80 hover:text-rose-400 hover:bg-rose-950/20 border border-rose-500/10' : 'text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 bg-rose-50'}`}
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content canvas container */}
        <div className="flex-1 min-h-screen md:pl-64">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className={dark ? "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-around px-4 z-50" : "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex items-center justify-around px-4 z-50 shadow-lg"}>
        <Link to="/feed" className={getMobileLinkClass('/feed')}>
          <MdHome className="text-2xl" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link to="/chat" className={getMobileLinkClass('/chat')}>
          <MdChat className="text-2xl" />
          <span className="text-[10px]">Messages</span>
        </Link>
        <Link to="/alerts" className={getMobileLinkClass('/alerts')}>
          <MdFavorite className="text-2xl" />
          <span className="text-[10px]">Heartbeats</span>
        </Link>
        <Link to="/profile" className={getMobileLinkClass('/profile')}>
          <MdPerson className="text-2xl" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
