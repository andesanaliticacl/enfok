import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Minus, Plus, Paintbrush, Sun, Moon, Dices, Ban } from 'lucide-react'
import { useAvatarStore, HAT_SCALE_MIN, HAT_SCALE_MAX, HAT_SCALE_STEP } from '@/store/useAvatarStore'
import { useGameStore } from '@/store/useGameStore'
import { AvatarSprite } from '@/components/avatar/AvatarSprite'
import { LayerThumb } from '@/components/avatar/LayerThumb'
import { PixelEditor } from '@/components/avatar/PixelEditor'
import { getEditableFrame, getLayerSilhouette, getEditableBiomeFrame, BIOME_ART_WIDTH, BIOME_ART_HEIGHT } from '@/lib/avatar/pixelFrame'
import { lpcProvider, figureOfBodyId, isHatResizable } from '@/lib/avatar/providers/lpcProvider'
import { biomes, biomeBackgroundUrl } from '@/data/biomes'
import { BiomaComponent } from '@/components/biome/BiomaComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { AvatarConfig, AvatarLayerCategory, LayerOption, ResolvedLayer } from '@/lib/avatar/types'

const RANDOM_CATEGORIES: AvatarLayerCategory[] = ['hair', 'beard', 'eyes', 'shirt', 'pants', 'shoes', 'hat', 'pet']
const PAINTABLE_CATEGORIES: AvatarLayerCategory[] = ['shirt', 'pants', 'shoes']

/** How each category's thumbnail crops the 64px frame: where to look and how close. */
const THUMB_VIEW: Partial<Record<AvatarLayerCategory, { focusY: number; zoom: number }>> = {
  body: { focusY: 22, zoom: 1.7 },
  hair: { focusY: 14, zoom: 2.1 },
  beard: { focusY: 20, zoom: 2.4 },
  eyes: { focusY: 17, zoom: 2.8 },
  shirt: { focusY: 34, zoom: 1.8 },
  pants: { focusY: 46, zoom: 1.8 },
  shoes: { focusY: 57, zoom: 2.1 },
  hat: { focusY: 13, zoom: 1.9 },
  pet: { focusY: 40, zoom: 1.5 },
}

type StyleGroup = 'rostro' | 'ropa' | 'extras'
const STYLE_GROUPS: { id: StyleGroup; label: string; categories: AvatarLayerCategory[] }[] = [
  { id: 'rostro', label: 'Rostro', categories: ['hair', 'beard', 'eyes'] },
  { id: 'ropa', label: 'Vestimenta', categories: ['shirt', 'pants', 'shoes'] },
  { id: 'extras', label: 'Extras', categories: ['hat', 'pet'] },
]

const SUBCATEGORY_LABELS: Partial<Record<AvatarLayerCategory, string>> = {
  hair: 'Pelo',
  beard: 'Barba',
  eyes: 'Ojos',
  shirt: 'Torso',
  pants: 'Piernas',
  shoes: 'Calzado',
  hat: 'Sombreros',
  pet: 'Compañero',
}

const RACE_TAGLINES: Record<string, string> = {
  male: 'Clásico y confiable.',
  female: 'Clásica y confiable.',
  female_teen: 'Ligereza y agilidad.',
  muscular: 'Fuerza bruta al servicio del plan.',
  orc_male: 'La disciplina de la horda.',
  orc_female: 'La disciplina de la horda.',
  lizard_male: 'Sangre fría, mirada de reptil.',
  lizard_female: 'Sangre fría, mirada de reptil.',
  wolf_male: 'Instinto de depredador.',
  wolf_female: 'Instinto de depredadora.',
  minotaur_male: 'Nadie se interpone en su camino.',
  minotaur_female: 'Nadie se interpone en su camino.',
  vampire: 'La eternidad da tiempo para planificar.',
  goblin: 'Astucia por sobre todas las cosas.',
  troll: 'Paciencia de piedra.',
  zombie: 'Ni la muerte detiene sus hábitos.',
  rabbit: 'Rápido, curioso, imparable.',
  skeleton: 'Sus pendientes lo siguen a la tumba.',
}

function pickRandom<T>(arr: T[]): T | undefined {
  return arr[Math.floor(Math.random() * arr.length)]
}

type Step = 'identity' | 'style' | 'world'

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'identity', label: '1 · Identidad' },
    { id: 'style', label: '2 · Apariencia' },
    { id: 'world', label: '3 · Mundo' },
  ]
  return (
    <div className="mb-4 flex items-center gap-1.5">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1.5">
          {i > 0 && <span className="h-px w-4 bg-ink-700" />}
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 font-pixel text-[8px]',
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

function ColorDots({
  option,
  selected,
  onSelect,
}: {
  option: LayerOption
  selected?: string
  onSelect: (colorId: string) => void
}) {
  if (option.colorMode === 'none' || option.colors.length === 0) return null
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2">
      {option.colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className={cn(
            'h-7 w-7 rounded-full border-2 border-transparent transition-transform hover:scale-110',
            selected === color.id && 'border-gold-400 scale-110',
          )}
          style={{ backgroundColor: color.swatch }}
          aria-label={color.label}
          title={color.label}
        />
      ))}
    </div>
  )
}

interface CharacterCreationPageProps {
  mode?: 'create' | 'edit-avatar' | 'edit-biome'
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

  const [step, setStep] = useState<Step>(mode === 'edit-biome' ? 'world' : 'identity')
  const [name, setName] = useState(profileName)
  const [group, setGroup] = useState<StyleGroup>('rostro')
  const [subcategory, setSubcategory] = useState<AvatarLayerCategory>('hair')
  const [paintingCategory, setPaintingCategory] = useState<AvatarLayerCategory | null>(null)
  const [paintingBiome, setPaintingBiome] = useState(false)

  const bodies = useMemo(() => lpcProvider.listOptions('body', avatar.figure), [avatar.figure])
  const currentBody = avatar.options.body ?? 'male'
  const currentBodyOption = bodies.find((b) => b.id === currentBody)

  /** Body + head (+ eyes for non-eye categories) resolved with the current look — the context behind every thumbnail. */
  const contextLayers = useMemo(() => {
    const layers: ResolvedLayer[] = []
    const body = lpcProvider.resolveLayer('body', currentBody, avatar.colors.body, avatar.figure)
    const head = lpcProvider.resolveLayer('head', currentBody, avatar.colors.body, avatar.figure)
    if (body) layers.push(body)
    if (head) layers.push(head)
    return layers
  }, [currentBody, avatar.colors.body, avatar.figure])

  const eyesLayer = useMemo(
    () => lpcProvider.resolveLayer('eyes', avatar.options.eyes ?? 'default', avatar.colors.eyes, avatar.figure),
    [avatar.options.eyes, avatar.colors.eyes, avatar.figure],
  )

  function selectBody(bodyId: string) {
    const figure = figureOfBodyId(bodyId)
    if (figure !== avatar.figure) setFigure(figure)
    setOption('body', bodyId)
    setOption('head', bodyId)
  }

  /** One tap, a whole new adventurer — body first (it constrains everything), then the rest. */
  function randomize() {
    const body = pickRandom(bodies)
    let figure = avatar.figure
    if (body) {
      figure = figureOfBodyId(body.id)
      if (figure !== avatar.figure) setFigure(figure)
      setOption('body', body.id)
      setOption('head', body.id)
      if (body.colors.length > 0) setColor('body', pickRandom(body.colors)!.id)
    }
    for (const cat of RANDOM_CATEGORIES) {
      const opt = pickRandom(lpcProvider.listOptions(cat, figure))
      if (!opt) continue
      setOption(cat, opt.id)
      if (opt.colorMode !== 'none' && opt.colors.length > 0) {
        setColor(cat as keyof AvatarConfig['colors'], pickRandom(opt.colors)!.id)
      }
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

  /* ---------------------------------- Acto 3: Mundo ---------------------------------- */
  if (step === 'world') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-10 pb-8">
        {mode === 'create' && <StepIndicator current="world" />}
        <h1 className="font-pixel text-lg text-gold-400">¿Dónde comienza tu aventura?</h1>
        <p className="mt-2 text-sm text-ink-400">
          Elige el bioma de tu mundo — el escenario donde tu personaje vivirá cada día que planifiques.
        </p>

        {selectedBiome && (
          <BiomaComponent
            biomeId={selectedBiome}
            variant={biomeVariant}
            customArt={biomeArt}
            className="panel-bevel mt-4 flex h-60 items-center justify-center rounded-2xl border border-ink-700"
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

            <div className="flex flex-col items-center">
              <AvatarSprite config={avatar} size={128} animate />
              {mode === 'create' && (
                <div className="rounded-xl bg-ink-950/80 px-4 py-2 text-center">
                  <p className="text-sm font-semibold text-ink-50">{name.trim() || 'Aventurero'}</p>
                  <p className="font-pixel text-[8px] text-gold-400">Nivel 1 · Novato</p>
                  <p className="mt-0.5 text-[10px] text-ink-400">
                    {currentBodyOption?.label} · {RACE_TAGLINES[currentBody] ?? ''}
                  </p>
                </div>
              )}
            </div>
          </BiomaComponent>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
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
              <Button variant="outline" onClick={() => setStep('style')} className="flex-1">
                Atrás
              </Button>
              <Button onClick={() => finishAndExit('/')} className="flex-1" disabled={!selectedBiome}>
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

  /* ---------------------------------- Acto 1: Identidad ---------------------------------- */
  if (step === 'identity') {
    return (
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-10 pb-8">
        {mode === 'create' && <StepIndicator current="identity" />}
        <h1 className="font-pixel text-lg text-gold-400">{mode === 'create' ? '¿Quién eres?' : 'Editar personaje'}</h1>
        <p className="mt-2 text-sm text-ink-400">
          {RACE_TAGLINES[currentBody] ?? 'Esta es la persona que va a recorrer tu mundo.'}
        </p>

        <div className="relative my-5 flex justify-center">
          <div className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/60 p-2">
            <AvatarSprite config={avatar} size={176} animate />
          </div>
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
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="¿Cómo te llamarán en tu mundo?" />
        </label>

        <p className="mb-2 text-xs uppercase tracking-wide text-ink-400">Raza y cuerpo</p>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {bodies.map((body) => {
            const layers = [
              lpcProvider.resolveLayer('body', body.id, avatar.colors.body, figureOfBodyId(body.id)),
              lpcProvider.resolveLayer('head', body.id, avatar.colors.body, figureOfBodyId(body.id)),
            ].filter((l): l is ResolvedLayer => l !== null)
            return (
              <motion.button
                key={body.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => selectBody(body.id)}
                title={body.label}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border bg-ink-900 p-1.5',
                  currentBody === body.id ? 'border-gold-400' : 'border-ink-700',
                )}
              >
                <LayerThumb layers={layers} {...THUMB_VIEW.body!} size={56} />
                <span className="w-full truncate text-center text-[9px] leading-tight text-ink-300">{body.label}</span>
              </motion.button>
            )
          })}
        </div>

        {currentBodyOption && (
          <ColorDots
            option={currentBodyOption}
            selected={avatar.colors.body}
            onSelect={(colorId) => setColor('body', colorId)}
          />
        )}

        <div className="mt-auto flex gap-3 pt-8">
          {mode === 'edit-avatar' && (
            <Button variant="outline" onClick={() => navigate('/perfil')} className="flex-1">
              Cancelar
            </Button>
          )}
          <Button onClick={() => setStep('style')} className="flex-1">
            Continuar
          </Button>
        </div>
      </div>
    )
  }

  /* ---------------------------------- Acto 2: Apariencia ---------------------------------- */
  const activeGroup = STYLE_GROUPS.find((g) => g.id === group)!
  const options = lpcProvider.listOptions(subcategory, avatar.figure)
  const currentOptionId = avatar.options[subcategory] ?? options[0]?.id
  const currentOption = options.find((o) => o.id === currentOptionId) ?? options[0]
  const view = THUMB_VIEW[subcategory] ?? { focusY: 32, zoom: 1.5 }

  function thumbLayersFor(option: LayerOption): ResolvedLayer[] {
    const layers = [...contextLayers]
    if (subcategory !== 'eyes' && eyesLayer) layers.push(eyesLayer)
    const candidate = lpcProvider.resolveLayer(subcategory, option.id, avatar.colors[subcategory], avatar.figure)
    if (candidate) layers.push(candidate)
    return layers
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-10 pb-8">
      {mode === 'create' && <StepIndicator current="style" />}
      <h1 className="font-pixel text-lg text-gold-400">Tu apariencia</h1>

      <div className="relative my-5 flex justify-center">
        <div className="panel-bevel rounded-2xl border border-ink-700 bg-ink-900/60 p-2">
          <AvatarSprite config={avatar} size={176} animate />
        </div>
        <button
          onClick={randomize}
          title="Personaje aleatorio"
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 bg-ink-900 text-ink-200 shadow-lg transition-colors hover:border-gold-400 hover:text-gold-400"
        >
          <Dices size={18} />
        </button>
      </div>

      <div className="mb-3 flex justify-center gap-2">
        {STYLE_GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGroup(g.id)
              setSubcategory(g.categories[0])
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-medium text-ink-400',
              group === g.id && 'bg-ink-800 text-gold-400',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex justify-center gap-1.5">
        {activeGroup.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSubcategory(cat)}
            className={cn(
              'rounded-full border px-3 py-1 text-[11px] text-ink-400',
              subcategory === cat ? 'border-gold-400 text-gold-400' : 'border-ink-700',
            )}
          >
            {SUBCATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {options.map((option) => (
          <motion.button
            key={option.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setOption(subcategory, option.id)}
            title={option.label}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border bg-ink-900 p-1.5',
              currentOptionId === option.id ? 'border-gold-400' : 'border-ink-700',
            )}
          >
            {option.id === 'none' ? (
              <span className="flex h-14 w-14 items-center justify-center text-ink-600">
                <Ban size={22} />
              </span>
            ) : (
              <LayerThumb layers={thumbLayersFor(option)} focusY={view.focusY} zoom={view.zoom} size={56} />
            )}
            <span className="w-full truncate text-center text-[9px] leading-tight text-ink-300">{option.label}</span>
          </motion.button>
        ))}
      </div>

      {currentOption && (
        <ColorDots
          option={currentOption}
          selected={avatar.colors[subcategory]}
          onSelect={(colorId) => setColor(subcategory as keyof AvatarConfig['colors'], colorId)}
        />
      )}

      {(PAINTABLE_CATEGORIES.includes(subcategory) || (subcategory === 'hat' && currentOptionId === 'mask')) && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setPaintingCategory(subcategory)}
            className="flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-xs text-ink-200"
          >
            <Paintbrush size={14} />
            {avatar.pixelOverrides[subcategory] ? 'Editar pintura' : 'Pintar píxeles'}
          </button>
        </div>
      )}

      {subcategory === 'hat' && currentOptionId && isHatResizable(currentOptionId) && currentOptionId !== 'none' && (
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
        <Button variant="outline" onClick={() => setStep('identity')} className="flex-1">
          Atrás
        </Button>
        <Button
          onClick={() => (mode === 'edit-avatar' ? finishAndExit('/perfil') : setStep('world'))}
          className="flex-1"
        >
          {mode === 'edit-avatar' ? 'Guardar' : 'Continuar'}
        </Button>
      </div>

      {paintingCategory && (
        <PixelEditor
          open
          title={`Pintar ${SUBCATEGORY_LABELS[paintingCategory] ?? paintingCategory}`}
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
