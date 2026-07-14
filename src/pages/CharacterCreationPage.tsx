import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAvatarStore } from '@/store/useAvatarStore'
import { useGameStore } from '@/store/useGameStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { lpcProvider, CATEGORY_LABELS } from '@/lib/avatar/providers/lpcProvider'
import { biomes } from '@/data/biomes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AvatarLayerCategory } from '@/lib/avatar/types'

const CREATION_CATEGORIES: AvatarLayerCategory[] = ['body', 'hair', 'eyes', 'mask', 'shirt', 'pants', 'shoes']

interface CharacterCreationPageProps {
  mode?: 'create' | 'edit-avatar' | 'edit-biome'
}

export function CharacterCreationPage({ mode = 'create' }: CharacterCreationPageProps) {
  const navigate = useNavigate()
  const { avatar, biome: selectedBiome, setFigure, setOption, setColor, setBiome, finishCreation } = useAvatarStore()
  const profileName = useGameStore((s) => s.profile.name)
  const setProfileName = useGameStore((s) => s.setProfileName)

  const [step, setStep] = useState<'avatar' | 'biome'>(mode === 'edit-biome' ? 'biome' : 'avatar')
  const [name, setName] = useState(profileName)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const category = CREATION_CATEGORIES[categoryIndex]

  const options = useMemo(() => lpcProvider.listOptions(category, avatar.figure), [category, avatar.figure])
  const currentOptionId = avatar.options[category] ?? options[0]?.id
  const currentOption = options.find((o) => o.id === currentOptionId) ?? options[0]

  function cycleOption(direction: 1 | -1) {
    if (options.length <= 1) return
    const idx = options.findIndex((o) => o.id === currentOptionId)
    const next = options[(idx + direction + options.length) % options.length]
    if (category === 'body') {
      setFigure(next.id as typeof avatar.figure)
    } else {
      setOption(category, next.id)
    }
  }

  function finishAndExit(destination: string) {
    setProfileName(name.trim() || 'Aventurero')
    if (mode === 'create') finishCreation()
    navigate(destination)
  }

  if (step === 'biome') {
    return (
      <div className="flex min-h-full flex-col px-4 pt-10 pb-8">
        <h1 className="font-pixel text-lg text-gold-400">¿Dónde comienza tu aventura?</h1>
        <p className="mt-2 text-sm text-ink-400">Elige el bioma inicial de tu mundo.</p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {biomes.map((biome) => (
            <motion.button
              key={biome.id}
              onClick={() => setBiome(biome.id)}
              whileTap={{ scale: 0.96 }}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 bg-ink-900 p-5 transition-colors"
              style={{
                borderColor: selectedBiome === biome.id ? biome.color : 'var(--color-ink-700)',
              }}
            >
              <span className="text-4xl">{biome.emoji}</span>
              <span className="text-sm font-medium text-ink-50">{biome.name}</span>
            </motion.button>
          ))}
        </div>

        <div className="mt-auto flex gap-3 pt-8">
          {mode === 'create' ? (
            <>
              <Button variant="outline" onClick={() => setStep('avatar')} className="flex-1">
                Atrás
              </Button>
              <Button onClick={() => finishAndExit('/')} className="flex-1">
                Comenzar aventura
              </Button>
            </>
          ) : (
            <Button onClick={() => finishAndExit('/perfil')} className="w-full">
              Guardar
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-4 pt-10 pb-8">
      <h1 className="font-pixel text-lg text-gold-400">
        {mode === 'create' ? 'Crea tu aventurero' : 'Editar personaje'}
      </h1>

      <div className="my-6 flex justify-center">
        <AvatarSprite config={avatar} size={256} />
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs text-ink-400">Nombre</span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre de aventurero" />
      </label>

      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {CREATION_CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setCategoryIndex(i)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium text-ink-400',
              i === categoryIndex && 'bg-ink-800 text-gold-400',
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => cycleOption(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-ink-50"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="w-40 text-center text-sm font-medium text-ink-50">{currentOption?.label}</p>
        <button
          onClick={() => cycleOption(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 text-ink-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {currentOption && currentOption.colorMode !== 'none' && (
        <div className="mt-6 flex justify-center gap-2">
          {currentOption.colors.map((color) => (
            <button
              key={color.id}
              onClick={() => setColor(category, color.id)}
              className={cn(
                'h-8 w-8 rounded-full border-2 border-transparent',
                avatar.colors[category] === color.id && 'border-gold-400',
              )}
              style={{ backgroundColor: color.swatch }}
              aria-label={color.label}
            />
          ))}
        </div>
      )}

      <div className="mt-auto flex gap-3 pt-8">
        {mode === 'edit-avatar' && (
          <Button variant="outline" onClick={() => navigate('/perfil')} className="flex-1">
            Cancelar
          </Button>
        )}
        <Button
          onClick={() => (mode === 'edit-avatar' ? finishAndExit('/perfil') : setStep('biome'))}
          className="flex-1"
        >
          {mode === 'edit-avatar' ? 'Guardar' : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}
