import React, { useState, useRef, useEffect } from 'react';
import { IAB_CATEGORIES } from '../assets/constants/iabCategories';
import { Pencil } from 'lucide-react';

const CategoryDropdown = ({ value, onChange, label = 'Category', className = '', noLabel = false}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const dropdownRef = useRef();

  const selected = IAB_CATEGORIES.find((cat) => cat.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const index = IAB_CATEGORIES.findIndex((cat) => cat.id === value);
      setHighlightedIndex(index !== -1 ? index : 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, value]);

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % IAB_CATEGORIES.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + IAB_CATEGORIES.length) % IAB_CATEGORIES.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedCat = IAB_CATEGORIES[highlightedIndex];
      if (selectedCat) {
        onChange(selectedCat.id);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {!noLabel && <label className="text-sm font-medium mb-1 block">{label}</label>}
      <button
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className="w-full pr-2 pl-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-left flex items-center gap-2 text-sm text-white hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="truncate flex-1">{selected?.name || 'Select category'}</span>
        <Pencil className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
      </button>
      <div
        className={`absolute mt-1 w-full z-50 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-72 overflow-y-auto custom-scrollbar text-sm transition-all duration-200 origin-top ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        {IAB_CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            onClick={() => {
              onChange(cat.id);
              setOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(index)}
            className={`cursor-pointer px-3 py-2 flex items-center gap-2 text-white ${
              highlightedIndex === index ? 'bg-gray-700' : ''
            }`}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cat.color }}
            ></span>
            <span className="truncate">{cat.name}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          transition: background-color 0.2s;
        }

        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default CategoryDropdown;
