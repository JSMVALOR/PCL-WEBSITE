import { useEffect, useRef, useState } from 'react';
import { animate, motion, useMotionValue } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkBadge01Icon, Alert02Icon } from '@hugeicons/core-free-icons';

import './CodeSlots.css';

export default function CodeSlots({
  length = 6,
  value: controlledValue,
  onChange,
  onComplete,
  status: controlledStatus = 'idle',
  accentColor = '#f5f5f5',
  inkColor = '#f5f5f5',
  slotColor = '#27272a',
  digitColor = '#18181b',
  dangerColor = '#ff3b30',
  slotSize = 44,
  gap = 8,
  radius = 12,
  bounce = 0.2,
  settle = 0.3,
  rise = 8,
  cascade = 20,
  haptic = true,
  disabled = false,
  className = '',
  style
}) {
  const [internalValue, setInternalValue] = useState('');
  const [internalStatus, setInternalStatus] = useState('idle');
  const [fcs, setFcs] = useState(false);
  const inputRef = useRef(null);

  const val = controlledValue !== undefined ? controlledValue : internalValue;
  const status = controlledValue !== undefined ? controlledStatus : internalStatus;

  const y = useMotionValue(0);

  const triggerShake = () => {
    animate(y, [0, -4, 4, -4, 4, 0], { duration: 0.4, ease: 'easeInOut' });
  };

  useEffect(() => {
    if (status === 'error') triggerShake();
  }, [status]);

  const handleChange = e => {
    const v = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, length);
    if (controlledValue === undefined) {
      setInternalValue(v);
      setInternalStatus('idle');
    }
    onChange?.(v);
    if (v.length === length && v !== val) {
      if (haptic) navigator.vibrate?.(10);
      onComplete?.(v);
    }
  };

  const wrapFocus = () => {
    if (!disabled && status !== 'success') inputRef.current?.focus();
  };

  return (
    <div
      className={`code-slots ${className}`}
      data-status={status}
      data-focus={fcs ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      onClick={wrapFocus}
      style={{
        '--cs-length': length,
        '--cs-size': `${slotSize}px`,
        '--cs-gap': `${gap}px`,
        '--cs-radius': `${radius}px`,
        '--cs-accent': accentColor,
        '--cs-ink': inkColor,
        '--cs-slot': slotColor,
        '--cs-digit': digitColor,
        '--cs-danger': dangerColor,
        ...style
      }}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="one-time-code"
        className="code-slots__input"
        value={val}
        onChange={handleChange}
        onFocus={() => setFcs(true)}
        onBlur={() => setFcs(false)}
        disabled={disabled || status === 'success'}
        maxLength={length}
      />
      <motion.div className="code-slots__track" style={{ y }}>
        {Array.from({ length }).map((_, i) => {
          const char = val[i] || '';
          const active = fcs && val.length === i;
          return (
            <div key={i} className="code-slots__slot" data-active={active ? '' : undefined}>
              {char && (
                <motion.span
                  className="code-slots__char"
                  initial={{ opacity: 0, y: rise }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', duration: settle, bounce }}
                >
                  {char}
                </motion.span>
              )}
            </div>
          );
        })}
      </motion.div>
      <div className="code-slots__indicator">
        {status === 'success' && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} color={accentColor} />}
        {status === 'error' && <HugeiconsIcon icon={Alert02Icon} size={16} color={dangerColor} />}
      </div>
    </div>
  );
}
