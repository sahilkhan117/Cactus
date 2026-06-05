import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { triggerSpark } from '../services/spark';
import { 
  MdSearch, MdImage, MdGifBox, MdLocationOn, 
  MdMoreHoriz, MdFavorite, MdChatBubble, MdShare
} from 'react-icons/md';

export default function Feed() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
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

  // Comment states
  const [expandedComments, setExpandedComments] = useState({});
  const [postComments, setPostComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});

  // Dynamic Right Panel states
  const [votedOption, setVotedOption] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [showMatchCelebration, setShowMatchCelebration] = useState(false);

  // Polls states
  const [polls, setPolls] = useState([]);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  useEffect(() => {
    const handleToggleWidgets = () => {
      setIsMobilePanelOpen(prev => !prev);
    };
    window.addEventListener('toggle-widgets', handleToggleWidgets);
    return () => window.removeEventListener('toggle-widgets', handleToggleWidgets);
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      const uniqueAuthors = [];
      const seen = new Set();
      posts.forEach(p => {
        const author = p.authorId;
        if (author && author._id !== user?._id && !seen.has(author._id)) {
          seen.add(author._id);
          uniqueAuthors.push(author);
        }
      });
      setCandidates(uniqueAuthors);
    }
  }, [posts, user]);

  const dark = theme === 'dark';

  // Fetch posts and stories on mount
  useEffect(() => {
    fetchPosts();
    fetchStories();
    fetchPolls();
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

  // Comment Handlers
  const toggleComments = async (postId) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments(prev => ({ ...prev, [postId]: !isExpanded }));

    if (!isExpanded && !postComments[postId]) {
      try {
        setLoadingComments(prev => ({ ...prev, [postId]: true }));
        const commentsData = await api.comments.getComments(postId);
        setPostComments(prev => ({ ...prev, [postId]: commentsData }));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(prev => ({ ...prev, [postId]: false }));
      }
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    try {
      const newComment = await api.comments.createComment(postId, content);
      const populatedComment = {
        ...newComment,
        authorId: {
          _id: user?._id,
          fullName: user?.fullName || 'Anonymous',
          avatarUrl: user?.avatarUrl,
          role: user?.role || 'student'
        }
      };

      setPostComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), populatedComment]
      }));

      setCommentInputs(prev => ({ ...prev, [postId]: '' }));

      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          return { ...p, commentCount: (p.commentCount || 0) + 1 };
        }
        return p;
      }));
    } catch (err) {
      console.error(err);
      alert('Failed to submit comment');
    }
  };

  const handleVote = (e, option) => {
    setVotedOption(option);
    triggerSpark(e, '🔥');
  };

  const handleMatch = (e) => {
    triggerSpark(e, '🎉');
    setShowMatchCelebration(true);
  };

  const handleNextCandidate = () => {
    setShowMatchCelebration(false);
    setCandidateIdx(prev => (prev + 1) % candidates.length);
  };

  const fetchPolls = async () => {
    try {
      setPollsLoading(true);
      const data = await api.polls.getAll();
      setPolls(data);
    } catch (err) {
      console.error("Failed to fetch polls:", err);
    } finally {
      setPollsLoading(false);
    }
  };

  const handlePollVote = async (e, pollId, optionIndex) => {
    try {
      triggerSpark(e, '⚡');
      const updatedPoll = await api.polls.vote(pollId, optionIndex);
      setPolls(prev => prev.map(p => p._id === pollId ? updatedPoll : p));
    } catch (err) {
      console.error("Failed to vote:", err);
      alert(err.message || "Failed to submit vote");
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const cleanOptions = pollOptions.filter(o => o.trim() !== '');
    if (!pollQuestion.trim() || cleanOptions.length < 2) {
      alert("Please provide a question and at least 2 options.");
      return;
    }
    try {
      const newPoll = await api.polls.create(pollQuestion.trim(), cleanOptions);
      setPolls(prev => [newPoll, ...prev]);
      setIsPollModalOpen(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    } catch (err) {
      console.error("Failed to create poll:", err);
      alert(err.message || "Failed to create poll");
    }
  };

  // Get the most popular poll (highest total votes) or latest poll for right sidebar Hot Take
  const hotTakePoll = polls.length > 0 
    ? [...polls].sort((a, b) => {
        const aVotes = a.options.reduce((sum, o) => sum + o.votes.length, 0);
        const bVotes = b.options.reduce((sum, o) => sum + o.votes.length, 0);
        return bVotes - aVotes;
      })[0]
    : null;

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      
      {/* Main Content Canvas */}
      <main className="flex-1 lg:mr-80 pt-20 md:pt-8 px-4 md:px-8 max-w-5xl mx-auto lg:mx-0 pb-20">
        
        {/* Stories Carousel */}
        <div className="flex gap-4 items-center overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {/* Add Story bubble */}
          <div className="flex flex-col items-center shrink-0">
            <div 
              onClick={() => storyFileInputRef.current?.click()}
              className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                dark ? 'border-zinc-800 hover:border-pink-500 bg-zinc-950 text-pink-400' : 'border-slate-200 hover:border-rose-500 bg-white text-rose-50 text-rose-500'
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
            <article key={post._id} className={`group rounded-2xl border overflow-hidden transition-all duration-200 ${dark ? 'bg-zinc-950 border-zinc-900 hover:border-zinc-800' : 'bg-white border-slate-200/80 hover:border-slate-300/80 hover:shadow-md shadow-sm'}`}>

              {/* HEADER */}
              <div className={`flex items-center gap-3.5 px-5 py-4`}>
                <Link to={post.authorId?._id ? `/profile/${post.authorId._id}` : '#'} className="flex-shrink-0">
                  <img
                    className={`w-10 h-10 rounded-full object-cover ring-2 ring-offset-2 transition-opacity hover:opacity-85 ${dark ? 'ring-zinc-800 ring-offset-zinc-950' : 'ring-slate-200 ring-offset-white'}`}
                    alt={post.authorId?.fullName || "Author"}
                    src={post.authorId?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={post.authorId?._id ? `/profile/${post.authorId._id}` : '#'} className={`font-bold text-sm leading-none hover:text-pink-500 transition-colors truncate ${dark ? 'text-zinc-100' : 'text-slate-800'}`}>
                      {post.authorId?.fullName || "Anonymous"}
                    </Link>
                    <span className={`text-[11px] flex-shrink-0 ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className={`text-[11px] font-bold uppercase tracking-widest mt-0.5 ${dark ? 'text-pink-400' : 'text-pink-500'}`}>
                    @{post.authorId?.role || "student"}
                  </p>
                </div>
                <button className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${dark ? 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
                  <MdMoreHoriz className="text-xl" />
                </button>
              </div>

              {/* MEDIA — above text if present */}
              {post.mediaUrls && post.mediaUrls[0] && (
                <div className="w-full aspect-video overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                    alt="Post attachment"
                    src={post.mediaUrls[0]}
                  />
                </div>
              )}

              {/* BODY */}
              <div className="px-5 pt-4 pb-3">
                <p className={`text-sm leading-relaxed ${dark ? 'text-zinc-300' : 'text-slate-700'}`}>{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.map(t => (
                      <span key={t} className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border cursor-pointer transition-colors ${dark ? 'bg-pink-950/20 text-pink-400 border-pink-900/20 hover:bg-pink-950/40' : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100'}`}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BAR */}
              <div className={`flex items-center gap-1 px-4 py-2.5 border-t ${dark ? 'border-zinc-900' : 'border-slate-100'}`}>
                <button
                  onClick={(e) => { handleLike(post._id); triggerSpark(e, '❤️'); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95 ${post.likeCount > 0 ? 'text-rose-500' : (dark ? 'text-zinc-500 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50')}`}
                >
                  <MdFavorite className="text-base" />
                  <span>{post.likeCount || 0}</span>
                </button>

                <button
                  onClick={() => toggleComments(post._id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95 ${dark ? 'text-zinc-500 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}
                >
                  <MdChatBubble className="text-base" />
                  <span>{post.commentCount || 0}</span>
                </button>

                {/* <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95 ${dark ? 'text-zinc-500 hover:text-pink-400 hover:bg-zinc-900' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'}`}>
                  <MdShare className="text-base" />
                  <span>Share</span>
                </button> */}
              </div>

              {/* COMMENTS */}
              {expandedComments[post._id] && (
                <div className={`border-t ${dark ? 'bg-zinc-950/60 border-zinc-900' : 'bg-slate-50/60 border-slate-100'}`}>

                  {/* Comments list */}
                  <div className="px-5 pt-4 space-y-4">
                    {loadingComments[post._id] ? (
                      <div className={`text-center py-3 text-xs ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>Loading comments...</div>
                    ) : (postComments[post._id] || []).length === 0 ? (
                      <div className={`text-center py-3 text-xs ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>No comments yet — be the first 🌸</div>
                    ) : (
                      (postComments[post._id] || []).map((comm) => (
                        <div key={comm._id} className="flex gap-3">
                          <Link to={comm.authorId?._id ? `/profile/${comm.authorId._id}` : '#'} className="flex-shrink-0">
                            <img
                              className={`w-7 h-7 rounded-full object-cover ring-1 ${dark ? 'ring-zinc-800' : 'ring-slate-200'}`}
                              alt="Commenter avatar"
                              src={comm.authorId?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80'}
                            />
                          </Link>
                          <div className={`flex-1 min-w-0 rounded-xl px-3.5 py-2.5 ${dark ? 'bg-zinc-900/70' : 'bg-white border border-slate-100'}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <Link to={comm.authorId?._id ? `/profile/${comm.authorId._id}` : '#'} className={`font-bold text-xs hover:text-pink-500 transition-colors ${dark ? 'text-zinc-200' : 'text-slate-700'}`}>
                                {comm.authorId?.fullName || 'Anonymous'}
                              </Link>
                              <span className={`text-[9px] ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>
                                {new Date(comm.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${dark ? 'text-zinc-400' : 'text-slate-600'}`}>{comm.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment input */}
                  <form onSubmit={(e) => handleAddComment(e, post._id)} className="flex items-center gap-2.5 px-5 py-4">
                    <input
                      type="text"
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className={`flex-1 rounded-xl px-4 py-2.5 text-xs border focus:outline-none transition-colors ${dark ? 'bg-zinc-900 border-zinc-800 focus:border-pink-500/60 text-white placeholder-zinc-600' : 'bg-white border-slate-200 focus:border-rose-300 text-slate-800 placeholder-slate-400'}`}
                    />
                    <button
                      type="submit"
                      disabled={!commentInputs[post._id]?.trim()}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none bg-insta-grad text-white hover:brightness-110 flex-shrink-0"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}
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

      <aside className={`
        fixed right-0 h-screen border-l transition-all duration-300 overflow-y-auto pb-32
        ${dark ? 'border-zinc-900 bg-black/95 text-[#e0e3de]' : 'border-slate-200 bg-white/95 text-slate-800'}
        ${isMobilePanelOpen 
          ? 'flex flex-col w-80 z-50 pt-20 px-6 top-0 backdrop-blur-md shadow-2xl' 
          : 'hidden lg:flex flex-col w-80 py-8 px-8 top-0'
        }
      `}>
        
        {/* Mobile Close Button */}
        {isMobilePanelOpen && (
          <button
            onClick={() => setIsMobilePanelOpen(false)}
            className="lg:hidden self-end mb-4 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors border-none bg-transparent cursor-pointer"
          >
            ✕ Close
          </button>
        )}
        
        {/* Create Campus Poll Button */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-insta-grad">Campus Debate 🗳️</h2>
          <button
            type="button"
            onClick={() => setIsPollModalOpen(true)}
            className="w-full py-3.5 rounded-xl font-bold text-xs bg-insta-grad text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none flex items-center justify-center gap-2 shadow-md"
          >
            <span>+</span> Create Campus Poll
          </button>
        </div>

        {/* Campus Polls List */}
        <div className="mb-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-insta-grad">Active Polls 📊</h2>
          {pollsLoading ? (
            <div className={`text-center py-6 text-xs ${dark ? 'text-zinc-700' : 'text-slate-400'}`}>Loading polls... ⏳</div>
          ) : polls.length === 0 ? (
            <div className={`text-center py-6 text-xs ${dark ? 'text-zinc-600' : 'text-slate-400'}`}>No campus polls active. Be the first to ask! 🌸</div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
                const hasVoted = poll.options.some(opt => opt.votes.includes(user?._id));
                
                return (
                  <div key={poll._id} className={`p-4 rounded-xl border transition-all ${dark ? 'bg-zinc-950 border-zinc-900 hover:border-pink-500/20' : 'bg-slate-50/50 border-slate-100 hover:border-rose-300'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <img 
                        className="w-4 h-4 rounded-full object-cover border border-slate-200"
                        src={poll.creatorId?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"}
                        alt={poll.creatorId?.fullName || "Anonymous"}
                      />
                      <span className={`text-[9px] font-bold ${dark ? 'text-zinc-500' : 'text-slate-500'}`}>{poll.creatorId?.fullName || "Anonymous"}</span>
                    </div>
                    <p className={`text-[11px] font-bold mb-2 ${dark ? 'text-zinc-200' : 'text-slate-800'}`}>{poll.question}</p>
                    
                    <div className="space-y-1.5">
                      {poll.options.map((option, oIdx) => {
                        const isSelected = option.votes.includes(user?._id);
                        const percent = totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0;
                        
                        return (
                          <button
                            key={oIdx}
                            onClick={(e) => handlePollVote(e, poll._id, oIdx)}
                            className={`w-full relative text-left py-1.5 px-2.5 border rounded-lg text-[9px] font-bold overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                              isSelected
                                ? (dark ? 'border-pink-500 text-pink-400 bg-pink-500/10' : 'border-rose-500 text-rose-600 bg-rose-500/10')
                                : (dark ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-pink-500/30' : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300')
                            }`}
                          >
                            <div 
                              className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                                isSelected
                                  ? (dark ? 'bg-pink-500/20' : 'bg-rose-500/20')
                                  : (dark ? 'bg-zinc-850/60' : 'bg-slate-100/70')
                              }`}
                              style={{ width: `${percent}%`, zIndex: 0 }}
                            />
                            
                            <div className="flex justify-between relative z-10">
                              <span>{option.text}</span>
                              <span>{percent}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className={`text-[8px] text-right mt-1.5 ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>{totalVotes} votes</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Vibe Matcher Game */}
        <div className="mt-8">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4 text-insta-grad">Campus Vibe Matcher ✦</h2>
          {candidates.length > 0 ? (
            (() => {
              const candidate = candidates[candidateIdx];
              return (
                <div className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                  showMatchCelebration 
                    ? (dark ? 'bg-pink-950/20 border-pink-500/30' : 'bg-rose-50 border-rose-200')
                    : (dark ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-slate-200 shadow-sm')
                }`}>
                  {showMatchCelebration ? (
                    <div className="text-center py-4 space-y-4">
                      <div className="text-4xl animate-bounce">🎉</div>
                      <div>
                        <p className="font-extrabold text-sm text-insta-grad leading-tight">It's a Vibe Match!</p>
                        <p className={`text-[10px] mt-1 ${dark ? 'text-zinc-400' : 'text-slate-500'}`}>You and {candidate.fullName.split(' ')[0]} share matching campus sparks.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => navigate('/chat', { state: { startChatWith: candidate } })}
                          className="w-full py-2 rounded-lg font-bold text-xs bg-insta-grad text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                        >
                          Chat with {candidate.fullName.split(' ')[0]} 💬
                        </button>
                        <button 
                          onClick={handleNextCandidate}
                          className={`w-full py-2 rounded-lg font-bold text-xs border transition-all active:scale-95 cursor-pointer ${
                            dark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900' : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                          }`}
                        >
                          Next Profile ➡️
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-12 h-12 rounded-full overflow-hidden border p-0.5 shrink-0 ${dark ? 'border-zinc-800' : 'border-slate-200'}`}>
                          <img className="w-full h-full object-cover rounded-full" src={candidate.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} alt={candidate.fullName} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/profile/${candidate._id}`} className={`font-bold text-xs truncate hover:text-pink-500 transition-colors block ${dark ? 'text-zinc-200' : 'text-slate-800'}`}>
                            {candidate.fullName}
                          </Link>
                          <p className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-pink-400' : 'text-rose-600'}`}>
                            @{candidate.role || 'student'}
                          </p>
                        </div>
                      </div>
                      <p className={`text-[11px] leading-relaxed italic text-left ${dark ? 'text-zinc-450' : 'text-slate-500'}`}>
                        "{candidate.bio || 'Sharing creative campus sparks and project updates.'}"
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleNextCandidate}
                          className={`flex-1 py-1.5 rounded-lg font-bold text-[10px] border transition-all active:scale-95 cursor-pointer ${
                            dark ? 'border-zinc-800 text-zinc-400 hover:bg-zinc-900' : 'border-slate-200 text-slate-650 hover:bg-slate-50'
                          }`}
                        >
                          Pass ➡️
                        </button>
                        <button 
                          onClick={handleMatch}
                          className="flex-1 py-1.5 rounded-lg font-bold text-[10px] bg-insta-grad text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
                        >
                          Match 💖
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className={`p-4 rounded-xl border text-center text-xs py-6 ${dark ? 'bg-zinc-950 border-zinc-900 text-zinc-600' : 'bg-white border-slate-200 text-slate-400'}`}>
              Looking for more classmates... ✨
            </div>
          )}
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

          {/* Story Quick Reactions */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
            {['❤️', '🔥', '😂', '👏', '🎉', '😮'].map(emoji => (
              <button
                key={emoji}
                onClick={(e) => triggerSpark(e, emoji)}
                className="text-2xl p-2.5 rounded-full bg-white/10 hover:bg-white/20 hover:scale-110 active:scale-90 transition-all cursor-pointer backdrop-blur-md border-none"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Create Poll Modal */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreatePoll}
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              dark ? 'bg-zinc-950 border-zinc-900 text-white shadow-pink-500/5' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}
          >
            <h3 className="text-base font-black uppercase tracking-wider mb-4 text-insta-grad">Create Campus Poll 🗳️</h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Poll Question</label>
                <input 
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Best coffee spot near campus?"
                  className={`w-full focus:ring-0 rounded-xl px-4 py-2.5 text-xs transition-all focus:outline-none ${
                    dark ? 'bg-zinc-900 border border-zinc-800 focus:border-pink-500 text-white placeholder-zinc-700' : 'bg-slate-50 border border-slate-200 focus:border-rose-500 text-slate-800 placeholder-slate-405'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Options</label>
                <div className="space-y-2">
                  {pollOptions.map((option, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text"
                        required={idx < 2}
                        value={option}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className={`flex-1 focus:ring-0 rounded-xl px-4 py-2 text-xs transition-all focus:outline-none ${
                          dark ? 'bg-zinc-900 border border-zinc-800 focus:border-pink-500 text-white placeholder-zinc-700' : 'bg-slate-50 border border-slate-200 focus:border-rose-500 text-slate-800 placeholder-slate-405'
                        }`}
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                          className={`text-xs hover:text-rose-500 p-1.5 transition-colors ${dark ? 'text-zinc-650' : 'text-slate-400'}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions(prev => [...prev, ''])}
                    className={`text-[10px] font-bold mt-2 hover:underline transition-colors ${dark ? 'text-pink-400' : 'text-rose-600'}`}
                  >
                    + Add Option
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsPollModalOpen(false);
                  setPollQuestion('');
                  setPollOptions(['', '']);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border-none ${
                  dark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-xs bg-insta-grad text-white hover:brightness-110 active:scale-95 transition-all cursor-pointer border-none"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
