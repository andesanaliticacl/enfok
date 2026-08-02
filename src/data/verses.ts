export interface Verse {
  /** Book + chapter, e.g. "Filipenses 4". */
  book: string
  /** The verse number within the chapter — also the XP reward (a "número santificado según el versículo"). */
  verse: number
  reference: string
  text: string
}

/**
 * Brief, reflective verses. The XP a reader earns is the verse number itself
 * (Filipenses 4:13 → 13 XP), floored so even a small number still feels worth
 * the pause. One verse per day, chosen deterministically from the date so the
 * whole app shows the same passage and it rotates each morning.
 */
export const VERSES: Verse[] = [
  { book: 'Filipenses 4', verse: 13, reference: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' },
  { book: 'Jeremías 29', verse: 11, reference: 'Jeremías 29:11', text: 'Yo sé los planes que tengo para ti: planes de bienestar y no de calamidad, para darte un futuro y una esperanza.' },
  { book: 'Proverbios 3', verse: 5, reference: 'Proverbios 3:5', text: 'Confía en el Señor de todo corazón, y no te apoyes en tu propia inteligencia.' },
  { book: 'Josué 1', verse: 9, reference: 'Josué 1:9', text: 'Esfuérzate y sé valiente; no temas ni desmayes, porque el Señor tu Dios estará contigo dondequiera que vayas.' },
  { book: 'Salmos 23', verse: 1, reference: 'Salmos 23:1', text: 'El Señor es mi pastor; nada me faltará.' },
  { book: 'Isaías 40', verse: 31, reference: 'Isaías 40:31', text: 'Los que esperan en el Señor renovarán sus fuerzas; correrán y no se cansarán.' },
  { book: 'Mateo 6', verse: 34, reference: 'Mateo 6:34', text: 'No os afanéis por el mañana, porque el mañana traerá su propio afán. Basta a cada día su propio mal.' },
  { book: 'Romanos 8', verse: 28, reference: 'Romanos 8:28', text: 'A los que aman a Dios, todas las cosas les ayudan a bien.' },
  { book: 'Salmos 46', verse: 10, reference: 'Salmos 46:10', text: 'Estad quietos, y conoced que yo soy Dios.' },
  { book: 'Gálatas 6', verse: 9, reference: 'Gálatas 6:9', text: 'No nos cansemos de hacer el bien, porque a su tiempo segaremos, si no desmayamos.' },
  { book: 'Proverbios 16', verse: 3, reference: 'Proverbios 16:3', text: 'Encomienda al Señor tus obras, y tus pensamientos serán afirmados.' },
  { book: 'Mateo 11', verse: 28, reference: 'Mateo 11:28', text: 'Venid a mí todos los que estáis cansados y cargados, y yo os haré descansar.' },
  { book: 'Salmos 37', verse: 5, reference: 'Salmos 37:5', text: 'Encomienda al Señor tu camino, confía en él, y él hará.' },
  { book: '1 Corintios 13', verse: 4, reference: '1 Corintios 13:4', text: 'El amor es paciente, es bondadoso. No tiene envidia ni orgullo.' },
  { book: 'Filipenses 4', verse: 6, reference: 'Filipenses 4:6', text: 'Por nada estéis afanosos; presentad vuestras peticiones delante de Dios en oración y con acción de gracias.' },
  { book: 'Salmos 118', verse: 24, reference: 'Salmos 118:24', text: 'Este es el día que hizo el Señor; nos gozaremos y alegraremos en él.' },
  { book: 'Proverbios 4', verse: 23, reference: 'Proverbios 4:23', text: 'Sobre toda cosa guardada, guarda tu corazón, porque de él mana la vida.' },
  { book: 'Isaías 41', verse: 10, reference: 'Isaías 41:10', text: 'No temas, porque yo estoy contigo; te sostendré con la diestra de mi justicia.' },
  { book: 'Colosenses 3', verse: 23, reference: 'Colosenses 3:23', text: 'Todo lo que hagas, hazlo de corazón, como para el Señor y no para los hombres.' },
  { book: 'Santiago 1', verse: 12, reference: 'Santiago 1:12', text: 'Bienaventurado el que soporta la prueba, porque recibirá la corona de vida.' },
  { book: 'Salmos 119', verse: 105, reference: 'Salmos 119:105', text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.' },
  { book: 'Mateo 5', verse: 16, reference: 'Mateo 5:16', text: 'Alumbre vuestra luz delante de los hombres, para que vean vuestras buenas obras.' },
  { book: 'Romanos 12', verse: 12, reference: 'Romanos 12:12', text: 'Gozosos en la esperanza, pacientes en la tribulación, constantes en la oración.' },
  { book: 'Proverbios 21', verse: 5, reference: 'Proverbios 21:5', text: 'Los pensamientos del diligente ciertamente tienden a la abundancia.' },
  { book: 'Salmos 27', verse: 1, reference: 'Salmos 27:1', text: 'El Señor es mi luz y mi salvación; ¿de quién temeré?' },
  { book: '2 Timoteo 1', verse: 7, reference: '2 Timoteo 1:7', text: 'No nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.' },
  { book: 'Hebreos 12', verse: 1, reference: 'Hebreos 12:1', text: 'Corramos con paciencia la carrera que tenemos por delante.' },
  { book: 'Salmos 90', verse: 12, reference: 'Salmos 90:12', text: 'Enséñanos a contar nuestros días, de tal manera que traigamos al corazón sabiduría.' },
  { book: 'Miqueas 6', verse: 8, reference: 'Miqueas 6:8', text: 'Hacer justicia, amar misericordia, y humillarte ante tu Dios.' },
  { book: 'Juan 3', verse: 16, reference: 'Juan 3:16', text: 'De tal manera amó Dios al mundo, que ha dado a su Hijo unigénito.' },
  { book: 'Lamentaciones 3', verse: 23, reference: 'Lamentaciones 3:23', text: 'Nuevas son cada mañana sus misericordias; grande es tu fidelidad.' },
]

/** Minimum XP so a verse like Salmos 23:1 still rewards the pause. */
export const MIN_VERSE_XP = 7
/** Cap so a high-numbered verse (Salmos 119:105) doesn't dwarf a day's goal — 40, the sanctified number. */
export const MAX_VERSE_XP = 40

/** Days since a fixed epoch, so the verse changes at local midnight and is stable through the day. */
function dayIndex(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000)
}

/** The verse for a given ISO date (yyyy-mm-dd) — deterministic, so everyone shares today's passage. */
export function verseForDate(dateKey: string): Verse {
  return VERSES[((dayIndex(dateKey) % VERSES.length) + VERSES.length) % VERSES.length]
}

/** XP earned for reading a verse: its own number, floored at MIN_VERSE_XP and capped at MAX_VERSE_XP. */
export function verseXp(verse: Verse): number {
  return Math.min(MAX_VERSE_XP, Math.max(MIN_VERSE_XP, verse.verse))
}
