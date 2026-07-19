import React, { useState, useCallback, useEffect } from 'react';
import { musicApi } from '../api/musicApi';
import type { Track } from '../api/musicApi';
import { SearchBar } from '../components/music/SearchBar';
import { TrackCard } from '../components/music/TrackCard';
import { Loader2, Music, Play } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { motion } from 'framer-motion';
import { EmptyState } from '../components/ui/EmptyState';
import { useToastStore } from '../store/toastStore';

export const SearchPage: React.FC = () => {
  const { setQueue, playTrack } = usePlayerStore();
  const showToast = useToastStore((state) => state.showToast);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [searched, setSearched] = useState(false);
  const [query, setQuery] = useState('');

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

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q) {
      setTracks([]);
      setSearched(false);
      return;
    }

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

  const dailyMixes = [
    {
      title: 'Daily Mix 1',
      subtitle: 'The Weeknd, Drake, Post Malone & more',
      query: 'Weekly Trending',
      image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Daily Mix 2',
      subtitle: 'Arijit Singh, Prateek Kuhad, Anuv Jain & more',
      query: 'Arijit Singh',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Daily Mix 3',
      subtitle: 'AP Dhillon, Diljit Dosanjh, Badshah & more',
      query: 'Punjabi Hits',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
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

      {/* SEARCH BAR */}
      <div className="flex justify-start">
        <SearchBar onSearch={handleSearch} />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {tracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  onPlay={(t) => {
                    setQueue(tracks);
                    playTrack(t);
                  }}
                />
              ))}
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
              <h2 className="text-xl font-bold tracking-tight text-white">Trending Now</h2>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
              <h2 className="text-xl font-bold tracking-tight text-white">Made for you</h2>
              <span className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
                View all
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dailyMixes.map((mix, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[#141414] border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden h-44 flex flex-col justify-end p-6 transition-all duration-300 shadow-xl cursor-pointer"
                  onClick={() => handleMixClick(mix.query, mix.title)}
                >
                  <img
                    src={mix.image}
                    alt={mix.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />

                  <div className="relative z-10 space-y-1 text-left max-w-[80%]">
                    <h3 className="font-extrabold text-lg text-white tracking-tight leading-tight">{mix.title}</h3>
                    <p className="text-xs text-neutral-300 truncate font-medium">{mix.subtitle}</p>
                  </div>

                  {/* Circular Play Button */}
                  <div className="absolute bottom-5 right-5 z-20 transition-transform duration-300 group-hover:scale-110">
                    <div className="p-3.5 bg-white text-black rounded-full shadow-2xl flex items-center justify-center">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
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
