import React, { useState } from 'react';
import { Plus, Check, Edit2 } from 'lucide-react';
import { UserProfile } from '../types/schema';
import { authStorage } from '../services/supabase';

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
      name: `User ${profiles.length + 1}`,
      avatar_url: `https://images.unsplash.com/photo-${1534528741775 + profiles.length * 100}?auto=format&fit=crop&w=200&q=80`,
      is_kids: false,
    };
    authStorage.saveProfile(newProfile);
    setProfiles(authStorage.getProfiles());
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141414] px-4 text-white animate-fadeIn">
      <div className="text-center">
        <h1 className="text-3xl font-medium sm:text-5xl">
          {isManaging ? 'Manage Profiles:' : "Who's watching?"}
        </h1>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {profiles.map(profile => (
            <div
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-md border-2 border-transparent group-hover:border-white sm:h-36 sm:w-36">
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <Edit2 className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <span className="mt-3 text-sm text-gray-400 group-hover:text-white sm:text-base">
                {profile.name}
              </span>
            </div>
          ))}

          {profiles.length < 5 && (
            <div
              onClick={handleAddProfile}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-md border-2 border-dashed border-gray-600 bg-black/40 group-hover:border-white group-hover:bg-zinc-800 sm:h-36 sm:w-36">
                <Plus className="h-10 w-10 text-gray-500 group-hover:text-white" />
              </div>
              <span className="mt-3 text-sm text-gray-400 group-hover:text-white sm:text-base">
                Add Profile
              </span>
            </div>
          )}
        </div>

        <div className="mt-12">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className="rounded border border-gray-500 px-6 py-2 text-sm font-semibold tracking-wider text-gray-400 uppercase transition-colors hover:border-white hover:text-white"
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </button>
        </div>
      </div>

      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-md rounded-lg bg-zinc-900 p-6 border border-zinc-700 shadow-2xl"
          >
            <h3 className="text-xl font-bold">Edit Profile</h3>
            <div className="mt-4 flex items-center gap-4">
              <img
                src={editingProfile.avatar_url}
                alt="avatar"
                className="h-16 w-16 rounded object-cover"
              />
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full rounded bg-zinc-800 px-3 py-2 text-white border border-zinc-600 focus:outline-none focus:border-red-500"
                placeholder="Profile Name"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="rounded px-4 py-2 text-sm text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded bg-white px-5 py-2 text-sm font-bold text-black hover:bg-gray-200"
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
