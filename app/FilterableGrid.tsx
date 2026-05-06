"use client";

import { useState } from 'react';
import * as motion from "framer-motion/client";

export default function FilterableGrid({ initialCards, categories }: { initialCards: any[], categories: any[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter logic
  const filteredCards = activeCategory 
    ? initialCards.filter(card => card.category_id === activeCategory)
    : initialCards;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
            activeCategory === null 
            ? 'bg-zinc-900 text-white border-zinc-900' 
            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              activeCategory === cat.id 
                ? `bg-${cat.tailwind_shade} text-white border-transparent shadow-lg scale-105` 
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCards.map((card) => (
          <BusinessCard key={card.id} card={card} />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-20 text-zinc-400">No cards found in this category.</div>
      )}
    </div>
  );
}

function BusinessCard({ card }: { card: any }) {
  const [name, title] = card.front_text.split('|').map((s: string) => s.trim());
  const avatarUrl = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(name)}`;
  const accentColor = `bg-${card.categories?.tailwind_shade}`;

  return (
    <motion.div
      layout // Smoothly animate cards changing position when filtering
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all group-hover:shadow-2xl">
        <div className={`absolute top-0 left-0 h-full w-2 ${accentColor}`} />
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-zinc-900">{name}</h2>
              <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">{title}</p>
            </div>
            <img src={avatarUrl} alt={name} className="h-14 w-14 rounded-full bg-zinc-50 border border-zinc-100" />
          </div>
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs font-mono text-zinc-400">{card.back_text.split('|')[0]}</p>
            <span className={`text-[10px] font-bold text-white px-2 py-1 rounded ${accentColor}`}>
              {card.categories?.name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}