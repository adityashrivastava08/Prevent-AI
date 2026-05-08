import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { 
  ChevronRight, ChevronLeft, Activity, 
  RotateCcw, Download, Weight, ShieldCheck
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ObesityAssessment() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    gender: 'Male', age: '', height: '', weight: '',
    fcvc: '2', ncp: '3', ch2o: '2', faf: '1', tue: '1',
    family_history: 'yes', favc: 'yes', caec: 'Sometimes',
    smoking: 'no', scc: 'no', mtrans: 'Public_Transportation', calc: 'Sometimes'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const steps = [
    { id: 1, title: 'Basics', desc: 'Demographics & Body' },
    { id: 2, title: 'Diet', desc: 'Eating habits' },
    { id: 3, title: 'Lifestyle', desc: 'Activity & transport' },
    { id: 4, title: 'Habits', desc: 'Snacking & alcohol' }
  ]

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/predict/obesity`, formData)
      const data = response.data
      setResult(data)
      
      if (user) {
        await supabase.from('health_assessments').insert({
          user_id: user.id,
          type: 'obesity',
          input_data: formData,
          result: data,
          risk_category: data.simplified
        })
      }
    } catch (error) {
      console.error("Obesity Prediction error:", error)
    }
    setLoading(false)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <Input label="Age" type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} />
               <div className="space-y-1.5">
                  <label className="text-sm text-slate-400">Gender</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none" value={formData.gender} onChange={(e) => handleInputChange('gender', e.target.value)}>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                  </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input label="Height (m)" type="number" step="0.01" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} />
               <Input label="Weight (kg)" type="number" step="0.1" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} />
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input label="Vegetable Intake (1-3)" type="number" step="0.1" value={formData.fcvc} onChange={(e) => handleInputChange('fcvc', e.target.value)} />
            <Input label="Meals per Day (1-4)" type="number" step="0.1" value={formData.ncp} onChange={(e) => handleInputChange('ncp', e.target.value)} />
            <Input label="Water Intake (1-3)" type="number" step="0.1" value={formData.ch2o} onChange={(e) => handleInputChange('ch2o', e.target.value)} />
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input label="Physical Activity (0-3)" type="number" step="0.1" value={formData.faf} onChange={(e) => handleInputChange('faf', e.target.value)} />
            <Input label="Tech Usage (0-2)" type="number" step="0.1" value={formData.tue} onChange={(e) => handleInputChange('tue', e.target.value)} />
            <div className="space-y-1.5">
               <label className="text-sm text-slate-400">Main Transport</label>
               <select className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none" value={formData.mtrans} onChange={(e) => handleInputChange('mtrans', e.target.value)}>
                  <option value="Walking">Walking</option>
                  <option value="Public_Transportation">Public Trans.</option>
                  <option value="Automobile">Automobile</option>
               </select>
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-sm text-slate-400">Snacking</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none" value={formData.caec} onChange={(e) => handleInputChange('caec', e.target.value)}>
                      <option value="no">No</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Frequently">Frequently</option>
                      <option value="Always">Always</option>
                   </select>
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm text-slate-400">Alcohol</label>
                   <select className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none" value={formData.calc} onChange={(e) => handleInputChange('calc', e.target.value)}>
                      <option value="no">No</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Frequently">Frequently</option>
                   </select>
                </div>
             </div>
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-white font-medium">Monitor Calories?</span>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  {['no', 'yes'].map(opt => (
                    <button key={opt} onClick={() => handleInputChange('scc', opt)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.scc === opt ? 'bg-primary text-white' : 'text-slate-500'}`}>{opt}</button>
                  ))}
                </div>
             </div>
          </motion.div>
        )
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="glass-dark p-12 rounded-[3rem] text-center border border-white/5">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl mx-auto mb-8 flex items-center justify-center">
             <Weight className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-heading font-black text-white mb-2">{result.prediction}</h2>
          <p className="text-slate-500 mb-8 uppercase tracking-widest text-xs font-bold">Health Status: {result.simplified}</p>
          
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10 mb-10 text-left">
             <h4 className="text-white font-bold mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Analysis Note</h4>
             <p className="text-sm text-slate-400 leading-relaxed">Our multi-factorial analysis suggests you fall into the "{result.prediction}" category based on World Health Organization (WHO) standards.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button variant="secondary" onClick={() => { setResult(null); setStep(1); }} icon={RotateCcw}>Retake</Button>
             <Button icon={Download}>Get PDF Report</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
           <Weight className="text-primary w-6 h-6" />
        </div>
        <div>
           <h1 className="text-2xl font-heading font-bold text-white">Obesity Index</h1>
           <p className="text-slate-500">Step {step} of 4: {steps[step-1].title}</p>
        </div>
      </div>

      <div className="glass-dark p-10 rounded-[2.5rem] border border-white/5">
         <div className="flex gap-2 mb-10">
            {steps.map(s => (
              <div key={s.id} className={`h-1.5 flex-1 rounded-full ${s.id <= step ? 'bg-primary' : 'bg-white/10'}`} />
            ))}
         </div>

         {renderStep()}

         <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
            <Button variant="ghost" onClick={prevStep} disabled={step === 1} icon={ChevronLeft}>Back</Button>
            {step < 4 ? (
              <Button onClick={nextStep} icon={ChevronRight}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={loading} icon={Activity}>Generate Index</Button>
            )}
         </div>
      </div>
    </div>
  )
}
