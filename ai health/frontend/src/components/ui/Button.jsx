import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20',
  secondary: 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary/5',
  ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5',
  danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'
}

export default function Button({ 
  children, 
  className, 
  variant = 'primary', 
  isLoading, 
  icon: Icon,
  ...props 
}) {
  const variantClass = variants[variant] || variants.primary

  return (
    <button 
      className={twMerge(
        'relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100',
        variantClass,
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {Icon && typeof Icon === 'function' && <Icon className="w-5 h-5" />}
          {children}
        </>
      )}
    </button>
  )
}
