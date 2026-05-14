'use client';

import { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { Item } from '@/lib/types';
import { validateEmail } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { NotifyEvent } from '@/app/api/notify/route';

interface ClaimModalProps {
  item: Item;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ClaimModal({ item, claimantId, claimantName, claimantEmail, onClose, onSuccess }: ClaimModalProps) {
  const supabase = createClient();
  const [message, setMessage]     = useState('');
  const [proof, setProof]         = useState('');
  const [email, setEmail]         = useState(claimantEmail);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const isLostItem = item.type === 'lost';
  const title      = isLostItem
    ? 'I found something like this'
    : 'This item might be mine';

  const proofLabel = isLostItem
    ? 'Where and when did you find it?'
    : 'Describe one identifying detail only the owner would know';

  function validate() {
    const errs: Record<string, string> = {};
    if (!message.trim())       errs.message = 'Please add a message.';
    if (!proof.trim())         errs.proof   = 'Proof answer is required.';
    if (!validateEmail(email)) errs.email   = 'Valid email required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Insert claim
      const { error: claimError } = await supabase.from('claims').insert({
        item_id:          item.id,
        claimant_user_id: claimantId,
        claimant_name:    claimantName,
        claimant_email:   email,
        message,
        proof_answer:     proof,
        status:           'pending',
      });
      if (claimError) throw claimError;

      // Update item status to claim_pending
      await supabase.from('items').update({ status: 'claim_pending' }).eq('id', item.id);

      // Send email to poster (if they have a real email — seeded items won't trigger this meaningfully)
      if (item.contact_email) {
        const payload: NotifyEvent = {
          type:         'claim_submitted',
          posterEmail:  item.contact_email,
          posterName:   item.posted_by_name,
          itemTitle:    item.title,
          claimantName: claimantName,
          itemId:       item.id,
        };
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
    } catch (err) {
      console.error('Claim failed:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = (field: string) =>
    cn(
      'w-full px-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300',
      errors[field] ? 'border-red-300' : 'border-slate-200'
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="claim-title">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" aria-hidden="true" />
            <h2 id="claim-title" className="text-base font-bold text-slate-800">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item summary */}
        <div className="mx-5 mt-4 p-3 bg-slate-50 rounded-xl flex gap-3 items-start">
          <div className="text-2xl shrink-0" aria-hidden="true">
            {item.type === 'lost' ? '📢' : '🎯'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 line-clamp-1">{item.title}</p>
            <p className="text-xs text-slate-400">{item.location}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="claim-message" className="text-sm font-semibold text-slate-700 block mb-1">
              Your message *
            </label>
            <textarea
              id="claim-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isLostItem ? 'Describe where you found it and current condition…' : 'Explain why you think this is your item…'}
              rows={3}
              className={cn(inputClass('message'), 'resize-none')}
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
          </div>

          <div>
            <label htmlFor="claim-proof" className="text-sm font-semibold text-slate-700 block mb-1">
              {proofLabel} *
            </label>
            <textarea
              id="claim-proof"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
              placeholder="Be specific — this helps the poster verify your claim."
              rows={2}
              className={cn(inputClass('proof'), 'resize-none')}
            />
            {errors.proof && <p className="text-xs text-red-500 mt-1">{errors.proof}</p>}
          </div>

          <div>
            <label htmlFor="claim-email" className="text-sm font-semibold text-slate-700 block mb-1">
              Contact email *
            </label>
            <input
              id="claim-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass('email')}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-bold rounded-xl transition-colors">
              {submitting ? 'Submitting…' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
