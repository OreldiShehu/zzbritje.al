require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const CATEGORIES = [
  { name: 'Restorante', nameAl: 'Restorante', icon: '🍽️', color: '#ef4444', order: 1, isFeatured: true },
  { name: 'Kafene & Bar', nameAl: 'Kafene & Bar', icon: '☕', color: '#92400e', order: 2, isFeatured: true },
  { name: 'Bukuri & Spa', nameAl: 'Bukuri & Spa', icon: '💆', color: '#ec4899', order: 3, isFeatured: true },
  { name: 'Sporte & Fitnese', nameAl: 'Sporte & Fitnese', icon: '💪', color: '#3b82f6', order: 4, isFeatured: true },
  { name: 'Argetim & Kulturë', nameAl: 'Argetim & Kulturë', icon: '🎭', color: '#8b5cf6', order: 5, isFeatured: true },
  { name: 'Hotele & Akomodim', nameAl: 'Hotele & Akomodim', icon: '🏨', color: '#0ea5e9', order: 6, isFeatured: true },
  { name: 'Mode & Veshje', nameAl: 'Mode & Veshje', icon: '👗', color: '#f59e0b', order: 7, isFeatured: true },
  { name: 'Elektronikë', nameAl: 'Elektronikë', icon: '📱', color: '#64748b', order: 8, isFeatured: false },
  { name: 'Shëndet & Mirëqenie', nameAl: 'Shëndet & Mirëqenie', icon: '🏥', color: '#10b981', order: 9, isFeatured: true },
  { name: 'Arsim & Kursime', nameAl: 'Arsim & Kursime', icon: '📚', color: '#6366f1', order: 10, isFeatured: false },
  { name: 'Fëmijë & Familje', nameAl: 'Fëmijë & Familje', icon: '👨‍👩‍👧', color: '#f97316', order: 11, isFeatured: true },
  { name: 'Automjete & Transport', nameAl: 'Automjete & Transport', icon: '🚗', color: '#475569', order: 12, isFeatured: false },
  { name: 'Imobiliare', nameAl: 'Imobiliare', icon: '🏠', color: '#84cc16', order: 13, isFeatured: false },
  { name: 'Teknologji & IT', nameAl: 'Teknologji & IT', icon: '💻', color: '#06b6d4', order: 14, isFeatured: false },
  { name: 'Marketing & Media', nameAl: 'Marketing & Media', icon: '📢', color: '#a855f7', order: 15, isFeatured: false },
  { name: 'Ushqim & Blerje', nameAl: 'Ushqim & Blerje', icon: '🛒', color: '#22c55e', order: 16, isFeatured: true },
  { name: 'Pastrim & Shtëpi', nameAl: 'Pastrim & Shtëpi', icon: '🏡', color: '#14b8a6', order: 17, isFeatured: false },
  { name: 'Foto & Video', nameAl: 'Foto & Video', icon: '📷', color: '#f43f5e', order: 18, isFeatured: false },
  { name: 'Kafshë Shtëpiake', nameAl: 'Kafshë Shtëpiake', icon: '🐾', color: '#fb923c', order: 19, isFeatured: false },
  { name: 'Turizëm & Udhëtime', nameAl: 'Turizëm & Udhëtime', icon: '✈️', color: '#38bdf8', order: 20, isFeatured: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
      const existing = await Category.findOne({ name: cat.name });
      if (existing) {
        skipped++;
        continue;
      }
      await Category.create(cat);
      console.log(`✅ Created: ${cat.nameAl} ${cat.icon}`);
      created++;
    }

    console.log(`\nDone! Created: ${created}, Skipped (already exist): ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
