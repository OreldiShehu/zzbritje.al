export default function Terms() {
  const sections = [
    { title: '1. Pranimi i Kushteve', content: 'Duke aksesuar ose përdorur platformën Zbritje.al, ju pranoni të jeni i lidhur me këto Kushte dhe Terma. Nëse nuk pranoni, ju lutem mos e përdorni platformën.' },
    { title: '2. Shërbimi', content: 'Zbritje.al është një platformë online që lejon bizneset të publikojnë oferta dhe zbritje, dhe klientët të blejnë voucher elektronike për t\'i përdorur pranë bizneseve partnere.' },
    { title: '3. Llogaritë e Përdoruesve', content: 'Ju jeni përgjegjës për ruajtjen e konfidencialitetit të llogarisë dhe fjalëkalimit tuaj. Çdo aktivitet që ndodh nën llogarinë tuaj është përgjegjësia juaj.' },
    { title: '4. Blerja dhe Voucherat', content: 'Të gjitha blerjet e voucher-ve janë përfundimtare, me përjashtim të rasteve të kërkimit të rimbursimit brenda 14 ditësh nga blerja dhe nëse voucher-i nuk është përdorur. Voucher-ët kanë datë skadence dhe nuk mund të kthehen pas skadimit.' },
    { title: '5. Politika e Rimbursimit', content: 'Kërkoni rimbursim brenda 14 ditëve nga blerja nëse voucher-i nuk është përdorur akoma. Kontaktoni ekipin tonë të supportit. Rimbursimi do të kryhet brenda 5-10 ditëve pune.' },
    { title: '6. Komisionet dhe Pagesat', content: 'Zbritje.al mban një komision prej 18-25% nga çdo shitje. Bizneset marrin pagesën e tyre brenda 7-14 ditësh pas shitjes, sipas planit të zgjedhur.' },
    { title: '7. Pronësia Intelektuale', content: 'Çdo përmbajtje në platformë, përfshirë logon, tekstin, imazhet dhe software-in, është pronë e Zbritje.al ose licencuesve të saj dhe mbrohet nga ligjet e pronësisë intelektuale.' },
    { title: '8. Kufizimi i Përgjegjësisë', content: 'Zbritje.al nuk është përgjegjëse për cilësinë e shërbimeve të ofruara nga bizneset partnere. Çdo mosmarrëveshje me biznesin duhet zgjidhur direkt me të.' },
    { title: '9. Ndryshimet e Kushteve', content: 'Zbritje.al rezervon të drejtën të ndryshojë këto kushte në çdo kohë. Ndryshimet do të bëhen efektive menjëherë pas publikimit në platformë.' },
    { title: '10. Ligji i Aplikueshëm', content: 'Këto kushte rregullohen nga ligjet e Shqipërisë. Çdo mosmarrëveshje do të zgjidhet nga gjykatat kompetente të Tiranës.' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b py-10 text-center">
        <h1 className="text-3xl font-black text-gray-900">Kushtet e Shërbimit</h1>
        <p className="text-gray-500 mt-2">Përditësuar: Janar 2025</p>
      </div>
      <div className="container-custom py-10 max-w-3xl">
        <div className="card p-8 space-y-8">
          {sections.map(({ title, content }) => (
            <div key={title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{content}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-gray-500 text-sm">Për pyetje rreth kushteve, kontaktoni: <a href="mailto:legal@zbritje.al" className="text-brand-600 hover:underline">legal@zbritje.al</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
