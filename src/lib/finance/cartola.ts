/**
 * Lector de cartolas de cuenta corriente (Banco Falabella).
 *
 * El PDF trae las columnas alineadas a la derecha, así que las posiciones x de
 * los montos bailan según cuántos dígitos tengan. Por eso nada acá se decide por
 * coordenada exacta: las celdas se clasifican por lo que dicen (una fecha, un
 * monto, "SUCURSAL"...), y solo el orden horizontal decide cuál monto es cuál.
 *
 * Todo corre en el navegador. El PDF nunca sale del dispositivo.
 */

/** Un fragmento de texto del PDF con su posición. */
export interface PdfTextItem {
  page: number
  x: number
  y: number
  str: string
}

export interface CartolaRow {
  /** ISO (yyyy-mm-dd). */
  date: string
  description: string
  /** Plata que sale, en CLP. 0 si la fila es un abono. */
  cargo: number
  /** Plata que entra, en CLP. 0 si la fila es un cargo. */
  abono: number
  /** Saldo de la cuenta después del movimiento — de acá sale la validación. */
  saldo: number
}

export interface CartolaParse {
  /** Últimos 4 dígitos de la cuenta. El número completo no se guarda nunca. */
  accountTail: string
  /** Periodo declarado en la cabecera, en ISO. */
  from?: string
  to?: string
  saldoInicial?: number
  saldoFinal?: number
  rows: CartolaRow[]
  /**
   * La cadena de saldos cuadra de principio a fin. Si es false, leímos mal algo
   * y la importación no debe ofrecerse: un dígito equivocado en plata no se nota.
   */
  balanced: boolean
  /** Qué falló, en castellano, para mostrárselo al usuario. */
  problems: string[]
}

const DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/
const MONEY_RE = /^\$-?[\d.]+$/

/** "$1.306.132" → 1306132 · "$0" → 0 */
function money(raw: string): number {
  return Number(raw.replace(/[$.]/g, '')) || 0
}

/** "02/07/2026" → "2026-07-02" */
function isoDate(raw: string): string {
  const [d, m, y] = raw.split('/')
  return `${y}-${m}-${d}`
}

/**
 * Agrupa los fragmentos en filas visuales. Las filas están separadas ~11pt, pero
 * una descripción larga se parte en líneas a ~4pt entre sí. La comparación es
 * contra la línea anterior, no contra la primera del grupo: una descripción de
 * tres líneas abarca 8pt en total y quedaría cortada por la mitad.
 */
const ROW_GAP = 6

function clusterRows(items: PdfTextItem[]): PdfTextItem[][] {
  const sorted = [...items].sort((a, b) => a.page - b.page || b.y - a.y || a.x - b.x)
  const rows: PdfTextItem[][] = []
  let current: PdfTextItem[] = []
  let previous: PdfTextItem | null = null

  for (const item of sorted) {
    if (previous && item.page === previous.page && Math.abs(item.y - previous.y) <= ROW_GAP) {
      current.push(item)
    } else {
      if (current.length) rows.push(current)
      current = [item]
    }
    previous = item
  }
  if (current.length) rows.push(current)
  return rows
}

/** Texto plano de una fila, para buscar la metadata de la cabecera. */
function rowText(row: PdfTextItem[]): string {
  return [...row]
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((i) => i.str.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
}

/**
 * Convierte una fila en movimiento, o null si no lo es (cabeceras, pie de página,
 * la marca de agua con el correo y la clave del titular).
 */
function toMovement(row: PdfTextItem[]): CartolaRow | null {
  const dates = row.filter((i) => DATE_RE.test(i.str.trim()))
  if (dates.length !== 1) return null

  const amounts = row
    .filter((i) => MONEY_RE.test(i.str.trim()))
    .sort((a, b) => a.x - b.x)
  // Cargo, abono y saldo van siempre los tres, aunque dos vengan en $0.
  if (amounts.length !== 3) return null

  const date = dates[0]
  const description = row
    .filter(
      (i) =>
        i !== date &&
        !MONEY_RE.test(i.str.trim()) &&
        !/SUCURSAL/i.test(i.str) &&
        !/^\d+$/.test(i.str.trim()) &&
        i.x > date.x,
    )
    // De arriba hacia abajo: así "TRANSF. DE CORPORACION" + "EDUCACIONAL JEMA"
    // se vuelve a armar en el orden en que se lee.
    .sort((a, b) => b.y - a.y || a.x - b.x)
    .map((i) => i.str.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!description) return null

  return {
    date: isoDate(date.str.trim()),
    description,
    cargo: money(amounts[0].str),
    abono: money(amounts[1].str),
    saldo: money(amounts[2].str),
  }
}

/**
 * Comprueba que saldo_anterior − cargo + abono = saldo en cada fila. Si la cadena
 * completa cuadra y termina en el saldo final declarado, leímos bien el PDF.
 * Es la única forma honesta de saber que no inventamos un número.
 */
function verifyChain(rows: CartolaRow[], saldoInicial?: number, saldoFinal?: number): string[] {
  const problems: string[] = []
  if (saldoInicial === undefined) {
    problems.push('No encontramos el saldo inicial, así que no podemos verificar los montos.')
    return problems
  }

  let running = saldoInicial
  for (const row of rows) {
    running = running - row.cargo + row.abono
    if (running !== row.saldo) {
      problems.push(
        `El saldo no cuadra en "${row.description}" (${row.date}): esperábamos $${running.toLocaleString('es-CL')} y el PDF dice $${row.saldo.toLocaleString('es-CL')}.`,
      )
      return problems
    }
  }

  if (saldoFinal !== undefined && running !== saldoFinal) {
    problems.push(
      `El saldo final no coincide: sumando los movimientos da $${running.toLocaleString('es-CL')} y la cartola dice $${saldoFinal.toLocaleString('es-CL')}.`,
    )
  }
  return problems
}

export function parseCartolaItems(items: PdfTextItem[]): CartolaParse {
  const rows = clusterRows(items)

  let accountTail = ''
  let from: string | undefined
  let to: string | undefined
  let saldoInicial: number | undefined
  let saldoFinal: number | undefined

  for (let i = 0; i < rows.length; i++) {
    const text = rowText(rows[i])

    const account = text.match(/Numero de Cuenta\s*:\s*([\d-]+)/i)
    // Solo la cola: el número completo identifica al titular y no nos hace falta.
    if (account && !accountTail) accountTail = account[1].replace(/\D/g, '').slice(-4)

    const period = text.match(/desde\s*:\s*(\d{2}\/\d{2}\/\d{4}).*?Hasta\s*:\s*(\d{2}\/\d{2}\/\d{4})/i)
    if (period && !from) {
      from = isoDate(period[1])
      to = isoDate(period[2])
    }

    // Los cuatro montos del resumen viven en la fila siguiente a sus etiquetas.
    if (/Saldo Inicial/i.test(text) && /Saldo Final/i.test(text)) {
      const values = (rows[i + 1] ?? []).filter((c) => MONEY_RE.test(c.str.trim())).sort((a, b) => a.x - b.x)
      if (values.length >= 2) {
        saldoInicial = money(values[0].str)
        saldoFinal = money(values[1].str)
      }
    }
  }

  const movements = rows.map(toMovement).filter((r): r is CartolaRow => r !== null)
  const problems = verifyChain(movements, saldoInicial, saldoFinal)

  if (movements.length === 0) {
    problems.unshift('No encontramos movimientos en este PDF. ¿Es una cartola de cuenta corriente?')
  }

  return {
    accountTail,
    from,
    to,
    saldoInicial,
    saldoFinal,
    rows: movements,
    balanced: problems.length === 0,
    problems,
  }
}

/**
 * Huella de un movimiento dentro de una cuenta. Incluye el saldo resultante
 * porque es lo único que distingue dos transferencias idénticas el mismo día
 * — y en esta cartola las hay.
 */
export function cartolaSourceRef(accountTail: string, row: CartolaRow): string {
  const amount = row.cargo || row.abono
  return `cartola:${accountTail}:${row.date}:${amount}:${row.saldo}`
}
