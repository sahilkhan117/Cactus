import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  MdNotifications, MdFavorite, MdChatBubble, MdBookmark
} from 'react-icons/md';

export default function Alerts() {
  const { logout } = useUser();
  const socket = useSocket();
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dark = theme === 'dark';

  // Fetch notifications on mount
  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);
        const data = await api.notifications.getNotifications();
        setAlerts(data);
        
        // Mark all as read after fetching
        await api.notifications.markAsRead();
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      setAlerts(prev => [notification, ...prev]);
      
      // Auto mark as read since user is actively viewing this page
      api.notifications.markAsRead().catch(console.error);
    });

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const getAlertConfig = (type) => {
    switch (type) {
      case 'LIKE':
        return {
          icon: <MdFavorite className="text-rose-500 text-lg" />,
          text: 'sent a heartbeat to your post! 💓'
        };
      case 'COMMENT':
        return {
          icon: <MdChatBubble className="text-violet-500 text-lg" />,
          text: 'commented on your post. 💬'
        };
      case 'MENTION':
        return {
          icon: <MdBookmark className="text-amber-500 text-lg" />,
          text: 'mentioned you in a sweet note. 📝'
        };
      default:
        return {
          icon: <MdNotifications className="text-pink-500 text-lg" />,
          text: 'sent you a notice.'
        };
    }
  };

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      <main className="flex-1 pt-20 md:pt-12 px-6 md:px-12 max-w-4xl mx-auto md:mx-0 pb-20 md:pb-0">
        <header className="mb-10">
          <h1 className="cabinet text-2xl font-900 tracking-tight text-insta-grad uppercase">Daily Heartbeats 💖</h1>
          <p className={`text-xs mt-1 satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>See who's interacting with your posts and vibe tags.</p>
        </header>

        <section className="space-y-3 max-w-xl">
          {loading && (
            <div className={`text-center py-12 text-xs ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Syncing heartbeats... ✨</div>
          )}

          {alerts.map(a => {
            const config = getAlertConfig(a.type);
            const senderName = a.senderId?.fullName || 'Someone';
            const avatarUrl = a.senderId?.avatarUrl;
            
            return (
              <div key={a._id} className={`border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${
                a.isRead 
                  ? (dark ? 'bg-zinc-950/40 border-zinc-900 text-zinc-400' : 'bg-slate-100/50 border-slate-200 text-slate-500') 
                  : (dark ? 'bg-zinc-900 border-pink-500/20 text-zinc-200 shadow-sm' : 'bg-white border-rose-200 shadow-sm text-slate-800')
              }`}>
                <Link to={a.senderId?._id ? `/profile/${a.senderId._id}` : '#'} className={`w-9 h-9 rounded-full overflow-hidden border shrink-0 ${dark ? 'border-zinc-800' : 'border-slate-200'} cursor-pointer hover:opacity-80 transition-all`}>
                  <img className="w-full h-full object-cover" alt="Sender avatar" src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} />
                </Link>
                <div className="flex-grow min-w-0">
                  <p className="text-sm leading-normal">
                    <Link to={a.senderId?._id ? `/profile/${a.senderId._id}` : '#'} className="font-bold mr-1 hover:text-pink-500 transition-colors">{senderName}</Link>
                    {config.text}
                  </p>
                  <span className={`text-[9px] block mt-1 ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-slate-50 border-slate-250'}`}>
                  {config.icon}
                </div>
              </div>
            );
          })}

          {alerts.length === 0 && !loading && (
            <div className={`text-center py-16 ${dark ? 'text-zinc-750' : 'text-slate-350'}`}>
              <div className="w-16 h-16 rounded-full border border-dashed border-current flex items-center justify-center mx-auto mb-4">
                <MdNotifications className="text-3xl" />
              </div>
              <p className="text-sm font-bold tracking-wider uppercase text-insta-grad">No heartbeats logged</p>
              <p className="text-xs mt-1">Get active on the feed to start receiving reactions!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
