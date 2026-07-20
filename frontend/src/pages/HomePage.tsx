import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { musicApi } from '../api/musicApi';
import type { Track } from '../api/musicApi';
import { TrackCard } from '../components/music/TrackCard';
import { Loader2, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/toastStore';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setQueue, playTrack } = usePlayerStore();
  const { history } = useLibraryStore();
  const showToast = useToastStore((state) => state.showToast);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoading(true);
      try {
        const data = await musicApi.getTrendingTracks('');
        setTracks(data);
      } catch (error) {
        console.error(error);
        showToast('Failed to load trending tracks', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, [showToast]);

  const getArtwork = (t: Track) => {
    return (
      t.artwork?.['1000x1000'] ||
      t.artwork?.['480x480'] ||
      t.artwork?.['150x150'] ||
      t.user?.artwork?.['480x480'] ||
      t.user?.artwork?.['150x150'] ||
      FALLBACK_HERO
    );
  };

  // Dynamically generate 5 hero slides from live network tracks
  const heroSlides = tracks.length > 0 
    ? tracks.slice(0, 5).map((track) => ({
        eyebrow: track.genre ? `${track.genre.toUpperCase()}` : 'FEATURED RELEASE',
        title: track.title,
        artist: track.user.name,
        image: getArtwork(track),
        trackObj: track,
      }))
    : [
        {
          eyebrow: 'FEATURED RELEASE',
          title: 'Music that moves you',
          artist: 'SONEXA High Fidelity',
          image: FALLBACK_HERO,
          trackObj: null,
        }
      ];

  // Auto-advance banner carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentSlide = heroSlides[currentSlideIndex % heroSlides.length];

  // DYNAMIC PERSONALIZED MIXES BASED ON LISTENING HISTORY
  const mixes = useMemo(() => {
    if (history.length > 0) {
      const recentArtists = Array.from(new Set(history.map(t => t.user?.name).filter(Boolean)));
      const artist1 = recentArtists[0] || 'Top Artists';
      const artist2 = recentArtists[1] || 'Trending Hits';

      return [
        {
          title: 'Based on Recent',
          subtitle: `Songs by ${artist1} & similar artists`,
          query: artist1,
          image: history[0]?.artwork?.['480x480'] || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Your Favorites Mix',
          subtitle: `Featuring ${artist2} & tailored tracks`,
          query: artist2,
          image: history[1]?.artwork?.['480x480'] || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Global Pop & Hits',
          subtitle: 'The Weeknd, Drake, Taylor Swift, Post Malone',
          query: 'Pop',
          image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
        },
        {
          title: 'Bollywood & Desi',
          subtitle: 'Arijit Singh, Pritam, Diljit Dosanjh, Divine',
          query: 'Bollywood Hindi',
          image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
        },
      ];
    }

    // Default mixes covering Global & Desi genres when no history exists yet
    return [
      {
        title: 'Global Hits',
        subtitle: 'The Weeknd, Drake, Post Malone & top global charts',
        query: 'Pop',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Bollywood Hits',
        subtitle: 'Arijit Singh, Pritam, Shreya Ghoshal, A.R. Rahman',
        query: 'Bollywood Hindi',
        image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Hip-Hop & Rap',
        subtitle: 'Travis Scott, 21 Savage, Divine, Badshah',
        query: 'Hip Hop',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Chill Lo-Fi & Indie',
        subtitle: 'Anuv Jain, Prateek Kuhad, Joji, Clairo',
        query: 'Chill Lofi',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }, [history]);

  const handleMixClick = async (query: string, title: string) => {
    try {
      showToast(`Loading ${title}...`, 'info');
      const mixTracks = await musicApi.searchTracks(query, 15);
      if (mixTracks.length > 0) {
        setQueue(mixTracks);
        playTrack(mixTracks[0]);
        showToast(`Playing ${title}: ${mixTracks[0].title}`, 'success');
      } else if (tracks.length > 0) {
        setQueue(tracks);
        playTrack(tracks[0]);
      }
    } catch (err) {
      console.error(err);
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
      {/* FULLY DYNAMIC & FIXED-HEIGHT HERO BANNER */}
      <div className="relative bg-[#121212] border border-white/5 rounded-3xl overflow-hidden h-[240px] sm:h-[340px] flex items-center p-6 sm:p-10 shadow-2xl">
        {/* Background Image Layer with Fallback */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={currentSlide.image}
              alt=""
              className="w-full h-full object-cover object-center opacity-100"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_HERO;
              }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #090909 0%, #090909 20%, rgba(9,9,9,0.85) 40%, rgba(9,9,9,0.4) 65%, transparent 95%)' }} />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content Area with Fixed Alignment */}
        <div className="relative z-10 max-w-lg space-y-3 text-left">
          <div>
            <span className="inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-400 bg-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-white/5">
              {currentSlide.eyebrow}
            </span>
          </div>

          <div className="min-h-[50px] sm:min-h-[76px] flex flex-col justify-center">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight line-clamp-2">
              {currentSlide.title}
            </h1>
          </div>

          <p className="text-neutral-400 text-xs md:text-sm font-medium truncate max-w-md">
            by <strong className="text-white font-semibold">{currentSlide.artist}</strong>
          </p>

          <div className="flex items-center gap-4 pt-1 sm:pt-2">
            <button
              onClick={() => {
                if (currentSlide.trackObj) {
                  setQueue(tracks);
                  playTrack(currentSlide.trackObj);
                  showToast(`Now playing: ${currentSlide.title}`, 'info');
                } else if (tracks.length > 0) {
                  setQueue(tracks);
                  playTrack(tracks[0]);
                }
              }}
              className="px-5 py-2 sm:px-6 sm:py-2.5 bg-white hover:bg-neutral-200 active:scale-95 text-black font-bold text-xs rounded-full flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play now
            </button>

            <button
              onClick={() => navigate('/search')}
              className="text-neutral-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer px-2 py-2"
            >
              Explore
            </button>
          </div>
        </div>

        {/* Hero Carousel Controls */}
        <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-8 z-10 flex items-center gap-4">
          {/* Pagination Dots */}
          <div className="flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  currentSlideIndex === idx ? 'w-4 sm:w-5 bg-white' : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handlePrevSlide}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 active:scale-95 text-white transition-all cursor-pointer border border-white/5"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="p-2 rounded-full bg-white/5 hover:bg-white/15 active:scale-95 text-white transition-all cursor-pointer border border-white/5"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* INSTANT DESI / INDIAN / GLOBAL MIXES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white">Your Mixes</h2>
          <span onClick={() => navigate('/search')} className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
            View all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {mixes.map((mix, idx) => (
            <div
              key={idx}
              className="group relative bg-[#141414] border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden aspect-[4/5] flex flex-col justify-end p-5 transition-all duration-300 shadow-xl cursor-pointer"
              onClick={() => handleMixClick(mix.query, mix.title)}
            >
              <img
                src={mix.image}
                alt={mix.title}
                className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent z-0" />

              <div className="relative z-10 space-y-1 text-left">
                <h3 className="font-bold text-base text-white tracking-tight leading-tight">{mix.title}</h3>
                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed font-medium">{mix.subtitle}</p>
              </div>

              {/* Hover Play Button */}
              <div className="absolute bottom-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-y-0 translate-y-2">
                <div className="p-3 bg-white text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MADE FOR YOU / TRENDING GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-white">Trending Songs</h2>
          <span onClick={() => navigate('/search')} className="text-xs font-medium text-neutral-500 hover:text-white cursor-pointer transition-colors">
            View all
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-xs font-medium tracking-wide">Loading recommendations...</span>
          </div>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
};
