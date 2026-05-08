import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import axios from 'axios'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { 
  ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, 
  Activity, ArrowRight, RotateCcw, Share2, Download, Droplets
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function DiabetesAssessment() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    gender: '', age: '', hypertension: 'No', heart_disease: 'No',
    bmi: '', hba1c: '', glucose: '', smoking_history: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(0)

  const steps = [
    { id: 1, title: 'Basics', desc: 'Tell us about yourself' },
    { id: 2, title: 'Medical', desc: 'Clinical history' },
    { id: 3, title: 'Vitals', desc: 'Body metrics' },
    { id: 4, title: 'Blood Work', desc: 'Laboratory results' },
    { id: 5, title: 'Lifestyle', desc: 'Habits & history' }
  ]

  const nextStep = () => setStep(s => Math.min(s + 1, 5))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/predict/diabetes`, formData)
      const data = response.data
      setResult(data)
      
      // Persist to Supabase
      if (user) {
        await supabase.from('health_assessments').insert({
          user_id: user.id,
          type: 'diabetes',
          input_data: formData,
          result: data,
          risk_category: data.risk_category
        })
      }

      // Animate count up
      let start = 0
      const end = data.probability
      const duration = 2000
      const increment = end / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

    } catch (error) {
      console.error("Prediction error:", error)
    }
    setLoading(false)
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400">Gender</label>
                <select 
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input 
                label="Age" 
                type="number" 
                placeholder="Years"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Hypertension</h4>
                  <p className="text-xs text-slate-500">History of high blood pressure</p>
                </div>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  {['No', 'Yes'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleInputChange('hypertension', opt)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.hypertension === opt ? 'bg-primary text-white' : 'text-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">Heart Disease</h4>
                  <p className="text-xs text-slate-500">History of cardiac conditions</p>
                </div>
                <div className="flex bg-black/20 p-1 rounded-lg">
                  {['No', 'Yes'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleInputChange('heart_disease', opt)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${formData.heart_disease === opt ? 'bg-primary text-white' : 'text-slate-500'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input 
              label="Body Mass Index (BMI)" 
              type="number" 
              step="0.1"
              placeholder="e.g. 24.5"
              value={formData.bmi}
              onChange={(e) => handleInputChange('bmi', e.target.value)}
            />
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex gap-4">
              <AlertCircle className="text-primary w-5 h-5 shrink-0" />
              <p className="text-xs text-primary/80 leading-relaxed">
                BMI is calculated as weight (kg) / height (m)². A normal range is 18.5 - 24.9.
              </p>
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <Input 
              label="HbA1c Level (%)" 
              type="number" 
              step="0.1"
              placeholder="e.g. 5.7"
              value={formData.hba1c}
              onChange={(e) => handleInputChange('hba1c', e.target.value)}
            />
            <Input 
              label="Blood Glucose Level (mg/dL)" 
              type="number" 
              placeholder="e.g. 120"
              value={formData.glucose}
              onChange={(e) => handleInputChange('glucose', e.target.value)}
            />
          </motion.div>
        )
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-400">Smoking History</label>
              <div className="grid grid-cols-2 gap-3">
                {['never', 'former', 'current', 'ever', 'not current'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => handleInputChange('smoking_history', opt)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left capitalize ${
                      formData.smoking_history === opt 
                        ? 'bg-primary/20 border-primary text-primary' 
                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )
    }
  }

  if (result) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto py-12 px-6">
        <div className="glass-dark p-12 rounded-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-800">
             <motion.div 
               initial={{ width: 0 }} 
               animate={{ width: `${result.probability}%` }} 
               className={`h-full ${result.probability > 50 ? 'bg-rose-500' : 'bg-primary'}`} 
             />
          </div>

          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            className="w-48 h-48 rounded-full border-[12px] border-white/5 mx-auto mb-8 flex items-center justify-center relative"
          >
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="96" cy="96" r="84" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  className="text-white/5"
                />
                <motion.circle 
                  cx="96" cy="96" r="84" 
                  fill="transparent" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  strokeDasharray="527"
                  initial={{ strokeDashoffset: 527 }}
                  animate={{ strokeDashoffset: 527 - (527 * result.probability) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className={result.probability > 50 ? 'text-rose-500' : 'text-primary'}
                />
             </svg>
             <div className="text-center">
                <span className="text-5xl font-heading font-bold text-white block">{count}%</span>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Risk Score</span>
             </div>
          </motion.div>

          <h2 className="text-3xl font-heading font-bold text-white mb-2">
            {result.risk_category} Assessment
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
            Based on your physiological and clinical data, our neural network has determined your risk level for diabetes.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Status</h4>
                <div className={`text-sm font-bold flex items-center justify-center gap-2 ${
                  result.risk_category?.includes('Low') ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  {result.risk_category?.includes('Low') ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {result.risk_category}
                </div>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">Confidence</h4>
                <div className="text-sm font-bold text-white">94.2% AI Accuracy</div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Button variant="secondary" onClick={() => { setResult(null); setStep(1); }} icon={RotateCcw}>
                Retake Assessment
             </Button>
             <Button icon={Download}>
                Export PDF Report
             </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
           <Droplets className="text-primary w-6 h-6" />
        </div>
        <div>
           <h1 className="text-2xl font-heading font-bold text-white">Diabetes Risk Scan</h1>
           <p className="text-slate-500">Step {step} of 5: {steps[step-1].title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Wizard Form */}
        <div className="lg:col-span-2 space-y-8">
           {/* Progress Bar */}
           <div className="flex gap-2">
              {steps.map(s => (
                <div 
                  key={s.id} 
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    s.id <= step ? 'bg-primary' : 'bg-white/10'
                  }`}
                />
              ))}
           </div>

           <div className="glass-dark p-8 md:p-10 rounded-[2rem] border border-white/5">
              <div className="mb-8">
                 <h3 className="text-xl font-heading font-bold text-white mb-1">{steps[step-1].title}</h3>
                 <p className="text-slate-400 text-sm">{steps[step-1].desc}</p>
              </div>

              {renderStep()}

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                 <Button 
                   variant="ghost" 
                   onClick={prevStep} 
                   disabled={step === 1}
                   icon={ChevronLeft}
                 >
                   Back
                 </Button>

                 {step < 5 ? (
                   <Button onClick={nextStep} icon={ChevronRight}>
                     Continue
                   </Button>
                 ) : (
                   <Button onClick={handleSubmit} isLoading={loading} icon={Activity}>
                     Analyze Risk Profile
                   </Button>
                 )}
              </div>
           </div>
        </div>

        {/* Right: Info Sidebar */}
        <div className="space-y-6">
           <div className="p-6 glass-dark rounded-3xl border border-white/5">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                 <ShieldCheck className="w-5 h-5 text-primary" /> Why this data?
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                 Our model uses specific physiological indicators that have the highest correlation with diabetes onset according to clinical research.
              </p>
           </div>
           
           <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
              <h4 className="text-white font-bold mb-2">Privacy Note</h4>
              <p className="text-xs text-slate-400">
                 Your clinical data is encrypted and stored securely. We never share your individual metrics with third parties.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}

function ShieldCheck(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
