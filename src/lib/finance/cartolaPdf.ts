import { parseCartolaItems, type CartolaParse, type PdfTextItem } from './cartola'

/**
 * pdf.js pesa cerca de medio mega. Se carga la primera vez que alguien importa
 * una cartola, no al abrir la app — la mayoría de las sesiones no lo necesitan.
 */
let pdfjsLoader: Promise<typeof import('pdfjs-dist')> | null = null

function loadPdfjs() {
  pdfjsLoader ??= (async () => {
    const [pdfjs, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ])
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    return pdfjs
  })()
  return pdfjsLoader
}

/** El PDF venía protegido y sin la clave no hay nada que leer. */
export class CartolaPasswordError extends Error {
  constructor(public readonly wrongAttempt: boolean) {
    super(wrongAttempt ? 'La clave no es correcta.' : 'Este PDF pide una clave.')
    this.name = 'CartolaPasswordError'
  }
}

/**
 * Lee una cartola desde el archivo del usuario. pdf.js corre en un worker dentro
 * del navegador: el PDF y su clave no viajan a ningún servidor, ni al nuestro.
 */
export async function readCartolaPdf(file: File, password?: string): Promise<CartolaParse> {
  const pdfjs = await loadPdfjs()
  const data = new Uint8Array(await file.arrayBuffer())

  let doc
  try {
    doc = await pdfjs.getDocument({ data, password }).promise
  } catch (err) {
    const name = (err as { name?: string })?.name
    // pdf.js distingue "falta la clave" de "la clave está mala" por el code del error.
    if (name === 'PasswordException') {
      const code = (err as { code?: number }).code
      throw new CartolaPasswordError(code === 2)
    }
    throw err
  }

  const items: PdfTextItem[] = []
  for (let page = 1; page <= doc.numPages; page++) {
    const content = await (await doc.getPage(page)).getTextContent()
    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue
      items.push({ page, x: item.transform[4], y: item.transform[5], str: item.str })
    }
  }

  // Un PDF "impreso" (Microsoft Print to PDF) dibuja las letras como vectores y
  // no deja texto que extraer. Es un caso frecuente y merece decirlo claro.
  if (items.length === 0) {
    return {
      accountTail: '',
      rows: [],
      balanced: false,
      problems: [
        'Este PDF no tiene texto, solo imágenes. Suele pasar cuando se guarda con "Imprimir a PDF": descarga el archivo original desde el banco.',
      ],
    }
  }

  return parseCartolaItems(items)
}
