"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ZoomableImage({ src, alt, className }: { src: string, alt?: string, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <img 
        src={src} 
        alt={alt || "Image"} 
        className={`${className || ''} cursor-zoom-in hover:opacity-90 transition-opacity`} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }} 
      />
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-8 cursor-zoom-out"
          style={{ zIndex: 99999 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-red-400 bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-[100000]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X size={28} />
          </button>
          <img 
            src={src} 
            alt={alt || "Zoomed Image"} 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl cursor-default" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

