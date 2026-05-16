
import React from 'react';
import { cn } from '../utils/cn';

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children,
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25",
    secondary: "bg-white/10 text-gray-200 hover:bg-white/15 border border-white/10",
    outline: "border border-white/15 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white",
    destructive: "bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/25",
    ghost: "text-gray-300 hover:bg-white/10 hover:text-white",
    link: "text-blue-400 underline-offset-4 hover:underline"
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    sm: "px-3 py-1.5 text-xs",
    lg: "px-6 py-3 text-base",
    icon: "h-10 w-10"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>  
  );
});

Button.displayName = "Button";

export default Button;