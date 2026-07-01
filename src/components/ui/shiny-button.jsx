"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ShinyButton = ({
  children,
  className,
  textClassName,
  onClick,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl px-5 py-2.5 font-bold transition-all duration-300 flex items-center justify-center border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary text-sm backdrop-blur-md shadow-sm hover:shadow-md hover:shadow-primary/5",
        className
      )}
      {...props}
    >
      {/* The text content */}
      <span className={cn("relative z-20 flex items-center gap-2", textClassName)}>
        {children}
      </span>

      {/* Moving Shiny Highlight Overlay */}
      <motion.div
        initial={{ x: "-150%", skewX: -20 }}
        animate={{ x: "150%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 2.2,
          repeatDelay: 1.5,
          ease: "easeInOut"
        }}
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-10"
      />
      
      {/* Reflection highlight */}
      <div className="absolute inset-0 rounded-[inherit] border border-white/10 pointer-events-none z-30" />
    </motion.button>
  );
};

export default ShinyButton;
