import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Minus, Plus, Paintbrush, Sun, Moon, Dices } from 'lucide-react'
import { useAvatarStore, HAT_SCALE_MIN, HAT_SCALE_MAX, HAT_SCALE_STEP } from '@/store/useAvatarStore'
import { useGameStore } from '@/store/useGameStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { PixelEditor } from '@/components/avatar/PixelEditor'
import { getEditableFrame, getLayerSilhouette, getEditableBiomeFrame, BIOME_ART_WIDTH, BIOME_ART_HEIGHT } from '@/lib/avatar/pixelFrame'
import { lpcProvider, CATEGORY_LABELS, figureOfBodyId, isHatResizable } from '@/lib/avatar/providers/lpcProvider'
import { biomes, biomeBackgroundUrl } from '@/data/biomes'
import { BiomaComponent } from '@/components/biome/BiomaComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AvatarLayerCategory } from '@/lib/avatar/types'

const CREATION_CATEGORIES: AvatarLayerCategory[] = ['body', 'hair', 'eyes', 'shirt', 'pants', 'shoes', 'hat', 'pet']
const PAINTABLE_CATEGORIES: AvatarLayerCategory[] = ['shirt', 'pants', 'shoes']

interface CharacterCreationPageProps {
  mode?: 'create' | 'edit-avatar' | 'edit-biome'
}

function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** The two-beat creation journey, shown only on first run. */
function StepIndicator({ current }: { current: 'avatar' | 'biome' }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {(
        [
          { id: 'avatar', label: '1 · Personaje' },
          { id: 'biome', label: '2 · Mundo' },
        ] as const
      ).map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          {i > 0 && <span className="h-px w-6 bg-ink-700" />}
          <span
            className={cn(
              'rounded-full border px-3 py-1 font-pixel text-[9px]',
              current === step.id ? 'border-gold-400 text-gold-400' : 'border-ink-700 text-ink-500',
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CharacterCreationPage({ mode = 'create' }: CharacterCreationPageProps) {
  const navigate = useNavigate()
  const {
    avatar,
    biome: selectedBiome,
    biomeArt,
    biomeVariant,
    setFigure,
    setOption,
    setColor,
    setHatScale,
    setBiome,
    setBiomeArt,
    clearBiomeArt,
    setBiomeVariant,
    finishCreation,
    setPixelOverride,
    clearPixelOverride,
  } = useAvatarStore()
  const profileName = useGameStore((s) => s.profile.name)
  const setProfileName = useGameStore((s) => s.setProfileName)
  const startNewProfile = useGameStore((s) => s.startNewProfile)

  const [step, setStep] = useState<'avatar' | 'biome'>(mode === 'edit-biome' ? 'biome' : 'avatar')
  const [name, setName] = useState(profileName)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [paintingCategory, setPaintingCategory] = useState<AvatarLayerCategory | null>(null)
  const [paintingBiome, setPaintingBiome] = useState(false)
  const category = CREATION_CATEGORIES[categoryIndex]

  const options = useMemo(() => lpcProvider.listOptions(category, avatar.figure), [category, avatar.figure])
  const currentOptionId = avatar.options[category] ?? options[0]?.id
  const currentOption = options.find((o) => o.id === currentOptionId) ?? options[0]

  /** One tap, a whole new adventurer — body first (it constrains everything), then the rest. */
  function randomize() {
    const bodies = lpcProvider.listOptions('body', avatar.figure)
    const body = pickRandom(bodies)
    let figure = avatar.figure
    if (body) {
      figure = figureOfBodyId(body.id)
      if (figure !== avatar.figure) setFigure(figure)
      setOption('body', body.id)
      setOption('head', body.id)
      if (body.colorMode !== 'none' && body.colors.length > 0) setColor('body', pickRandom(body.colors)!.id)
    }
    for (const cat of CREATION_CATEGORIES) {
      if (cat === 'body') continue
      const opt = pickRandom(lpcProvider.listOptions(cat, figure))
      if (!opt) continue
      setOption(cat, opt.id)
      if (opt.colorMode !== 'none' && opt.colors.length > 0) {
        setColor(cat as keyof typeof avatar.colors, pickRandom(opt.colors)!.id)
      }
    }
  }

  function cycleOption(direction: 1 | -1) {
    if (options.length <= 1) return
    const idx = options.findIndex((o) => o.id === currentOptionId)
    const next = options[(idx + direction + options.length) % options.length]
    if (category === 'body') {
      const nextFigure = figureOfBodyId(next.id)
      if (nextFigure !== avatar.figure) setFigure(nextFigure)
      setOption('body', next.id)
      // Head sprite depends on race, not just figure (an orc needs an orc
      // head, not just any male head), so it must track the exact body id.
      setOption('head', next.id)
    } else {
      setOption(category, next.id)
    }
  }

  function finishAndExit(destination: string) {
    const finalName = name.trim() || 'Aventurero'
    if (mode === 'create') {
      startNewProfile(finalName)
      finishCreation()
    } else {
      setProfileName(finalName)
    }
    navigate(destination)
  }

  if (step === 'biome') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-10 pb-8">
        {mode === 'create' && <StepIndicator current="biome" />}
        <h1 className="font-pixel text-lg text-gold-400">¿Dónde comienza tu aventura?</h1>
        <p className="mt-2 text-sm text-ink-400">
          Elige el bioma de tu mundo — el escenario donde tu personaje vivirá cada día que planifiques.
        </p>

        {selectedBiome && (
          <BiomaComponent
            biomeId={selectedBiome}
            variant={biomeVariant}
            customArt={biomeArt}
            className="panel-bevel mt-4 flex h-56 items-center justify-center rounded-2xl border border-ink-700"
          >
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                onClick={() => setBiomeVariant('light')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-950/70 text-ink-200',
                  biomeVariant === 'light' && 'border-gold-400 text-gold-400',
                )}
                title="Claro"
              >
                <Sun size={14} />
              </button>
              <button
                onClick={() => setBiomeVariant('dark')}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 bg-ink-950/70 text-ink-200',
                  biomeVariant === 'dark' && 'border-gold-400 text-gold-400',
                )}
                title="Oscuro"
              >
                <Moon size={14} />
              </button>
            </div>
            <AvatarSprite config={avatar} size={128} />
          </BiomaComponent>
        )}

        <div className="mt-8 grid grid-cols-2 gap-3">
          {biomes.map((biome) => (
            <motion.button
              key={biome.id}
              onClick={() => setBiome(biome.id)}
              whileTap={{ scale: 0.96 }}
              className="relative overflow-hidden rounded-2xl border-2 transition-colors"
              style={{ borderColor: selectedBiome === biome.id ? biome.color : 'var(--color-ink-700)' }}
            >
              <BiomaComponent
                biomeId={biome.id}
                variant={biomeVariant}
                vignette={false}
                className="flex h-full flex-col items-center justify-center gap-2 p-5"
              >
                <div className="absolute inset-0 bg-ink-950/40" />
                <span className="relative text-4xl">{biome.emoji}</span>
                <span className="relative font-pixel text-[10px] text-ink-50">{biome.name}</span>
              </BiomaComponent>
            </motion.button>
          ))}
        </div>

        {selectedBiome && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setPaintingBiome(true)}
              className="flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-xs text-ink-200"
            >
              <Paintbrush size={14} />
              {biomeArt ? 'Editar pintura del bioma' : 'Pintar bioma'}
            </button>
          </div>
        )}

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

        {selectedBiome && (
          <PixelEditor
            open={paintingBiome}
            title="Pintar bioma"
            frameWidth={BIOME_ART_WIDTH}
            frameHeight={BIOME_ART_HEIGHT}
            cellSize={3}
            loadFrame={() => getEditableBiomeFrame(biomeArt, biomeBackgroundUrl(selectedBiome, biomeVariant))}
            onClose={() => setPaintingBiome(false)}
            onSave={setBiomeArt}
            onClear={clearBiomeArt}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-10 pb-8">
      {mode === 'create' && <StepIndicator current="avatar" />}
      <h1 className="font-pixel text-lg text-gold-400">
        {mode === 'create' ? 'Crea tu aventurero' : 'Editar personaje'}
      </h1>
      {mode === 'create' && (
        <p className="mt-2 text-sm text-ink-400">
          Esta es la persona que va a recorrer tu mundo y completar tus misiones. Hazla tuya.
        </p>
      )}

      <div className="relative my-6 flex justify-center">
        <AvatarSprite config={avatar} size={256} />
        <button
          onClick={randomize}
          title="Personaje aleatorio"
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 bg-ink-900 text-ink-200 shadow-lg transition-colors hover:border-gold-400 hover:text-gold-400"
        >
          <Dices size={18} />
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-1 block text-xs text-ink-400">Nombre</span>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="¿Cómo te llamarán en tu mundo?"
        />
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
        <div className="w-40 text-center">
          <p className="text-sm font-medium text-ink-50">{currentOption?.label}</p>
          {options.length > 1 && (
            <p className="text-[10px] text-ink-500">
              {Math.max(0, options.findIndex((o) => o.id === currentOptionId)) + 1}/{options.length}
            </p>
          )}
        </div>
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

      {(PAINTABLE_CATEGORIES.includes(category) || (category === 'hat' && currentOptionId === 'mask')) && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setPaintingCategory(category)}
            className="flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-xs text-ink-200"
          >
            <Paintbrush size={14} />
            {avatar.pixelOverrides[category] ? 'Editar pintura' : 'Pintar píxeles'}
          </button>
        </div>
      )}

      {category === 'hat' && currentOptionId && isHatResizable(currentOptionId) && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs text-ink-400">Tamaño</span>
          <button
            onClick={() => setHatScale(Math.round((avatar.hatScale - HAT_SCALE_STEP) * 100) / 100)}
            disabled={avatar.hatScale <= HAT_SCALE_MIN}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 text-ink-50 disabled:opacity-40"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-xs font-medium text-ink-50">{Math.round(avatar.hatScale * 100)}%</span>
          <button
            onClick={() => setHatScale(Math.round((avatar.hatScale + HAT_SCALE_STEP) * 100) / 100)}
            disabled={avatar.hatScale >= HAT_SCALE_MAX}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-600 text-ink-50 disabled:opacity-40"
          >
            <Plus size={14} />
          </button>
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

      {paintingCategory && (
        <PixelEditor
          open
          title={`Pintar ${CATEGORY_LABELS[paintingCategory]}`}
          loadFrame={() => getEditableFrame(avatar, paintingCategory)}
          loadSilhouette={() => getLayerSilhouette(avatar, paintingCategory)}
          onClose={() => setPaintingCategory(null)}
          onSave={(dataUrl) => setPixelOverride(paintingCategory, dataUrl)}
          onClear={() => clearPixelOverride(paintingCategory)}
        />
      )}
    </div>
  )
}
