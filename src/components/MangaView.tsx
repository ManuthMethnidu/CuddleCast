import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { useAccent } from '../context/AccentContext';

interface MangaTitle {
  id: string;
  title: string;
  author: string;
  cover: string;
  status: 'Ongoing' | 'Completed';
  rating: number;
  chaptersCount: number;
  description: string;
}

const MANGA_LIST: MangaTitle[] = [
  {
    id: 'one-piece',
    title: 'One Piece',
    author: 'Eiichiro Oda',
    cover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    status: 'Ongoing',
    rating: 9.3,
    chaptersCount: 1115,
    description: 'Gol D. Roger, the King of the Pirates, attained everything before his execution. His dying words launched the Great Pirate Era, driving Monkey D. Luffy to seek the legendary One Piece.',
  },
  {
    id: 'jujutsu-kaisen',
    title: 'Jujutsu Kaisen',
    author: 'Gege Akutami',
    cover: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    status: 'Completed',
    rating: 8.9,
    chaptersCount: 271,
    description: 'To save his friends from a deadly curse, high schooler Yuji Itadori swallows a talisman finger of the King of Curses Ryomen Sukuna and enters the secret world of Jujutsu Sorcerers.',
  },
  {
    id: 'chainsaw-man',
    title: 'Chainsaw Man',
    author: 'Tatsuki Fujimoto',
    cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?auto=format&fit=crop&w=600&q=80',
    status: 'Ongoing',
    rating: 8.8,
    chaptersCount: 175,
    description: 'Broke and burdened with debt, Denji lives with his pet devil Pochita until a betrayal leads to a fusion that resurrects him as the blood-drenched Chainsaw Devil.',
  },
  {
    id: 'solo-leveling',
    title: 'Solo Leveling',
    author: 'Chugong & DUBU',
    cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    status: 'Completed',
    rating: 9.2,
    chaptersCount: 179,
    description: 'In a world where gates connect human realm to monster dungeons, weakest E-rank hunter Sung Jinwoo discovers a hidden double dungeon that unlocks his Solo Leveling power.',
  },
  {
    id: 'berserk',
    title: 'Berserk',
    author: 'Kentaro Miura',
    cover: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80',
    status: 'Ongoing',
    rating: 9.5,
    chaptersCount: 376,
    description: 'Guts, a wandering mercenary known as the Black Swordsman, seeks bloody vengeance against Griffith and the God Hand with his giant Dragonslayer blade in a dark fantasy realm.',
  },
  {
    id: 'spy-family',
    title: 'Spy x Family',
    author: 'Tatsuya Endo',
    cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80',
    status: 'Ongoing',
    rating: 8.7,
    chaptersCount: 102,
    description: 'A master spy codenamed Twilight creates an artificial family to infiltrate an elite school, unaware his wife is a deadly assassin and his adopted daughter is a telepath.',
  },
];

export const MangaView: React.FC = () => {
  const { accentHex } = useAccent();
  const [selectedManga, setSelectedManga] = useState<MangaTitle | null>(null);
  const [currentChapter, setCurrentChapter] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages] = useState<number>(18);
  const [isReadingMode, setIsReadingMode] = useState(false);

  const startReading = (manga: MangaTitle, chapter: number) => {
    setSelectedManga(manga);
    setCurrentChapter(chapter);
    setCurrentPage(1);
    setIsReadingMode(true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapter && currentChapter < (selectedManga?.chaptersCount || 100)) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapter && currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(totalPages);
    }
  };

  // Fullscreen Manga Reader
  if (isReadingMode && selectedManga && currentChapter !== null) {
    return (
      <div className="fixed inset-0 z-[1100] bg-[#09090c] text-white flex flex-col select-none animate-fadeIn">
        {/* Reader Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#131317] border-b border-white/10 flex-none">
          <button
            onClick={() => setIsReadingMode(false)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Library</span>
          </button>

          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {selectedManga.title} · Chapter {currentChapter}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-zinc-300 hidden sm:inline">
              HD Scan
            </span>
            <button
              onClick={() => setIsReadingMode(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reader Content Page Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-6 bg-[#050507]">
          <div className="relative max-w-2xl w-full aspect-[2/3] bg-[#101015] rounded-lg shadow-2xl border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4">
            <img
              src={`https://images.unsplash.com/photo-${1534447677768 + (currentPage * 133)}?auto=format&fit=crop&w=1200&q=80`}
              alt={`Page ${currentPage}`}
              className="max-h-full max-w-full object-contain shadow"
            />
            {/* Page watermark indicator */}
            <div className="absolute bottom-3 right-4 px-2 py-1 rounded bg-black/80 text-[10px] font-mono text-zinc-300 border border-white/10">
              Ch. {currentChapter} · P. {currentPage}
            </div>
          </div>
        </div>

        {/* Reader Bottom Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 bg-[#131317] border-t border-white/10 flex-none">
          <button
            onClick={handlePrevPage}
            disabled={currentChapter === 1 && currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev Page</span>
          </button>

          {/* Quick Page Scrubber */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <input
              type="range"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={e => setCurrentPage(Number(e.target.value))}
              className="w-24 sm:w-48 h-1 rounded bg-white/20 cursor-pointer"
              style={{ accentColor: accentHex }}
            />
            <span className="text-zinc-400 text-[11px]">{currentPage}/{totalPages}</span>
          </div>

          <button
            onClick={handleNextPage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95"
            style={{ background: accentHex }}
          >
            <span>Next Page</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${accentHex}20`, color: accentHex }}
          >
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Manga Reader</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                HD Scans
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Read official translations and high-resolution digital manga releases
            </p>
          </div>
        </div>
      </div>

      {/* Manga Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
        {MANGA_LIST.map(manga => (
          <div
            key={manga.id}
            className="rounded-2xl bg-[#131317] border border-white/10 p-4 flex gap-4 hover:border-white/25 transition-all group"
          >
            {/* Manga Cover */}
            <img
              src={manga.cover}
              alt={manga.title}
              className="h-44 w-32 rounded-xl object-cover flex-none shadow-lg border border-white/5 group-hover:scale-105 transition-transform"
            />

            {/* Info Column */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {manga.status}
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    ★ {manga.rating}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base mt-1.5 truncate group-hover:text-purple-400 transition-colors">
                  {manga.title}
                </h3>
                <p className="text-xs text-zinc-400 font-medium">By {manga.author}</p>
                <p className="text-[11px] text-zinc-400 line-clamp-3 mt-2 leading-relaxed">
                  {manga.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <button
                  onClick={() => startReading(manga, 1)}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 text-center shadow"
                  style={{ background: accentHex }}
                >
                  Read Ch. 1
                </button>
                <button
                  onClick={() => startReading(manga, manga.chaptersCount)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                  title={`Latest: Ch. ${manga.chaptersCount}`}
                >
                  Latest
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
