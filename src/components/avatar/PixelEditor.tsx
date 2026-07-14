import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eraser, Paintbrush, X, RotateCcw } from 'lucide-react'
import { getEditableFrame } from '@/lib/avatar/pixelFrame'
import { lpcProvider, CATEGORY_LABELS } from '@/lib/avatar/providers/lpcProvider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AvatarConfig, AvatarLayerCategory } from '@/lib/avatar/types'

interface PixelEditorProps {
  open: boolean
  category: AvatarLayerCategory
  avatar: AvatarConfig
  onClose: () => void
  onSave: (dataUrl: string) => void
  onClear: () => void
}

const CELL_SIZE = 6
const QUICK_COLORS = ['#1c1c1c', '#ffffff', '#e8b892', '#2f5fa8', '#6e2632', '#2f5a3a', '#d4af6a', '#7a4a2a']

export function PixelEditor({ open, category, avatar, onClose, onSave, onClear }: PixelEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush')
  const [color, setColor] = useState('#2f5fa8')
  const [isPainting, setIsPainting] = useState(false)
  const [loading, setLoading] = useState(true)

  const frameSize = lpcProvider.frameSize
  const canvasPx = frameSize * CELL_SIZE

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)

    getEditableFrame(avatar, category).then((frame) => {
      if (cancelled) return
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvasPx, canvasPx)
      ctx.drawImage(frame, 0, 0, frameSize, frameSize, 0, 0, canvasPx, canvasPx)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category])

  function paintAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(((clientX - rect.left) / rect.width) * frameSize)
    const y = Math.floor(((clientY - rect.top) / rect.height) * frameSize)
    if (x < 0 || y < 0 || x >= frameSize || y >= frameSize) return

    const ctx = canvas.getContext('2d')!
    const px = x * CELL_SIZE
    const py = y * CELL_SIZE

    if (tool === 'eraser') {
      ctx.clearRect(px, py, CELL_SIZE, CELL_SIZE)
    } else {
      ctx.fillStyle = color
      ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE)
    }
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
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
    out.width = frameSize
    out.height = frameSize
    const ctx = out.getContext('2d')!
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, 0, 0, canvasPx, canvasPx, 0, 0, frameSize, frameSize)
    onSave(out.toDataURL('image/png'))
    onClose()
  }

  function handleReset() {
    onClear()
    getEditableFrame({ ...avatar, pixelOverrides: {} }, category).then((frame) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!
      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, canvasPx, canvasPx)
      ctx.drawImage(frame, 0, 0, frameSize, frameSize, 0, 0, canvasPx, canvasPx)
    })
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
            <h2 className="text-sm font-semibold text-ink-50">Pintar {CATEGORY_LABELS[category]}</h2>
            <button onClick={onClose} className="text-ink-400 hover:text-ink-50">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-auto p-4">
            <div
              className="relative border border-ink-700"
              style={{ width: canvasPx, height: canvasPx, imageRendering: 'pixelated' }}
            >
              <canvas
                ref={canvasRef}
                width={canvasPx}
                height={canvasPx}
                className="touch-none"
                style={{ width: canvasPx, height: canvasPx }}
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
              <button onClick={handleReset} className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 text-ink-400">
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
