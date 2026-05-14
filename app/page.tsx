"use client";

export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FilterableGrid from "./FilterableGrid"; // Ensure this matches your file structure

const EMPTY_FORM = {
  name: "", title: "", business: "", email: "", phone: "", website: "", category_id: "",
};

export default function Page() {
  // State Management
  const [cards, setCards] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  
  // Add State
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState<any>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Data and Auth Status
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    const fetchData = async () => {
      const [cardsRes, catsRes] = await Promise.all([
        supabase.from("cards").select("*"),
        supabase.from("categories").select("*"),
      ]);

      if (!catsRes.error && catsRes.data && !cardsRes.error && cardsRes.data) {
        const catMap = Object.fromEntries(catsRes.data.map((cat) => [cat.id, cat]));
        const merged = cardsRes.data.map((card) => ({
          ...card, 
          categories: catMap[card.category_id] ?? null,
        }));
        setCards(merged);
        setCategories(catsRes.data);
      }
      setLoading(false);
    };

    getUser();
    fetchData();
  }, []);

  // Handlers
  const handleEditClick = (card: any) => {
    setEditingId(card.id);
    setEditFormData({ ...card });
  };

  const handleSave = async (id: string) => {
    const { name, title, business, email, phone, website } = editFormData;
    const { error } = await supabase.from("cards").update({ name, title, business, email, phone, website }).eq("id", id);
    
    if (error) { 
      toast.error(`Update failed: ${error.message}`); 
    } else { 
      setCards(cards.map((c) => (c.id === id ? { ...c, ...editFormData } : c))); 
      setEditingId(null); 
      toast.success("Card updated successfully!");
    }
  };

  const handleAdd = async () => {
    const cat = categories.find((c) => c.id === addFormData.category_id) ?? null;
    const { name, title, business, email, phone, website, category_id } = addFormData;
    
    if (!name.trim()) return toast.error("Name is required.");
    setAdding(true);
    
    const { data, error } = await supabase.from("cards")
      .insert([{ name, title, business, email, phone, website, category_id: category_id || null }])
      .select().single();

    if (error) { 
      toast.error(`Add failed: ${error.message}`); 
    } else { 
      setCards([...cards, { ...data, categories: cat }]); 
      setAddFormData(EMPTY_FORM); 
      setShowAddForm(false); 
      toast.success("New card added!");
    }
    setAdding(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    
    const { error } = await supabase.from('cards').delete().eq('id', deleteTarget.id);
    
    if (error) {
      toast.error('Delete failed: ' + error.message);
    } else {
      setCards(cards.filter((c) => c.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name}'s card deleted.`);
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleLogout = async () => { 
    await supabase.auth.signOut(); 
    setUser(null); 
  };

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading Directory...</div>;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation */}
        <nav className="flex justify-end mb-8">
          {user ? (
            <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-full shadow-sm border border-slate-200">
              <span className="text-sm font-medium text-slate-700">{user.email}</span>
              <button onClick={handleLogout} className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider">Sign Out</button>
            </div>
          ) : (
            <button onClick={handleLogin} className="flex items-center gap-2 bg-white text-slate-700 px-6 py-2 rounded-full font-semibold shadow-sm border border-slate-300 hover:bg-slate-50 transition-all">
              Sign in with Google
            </button>
          )}
        </nav>

        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">Professional Directory</h1>
          <p className="mt-4 text-xl text-slate-600">Connecting experts across {cards?.length || 0} unique businesses.</p>
          {user && (
            <button onClick={() => { setShowAddForm(!showAddForm); setAddFormData(EMPTY_FORM); }}
              className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-sm hover:bg-blue-700 transition-all">
              {showAddForm ? "Cancel" : "+ Add Business Card"}
            </button>
          )}
        </header>

        {/* Add Form */}
        {user && showAddForm && (
          <div className="mb-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-2xl mx-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-6">New Business Card</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {["name", "title", "business", "email", "phone"].map((key) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{key}</label>
                  <input className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none"
                    value={addFormData[key]}
                    onChange={(e) => setAddFormData({ ...addFormData, [key]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  value={addFormData.category_id}
                  onChange={(e) => setAddFormData({ ...addFormData, category_id: e.target.value })}>
                  <option value="">— Select a category —</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleAdd} disabled={adding} className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                {adding ? "Saving..." : "Save Card"}
              </button>
            </div>
          </div>
        )}

        {/* Filterable Grid Component */}
        <FilterableGrid 
          initialCards={cards} 
          categories={categories} 
          user={user}
          editingId={editingId}
          editFormData={editFormData}
          onEdit={handleEditClick}
          onDelete={setDeleteTarget}
          onSave={handleSave}
          onCancel={() => setEditingId(null)}
          setEditFormData={setEditFormData}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Business Card</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete <strong>{deleteTarget.name}</strong>'s card?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-5 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}