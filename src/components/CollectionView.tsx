import React, { useState } from 'react';
import { Library, Film } from 'lucide-react';
import { MediaItem } from '../types/schema';
import { useAccent } from '../context/AccentContext';

interface CollectionViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

interface CuratedCollection {
  id: string;
  title: string;
  curator: string;
  tagline: string;
  backdrop: string;
  itemCount: number;
  titles: string[];
}

const COLLECTIONS: CuratedCollection[] = [
  {
    id: 'nolan',
    title: 'Christopher Nolan Masterpieces',
    curator: 'Cinema Vault',
    tagline: 'Mind-bending cinema, practical effects, and existential time puzzles from the visionary director.',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1280&q=80',
    itemCount: 6,
    titles: ['Oppenheimer', 'Interstellar', 'Inception', 'The Dark Knight', 'Tenet', 'Dunkirk'],
  },
  {
    id: 'mcu',
    title: 'Marvel Cinematic Universe: Multiverse Saga',
    curator: 'Marvel Studios',
    tagline: 'Follow the epic cosmic journey across dimensions from Earth-616 to the Sacred Timeline.',
    backdrop: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1280&q=80',
    itemCount: 8,
    titles: ['Avengers: Endgame', 'Spider-Man: No Way Home', 'Loki', 'Doctor Strange', 'Guardians of the Galaxy'],
  },
  {
    id: 'ghibli',
    title: 'Studio Ghibli: Complete Works',
    curator: 'Hayao Miyazaki',
    tagline: 'Timeless hand-drawn animated classics that defined generations of storytelling and wonder.',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&q=80',
    itemCount: 5,
    titles: ['Spirited Away', 'Princess Mononoke', 'Howl\'s Moving Castle', 'My Neighbor Totoro'],
  },
  {
    id: 'tarantino',
    title: 'Quentin Tarantino: The Golden Sagas',
    curator: 'Auteur Film Club',
    tagline: 'Sharp dialogue, non-linear timelines, explosive climaxes, and unforgettable soundtracks.',
    backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1280&q=80',
    itemCount: 4,
    titles: ['Pulp Fiction', 'Kill Bill Vol. 1', 'Django Unchained', 'Inglourious Basterds'],
  },
];

export const CollectionView: React.FC<CollectionViewProps> = ({
  items,
  onSelect,
}) => {
  const { accentHex } = useAccent();
  const [activeCollectionId, setActiveCollectionId] = useState<string>(COLLECTIONS[0].id);

  const activeCol = COLLECTIONS.find(c => c.id === activeCollectionId) || COLLECTIONS[0];

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${accentHex}20`, color: accentHex }}
          >
            <Library className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Franchise Collections</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Curated
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hand-picked director filmographies, cinematic sagas, and chronological universes
            </p>
          </div>
        </div>
      </div>

      {/* Featured Collection Hero Banner */}
      <div className="relative mt-8 rounded-2xl overflow-hidden border border-white/10 aspect-[21/9] sm:aspect-[24/8] w-full bg-black/60 shadow-2xl">
        <img
          src={activeCol.backdrop}
          alt={activeCol.title}
          className="absolute inset-0 h-full w-full object-cover object-center brightness-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent p-6 sm:p-12 flex flex-col justify-end">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
            {activeCol.curator} · {activeCol.itemCount} Titles
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1 max-w-xl">
            {activeCol.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-lg mt-2 line-clamp-2">
            {activeCol.tagline}
          </p>
        </div>
      </div>

      {/* Collection Switcher Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 mt-4">
        {COLLECTIONS.map(col => (
          <button
            key={col.id}
            onClick={() => setActiveCollectionId(col.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              activeCollectionId === col.id
                ? 'bg-white/15 border-white/30 text-white shadow-lg'
                : 'bg-[#18181d] border-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="h-3.5 w-3.5" />
            <span>{col.title}</span>
          </button>
        ))}
      </div>

      {/* Titles in Active Collection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-6">
        {items.slice(0, 10).map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#18181d] border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105"
          >
            <div className="relative aspect-[2/3] w-full">
              <img
                src={item.poster_path || item.backdrop_path}
                alt={item.title || item.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-300 border border-white/10">
                Part {idx + 1}
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5">
                <span className="text-xs font-bold text-white line-clamp-1">
                  {item.title || item.name}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {item.release_date?.slice(0, 4) || '2024'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
