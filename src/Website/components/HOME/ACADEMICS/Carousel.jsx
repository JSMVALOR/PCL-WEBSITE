/* © 2026 JSM Associates & Innovation. All Rights Reserved. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import './Carousel.css';

import { Link } from 'react-router-dom';

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring', stiffness: 300, damping: 30 };

function CarouselItem({ item, index, itemWidth, round, trackItemOffset, x, transition }) {
  const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
  const outputRange = [90, 0, -90];
  const rotateY = useTransform(x, range, outputRange, { clamp: false });

  return (
    <motion.div
      key={`${item?.id ?? index}-${index}`}
      className={`carousel-item ${round ? 'round' : ''}`}
      style={{
        width: itemWidth,
        height: round ? itemWidth : '100%',
        rotateY: rotateY,
        ...(round && { borderRadius: '50%' }),
        ...(item.customRender ? { background: 'transparent', border: 'none', boxShadow: 'none' } : {})
      }}
      transition={transition}
    >
      {item.customRender ? item.customRender(item) : (
        <>
          <div className={`carousel-item-header ${round ? 'round' : ''}`} style={{ padding: 0, height: '110px', overflow: 'hidden' }}>
            {item.image ? (
              <img decoding="async" loading="lazy" src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="carousel-icon-container">{item.icon}</span>
            )}
          </div>
          <div className="carousel-item-content">
            <h3 style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.degree}</h3>
            <div className="carousel-item-title">{item.title}</div>
            <p className="carousel-item-description" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
            {item.link && (
              <Link to={item.link} className="carousel-explore-btn" style={{ marginTop: 'auto', paddingTop: '10px' }}>
                View Details <ArrowRight size={13} className="carousel-explore-arrow" />
              </Link>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

export default function Carousel({
  items = [],
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false,
  showArrows = true,
  ariaLabel = 'Carousel'
}) {
  const containerPadding = 0; // Removed extra container padding to fit mobile better
  const itemWidth = baseWidth - containerPadding * 2;
  const trackItemOffset = itemWidth + GAP;
  const itemsForRender = useMemo(() => {
    if (!loop) return items;
    if (items.length === 0) return [];
    return [items[items.length - 1], ...items, items[0]];
  }, [items, loop]);

  const [position, setPosition] = useState(loop ? 1 : 0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ).current;

  const containerRef = useRef(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || itemsForRender.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = setInterval(() => {
      setPosition(prev => Math.min(prev + 1, itemsForRender.length - 1));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, itemsForRender.length]);

  useEffect(() => {
    const startingPosition = loop ? 1 : 0;
    setPosition(startingPosition);
    x.set(-startingPosition * trackItemOffset);
  }, [items.length, loop, trackItemOffset, x]);

  useEffect(() => {
    if (!loop && position > itemsForRender.length - 1) {
      setPosition(Math.max(0, itemsForRender.length - 1));
    }
  }, [itemsForRender.length, loop, position]);

  const effectiveTransition = isJumping || prefersReducedMotion ? { duration: 0 } : SPRING_OPTIONS;

  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    if (!loop || itemsForRender.length <= 1) {
      setIsAnimating(false);
      return;
    }
    const lastCloneIndex = itemsForRender.length - 1;

    if (position === lastCloneIndex) {
      setIsJumping(true);
      const target = 1;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    if (position === 0) {
      setIsJumping(true);
      const target = items.length;
      setPosition(target);
      x.set(-target * trackItemOffset);
      requestAnimationFrame(() => {
        setIsJumping(false);
        setIsAnimating(false);
      });
      return;
    }

    setIsAnimating(false);
  };

  const goTo = (idx) => {
    const max = itemsForRender.length - 1;
    setPosition(Math.max(0, Math.min(idx, max)));
  };
  const goNext = () => goTo(position + 1);
  const goPrev = () => goTo(position - 1);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  const handleDragEnd = (_, info) => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition(prev => {
      const next = prev + direction;
      const max = itemsForRender.length - 1;
      return Math.max(0, Math.min(next, max));
    });
  };

  const dragProps = loop
    ? {}
    : {
        dragConstraints: {
          left: -trackItemOffset * Math.max(itemsForRender.length - 1, 0),
          right: 0
        }
      };

  const activeIndex =
    items.length === 0 ? 0 : loop ? (position - 1 + items.length) % items.length : Math.min(position, items.length - 1);

  const atStart = !loop && position === 0;
  const atEnd = !loop && position === itemsForRender.length - 1;

  return (
    <div
      ref={containerRef}
      className={`carousel-container ${round ? 'round' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        width: `${baseWidth}px`,
        ...(round && { height: `${baseWidth}px`, borderRadius: '50%' })
      }}
    >
      <motion.div
        className="carousel-track"
        drag={isAnimating ? false : 'x'}
        {...dragProps}
        style={{
          width: itemWidth,
          gap: `${GAP}px`,
          perspective: 1000,
          perspectiveOrigin: `${position * trackItemOffset + itemWidth / 2}px 50%`,
          x
        }}
        onDragEnd={handleDragEnd}
        animate={{ x: -(position * trackItemOffset) }}
        transition={effectiveTransition}
        onAnimationStart={handleAnimationStart}
        onAnimationComplete={handleAnimationComplete}
      >
        {itemsForRender.map((item, index) => (
          <CarouselItem
            key={`${item?.id ?? index}-${index}`}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            trackItemOffset={trackItemOffset}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>

      <div className={`carousel-controls-container ${round ? 'round' : ''}`}>
        {showArrows && itemsForRender.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            disabled={atStart}
            aria-label="Previous slide"
            className="carousel-nav-btn carousel-nav-prev"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
        )}

        <div className="carousel-indicators-container">
          <div className="carousel-indicators">
            {items.map((_, index) => (
              <motion.button
                type="button"
                key={index}
                className={`carousel-indicator ${activeIndex === index ? 'active' : 'inactive'}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index}
                onClick={() => setPosition(loop ? index + 1 : index)}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>

        {showArrows && itemsForRender.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            disabled={atEnd}
            aria-label="Next slide"
            className="carousel-nav-btn carousel-nav-next"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
