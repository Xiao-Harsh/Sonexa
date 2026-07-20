import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { musicApi } from '../../api/musicApi';
import type { Track } from '../../api/musicApi';
import { usePlayerStore } from '../../store/playerStore';
import { getSearchHistory, saveSearchQuery, clearSearchHistory } from '../../utils/searchHistory';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const { setQueue, playTrack } = usePlayerStore();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistoryList(getSearchHistory());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Escape key global listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await musicApi.searchTracks(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = () => {
    if (query.trim()) {
      saveSearchQuery(query.trim());
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-left animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="p-1 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Search on Explore Page"
          >
            <Search className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onClose();
              } else if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search songs, albums, artists..."
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm font-medium outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white transition-all cursor-pointer border border-white/5"
          >
            ESC
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-neutral-500 gap-2">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
              <span className="text-xs font-medium">Searching Audius...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-1">Tracks</p>
              {results.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    saveSearchQuery(query);
                    setQueue(results);
                    playTrack(track);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-neutral-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
                      {track.artwork?.["150x150"] ? (
                        <img src={track.artwork["150x150"]} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <Music className="w-4 h-4 text-neutral-500" />
                      )}
                    </div>
                    <div className="overflow-hidden text-left">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-white">{track.title}</p>
                      <p className="text-xs text-neutral-400 truncate">{track.user.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 group-hover:text-white font-medium">Play ▶</span>
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-12 text-neutral-500 text-xs font-medium">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-4 py-2 text-left">
              {historyList.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Recent Searches</p>
                    <button 
                      onClick={() => {
                        clearSearchHistory();
                        setHistoryList([]);
                      }}
                      className="text-[10px] text-neutral-500 hover:text-white transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1">
                    {historyList.map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setQuery(item);
                          saveSearchQuery(item);
                          navigate(`/search?q=${encodeURIComponent(item)}`);
                          onClose();
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all cursor-pointer text-sm font-semibold text-neutral-350 hover:text-white"
                      >
                        <Search className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 text-xs font-medium">
                  Type to search music on the Audius network
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
