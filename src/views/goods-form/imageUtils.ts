import type { HslAdjustments } from './cropHistory'
import { createDefaultHslAdjustments } from './cropHistory'

// ── HSL color utilities ──

export const clamp01 = (v: number) => {
  if (Number.isNaN(v)) return 0
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

export const normalizeHue = (h: number) => {
  if (!Number.isFinite(h)) return 0
  let x = h % 360
  if (x < 0) x += 360
  return x
}

export const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: h * 360,
    s,
    l,
  }
}

export const hslToRgb = (h: number, s: number, l: number) => {
  h = normalizeHue(h) / 360
  s = clamp01(s)
  l = clamp01(l)

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)

  return {
    r: Math.round(clamp01(r) * 255),
    g: Math.round(clamp01(g) * 255),
    b: Math.round(clamp01(b) * 255),
  }
}

export const classifyHueToColorName = (h: number) => {
  const hue = normalizeHue(h)
  if (hue >= 345 || hue < 15) return 'red'
  if (hue < 45) return 'orange'
  if (hue < 75) return 'yellow'
  if (hue < 150) return 'green'
  if (hue < 210) return 'cyan'
  if (hue < 270) return 'blue'
  return 'purple'
}

// ── Filter state ──

export interface CropFilterStateInput {
  brightness: number
  contrast: number
  saturation: number
  hslAdjustments: HslAdjustments
  rotation: number
  perspectiveHorizontal: number
  perspectiveVertical: number
}

export const createDefaultFilterState = () => ({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hslAdjustments: createDefaultHslAdjustments(),
  rotation: 0,
  perspectiveHorizontal: 0,
  perspectiveVertical: 0,
})

export const isAllHslAdjustmentsZero = (hslAdjustments: HslAdjustments) => {
  if (!hslAdjustments) return true
  for (const key of Object.keys(hslAdjustments) as (keyof HslAdjustments)[]) {
    const entry = hslAdjustments[key] || { h: 0, s: 0, l: 0 }
    if ((entry.h ?? 0) !== 0 || (entry.s ?? 0) !== 0 || (entry.l ?? 0) !== 0) {
      return false
    }
  }
  return true
}

export const isFilterStateDefault = (state: CropFilterStateInput) => {
  return (
    state.brightness === 100 &&
    state.contrast === 100 &&
    state.saturation === 100 &&
    (state.rotation ?? 0) === 0 &&
    (state.perspectiveHorizontal ?? 0) === 0 &&
    (state.perspectiveVertical ?? 0) === 0 &&
    isAllHslAdjustmentsZero(state.hslAdjustments)
  )
}

export const isTransformStateDefault = (state: CropFilterStateInput) => {
  return (
    (state.rotation ?? 0) === 0 &&
    (state.perspectiveHorizontal ?? 0) === 0 &&
    (state.perspectiveVertical ?? 0) === 0
  )
}

// ── Pixel-level HSL adjustment ──

export const applyHslPerColorToImageData = (
  imageData: ImageData,
  hslAdjustments: HslAdjustments,
): ImageData => {
  const { data } = imageData
  if (!hslAdjustments || isAllHslAdjustmentsZero(hslAdjustments)) {
    return imageData
  }

  const length = data.length
  for (let i = 0; i < length; i += 4) {
    const alpha = data[i + 3]
    if (alpha === 0) continue

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const hsl = rgbToHsl(r || 0, g || 0, b || 0)
    const colorName = classifyHueToColorName(hsl.h)
    const adjust = hslAdjustments[colorName] || { h: 0, s: 0, l: 0 }

    if (!adjust || (!adjust.h && !adjust.s && !adjust.l)) {
      continue
    }

    const nextH = normalizeHue(hsl.h + (adjust.h ?? 0))
    let nextS = hsl.s * (1 + (adjust.s ?? 0) / 100)
    let nextL = hsl.l * (1 + (adjust.l ?? 0) / 100)

    nextS = clamp01(nextS)
    nextL = clamp01(nextL)

    const rgb = hslToRgb(nextH, nextS, nextL)
    data[i] = rgb.r
    data[i + 1] = rgb.g
    data[i + 2] = rgb.b
  }

  return imageData
}

// ── Image I/O ──

export const blobToImageBitmap = async (blob: Blob): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(blob)
  }
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('图片解码失败'))
      el.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

// ── Filters pipeline ──

export const applyFiltersToImage = async (
  file: File,
  filterState: CropFilterStateInput,
): Promise<File> => {
  if (isFilterStateDefault(filterState)) {
    return file
  }

  const bitmapOrImg = await blobToImageBitmap(file)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.filter = `brightness(${filterState.brightness}%) contrast(${filterState.contrast}%) saturate(${filterState.saturation}%)`
  ctx.drawImage(bitmapOrImg as any, 0, 0, width, height)

  try {
    const imageData = ctx.getImageData(0, 0, width, height)
    const adjusted = applyHslPerColorToImageData(imageData, filterState.hslAdjustments)
    ctx.putImageData(adjusted, 0, 0)
  } catch {
    // ignore HSL errors
  }

  ctx.filter = 'none'

  const mime = file.type || 'image/png'
  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('应用滤镜失败'))), mime, 0.92)
  })

  return new File([outBlob], file.name, { type: mime })
}

// ── Cropper CSS style helper ──

export const computeCropperStyle = (
  filterState: CropFilterStateInput,
) => {
  const baseBrightness = filterState.brightness
  const baseContrast = filterState.contrast
  const baseSaturation = filterState.saturation
  const baseRotation = filterState.rotation ?? 0
  const perspectiveHorizontal = filterState.perspectiveHorizontal ?? 0
  const perspectiveVertical = filterState.perspectiveVertical ?? 0

  const hslAdj = filterState.hslAdjustments
  let sumH = 0
  let sumS = 0
  let sumL = 0
  let count = 0

  if (hslAdj) {
    for (const key of Object.keys(hslAdj) as (keyof HslAdjustments)[]) {
      const entry = hslAdj[key]
      if (!entry) continue
      if ((entry.h ?? 0) !== 0 || (entry.s ?? 0) !== 0 || (entry.l ?? 0) !== 0) {
        sumH += entry.h ?? 0
        sumS += entry.s ?? 0
        sumL += entry.l ?? 0
        count++
      }
    }
  }

  const avgH = count ? sumH / count : 0
  const avgS = count ? sumS / count : 0
  const avgL = count ? sumL / count : 0

  const cssBrightness = Math.max(0, baseBrightness * (1 + avgL / 100))
  const cssSaturation = Math.max(0, baseSaturation * (1 + avgS / 100))
  const cssHueRotate = avgH

  const transformParts: string[] = []
  const rotateYDeg = (perspectiveHorizontal / 100) * 20
  const rotateXDeg = (perspectiveVertical / 100) * -20
  if (perspectiveHorizontal !== 0) {
    transformParts.push(`rotateY(${rotateYDeg}deg)`)
  }
  if (perspectiveVertical !== 0) {
    transformParts.push(`rotateX(${rotateXDeg}deg)`)
  }
  if (baseRotation) {
    transformParts.push(`rotate(${baseRotation}deg)`)
  }

  return {
    filter: `brightness(${cssBrightness}%) contrast(${baseContrast}%) saturate(${cssSaturation}%) hue-rotate(${cssHueRotate}deg)`,
    transform: transformParts.length ? `perspective(800px) ${transformParts.join(' ')}` : undefined,
  }
}
