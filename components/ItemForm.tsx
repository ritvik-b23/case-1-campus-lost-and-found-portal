'use client';

import { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import type { ItemFormData } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { validateItem, hasErrors, type ValidationErrors } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface ItemFormProps {
  userId: string;
  userName: string;
  onSuccess: () => void;
}

const EMPTY_FORM: ItemFormData = {
  type: 'lost',
  title: '',
  category: '',
  description: '',
  location: '',
  date: new Date().toISOString().split('T')[0],
  image_url: null,
  color: '',
  brand: '',
  identifying_details: '',
  contact_name: '',
  contact_email: '',
};

export default function ItemForm({ userId, userName, onSuccess }: ItemFormProps) {
  const supabase = createClient();
  const [form, setForm]         = useState<ItemFormData>({ ...EMPTY_FORM, contact_name: userName });
  const [errors, setErrors]     = useState<ValidationErrors>({});
  const [preview, setPreview]   = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(field: keyof ItemFormData, value: string | null) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop() ?? 'jpg';
      const path = `${userId}/${uuidv4()}.${ext}`;
      const { error } = await supabase.storage
        .from('item-images')
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('item-images').getPublicUrl(path);
      update('image_url', urlData.publicUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setPreview(null);
    update('image_url', null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateItem(form);
    if (hasErrors(errs)) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('items').insert({
        ...form,
        posted_by_user_id: userId,
        posted_by_name: userName,
        status: 'open',
      });
      if (error) throw error;
      setSuccess(true);
      setForm({ ...EMPTY_FORM, contact_name: userName });
      setPreview(null);
      setTimeout(() => { setSuccess(false); onSuccess(); }, 1500);
    } catch (err) {
      console.error('Submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: string) =>
    cn(
      'w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent',
      errors[field] ? 'border-red-300' : 'border-slate-200'
    );

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl">✅</div>
        <p className="text-base font-semibold text-slate-700">Item posted successfully!</p>
        <p className="text-sm text-slate-400">Switching to feed…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate aria-label="Post a lost or found item">
      {/* Lost / Found toggle */}
      <div>
        <span className="text-sm font-semibold text-slate-700 block mb-2">Item type *</span>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 w-fit">
          {(['lost', 'found'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update('type', t)}
              className={cn(
                'px-6 py-2.5 text-sm font-semibold capitalize transition-colors',
                form.type === t
                  ? t === 'lost'
                    ? 'bg-red-500 text-white'
                    : 'bg-teal-500 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              )}
              aria-pressed={form.type === t}
            >
              {t === 'lost' ? '📢 Lost' : '🎯 Found'}
            </button>
          ))}
        </div>
      </div>

      {/* Photo upload */}
      <div>
        <span className="text-sm font-semibold text-slate-700 block mb-2">Photo (optional)</span>
        {preview ? (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Uploading…</span>
              </div>
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-colors bg-white">
            <Camera className="w-8 h-8 text-slate-300 mb-2" aria-hidden="true" />
            <span className="text-sm text-slate-400 font-medium">Click to upload photo</span>
            <span className="text-xs text-slate-300 mt-1">JPG, PNG, WEBP up to 10MB</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="Upload item photo"
            />
            <Upload className="w-4 h-4 text-slate-300 mt-2" aria-hidden="true" />
          </label>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="text-sm font-semibold text-slate-700 block mb-1">Title *</label>
        <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Black leather wallet" className={inputClass('title')} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="text-sm font-semibold text-slate-700 block mb-1">Category *</label>
        <select id="category" value={form.category} onChange={(e) => update('category', e.target.value)}
          className={inputClass('category')}>
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-sm font-semibold text-slate-700 block mb-1">Description *</label>
        <textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)}
          placeholder="Describe the item in detail — colour, size, contents, condition…"
          rows={3} className={cn(inputClass('description'), 'resize-none')} />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      {/* Location + Date row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="location" className="text-sm font-semibold text-slate-700 block mb-1">Location *</label>
          <input id="location" value={form.location} onChange={(e) => update('location', e.target.value)}
            placeholder="e.g. Library, 2nd floor" className={inputClass('location')} />
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>
        <div>
          <label htmlFor="date" className="text-sm font-semibold text-slate-700 block mb-1">Date *</label>
          <input id="date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
            className={inputClass('date')} />
          {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
        </div>
      </div>

      {/* Color + Brand row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="color" className="text-sm font-semibold text-slate-700 block mb-1">Color</label>
          <input id="color" value={form.color ?? ''} onChange={(e) => update('color', e.target.value)}
            placeholder="e.g. Black" className={inputClass('color')} />
        </div>
        <div>
          <label htmlFor="brand" className="text-sm font-semibold text-slate-700 block mb-1">Brand</label>
          <input id="brand" value={form.brand ?? ''} onChange={(e) => update('brand', e.target.value)}
            placeholder="e.g. Apple, Casio" className={inputClass('brand')} />
        </div>
      </div>

      {/* Identifying details */}
      <div>
        <label htmlFor="identifying_details" className="text-sm font-semibold text-slate-700 block mb-1">
          Identifying details
        </label>
        <input id="identifying_details" value={form.identifying_details ?? ''}
          onChange={(e) => update('identifying_details', e.target.value)}
          placeholder="Stickers, scratches, engravings, contents inside…"
          className={inputClass('identifying_details')} />
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact_name" className="text-sm font-semibold text-slate-700 block mb-1">Your name *</label>
          <input id="contact_name" value={form.contact_name} onChange={(e) => update('contact_name', e.target.value)}
            className={inputClass('contact_name')} />
          {errors.contact_name && <p className="text-xs text-red-500 mt-1">{errors.contact_name}</p>}
        </div>
        <div>
          <label htmlFor="contact_email" className="text-sm font-semibold text-slate-700 block mb-1">Email *</label>
          <input id="contact_email" type="email" value={form.contact_email}
            onChange={(e) => update('contact_email', e.target.value)}
            className={inputClass('contact_email')} />
          {errors.contact_email && <p className="text-xs text-red-500 mt-1">{errors.contact_email}</p>}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm"
      >
        {submitting ? 'Posting…' : uploading ? 'Uploading photo…' : `Post ${form.type === 'lost' ? 'Lost' : 'Found'} Item`}
      </button>
    </form>
  );
}
