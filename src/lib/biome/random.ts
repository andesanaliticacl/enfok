/** Deterministic PRNG so scenery layout is stable across re-renders but differs per biome/variant. */
export function mulberry32(seed: number) {
  return function random() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFrom(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return h
}

/** A seeded generator for one named layer of a scene (stars, embers, …). */
export function layerRandom(seedKey: string, layer: string) {
  return mulberry32(seedFrom(`${seedKey}-${layer}`))
}

/** Builds `count` items from a seeded generator — the standard particle-field helper. */
export function particles<T>(seedKey: string, layer: string, count: number, make: (rand: () => number, i: number) => T): T[] {
  const rand = layerRandom(seedKey, layer)
  return Array.from({ length: count }, (_, i) => make(rand, i))
}
