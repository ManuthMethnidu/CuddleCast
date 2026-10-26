import React, { useState } from 'react';
import { Plus, Check, Edit2 } from 'lucide-react';
import { UserProfile } from '../types/schema';
import { authStorage } from '../services/supabase';
import { CuddleCastLogo } from './CuddleCastLogo';

interface ProfileGateProps {
  onSelectProfile: (profile: UserProfile) => void;
}

export const ProfileGate: React.FC<ProfileGateProps> = ({ onSelectProfile }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => authStorage.getProfiles());
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newName, setNewName] = useState('');

  const handleSelect = (profile: UserProfile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setNewName(profile.name);
    } else {
      authStorage.setActiveProfile(profile);
      onSelectProfile(profile);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !newName.trim()) return;
    const updated: UserProfile = { ...editingProfile, name: newName.trim() };
    authStorage.saveProfile(updated);
    setProfiles(authStorage.getProfiles());
    setEditingProfile(null);
  };

  const handleAddProfile = () => {
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      name: `Cuddle User ${profiles.length + 1}`,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + profiles.length * 100}?auto=format&fit=crop&w=200&q=80`,
      is_kids: false,
    };
    authStorage.saveProfile(newProfile);
    setProfiles(authStorage.getProfiles());
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#070b14] px-4 text-white animate-fadeIn overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl">
        <div className="mb-8 flex justify-center">
          <CuddleCastLogo size="lg" showTagline />
        </div>

        <h1 className="text-3xl font-medium sm:text-5xl tracking-tight text-slate-100">
          {isManaging ? 'Manage Profiles:' : "Who's watching?"}
        </h1>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {profiles.map(profile => (
            <div
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-transparent group-hover:border-sky-400 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all sm:h-36 sm:w-36 bg-slate-900">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <Edit2 className="h-8 w-8 text-sky-400" />
                  </div>
                )}
              </div>
              <span className="mt-3 text-sm text-slate-400 group-hover:text-sky-300 font-medium sm:text-base transition-colors">
                {profile.name}
              </span>
            </div>
          ))}

          {profiles.length < 5 && (
            <div
              onClick={handleAddProfile}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/60 group-hover:border-sky-400 group-hover:bg-slate-800/80 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all sm:h-36 sm:w-36">
                <Plus className="h-10 w-10 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <span className="mt-3 text-sm text-slate-400 group-hover:text-sky-300 font-medium sm:text-base transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        <div className="mt-14">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className="rounded-xl border border-slate-600 bg-slate-900/40 px-8 py-2.5 text-sm font-semibold tracking-wider text-slate-300 uppercase transition-all hover:border-sky-400 hover:text-sky-300 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md rounded-2xl bg-[#0c1322] p-6 border border-sky-500/30 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-white">Edit Profile</h3>
            <div className="mt-5 flex items-center gap-4">
              <img
                src={editingProfile.avatar_url}
                alt="avatar"
                className="h-16 w-16 rounded-xl object-cover border border-sky-400/40"
              />
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-white border border-slate-700 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30 transition-all"
                placeholder="Profile Name"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-400 px-6 py-2 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95"
              >
                <Check className="h-4 w-4" /> Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
