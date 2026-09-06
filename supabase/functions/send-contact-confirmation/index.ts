import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.8";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Pepegraphy <onboarding@resend.dev>";

const SMTP_HOST = Deno.env.get("SMTP_HOST");
const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || 587);
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");
const SENDER_NAME = Deno.env.get("SENDER_NAME") || "Pepegraphy";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || SMTP_USER;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const record = payload.record || payload;
    const { name, email, category, message } = record;

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Missing recipient name or email." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = String(email).trim();
    const recipientName = String(name).trim();
    const messageCategory = category ? String(category).trim() : "General";

    const confirmationHtml = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #13110f; color: #f3eee7; border: 1px solid #423a33; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #423a33;">
          <h1 style="color: #d0ad70; font-size: 24px; font-weight: 300; letter-spacing: 2px; margin: 0;">PEPEGRAPHY</h1>
          <p style="color: #81776e; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Photography by Petra Styasztny</p>
        </div>

        <div style="padding: 30px 0; line-height: 1.6;">
          <h2 style="color: #f3eee7; font-size: 20px; font-weight: 400; margin-top: 0;">Hello ${recipientName},</h2>
          <p style="color: #b9afa4; font-size: 15px;">Thank you for reaching out! We have received your message regarding <strong>${messageCategory}</strong> photography.</p>
          <p style="color: #b9afa4; font-size: 15px;">We review inquiries personally and will get back to you as soon as possible with details for your session.</p>

          <div style="background-color: #211d19; border-left: 3px solid #d0ad70; padding: 15px 20px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #81776e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">Your Message:</p>
            <p style="color: #f3eee7; font-size: 14px; font-style: italic; margin: 0; white-space: pre-wrap;">"${message}"</p>
          </div>

          <p style="color: #b9afa4; font-size: 15px;">Warm regards,<br><strong style="color: #d0ad70;">Petra Styasztny</strong><br>Pepegraphy Studio</p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #423a33; color: #81776e; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} Pepegraphy. Natural · Authentic · Timeless Photography</p>
        </div>
      </div>
    `;

    // Method A: Standard SMTP (Gmail / Outlook / cPanel / Webhost SMTP)
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      // Send to Visitor
      await transporter.sendMail({
        from: `"${SENDER_NAME}" <${SMTP_USER}>`,
        to: recipientEmail,
        subject: "Thank you for contacting Pepegraphy",
        html: confirmationHtml,
      });

      // Send to Admin
      if (ADMIN_EMAIL) {
        await transporter.sendMail({
          from: `"${SENDER_NAME} Contact Form" <${SMTP_USER}>`,
          to: ADMIN_EMAIL,
          subject: `New Inquiry from ${recipientName} (${messageCategory})`,
          html: `<p><strong>From:</strong> ${recipientName} (${recipientEmail})</p><p><strong>Category:</strong> ${messageCategory}</p><p><strong>Message:</strong></p><blockquote>${message}</blockquote>`,
        }).catch((err) => console.warn("Admin notification copy failed:", err));
      }

      return new Response(JSON.stringify({ success: true, method: "smtp" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Method B: Resend API
    if (RESEND_API_KEY) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [recipientEmail],
          subject: "Thank you for contacting Pepegraphy",
          html: confirmationHtml,
        }),
      });

      const resendData = await resendResponse.json();
      if (!resendResponse.ok) {
        throw new Error(resendData.message || "Resend API error.");
      }

      if (ADMIN_EMAIL) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `New Inquiry from ${recipientName} (${messageCategory})`,
            html: `<p><strong>From:</strong> ${recipientName} (${recipientEmail})</p><p><strong>Message:</strong></p><blockquote>${message}</blockquote>`,
          }),
        }).catch(() => {});
      }

      return new Response(JSON.stringify({ success: true, method: "resend", id: resendData.id }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Neither Resend API key nor SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS) are set.");
  } catch (error) {
    console.error("Confirmation email handler error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
