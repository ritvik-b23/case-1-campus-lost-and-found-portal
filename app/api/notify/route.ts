import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type NotifyEvent =
  | { type: 'claim_submitted'; posterEmail: string; posterName: string; itemTitle: string; claimantName: string; itemId: string }
  | { type: 'claim_approved';  claimantEmail: string; claimantName: string; itemTitle: string; itemId: string }
  | { type: 'claim_rejected';  claimantEmail: string; claimantName: string; itemTitle: string; itemId: string };

export async function POST(request: Request) {
  try {
    const event = (await request.json()) as NotifyEvent;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

    if (event.type === 'claim_submitted') {
      await resend.emails.send({
        from: 'FindIt Campus <onboarding@resend.dev>',
        to: [event.posterEmail],
        subject: `New claim on your item: "${event.itemTitle}"`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
            <h2 style="color:#4f46e5;margin-bottom:8px;">FindIt Campus</h2>
            <p style="color:#334155;font-size:16px;">Hi ${event.posterName},</p>
            <p style="color:#334155;">
              <strong>${event.claimantName}</strong> has submitted a claim on your item
              <strong>"${event.itemTitle}"</strong>.
            </p>
            <p style="color:#334155;">
              Log in to the portal to review the claim and approve or reject it.
            </p>
            <a href="${baseUrl}/item/${event.itemId}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">
              Review Claim →
            </a>
            <p style="margin-top:24px;color:#94a3b8;font-size:13px;">FindIt Campus · Campus Lost &amp; Found Portal</p>
          </div>`,
      });
    }

    if (event.type === 'claim_approved') {
      await resend.emails.send({
        from: 'FindIt Campus <onboarding@resend.dev>',
        to: [event.claimantEmail],
        subject: `Your claim was approved: "${event.itemTitle}"`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f0fdf4;border-radius:16px;">
            <h2 style="color:#16a34a;margin-bottom:8px;">FindIt Campus ✅</h2>
            <p style="color:#334155;font-size:16px;">Hi ${event.claimantName},</p>
            <p style="color:#334155;">
              Great news! Your claim for <strong>"${event.itemTitle}"</strong> has been
              <strong style="color:#16a34a;">approved</strong>.
            </p>
            <p style="color:#334155;">Contact the poster to arrange the handover. Check the item page for their contact info.</p>
            <a href="${baseUrl}/item/${event.itemId}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">
              View Item →
            </a>
            <p style="margin-top:24px;color:#94a3b8;font-size:13px;">FindIt Campus · Campus Lost &amp; Found Portal</p>
          </div>`,
      });
    }

    if (event.type === 'claim_rejected') {
      await resend.emails.send({
        from: 'FindIt Campus <onboarding@resend.dev>',
        to: [event.claimantEmail],
        subject: `Claim update for: "${event.itemTitle}"`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff7ed;border-radius:16px;">
            <h2 style="color:#ea580c;margin-bottom:8px;">FindIt Campus</h2>
            <p style="color:#334155;font-size:16px;">Hi ${event.claimantName},</p>
            <p style="color:#334155;">
              Your claim for <strong>"${event.itemTitle}"</strong> was not approved this time.
            </p>
            <p style="color:#334155;">If you believe this is an error, please contact the poster directly through the portal.</p>
            <a href="${baseUrl}/item/${event.itemId}"
               style="display:inline-block;margin-top:16px;padding:12px 24px;background:#ea580c;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;">
              View Item →
            </a>
            <p style="margin-top:24px;color:#94a3b8;font-size:13px;">FindIt Campus · Campus Lost &amp; Found Portal</p>
          </div>`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notify] email error:', err);
    // Non-fatal — don't break the claim flow if email fails
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
