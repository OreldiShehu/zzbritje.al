import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  { name: 'Arta Gashi', city: 'Tiranë', avatar: 'https://i.pravatar.cc/80?img=1', rating: 5, comment: 'Fantastike! Bleva voucher për spa dhe kursova 4,000 lekë. Procesi ishte shumë i lehtë dhe shërbimi excelent.', saved: '4,000 L', deal: 'Spa Premium' },
  { name: 'Endrit Hoxha', city: 'Durrës', avatar: 'https://i.pravatar.cc/80?img=2', rating: 5, comment: 'Rregullisht përdor Zbritje.al për darka familjare. Restoranti i rekomanduar ishte i shkëlqyer dhe çmimi gjysmë!', saved: '6,500 L', deal: 'Restorant Fine Dining' },
  { name: 'Blerina Muça', city: 'Vlorë', avatar: 'https://i.pravatar.cc/80?img=9', rating: 5, comment: 'Aplikacioni është shumë intuitiv. Gjeta oferta të mrekullueshme për hotele. Do ta rekomandoja tek të gjithë!', saved: '12,000 L', deal: 'Hotel 4 Yje' },
  { name: 'Gentian Marku', city: 'Shkodër', avatar: 'https://i.pravatar.cc/80?img=3', rating: 5, comment: 'Barber-i ishte i jashtëzakonshëm dhe çmimi shumë i arsyeshëm. Platforma funksionon perfekt.', saved: '1,500 L', deal: 'Barbershop Premium' },
  { name: 'Marsela Çela', city: 'Elbasan', avatar: 'https://i.pravatar.cc/80?img=10', rating: 5, comment: 'Pas trajnimit dental, kursova 8,000 L! QR Code funksionoi në sekondë. Jam super e kënaqur!', saved: '8,000 L', deal: 'Pastrimi Dental' },
  { name: 'Altin Sota', city: 'Tiranë', avatar: 'https://i.pravatar.cc/80?img=4', rating: 5, comment: 'Palestra e gjetur në Zbritje.al është e shkëlqyer. Anëtarësia me zbritje 50% — vlerë fenomenale!', saved: '5,000 L', deal: 'Anëtarësi Palestër' },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider">Çfarë Thonë Klientët</span>
          <h2 className="section-title mt-2">Mijëra Klientë të Kënaqur</h2>
          <p className="section-subtitle mx-auto mt-3">Lexoni eksperiencat reale të njerëzve që kursyen me Zbritje.al</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6 relative"
            >
              <Quote size={32} className="text-brand-100 absolute top-4 right-4" />
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={16} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{t.comment}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.city}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-brand-600 font-bold text-sm">{t.saved}</p>
                  <p className="text-gray-400 text-xs">kursim</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="badge badge-green text-xs">{t.deal}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
