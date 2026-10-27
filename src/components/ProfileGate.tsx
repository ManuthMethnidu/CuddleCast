import React, { useState } from 'react';
import { Plus, Check, Edit2, Trash2, X, Baby, Sparkles } from 'lucide-react';
import { UserProfile } from '../types/schema';
import { authStorage, AVATAR_PRESETS } from '../services/storage';
import { useAccent } from '../context/AccentContext';

interface ProfileGateProps {
  onSelectProfile: (profile: UserProfile) => void;
  onClose?: () => void;
  initialManaging?: boolean;
}

export const ProfileGate: React.FC<ProfileGateProps> = ({
  onSelectProfile,
  onClose,
  initialManaging = false,
}) => {
  const { accentHex, accentGlow } = useAccent();
  const [profiles, setProfiles] = useState<UserProfile[]>(() => authStorage.getProfiles());
  const [isManaging, setIsManaging] = useState(initialManaging);

  // Modal states
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);

  // Form states for editing / creating
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0].url);
  const [formIsKids, setFormIsKids] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSelect = (profile: UserProfile) => {
    if (isManaging) {
      setEditingProfile(profile);
      setFormName(profile.name);
      setFormAvatar(profile.avatar_url);
      setFormIsKids(Boolean(profile.is_kids));
      setConfirmDeleteId(null);
    } else {
      authStorage.setActiveProfile(profile);
      onSelectProfile(profile);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !formName.trim()) return;
    const updated: UserProfile = {
      ...editingProfile,
      name: formName.trim(),
      avatar_url: formAvatar.trim() || editingProfile.avatar_url,
      is_kids: formIsKids,
    };
    authStorage.saveProfile(updated);
    const refreshed = authStorage.getProfiles();
    setProfiles(refreshed);

    // If we just edited the active profile, notify parent
    const active = authStorage.getActiveProfile();
    if (active.id === updated.id) {
      authStorage.setActiveProfile(updated);
      onSelectProfile(updated);
    }

    setEditingProfile(null);
  };

  const handleOpenCreateModal = () => {
    // Pick next avatar preset not used or default
    const nextAvatar =
      AVATAR_PRESETS[profiles.length % AVATAR_PRESETS.length]?.url || AVATAR_PRESETS[0].url;
    setFormName(`Viewer ${profiles.length + 1}`);
    setFormAvatar(nextAvatar);
    setFormIsKids(false);
    setIsCreatingProfile(true);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    const newProfile: UserProfile = {
      id: `prof-${Date.now()}`,
      name: formName.trim(),
      avatar_url: formAvatar.trim() || AVATAR_PRESETS[0].url,
      is_kids: formIsKids,
    };
    authStorage.saveProfile(newProfile);
    setProfiles(authStorage.getProfiles());
    setIsCreatingProfile(false);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) return;
    const remaining = authStorage.deleteProfile(id);
    setProfiles(remaining);
    setEditingProfile(null);
    setConfirmDeleteId(null);
    onSelectProfile(authStorage.getActiveProfile());
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#222831] px-4 text-[#EEEEEE] animate-fadeIn select-none overflow-y-auto py-10">
      {/* Optional Top Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all active:scale-95 z-20"
          title="Back to browsing"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="relative z-10 text-center max-w-2xl w-full">
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Echora"
            className="h-14 w-14 mb-2 object-contain"
            style={{ filter: `drop-shadow(0 0 15px ${accentGlow})` }}
          />
          <span
            className="font-black text-3xl sm:text-4xl uppercase tracking-wider"
            style={{ fontFamily: "'Bebas Neue', sans-serif", color: accentHex }}
          >
            ECHORA
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
            Viewer Profiles
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold sm:text-5xl text-white tracking-tight">
          {isManaging ? 'Manage Profiles' : "Who's watching?"}
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          {isManaging
            ? 'Select a profile to customize name, avatar, or kids protection'
            : 'Select your personal profile to load your customized watch history and watchlist'}
        </p>

        {/* Profile Cards Grid */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div
                className="relative h-24 w-24 sm:h-32 sm:w-32 overflow-hidden rounded-2xl border-2 transition-all shadow-xl group-hover:border-white group-hover:shadow-2xl"
                style={{
                  borderColor: isManaging ? accentHex : 'rgba(255,255,255,0.15)',
                }}
              >
                <img
                  src={profile.avatar_url}
                  alt={profile.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />

                {/* Kids Badge */}
                {profile.is_kids && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-amber-500/90 text-black font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow">
                    <Baby className="h-2.5 w-2.5" />
                    Kids
                  </div>
                )}

                {/* Manage Overlay */}
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity group-hover:bg-black/40">
                    <div className="p-2.5 rounded-full bg-white/20 border border-white/30 text-white shadow-lg">
                      <Edit2 className="h-5 w-5" />
                    </div>
                  </div>
                )}
              </div>

              <span className="mt-3 text-sm text-zinc-300 group-hover:text-white sm:text-base font-semibold max-w-[120px] truncate">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Card */}
          {profiles.length < 6 && (
            <div
              onClick={handleOpenCreateModal}
              className="group flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-white/5 group-hover:border-white group-hover:bg-white/10 transition-all shadow-md">
                <Plus className="h-8 w-8 text-zinc-400 group-hover:text-white transition-colors" />
              </div>
              <span className="mt-3 text-sm text-zinc-400 group-hover:text-white sm:text-base font-semibold">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => setIsManaging(!isManaging)}
            className="rounded-full border border-white/20 px-8 py-2.5 text-xs font-bold tracking-widest text-zinc-300 uppercase transition-all hover:border-white hover:text-white hover:bg-white/10 active:scale-95 shadow-sm"
          >
            {isManaging ? 'Done Managing' : 'Manage Profiles'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full bg-white/10 px-6 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/15 transition-all active:scale-95"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveEdit}
            className="w-full max-w-lg rounded-3xl bg-[#303841] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Edit2 className="h-5 w-5" style={{ color: accentHex }} />
                Edit Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Name & Current Avatar Preview */}
            <div className="flex items-center gap-4">
              <img
                src={formAvatar}
                alt="Selected avatar"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 shadow-lg flex-shrink-0"
                style={{ borderColor: accentHex }}
              />
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl bg-[#222831] px-4 py-2.5 text-white border border-white/15 focus:outline-none focus:border-white transition-colors text-sm font-semibold"
                  placeholder="e.g. Cinema Fan, Kids Room"
                  required
                />
              </div>
            </div>

            {/* Avatar Preset Gallery */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormAvatar(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 active:scale-95 ${
                      formAvatar === preset.url
                        ? 'border-white shadow-lg ring-2 ring-white/50'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {formAvatar === preset.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Kids Mode Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Kids Experience</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Filters library to show only family-friendly movies, series, and anime
                </p>
              </div>
              <input
                type="checkbox"
                checked={formIsKids}
                onChange={(e) => setFormIsKids(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              {profiles.length > 1 ? (
                confirmDeleteId === editingProfile.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteProfile(editingProfile.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase transition-all shadow"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-xs text-zinc-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(editingProfile.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 text-xs font-semibold transition-all border border-rose-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )
              ) : (
                <div className="text-[11px] text-zinc-500 italic">Primary profile cannot be deleted</div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                  style={{ background: accentHex }}
                >
                  <Check className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Create Profile Modal */}
      {isCreatingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveCreate}
            className="w-full max-w-lg rounded-3xl bg-[#303841] p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5" style={{ color: accentHex }} />
                Add New Profile
              </h3>
              <button
                type="button"
                onClick={() => setIsCreatingProfile(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Name & Avatar */}
            <div className="flex items-center gap-4">
              <img
                src={formAvatar}
                alt="Selected avatar"
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 shadow-lg flex-shrink-0"
                style={{ borderColor: accentHex }}
              />
              <div className="flex-1 space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Profile Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl bg-[#222831] px-4 py-2.5 text-white border border-white/15 focus:outline-none focus:border-white transition-colors text-sm font-semibold"
                  placeholder="e.g. Cinema Fan, Kids Room"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Avatar Preset Gallery */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Choose Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setFormAvatar(preset.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 active:scale-95 ${
                      formAvatar === preset.url
                        ? 'border-white shadow-lg ring-2 ring-white/50'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {formAvatar === preset.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Kids Mode Toggle */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Kids Experience</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Filters library to show only family-friendly movies, series, and anime
                </p>
              </div>
              <input
                type="checkbox"
                checked={formIsKids}
                onChange={(e) => setFormIsKids(e.target.checked)}
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-amber-500 focus:ring-amber-400 cursor-pointer"
              />
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreatingProfile(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                style={{ background: accentHex }}
              >
                <Plus className="h-4 w-4" /> Create Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
