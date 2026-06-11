import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post('/support/contact', data);
      setSubmitted(true);
    } catch {
      toast.error('Ndodhi një gabim. Provoni sërisht.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-brand-gradient text-white py-16 text-center">
        <h1 className="text-4xl font-black mb-2">Na Kontaktoni</h1>
        <p className="text-blue-100">Jemi këtu për t'ju ndihmuar çdo ditë</p>
      </div>

      <div className="container-custom py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-5">
            {[
              { icon: Mail, title: 'Email', value: 'info@zbritje.al', sub: 'Përgjigje brenda 24 orësh' },
              { icon: Phone, title: 'Telefon', value: '+355 69 000 0000', sub: 'E Hënë-Premte, 9:00-18:00' },
              { icon: MapPin, title: 'Zyra', value: 'Rruga Myslym Shyri, 24', sub: 'Tiranë, Shqipëri' },
            ].map(({ icon: Icon, title, value, sub }) => (
              <div key={title} className="card p-5 flex items-start gap-4">
                <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-brand-600 font-medium">{value}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              </div>
            ))}

            <div className="card p-5">
              <p className="font-bold text-gray-900 text-sm mb-3">Na ndiqni</p>
              <div className="flex gap-3">
                {[{ name: 'Facebook', url: 'https://facebook.com/zbritjeal' }, { name: 'Instagram', url: 'https://instagram.com/zbritjeal' }].map(({ name, url }) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700 transition-all">{name}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 card p-8">
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <CheckCircle size={56} className="text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Mesazhi u dërgua!</h3>
                <p className="text-gray-500">Do t'ju kthehemi brenda 24 orësh. Faleminderit!</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Dërgoni Mesazh</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[{ name: 'firstName', label: 'Emri' }, { name: 'lastName', label: 'Mbiemri' }].map(({ name, label }) => (
                    <div key={name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} *</label>
                      <input {...register(name, { required: true })} className={`input-field ${errors[name] ? 'input-error' : ''}`} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input type="email" {...register('email', { required: true })} className={`input-field ${errors.email ? 'input-error' : ''}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subjekti</label>
                  <select {...register('subject')} className="input-field">
                    <option>Pyetje e Përgjithshme</option>
                    <option>Problem teknik</option>
                    <option>Bashkëpunim Biznesi</option>
                    <option>Raportim Problemi</option>
                    <option>Tjetër</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mesazhi *</label>
                  <textarea {...register('message', { required: true, minLength: 20 })} rows={5} className={`input-field resize-none ${errors.message ? 'input-error' : ''}`} placeholder="Shkruani mesazhin tuaj..." />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
                  {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send size={18} />Dërgoni Mesazhin</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
