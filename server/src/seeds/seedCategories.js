require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Category = require('../models/Category');

const categories = [
  { name: 'Restorante', slug: 'restorante', icon: '🍽️', order: 1, isFeatured: true },
  { name: 'Bukuri & Kujdes', slug: 'bukuri', icon: '💅', order: 2, isFeatured: true },
  { name: 'Hotele & Resorte', slug: 'hotele', icon: '🏨', order: 3, isFeatured: true },
  { name: 'Aktivitete & Argëtim', slug: 'aktivitete', icon: '🎭', order: 4, isFeatured: true },
  { name: 'Dentist & Shëndet', slug: 'shendet', icon: '🦷', order: 5, isFeatured: true },
  { name: 'Palestër & Sport', slug: 'sport', icon: '💪', order: 6, isFeatured: true },
  { name: 'Kafene & Bare', slug: 'kafene', icon: '☕', order: 7, isFeatured: false },
  { name: 'Jetë Nate', slug: 'jete-nate', icon: '🌙', order: 8, isFeatured: false },
  { name: 'Udhëtime & Turizëm', slug: 'udhetim', icon: '✈️', order: 9, isFeatured: true },
  { name: 'Teknologji', slug: 'teknologji', icon: '💻', order: 10, isFeatured: false },
  { name: 'Arsim & Kurse', slug: 'arsim', icon: '📚', order: 11, isFeatured: false },
  { name: 'Shtëpi & Mobilje', slug: 'shtepi', icon: '🏠', order: 12, isFeatured: false },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      { ...cat, isActive: true },
      { upsert: true, new: true }
    );
    console.log(`✅ ${cat.name}`);
  }

  console.log('\nAll categories seeded!');
  await mongoose.disconnect();
}

seed().catch(console.error);
