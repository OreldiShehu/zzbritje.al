import { useState, useRef } from 'react';
import { FileText, Download, CheckCircle, X } from 'lucide-react';

const CONTRACT_VERSION = 'v1.0';
const PLATFORM_NIPT = 'L91234567C';

function buildContractHTML({ businessName, ownerName, signedAt, commissionRate, markupRate }) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Kontratë — ${businessName}</title><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Times New Roman',Times,serif;background:#fff;color:#111;padding:40px;max-width:800px;margin:0 auto;font-size:13px;line-height:1.8}
    h1{font-size:20px;font-weight:bold;text-align:center;margin-bottom:4px}
    .sub{text-align:center;font-size:12px;color:#555;margin-bottom:30px}
    h2{font-size:14px;font-weight:bold;margin-top:24px;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #ccc;padding-bottom:4px}
    p{margin-bottom:8px}
    ul{margin-left:20px;margin-bottom:8px}
    li{margin-bottom:4px}
    .box{border:1px solid #ccc;padding:16px;border-radius:4px;margin:20px 0;background:#f9f9f9}
    .sig-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:30px}
    .sig-block{border-top:1px solid #333;padding-top:8px;font-size:12px}
    .sig-block p{margin:2px 0}
    .header-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px}
    .nipt{font-size:11px;color:#555}
    @media print{body{padding:20px}@page{margin:15mm}}
  </style></head><body>
  <div class="header-row">
    <div>
      <div style="font-size:22px;font-weight:900;letter-spacing:-1px">Zbritje<span style="color:#1a3f8a">.al</span></div>
      <div class="nipt">NIPT: ${PLATFORM_NIPT} · Tiranë, Shqipëri</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#555">
      <div>Kontrata Nr: ${Date.now().toString(36).toUpperCase()}</div>
      <div>Data: ${signedAt}</div>
      <div>Versioni: ${CONTRACT_VERSION}</div>
    </div>
  </div>

  <h1>MARRËVESHJE BASHKËPUNIMI</h1>
  <p class="sub">ndërmjet Zbritje.al dhe Partnerit Biznes</p>

  <div class="box">
    <p><strong>Platforma:</strong> Zbritje.al · NIPT: ${PLATFORM_NIPT} · Tiranë, Shqipëri</p>
    <p><strong>Partneri Biznes:</strong> ${businessName}</p>
    <p><strong>Përfaqësuesi:</strong> ${ownerName}</p>
    <p><strong>Data e nënshkrimit:</strong> ${signedAt}</p>
  </div>

  <h2>1. Objekti i Marrëveshjes</h2>
  <p>Kjo marrëveshje rregullon kushtet e bashkëpunimit ndërmjet platformës dixhitale <strong>Zbritje.al</strong> dhe partnerit biznes të identifikuar më sipër, lidhur me publikimin dhe shitjen e kuponave/deal-eve nëpërmjet platformës.</p>

  <h2>2. Tarifa e Platformës</h2>
  <ul>
    <li><strong>Biznesi nuk paguan asnjë komision.</strong> Tarifa e platformës është <strong>${markupRate}% markup</strong> i shtuar mbi çmimin bazë të biznesit dhe paguhet ekskluzivisht nga klienti.</li>
    <li>Klienti paguan: çmimi juaj bazë + ${markupRate}% markup platformës.</li>
    <li>Biznesi merr: çmimin e tij bazë të plotë, pa asnjë zbritje.</li>
    <li>Nuk ka kosto fikse, abonime mujore, apo tarifa regjistrimi.</li>
    <li>Platforma ka të drejtë të ndryshojë tarifat me njoftim paraprak prej 30 ditësh.</li>
  </ul>

  <h2>3. Detyrimet e Partnerit Biznes</h2>
  <ul>
    <li>Të ofrojë shërbimin/produktin sipas kushteve të publikuara në deal.</li>
    <li>Të pranojë kupona të vlefshëm të gjeneruar nëpërmjet platformës Zbritje.al.</li>
    <li>Të mos diskriminojë klientët me kupon krahasuar me klientët e tjerë.</li>
    <li>Të njoftojë platformën menjëherë për çdo ndryshim të rëndësishëm në biznes (mbyllje, ndryshim adrese, etj.).</li>
    <li>Të japë informacion të saktë dhe jo mashtrues në profilin dhe deal-et e tij.</li>
  </ul>

  <h2>4. Detyrimet e Platformës</h2>
  <ul>
    <li>Të publikojë deal-et e miratuara të biznesit në platformë.</li>
    <li>Të sigurojë sistem të besueshëm të gjenerimit dhe verifikimit të kuponave.</li>
    <li>Të transferojë informacionin e blerjeve te biznesi në kohë reale.</li>
    <li>Të mbajë konfidenciale të dhënat e biznesit dhe klientëve sipas legjislacionit shqiptar.</li>
    <li>Të ofrojë mbështetje teknike dhe administrative.</li>
  </ul>

  <h2>5. Shqyrtimi dhe Miratimi i Deal-eve</h2>
  <p>Platforma rezervon të drejtën të shqyrtojë, aprovojë ose refuzojë çdo deal të paraqitur nga biznesi. Deal-et që nuk përmbushin standardet e platformës ose legjislacionin shqiptar do të refuzohen me njoftim me shkrim.</p>

  <h2>6. Pronësia Intelektuale</h2>
  <p>Biznesi i jep platformës të drejtën joekskluzive të përdorë logon, imazhet dhe materialet e tjera të marketingut për qëllime promocionale brenda platformës Zbritje.al.</p>

  <h2>7. Kufizimi i Përgjegjësisë</h2>
  <p>Platforma Zbritje.al nuk mban përgjegjësi për mosekzekutimin e shërbimit nga biznesi. Biznesi është i vetmi përgjegjës për cilësinë e shërbimeve/produkteve të ofruara.</p>

  <h2>8. Zgjidhja e Mosmarrëveshjeve</h2>
  <p>Palët do të përpiqen të zgjidhin çdo mosmarrëveshje miqësisht. Nëse kjo nuk arrihet brenda 30 ditësh, mosmarrëveshja do t'i dërgohet gjykatës kompetente të Tiranës sipas legjislacionit shqiptar.</p>

  <h2>9. Anulimi i Kontratës</h2>
  <p>Secila palë mund të anulojë këtë marrëveshje me njoftim me shkrim 30 ditë paraprak. Detyrimet e prapambetura (komisione, kupona aktive) mbeten në fuqi deri në likuidimin e plotë.</p>

  <h2>10. Dispozita të Fundit</h2>
  <p>Kjo marrëveshje hyn në fuqi në datën e nënshkrimit dixhital të saj dhe zëvendëson çdo marrëveshje paraprake midis palëve. Platforma ruan të drejtën e ndryshimit të kushteve me njoftim paraprak.</p>

  <div class="sig-grid" style="margin-top:40px">
    <div class="sig-block">
      <p><strong>Zbritje.al</strong></p>
      <p>NIPT: ${PLATFORM_NIPT}</p>
      <p>Tiranë, Shqipëri</p>
      <p style="margin-top:8px">Data: ${signedAt}</p>
    </div>
    <div class="sig-block">
      <p><strong>${businessName}</strong></p>
      <p>Përfaqësuesi: ${ownerName}</p>
      <p style="margin-top:8px">Data: ${signedAt} ✓ Nënshkruar dixhitalisht</p>
    </div>
  </div>

  <p style="margin-top:30px;font-size:11px;color:#888;text-align:center">
    Ky dokument u gjenerua automatikisht nga sistemi Zbritje.al · ${CONTRACT_VERSION} · ${signedAt}
  </p>
  </body></html>`;
}

export function downloadContract({ businessName, ownerName, signedAt, commissionRate = 0, markupRate = 9 }) {
  const html = buildContractHTML({
    businessName: businessName || 'N/A',
    ownerName: ownerName || 'N/A',
    signedAt: signedAt
      ? new Date(signedAt).toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('sq-AL', { year: 'numeric', month: 'long', day: 'numeric' }),
    commissionRate,
    markupRate,
  });
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kontrata-zbritje-${(businessName || 'biznes').replace(/\s+/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ContractModal({ businessName, ownerName, onAccept, onDecline, onSwitchToCustomer }) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 30) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-brand-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Kontratë Bashkëpunimi</h2>
              <p className="text-xs text-gray-400">Zbritje.al · NIPT: {PLATFORM_NIPT} · {CONTRACT_VERSION}</p>
            </div>
          </div>
          <button onClick={onDecline} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable contract body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 text-sm text-gray-700 leading-relaxed space-y-4"
        >
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-xs text-brand-700">
            <strong>Palët e Marrëveshjes:</strong><br />
            Platforma: <strong>Zbritje.al</strong> (NIPT: {PLATFORM_NIPT})<br />
            Partneri Biznes: <strong>{businessName}</strong> · Përfaqësuesi: <strong>{ownerName}</strong>
          </div>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">1. Objekti i Marrëveshjes</h3>
            <p>Kjo marrëveshje rregullon kushtet e bashkëpunimit ndërmjet platformës <strong>Zbritje.al</strong> dhe partnerit biznes, lidhur me publikimin dhe shitjen e kuponave/deal-eve nëpërmjet platformës.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">2. Tarifa e Platformës</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Biznesi nuk paguan asnjë komision.</strong> Ju merrni çmimin tuaj bazë të plotë.</li>
              <li>Platforma shton automatikisht <strong>9% markup</strong> mbi çmimin tuaj bazë; ky markup paguhet ekskluzivisht nga klienti dhe i takon platformës.</li>
              <li>Klienti paguan: çmimi juaj bazë + 9% markup platformës.</li>
              <li>Nuk ka kosto fikse, abonime mujore, apo tarifa regjistrimi.</li>
              <li>Platforma mund të ndryshojë tarifat me njoftim 30-ditor paraprak.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">3. Detyrimet e Partnerit Biznes</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Të ofrojë shërbimin sipas kushteve të publikuara në deal.</li>
              <li>Të pranojë kupona të vlefshëm të gjeneruar nëpërmjet Zbritje.al.</li>
              <li>Të mos diskriminojë klientët me kupon krahasuar me klientët e tjerë.</li>
              <li>Të njoftojë platformën menjëherë për çdo ndryshim të rëndësishëm në biznes.</li>
              <li>Të japë informacion të saktë dhe jo mashtrues në profil dhe deal-e.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">4. Detyrimet e Platformës</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Të publikojë deal-et e miratuara të biznesit.</li>
              <li>Të sigurojë sistem të besueshëm gjenerimi dhe verifikimi të kuponave.</li>
              <li>Të mbajë konfidenciale të dhënat e biznesit dhe klientëve.</li>
              <li>Të ofrojë mbështetje teknike dhe administrative.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">5. Shqyrtimi i Deal-eve</h3>
            <p>Platforma rezervon të drejtën të shqyrtojë, aprovojë ose refuzojë çdo deal. Deal-et që nuk përmbushin standardet e platformës do të refuzohen me njoftim.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">6. Pronësia Intelektuale</h3>
            <p>Biznesi i jep platformës të drejtën joekskluzive të përdorë logon dhe materialet e marketingut për qëllime promocionale brenda Zbritje.al.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">7. Kufizimi i Përgjegjësisë</h3>
            <p>Platforma Zbritje.al nuk mban përgjegjësi për mosekzekutimin e shërbimit nga biznesi. Biznesi është i vetmi përgjegjës për cilësinë e shërbimeve të ofruara.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">8. Anulimi i Kontratës</h3>
            <p>Secila palë mund të anulojë me njoftim me shkrim 30 ditë paraprak. Detyrimet e prapambetura mbeten në fuqi deri në likuidim të plotë.</p>
          </section>

          <section>
            <h3 className="font-bold text-gray-900 mb-1">9. Zgjidhja e Mosmarrëveshjeve</h3>
            <p>Palët do të përpiqen zgjidhje miqësore. Nëse jo, mosmarrëveshja do t'i dërgohet gjykatës kompetente të Tiranës sipas legjislacionit shqiptar.</p>
          </section>

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 text-center">
            Zbritje.al · NIPT: {PLATFORM_NIPT} · {CONTRACT_VERSION} · Ky dokument ka vlerë juridike kur nënshkruhet dixhitalisht.
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 space-y-3">

          {/* Decline confirmation */}
          {confirmDecline ? (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-800 text-center">Jeni i sigurt që doni të refuzoni?</p>
              <p className="text-xs text-gray-500 text-center">
                Nëse nuk dëshironi të bashkoheni si biznes, mund të vazhdoni si klient dhe të gëzoni deal-et tona çdo ditë.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDecline(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Kthehu te Kontrata
                </button>
                {onSwitchToCustomer && (
                  <button
                    onClick={onSwitchToCustomer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Vazhdo si Klient
                  </button>
                )}
                <button
                  onClick={onDecline}
                  className="flex-1 py-2.5 rounded-xl border border-red-200 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  Dil
                </button>
              </div>
            </div>
          ) : (
            <>
              {!scrolledToBottom && (
                <p className="text-xs text-amber-600 text-center font-medium">
                  Lëvizni poshtë për të lexuar të gjithë kontratën para pranimit.
                </p>
              )}

              <label className={`flex items-start gap-3 cursor-pointer select-none transition-opacity ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-600 flex-shrink-0"
                />
                <span className="text-sm text-gray-700">
                  Kam lexuar, kuptuar dhe pranoj të gjitha kushtet e kësaj marrëveshjeje bashkëpunimi me Zbritje.al.
                </span>
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => downloadContract({ businessName, ownerName })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <Download size={14} /> Shkarko
                </button>
                <button
                  onClick={() => setConfirmDecline(true)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Refuzoj
                </button>
                <button
                  onClick={onAccept}
                  disabled={!agreed}
                  className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle size={15} /> Pranoj Kontratën
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
