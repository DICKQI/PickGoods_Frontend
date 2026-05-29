import { blobToImageBitmap } from './imageUtils'

export type Affine2DMatrix = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

const computeAffineFromTriangles = (
  src1: { x: number; y: number },
  src2: { x: number; y: number },
  src3: { x: number; y: number },
  dst1: { x: number; y: number },
  dst2: { x: number; y: number },
  dst3: { x: number; y: number },
): Affine2DMatrix => {
  const x1 = src1.x
  const y1 = src1.y
  const x2 = src2.x
  const y2 = src2.y
  const x3 = src3.x
  const y3 = src3.y

  const X1 = dst1.x
  const Y1 = dst1.y
  const X2 = dst2.x
  const Y2 = dst2.y
  const X3 = dst3.x
  const Y3 = dst3.y

  const den = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)
  if (!Number.isFinite(den) || Math.abs(den) < 1e-8) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  const a = (X1 * (y2 - y3) + X2 * (y3 - y1) + X3 * (y1 - y2)) / den
  const b = (Y1 * (y2 - y3) + Y2 * (y3 - y1) + Y3 * (y1 - y2)) / den
  const c = (X1 * (x3 - x2) + X2 * (x1 - x3) + X3 * (x2 - x1)) / den
  const d = (Y1 * (x3 - x2) + Y2 * (x1 - x3) + Y3 * (x2 - x1)) / den
  const e =
    (X1 * (x2 * y3 - x3 * y2) + X2 * (x3 * y1 - x1 * y3) + X3 * (x1 * y2 - x2 * y1)) / den
  const f =
    (Y1 * (x2 * y3 - x3 * y2) + Y2 * (x3 * y1 - x1 * y3) + Y3 * (x1 * y2 - x2 * y1)) / den

  return { a, b, c, d, e, f }
}

export const applyRotateToBlob = async (input: Blob, rotation: number): Promise<Blob> => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const diag = Math.sqrt(width * width + height * height)
  const canvasSize = Math.ceil(diag)

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.clearRect(0, 0, canvasSize, canvasSize)

  const cx = canvasSize / 2
  const cy = canvasSize / 2

  const rotRad = (rotation * Math.PI) / 180

  ctx.save()
  ctx.translate(cx, cy)
  if (rotRad !== 0) {
    ctx.rotate(rotRad)
  }

  ctx.drawImage(bitmapOrImg as any, -width / 2, -height / 2, width, height)
  ctx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('透视/旋转处理失败'))), 'image/png', 0.92)
  })

  return outBlob
}

export interface TransformState {
  rotation: number
  perspectiveHorizontal: number
  perspectiveVertical: number
}

const isTransformIdentity = (state: TransformState) => {
  return !state.rotation && !state.perspectiveHorizontal && !state.perspectiveVertical
}

export const applyPerspectiveAndRotateToBlob = async (
  input: Blob,
  transformState: TransformState,
): Promise<Blob> => {
  const hVal = transformState.perspectiveHorizontal ?? 0
  const vVal = transformState.perspectiveVertical ?? 0
  const rotDeg = transformState.rotation ?? 0

  if (isTransformIdentity(transformState)) {
    return input
  }

  if (!hVal && !vVal) {
    return await applyRotateToBlob(input, rotDeg)
  }

  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const diag = Math.sqrt(width * width + height * height)
  const canvasSize = Math.ceil(diag)

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const srcCx = width / 2
  const srcCy = height / 2
  const dstCx = canvasSize / 2
  const dstCy = canvasSize / 2

  const focal = Math.max(width, height) * 1.25
  const maxAngleRad = (Math.PI * 45) / 180
  const angleY = (hVal / 100) * maxAngleRad
  const angleX = (vVal / 100) * maxAngleRad

  const cosY = Math.cos(angleY)
  const sinY = Math.sin(angleY)
  const cosX = Math.cos(angleX)
  const sinX = Math.sin(angleX)

  const projectPoint = (x: number, y: number) => {
    const X = x - srcCx
    const Y = y - srcCy
    const Z = 0

    const X1 = X * cosY - Z * sinY
    const Z1 = X * sinY + Z * cosY

    const Y2 = Y * cosX + Z1 * sinX
    const Z2 = -Y * sinX + Z1 * cosX

    const denom = focal + Z2
    const safeDenom = Math.abs(denom) < 1e-4 ? (denom >= 0 ? 1e-4 : -1e-4) : denom
    const scale = focal / safeDenom

    return {
      x: dstCx + X1 * scale,
      y: dstCy + Y2 * scale,
    }
  }

  const stripCount = 64
  const stripW = width / stripCount

  for (let i = 0; i < stripCount; i++) {
    const x0 = i * stripW
    const x1 = (i + 1) * stripW
    const sw = x1 - x0
    if (sw <= 0) continue

    const p00 = projectPoint(x0, 0)
    const p10 = projectPoint(x1, 0)
    const p01 = projectPoint(x0, height)
    const p11 = projectPoint(x1, height)

    {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p10.x, p10.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.closePath()
      ctx.clip()

      const m = computeAffineFromTriangles(
        { x: x0, y: 0 },
        { x: x1, y: 0 },
        { x: x1, y: height },
        { x: p00.x, y: p00.y },
        { x: p10.x, y: p10.y },
        { x: p11.x, y: p11.y },
      )

      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
      ctx.drawImage(bitmapOrImg as any, x0, 0, sw, height, x0, 0, sw, height)
      ctx.restore()
    }

    {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.lineTo(p01.x, p01.y)
      ctx.closePath()
      ctx.clip()

      const m = computeAffineFromTriangles(
        { x: x0, y: 0 },
        { x: x1, y: height },
        { x: x0, y: height },
        { x: p00.x, y: p00.y },
        { x: p11.x, y: p11.y },
        { x: p01.x, y: p01.y },
      )

      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
      ctx.drawImage(bitmapOrImg as any, x0, 0, sw, height, x0, 0, sw, height)
      ctx.restore()
    }
  }

  if (!rotDeg) {
    const outBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('导出透视图片失败'))),
        'image/png',
        0.92,
      )
    })
    return outBlob
  }

  const rotDiag = Math.sqrt(canvasSize * canvasSize + canvasSize * canvasSize)
  const finalSize = Math.ceil(rotDiag)
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = finalSize
  finalCanvas.height = finalSize
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) throw new Error('Canvas 不可用')

  finalCtx.clearRect(0, 0, finalSize, finalSize)
  finalCtx.imageSmoothingEnabled = true
  finalCtx.imageSmoothingQuality = 'high'

  const cx = finalSize / 2
  const cy = finalSize / 2
  const rotRad = (rotDeg * Math.PI) / 180

  finalCtx.save()
  finalCtx.translate(cx, cy)
  finalCtx.rotate(rotRad)
  finalCtx.drawImage(canvas, -canvasSize / 2, -canvasSize / 2)
  finalCtx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('导出透视/旋转图片失败'))),
      'image/png',
      0.92,
    )
  })

  return outBlob
}
