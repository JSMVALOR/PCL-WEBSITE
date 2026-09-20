import { useEffect, useState } from 'react';
import { motion, useAnimation, useAnimationControls } from 'framer-motion';

import './HoldButton.css';

const onColor = hex => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return '#ffffff';
  const h = m[1].length === 3 ? [...m[1]].map(ch => ch + ch).join('') : m[1];
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150 ? '#111111' : '#ffffff';
};

export default function HoldButton({
  children = 'Hold to delete',
  doneLabel = 'Deleted',
  icon,
  doneIcon,
  backgroundColor = '#27272a',
  fillColor = '#5227FF',
  textColor = '#f5f5f5',
  fillTextColor,
  size = 'md',
  radius = 14,
  fillDirection = 'right',
  holdTime = 2000,
  releaseTime = 200,
  pressScale = 0.97,
  wave = true,
  waveAmplitude = 6,
  glow = true,
  resetAfter = 1200,
  onHold,
  className = '',
  style
}) {
  const [phase, setPhase] = useState('idle');
  const fillControls = useAnimationControls();
  const labelControls = useAnimationControls();
  const textControls = useAnimationControls();
  const [resetTimer, setResetTimer] = useState(null);

  const fillText = fillTextColor || onColor(fillColor);
  const isRight = fillDirection === 'right';

  useEffect(() => {
    return () => {
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [resetTimer]);

  const fire = () => {
    setPhase('done');
    onHold?.();
    if (resetAfter > 0) {
      const t = setTimeout(() => {
        setPhase('idle');
        fillControls.set({ scaleX: 0 });
        labelControls.set({ y: 0, opacity: 1, filter: 'blur(0px)' });
        textControls.set({ color: textColor });
      }, resetAfter);
      setResetTimer(t);
    }
  };

  const press = () => {
    if (phase === 'done') return;
    setPhase('holding');
    fillControls.start({
      scaleX: 1,
      transition: { duration: holdTime / 1000, ease: 'linear' }
    });
    textControls.start({
      color: fillText,
      transition: { duration: holdTime / 1000, ease: 'linear' }
    });
  };

  const release = () => {
    if (phase === 'done') return;
    setPhase('idle');
    fillControls.stop();
    textControls.stop();
    fillControls.start({
      scaleX: 0,
      transition: { duration: releaseTime / 1000, ease: 'easeOut' }
    });
    textControls.start({
      color: textColor,
      transition: { duration: releaseTime / 1000, ease: 'easeOut' }
    });
  };

  useEffect(() => {
    if (phase === 'holding') {
      const t = setTimeout(fire, holdTime);
      return () => clearTimeout(t);
    }
  }, [phase, holdTime]);

  useEffect(() => {
    if (phase === 'done') {
      labelControls.start({
        y: -12,
        opacity: 0,
        filter: 'blur(4px)',
        transition: { duration: 0.2, ease: 'easeIn' }
      });
    }
  }, [phase, labelControls]);

  return (
    <motion.button
      type="button"
      className={`hold-button hold-button--${size} ${className}`}
      data-phase={phase}
      onPointerDown={e => {
        if (e.button === 0) press();
      }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={e => e.preventDefault()}
      whileTap={phase !== 'done' ? { scale: pressScale } : {}}
      style={{
        '--hb-bg': backgroundColor,
        '--hb-fill': fillColor,
        '--hb-text': textColor,
        '--hb-r': `${radius}px`,
        '--hb-glow': glow ? fillColor : 'transparent',
        ...style
      }}
    >
      <div className="hold-button__bg" />
      
      <motion.div
        className="hold-button__fill"
        initial={{ scaleX: 0 }}
        animate={fillControls}
        style={{ originX: isRight ? 0 : 1 }}
      />
      
      {wave && phase === 'holding' && (
        <motion.div
          className="hold-button__wave"
          initial={{ x: isRight ? '-100%' : '100%' }}
          animate={{
            x: isRight ? [`-100%`, `-${100 - waveAmplitude}%`] : [`100%`, `${100 - waveAmplitude}%`]
          }}
          transition={{
            repeat: Infinity,
            repeatType: 'mirror',
            duration: 0.8,
            ease: 'easeInOut'
          }}
          style={{ [isRight ? 'left' : 'right']: 0 }}
        />
      )}

      <div className="hold-button__content">
        <motion.div className="hold-button__label" animate={labelControls}>
          <motion.span animate={textControls} className="hold-button__text">
            {icon && <span className="hold-button__icon">{icon}</span>}
            {children}
          </motion.span>
        </motion.div>
        
        {phase === 'done' && (
          <motion.div
            className="hold-button__done"
            initial={{ y: 12, opacity: 0, filter: 'blur(4px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {doneIcon && <span className="hold-button__icon">{doneIcon}</span>}
            {doneLabel}
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
