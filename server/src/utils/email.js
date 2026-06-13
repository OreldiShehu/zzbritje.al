const { Resend } = require('resend');
const logger = require('./logger');

const getResend = () => new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'test') return { id: 'test' };
  try {
    const resend = getResend();
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Zbritje.al <onboarding@resend.dev>',
      to,
      subject,
      html,
      text,
    });
    logger.info(`Email sent to ${to}: ${data.id}`);
    return data;
  } catch (err) {
    logger.error('Email send failed:', err);
    throw err;
  }
};

const templates = {
  welcome: (user) => ({
    subject: `Mirë se vini në Zbritje.al, ${user.firstName}! 🎉`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#16a34a,#10b981);padding:40px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:32px">Zbritje.al</h1>
          <p style="color:rgba(255,255,255,0.9);font-size:16px">Albania's #1 Discount Marketplace</p>
        </div>
        <div style="padding:40px;">
          <h2 style="color:#111827">Mirë se erdhe, ${user.firstName}! 👋</h2>
          <p style="color:#6b7280;line-height:1.6">Faleminderit që u regjistrove në Zbritje.al.
          Tani ke qasje në mijëra oferta dhe zbritje nga bizneset më të mira në Shqipëri.</p>
          <div style="margin:30px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email/${user._verifyToken}"
               style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
              Verifiko Email-in Tënd
            </a>
          </div>
          <p style="color:#6b7280;font-size:14px">Ky link skadon pas 24 orësh.</p>
          <hr style="border:1px solid #e5e7eb;margin:30px 0">
          <p style="color:#9ca3af;font-size:12px;text-align:center">
            © ${new Date().getFullYear()} Zbritje.al — Tiranë, Shqipëri
          </p>
        </div>
      </div>
    `,
  }),

  verifyEmail: (user, token) => ({
    subject: 'Verifiko email-in tënd — Zbritje.al',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#16a34a,#10b981);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0">Zbritje.al</h1>
        </div>
        <div style="padding:40px;">
          <h2>Konfirmo Adresën Email</h2>
          <p style="color:#6b7280">Kliko butonin më poshtë për të verifikuar email-in tënd:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email/${token}"
             style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:20px 0">
            Verifiko Email-in
          </a>
          <p style="color:#9ca3af;font-size:12px">Skadon pas 24 orësh.</p>
        </div>
      </div>
    `,
  }),

  passwordReset: (user, token) => ({
    subject: 'Rivendos fjalëkalimin — Zbritje.al',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#16a34a,#10b981);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0">Zbritje.al</h1>
        </div>
        <div style="padding:40px;">
          <h2>Rivendos Fjalëkalimin</h2>
          <p style="color:#6b7280">Ke kërkuar rivendosjen e fjalëkalimit. Kliko butonin:</p>
          <a href="${process.env.FRONTEND_URL}/reset-password/${token}"
             style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:20px 0">
            Rivendos Fjalëkalimin
          </a>
          <p style="color:#9ca3af;font-size:12px">Skadon pas 1 ore. Nëse nuk e ke kërkuar ti, injoroe.</p>
        </div>
      </div>
    `,
  }),

  voucherPurchased: (user, voucher, deal) => ({
    subject: `Voucher-i yt: ${deal.title} — Zbritje.al`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;">
        <div style="background:linear-gradient(135deg,#16a34a,#10b981);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0">Zbritje.al</h1>
        </div>
        <div style="padding:40px;">
          <h2>🎉 Blerja u Krye me Sukses!</h2>
          <p>Faleminderit, <strong>${user.firstName}</strong>!</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
            <p style="font-size:14px;color:#6b7280;margin:0 0 8px">Kodi i Voucher-it</p>
            <p style="font-size:24px;font-weight:bold;color:#16a34a;letter-spacing:4px;margin:0">${voucher.code}</p>
          </div>
          <p><strong>Deal:</strong> ${deal.title}</p>
          <p><strong>Cmimi:</strong> ${voucher.paidPrice} ALL</p>
          <p><strong>Skadon:</strong> ${new Date(voucher.expiresAt).toLocaleDateString('sq-AL')}</p>
          <p style="color:#6b7280;font-size:14px">Paraqit këtë kod ose QR code-in te biznesi për të përfituar zbritjen.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard/vouchers"
             style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:20px 0">
            Shiko Voucher-in
          </a>
        </div>
      </div>
    `,
  }),

  dealApproved: (business, deal) => ({
    subject: `Deal-i u aprovua: ${deal.title} — Zbritje.al`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
        <div style="background:linear-gradient(135deg,#16a34a,#10b981);padding:32px;text-align:center;">
          <h1 style="color:white;margin:0">Zbritje.al</h1>
        </div>
        <div style="padding:40px;">
          <h2>✅ Deal-i u Aprovua!</h2>
          <p>Deal-i juaj <strong>"${deal.title}"</strong> u aprovua dhe është live tani.</p>
          <a href="${process.env.FRONTEND_URL}/deals/${deal.slug}"
             style="background:#16a34a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;margin:20px 0">
            Shiko Deal-in
          </a>
        </div>
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
