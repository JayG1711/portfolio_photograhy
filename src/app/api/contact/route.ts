import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service unavailable.' }, { status: 500 });
    }
    const resend = new Resend(apiKey);

    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    const safeMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'jayg2110624@gmail.com',
      replyTo: email,
      subject: `New Portfolio Enquiry from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;
          margin:0 auto;padding:24px;background:#f9f9f9;
          border-radius:8px;">
          <h2 style="color:#1a1a1a;border-bottom:2px solid #d4af37;
            padding-bottom:12px;">
            New Message from ${name}
          </h2>
          <p style="color:#444;font-size:14px;">
            <strong>From:</strong> ${name}
          </p>
          <p style="color:#444;font-size:14px;">
            <strong>Email:</strong> ${email}
          </p>
          <p style="color:#444;font-size:14px;margin-top:16px;">
            <strong>Message:</strong>
          </p>
          <p style="color:#222;font-size:15px;line-height:1.6;
            background:#fff;padding:16px;
            border-left:4px solid #d4af37;border-radius:4px;">
            ${safeMessage}
          </p>
          <p style="color:#999;font-size:12px;margin-top:24px;">
            Sent from Jay Gurav Portfolio Contact Form
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
