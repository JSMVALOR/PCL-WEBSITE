/* © 2026 JSM VALOR. All Rights Reserved. */
import React from 'react';
import { motion } from 'framer-motion';

export function GlassSurface({ 
 children, 
 className = "", 
 variant = "panel", 
 animated = false,
 ...props 
}) {
 const baseStyles = "relative overflow-hidden backdrop-blur-2xl border transition duration-300";
 
 const variants = {
 panel: "bg-themeElevated border-themeBorder rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
 card: "bg-themeElevated border-themeBorder hover:bg-black/10 rounded-2xl",
 interactive: "bg-themeElevated border-themeBorder hover:border-themeAccent/50 rounded-2xl cursor-pointer"
 };

 const Component = animated ? motion.div : 'div';
 const animationProps = animated ? {
 initial: { opacity: 0, y: 10 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, scale: 0.95 },
 transition: { duration: 0.2, ease: "easeOut" }
 } : {};

 return (
 <Component 
 className={`${baseStyles} ${variants[variant] || variants.panel} ${className}`}
 {...animationProps}
 {...props}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none" />
 <div className="relative z-10">
 {children}
 </div>
 </Component>
 );
}
