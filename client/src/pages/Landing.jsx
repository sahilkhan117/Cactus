import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import {
  MdFlashOn, MdLanguage, MdLockOpen, MdArrowForward, MdNotificationsActive,
  MdWbSunny, MdNightsStay, MdSearch, MdPeople, MdTrendingUp, MdStar,
  MdCheckCircle, MdAutoAwesome, MdGroups, MdSchool, MdFavorite, MdChatBubble
} from 'react-icons/md';

const NAV_LINKS = ['Home', 'Sparks', 'Vibes', 'Direct'];

export default function CactusLanding() {
  const { theme, toggleTheme } = useTheme();
  const { token } = useUser();
  const [activeNav, setActiveNav] = useState('Home');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleCards, setVisibleCards] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const cardRefs = useRef([]);

  const dark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx);
            setVisibleCards(prev => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(p => (p + 1) % 3), 4500);
    return () => clearInterval(t);
  }, []);

  const handleNavClick = (linkName) => {
    setActiveNav(linkName);
    if (linkName === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (linkName === 'Sparks') {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    } else if (linkName === 'Vibes') {
      document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' });
    } else if (linkName === 'Direct') {
      document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const TESTIMONIALS = [
    { name: 'Arjun Mehta', dept: 'CS Final Year', text: 'Found my project partner and study buddy here. The search understands matching vibes instantly.', avatar: 'AM' },
    { name: 'Dr. Priya Sharma', dept: 'Faculty, EXTC', text: 'I keep my batch updated on all announcements in one cute feed. Zero chaos, pure connection.', avatar: 'PS' },
    { name: 'Riya Kapoor', dept: 'MBA 2nd Year', text: 'The E-Summit passed out like crazy! Finding study groups and campus events has never been this fun.', avatar: 'RK' },
  ];

  const FEATURES = [
    {
      icon: <MdAutoAwesome />,
      tag: 'VIBE MATCHING',
      title: 'Find Your Spark ✨',
      desc: 'Our matching algorithm connects you to classmates, study groups, and student clubs aligned with your campus interests.',
      highlight: 'Matches in seconds',
      color: '#ee2a7b',
    },
    {
      icon: <MdFlashOn />,
      tag: 'INSTANT MESSAGE',
      title: 'Direct Whispers 💬',
      desc: 'Socket.io powered chat with read-states and typing indicators. No delays, just direct sparks with classmates.',
      highlight: '<10ms chat latency',
      color: '#f9ce34',
    },
    {
      icon: <MdSearch />,
      tag: 'CAMPUS SEARCH',
      title: 'Vibe, Don\'t Type 🔍',
      desc: 'Search for "React builders who play guitar" or "canteen lovers" and find matching classmate profiles instantly.',
      highlight: 'Semantic matches',
      color: '#6228d7',
    },
    {
      icon: <MdLockOpen />,
      tag: 'CAMPUS PRIVACY',
      title: 'Students Only 🔒',
      desc: 'Exclusively restricted to university email verification. Safe spaces, zero data selling, and zero spam.',
      highlight: 'Verified student access',
      color: '#ea580c',
    },
    {
      icon: <MdTrendingUp />,
      tag: 'HOT TOPICS',
      title: 'Trending Gossip 🔥',
      desc: 'See what topics, canteen updates, and campus events are spiking this week. Jump right in and say hi.',
      highlight: 'Live trending updates',
      color: '#db2777',
    },
    {
      icon: <MdGroups />,
      tag: 'CAMPUS FEED',
      title: 'Daily Gossip Feed 📣',
      desc: 'Share projects, CAD designs, ask questions, or post event flyers. Your campus vibe, in a clean social feed.',
      highlight: '5k+ active classmates',
      color: '#10b981',
    },
  ];

  const SOCIAL_PROOF = [
    { val: '5,000+', label: 'Classmates Connected', icon: <MdPeople /> },
    { val: '40%', label: 'Vibe Engagement Uplift', icon: <MdTrendingUp /> },
    { val: '<10ms', label: 'Message Latency', icon: <MdFlashOn /> },
    { val: '94.8%', label: 'Vibe Match Rate', icon: <MdStar /> },
  ];

  return (
    <div className={`min-h-screen satoshi overflow-x-hidden transition-colors duration-300 ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      <style>{`
        .cabinet { font-family: 'Cabinet Grotesk', 'Outfit', sans-serif; }
        .hero-float { animation: hFloat 4s ease-in-out infinite; }
        .hero-float:nth-child(2) { animation-delay: 0.7s; }
        .hero-float:nth-child(3) { animation-delay: 1.4s; }
        .hero-float:nth-child(4) { animation-delay: 2.1s; }
        @keyframes hFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .card-reveal { opacity:0; transform:translateY(32px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .card-reveal.visible { opacity:1; transform:translateY(0); }
        .card-reveal:nth-child(2) { transition-delay:0.1s; }
        .card-reveal:nth-child(3) { transition-delay:0.2s; }
        .card-reveal:nth-child(4) { transition-delay:0.3s; }
        .card-reveal:nth-child(5) { transition-delay:0.4s; }
        .card-reveal:nth-child(6) { transition-delay:0.5s; }
        .feat-card { transition: all 0.3s cubic-bezier(.34,1.56,.64,1); cursor:default; }
        .feat-card:hover { transform:translateY(-6px) scale(1.01); }
        .testi-slide { transition: opacity 0.5s ease, transform 0.5s ease; }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-track { display:flex; gap:2rem; animation: marquee 18s linear infinite; width:max-content; }
        .live-dot { animation: blink 1.4s ease-in-out infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .grain::after {
          content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity:0.03;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? (dark ? 'bg-black/95 backdrop-blur-2xl border-b border-zinc-900 shadow-2xl' : 'bg-white/96 backdrop-blur-2xl border-b border-slate-50 shadow-sm') : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Cactus Logo" className="h-8 w-auto object-contain" />
            <span className="cabinet text-xl font-900 tracking-tight text-insta-grad">Cactus</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 ${dark ? 'bg-pink-500/10 border-pink-500/25 text-pink-400' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>CAMPUS</span>
          </div>

          <div className={`hidden md:flex items-center gap-1 rounded-full px-2 py-1.5 border ${dark ? 'bg-white/4 border-zinc-900' : 'bg-black/2 border-slate-200'}`}>
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => handleNavClick(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-500 transition-all duration-200 cursor-pointer ${activeNav === l ? (dark ? 'bg-zinc-900 text-white' : 'bg-slate-200 text-slate-900') : (dark ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-900')}`}>
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2.5 rounded-full border transition-all ${dark ? 'text-pink-400 border-zinc-900 hover:bg-zinc-900' : 'text-rose-600 border-slate-200 hover:bg-slate-100'}`}>
              {dark ? <MdWbSunny /> : <MdNightsStay />}
            </button>
            <Link to={token ? "/feed" : "/auth"} className="flex items-center gap-1.5 text-sm font-700 cabinet px-5 py-2.5 rounded-full transition-all bg-insta-grad text-white hover:brightness-110 active:scale-95 shadow-sm">
              {token ? "Go to Feed" : "Join Cactus"} <MdArrowForward />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        {/* Background orbs */}
        <div className={`absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -z-10 ${dark ? 'bg-pink-500/4' : 'bg-rose-400/8'}`} />
        <div className={`absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none -z-10 ${dark ? 'bg-amber-500/3' : 'bg-violet-400/6'}`} />

        <div className="text-center relative z-10">
          {/* Live badge */}
          <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest mb-8 ${dark ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
            <span className="w-2 h-2 rounded-full live-dot bg-rose-500" />
            5,000+ classmates live on campus
          </div>

          <h1 className="cabinet text-5xl md:text-[80px] font-900 leading-[0.95] tracking-tight mb-6 max-w-5xl mx-auto">
            Your campus,<br />
            <span className="text-insta-grad">
              finally connected. 💖
            </span>
          </h1>

          <p className={`satoshi text-lg md:text-xl max-w-2xl mx-auto mb-10 font-400 leading-relaxed ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
            Find your study group, discover campus gossip, and match with classmates who share your vibe. Cactus is the cute campus social network built exclusively for your university.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link to={token ? "/feed" : "/auth"} className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-800 cabinet text-base bg-insta-grad text-white hover:brightness-110 active:scale-95 shadow-md">
              <MdSchool className="text-xl" /> {token ? "Open Campus Feed" : "Get Campus Access"}
            </Link>
            <a href="#features" className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-700 cabinet text-base border transition-all active:scale-95 ${dark ? 'border-zinc-800 text-zinc-300 hover:bg-zinc-900' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              See How It Works
            </a>
          </div>

          {/* Floating tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-20">
            {['Vibe Matching 💖', 'Insta-Style Feed 📸', 'Live Chatting 💬', 'Students Only 🔒', 'Heartbeat Alerts 💓'].map(t => (
              <span key={t} className={`hero-float border px-5 py-2.5 rounded-full text-sm font-500 satoshi ${dark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300' : 'bg-white border-slate-50 text-slate-600 shadow-sm'}`}>
                {t}
              </span>
            ))}
          </div>

          {/* Hero visual — mock app (Instagram style) */}
          <div className={`relative mx-auto max-w-5xl rounded-[28px] overflow-hidden border ${dark ? 'bg-zinc-950 border-zinc-900 shadow-xl' : 'bg-white border-slate-50 shadow-md'}`}>
            {/* Fake browser bar */}
            <div className={`flex items-center gap-2 px-5 py-3.5 border-b ${dark ? 'bg-black border-zinc-900' : 'bg-[#FAFBF9] border-slate-200'}`}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <div className={`flex-1 text-center text-xs font-500 satoshi rounded-md mx-8 py-1 ${dark ? 'bg-zinc-900 text-zinc-650' : 'bg-slate-100 text-slate-400'}`}>
                cactus.university.edu
              </div>
            </div>

            {/* App layout */}
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_260px] min-h-[440px]">
              {/* Sidebar */}
              <div className={`hidden md:flex flex-col border-r p-4 gap-1 text-left ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2.5 mb-5 px-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-insta-grad text-white">AK</div>
                  <div>
                    <div className="text-xs font-700 cabinet">Aryan K.</div>
                    <div className={`text-[10px] ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>CS · Year 3</div>
                  </div>
                </div>
                {['🏠 Home', '💬 Messages', '💖 Heartbeats', '👤 My Space'].map((item, i) => (
                  <div key={i} className={`px-3 py-2 rounded-xl text-xs font-700 satoshi cursor-pointer transition-colors ${i === 0 ? 'bg-rose-50 dark:bg-pink-950/20 text-rose-600 dark:text-pink-400' : 'text-slate-500 dark:text-zinc-500 hover:bg-slate-50 dark:hover:bg-zinc-900'}`}>
                    {item}
                  </div>
                ))}
              </div>

              {/* Feed */}
              <div className={`flex flex-col text-left overflow-hidden ${dark ? 'bg-black' : 'bg-[#FAFBF9]'}`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${dark ? 'border-zinc-900' : 'border-slate-100 bg-white'}`}>
                  <span className="font-bold cabinet text-sm text-insta-grad">Daily Gossip Feed</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-rose-500">
                    <span className="w-2 h-2 rounded-full live-dot bg-rose-500" />
                    LIVE
                  </div>
                </div>

                {[
                  { user: 'Meera Nair', role: 'student', time: 'now', post: 'Anyone else applying for the Google Summer Internship? Let\'s form a prep and coffee group! ☕🔥', likes: 34, tag: '🚀 study-prep', avatar: 'MN' },
                  { user: 'Prof. Iyer', role: 'faculty', time: '8m', post: 'Assignment 4 deadline extended to Friday. Submit via portal only.', likes: 112, tag: '📢 notice', avatar: 'PI' },
                ].map((p, i) => (
                  <div key={i} className={`px-5 py-4 border-b bg-white dark:bg-zinc-950 transition-all ${dark ? 'border-zinc-900' : 'border-slate-100'}`}>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-insta-grad text-white">
                        {p.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className="font-700 cabinet text-xs">{p.user}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded-md font-bold uppercase ${dark ? 'bg-zinc-900 text-zinc-500' : 'bg-slate-100 text-slate-400'}`}>{p.role}</span>
                          <span className={`text-[10px] ml-auto ${dark ? 'text-zinc-700' : 'text-slate-400'}`}>{p.time}</span>
                        </div>
                        <div className="text-[10px] font-bold mb-1 text-pink-500 dark:text-pink-400">{p.tag}</div>
                        <p className={`text-xs leading-relaxed satoshi ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>{p.post}</p>
                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 dark:text-zinc-650">
                          <button className="hover:text-rose-500">💖 {p.likes}</button>
                          <button className="hover:text-pink-500">💬 Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right panel */}
              <div className={`hidden md:flex flex-col gap-4 p-4 border-l text-left ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-[#FAFBF9] border-slate-200'}`}>
                {/* Search */}
                <div className={`rounded-xl px-3 py-2.5 flex items-center gap-2 border text-xs ${dark ? 'bg-black border-zinc-900 text-zinc-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                  <MdSearch className="text-sm flex-shrink-0" />
                  <span className="satoshi">find study vibes, gossip, topics...</span>
                </div>

                {/* Suggested */}
                <div>
                  <div className={`text-[9px] font-bold uppercase tracking-widest mb-3 ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>Popular Profiles</div>
                  {['Photography Club', 'Aarav Sharma', 'Ananya Iyer'].map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 py-1.5 border-b last:border-b-0 ${dark ? 'border-zinc-900' : 'border-slate-100'}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-insta-grad text-white">
                        {s[0]}
                      </div>
                      <span className={`text-xs satoshi font-500 flex-1 truncate ${dark ? 'text-zinc-400' : 'text-slate-700'}`}>{s}</span>
                      <button className="text-[10px] font-bold text-rose-500">+</button>
                    </div>
                  ))}
                </div>

                {/* AI Match card */}
                <div className={`rounded-xl p-3 border ${dark ? 'bg-pink-500/5 border-pink-500/10' : 'bg-rose-50/30 border-rose-100'}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-rose-500">
                    ✦ Vibe Match
                  </div>
                  <p className={`text-xs satoshi leading-relaxed ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
                    3 classmates match your vibe in <strong>React + Design</strong>. Say hi?
                  </p>
                  <button className="mt-1.5 text-[11px] font-bold text-pink-500">See Matches 💖</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCROLLING MARQUEE */}
      <div className={`py-5 border-y overflow-hidden ${dark ? 'border-zinc-900 bg-zinc-950/20' : 'border-slate-200 bg-slate-50/50'}`}>
        <div className="marquee-track">
          {[...Array(2)].map((_, r) =>
            ['Daily Gossip Feed 📸', 'Campus Sparks Matching 💖', 'Direct Messaging 💬', 'Strictly College Only 🔒', 'Heartbeat Notifications 💓', 'Instagram Style UI 🌸', 'Sparks Flying ✨', 'Zero Spam Network'].map((t, i) => (
              <span key={`${r}-${i}`} className={`text-xs font-500 satoshi flex-shrink-0 flex items-center gap-3 ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-pink-500" />
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* STATS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SOCIAL_PROOF.map((s, i) => (
            <div key={i} ref={el => cardRefs.current[i] = el} data-idx={i}
              className={`card-reveal feat-card rounded-[20px] p-7 border text-center ${visibleCards.includes(i) ? 'visible' : ''} ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-50 shadow-sm'}`}>
              <div className="text-3xl mb-2 flex justify-center text-rose-500">{s.icon}</div>
              <div className="cabinet text-3xl font-900 mb-1">{s.val}</div>
              <div className={`satoshi text-sm font-400 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className={`py-20 px-6 border-t ${dark ? 'border-zinc-900' : 'border-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className={`text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border inline-block mb-4 ${dark ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>How It Works</span>
            <h2 className="cabinet text-4xl md:text-6xl font-900 leading-tight mb-4">
              Campus social networking<br />built with joy. 💖
            </h2>
            <p className={`satoshi text-base max-w-md mx-auto ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Not another study tool. A place to share daily vibes and sparks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i}
                ref={el => cardRefs.current[i + 4] = el} data-idx={i + 4}
                className={`card-reveal feat-card rounded-[24px] p-7 border text-left ${visibleCards.includes(i + 4) ? 'visible' : ''} ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-50 shadow-sm'}`}>
                <div className="text-3xl mb-4" style={{ color: f.color }}>{f.icon}</div>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: f.color }}>{f.tag}</span>
                <h3 className="cabinet text-xl font-800 mt-2 mb-3">{f.title}</h3>
                <p className={`satoshi text-sm leading-relaxed mb-5 ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>{f.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: `${f.color}15`, color: f.color }}>
                  <MdCheckCircle className="text-sm" /> {f.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="community" className={`py-24 px-6 border-t ${dark ? 'border-zinc-900' : 'border-slate-50'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border inline-block mb-6 bg-pink-50 dark:bg-pink-950/20 text-pink-500 dark:text-pink-400 border-rose-100 dark:border-pink-900/10">Campus Stories</span>
          <h2 className="cabinet text-4xl md:text-5xl font-900 mb-16">
            Classmates making connections
          </h2>

          <div className="relative min-h-[180px]">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={`testi-slide absolute inset-0 flex flex-col items-center transition-all duration-500 ${i === activeTestimonial ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xs font-bold bg-insta-grad text-white mb-4">
                  {t.avatar}
                </div>
                <p className={`satoshi text-lg md:text-xl leading-relaxed max-w-2xl mb-6 font-400 ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>
                  "{t.text}"
                </p>
                <div>
                  <div className="font-800 cabinet">{t.name}</div>
                  <div className={`text-xs satoshi ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>{t.dept}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)}
                className={`rounded-full cursor-pointer transition-all duration-300 ${i === activeTestimonial ? 'w-8 h-2 bg-pink-500' : 'w-2 h-2 bg-slate-200 dark:bg-zinc-800'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta-section" className="py-20 px-6 max-w-7xl mx-auto">
        <div className={`relative grain rounded-[36px] p-12 md:p-20 overflow-hidden text-center border ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-50 shadow-sm'}`}>
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none bg-pink-500/10" />

          <div className="relative z-10">
            <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest mb-8 ${dark ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <span className="w-2 h-2 rounded-full live-dot bg-rose-500" />
              Exclusively for university students
            </div>

            <h2 className="cabinet text-4xl md:text-6xl font-900 leading-tight mb-6">
              Claim your campus spot.<br />
              <span className="text-insta-grad">Join the sparks.</span>
            </h2>
            <p className={`satoshi text-base max-w-md mx-auto mb-10 ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Classmates from CS, MBA, and Robotics are already here. Sign up with your college email.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input value={email} onChange={e => setEmail(e.target.value)}
                className={`flex-1 border rounded-2xl px-5 py-4 text-sm focus:outline-none satoshi ${dark ? 'bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-pink-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-rose-500'}`}
                placeholder="yourname@university.edu" type="email" />
              <button onClick={() => { setSubmitted(true); setEmail(''); }}
                className="px-7 py-4 rounded-2xl font-800 cabinet text-sm whitespace-nowrap cursor-pointer transition-all active:scale-95 bg-insta-grad text-white hover:brightness-110 shadow-sm">
                {submitted ? '✓ You\'re in!' : 'Claim Your Spot'}
              </button>
            </div>

            <p className={`text-xs satoshi mt-5 ${dark ? 'text-zinc-700' : 'text-slate-400'}`}>
              No spam. No data selling. College emails only. 🔒
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={`border-t ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-10 py-14 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs text-left">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Cactus Logo" className="h-8 w-auto object-contain" />
              <span className="cabinet text-xl font-900 text-insta-grad">Cactus</span>
            </div>
            <p className={`satoshi text-sm leading-relaxed ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>
              Private, secure university social network. Where classmates match, chat, and share secret sparks.
            </p>
            <div className={`mt-4 text-xs font-bold px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5 ${dark ? 'border-pink-500/20 text-pink-400 bg-pink-500/5' : 'border-rose-200 text-rose-700 bg-rose-50'}`}>
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-rose-500" /> 5,000+ active classmates
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 text-left">
            {[
              { title: 'Platform', links: ['Post Feed', 'Direct Messages', 'Daily Heartbeats', 'Profiles', 'Vibe Search'] },
              { title: 'Tech Stack', links: ['React 19', 'Express 5', 'Socket.io', 'Mongoose DB', 'Sunset UI'] },
              { title: 'Details', links: ['Privacy', 'Terms', 'Support Help', 'Changelog'] },
            ].map(col => (
              <div key={col.title}>
                <div className="cabinet font-800 text-sm mb-4">{col.title}</div>
                {col.links.map(l => (
                  <a key={l} href="#" className={`block satoshi text-sm mb-2 transition-colors ${dark ? 'text-zinc-600 hover:text-pink-500' : 'text-slate-400 hover:text-rose-600'}`}>{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className={`border-t max-w-7xl mx-auto px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs ${dark ? 'border-zinc-900 text-zinc-700' : 'border-slate-200 text-slate-400'}`}>
          <span className="satoshi">© 2026 Cactus Social. All rights reserved.</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`satoshi font-bold text-sm transition-colors ${dark ? 'text-zinc-600 hover:text-pink-500' : 'text-slate-400 hover:text-rose-600'}`}>Back to top ↑</button>
        </div>
      </footer>
    </div>
  );
}