import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  MdEdit, MdCheck, MdCancel, MdPhotoCamera, MdCloudUpload
} from 'react-icons/md';

export default function Profile() {
  const { user, setUser, logout } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const dark = theme === 'dark';
  const isOwnProfile = !id || id === user?._id;
  const displayUser = isOwnProfile ? user : targetUser;

  useEffect(() => {
    if (!isOwnProfile) {
      async function fetchProfile() {
        try {
          setLoading(true);
          const data = await api.users.getProfile(id);
          setTargetUser(data);
        } catch (err) {
          console.error(err);
          alert("Could not load student profile 💔");
        } finally {
          setLoading(false);
        }
      }
      fetchProfile();
    }
  }, [id, isOwnProfile]);

  useEffect(() => {
    if (isOwnProfile && user) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user, isOwnProfile]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await api.upload.image(file);
      setAvatarUrl(data.url);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedUser = await api.users.updateMe(bio, avatarUrl);
      setUser(updatedUser);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStartMessage = () => {
    if (displayUser) {
      navigate('/chat', { state: { startChatWith: displayUser } });
    }
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
        <div className={`text-xs ${dark ? 'text-zinc-650' : 'text-slate-400'}`}>Loading student profile... ✨</div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${dark ? 'bg-black text-[#e0e3de]' : 'bg-[#FAFBF9] text-slate-800'}`}>
      <main className="flex-1 pt-20 md:pt-12 px-6 md:px-12 max-w-4xl mx-auto md:mx-0 pb-20 md:pb-0">
        <header className="mb-10">
          <h1 className="cabinet text-2xl font-900 tracking-tight text-insta-grad uppercase">
            {isOwnProfile ? 'My Space 🌸' : `${displayUser?.fullName.split(' ')[0]}'s Space 🌵`}
          </h1>
        </header>

        <section className={`rounded-2xl border p-8 max-w-2xl transition-all ${dark ? 'bg-zinc-950 border-zinc-900 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            {/* Circular avatar wrapper (like Instagram) */}
            <div 
              onClick={() => editing && fileInputRef.current?.click()}
              className={`w-24 h-24 rounded-full overflow-hidden border-2 p-1 shrink-0 ${
                editing ? 'cursor-pointer hover:opacity-90 relative group' : ''
              } ${dark ? 'border-pink-500/30' : 'border-rose-200'}`}
            >
              <img 
                className="w-full h-full object-cover rounded-full" 
                alt="User Profile" 
                src={(editing ? avatarUrl : displayUser?.avatarUrl) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
              />
              {editing && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <MdPhotoCamera className="w-6 h-6" />
                  <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">Upload</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-pink-400 rounded-full">
                  <div className="w-5 h-5 border-2 border-t-transparent border-pink-400 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-xl font-bold tracking-tight">{displayUser?.fullName || 'Academic Explorer'}</h2>
              <p className={`text-xs font-bold uppercase tracking-widest mt-1 ${dark ? 'text-pink-400' : 'text-rose-600'}`}>@{displayUser?.role || 'student'}</p>
              <p className={`text-xs mt-2 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>{displayUser?.email}</p>
            </div>
            
            {isOwnProfile ? (
              !editing && (
                <button 
                  onClick={() => {
                    setBio(user?.bio || '');
                    setAvatarUrl(user?.avatarUrl || '');
                    setEditing(true);
                  }}
                  className={`flex items-center gap-1.5 border px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${dark ? 'bg-zinc-900 border-zinc-800 hover:border-pink-500/20 text-zinc-300' : 'bg-white border-slate-250 hover:border-slate-350 text-slate-700 shadow-sm'}`}
                >
                  <MdEdit /> Edit Profile
                </button>
              )
            ) : (
              <button 
                onClick={handleStartMessage}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all bg-insta-grad text-white shadow-sm hover:brightness-110 active:scale-95`}
              >
                Message 💬
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label className={`block text-[10px] font-bold uppercase tracking-widest satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Profile Photo URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className={`flex-1 border focus:ring-0 rounded-xl px-4 py-3 text-sm focus:outline-none ${dark ? 'bg-zinc-900 border-zinc-800 focus:border-pink-500 text-white placeholder-zinc-700' : 'bg-white border-slate-300 focus:border-rose-500 text-slate-800 placeholder-slate-400'}`}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shrink-0 ${
                      dark 
                        ? 'bg-zinc-900 border-zinc-850 hover:border-pink-500/20 text-zinc-300' 
                        : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700 shadow-sm'
                    }`}
                  >
                    <MdCloudUpload className="w-4 h-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div className="space-y-2">
                <label className={`block text-[10px] font-bold uppercase tracking-widest satoshi ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Vibe Check (Bio)</label>
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your classmates something fun about you..."
                  className={`w-full border focus:ring-0 rounded-xl px-4 py-3 text-sm focus:outline-none h-28 resize-none ${dark ? 'bg-zinc-900 border-zinc-800 focus:border-pink-500 text-white placeholder-zinc-700' : 'bg-white border-slate-300 focus:border-rose-500 text-slate-800 placeholder-slate-400'}`}
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditing(false)}
                  className={`flex items-center gap-1.5 border px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${dark ? 'bg-zinc-900 border-zinc-800 text-rose-400 hover:bg-rose-950/20' : 'bg-rose-50 border-rose-250 text-rose-600 hover:bg-rose-100'}`}
                >
                  <MdCancel /> Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-50 bg-insta-grad text-white shadow-sm hover:brightness-110"
                >
                  <MdCheck /> {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          ) : (
            <div className={`space-y-5 divide-y ${dark ? 'divide-zinc-900' : 'divide-slate-100'}`}>
              <div className="py-2">
                <h4 className={`block text-[9px] font-bold uppercase tracking-widest mb-1.5 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Academic Field 🎓</h4>
                <p className="text-sm font-medium">{displayUser?.department || 'Not configured (e.g. Computer Science)'}</p>
              </div>
              <div className="pt-4">
                <h4 className={`block text-[9px] font-bold uppercase tracking-widest mb-1.5 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Graduation Batch 🎓</h4>
                <p className="text-sm font-medium">{displayUser?.batch || '2026'}</p>
              </div>
              <div className="pt-4">
                <h4 className={`block text-[9px] font-bold uppercase tracking-widest mb-1.5 ${dark ? 'text-zinc-500' : 'text-slate-400'}`}>Vibe Check 📝</h4>
                <p className="text-sm leading-relaxed">{displayUser?.bio || 'This classmate has not written a bio yet.'}</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
