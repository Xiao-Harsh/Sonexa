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

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const playTrack = usePlayerStore((state) => state.playTrack);

  // Dynamic live track state from API
  const [cards, setCards] = useState<CardItem[]>(DEFAULT_CARDS);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  // Viewport tracking for strict layout mode switches
  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  // Clean layout distinctions: Desktop vs Landscape Mobile vs Portrait Mobile
  const isDesktop = (viewport.w >= 1024 && viewport.h >= 520) || (viewport.w >= 768 && viewport.h >= 600);
  const isLandscapeMobile = !isDesktop && viewport.w > viewport.h;
  const isPortraitMobile = !isDesktop && !isLandscapeMobile;

  // Direct DOM refs for 60fps animation without React re-renders
  const cardFieldRef = useRef<HTMLDivElement | null>(null);
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
  const tickRef = useRef<(timestamp: number) => void>(() => { });

  // Responsive card size for desktop taking both width and height into account
  const getDesktopCardSize = useCallback((w: number, h: number) => {
    let size = Math.min(208, Math.max(140, Math.round(w * 0.132)));
    if (h < 780) {
      const hFactor = Math.min(1, Math.max(0, (780 - h) / 280));
      size = Math.round(size - hFactor * 36);
    }
    return Math.max(118, size);
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

  // Viewport resize & accessibility listener
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPref = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onPref);

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      dimRef.current = { w, h };
      setViewport({ w, h });
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    return () => {
      mq.removeEventListener('change', onPref);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // Main 60fps tick loop: unified responsive composition
  const tick = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current === null) lastTimestampRef.current = timestamp;
      const dt = Math.min(timestamp - lastTimestampRef.current, 50);
      lastTimestampRef.current = timestamp;

      // Stop motion if user is hovering over any card
      if (!isHoveredAnyRef.current) {
        progressRef.current += dt / LOOP_MS;
      }

      const { w, h } = dimRef.current;
      const isDesktopMode = (w >= 1024 && h >= 520) || (w >= 768 && h >= 600);
      const isLandscapeMode = !isDesktopMode && w > h;
      const isPortraitMode = !isDesktopMode && !isLandscapeMode;
      const total = cards.length;

      if (hoverScaleRef.current.length !== total) {
        hoverScaleRef.current = new Array(total).fill(1.0);
      }

      if (isPortraitMode) {
        // ── PORTRAIT MOBILE: Matches Image 2 side-by-side card focus ──
        const fieldEl = cardFieldRef.current;
        const fieldW = fieldEl ? fieldEl.clientWidth : w;
        const fieldH = fieldEl ? fieldEl.clientHeight : 220;

        // Card sizing matching Image 2: clamp(150px, 46vw, 220px)
        const cardBase = Math.min(220, Math.max(150, Math.round(w * 0.46)));
        const gap = Math.min(22, Math.max(14, Math.round(fieldW * 0.04)));

        const slotWidth = cardBase + gap;
        const totalTrackWidth = total * slotWidth;
        const center = fieldW / 2;

        for (let i = 0; i < total; i++) {
          const cardEl = cardRefs.current[i];
          if (!cardEl) continue;

          const p = (progressRef.current + i / total) % 1.0;
          const targetHoverScale = hoveredCard === i ? 1.05 : 1.0;
          hoverScaleRef.current[i] += (targetHoverScale - hoverScaleRef.current[i]) * 0.15;

          // Continuous right-to-left flow across the card field
          const virtualPos = (1.0 - p) * totalTrackWidth;
          let relativeX = (virtualPos - center) % totalTrackWidth;
          if (relativeX < -totalTrackWidth / 2) relativeX += totalTrackWidth;
          if (relativeX > totalTrackWidth / 2) relativeX -= totalTrackWidth;

          const x = center + relativeX;
          const y = fieldH / 2; // Always vertically centered in .hero-card-field

          const edgeDist = Math.abs(relativeX);
          const centerFactor = Math.max(0, 1.0 - edgeDist / (fieldW * 0.58));
          const scale = (0.92 + centerFactor * 0.11) * hoverScaleRef.current[i];

          let opacity = 0.62 + centerFactor * 0.38;
          if (edgeDist > fieldW * 0.45) {
            opacity = Math.max(0, Math.min(opacity, ((fieldW * 0.72 - edgeDist) / (fieldW * 0.27)) * opacity));
          }

          const zIndex = Math.round(centerFactor * 20) + 1;

          const tx = x - cardBase / 2;
          const ty = y - cardBase / 2;

          cardEl.style.width = `${cardBase}px`;
          cardEl.style.height = `${cardBase}px`;
          cardEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale.toFixed(4)})`;
          cardEl.style.opacity = opacity.toFixed(3);
          cardEl.style.zIndex = String(hoveredCard === i ? 40 : zIndex);
        }
      } else if (isLandscapeMode) {
        // ── LANDSCAPE MOBILE: Preserved & Verified ──
        const fieldEl = cardFieldRef.current;
        const fieldW = fieldEl ? fieldEl.clientWidth : w;
        const fieldH = fieldEl ? fieldEl.clientHeight : 110;

        const cardBase = Math.min(115, Math.max(76, Math.round(h * 0.24)));
        const gap = Math.max(14, Math.round(fieldW * 0.035));

        const slotWidth = cardBase + gap;
        const totalTrackWidth = total * slotWidth;
        const center = fieldW / 2;

        for (let i = 0; i < total; i++) {
          const cardEl = cardRefs.current[i];
          if (!cardEl) continue;

          const p = (progressRef.current + i / total) % 1.0;
          const targetHoverScale = hoveredCard === i ? 1.05 : 1.0;
          hoverScaleRef.current[i] += (targetHoverScale - hoverScaleRef.current[i]) * 0.15;

          const virtualPos = (1.0 - p) * totalTrackWidth;
          let relativeX = (virtualPos - center) % totalTrackWidth;
          if (relativeX < -totalTrackWidth / 2) relativeX += totalTrackWidth;
          if (relativeX > totalTrackWidth / 2) relativeX -= totalTrackWidth;

          const x = center + relativeX;
          const y = fieldH / 2;

          const edgeDist = Math.abs(relativeX);
          const scale =
            Math.max(0.92, 1.03 - (edgeDist / (fieldW * 0.6)) * 0.11) * hoverScaleRef.current[i];

          let opacity = 1.0;
          if (edgeDist > fieldW * 0.42) {
            opacity = Math.max(0, Math.min(1, (fieldW * 0.72 - edgeDist) / (fieldW * 0.3)));
          }

          const zIndex = Math.round((1.0 - Math.min(1.0, edgeDist / (fieldW * 0.6))) * 20) + 1;

          const tx = x - cardBase / 2;
          const ty = y - cardBase / 2;

          cardEl.style.width = `${cardBase}px`;
          cardEl.style.height = `${cardBase}px`;
          cardEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale.toFixed(4)})`;
          cardEl.style.opacity = opacity.toFixed(3);
          cardEl.style.zIndex = String(hoveredCard === i ? 40 : zIndex);
        }
      } else {
        // ── DESKTOP: Half-circular orbital crown (Proportionally adapted across all laptop & desktop screens) ──
        const cardBase = getDesktopCardSize(w, h);
        const X_c = w / 2;
        const Y_c = h * 1.07;
        const R_x = Math.min(w * 0.54, 1150);
        const R_y = h * 0.79;
        const lift = h < 780 ? Math.round((780 - h) * 0.12) : 0;
        const yOffset = Math.min(28, h * 0.035) - lift;

        for (let i = 0; i < total; i++) {
          const cardEl = cardRefs.current[i];
          if (!cardEl) continue;

          const p = (progressRef.current + i / total) % 1.0;
          const phi = SPAN_RAD / 2 - SPAN_RAD * p;

          const targetHoverScale = hoveredCard === i ? 1.07 : 1.0;
          hoverScaleRef.current[i] += (targetHoverScale - hoverScaleRef.current[i]) * 0.15;

          const x = X_c + R_x * Math.sin(phi);
          const y = Y_c - R_y * Math.cos(phi) + yOffset;

          const phiDeg = (phi * 180) / Math.PI;
          const absDeg = Math.abs(phiDeg);
          const scale = Math.max(0.90, 1.04 - (absDeg / 70) * 0.14) * hoverScaleRef.current[i];

          let opacity = 1.0;
          if (absDeg > 54) {
            opacity = Math.max(0, Math.min(1, (72 - absDeg) / 18));
          }

          const zIndex = Math.round((1.0 - Math.min(1.0, absDeg / 70)) * 20) + 1;

          const tx = x - cardBase / 2;
          const ty = y - cardBase / 2;

          cardEl.style.width = `${cardBase}px`;
          cardEl.style.height = `${cardBase}px`;
          cardEl.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${scale.toFixed(4)})`;
          cardEl.style.opacity = opacity.toFixed(3);
          cardEl.style.zIndex = String(hoveredCard === i ? 40 : zIndex);
        }
      }

      rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
    },
    [getDesktopCardSize, hoveredCard, cards.length]
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

  // Hover handlers
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
      const liveCardsTracks = cards.map((c) => c.trackObj).filter(Boolean) as Track[];
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

  // Shared Card Inner Markup (Clean, responsive badges & titles)
  const renderCardInner = (card: CardItem, i: number) => (
    <div
      className="relative w-full h-full rounded-[24px] sm:rounded-[28px] overflow-hidden border border-white/[0.12] transition-shadow duration-300 group"
      style={{
        boxShadow:
          hoveredCard === i
            ? '0 30px 80px -10px rgba(0,0,0,0.95), 0 0 0 1.5px rgba(255,255,255,0.3)'
            : '0 22px 55px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)',
      }}
    >
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

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* Top Right Pill Badge */}
      <div className="absolute top-2.5 sm:top-3.5 right-2.5 sm:right-3.5 z-10">
        <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-black/60 backdrop-blur-xl border border-white/15 rounded-full text-[10px] sm:text-[11px] font-semibold text-white/90 shadow-md">
          <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" />
          {card.genre || 'Trending'}
        </span>
      </div>

      {/* Bottom Track Title Pill */}
      <div className="absolute bottom-2.5 sm:bottom-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 z-10">
        <div className="bg-black/65 backdrop-blur-xl border border-white/15 rounded-xl sm:rounded-2xl px-2.5 sm:px-3.5 py-1.5 sm:py-2.5">
          <div className="flex items-center gap-1.5">
            <Music2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
            <p className="text-[11px] sm:text-[12px] font-bold text-white leading-tight truncate">
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
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              aria-label={`Play ${card.title}`}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-black text-black ml-0.5 sm:ml-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  // 1. PORTRAIT MOBILE: EXACT REPLICA OF IMAGE 2 (PROPORTIONAL & RESPONSIVE)
  // ═════════════════════════════════════════════════════════════════════════
  if (isPortraitMobile) {
    return (
      <div
        className="relative w-full h-[100dvh] min-h-[100dvh] bg-[#070707] text-white overflow-y-auto overflow-x-hidden select-none flex flex-col items-center justify-between px-4 sm:px-6 pt-3 sm:pt-4.5 pb-4 sm:pb-6"
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

        {/* 1. NAVBAR — Matching Image 2 */}
        <header
          className="shrink-0 z-40 mx-auto w-full"
          style={{
            maxWidth: 'min(94%, 480px)',
          }}
        >
          <div className="flex items-center justify-between gap-3 bg-[#141414]/90 backdrop-blur-2xl border border-white/[0.13] rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-[0_14px_45px_rgba(0,0,0,0.85)]">
            <button
              onClick={() => navigate('/')}
              className="font-black text-[18px] sm:text-[20px] tracking-[-0.03em] text-white uppercase cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
            >
              SONEXA
            </button>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="text-[12.5px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 hidden xs:block"
              >
                Sign In
              </button>
              <button
                id="landing-signup"
                onClick={() => navigate('/register')}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-white hover:bg-neutral-100 text-black text-[12px] sm:text-[13px] font-bold rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* 2. CARD FIELD — Controlled space below navbar matching Image 2 */}
        <div
          className="w-full flex items-center justify-center shrink-0"
          style={{
            marginTop: 'clamp(24px, 4.2vh, 44px)',
          }}
        >
          <div
            ref={cardFieldRef}
            className="hero-card-field relative w-full flex items-center justify-center overflow-visible pointer-events-none"
            style={{
              height: 'clamp(195px, 26vh, 245px)',
              minHeight: '190px',
            }}
          >
            {cards.slice(0, CARD_COUNT).map((card, i) => (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute pointer-events-auto cursor-pointer"
                style={{
                  width: 180,
                  height: 180,
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
                {renderCardInner(card, i)}
              </div>
            ))}
          </div>
        </div>

        {/* 3. HERO CONTENT: HEADING + DESCRIPTION + BUTTONS — Matching Image 2 */}
        <div
          className="w-full flex flex-col items-center text-center pointer-events-auto shrink-0 max-w-[520px]"
          style={{
            marginTop: 'clamp(26px, 4.8vh, 50px)',
          }}
        >
          {/* 3-line Hero Headline matching Image 2 */}
          <h1
            className="font-black text-white tracking-tight uppercase select-none drop-shadow-2xl mx-auto"
            style={{
              fontSize: 'clamp(40px, 10.5vw, 64px)',
              lineHeight: 0.93,
              maxWidth: 'min(90%, 340px)',
              letterSpacing: '-0.025em',
              wordBreak: 'normal',
              overflowWrap: 'break-word',
            }}
          >
            Music
            <br />
            <span className="text-neutral-200">
              For
              <br />
              Everyone.
            </span>
          </h1>

          {/* Description matching Image 2 */}
          <p
            className="text-neutral-300 font-medium leading-relaxed mx-auto drop-shadow-md px-2"
            style={{
              fontSize: 'clamp(13px, 3.4vw, 15px)',
              maxWidth: 'clamp(270px, 78vw, 360px)',
              marginTop: 'clamp(10px, 1.6vh, 16px)',
              lineHeight: 1.45,
            }}
          >
            Explore new music, save what you love, and make every listen your own.
          </p>

          {/* Stacked CTA Buttons matching Image 2: 1st is bigger than 2nd */}
          <div
            className="w-full flex flex-col items-center gap-3 sm:gap-3.5 pointer-events-auto mx-auto"
            style={{
              marginTop: 'clamp(20px, 3.2vh, 30px)',
            }}
          >
            {/* 1st Button: Bigger, wider, solid white */}
            <button
              id="landing-start-listening"
              onClick={() => navigate('/app')}
              className="w-full max-w-[250px] flex items-center justify-center gap-2 py-3.5 bg-white hover:bg-neutral-100 text-black text-[14px] sm:text-[14.5px] font-bold rounded-full transition-all shadow-[0_10px_28px_rgba(255,255,255,0.14)] hover:scale-105 active:scale-95 cursor-pointer min-h-[48px] touch-manipulation"
            >
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
              Start Listening
            </button>

            {/* 2nd Button: Smaller, narrower, dark with border */}
            <button
              id="landing-explore-music"
              onClick={() => navigate('/search')}
              className="w-full max-w-[190px] flex items-center justify-center gap-2 py-2.5 sm:py-3 bg-[#0f0f0f]/90 hover:bg-white/[0.08] border border-white/20 hover:border-white/35 text-white text-[12.5px] sm:text-[13px] font-semibold rounded-full transition-all backdrop-blur-xl hover:scale-105 active:scale-95 cursor-pointer min-h-[42px] touch-manipulation"
            >
              Explore Music
            </button>
          </div>
        </div>

        {/* Bottom space matching Image 2 */}
        <div
          className="shrink-0 w-full"
          style={{
            height: 'clamp(14px, 2.5vh, 30px)',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 2. LANDSCAPE MOBILE: VERIFIED & PRESERVED (DO NOT BREAK)
  // ═════════════════════════════════════════════════════════════════════════
  if (isLandscapeMobile) {
    return (
      <div
        className="relative w-full h-[100dvh] min-h-[100dvh] bg-[#070707] text-white overflow-y-auto overflow-x-hidden select-none flex flex-col justify-between items-center px-4 py-2 sm:py-3"
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

        {/* 1. NAVBAR — Landscape */}
        <header className="w-full max-w-[800px] shrink-0 z-40">
          <div className="flex items-center justify-between gap-3 bg-[#121212]/85 backdrop-blur-2xl border border-white/[0.09] rounded-full px-4 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
            <button
              onClick={() => navigate('/')}
              className="font-black text-[16px] tracking-[-0.03em] text-white uppercase cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
            >
              SONEXA
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate('/login')}
                className="text-[12px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 hidden xs:block"
              >
                Sign In
              </button>
              <button
                id="landing-signup"
                onClick={() => navigate('/register')}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-black text-[11px] font-bold rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
              >
                Sign Up
              </button>
            </div>
          </div>
        </header>

        {/* 2. MUSIC CARD FIELD — Landscape */}
        <div
          ref={cardFieldRef}
          className="hero-card-field relative w-full flex-1 flex items-center justify-center overflow-visible pointer-events-none my-auto"
          style={{
            minHeight: '80px',
            maxHeight: '120px',
          }}
        >
          {cards.slice(0, CARD_COUNT).map((card, i) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                width: 110,
                height: 110,
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
              {renderCardInner(card, i)}
            </div>
          ))}
        </div>

        {/* 3. HERO CONTENT — Landscape */}
        <div className="w-full shrink-0 flex flex-col items-center justify-center text-center max-w-[840px] z-30 pointer-events-auto">
          <div className="w-full space-y-1.5">
            <h1
              className="font-black text-white tracking-tight leading-[0.93] uppercase select-none drop-shadow-2xl mx-auto"
              style={{
                fontSize: 'clamp(1.15rem, 5vh, 1.7rem)',
                width: 'min(92%, 760px)',
              }}
            >
              Music
              <br />
              <span className="text-neutral-300">For everyone.</span>
            </h1>

            <p
              className="text-neutral-300 font-medium leading-relaxed max-w-[480px] mx-auto drop-shadow-md px-2"
              style={{
                fontSize: 'clamp(10px, 2.5vh, 12px)',
                maxWidth: 'min(90%, 460px)',
              }}
            >
              Explore new music, save what you love, and make every listen your own.
            </p>

            <div className="flex items-center justify-center gap-2.5 pointer-events-auto mx-auto pt-1">
              <button
                id="landing-start-listening"
                onClick={() => navigate('/app')}
                className="flex items-center justify-center gap-1.5 px-5 py-2 bg-white hover:bg-neutral-100 text-black text-[12px] font-bold rounded-full transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer min-h-[38px] touch-manipulation"
              >
                <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                Start Listening
              </button>
              <button
                id="landing-explore-music"
                onClick={() => navigate('/search')}
                className="flex items-center justify-center gap-1.5 px-4.5 py-2 bg-black/50 hover:bg-white/[0.08] border border-white/20 hover:border-white/40 text-white text-[12px] font-semibold rounded-full transition-all backdrop-blur-xl hover:scale-105 active:scale-95 cursor-pointer min-h-[38px] touch-manipulation"
              >
                Explore Music
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // 3. DESKTOP: EXACT SOURCE ORBITAL CROWN LAYOUT (100% UNCHANGED)
  // ═════════════════════════════════════════════════════════════════════════
  const desktopCardBase = getDesktopCardSize(viewport.w, viewport.h);

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

      {/* FLOATING PILL NAVBAR — Desktop */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-[800px] px-3 sm:px-4"
      >
        <div className="flex items-center justify-between gap-2.5 sm:gap-4 bg-[#121212]/80 backdrop-blur-2xl border border-white/[0.09] rounded-full px-3.5 sm:px-5 py-2 sm:py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          <button
            onClick={() => navigate('/')}
            className="font-black text-base sm:text-[18px] tracking-[-0.03em] text-white uppercase cursor-pointer shrink-0 hover:opacity-85 transition-opacity"
          >
            SONEXA
          </button>

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

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="text-[12px] font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer px-2 sm:px-2.5 hidden sm:block"
            >
              Sign In
            </button>
            <button
              id="landing-signup"
              onClick={() => navigate('/register')}
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-white hover:bg-neutral-100 text-black text-[11px] sm:text-[12px] font-bold rounded-full transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
            >
              Sign Up
            </button>
          </div>
        </div>
      </motion.header>

      {/* SMOOTH HALF-CIRCULAR ORBITAL LAYER — Desktop Crown */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {cards.slice(0, CARD_COUNT).map((card, i) => (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              width: desktopCardBase,
              height: desktopCardBase,
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
            {renderCardInner(card, i)}
          </div>
        ))}
      </div>

      {/* HERO CONTENT — Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-[4vh] sm:bottom-[5vh] lg:bottom-[6vh] flex flex-col items-center justify-center text-center z-30 pointer-events-none px-4 sm:px-6"
      >
        <div className="max-w-[840px] space-y-2 sm:space-y-3 lg:space-y-4">
          <h1
            className="font-black text-white tracking-tight leading-[0.92] uppercase select-none drop-shadow-2xl"
            style={{ fontSize: 'clamp(2rem, min(6.2vw, 9.2vh), 5.8rem)' }}
          >
            Music
            <br />
            <span className="text-neutral-300">For everyone.</span>
          </h1>

          <p className="text-[12.5px] sm:text-[14px] lg:text-[16px] text-neutral-300 font-medium leading-relaxed max-w-[540px] mx-auto pt-0.5 sm:pt-1 drop-shadow-md">
            Explore new music, save what you love, and make every listen your own.
          </p>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-2.5 pointer-events-auto flex-wrap">
            <button
              id="landing-start-listening"
              onClick={() => navigate('/app')}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3.5 bg-white hover:bg-neutral-100 text-black text-[13px] sm:text-[14px] font-bold rounded-full transition-all shadow-[0_8px_24px_rgba(255,255,255,0.08)] hover:shadow-[0_8px_28px_rgba(255,255,255,0.14)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black text-black ml-0.5" />
              Start Listening
            </button>
            <button
              id="landing-explore-music"
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 bg-black/50 hover:bg-white/[0.08] border border-white/20 hover:border-white/40 text-white text-[13px] sm:text-[14px] font-semibold rounded-full transition-all backdrop-blur-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore Music
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
