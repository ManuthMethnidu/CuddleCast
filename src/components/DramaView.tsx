import React, { useState } from 'react';
import { Theater } from 'lucide-react';
import { MediaItem } from '../types/schema';

interface DramaViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay?: (item: MediaItem) => void;
}

const DRAMA_ENTRIES = [
  {
    title: 'Queen of Tears',
    country: 'K-Drama',
    year: '2024',
    rating: 8.4,
    episodes: 16,
    overview: 'The queen of department stores and the prince of supermarkets weather a marital crisis until love miraculously begins to bloom again.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'The Glory',
    country: 'K-Drama',
    year: '2023',
    rating: 8.8,
    episodes: 16,
    overview: 'A young woman, bullied to the point of dropping out of school, orchestrates a meticulous revenge scheme to make her tormentors pay.',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Crash Landing on You',
    country: 'K-Drama',
    year: '2020',
    rating: 8.9,
    episodes: 16,
    overview: 'A paragliding mishap drops a South Korean heiress into North Korea—and into the life of an army officer, who decides he will help her hide.',
    poster: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Squid Game: The Challenge',
    country: 'K-Drama',
    year: '2021',
    rating: 8.1,
    episodes: 9,
    overview: 'Hundreds of cash-strapped players accept a strange invitation to compete in children\'s games for a tempting prize with deadly high stakes.',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Vincenzo',
    country: 'K-Drama',
    year: '2021',
    rating: 8.5,
    episodes: 20,
    overview: 'During a visit to his motherland, a Korean-Italian mafia lawyer gives a conglomerate a taste of its own medicine with a side of justice.',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Alice in Borderland',
    country: 'J-Drama',
    year: '2023',
    rating: 8.6,
    episodes: 16,
    overview: 'An obsessed gamer and his friends find themselves in an emptied Tokyo, where they are forced to compete in dangerous games to survive.',
    poster: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
  },
];

export const DramaView: React.FC<DramaViewProps> = ({ items, onSelect }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  const dramas = DRAMA_ENTRIES.map((d, i) => {
    const base = items[i % items.length] || items[0];
    return {
      ...base,
      id: 85000 + i,
      title: d.title,
      name: d.title,
      overview: d.overview,
      poster_path: d.poster,
      vote_average: d.rating,
      release_date: `${d.year}-01-01`,
      country: d.country,
      episodes: d.episodes,
    };
  });

  const filtered = selectedCountry === 'All'
    ? dramas
    : dramas.filter(d => d.country === selectedCountry);

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400"
          >
            <Theater className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Asian & Global Drama</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                Top Rated
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Romantic, thriller, and historical K-Drama, C-Drama, and J-Drama series
            </p>
          </div>
        </div>

        {/* Country filter tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#18181d] border border-white/10 p-1">
          {['All', 'K-Drama', 'J-Drama'].map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCountry === c
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-8">
        {filtered.map(drama => (
          <div
            key={drama.id}
            onClick={() => onSelect(drama)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#18181d] border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:scale-105"
          >
            <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-pink-500 text-white shadow">
              {drama.country}
            </div>

            <div className="relative aspect-[2/3] w-full">
              <img
                src={drama.poster_path}
                alt={drama.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5">
                <span className="text-xs font-bold text-white line-clamp-1 group-hover:text-pink-400 transition-colors">
                  {drama.title}
                </span>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span className="text-amber-400">★ {drama.vote_average.toFixed(1)}</span>
                  <span>{drama.episodes} Eps</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
