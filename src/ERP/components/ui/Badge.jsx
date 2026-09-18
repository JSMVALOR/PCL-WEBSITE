/* © 2026 JSM VALOR. All Rights Reserved. */
import React from "react";

const badgeVariants = {
  default: "bg-themeAccent text-[#050505] hover:bg-themeAccent/90 border-transparent",
  secondary: "bg-themeElevated text-themeText hover:bg-themeBorder border-themeBorder",
  destructive: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20",
  outline: "text-themeText border-themeBorder hover:bg-themeElevated",
  ghost: "text-themeText hover:bg-themeElevated border-transparent",
  success: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20",
  info: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20" };

export function Badge({ 
  className = "", 
  variant = "default", 
  children, 
  ...props 
}) {
  const baseStyles = "inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium border transition-colors focus:outline-none";
  
  const variantStyles = badgeVariants[variant] || badgeVariants.default;
  
  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
