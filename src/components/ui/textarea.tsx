import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-xl border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-ink-50',
        'placeholder:text-ink-400 focus:border-gold-500 focus:outline-none',
        className,
      )}
      rows={3}
      {...props}
    />
  )
}
