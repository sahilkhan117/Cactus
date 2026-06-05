import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  MdChat, MdSend, MdArrowBack, MdFavorite, MdCameraAlt, MdClose
} from 'react-icons/md';

export default function Chat() {
  const { user, logout } = useUser();
  const socket = useSocket();
  const { theme } = useTheme();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [uploadingInstant, setUploadingInstant] = useState(false);
  const [viewingInstant, setViewingInstant] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const instantInputRef = useRef(null);
  const dark = theme === 'dark';

  // Scroll messages list to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  // Load conversations
  useEffect(() => {
    async function loadConversations() {
      try {
        setLoadingConvs(true);
        const data = await api.chat.getConversations();
        setConversations(data);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConvs(false);
      }
    }
    loadConversations();
  }, []);

  // Socket event hookups
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('receive_message', (msg) => {
      // If message belongs to current active conversation, append it
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
        // Clear typing indicator
        setTypingUser(null);
      }

      // Update conversations last message preview
      setConversations(prev => prev.map(c => {
        if (c._id === msg.conversationId) {
          return { ...c, lastMessageAt: msg.createdAt };
        }
        return c;
      }));
    });

    // Listen for typing indicator
    socket.on('typing_indicator', (typingId) => {
      if (activeConv) {
        const otherParticipant = activeConv.participants.find(p => p._id !== user._id);
        if (otherParticipant && otherParticipant._id === typingId) {
          setTypingUser(otherParticipant.fullName);
          
          // Clear typing indicator after 3 seconds of no typing activity
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUser(null);
          }, 3000);
        }
      }
    });

    // Listen for conversation notifications
    socket.on('new_conversation', async (data) => {
      // Reload conversations list
      try {
        const updated = await api.chat.getConversations();
        setConversations(updated);
      } catch (err) {
        console.error(err);
      }
    });

    // Listen for instant viewed notification
    socket.on('instant_viewed', ({ messageId, conversationId }) => {
      if (activeConv && conversationId === activeConv._id) {
        setMessages(prev => prev.map(m => {
          if (m._id === messageId) {
            return { ...m, instantViewed: true, instantMediaUrl: '' };
          }
          return m;
        }));
      }
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_indicator');
      socket.off('new_conversation');
      socket.off('instant_viewed');
    };
  }, [socket, activeConv, user]);

  // Handle selecting a conversation
  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setMessages([]);
    setTypingUser(null);

    // Join socket room
    if (socket) {
      socket.emit('join_room', conv._id);
    }

    try {
      setLoadingMsgs(true);
      const data = await api.chat.getMessages(conv._id);
      // Reverse messages list because they are fetched sorted from newest first
      setMessages(data.reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !socket) return;

    const otherParticipant = activeConv.participants.find(p => p._id !== user._id);
    if (!otherParticipant) return;

    // Send via socket
    socket.emit('send_message', {
      conversationId: activeConv._id,
      receiverId: otherParticipant._id,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  // Handle sending an Instant (Snapchat style single-view photo)
  const handleSendInstant = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv || !socket) return;

    const otherParticipant = activeConv.participants.find(p => p._id !== user._id);
    if (!otherParticipant) return;

    try {
      setUploadingInstant(true);
      const data = await api.upload.image(file);

      // Emit send_message with isInstant: true and instantMediaUrl
      socket.emit('send_message', {
        conversationId: activeConv._id,
        receiverId: otherParticipant._id,
        content: '📸 Sent an Instant photo',
        isInstant: true,
        instantMediaUrl: data.url
      });

      if (instantInputRef.current) {
        instantInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to upload and send Instant:', err);
      alert('Failed to send Instant photo. Please try again.');
    } finally {
      setUploadingInstant(false);
    }
  };

  // Close the Instant viewer modal and notify server to self-destruct
  const closeInstant = () => {
    if (!viewingInstant || !socket) return;

    // Notify server to wipe the image URL for privacy
    socket.emit('view_instant', {
      messageId: viewingInstant.messageId,
      conversationId: viewingInstant.conversationId
    });

    // Optimistically update locally
    setMessages(prev => prev.map(m => {
      if (m._id === viewingInstant.messageId) {
        return { ...m, instantViewed: true, instantMediaUrl: '' };
      }
      return m;
    }));

    setViewingInstant(null);
  };

  // Emit typing start
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !activeConv) return;

    socket.emit('typing_start', activeConv._id);
  };

  return (
    <div className={`flex-1 md:ml-64 flex h-screen overflow-hidden pt-16 md:pt-0 pb-16 md:pb-0 ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      {/* Conversations Column */}
      <section className={`w-full md:w-80 border-r flex flex-col transition-colors ${activeConv ? 'hidden md:flex' : 'flex'} ${dark ? 'border-zinc-900 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
        <div className={`p-6 border-b flex items-center justify-between ${dark ? 'border-zinc-900' : 'border-slate-100'}`}>
          <h1 className="text-base font-bold cabinet tracking-tight text-insta-grad">Direct Messages 💌</h1>
        </div>
        
        <div className={`flex-1 overflow-y-auto divide-y ${dark ? 'divide-zinc-900' : 'divide-slate-100'}`}>
          {loadingConvs && (
            <div className={`p-6 text-center text-xs ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Syncing your chats... ✨</div>
          )}
          
          {conversations.length === 0 && !loadingConvs && (
            <div className={`p-6 text-center text-xs ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>No active chats yet. Visit a classmate's profile to say hi! 👋</div>
          )}

          {conversations.map((conv) => {
            const other = conv.participants.find(p => p._id !== user?._id) || { fullName: 'Unknown User' };
            const isActive = activeConv?._id === conv._id;
            
            return (
              <button 
                key={conv._id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left p-4 flex items-center gap-4 transition-colors cursor-pointer ${isActive ? (dark ? 'bg-zinc-900 text-white' : 'bg-rose-50 text-slate-900') : (dark ? 'hover:bg-zinc-900/50 text-zinc-400' : 'hover:bg-slate-50 text-slate-600')}`}
              >
                <div className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${dark ? 'border-zinc-800' : 'border-slate-200'}`}>
                  <img className="w-full h-full object-cover" alt={other.fullName} src={other.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate">{other.fullName}</h3>
                  <p className={`text-xs truncate ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Click to open chat</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Message Thread Column */}
      <section className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex items-center justify-center' : 'flex'} ${dark ? 'bg-black' : 'bg-[#FAFBF9]'}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className={`h-16 px-6 border-b flex items-center gap-4 ${dark ? 'border-zinc-900 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
              <button 
                onClick={() => setActiveConv(null)}
                className={`md:hidden p-2 rounded-lg cursor-pointer ${dark ? 'text-pink-400 hover:bg-zinc-900' : 'text-rose-600 hover:bg-slate-100'}`}
              >
                <MdArrowBack className="text-xl" />
              </button>
              <div className={`w-8 h-8 rounded-full overflow-hidden border ${dark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <img className="w-full h-full object-cover" alt="Recipient" src={activeConv.participants.find(p => p._id !== user?._id)?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'} />
              </div>
              <div>
                <h2 className="font-bold text-sm">{activeConv.participants.find(p => p._id !== user?._id)?.fullName}</h2>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-pink-400' : 'text-rose-500'}`}>
                  {typingUser ? `${typingUser} is typing...` : 'Active direct chat 💬'}
                </p>
              </div>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMsgs && (
                <div className={`text-center text-xs py-4 ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Syncing chat history... ✨</div>
              )}

              {messages.map((msg, index) => {
                const isMe = msg.senderId === user?._id;
                const isInstant = msg.isInstant;
                return (
                  <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isMe 
                        ? (isInstant ? 'bg-pink-600 text-white rounded-tr-none shadow-sm border border-pink-500' : 'bg-insta-grad text-white rounded-tr-none shadow-sm')
                        : (dark ? 'bg-zinc-900 text-zinc-100 border border-zinc-850 rounded-tl-none' : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-sm')
                    }`}>
                      {isInstant ? (
                        <div className="flex flex-col gap-2">
                          {msg.instantViewed ? (
                            <div className="flex items-center gap-2 text-white/70 font-medium">
                              <span>Opened 📤</span>
                            </div>
                          ) : isMe ? (
                            <div className="flex items-center gap-2 text-white/80 font-medium">
                              <span>Sent Instant 📸</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setViewingInstant({ messageId: msg._id, mediaUrl: msg.instantMediaUrl, conversationId: activeConv._id })}
                              className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer animate-pulse border-none"
                            >
                              <span>Tap to view Instant 📸</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                      <div className={`text-[8px] text-right mt-1 ${isMe ? 'text-white/60' : 'text-slate-450 dark:text-zinc-500'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${dark ? 'border-zinc-900 bg-zinc-950' : 'border-slate-200 bg-white'}`}>
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => instantInputRef.current?.click()}
                  disabled={uploadingInstant}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all bg-pink-500 hover:bg-pink-600 text-white shadow-sm shrink-0 border-none disabled:opacity-50`}
                  title="Send Instant Photo 📸"
                >
                  {uploadingInstant ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MdCameraAlt className="text-xl" />
                  )}
                </button>
                <input 
                  type="file"
                  ref={instantInputRef}
                  onChange={handleSendInstant}
                  accept="image/*"
                  className="hidden"
                />
                <input 
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Say hi to your study buddy... 💬"
                  className={`flex-1 border focus:ring-0 rounded-2xl px-5 py-3 text-sm focus:outline-none ${dark ? 'bg-zinc-900 border-zinc-800 focus:border-pink-500 text-white placeholder-zinc-600' : 'bg-slate-50 border-slate-300 focus:border-rose-500 text-slate-800 placeholder-slate-400'}`}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all disabled:opacity-50 bg-insta-grad text-white shadow-sm hover:brightness-110 shrink-0 border-none"
                >
                  <MdSend className="text-lg" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={`flex flex-col items-center gap-4 p-8 text-center ${dark ? 'text-zinc-700' : 'text-slate-300'}`}>
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <MdChat className="text-4xl animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide uppercase text-insta-grad">Your Direct Messages 💌</p>
              <p className={`text-xs mt-1.5 max-w-xs leading-relaxed ${dark ? 'text-zinc-650' : 'text-slate-450'}`}>Send private messages and secret sparks to a classmate by visiting their profile.</p>
            </div>
          </div>
        )}
      </section>

      {/* Instant Viewer Modal */}
      {viewingInstant && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <button 
            type="button"
            onClick={closeInstant}
            className="absolute top-6 right-6 text-white hover:text-pink-500 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer border-none"
            title="Close and Self-Destruct"
          >
            <MdClose className="text-2xl" />
          </button>
          
          <div className="max-w-full max-h-[80vh] relative flex flex-col items-center">
            <img 
              src={viewingInstant.mediaUrl} 
              alt="Instant Message" 
              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl border border-zinc-800"
            />
            <p className="text-zinc-400 text-xs mt-6 font-bold uppercase tracking-widest animate-pulse">
              Single-view photo — self-destructs on close 🛡️
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
