import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  MdSearch, MdImage, MdGifBox, MdLocationOn, 
  MdMoreHoriz, MdFavorite, MdChatBubble, MdShare
} from 'react-icons/md';

export default function Feed() {
  const { user, logout } = useUser();
  const { theme } = useTheme();
  const [posts, setPosts] = useState([]);
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cursor, setCursor] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Stories states
  const [stories, setStories] = useState([]);
  const [activeGroupIdx, setActiveGroupIdx] = useState(null);
  const [activeItemIdx, setActiveItemIdx] = useState(null);
  const [storyUploading, setStoryUploading] = useState(false);
  const storyFileInputRef = useRef(null);

  const dark = theme === 'dark';

  // Fetch posts and stories on mount
  useEffect(() => {
    fetchPosts();
    fetchStories();
  }, []);

  const fetchPosts = async (loadMore = false) => {
    if (loading) return;
    try {
      setLoading(true);
      const currentCursor = loadMore ? cursor : '';
      const data = await api.posts.getFeed(currentCursor);
      
      if (loadMore) {
        setPosts(prev => [...prev, ...data]);
      } else {
        setPosts(data);
      }

      if (data.length > 0) {
        setCursor(data[data.length - 1].createdAt);
        setHasMore(data.length === 20);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error(err);
      setError("Oops! Couldn't load the campus gossip. 💔");
    } finally {
      setLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const data = await api.stories.getAll();
      setStories(data);
    } catch (err) {
      console.error("Failed to load campus stories:", err);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await api.upload.image(file);
      setUploadedMedia(prev => [...prev, data.url]);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleStoryFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setStoryUploading(true);
      const data = await api.upload.image(file);
      const newStory = await api.stories.create(data.url);
      setStories(prev => [newStory, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Failed to upload story');
    } finally {
      setStoryUploading(false);
    }
  };

  const removeMedia = (idxToRemove) => {
    setUploadedMedia(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && uploadedMedia.length === 0) return;
    if (submitting) return;

    try {
      setSubmitting(true);
      const newPost = await api.posts.createPost(postContent.trim(), uploadedMedia);
      
      const populatedPost = {
        ...newPost,
        authorId: {
          _id: user?._id,
          fullName: user?.fullName || 'Anonymous',
          avatarUrl: user?.avatarUrl,
          role: user?.role || 'student'
        }
      };

      setPosts(prev => [populatedPost, ...prev]);
      setPostContent('');
      setUploadedMedia([]);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return { ...p, likeCount: (p.likeCount || 0) + 1 };
        }
        return p;
      }));

      await api.posts.toggleLike(postId);
    } catch (err) {
      console.error(err);
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return { ...p, likeCount: Math.max(0, (p.likeCount || 1) - 1) };
        }
        return p;
      }));
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (!val.trim()) {
      setIsSearching(false);
      fetchPosts();
      return;
    }

    setIsSearching(true);
    setSearchTimeout(
      setTimeout(async () => {
        try {
          setLoading(true);
          const data = await api.search.posts(val.trim());
          setPosts(data);
          setHasMore(false);
        } catch (err) {
          console.error(err);
          setError('Failed to fetch search results.');
        } finally {
          setLoading(false);
        }
      }, 400)
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchPosts();
  };

  // Helper to group stories by author
  const groupStoriesByAuthor = (flatStories) => {
    const grouped = {};
    flatStories.forEach(story => {
      const author = story.authorId;
      if (!author) return;
      if (!grouped[author._id]) {
        grouped[author._id] = {
          author,
          items: []
        };
      }
      grouped[author._id].items.push(story);
    });
    return Object.values(grouped);
  };

  const groupedStories = groupStoriesByAuthor(stories);

  // Story modal auto-advance timer
  useEffect(() => {
    if (activeGroupIdx === null || activeItemIdx === null) return;

    const currentGroup = groupedStories[activeGroupIdx];
    if (!currentGroup) return;

    const timer = setTimeout(() => {
      if (activeItemIdx < currentGroup.items.length - 1) {
        setActiveItemIdx(activeItemIdx + 1);
      } else {
        if (activeGroupIdx < groupedStories.length - 1) {
          setActiveGroupIdx(activeGroupIdx + 1);
          setActiveItemIdx(0);
        } else {
          setActiveGroupIdx(null);
          setActiveItemIdx(null);
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [activeGroupIdx, activeItemIdx, stories]);

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      
      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 lg:mr-80 pt-20 md:pt-8 px-4 md:px-8 max-w-4xl mx-auto lg:mx-0 pb-20">
        
        {/* Stories Carousel */}
        <div className="flex gap-4 items-center overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {/* Add Story bubble */}
          <div className="flex flex-col items-center shrink-0">
            <div 
              onClick={() => storyFileInputRef.current?.click()}
              className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                dark ? 'border-zinc-800 hover:border-pink-500 bg-zinc-950 text-pink-400' : 'border-slate-200 hover:border-rose-500 bg-white text-rose-500'
              }`}
            >
              {storyUploading ? (
                <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
              ) : (
                <span className="text-xl font-bold">+</span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-bold text-slate-500">My Story</span>
            <input 
              type="file" 
              ref={storyFileInputRef} 
              onChange={handleStoryFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* Grouped stories */}
          {groupedStories.map((group, gIdx) => (
            <div key={group.author._id} className="flex flex-col items-center shrink-0">
              <div 
                onClick={() => {
                  setActiveGroupIdx(gIdx);
                  setActiveItemIdx(0);
                }}
                className={`w-14 h-14 rounded-full overflow-hidden border-2 p-0.5 cursor-pointer transition-all hover:scale-105 ${
                  dark ? 'border-pink-500' : 'border-rose-500 bg-insta-grad'
                }`}
              >
                <img className="w-full h-full object-cover rounded-full" alt="author" src={group.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} />
              </div>
              <span className="text-[10px] mt-1 truncate max-w-[64px] font-medium">{group.author.fullName.split(' ')[0]}</span>
            </div>
          ))}
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative group">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${dark ? 'text-zinc-600 group-focus-within:text-pink-500' : 'text-slate-400 group-focus-within:text-rose-500'}`}>
            <MdSearch className="text-xl" />
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search vibes, topics, or secret notes... ✨"
            className={`w-full focus:ring-0 rounded-2xl pl-12 pr-10 py-3 text-sm transition-all focus:outline-none ${dark ? 'bg-zinc-950 border border-zinc-900 focus:border-pink-500 text-white placeholder-zinc-600' : 'bg-white border border-slate-200 focus:border-rose-500 text-slate-800 placeholder-slate-400 shadow-sm'}`}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className={`absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold uppercase transition-colors ${dark ? 'text-zinc-500 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'}`}
            >
              Clear
            </button>
          )}
        </div>

        {/* Create Post Area */}
        <section className="mb-8">
          <form onSubmit={handleCreatePost} className={`rounded-2xl p-5 border transition-all ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <div className="flex gap-4">
              <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border ${dark ? 'border-zinc-800' : 'border-slate-200'}`}>
                <img className="w-full h-full object-cover" alt="User" src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} />
              </div>
              <div className="flex-1">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className={`w-full bg-transparent border-none focus:ring-0 resize-none h-14 text-base leading-snug outline-none ${dark ? 'text-zinc-200 placeholder:text-zinc-600' : 'text-slate-800 placeholder:text-slate-400'}`} 
                  placeholder="Share your thoughts or campus gossip... 😉"
                ></textarea>
                
                {uploadedMedia.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {uploadedMedia.map((url, idx) => (
                      <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {uploading && (
                  <p className="text-xs text-rose-500 mb-4 animate-pulse">Uploading your photo... 📸</p>
                )}

                <div className={`h-px w-full my-3 ${dark ? 'bg-zinc-900' : 'bg-slate-100'}`}></div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="image/*" 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2 transition-colors cursor-pointer rounded-lg ${dark ? 'text-zinc-400 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'}`}
                    >
                      <MdImage className="text-xl" />
                    </button>
                    <button type="button" className={`p-2 rounded-lg transition-colors ${dark ? 'text-zinc-400 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'}`}><MdGifBox className="text-xl" /></button>
                    <button type="button" className={`p-2 rounded-lg transition-colors ${dark ? 'text-zinc-400 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-slate-50'}`}><MdLocationOn className="text-xl" /></button>
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting || (!postContent.trim() && uploadedMedia.length === 0)}
                    className="px-5 py-2 rounded-xl font-800 text-xs active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none bg-insta-grad text-white shadow-sm cursor-pointer hover:brightness-110"
                  >
                    {submitting ? 'Sharing...' : 'Share Spark'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Feed */}
        <div className="space-y-6">
          {error && (
            <div className={`border p-4 rounded-xl text-sm text-center ${dark ? 'bg-rose-950/20 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
              {error}
            </div>
          )}

          {posts.map((post) => (
            <article key={post._id} className={`group rounded-2xl border overflow-hidden shadow-sm ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200/80'}`}>
              <div className={`flex items-center gap-3 px-5 py-4 border-b ${dark ? 'border-zinc-900' : 'border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-full overflow-hidden border p-0.5 ${dark ? 'border-zinc-800' : 'border-slate-200'}`}>
                  <img 
                    className="w-full h-full object-cover rounded-full" 
                    alt={post.authorId?.fullName || "Author"} 
                    src={post.authorId?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className={`font-bold text-sm ${dark ? 'text-zinc-200' : 'text-slate-800'}`}>{post.authorId?.fullName || "Anonymous"}</h3>
                    <span className={`text-[10px] ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>• {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-pink-400' : 'text-pink-500'}`}>@{post.authorId?.role || "student"}</p>
                </div>
                <button className={`ml-auto ${dark ? 'text-zinc-600 hover:text-zinc-400' : 'text-slate-400 hover:text-slate-600'}`}><MdMoreHoriz className="text-xl" /></button>
              </div>

              <div className="p-5">
                <p className={`text-sm font-normal leading-relaxed ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map(t => (
                      <span key={t} className={`px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-full border ${dark ? 'bg-pink-950/20 text-pink-400 border-pink-900/10' : 'bg-rose-50 text-rose-600 border-rose-100/50'}`}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {post.mediaUrls && post.mediaUrls[0] && (
                <div className={`aspect-video w-full relative overflow-hidden border-y ${dark ? 'bg-zinc-900 border-zinc-900' : 'bg-slate-50 border-slate-100'}`}>
                  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.01]" alt="Post attachment" src={post.mediaUrls[0]} />
                </div>
              )}

              <div className={`flex items-center gap-6 px-5 py-3.5 border-t ${dark ? 'bg-zinc-950/50 border-zinc-900' : 'bg-slate-50/50 border-slate-100'}`}>
                <button 
                  onClick={() => handleLike(post._id)}
                  className={`flex items-center gap-1.5 transition-all group/icon ${dark ? 'text-zinc-400 hover:text-pink-400' : 'text-slate-500 hover:text-rose-600'}`}
                >
                  <MdFavorite className={`text-xl transition-all scale-100 group-hover/icon:scale-110 ${post.likeCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="text-xs font-bold">{post.likeCount || 0}</span>
                </button>
                <button className={`flex items-center gap-1.5 transition-all ${dark ? 'text-zinc-400 hover:text-pink-400' : 'text-slate-500 hover:text-rose-600'}`}>
                  <MdChatBubble className="text-xl" />
                  <span className="text-xs font-bold">{post.commentCount || 0}</span>
                </button>
                <button className={`flex items-center gap-1.5 transition-all ${dark ? 'text-zinc-400 hover:text-pink-400' : 'text-slate-500 hover:text-rose-600'}`}>
                  <MdShare className="text-xl" />
                  <span className="text-xs font-bold">Share</span>
                </button>
              </div>
            </article>
          ))}

          {posts.length === 0 && !loading && (
            <div className={`text-center py-12 ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>
              <p className="text-lg font-bold">No campus vibes found yet. 🌸</p>
              <p className="text-sm">Be the first to share your thoughts above!</p>
            </div>
          )}

          {hasMore && (
            <button 
              onClick={() => fetchPosts(true)}
              disabled={loading}
              className={`w-full py-3 border rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${dark ? 'bg-zinc-900 hover:bg-zinc-800 text-pink-400 border-zinc-800' : 'bg-white hover:bg-slate-50 text-rose-600 border-slate-200 shadow-sm'}`}
            >
              {loading ? "Syncing Feed..." : "Load More Sparks"}
            </button>
          )}
        </div>
      </main>

      {/* Right Panel */}
      <aside className={`hidden lg:flex flex-col w-80 fixed right-0 h-screen py-8 px-8 border-l transition-colors duration-300 ${dark ? 'border-zinc-900 bg-black' : 'border-slate-200 bg-white'}`}>
        <h2 className="text-xs font-black uppercase tracking-widest mb-8 text-insta-grad">Trending Campus Vibes 🔥</h2>
        <div className="space-y-6">
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-tighter mb-1 ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>Top Topic</p>
            <h3 className={`font-bold text-sm ${dark ? 'text-zinc-300' : 'text-slate-800'}`}>#LibraryPrep</h3>
            <p className={`text-xs ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>5.2k sparks this week</p>
          </div>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-tighter mb-1 ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>Campus Event</p>
            <h3 className={`font-bold text-sm ${dark ? 'text-zinc-300' : 'text-slate-800'}`}>Hackathon Team Forming</h3>
            <p className={`text-xs ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>3.1k study buddies talking</p>
          </div>
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-tighter mb-1 ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>Canteen Gossip</p>
            <h3 className={`font-bold text-sm ${dark ? 'text-zinc-300' : 'text-slate-800'}`}>Samosa Price Hike</h3>
            <p className={`text-xs ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>1.8k angry updates</p>
          </div>
        </div>
        
        <div className={`mt-10 rounded-xl p-5 border ${dark ? 'bg-zinc-950 border-zinc-900' : 'bg-rose-50/20 border-rose-100 shadow-sm'}`}>
          <h4 className="text-xs font-bold mb-4 text-rose-500">Popular Profiles ✨</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300">
                <img className="w-full h-full object-cover" alt="User profile" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" />
              </div>
              <div className="text-[11px] flex-1">
                <p className="font-bold">@aarav_sharma</p>
                <p className={`text-[10px] ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Following</p>
              </div>
              <button className={`text-[9px] font-bold border px-2 py-0.5 rounded-full ${dark ? 'text-pink-400 border-pink-500/20 bg-pink-500/5' : 'text-rose-600 border-rose-200 bg-rose-50'}`}>Pro</button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-300">
                <img className="w-full h-full object-cover" alt="User profile" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" />
              </div>
              <div className="text-[11px] flex-1">
                <p className="font-bold">@ananya_iyer</p>
                <p className={`text-[10px] ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Suggested</p>
              </div>
              <button className={`text-[9px] font-bold border px-2.5 py-0.5 rounded-full ${dark ? 'text-zinc-400 border-zinc-800' : 'text-slate-500 border-slate-200'}`}>Follow</button>
            </div>
          </div>
        </div>
        
        <footer className={`mt-auto pt-8 flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-medium ${dark ? 'text-zinc-700' : 'text-slate-400'}`}>
          <a className="hover:text-pink-500 transition-colors" href="#">Privacy</a>
          <a className="hover:text-pink-500 transition-colors" href="#">Terms</a>
          <a className="hover:text-pink-500 transition-colors" href="#">Cookies</a>
          <p>© 2026 Cactus Social</p>
        </footer>
      </aside>

      {/* Story Viewer Modal */}
      {activeGroupIdx !== null && activeItemIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
          {/* Progress bar line at top */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
            {groupedStories[activeGroupIdx]?.items.map((_, i) => (
              <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-[4000ms] ease-linear"
                  style={{
                    width: i < activeItemIdx ? '100%' : i === activeItemIdx ? '100%' : '0%',
                    transitionProperty: i === activeItemIdx ? 'width' : 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header info */}
          <div className="absolute top-8 left-6 right-6 flex items-center justify-between text-white z-50">
            <div className="flex items-center gap-3">
              <img 
                className="w-8 h-8 rounded-full object-cover border border-white/20" 
                alt="author" 
                src={groupedStories[activeGroupIdx]?.author.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
              />
              <div>
                <p className="text-xs font-bold">{groupedStories[activeGroupIdx]?.author.fullName}</p>
                <p className="text-[9px] opacity-60">@{groupedStories[activeGroupIdx]?.author.role}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveGroupIdx(null);
                setActiveItemIdx(null);
              }}
              className="text-white text-xl p-2 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Main Media Image */}
          <div className="w-full max-w-lg aspect-[9/16] relative flex items-center justify-center">
            <img 
              className="w-full h-full object-contain" 
              src={groupedStories[activeGroupIdx]?.items[activeItemIdx]?.mediaUrl} 
              alt="Story Content" 
            />

            {/* Left and Right click target hotspots */}
            <div 
              onClick={() => {
                if (activeItemIdx > 0) {
                  setActiveItemIdx(activeItemIdx - 1);
                } else if (activeGroupIdx > 0) {
                  setActiveGroupIdx(activeGroupIdx - 1);
                  setActiveItemIdx(groupedStories[activeGroupIdx - 1].items.length - 1);
                }
              }}
              className="absolute left-0 top-0 bottom-0 w-1/4 cursor-pointer"
            />
            <div 
              onClick={() => {
                const currentGroup = groupedStories[activeGroupIdx];
                if (activeItemIdx < currentGroup.items.length - 1) {
                  setActiveItemIdx(activeItemIdx + 1);
                } else if (activeGroupIdx < groupedStories.length - 1) {
                  setActiveGroupIdx(activeGroupIdx + 1);
                  setActiveItemIdx(0);
                } else {
                  setActiveGroupIdx(null);
                  setActiveItemIdx(null);
                }
              }}
              className="absolute right-0 top-0 bottom-0 w-1/4 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
