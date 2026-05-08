import { twMerge } from 'tailwind-merge'

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-slate-400 ml-1">
          {label}
        </label>
      )}
      <input
        className={twMerge(
          'w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200',
          error && 'border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500/50',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 ml-1 font-medium">{error}</p>
      )}
    </div>
  )
}
