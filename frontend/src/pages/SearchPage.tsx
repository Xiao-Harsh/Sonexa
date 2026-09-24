import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { musicApi } from '../api/musicApi';
import type { Track } from '../api/musicApi';
import { useAuthStore } from '../store/authStore';
import { SearchBar } from '../components/music/SearchBar';
import { TrackCard } from '../components/music/TrackCard';
import { Loader2, Music, Play, Pause, Heart, FolderPlus, Check, Clock } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/ui/EmptyState';
import { useToastStore } from '../store/toastStore';
import { formatDuration } from '../utils/formatDuration';
import { getSearchHistory, saveSearchQuery, clearSearchHistory } from '../utils/searchHistory';

interface SearchTrackRowProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
}

const SearchTrackRow: React.FC<SearchTrackRowProps> = ({ track, index, onPlay }) => {
  const artworkUrl = track.artwork?.["150x150"] || track.user.artwork?.["150x150"];
  const { favorites, playlists, likeTrack, unlikeTrack, fetchPlaylists, addTrackToPlaylist } = useLibraryStore();
  const showToast = useToastStore((state) => state.showToast);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { queue, currentTrackIndex, isPlaying, togglePlay } = usePlayerStore();
  const currentTrack = queue[currentTrackIndex];
  const isCurrent = currentTrack?.id === track.id;
  const isLiked = favorites.some((f) => f.id === track.id);

  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showDropdown]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      showToast('Please sign in to add songs to your favorites', 'info');
      navigate('/login');
      return;
    }
    if (isLiked) {
      unlikeTrack(track.id);
      showToast(`Removed from Liked Songs`, 'info');
    } else {
      likeTrack(track);
      showToast(`Added to Liked Songs`, 'success');
    }
  };

  const handlePlaylistIconClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) {
      await fetchPlaylists();
    }
    setShowDropdown(!showDropdown);
  };

  const handleAddToPlaylist = async (e: React.MouseEvent, playlistId: number) => {
    e.stopPropagation();
    await addTrackToPlaylist(playlistId, track);
    const playlist = playlists.find((p) => p.id === playlistId);
    showToast(`Added to ${playlist?.name || 'playlist'}`, 'success');
    setShowDropdown(false);
  };

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      onPlay(track);
    }
  };

  return (
    <tr
      className={`group hover:bg-white/5 border-b border-white/5 transition-colors ${
        isCurrent ? 'bg-white/5' : ''
      }`}
    >
      {/* Index / Play Button */}
      <td className="py-2.5 sm:py-3 px-2 sm:px-4 text-center text-xs sm:text-sm font-semibold text-neutral-500 relative w-10 sm:w-12">
        <span className={`${isCurrent ? 'text-indigo-400 font-bold' : ''} group-hover:opacity-0`}>
          {isCurrent ? (isPlaying ? '🔊' : '▶') : index + 1}
        </span>
        <button
          onClick={handlePlayClick}
          className="absolute inset-0 m-auto w-7 h-7 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white text-black rounded-full transition-all cursor-pointer shadow-md"
          title={isPlaying && isCurrent ? 'Pause' : 'Play'}
        >
          {isPlaying && isCurrent ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </td>

      {/* Title & Artwork */}
      <td className="py-2.5 sm:py-3 px-2 sm:px-4 min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-900 border border-white/5 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
            <Music className="w-4 h-4 text-neutral-600 absolute inset-0 m-auto" />
            {artworkUrl && (
              <img
                src={artworkUrl}
                alt={track.title}
                className="object-cover w-full h-full relative z-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="text-left min-w-0 flex-1 overflow-hidden">
            <p className={`font-semibold text-xs sm:text-sm truncate transition-colors ${isCurrent ? 'text-indigo-400' : 'text-white'}`} title={track.title || 'Untitled Track'}>
              {track.title || 'Untitled Track'}
            </p>
            <p className="text-[10px] sm:text-xs text-neutral-400 truncate mt-0.5 md:hidden font-medium">
              {track.user?.name || 'Artist'}
            </p>
          </div>
        </div>
      </td>

      {/* Artist */}
      <td className="py-2.5 sm:py-3 px-4 text-sm text-neutral-400 hidden md:table-cell truncate">
        {track.user?.name || 'Artist'}
      </td>

      {/* Genre */}
      <td className="py-2.5 sm:py-3 px-4 text-sm text-neutral-400 hidden sm:table-cell">
        {track.genre ? (
          <span className="uppercase tracking-wider text-[9px] font-bold px-2 py-0.5 bg-white/5 rounded border border-white/5 text-neutral-300">
            {track.genre}
          </span>
        ) : (
          <span className="text-neutral-600">-</span>
        )}
      </td>

      {/* Actions (Like, Playlist) */}
      <td className="py-2.5 sm:py-3 px-1 sm:px-4 w-18 sm:w-24 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={handleHeartClick}
            className={`p-1.5 rounded transition-all cursor-pointer ${
              isLiked ? 'text-rose-500 opacity-100' : 'text-neutral-500 hover:text-white opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handlePlaylistIconClick}
              className="p-1.5 rounded text-neutral-500 hover:text-white transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100"
              title="Add to Playlist"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-neutral-900 border border-neutral-850 rounded-xl shadow-2xl p-1 z-30 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-3 py-2 border-b border-white/5">
                  Add to Playlist
                </p>
                <div className="max-h-36 overflow-y-auto mt-1 space-y-0.5">
                  {playlists.length > 0 ? (
                    playlists.map((playlist) => {
                      const alreadyInPlaylist = playlist.tracks?.some(
                        (t) => t.audiusTrackId === track.id
                      );
                      return (
                        <button
                          key={playlist.id}
                          disabled={alreadyInPlaylist}
                          onClick={(e) => handleAddToPlaylist(e, playlist.id)}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                        >
                          <span className="truncate">{playlist.name}</span>
                          {alreadyInPlaylist && <Check className="w-3 h-3 text-indigo-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-neutral-500 py-3 text-center">
                      No playlists found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Duration */}
      <td className="py-3 px-4 text-center text-sm text-neutral-500 font-medium">
        {formatDuration(track.duration)}
      </td>
    </tr>
  );
};

export const SearchPage: React.FC = () => {
  const { setQueue, playTrack } = usePlayerStore();
  const showToast = useToastStore((state) => state.showToast);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [tracks, setTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState(queryParam || '');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getSearchHistory());

  // Fetch default trending tracks on load
  useEffect(() => {
    const fetchExploreData = async () => {
      setLoadingTrending(true);
      try {
        const data = await musicApi.getTrendingTracks('');
        setTrendingTracks(data);
      } catch (err) {
        console.error('Failed to load explore data', err);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchExploreData();
  }, []);

  const executeSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setTracks([]);
      setSearched(false);
      return;
    }

    saveSearchQuery(q);
    setRecentSearches(getSearchHistory());

    setLoading(true);
    setSearched(true);
    try {
      const data = await musicApi.searchTracks(q);
      setTracks(data);
    } catch (error) {
      console.error(error);
      showToast('Search query failed', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchParams(q ? { q } : {});
  };

  // Sync search parameters from URL on load/change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (queryParam) {
        setQuery(queryParam);
        void executeSearch(queryParam);
      } else {
        setQuery('');
        setTracks([]);
        setSearched(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [queryParam, executeSearch]);

  const dailyMixes = [
    {
      title: 'Daily Mix 1',
      subtitle: 'The Weeknd, Drake, Post Malone & more',
      query: 'Weekly Trending',
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85',
    },
    {
      title: 'Daily Mix 2',
      subtitle: 'Arijit Singh, Prateek Kuhad, Anuv Jain & more',
      query: 'Arijit Singh',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=85',
    },
    {
      title: 'Daily Mix 3',
      subtitle: 'AP Dhillon, Diljit Dosanjh, Badshah & more',
      query: 'Punjabi Hits',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85',
    },
  ];

  const handleMixClick = async (mixQuery: string, mixTitle: string) => {
    try {
      showToast(`Loading ${mixTitle}...`, 'info');
      const res = await musicApi.searchTracks(mixQuery, 15);
      if (res.length > 0) {
        setQueue(res);
        playTrack(res[0]);
        showToast(`Playing ${mixTitle}: ${res[0].title}`, 'success');
      } else if (trendingTracks.length > 0) {
        setQueue(trendingTracks);
        playTrack(trendingTracks[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-10 text-left"
    >
      {/* HEADER TITLE */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Explore</h1>
      </div>

      {/* SEARCH BAR & HISTORY */}
      <div className="flex flex-col gap-3 justify-start items-start">
        <SearchBar onSearch={handleSearch} initialValue={queryParam} />
        {recentSearches.length > 0 && !searched && (
          <div className="flex flex-wrap items-center gap-2 pt-1 select-none">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Recent:</span>
            {recentSearches.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(item)}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-850 border border-white/5 rounded-full text-xs font-semibold text-neutral-400 hover:text-white transition-all cursor-pointer shadow-md"
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                clearSearchHistory();
                setRecentSearches([]);
              }}
              className="text-[10px] text-neutral-500 hover:text-rose-400 transition-colors font-semibold ml-2 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* CONDITIONAL RENDERING: SEARCH RESULTS vs DEFAULT EXPLORE VIEW */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-500 gap-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <span className="text-xs font-medium tracking-wide">Searching tracks...</span>
        </div>
      ) : searched ? (
        tracks.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Search Results for "{query}"
            </h2>
            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="text-neutral-500 text-xs font-semibold uppercase tracking-wider border-b border-white/5 pb-3">
                    <th className="py-2.5 sm:py-3 px-2 sm:px-4 w-10 sm:w-12 text-center">#</th>
                    <th className="py-2.5 sm:py-3 px-2 sm:px-4">Title</th>
                    <th className="py-2.5 sm:py-3 px-4 hidden md:table-cell">Artist</th>
                    <th className="py-2.5 sm:py-3 px-4 hidden sm:table-cell">Genre</th>
                    <th className="py-2.5 sm:py-3 px-1 sm:px-4 w-18 sm:w-24 text-center">Actions</th>
                    <th className="py-2.5 sm:py-3 px-2 sm:px-4 w-14 sm:w-16 text-center">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-auto" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tracks.map((track, idx) => (
                    <SearchTrackRow
                      key={track.id + '-' + idx}
                      track={track}
                      index={idx}
                      onPlay={(t) => {
                        setQueue(tracks);
                        playTrack(t);
                      }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Music}
            title="No Results Found"
            description={`We couldn't find any tracks matching "${query}". Try searching with different keywords.`}
          />
        )
      ) : (
        /* DEFAULT EXPLORE VIEW: TRENDING NOW & MADE FOR YOU */
        <div className="space-y-10">
          {/* SECTION 1: TRENDING NOW */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Trending Now</h2>
              <span className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
                View all
              </span>
            </div>

            {loadingTrending ? (
              <div className="flex items-center justify-center py-12 text-neutral-500 gap-3">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
                <span className="text-xs font-medium">Loading trending tracks...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
                {trendingTracks.slice(0, 5).map((track) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    onPlay={(t) => {
                      setQueue(trendingTracks);
                      playTrack(t);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SECTION 2: MADE FOR YOU */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Made for you</h2>
              <span className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
                View all
              </span>
            </div>

            <div className="grid grid-cols-1 min-[540px]:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              {dailyMixes.map((mix, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[#141414] border border-white/5 hover:border-white/15 rounded-xl sm:rounded-2xl overflow-hidden h-36 sm:h-40 md:h-44 flex flex-col justify-end p-4 sm:p-5 md:p-6 transition-all duration-300 shadow-xl cursor-pointer"
                  onClick={() => handleMixClick(mix.query, mix.title)}
                >
                  <img
                    src={mix.image}
                    alt={mix.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />

                  <div className="relative z-10 space-y-0.5 sm:space-y-1 text-left max-w-[80%]">
                    <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-tight">{mix.title}</h3>
                    <p className="text-xs text-neutral-300 truncate font-medium">{mix.subtitle}</p>
                  </div>

                  {/* Circular Play Button */}
                  <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-20 transition-transform duration-300 group-hover:scale-110">
                    <div className="p-3 sm:p-3.5 bg-white text-black rounded-full shadow-2xl flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
