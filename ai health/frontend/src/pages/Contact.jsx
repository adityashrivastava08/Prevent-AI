import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Send, Mail, MapPin, Phone, MessageSquare, CheckCircle2 } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.from('contact_messages').insert(formData)
    if (!error) setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 glass-dark rounded-[3rem]">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-slate-400 mb-8">We've received your inquiry and will get back to you shortly.</p>
          <Button onClick={() => setSubmitted(false)} variant="secondary">Send Another Message</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl font-heading font-black text-white mb-6">Get in Touch</h1>
          <p className="text-xl text-slate-400 mb-12">
            Have questions about our clinical models or biometric tracking? Our medical team is here to help.
          </p>

          <div className="space-y-8">
            {[
              { icon: Mail, title: 'Email Us', desc: 'support@preventai.health' },
              { icon: MapPin, title: 'Medical HQ', desc: '77 Silicon Valley Blvd, CA' },
              { icon: Phone, title: 'Direct Line', desc: '+1 (555) 000-HEALTH' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all">
                  <item.icon className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{item.title}</h4>
                  <p className="text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
              label="Full Name" 
              placeholder="John Doe" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="john@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400 ml-1">Message</label>
              <textarea 
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[150px]"
                placeholder="How can we help?"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full h-14" isLoading={loading} icon={Send}>
              Dispatch Inquiry
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
