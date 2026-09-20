import React, { useEffect, useState, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export default function SlideCommit({
  label = 'Slide to confirm',
  doneLabel = 'Confirmed',
  errorLabel = 'Failed',
  onConfirm,
  onDone,
  onError,
  width = '100%',
  height = 56,
  radius = 16,
  className = '',
  style
}) {
  const [phase, setPhase] = useState('idle');
  const [isDrag, setIsDrag] = useState(false);
  const containerRef = useRef(null);
  const [travel, setTravel] = useState(200); // Default fallback
  
  const handleSize = height - 12; // 6px padding on all sides

  useEffect(() => {
    if (containerRef.current) {
        const measuredWidth = containerRef.current.offsetWidth;
        setTravel(measuredWidth - handleSize - 12);
    }
    
    // Resize listener to adjust travel if container changes width
    const handleResize = () => {
        if (containerRef.current) {
            setTravel(containerRef.current.offsetWidth - handleSize - 12);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleSize]);

  const x = useMotionValue(0);
  const fillWidth = useTransform(x, v => v + handleSize + 12);
  const textOpacity = useTransform(x, [0, travel * 0.5], [1, 0]);

  const snapTo = (target, v = 0) =>
    animate(x, target, {
      type: 'spring',
      velocity: v,
      stiffness: 400,
      damping: 30,
    });

  const fire = async () => {
    if (!onConfirm) {
      setPhase('done');
      onDone?.();
      return;
    }
    setPhase('loading');
    try {
      await onConfirm();
      setPhase('done');
      onDone?.();
    } catch (err) {
      setPhase('error');
      onError?.(err);
    }
  };

  const handleDragEnd = (e, info) => {
    setIsDrag(false);
    if (phase !== 'idle') return;
    
    // If pulled more than 70% or flicked hard right
    if (x.get() >= travel * 0.70 || info.velocity.x > 200) {
      animate(x, travel, {
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }).then(fire);
    } else {
      snapTo(0, info.velocity.x);
    }
  };

  useEffect(() => {
    if (phase === 'done' || phase === 'error') {
      const t = setTimeout(() => {
        setPhase('idle');
        snapTo(0);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center overflow-hidden touch-none select-none ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: radius,
        backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light mode track
        ...style
      }}
    >
      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 shadow-inner"></div>

      {/* Fill bar */}
      <motion.div 
        className="absolute top-0 left-0 bottom-0 bg-emerald-500/10 border-r border-emerald-500/20"
        style={{ width: fillWidth }} 
      />
      
      {/* Label */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase tracking-widest text-themeTextSec dark:text-white/40 pointer-events-none"
        style={{ opacity: textOpacity, paddingLeft: handleSize }}
      >
        {label}
      </motion.div>

      {/* Overlays */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase tracking-widest text-emerald-500 bg-emerald-500/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'done' ? 1 : 0 }}
      >
        {doneLabel}
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center font-bold text-xs uppercase tracking-widest text-rose-500 bg-rose-500/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'error' ? 1 : 0 }}
      >
        {errorLabel}
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
        className="absolute left-[6px] bg-white dark:bg-themeElevated shadow-md border border-black/5 dark:border-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-[0.98] transition-transform z-10"
        style={{ 
            x, 
            width: handleSize, 
            height: handleSize, 
            borderRadius: radius - 6 
        }}
        drag={phase === 'idle' ? 'x' : false}
        dragConstraints={{ left: 0, right: travel }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={() => setIsDrag(true)}
        onDragEnd={handleDragEnd}
      >
        {phase === 'idle' && <i className="fa-solid fa-arrow-right text-themeTextSec dark:text-white/50 text-sm"></i>}
        {phase === 'loading' && <i className="fa-solid fa-circle-notch fa-spin text-themeTextSec dark:text-white/50 text-sm"></i>}
        {phase === 'done' && <i className="fa-solid fa-check text-emerald-500 text-sm"></i>}
        {phase === 'error' && <i className="fa-solid fa-xmark text-rose-500 text-sm"></i>}
      </motion.div>
    </div>
  );
}
