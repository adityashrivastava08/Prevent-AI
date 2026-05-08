import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Button from '../components/ui/Button'
import { 
  Play, Square, Camera, Activity, 
  Trophy, Clock, Gauge, AlertTriangle, CheckCircle2, Zap, RefreshCcw
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Inject MediaPipe from CDN once
function loadMediaPipeScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script')
    s.src = src
    s.crossOrigin = 'anonymous'
    s.onload = resolve
    s.onerror = reject
    document.head.appendChild(s)
  })
}

const POSE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/pose.js'
const DRAWING_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils@0.3.1675466124/drawing_utils.js'

const CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,7],[0,4],[4,5],[5,6],[6,8],
  [11,12],[11,13],[13,15],[12,14],[14,16],
  [11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]
]

export default function FitnessAI() {
  const { user } = useAuth()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const cameraRef = useRef(null)
  const animFrameRef = useRef(null)
  const sessionStartRef = useRef(null)
  const scoreHistoryRef = useRef([])

  const [isActive, setIsActive] = useState(false)
  const [exercise, setExercise] = useState('pushup')
  const [mediaPipeReady, setMediaPipeReady] = useState(false)
  const [loadingMP, setLoadingMP] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [stats, setStats] = useState({
    reps: 0,
    form_score: 100,
    feedback: 'Ready to start...',
    stability: 0,
    avg_score: 100,
    fatigue_status: 'OPTIMAL'
  })
  const [error, setError] = useState(null)

  // Load MediaPipe on mount
  useEffect(() => {
    setLoadingMP(true)
    Promise.all([loadMediaPipeScript(POSE_CDN), loadMediaPipeScript(DRAWING_CDN)])
      .then(() => { setMediaPipeReady(true); setLoadingMP(false) })
      .catch(err => { console.error('MediaPipe load failed:', err); setLoadingMP(false) })
  }, [])

  // Timer
  useEffect(() => {
    if (!isActive) { setElapsedTime(0); return }
    sessionStartRef.current = Date.now()
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const sendLandmarksToBackend = useCallback(async (landmarks) => {
    try {
      const payload = landmarks.map(lm => ({
        x: lm.x, y: lm.y, z: lm.z || 0, visibility: lm.visibility || 0
      }))
      const res = await axios.post(`${API_URL}/process_pose`, {
        exercise_type: exercise,
        landmarks: payload
      })
      const d = res.data
      scoreHistoryRef.current.push(d.form_score || 100)
      if (scoreHistoryRef.current.length > 50) scoreHistoryRef.current.shift()
      const avg = Math.round(scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length)
      setStats({
        reps: d.counter || 0,
        form_score: d.form_score || 100,
        feedback: d.feedback || 'Processing...',
        stability: d.stats_v2?.stability || 0,
        avg_score: avg,
        fatigue_status: d.fatigue_status || 'OPTIMAL'
      })
    } catch (e) {
      // Silently fail on individual frame errors
    }
  }, [exercise])

  const stopSession = useCallback(() => {
    setIsActive(false)
    if (cameraRef.current) { cameraRef.current.stop?.(); cameraRef.current = null }
    if (poseRef.current) { poseRef.current.close?.(); poseRef.current = null }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    scoreHistoryRef.current = []
  }, [])

  const startSession = useCallback(async () => {
    if (!mediaPipeReady || !window.Pose) {
      setError('MediaPipe not ready. Please wait...')
      return
    }
    setError(null)
    setIsActive(true)
    setStats({ reps: 0, form_score: 100, feedback: 'Calibrating...', stability: 0, avg_score: 100, fatigue_status: 'OPTIMAL' })
    scoreHistoryRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' } })
      if (!videoRef.current) return
      videoRef.current.srcObject = stream
      await videoRef.current.play()

      const pose = new window.Pose({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${f}`
      })
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })

      let frameCount = 0
      pose.onResults((results) => {
        const canvas = canvasRef.current
        const video = videoRef.current
        if (!canvas || !video) return
        const ctx = canvas.getContext('2d')
        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        if (results.poseLandmarks) {
          // Draw skeleton
          const lms = results.poseLandmarks
          ctx.strokeStyle = '#10B981'
          ctx.lineWidth = 3
          ctx.lineCap = 'round'
          CONNECTIONS.forEach(([a, b]) => {
            if (lms[a] && lms[b] && lms[a].visibility > 0.3 && lms[b].visibility > 0.3) {
              ctx.beginPath()
              ctx.moveTo(lms[a].x * canvas.width, lms[a].y * canvas.height)
              ctx.lineTo(lms[b].x * canvas.width, lms[b].y * canvas.height)
              ctx.stroke()
            }
          })
          // Draw dots
          lms.forEach((lm) => {
            if (lm.visibility > 0.3) {
              ctx.beginPath()
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, Math.PI * 2)
              ctx.fillStyle = '#10B981'
              ctx.fill()
            }
          })

          // Send to backend every 3 frames
          frameCount++
          if (frameCount % 3 === 0) {
            sendLandmarksToBackend(lms)
          }
        }
      })

      poseRef.current = pose

      const processLoop = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          await pose.send({ image: videoRef.current })
        }
        animFrameRef.current = requestAnimationFrame(processLoop)
      }
      processLoop()

    } catch (err) {
      setError(`Camera error: ${err.message}`)
      setIsActive(false)
    }
  }, [mediaPipeReady, sendLandmarksToBackend])

  useEffect(() => {
    if (!isActive) { stopSession() }
  }, [isActive, stopSession])

  // Stop when exercise changes
  useEffect(() => {
    if (isActive) stopSession()
  }, [exercise])

  const exercises = [
    { id: 'pushup', name: 'Push-Ups', desc: 'Chest & Core' },
    { id: 'squat',  name: 'Squats',   desc: 'Lower Body' },
    { id: 'sidearm', name: 'Plank',   desc: 'Stability' }
  ]

  const fatigueColor = stats.fatigue_status === 'OPTIMAL' ? 'text-emerald-400'
    : stats.fatigue_status === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Fitness AI Coach</h1>
          <p className="text-slate-400 text-sm">Real-time biomechanical analysis & rep counting via MediaPipe.</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          {exercises.map(ex => (
            <button
              key={ex.id}
              onClick={() => setExercise(ex.id)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                exercise === ex.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading banner */}
      {loadingMP && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-sm font-medium flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          Loading AI Pose Engine (MediaPipe)...
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Camera */}
        <div className="lg:col-span-3 relative">
          <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />

            {!isActive && (
              <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Camera className="text-primary w-10 h-10" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-white mb-2">Ready for {exercises.find(e => e.id === exercise)?.name}?</h2>
                <p className="text-slate-400 max-w-sm mb-8">Position your camera to see your full body. The AI will count reps and correct your form in real time.</p>
                <Button
                  onClick={startSession}
                  icon={Play}
                  className="h-14 px-10 text-lg"
                  disabled={!mediaPipeReady}
                >
                  {mediaPipeReady ? 'Start Live Session' : 'Loading AI Engine...'}
                </Button>
              </div>
            )}

            {isActive && (
              <>
                {/* HUD - top left */}
                <div className="absolute top-6 left-6 flex gap-3">
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Live</span>
                  </div>
                  <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-mono font-bold">{formatTime(elapsedTime)}</span>
                  </div>
                </div>

                {/* HUD - form score top right */}
                <div className="absolute top-6 right-6">
                  <div className="px-6 py-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-3xl text-center">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Form Score</p>
                    <p className={`text-3xl font-heading font-black ${stats.form_score > 75 ? 'text-primary' : stats.form_score > 50 ? 'text-amber-400' : 'text-rose-500'}`}>
                      {stats.form_score}%
                    </p>
                  </div>
                </div>

                {/* HUD - bottom feedback + stop */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <motion.div
                    key={stats.feedback}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-4 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl flex gap-3 max-w-xs"
                  >
                    <Activity className="text-primary w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-primary font-bold uppercase mb-0.5">AI Coach</p>
                      <p className="text-sm text-white font-medium">{stats.feedback}</p>
                    </div>
                  </motion.div>
                  <Button variant="danger" onClick={stopSession} icon={Square}>Stop</Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="p-8 glass-dark rounded-[2.5rem] border border-white/5 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Reps</p>
            <h3 className="text-7xl font-heading font-black text-white mb-4 leading-none">{stats.reps}</h3>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${Math.min((stats.reps / 15) * 100, 100)}%` }}
                className="h-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-medium italic">Target: 15 reps</p>
          </div>

          <div className="p-6 glass-dark rounded-3xl border border-white/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Gauge className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Stability</span>
              </div>
              <span className="text-sm font-bold text-white">{Number(stats.stability).toFixed(3)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Avg Form</span>
              </div>
              <span className="text-sm font-bold text-white">{stats.avg_score}%</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-500/10 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-sm font-medium text-slate-400">Fatigue</span>
              </div>
              <span className={`text-sm font-bold ${fatigueColor}`}>{stats.fatigue_status}</span>
            </div>
          </div>

          <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> AI Status
            </h4>
            <div className="space-y-2 text-[10px] font-bold uppercase tracking-widest">
              <div className="flex justify-between">
                <span className="text-slate-500">MediaPipe</span>
                <span className={mediaPipeReady ? 'text-primary' : 'text-amber-400'}>{mediaPipeReady ? 'Ready' : 'Loading'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Backend</span>
                <span className="text-primary">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session</span>
                <span className={isActive ? 'text-primary' : 'text-slate-500'}>{isActive ? 'Active' : 'Idle'}</span>
              </div>
            </div>
          </div>

          {isActive && (
            <Button variant="secondary" onClick={stopSession} icon={RefreshCcw} className="w-full">
              Reset Session
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
