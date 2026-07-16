import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eraser, Paintbrush, X, RotateCcw, Undo2 } from 'lucide-react'
import { lpcProvider } from '@/lib/avatar/providers/lpcProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PixelEditorProps {
  open: boolean
  title: string
  /** Loads the starting canvas (current paint, or the base art to paint over). */
  loadFrame: () => Promise<HTMLCanvasElement>
  /** When provided, the brush/eraser can only touch cells where this is true — keeps paint inside the garment's actual shape. Omit for free painting (e.g. a background). */
  loadSilhouette?: () => Promise<boolean[][] | null>
  onClose: () => void
  onSave: (dataUrl: string) => void
  onClear: () => void
  /** Pixel grid size — defaults to the avatar sprite's square frame. Pass the real dimensions for non-square art (e.g. a 160x90 biome background). */
  frameWidth?: number
  frameHeight?: number
  /** On-screen size of each pixel cell. */
  cellSize?: number
}

const QUICK_COLORS = ['#1c1c1c', '#ffffff', '#e8b892', '#2f5fa8', '#6e2632', '#2f5a3a', '#d4af6a', '#7a4a2a']

export function PixelEditor({
  open,
  title,
  loadFrame,
  loadSilhouette,
  onClose,
  onSave,
  onClear,
  frameWidth = lpcProvider.frameSize,
  frameHeight = lpcProvider.frameSize,
  cellSize = 6,
}: PixelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const silhouetteRef = useRef<boolean[][] | null>(null)
  const undoStackRef = useRef<ImageData[]>([])
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [color, setColor] = useState('#2f5fa8')
  const [isPainting, setIsPainting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [canUndo, setCanUndo] = useState(false)

  const MAX_UNDO_STEPS = 50

  const canvasPxWidth = frameWidth * cellSize
  const canvasPxHeight = frameHeight * cellSize

  function clipToSilhouette(ctx: CanvasRenderingContext2D) {
    const silhouette = silhouetteRef.current
    if (!silhouette) return
    for (let y = 0; y < frameHeight; y++) {
      for (let x = 0; x < frameWidth; x++) {
        if (!silhouette[y][x]) ctx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }

  async function reload() {
    setLoading(true)
    const [frame, silhouette] = await Promise.all([loadFrame(), loadSilhouette ? loadSilhouette() : Promise.resolve(null)])
    silhouetteRef.current = silhouette

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvasPxWidth, canvasPxHeight)
    ctx.drawImage(frame, 0, 0, frameWidth, frameHeight, 0, 0, canvasPxWidth, canvasPxHeight)
    // Any pre-existing paint that fell outside the shape (e.g. from before
    // this constraint existed) gets cleaned up the moment it's reopened.
    clipToSilhouette(ctx)
    undoStackRef.current = []
    setCanUndo(false)
    setLoading(false)
  }

  useEffect(() => {
    if (!open) return
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function paintAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((clientX - rect.left) / rect.width) * frameWidth)
    const y = Math.floor(((clientY - rect.top) / rect.height) * frameHeight)
    if (x < 0 || y < 0 || x >= frameWidth || y >= frameHeight) return
    if (silhouetteRef.current && !silhouetteRef.current[y][x]) return

    const ctx = canvas.getContext('2d')!
    const px = x * cellSize
    const py = y * cellSize

    if (tool === 'eraser') {
      ctx.clearRect(px, py, cellSize, cellSize)
    } else {
      ctx.fillStyle = color
      ctx.fillRect(px, py, cellSize, cellSize)
    }
  }

  function pushUndoSnapshot() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    undoStackRef.current.push(ctx.getImageData(0, 0, canvasPxWidth, canvasPxHeight))
    if (undoStackRef.current.length > MAX_UNDO_STEPS) undoStackRef.current.shift()
    setCanUndo(true)
  }

  function handleUndo() {
    const canvas = canvasRef.current
    const snapshot = undoStackRef.current.pop()
    if (!canvas || !snapshot) return
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(snapshot, 0, 0)
    setCanUndo(undoStackRef.current.length > 0)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pushUndoSnapshot()
    setIsPainting(true)
    paintAt(e.clientX, e.clientY)
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isPainting) return
    paintAt(e.clientX, e.clientY)
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setIsPainting(false)
  }

  function handleSave() {
    const canvas = canvasRef.current
    if (!canvas) return
    const out = document.createElement('canvas')
    out.width = frameWidth
    out.height = frameHeight
    const ctx = out.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, canvasPxWidth, canvasPxHeight, 0, 0, frameWidth, frameHeight)
    onSave(out.toDataURL('image/png'))
    onClose()
  }

  function handleReset() {
    onClear()
    reload()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-ink-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
            <h2 className="text-sm font-semibold text-ink-50">{title}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-50">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto p-4">
            <div
              className="relative border border-ink-700"
              style={{ width: canvasPxWidth, height: canvasPxHeight, imageRendering: 'pixelated' }}
            >
              <canvas
                ref={canvasRef}
                width={canvasPxWidth}
                height={canvasPxHeight}
                className="touch-none"
                style={{ width: canvasPxWidth, height: canvasPxHeight }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60 text-xs text-ink-400">
                  Cargando...
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTool('brush')}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600',
                  tool === 'brush' && 'border-gold-400 bg-ink-800',
                )}
              >
                <Paintbrush size={16} />
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600',
                  tool === 'eraser' && 'border-gold-400 bg-ink-800',
                )}
              >
                <Eraser size={16} />
              </button>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value)
                  setTool('brush')
                }}
                className="h-10 w-10 cursor-pointer rounded-xl border border-ink-600 bg-transparent p-1"
              />
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                title="Deshacer último trazo"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 text-ink-400 disabled:opacity-30"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={handleReset}
                title="Borrar toda la pintura"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 text-ink-400"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c)
                    setTool('brush')
                  }}
                  className={cn(
                    'h-7 w-7 rounded-full border-2',
                    color === c && tool === 'brush' ? 'border-gold-400' : 'border-transparent',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-ink-700 p-4">
            <Button onClick={handleSave} className="w-full">
              Guardar pintura
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
