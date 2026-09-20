import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Home, Compass, Library, Shuffle, Music2, Sparkles } from 'lucide-react';
import { musicApi } from '../api/musicApi';
import type { Track } from '../api/musicApi';
import { usePlayerStore } from '../store/playerStore';

// ── Default curated Sonexa card dataset (fallback when live API is loading or offline)
interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  genre?: string;
  trackObj?: Track | null;
}

const DEFAULT_CARDS: CardItem[] = [
  {
    id: 'global-hits',
    title: 'Global Hits',
    subtitle: 'The Weeknd, Drake & top charts',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85',
    genre: 'Pop / Charts',
  },
  {
    id: 'bollywood-hits',
    title: 'Bollywood Hits',
    subtitle: 'Arijit Singh, Pritam, Shreya',
    image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=700&q=85',
    genre: 'Bollywood',
  },
  {
    id: 'hiphop-rap',
    title: 'Hip-Hop & Rap',
    subtitle: 'Travis Scott, 21 Savage, Divine',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=700&q=85',
    genre: 'Hip-Hop',
  },
  {
    id: 'chill-lofi',
    title: 'Chill Lo-Fi',
    subtitle: 'Anuv Jain, Prateek Kuhad, Joji',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=700&q=85',
    genre: 'Lo-Fi / Indie',
  },
  {
    id: 'trending',
    title: 'Trending Now',
    subtitle: 'Top stream hits today',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=85',
    genre: 'Trending',
  },
  {
    id: 'recent',
    title: 'Studio Sessions',
    subtitle: 'Pure acoustic & unplugged',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=700&q=85',
    genre: 'Acoustic',
  },
  {
    id: 'fresh',
    title: 'Fresh Releases',
    subtitle: 'New drops across all genres',
    image: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=700&q=85',
    genre: 'New Music',
  },
];

const CARD_COUNT = DEFAULT_CARDS.length; // 7 cards
const LOOP_MS = 46000; // 46s for ultra-smooth, slow cinematic floating motion
const SPAN_RAD = (168 * Math.PI) / 180; // 168 degrees total orbital span

// ── Responsive Card Transform (Mobile: smooth horizontal right-to-left flow; Desktop: orbital crown) ──
function calculateResponsiveCardTransform(
  phi: number,
  p: number,
  W: number,
  H: number,
  total: number,
  cardBase: number
) {
  if (W < 768) {
    // ── MOBILE: Smooth horizontal right-to-left conveyor with constant, non-overlapping spacing ──
    const gap = Math.min(26, Math.max(18, Math.round(W * 0.05)));
    const slotWidth = cardBase + gap;
    const totalTrackWidth = total * slotWidth;

    const screenCenter = W / 2;
    // (1.0 - p) continuously moves cards from right to left across the screen!
    const virtualPos = (1.0 - p) * totalTrackWidth;
    let relativeX = ((virtualPos - screenCenter) % totalTrackWidth);
    if (relativeX < -totalTrackWidth / 2) relativeX += totalTrackWidth;
    if (relativeX > totalTrackWidth / 2) relativeX -= totalTrackWidth;

    const x = screenCenter + relativeX;
    // Safely positioned in the upper portion above the hero headline "MUSIC FOR EVERYONE."
    const y = Math.min(265, Math.max(165, Math.round(H * 0.28)));

    const edgeDist = Math.abs(relativeX);
    const scale = Math.max(0.92, 1.05 - (edgeDist / (W * 0.6)) * 0.13);

    let opacity = 1.0;
    if (edgeDist > W * 0.46) {
      opacity = Math.max(0, Math.min(1, (W * 0.72 - edgeDist) / (W * 0.26)));
    }

    const zIndex = Math.round((1.0 - Math.min(1.0, edgeDist / (W * 0.6))) * 20) + 1;
    return { x, y, scale, rotation: 0, opacity, zIndex };
  }

  // ── DESKTOP: Wide half-circular orbital crown ──
  const X_c = W / 2;
  const Y_c = H * 1.07;
  const R_x = W * 0.54;
  const R_y = H * 0.79;

  const x = X_c + R_x * Math.sin(phi);
  const y = Y_c - R_y * Math.cos(phi) + Math.min(32, H * 0.035);

  const phiDeg = (phi * 180) / Math.PI;
  const absDeg = Math.abs(phiDeg);
  const scale = Math.max(0.90, 1.04 - (absDeg / 70) * 0.14);

  let opacity = 1.0;
  if (absDeg > 54) {
    opacity = Math.max(0, Math.min(1, (72 - absDeg) / 18));
  }

  const zIndex = Math.round((1.0 - Math.min(1.0, absDeg / 70)) * 20) + 1;
  return { x, y, scale, rotation: 0, opacity, zIndex };
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  // Dynamic live track state from API
  const [cards, setCards] = useState<CardItem[]>(DEFAULT_CARDS);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Direct DOM refs for 60fps animation without React re-renders
  const rafRef = useRef<number>(0);
  const lastTimestampRef = useRef<number | null>(null);
  const progressRef = useRef<number>(0); // global normalized orbit progress in [0, 1)
  const isHoveredAnyRef = useRef<boolean>(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverScaleRef = useRef<number[]>(new Array(CARD_COUNT).fill(1.0));
  const dimRef = useRef({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });
  const tickRef = useRef<(timestamp: number) => void>(() => {});

  // Responsive card size tailored for wide spacing on desktop and proportional size on mobile
  const getCardSize = useCallback((w: number) => {
    if (w < 768) {
      // Proportional, prominent card sizing across all mobile devices (~50% width)
      return Math.min(240, Math.max(180, Math.round(w * 0.50)));
    }
    return Math.min(208, Math.max(155, Math.round(w * 0.138)));
  }, []);

  // Fetch real trending tracks dynamically with reliable image fallback
  useEffect(() => {
    let isMounted = true;
    musicApi
      .getTrendingTracks('', 10)
      .then((liveTracks) => {
        if (!isMounted || !liveTracks || liveTracks.length < 5) return;

        const dynamicCards: CardItem[] = liveTracks.slice(0, CARD_COUNT).map((t, idx) => {
          const art =
            t.artwork?.['1000x1000'] ||
            t.artwork?.['480x480'] ||
            t.artwork?.['150x150'] ||
            t.user?.artwork?.['480x480'] ||
            DEFAULT_CARDS[idx % DEFAULT_CARDS.length].image;

          return {
            id: String(t.id || idx),
            title: t.title || 'Trending Track',
            subtitle: t.user?.name || 'Sonexa Artist',
            image: art,
            genre: t.genre ? t.genre.toUpperCase() : DEFAULT_CARDS[idx % DEFAULT_CARDS.length].genre,
            trackObj: t,
          };
        });

        setCards(dynamicCards);
      })
      .catch((err) => {
        console.warn('Using curated Sonexa cards for landing page:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Viewport resize & accessibility
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPref = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onPref);

    const onResize = () => {
      dimRef.current = { w: window.innerWidth, h: window.innerHeight };
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', onResize);

    return () => {
      mq.removeEventListener('change', onPref);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Main orbital movement loop — GUARANTEED ZERO OVERLAP
  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimestampRef.current, 50);
      lastTimestampRef.current = timestamp;

      // Stop orbital movement if user points to / hovers over ANY card
      if (!isHoveredAnyRef.current) {
        progressRef.current += dt / LOOP_MS;
      }

      const { w, h } = dimRef.current;
      const cardBase = getCardSize(w);
      const total = cards.length;

      // Update hover scales array length if needed
      if (hoverScaleRef.current.length !== total) {
        hoverScaleRef.current = new Array(total).fill(1.0);
      }

      for (let i = 0; i < total; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        // Normalized progress of card i: strictly offset by i / total
        // MATHEMATICALLY GUARANTEED: p is uniquely spaced, cards NEVER overlap!
        const p = (progressRef.current + i / total) % 1.0;

        // Map p in [0, 1) to angle phi in [+SPAN_RAD/2, -SPAN_RAD/2]
        // p = 0: entering right (+84°); p = 0.5: apex center (0°); p = 1: exiting left (-84°)
        const phi = (SPAN_RAD / 2) - SPAN_RAD * p;

        // Smooth hover scale transition
        const targetHoverScale = hoveredCard === i ? 1.07 : 1.0;
        hoverScaleRef.current[i] += (targetHoverScale - hoverScaleRef.current[i]) * 0.15;

        // Calculate position (ZERO tilt, perfectly upright)
        const tf = calculateResponsiveCardTransform(phi, p, w, h, total, cardBase);
        const finalScale = tf.scale * hoverScaleRef.current[i];

        const tx = tf.x - cardBase / 2;
        const ty = tf.y - cardBase / 2;

        // Upright, square, zero-tilt transform
        cardEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${finalScale.toFixed(4)})`;
        cardEl.style.opacity = tf.opacity.toFixed(3);
        cardEl.style.zIndex = String(hoveredCard === i ? 40 : tf.zIndex);
      }

      rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
    },
    [getCardSize, hoveredCard, cards.length]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  useEffect(() => {
    if (reducedMotion) return;
    rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion]);

  // Tab visibility handling
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        lastTimestampRef.current = null;
        if (!reducedMotion) rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [tick, reducedMotion]);

  // Hover handlers: stops orbit on pointer entry over ANY card
  const handleCardMouseEnter = useCallback((index: number) => {
    isHoveredAnyRef.current = true;
    setHoveredCard(index);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    isHoveredAnyRef.current = false;
    setHoveredCard(null);
  }, []);

  // Play card action
  const handlePlayCard = useCallback(
    async (card: CardItem, e: React.MouseEvent) => {
      e.stopPropagation();
      if (card.trackObj) {
        playTrack(card.trackObj);
        navigate('/app');
        return;
      }

      // If fallback card clicked before trending loaded, search or fetch trending to start playback immediately
      try {
        const query = card.genre || card.title;
        const tracks = await musicApi.searchTracks(query, 5);
        if (tracks && tracks.length > 0) {
          playTrack(tracks[0]);
        } else {
          const trending = await musicApi.getTrendingTracks('', 5);
          if (trending && trending.length > 0) {
            playTrack(trending[0]);
          }
        }
      } catch (err) {
        console.warn('Could not auto-start fallback track:', err);
      }
      navigate('/app');
    },
    [navigate, playTrack]
  );

  // Random Song click action from Landing Navbar
  const handleRandomPlay = useCallback(async () => {
    try {
      let candidateTracks: Track[] = [];
      const liveCardsTracks = cards.map(c => c.trackObj).filter(Boolean) as Track[];
      if (liveCardsTracks.length > 0) {
        candidateTracks = liveCardsTracks;
      } else {
        candidateTracks = await musicApi.getTrendingTracks('', 20);
      }

      if (candidateTracks && candidateTracks.length > 0) {
        usePlayerStore.getState().setQueue(candidateTracks);
        const randomIndex = Math.floor(Math.random() * candidateTracks.length);
        playTrack(candidateTracks[randomIndex]);
      }
    } catch (err) {
      console.warn('Random play navigation error:', err);
    }
    navigate('/app');
  }, [cards, navigate, playTrack]);

  const cardBaseSize = getCardSize(windowWidth);

  return (
    <div
      className="fixed inset-0 bg-[#070707] text-white overflow-hidden select-none"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Cinematic ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 28%, rgba(255,255,255,0.035) 0%, transparent 70%)',
        }}
      />

      {/* Very subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          backgroundSize: '256px 256px',
        }}
      />

      {/* ── FLOATING PILL NAVBAR — Clean realistic wordmark (no dot) ──────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[800px] px-4"
      >
        <div className="flex items-center justify-between gap-4 bg-[#121212]/80 backdrop-blur-2xl border border-white/[0.09] rounded-full px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          {/* Realistic Clean Wordmark Logo without dot */}
          <button
            onClick={() => navigate('/')}
            className="font-black text-[18px] tracking-[-0.03em] text-white uppercase cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
          >
            SONEXA
          </button>

          {/* Navigation links — desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <button
              onClick={() => navigate('/app')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-400 hover:text-white rounded-full transition-all hover:bg-white/[0.07] cursor-pointer whitespace-nowrap"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              Home
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-400 hover:text-white rounded-full transition-all hover:bg-white/[0.07] cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Explore
            </button>
            <button
              onClick={() => navigate('/library')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-400 hover:text-white rounded-full transition-all hover:bg-white/[0.07] cursor-pointer whitespace-nowrap"
            >
              <Library className="w-3.5 h-3.5" aria-hidden="true" />
              Library
            </button>
            <button
              onClick={handleRandomPlay}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-400 hover:text-white rounded-full transition-all hover:bg-white/[0.07] cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
              Random Songs
            </button>
          </nav>

          {/* Auth CTA buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="text-[12px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-2.5 hidden sm:block"
            >
              Sign In
            </button>
            <button
              id="landing-signup"
              onClick={() => navigate('/register')}
              className="px-5 py-2 bg-white hover:bg-neutral-100 text-black text-[12px] font-bold rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── SMOOTH HALF-CIRCULAR ORBITAL LAYER — 100% Upright, Zero Overlap ──── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {cards.slice(0, CARD_COUNT).map((card, i) => {
          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                width: cardBaseSize,
                height: cardBaseSize,
                top: 0,
                left: 0,
                willChange: 'transform, opacity',
                opacity: 0,
              }}
              onMouseEnter={() => handleCardMouseEnter(i)}
              onMouseLeave={handleCardMouseLeave}
              onClick={() => {
                if (card.trackObj) {
                  playTrack(card.trackObj);
                }
                navigate('/app');
              }}
            >
              {/* Card Container with rich drop shadow & clean border */}
              <div
                className="relative w-full h-full rounded-[28px] overflow-hidden border border-white/[0.12] transition-shadow duration-300 group"
                style={{
                  boxShadow:
                    hoveredCard === i
                      ? '0 30px 80px -10px rgba(0,0,0,0.95), 0 0 0 1.5px rgba(255,255,255,0.3)'
                      : '0 22px 55px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                {/* 100% Bright Full-Bleed Artwork with safe fallback on error */}
                <img
                  src={card.image}
                  alt={card.title}
                  draggable={false}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = DEFAULT_CARDS[i % DEFAULT_CARDS.length].image;
                    if (img.src !== fallback) {
                      img.src = fallback;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: 'brightness(0.96) contrast(1.04)' }}
                />

                {/* Subtle vignette gradient so tags & text are crystal clear */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 100%)',
                  }}
                />

                {/* Reference Style Badges: Top Right Pill Badge */}
                <div className="absolute top-3.5 right-3.5 z-10">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full text-[11px] font-semibold text-white/90 shadow-md">
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    {card.genre || 'Trending'}
                  </span>
                </div>

                {/* Bottom track info pill: strictly title and genre */}
                <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
                  <div className="bg-black/65 backdrop-blur-xl border border-white/15 rounded-2xl px-3.5 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Music2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <p className="text-[12px] font-bold text-white leading-tight truncate">
                        {card.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Play CTA Overlay */}
                <AnimatePresence>
                  {hoveredCard === i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
                    >
                      <button
                        onClick={(e) => handlePlayCard(card, e)}
                        className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                        aria-label={`Play ${card.title}`}
                      >
                        <Play className="w-6 h-6 fill-black text-black ml-1" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── HERO CONTENT — Rephrased headline, positioned cleanly lower down ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-[12vh] sm:bottom-[13vh] md:bottom-14 flex flex-col items-center justify-center text-center z-30 pointer-events-none px-6"
      >
        <div className="max-w-[840px] space-y-4">
          {/* Main Headline */}
          <h1
            className="font-black text-white tracking-tight leading-[0.92] uppercase select-none drop-shadow-2xl"
            style={{ fontSize: 'clamp(2.9rem, 7.6vw, 6.4rem)' }}
          >
            Music
            <br />
            <span className="text-neutral-300">For everyone.</span>
          </h1>

          {/* Subtitle text */}
          <p className="text-[15px] sm:text-[17px] text-neutral-300 font-medium leading-relaxed max-w-[540px] mx-auto pt-1 drop-shadow-md">
            Explore new music, save what you love, and make every listen your own.
          </p>

          {/* Call to action buttons */}
          <div className="flex items-center justify-center gap-3 pt-3 pointer-events-auto flex-wrap">
            <button
              id="landing-start-listening"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-white hover:bg-neutral-100 text-black text-[14px] font-bold rounded-full transition-all shadow-[0_8px_24px_rgba(255,255,255,0.08)] hover:shadow-[0_8px_28px_rgba(255,255,255,0.14)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
              Start Listening
            </button>
            <button
              id="landing-explore-music"
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-7 py-3.5 bg-black/50 hover:bg-white/[0.08] border border-white/20 hover:border-white/40 text-white text-[14px] font-semibold rounded-full transition-all backdrop-blur-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore Music
            </button>
          </div>

          {/* Attribution footer */}
        </div>
      </motion.div>
    </div>
  );
};
