import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Region } from '@/types'

interface RegionNodeProps {
  region: Region
  progress: number
  index: number
}

export function RegionNode({ region, progress, index }: RegionNodeProps) {
  const navigate = useNavigate()
  const align = index % 2 === 0 ? 'self-start' : 'self-end'

  return (
    <motion.button
      onClick={() => navigate(`/region/${region.id}`)}
      className={`relative flex ${align} w-[72%] items-center gap-4 rounded-2xl border border-ink-700 bg-ink-900 p-4 text-left shadow-lg shadow-black/20`}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${region.color} 25%, transparent)` }}
      >
        {region.emoji}
      </div>

      <div className="flex-1">
        <p className="font-pixel text-[10px] leading-none text-ink-200">Nv. {region.level}</p>
        <h3 className="mt-1 text-sm font-semibold text-ink-50">{region.name}</h3>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: region.color }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ delay: index * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.button>
  )
}
