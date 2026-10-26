import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, Play, Info } from 'lucide-react';
import { MediaItem } from '../types/schema';

interface AIAssistantBotProps {
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
  recommendedIds?: number[];
}

export const AIAssistantBot: React.FC<AIAssistantBotProps> = ({
  items,
  onSelect,
  onPlay,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hey! I'm CuddleCast AI. Looking for something to stream? Tell me what mood you're in, or pick a recommendation prompt below!",
    },
  ]);

  const quickPrompts = [
    '🍿 4K HDR Mindbenders',
    '⚔️ Top Dark Anime',
    '🕵️ Gentleman Thief & Mystery',
    '❤️ Cozy Weekend Marathon',
  ];

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const lower = userText.toLowerCase();
    const newMsgs: Message[] = [...messages, { sender: 'user', text: userText }];

    // Match movies based on query keywords
    let matched: MediaItem[] = [];
    let botReply = '';

    if (lower.includes('anime') || lower.includes('dark') || lower.includes('shonen')) {
      matched = items.filter(i =>
        (i.title || i.name || '').toLowerCase().includes('lupin') ||
        (i.overview || '').toLowerCase().includes('father') ||
        i.vote_average >= 7.5
      ).slice(0, 3);
      botReply = "Here are top-tier animated & high-stakes picks with deep storylines and stellar animation:";
    } else if (lower.includes('4k') || lower.includes('hdr') || lower.includes('mindbender')) {
      matched = items.filter(i => i.vote_average >= 7.5).slice(0, 3);
      botReply = "These titles feature reference-grade 4K HDR transfers, immersive sound stages, and jaw-dropping visuals:";
    } else if (lower.includes('thief') || lower.includes('mystery') || lower.includes('lupin') || lower.includes('crime')) {
      matched = items.filter(i =>
        (i.title || i.name || '').toLowerCase().includes('lupin') ||
        (i.overview || '').toLowerCase().includes('crime') ||
        (i.overview || '').toLowerCase().includes('thief')
      ).slice(0, 2);
      if (matched.length === 0) matched = items.slice(0, 2);
      botReply = "If you love clever heists and charismatic masterminds, check out these thrilling picks:";
    } else {
      matched = items.slice(0, 3);
      botReply = `Great choice! Based on "${userText}", I pulled these highly-rated favorites with instant streams:`;
    }

    newMsgs.push({
      sender: 'bot',
      text: botReply,
      recommendedIds: matched.map(m => m.id),
    });

    setMessages(newMsgs);
    setInput('');
  };

  return (
    <>
      {/* Floating Bot Button (Exact blue/cyan circle as in Vidbox screenshot) */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[130] flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#00A3FF] hover:bg-[#0091e6] text-white shadow-[0_8px_25px_rgba(0,163,255,0.45)] transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
            title="CuddleCast AI Stream Assistant"
          >
            <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        )}

        {/* AI Chat Window Popup */}
        {isOpen && (
          <div className="w-[340px] sm:w-[380px] h-[500px] rounded-2xl bg-[#131317] border border-white/10 text-white shadow-2xl flex flex-col overflow-hidden animate-scaleUp select-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0b0b0d]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00A3FF] text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5">
                    <span>CuddleCast AI</span>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </h4>
                  <p className="text-[10px] text-zinc-400">Smart Stream Concierge</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#00A3FF] text-white font-medium'
                        : 'bg-[#18181d] border border-white/5 text-zinc-200'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Recommendation Cards */}
                  {msg.recommendedIds && msg.recommendedIds.length > 0 && (
                    <div className="mt-2.5 space-y-2 w-full">
                      {msg.recommendedIds.map(id => {
                        const rec = items.find(m => m.id === id);
                        if (!rec) return null;

                        return (
                          <div
                            key={id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-[#0b0b0d] border border-white/10 hover:border-white/30 transition-all cursor-pointer group"
                            onClick={() => onSelect(rec)}
                          >
                            <img
                              src={rec.poster_path || rec.backdrop_path}
                              alt={rec.title || rec.name}
                              className="h-14 w-10 rounded-md object-cover flex-none"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white text-xs truncate">
                                {rec.title || rec.name}
                              </p>
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                                <span className="text-amber-400 font-bold">★ {rec.vote_average.toFixed(1)}</span>
                                <span>•</span>
                                <span className="capitalize">{rec.media_type}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    onPlay(rec);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white text-black hover:bg-zinc-200 shadow"
                                >
                                  <Play className="h-2.5 w-2.5 fill-black" />
                                  <span>Play</span>
                                </button>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    onSelect(rec);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white hover:bg-white/20"
                                >
                                  <Info className="h-2.5 w-2.5" />
                                  <span>Info</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Prompts Bar */}
            <div className="p-2 border-t border-white/5 bg-[#0e0e12] flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="rounded-full bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 text-[10px] font-medium text-zinc-300 hover:text-white whitespace-nowrap flex-shrink-0"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-2.5 border-t border-white/10 bg-[#09090c] flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask CuddleCast AI for a recommendation..."
                className="flex-1 rounded-xl bg-[#18181d] border border-white/10 px-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00A3FF]"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A3FF] hover:bg-[#0091e6] text-white shadow transition-transform active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
