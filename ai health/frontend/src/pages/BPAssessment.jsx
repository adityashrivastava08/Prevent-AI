import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { 
  ChevronRight, ChevronLeft, Activity, 
  RotateCcw, Download, HeartPulse, ShieldCheck
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function BPAssessment() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    age: '', salt: '', stress: '', sleep: '', bmi: '',
    medication: 'None', family_history: 'No', exercise: 'Moderate', smoking: 'Non-Smoker'
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  const steps = [
    { id: 1, title: 'Basics', desc: 'Age and sleep patterns' },
    { id: 2, title: 'Physiology', desc: 'Body metrics and intake' },
    { id: 3, title: 'History', desc: 'Medical & family context' },
    { id: 4, title: 'Lifestyle', desc: 'Stress and habits' }
  ]

  const nextStep = () => setStep(s => Math.min(s + 1, 4))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/predict/bp`, formData)
      const data = response.data
      setResult(data)
      
      if (user) {
        await supabase.from('health_assessments').insert({
          user_id: user.id,
          type: 'bp',
          input_data: formData,
          result: data,
          risk_category: data.risk_category
        })
      }

      let start = 0
      const end = data.probability
      const timer = setInterval(() => {
        start += 1
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 20)

    } catch (error) {
      console.error("BP Prediction error:", error)
    }
    setLoading(false)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input 
              label="Age" 
              type="number" 
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
            />
            <Input 
              label="Average Sleep (Hours/Night)" 
              type="number" 
              step="0.5"
              value={formData.sleep}
              onChange={(e) => handleInputChange('sleep', e.target.value)}
            />
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input 
              label="Body Mass Index (BMI)" 
              type="number" 
              step="0.1"
              value={formData.bmi}
              onChange={(e) => handleInputChange('bmi', e.target.value)}
            />
            <Input 
              label="Daily Salt Intake (grams)" 
              type="number" 
              step="0.1"
              value={formData.salt}
              onChange={(e) => handleInputChange('salt', e.target.value)}
            />
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
             <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-white font-medium">Family BP History</span>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  {['No', 'Yes'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleInputChange('family_history', opt)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.family_history === opt ? 'bg-primary text-white' : 'text-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <span className="text-white font-medium">Current Medication</span>
                <select 
                   className="bg-black/20 text-slate-300 text-sm p-1.5 rounded-lg outline-none border border-white/10"
                   value={formData.medication}
                   onChange={(e) => handleInputChange('medication', e.target.value)}
                >
                   <option value="None">None</option>
                   <option value="Other">Other</option>
                </select>
              </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input 
              label="Stress Level (1-10)" 
              type="number" 
              min="1" max="10"
              value={formData.stress}
              onChange={(e) => handleInputChange('stress', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-sm text-slate-400">Exercise Level</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    value={formData.exercise}
                    onChange={(e) => handleInputChange('exercise', e.target.value)}
                  >
                     <option value="Low">Low</option>
                     <option value="Moderate">Moderate</option>
                     <option value="High">High</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-sm text-slate-400">Smoking Status</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                    value={formData.smoking}
                    onChange={(e) => handleInputChange('smoking', e.target.value)}
                  >
                     <option value="Non-Smoker">Non-Smoker</option>
                     <option value="Smoker">Smoker</option>
                  </select>
               </div>
            </div>
          </motion.div>
        )
    }
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="glass-dark p-12 rounded-[3rem] text-center">
          <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-8 flex items-center justify-center">
             <HeartPulse className="w-16 h-16 text-primary" />
          </div>
          <h2 className="text-4xl font-heading font-black text-white mb-2">{count}%</h2>
          <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs font-bold">Hypertension Risk</p>
          
          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full mb-10 ${
            result.risk_category === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
             <ShieldCheck className="w-5 h-5" />
             <span className="font-bold text-sm">{result.risk_category} Risk Level</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button variant="secondary" onClick={() => { setResult(null); setStep(1); }} icon={RotateCcw}>Retake</Button>
             <Button icon={Download}>Export Report</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
           <HeartPulse className="text-primary w-6 h-6" />
        </div>
        <div>
           <h1 className="text-2xl font-heading font-bold text-white">Hypertension Scan</h1>
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
              <Button onClick={handleSubmit} isLoading={loading} icon={Activity}>Generate Profile</Button>
            )}
         </div>
      </div>
    </div>
  )
}
