import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  Search,
  Maximize2,
  Minimize2,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useAccent } from '../context/AccentContext';
import {
  mangaDex,
  MangaDexTitle,
  MangaDexChapter,
  VERIFIED_MANGADEX_PRESETS,
} from '../services/mangadex';

export const MangaView: React.FC = () => {
  const { accentHex } = useAccent();

  // Search & Catalog State
  const [searchQuery, setSearchQuery] = useState('');
  const [mangaList, setMangaList] = useState<MangaDexTitle[]>(VERIFIED_MANGADEX_PRESETS);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Selected Manga & Chapter Feed State
  const [selectedManga, setSelectedManga] = useState<MangaDexTitle | null>(null);
  const [chapters, setChapters] = useState<MangaDexChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');

  // Reader State
  const [activeChapter, setActiveChapter] = useState<MangaDexChapter | null>(null);
  const [chapterPages, setChapterPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(false);
  const [readerMode, setReaderMode] = useState<'single' | 'webtoon'>('single');
  const [useDataSaver, setUseDataSaver] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Initial load of popular MangaDex titles
  useEffect(() => {
    setIsLoadingList(true);
    mangaDex
      .getPopularManga(18)
      .then((data) => {
        if (data.length > 0) setMangaList(data);
      })
      .finally(() => setIsLoadingList(false));
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsLoadingList(true);
        mangaDex
          .searchManga(searchQuery, 20)
          .then(setMangaList)
          .finally(() => setIsLoadingList(false));
      } else {
        mangaDex.getPopularManga(18).then(setMangaList);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open Chapter Selector for a manga
  const handleOpenManga = async (manga: MangaDexTitle) => {
    setSelectedManga(manga);
    setIsLoadingChapters(true);
    setChapters([]);
    try {
      const chList = await mangaDex.getChapters(manga.id, selectedLang);
      setChapters(chList);
    } finally {
      setIsLoadingChapters(false);
    }
  };

  // Re-fetch chapters on language switch
  const handleLanguageChange = async (lang: string) => {
    setSelectedLang(lang);
    if (!selectedManga) return;
    setIsLoadingChapters(true);
    try {
      const chList = await mangaDex.getChapters(selectedManga.id, lang);
      setChapters(chList);
    } finally {
      setIsLoadingChapters(false);
    }
  };

  // Start reading a chapter
  const handleReadChapter = async (chapter: MangaDexChapter) => {
    setActiveChapter(chapter);
    setIsReadingMode(true);
    setIsLoadingPages(true);
    setCurrentPage(1);

    try {
      const result = await mangaDex.getChapterPages(chapter.id);
      if (result) {
        setChapterPages(useDataSaver ? result.dataSaverPages : result.pages);
      } else {
        setChapterPages([]);
      }
    } finally {
      setIsLoadingPages(false);
    }
  };

  // Navigation between chapters inside the reader
  const handleChapterStep = (direction: 'prev' | 'next') => {
    if (!activeChapter || chapters.length === 0) return;
    const currentIndex = chapters.findIndex((c) => c.id === activeChapter.id);
    if (currentIndex === -1) return;

    // Chapters are sorted latest first (descending)
    const targetIndex =
      direction === 'next' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex >= 0 && targetIndex < chapters.length) {
      handleReadChapter(chapters[targetIndex]);
    }
  };

  // Keyboard navigation for reader
  useEffect(() => {
    if (!isReadingMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (currentPage < chapterPages.length) {
          setCurrentPage((p) => p + 1);
        } else {
          handleChapterStep('next');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (currentPage > 1) {
          setCurrentPage((p) => p - 1);
        } else {
          handleChapterStep('prev');
        }
      } else if (e.key === 'Escape') {
        setIsReadingMode(false);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReadingMode, currentPage, chapterPages.length, activeChapter]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // =========================================================================
  // Fullscreen Manga Reader View
  // =========================================================================
  if (isReadingMode && activeChapter && selectedManga) {
    return (
      <div
        ref={readerContainerRef}
        className="fixed inset-0 z-[1200] bg-[#070709] text-white flex flex-col select-none animate-in fade-in duration-200"
      >
        {/* Reader Top Bar */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-[#101015]/95 border-b border-white/10 backdrop-blur-md flex-none z-20">
          <button
            onClick={() => setIsReadingMode(false)}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Chapter List</span>
          </button>

          <div className="text-center">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {selectedManga.title} · Ch. {activeChapter.chapter}
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              {activeChapter.title !== `Chapter ${activeChapter.chapter}`
                ? `${activeChapter.title} • `
                : ''}
              Page {currentPage} of {chapterPages.length || '...'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Toggle: Single vs Webtoon */}
            <button
              onClick={() =>
                setReaderMode(readerMode === 'single' ? 'webtoon' : 'single')
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-zinc-300"
              title="Toggle Webtoon / Single Page mode"
            >
              <Layers className="h-3.5 w-3.5" />
              <span className="hidden md:inline capitalize">{readerMode}</span>
            </button>

            {/* Quality Toggle */}
            <button
              onClick={() => setUseDataSaver(!useDataSaver)}
              className="px-2 py-1 rounded text-[11px] font-mono font-bold bg-white/10 hover:bg-white/20 text-zinc-300"
              title="Data Saver mode"
            >
              {useDataSaver ? 'DATA-SAVER' : 'ORIGINAL'}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded text-zinc-400 hover:text-white"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={() => setIsReadingMode(false)}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reader Content Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-0 sm:p-4 bg-[#050507]">
          {isLoadingPages ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw
                className="h-8 w-8 animate-spin"
                style={{ color: accentHex }}
              />
              <span className="text-xs font-mono text-zinc-400">
                Fetching pages from MangaDex @home CDN...
              </span>
            </div>
          ) : chapterPages.length === 0 ? (
            <div className="text-center p-8 max-w-sm">
              <p className="text-sm font-semibold text-zinc-300 mb-4">
                Pages for this chapter are unavailable on the free mirror.
              </p>
              <button
                onClick={() => setIsReadingMode(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-black"
              >
                Choose Another Chapter
              </button>
            </div>
          ) : readerMode === 'webtoon' ? (
            /* Continuous Webtoon Scroll */
            <div className="w-full max-w-3xl flex flex-col items-center space-y-2 py-4">
              {chapterPages.map((url, i) => (
                <div key={i} className="relative w-full shadow-2xl">
                  <img
                    src={url}
                    alt={`Page ${i + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-contain"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-zinc-400">
                    {i + 1} / {chapterPages.length}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Single Page Flip View */
            <div className="relative max-w-3xl w-full h-full flex flex-col items-center justify-center p-2">
              <img
                src={chapterPages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="max-h-[82vh] max-w-full object-contain shadow-2xl rounded"
              />
              <div className="absolute bottom-3 right-6 px-2.5 py-1 rounded bg-black/80 text-[11px] font-mono text-zinc-300 border border-white/10">
                {currentPage} / {chapterPages.length}
              </div>
            </div>
          )}
        </div>

        {/* Reader Bottom Controls */}
        {readerMode === 'single' && chapterPages.length > 0 && (
          <div className="flex items-center justify-between px-4 sm:px-8 py-2.5 bg-[#101015]/95 border-t border-white/10 flex-none z-20">
            <button
              onClick={() => {
                if (currentPage > 1) setCurrentPage((p) => p - 1);
                else handleChapterStep('prev');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>

            {/* Quick Slider Scrubber */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <input
                type="range"
                min={1}
                max={chapterPages.length}
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-32 sm:w-64 h-1 rounded bg-white/20 cursor-pointer"
                style={{ accentColor: accentHex }}
              />
              <span className="text-zinc-400 text-xs">
                {currentPage} / {chapterPages.length}
              </span>
            </div>

            <button
              onClick={() => {
                if (currentPage < chapterPages.length) setCurrentPage((p) => p + 1);
                else handleChapterStep('next');
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 shadow"
              style={{ background: accentHex }}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // Main Manga Catalog & Search View
  // =========================================================================
  return (
    <div className="mx-auto max-w-[1560px] px-3.5 sm:px-12 pt-16 sm:pt-20 pb-20 select-none animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
            style={{ background: `${accentHex}25`, color: accentHex }}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Manga Reader</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Native MangaDex
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Direct connection to MangaDex Public API and open @home scan servers
            </p>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manga (e.g. Chainsaw Man, One Piece)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#131317] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Manga Grid */}
      {isLoadingList ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw
            className="h-8 w-8 animate-spin"
            style={{ color: accentHex }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pt-8">
          {mangaList.map((manga) => (
            <div
              key={manga.id}
              onClick={() => handleOpenManga(manga)}
              className="rounded-2xl bg-[#131317] border border-white/10 p-4 flex gap-4 hover:border-white/30 transition-all cursor-pointer group hover:shadow-2xl"
            >
              {/* Cover Art */}
              <div className="relative h-48 w-32 rounded-xl overflow-hidden flex-none shadow-lg border border-white/5">
                <img
                  src={manga.coverUrl}
                  alt={manga.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
              </div>

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

                  <h3 className="font-extrabold text-white text-base mt-2 truncate group-hover:text-purple-400 transition-colors">
                    {manga.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium">
                    By {manga.author}
                  </p>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 mt-2 leading-relaxed">
                    {manga.description}
                  </p>
                </div>

                {/* Tags & Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1 overflow-hidden">
                    {manga.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenManga(manga);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all active:scale-95 shadow"
                    style={{ background: accentHex }}
                  >
                    Chapters
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chapters Selection Modal Drawer */}
      {selectedManga && (
        <div className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSelectedManga(null)}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#131317] border border-white/10 text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-[#0b0b0d]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedManga.coverUrl}
                  alt={selectedManga.title}
                  className="w-12 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold text-base sm:text-lg truncate max-w-xs sm:max-w-md">
                    {selectedManga.title}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Select a chapter to read via MangaDex @home
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedManga(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Language Filter */}
            <div className="flex items-center justify-between px-6 py-2.5 bg-[#18181d] border-b border-white/5 text-xs">
              <span className="text-zinc-400">
                {isLoadingChapters
                  ? 'Loading chapters...'
                  : `${chapters.length} chapters found`}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Language:</span>
                {['en', 'es', 'fr', 'any'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l)}
                    className={`px-2 py-0.5 rounded text-[11px] uppercase font-mono ${
                      selectedLang === l
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
              {isLoadingChapters ? (
                <div className="flex items-center justify-center py-16">
                  <RefreshCw
                    className="h-6 w-6 animate-spin"
                    style={{ color: accentHex }}
                  />
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs">
                  No hosted chapters found for this language filter on MangaDex.
                  Try selecting 'any' or another language.
                </div>
              ) : (
                chapters.map((ch) => (
                  <div
                    key={ch.id}
                    onClick={() => handleReadChapter(ch)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#18181d] hover:bg-white/10 border border-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-mono font-bold px-2 py-1 rounded bg-white/5"
                        style={{ color: accentHex }}
                      >
                        Ch. {ch.chapter}
                      </span>
                      <span className="text-xs text-white font-medium truncate max-w-xs sm:max-w-md">
                        {ch.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="font-mono">{ch.pages} pages</span>
                      <span className="uppercase px-1.5 py-0.5 rounded bg-white/5 text-[10px]">
                        {ch.language}
                      </span>
                      <button
                        className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow opacity-80 group-hover:opacity-100"
                        style={{ background: accentHex }}
                      >
                        Read
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
