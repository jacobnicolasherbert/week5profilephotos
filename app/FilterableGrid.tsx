"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";

export default function FilterableGrid({ 
  initialCards, 
  categories, 
  user, 
  onEdit, 
  onDelete,
  editingId,
  editFormData,
  setEditFormData,
  handleSave,
  setEditingId
}: any) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCards = activeCategory 
    ? initialCards.filter((card: any) => card.category_id === activeCategory)
    : initialCards;

  return (
    <div className="space-y-10">
      {/* Category Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
            activeCategory === null 
            ? 'bg-slate-900 text-white border-slate-900' 
            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
          }`}
        >
          All
        </button>

        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={activeCategory === cat.id ? { backgroundColor: cat.color_hex } : {}}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
              activeCategory === cat.id 
                ? `text-white border-transparent shadow-lg scale-105` 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredCards.map((card: any) => (
            <BusinessCard 
              key={card.id} 
              card={card} 
              user={user} 
              isEditing={editingId === card.id}
              onEdit={() => onEdit(card)}
              onDelete={() => onDelete(card)}
              editFormData={editFormData}
              setEditFormData={setEditFormData}
              handleSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredCards.length === 0 && (
        <div className="text-center py-20 text-slate-400">No cards found in this category.</div>
      )}
    </div>
  );
}

function BusinessCard({ card, user, isEditing, onEdit, onDelete, editFormData, setEditFormData, handleSave, onCancel }: any) {
  const avatarUrl = card.profile_photo_url || `https://api.dicebear.com/7.x/personas/svg?seed=${card.id}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  const accentColor = card.categories?.color_hex ?? "#94a3b8";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
    >
      <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-sm">
            <img src={avatarUrl} alt={card.name} className="h-full w-full object-cover" />
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white shadow-sm"
            style={{ backgroundColor: accentColor }}>
            {card.categories?.name ?? "Uncategorized"}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-2 mb-4">
            {["name", "title", "business", "email", "phone", "website"].map((field) => (
              <input key={field}
                className="w-full text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                value={editFormData[field] ?? ""}
                onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)} />
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleSave(card.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold uppercase hover:bg-blue-700 transition-colors">Save</button>
              <button onClick={onCancel} className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-xs font-bold uppercase hover:bg-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-900">{card.name}</h3>
            <p className="text-sm font-medium text-slate-500 italic">{card.title}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 uppercase tracking-tight">{card.business}</p>
            {user && (
              <div className="flex gap-2 mt-3">
                <button onClick={onEdit} className="text-[10px] bg-slate-50 text-blue-600 px-2 py-1 rounded border border-blue-100 font-bold uppercase hover:bg-blue-500 hover:text-white transition-colors">
                  Edit
                </button>
                <button onClick={onDelete} className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-bold uppercase hover:bg-red-600 hover:text-white transition-colors">
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto space-y-2 pt-4 border-t border-slate-50">
          <p className="flex items-center text-xs text-slate-600 truncate"><span className="mr-2 text-slate-400">✉</span> {card.email}</p>
          <p className="flex items-center text-xs text-slate-600"><span className="mr-2 text-slate-400">📞</span> {card.phone}</p>
          <a href={`https://${card.website}`} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-500 font-medium">
            <span className="mr-2 opacity-70">🌐</span> {card.website}
          </a>
        </div>
      </div>
    </motion.div>
  );
}