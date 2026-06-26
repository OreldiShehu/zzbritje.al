const { Resend } = require('resend');
const logger = require('./logger');

const getResend = () => new Resend((process.env.RESEND_API_KEY || '').replace(/[^\x20-\x7E]/g, ''));

const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'test') return { id: 'test' };
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: (process.env.EMAIL_FROM || 'Zbritje.al <onboarding@resend.dev>').replace(/[^\x20-\x7E]/g, ''),
      to,
      subject,
      html,
      text,
    });
    if (error) {
      logger.error('Email send failed:', error);
      throw new Error(error.message || 'Failed to send email');
    }
    logger.info(`Email sent to ${to}: ${data.id}`);
    return data;
  } catch (err) {
    logger.error('Email send failed:', err);
    throw err;
  }
};

const footer = `
  <div style="background:#0f172a;padding:32px 40px;text-align:center;">
    <p style="color:#16a34a;font-size:20px;font-weight:900;margin:0 0 4px;letter-spacing:1px;">Zbritje.al</p>
    <p style="color:#94a3b8;font-size:12px;margin:0 0 16px;">Albania's #1 Discount &amp; Voucher Marketplace</p>
    <div style="border-top:1px solid #1e293b;padding-top:16px;margin-top:8px;">
      <p style="color:#64748b;font-size:11px;margin:0 0 4px;">
        &copy; 2026 Zbritje.al &mdash; Tirana, Albania. All rights reserved.
      </p>
      <p style="color:#64748b;font-size:11px;margin:0 0 12px;">
        CEO &amp; Co-Founder: <span style="color:#94a3b8;font-weight:600;">Oreldi Shehu</span>
      </p>
      <p style="font-size:11px;margin:0;">
        <a href="${process.env.FRONTEND_URL}" style="color:#16a34a;text-decoration:none;">zbritje.site</a>
        &nbsp;&bull;&nbsp;
        <a href="${process.env.FRONTEND_URL}/privacy" style="color:#64748b;text-decoration:none;">Privacy Policy</a>
        &nbsp;&bull;&nbsp;
        <a href="${process.env.FRONTEND_URL}/contact" style="color:#64748b;text-decoration:none;">Contact</a>
      </p>
    </div>
  </div>
`;

const header = (title = 'Zbritje.al', subtitle = "Albania's #1 Discount Marketplace") => `
  <div style="background:#0f172a;padding:40px;text-align:center;">
    <h1 style="color:white;margin:0 0 6px;font-size:34px;font-weight:900;letter-spacing:1px;">${title}</h1>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0;">${subtitle}</p>
  </div>
`;

const templates = {
  welcome: (user, verifyToken) => ({
    subject: `Mirë se vini ne Zbritje.al, ${user.firstName}! Llogaria juaj eshte gati`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${header('Zbritje.al', "Albania's #1 Discount Marketplace")}
        <div style="padding:40px;">
          <h2 style="color:#111827;font-size:24px;margin:0 0 12px;">Mireserdhe, ${user.firstName}! 👋</h2>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px;">
            Faleminderit qe u regjistrove ne <strong>Zbritje.al</strong> — platforma me e madhe e ofertave dhe zbritjeve ne Shqiperi.
            Llogaria juaj eshte krijuar me sukses dhe tani keni qasje te plote ne te gjitha funksionalitetet tona.
          </p>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 24px;">
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email/${verifyToken}"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;letter-spacing:0.5px;">
              Verifiko Email-in Tim
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 32px;">
            Ky link vlefshmerie skadon pas <strong>24 oresh</strong>. Nese nuk e keni kerkuar kete, injorojeni kete email.
          </p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;padding:20px;margin:0 0 24px;">
            <p style="color:#166534;font-weight:700;margin:0 0 10px;font-size:15px;">Cfare mund te beni tani:</p>
            <ul style="color:#374151;margin:0;padding-left:20px;line-height:2;font-size:14px;">
              <li>Shfletoni <strong>qindra oferta</strong> nga bizneset me te mira</li>
              <li>Blini kupona me <strong>zbritje deri 90%</strong> dhe kurseni cdo dite</li>
              <li>Shkarkoni QR Code-in dhe perdoreni direkt te biznesi</li>
              <li>Referoni miqte dhe fitoni <strong>shperblime shtese</strong></li>
            </ul>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
            Nese keni pyetje ose keni nevoje per ndihme, jemi ketu per ju. Na kontaktoni ne cdo moment permes faqes sone ose ne WhatsApp.
          </p>
        </div>
        ${footer}
      </div>
    `,
  }),

  verifyEmail: (user, token) => ({
    subject: 'Verifiko email-in tend — Zbritje.al',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${header('Zbritje.al', 'Konfirmim Email-i')}
        <div style="padding:40px;">
          <h2 style="color:#111827;font-size:22px;margin:0 0 12px;">Konfirmo Adresen tuaj te Email-it</h2>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px;">
            Kemi marre nje kerkese per te verifikuar adresen tuaj te email-it ne <strong>Zbritje.al</strong>.
            Klikoni butonin me poshte per te konfirmuar adresen dhe per te aktivizuar llogarine tuaj.
          </p>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 28px;">
            Pas verifikimit do te merrni <strong style="color:#16a34a;">200 ALL bonus</strong> direkt ne portofolin tuaj si shperblim per t'u bashkuar me komunitetin tone.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/verify-email/${token}"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
              Verifiko Email-in
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 24px;">
            Ky link skadon pas <strong>24 oresh</strong>.
          </p>
          <div style="background:#fef9c3;border-left:4px solid #eab308;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="color:#713f12;font-size:13px;margin:0;">
              <strong>Kujdes:</strong> Nese nuk e keni kerkuar kete, injorojeni kete email. Llogaria juaj eshte e sigurt.
            </p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
            Per cdo pyetje, na kontaktoni ne <a href="${process.env.FRONTEND_URL}/contact" style="color:#16a34a;">faqen tone</a>.
          </p>
        </div>
        ${footer}
      </div>
    `,
  }),

  passwordReset: (user, token) => ({
    subject: 'Rivendos fjalekalimin — Zbritje.al',
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${header('Zbritje.al', 'Rivendosje Fjalekalimi')}
        <div style="padding:40px;">
          <h2 style="color:#111827;font-size:22px;margin:0 0 12px;">Rivendosni Fjalekalimin tuaj 🔐</h2>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px;">
            Kemi marre nje kerkese per rivendosjen e fjalekalimit te llogarise suaj ne <strong>Zbritje.al</strong>.
            Nese ju e keni bere kete kerkese, klikoni butonin me poshte per te vazhduar.
          </p>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 28px;">
            Zgjidhni nje fjalekalim te ri te forte qe permban te pakten 8 karaktere, numra dhe simbole per te mbrojtur llogarinë tuaj.
          </p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password/${token}"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
              Rivendos Fjalekalimin
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;margin:0 0 24px;">
            Ky link skadon pas <strong>1 ore</strong> per arsye sigurie.
          </p>
          <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:16px;margin:0 0 24px;">
            <p style="color:#7f1d1d;font-size:13px;margin:0;">
              <strong>Nese nuk e keni kerkuar kete:</strong> Injorojeni kete email menjëherë dhe sigurohuni qe llogaria juaj eshte e sigurt. Fjalekalimi juaj aktual mbetet i pandryshuar.
            </p>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">
            Per cdo problem ose dyshim, na kontaktoni menjehere ne <a href="${process.env.FRONTEND_URL}/contact" style="color:#16a34a;">faqen tone</a>.
          </p>
        </div>
        ${footer}
      </div>
    `,
  }),

  voucherPurchased: (user, voucher, deal) => ({
    subject: `Blerja u krye! Kuponi yt per: ${deal.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${header('Zbritje.al', 'Konfirmim Blerje')}
        <div style="padding:40px;">
          <h2 style="color:#111827;font-size:22px;margin:0 0 8px;">Blerja u Krye me Sukses! 🎉</h2>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 24px;">
            Pershendetje <strong>${user.firstName}</strong>, faleminderit per blerjen tuaj ne Zbritje.al!
            Me poshte gjeni te gjitha detajet e kuponit tuaj. Ruajeni kete email si konfirmim blerje.
          </p>
          <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #16a34a;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
            <p style="font-size:13px;color:#6b7280;margin:0 0 8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Kodi i Kuponit</p>
            <p style="font-size:28px;font-weight:900;color:#16a34a;letter-spacing:6px;margin:0 0 8px;">${voucher.code}</p>
            <p style="font-size:12px;color:#6b7280;margin:0;">Paraqiteni kete kod te biznesi per te perfituar zbritjen</p>
          </div>
          <div style="background:#f8fafc;border-radius:10px;padding:20px;margin:0 0 24px;">
            <p style="color:#374151;font-weight:700;margin:0 0 14px;font-size:15px;">Detajet e Blerjes:</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Oferta</td><td style="padding:8px 0;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #e5e7eb;">${deal.title}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Cmimi i Paguar</td><td style="padding:8px 0;color:#16a34a;font-weight:700;text-align:right;border-bottom:1px solid #e5e7eb;">${Math.ceil((voucher.paidPrice || 0) / 100) * 100} L</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Data e Blerjes</td><td style="padding:8px 0;color:#111827;font-weight:600;text-align:right;border-bottom:1px solid #e5e7eb;">${new Date().toLocaleDateString('sq-AL')}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Skadon me</td><td style="padding:8px 0;color:#ef4444;font-weight:600;text-align:right;">${new Date(voucher.expiresAt).toLocaleDateString('sq-AL')}</td></tr>
            </table>
          </div>
          <div style="background:#fef9c3;border-left:4px solid #eab308;border-radius:8px;padding:16px;margin:0 0 28px;">
            <p style="color:#713f12;font-size:13px;margin:0;line-height:1.6;">
              <strong>Si ta perdorni:</strong> Paraqitni kodin ose QR Code-in te punonjesit i biznesit. Mund ta gjeni QR Code-in edhe ne panelin tuaj personal ne Zbritje.al.
            </p>
          </div>
          <div style="text-align:center;margin:0 0 24px;">
            <a href="${process.env.FRONTEND_URL}/dashboard/vouchers"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
              Shiko Kuponin &amp; QR Code
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;text-align:center;line-height:1.6;margin:0;">
            Keni nje problem? Na kontaktoni dhe do te jemi ketu per ju menjehere.
          </p>
        </div>
        ${footer}
      </div>
    `,
  }),

  dealApproved: (business, deal) => ({
    subject: `Oferta u aprovua dhe eshte Live! — ${deal.title}`,
    html: `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        ${header('Zbritje.al', 'Konfirmim per Biznesin')}
        <div style="padding:40px;">
          <h2 style="color:#111827;font-size:22px;margin:0 0 12px;">Oferta juaj eshte Live! ✅</h2>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px;">
            Lajme te mira! Oferta juaj <strong>"${deal.title}"</strong> u aprovua nga ekipi i Zbritje.al dhe tani eshte e dukshme per te gjithe klientet ne platforme.
          </p>
          <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 24px;">
            Klientet mund ta shohin, ta blejne dhe ta perdorin kupone tuaj direkt nga telefoni i tyre. Sigurohuni qe stafi juaj eshte i informuar dhe gati per te skanuar QR Code-et.
          </p>
          <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;padding:20px;margin:0 0 24px;">
            <p style="color:#166534;font-weight:700;margin:0 0 10px;font-size:15px;">Keshilla per sukses:</p>
            <ul style="color:#374151;margin:0;padding-left:20px;line-height:2;font-size:14px;">
              <li>Sigurohuni qe stafi njeh proceduren e skanimit te QR Code</li>
              <li>Kontrolloni panelin e biznesit per kupone te blerë</li>
              <li>Perditesoni oferten nese ndryshojne kushtet</li>
              <li>Na kontaktoni nese keni nevoje per ndihme teknike</li>
            </ul>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.FRONTEND_URL}/deals/${deal.slug}"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;margin:0 8px 8px 0;">
              Shiko Oferten Live
            </a>
            <a href="${process.env.FRONTEND_URL}/business-dashboard"
               style="background:#0f172a;color:white;padding:16px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;margin:0 0 8px;">
              Paneli i Biznesit
            </a>
          </div>
          <p style="color:#6b7280;font-size:14px;line-height:1.6;text-align:center;margin:0;">
            Faleminderit qe jeni partner i Zbritje.al. Se bashku krijojme me shume mundesi per klientet shqiptare.
          </p>
        </div>
        ${footer}
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates };
