import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  MessageSquare, X, Send, Bot, User, 
  Sparkles, Loader2, Globe, ExternalLink 
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your PreventAI Health Expert. How can I help you with your vitals or medical questions today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        messages: [...messages, userMessage]
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting to the medical database. Please try again later." }])
    }
    setIsLoading(false)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center text-white z-50 hover:scale-110 active:scale-95 transition-all group"
      >
        <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-dark" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] glass-dark border border-white/10 rounded-[2.5rem] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Bot className="text-primary w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Health Expert AI</h4>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Groq Llama 3.1</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${
                      m.role === 'user' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
                    }`}>
                      {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-secondary text-white rounded-tr-none' 
                        : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                    }`}>
                      {m.content}
                      {m.role === 'assistant' && i === messages.length - 1 && !isLoading && (
                         <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
                            <button className="text-[10px] text-slate-500 hover:text-primary flex items-center gap-1 uppercase font-bold">
                               <Globe className="w-3 h-3" /> Search Sources
                            </button>
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <span className="text-xs text-slate-500 italic">Expert is thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-white/5 bg-black/20">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about symptoms, lab results..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 pr-14 text-white text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1.5 w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-600 mt-3 uppercase tracking-tighter font-medium">
                Medical AI: Consult a doctor for emergencies.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
