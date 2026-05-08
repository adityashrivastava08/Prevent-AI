import { twMerge } from 'tailwind-merge'

export default function Skeleton({ className, ...props }) {
  return (
    <div 
      className={twMerge(
        'animate-pulse bg-white/5 rounded-xl',
        className
      )}
      {...props}
    />
  )
}
