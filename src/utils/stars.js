// Deterministic pseudo-random value in [0, 1) from an integer seed — used
// throughout the sky/cursor star fields so each star's look/timing is
// stable across renders instead of re-randomizing on every re-render.
export function rand(seed) {
  const x = Math.sin(seed * 999.7) * 43758.5453
  return x - Math.floor(x)
}

// A clip-path polygon for an n-pointed star, sized to fill its own box.
export function starPolygon(points, innerRatio) {
  const cx = 50
  const cy = 50
  const outerR = 50
  const innerR = outerR * innerRatio
  const pts = []
  for (let k = 0; k < points * 2; k++) {
    const angle = (Math.PI / points) * k - Math.PI / 2
    const r = k % 2 === 0 ? outerR : innerR
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)}% ${(cy + r * Math.sin(angle)).toFixed(1)}%`)
  }
  return `polygon(${pts.join(', ')})`
}

export const STAR5_CLIP = starPolygon(5, 0.56)
export const STAR4_CLIP = starPolygon(4, 0.46)
