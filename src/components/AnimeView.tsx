import React, { useState, useMemo } from 'react';
import { Sword, Play, Info } from 'lucide-react';
import { MediaItem } from '../types/schema';
import { useAccent } from '../context/AccentContext';

interface AnimeViewProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

const ANIME_TITLES = [
  {
    title: 'Demon Slayer: Kimetsu no Yaiba',
    overview: 'Tanjiro Kamado, a kindhearted boy whose family is slaughtered by demons, joins the Demon Slayer Corps to turn his demonized sister Nezuko back into a human.',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    rating: 8.7,
    year: '2024',
    episodes: 55,
    dubAvailable: true,
  },
  {
    title: 'Jujutsu Kaisen: Shibuya Incident',
    overview: 'Yuji Itadori and Tokyo Jujutsu High sorcerers confront an orchestrated curse attack on Shibuya on Halloween night in an all-out battle of domain expansions.',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    rating: 8.6,
    year: '2023',
    episodes: 47,
    dubAvailable: true,
  },
  {
    title: 'Solo Leveling: Arise',
    overview: 'In a world where hunters must battle deadly monsters, Sung Jinwoo, the weakest E-rank hunter, awakens a mysterious quest system that lets him level up infinitely.',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    rating: 8.5,
    year: '2024',
    episodes: 12,
    dubAvailable: true,
  },
  {
    title: 'Attack on Titan: The Final Season',
    overview: 'After his hometown is destroyed, Eren Jaeger vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
    poster: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    rating: 9.1,
    year: '2023',
    episodes: 89,
    dubAvailable: true,
  },
  {
    title: 'Chainsaw Man',
    overview: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. When he is betrayed and killed, Pochita makes a contract with him to become Chainsaw Man.',
    poster: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
    rating: 8.5,
    year: '2022',
    episodes: 12,
    dubAvailable: true,
  },
  {
    title: 'One Piece: Egghead Island',
    overview: 'Monkey D. Luffy and his Straw Hat Pirates sail to the futuristic island of Egghead to meet the legendary scientist Dr. Vegapunk as the World Government closes in.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    rating: 8.9,
    year: '2024',
    episodes: 1110,
    dubAvailable: true,
  },
  {
    title: 'Spirited Away (Studio Ghibli)',
    overview: 'During her family\'s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits where humans are changed into beasts.',
    poster: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    rating: 8.6,
    year: '2001',
    episodes: 1,
    dubAvailable: true,
  },
  {
    title: 'Bleach: Thousand-Year Blood War',
    overview: 'The peace is broken when warning sirens blare through the Soul Society. Residents are disappearing without a trace, and a dark shadow reaches toward Ichigo.',
    poster: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    rating: 9.0,
    year: '2024',
    episodes: 26,
    dubAvailable: true,
  },
];

export const AnimeView: React.FC<AnimeViewProps> = ({ items, onSelect, onPlay }) => {
  const { accentHex } = useAccent();
  const [filter, setFilter] = useState<'all' | 'sub' | 'dub'>('all');

  const animeList = useMemo(() => {
    // Map existing items or mock anime entries
    return ANIME_TITLES.map((a, i) => {
      const fallbackItem = items[i % items.length] || items[0];
      return {
        ...fallbackItem,
        id: 90000 + i,
        title: a.title,
        name: a.title,
        overview: a.overview,
        poster_path: a.poster,
        vote_average: a.rating,
        release_date: `${a.year}-01-01`,
        media_type: 'tv' as const,
        dubAvailable: a.dubAvailable,
        episodesCount: a.episodes,
      };
    });
  }, [items]);

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Anime Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${accentHex}20`, color: accentHex }}
          >
            <Sword className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Anime Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Simulcast
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Top trending shonen, isekai, and classic anime with English Sub & Dub
            </p>
          </div>
        </div>

        {/* Sub / Dub Filter */}
        <div className="flex items-center gap-1.5 rounded-xl bg-[#18181d] border border-white/10 p-1">
          {(['all', 'sub', 'dub'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                filter === tab
                  ? 'bg-white/15 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Anime' : tab === 'sub' ? 'Subbed' : 'English Dub'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Anime */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 pt-8">
        {animeList.map(anime => (
          <div
            key={anime.id}
            onClick={() => onSelect(anime)}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#18181d] border border-white/10 transition-all duration-300 hover:scale-[1.03] hover:border-white/30 hover:shadow-2xl flex flex-col"
          >
            {/* Poster container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/40">
              <img
                src={anime.poster_path}
                alt={anime.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Sub / Dub badges */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur border border-white/20">
                  SUB
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/80 text-white backdrop-blur">
                  DUB
                </span>
              </div>

              {/* Score pill */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-xs font-bold font-mono bg-black/80 text-amber-400 border border-amber-500/30 backdrop-blur">
                ★ {anime.vote_average.toFixed(1)}
              </div>

              {/* Hover Quick Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3">
                  {anime.overview}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onPlay(anime);
                    }}
                    className="flex-1 py-2 rounded-lg bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-transform active:scale-95 shadow"
                  >
                    <Play className="h-3.5 w-3.5 fill-black" />
                    <span>Watch Ep 1</span>
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onSelect(anime);
                    }}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Title info */}
            <div className="p-3 bg-[#131317]">
              <h3 className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition-colors">
                {anime.title}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono mt-1">
                <span>{anime.episodesCount} Episodes</span>
                <span>{anime.release_date.slice(0, 4)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
