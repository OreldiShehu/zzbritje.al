export default function Privacy() {
  const sections = [
    { title: '1. Të Dhënat që Mbledhim', content: 'Mbledhim të dhëna që na jepni drejtpërdrejt (emri, email, telefoni), të dhëna automatike (adresa IP, cookies, sjellja e shfletimit), dhe të dhëna nga ofruesit OAuth (Google, Facebook) nëse zgjidhni të kyçeni nëpërmjet tyre.' },
    { title: '2. Si i Përdorim të Dhënat', content: 'Të dhënat tuaja përdoren për: ofrimin e shërbimeve, përpunimin e pagesave, dërgimin e njoftimeve dhe ofertave relevante, analizimin e sjelljes për përmirësimin e platformës, dhe pajtueshmërinë ligjore.' },
    { title: '3. Ndarja e të Dhënave', content: 'Nuk i shesim të dhënat tuaja personale. Mund t\'i ndajmë me: bizneset partnere (vetëm për qëllime të kuponit), ofruesit e shërbimeve (Stripe, Cloudinary, Twilio) sipas nevojës teknike, dhe autoritetet nëse kërkohet me ligj.' },
    { title: '4. Cookies', content: 'Përdorim cookies esenciale (autentikimi, preferencat), analytics (Google Analytics - anonimizohen), dhe marketing (vetëm me miratimin tuaj). Mund t\'i menaxhoni cookies nga browser-i juaj.' },
    { title: '5. Siguria e të Dhënave', content: 'Aplikojmë enkriptim TLS, ruajtje të sigurt në cloud, kufizim aksesi, dhe auditim të vazhdueshëm. Fjalëkalimet janë hashuara me bcrypt. Karta e kreditit nuk ruhet kurrë tek ne (procesim nëpërmjet Stripe).' },
    { title: '6. Të Drejtat Tuaja (GDPR)', content: 'Keni të drejtë: aksesit të dhënave (eksport), korrigjimit të gabimeve, fshirjes ("e drejta të harrohesh"), kufizimit të përpunimit, portabilitetit, dhe kundërshtimit. Dërgoni kërkesën te: privacy@zbritje.al' },
    { title: '7. Ruajtja e të Dhënave', content: 'Ruajmë të dhënat aktive sa koha e llogarisë. Pas fshirjes, ruajmë transaksionet për 7 vjet (kërkesë ligjore) dhe fshijmë të gjitha të dhënat personale brenda 30 ditësh.' },
    { title: '8. Ndryshimet e Politikës', content: 'Çdo ndryshim material do t\'ju njoftojmë me email 30 ditë para hyrjes në fuqi. Përdorimi i vazhdueshëm pas kësaj date nënkupton pranimin e ndryshimeve.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b py-10 text-center">
        <h1 className="text-3xl font-black text-gray-900">Politika e Privatësisë</h1>
        <p className="text-gray-500 mt-2">Përditësuar: Janar 2025 · Konforme me GDPR</p>
      </div>
      <div className="container-custom py-10 max-w-3xl">
        <div className="card p-8 space-y-8">
          <p className="text-gray-600 bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm">
            Zbritje.al ("ne", "platforma") është e angazhuar për mbrojtjen e privatësisë tuaj. Kjo politikë shpjegon si mbledhim, përdorim dhe mbrojmë informacionin tuaj personal.
          </p>
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{content}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm">DPO (Data Protection Officer): <a href="mailto:privacy@zbritje.al" className="text-brand-600 hover:underline">privacy@zbritje.al</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
