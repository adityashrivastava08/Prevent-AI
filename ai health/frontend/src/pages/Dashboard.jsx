import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'
import { 
  Activity, Droplets, Weight, ArrowUpRight, ArrowDownRight, 
  Calendar, CheckCircle2, AlertCircle, Clock, Download
} from 'lucide-react'
import { exportHealthReport } from '../lib/exportPDF'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    latestRisk: 'N/A',
    avgScore: 0
  })

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return
      
      const { data, error } = await supabase
        .from('health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setAssessments(data)
        const latest = data[data.length - 1]
        setStats({
          total: data.length,
          latestRisk: latest?.risk_category || 'N/A',
          avgScore: (data.reduce((acc, curr) => acc + (curr.result?.probability || 0), 0) / (data.length || 1)).toFixed(1)
        })
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [user])

  const chartData = assessments.map(a => ({
    date: new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    probability: a.result?.probability || 0,
    type: a.type
  }))

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  if (loading) return <div className="p-8 animate-pulse text-slate-500">Loading your health data...</div>

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Health Overview</h1>
          <p className="text-slate-400">Welcome back! Here's what's happening with your vitals.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-slate-300">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="p-6 glass-dark rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-20 h-20 text-primary" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="text-slate-400 font-medium">Avg. Risk Score</span>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-heading font-bold text-white">{stats.avgScore}%</h3>
            <span className="text-primary text-sm font-medium flex items-center mb-1">
              <ArrowDownRight className="w-4 h-4" /> 2.4%
            </span>
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 glass-dark rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplets className="w-20 h-20 text-secondary" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-slate-400 font-medium">Latest Assessment</span>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-heading font-bold text-white">{stats.latestRisk}</h3>
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 glass-dark rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-20 h-20 text-emerald-500" />
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-slate-400 font-medium">Total Scans</span>
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-4xl font-heading font-bold text-white">{stats.total}</h3>
          </div>
        </motion.div>
      </div>

      {/* Main Chart Section */}
      <motion.div variants={item} className="p-8 glass-dark rounded-[2.5rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-heading font-bold text-white">Health Risk Trends</h3>
            <p className="text-sm text-slate-500">History of your clinical probability scores</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-slate-400 font-medium">Risk %</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                itemStyle={{ color: '#10B981' }}
              />
              <Area 
                type="monotone" 
                dataKey="probability" 
                stroke="#10B981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorProb)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* History & Tasks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="p-6 glass-dark rounded-3xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-heading font-bold text-white">Recent Activity</h3>
            <button className="text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {assessments.slice(-4).reverse().map((a, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  a.risk_category?.includes('Low') ? 'bg-emerald-500/10 text-emerald-500' :
                  a.risk_category?.includes('High') ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white capitalize">{a.type} Risk Scan</h4>
                  <p className="text-xs text-slate-500">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{a.result?.probability || 0}%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{a.risk_category}</div>
                </div>
              </div>
            ))}
            {assessments.length === 0 && (
              <div className="text-center py-12">
                 <Clock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                 <p className="text-slate-500">No assessment history yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 glass-dark rounded-3xl border border-white/5 bg-primary/5">
          <h3 className="text-xl font-heading font-bold text-white mb-2">Health Recommendations</h3>
          <p className="text-sm text-slate-400 mb-6">Based on your latest profile and biomechanical data.</p>
          
          <div className="space-y-4">
            {[
              { icon: AlertCircle, text: "Your hydration level is lower than the recommended 3L daily.", color: "text-amber-500" },
              { icon: CheckCircle2, text: "Excellent form score (94%) on your last push-up session.", color: "text-emerald-500" },
              { icon: Droplets, text: "Schedule a fasting glucose test to update your diabetes risk model.", color: "text-blue-500" }
            ].map((tip, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-black/20 border border-white/5">
                <tip.icon className={`w-5 h-5 shrink-0 ${tip.color}`} />
                <p className="text-sm text-slate-300">{tip.text}</p>
              </div>
            ))}
          </div>

          <button 
            onClick={() => exportHealthReport(user, assessments)}
            className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Full Health Report
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
