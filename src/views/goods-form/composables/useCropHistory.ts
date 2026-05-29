import { ref, computed, type Ref } from 'vue'
import { nextTick } from 'vue'
import {
  areCropSnapshotsEqual,
  cloneCropSnapshot,
  moveCropHistoryBackward,
  moveCropHistoryForward,
  pushCropHistorySnapshot,
  type CropEditSnapshot,
  type CropNumericState,
} from '@/views/goods-form/cropHistory'

export interface CropHistoryContext {
  cropDialogVisible: Ref<boolean>
  selectedAspectRatio: Ref<string>
  filterState: Ref<any>
  enableRoundedRect: Ref<boolean>
  roundedRadius: Ref<number>
  enableMargin: Ref<boolean>
  marginPercent: Ref<number>
  getCropperNumericState: (method: 'getData' | 'getCropBoxData' | 'getCanvasData') => CropNumericState | null
  applyCropperStateFromSnapshot: (snapshot: CropEditSnapshot) => boolean
}

export function useCropHistory(ctx: CropHistoryContext) {
  const cropHistoryPast = ref<CropEditSnapshot[]>([])
  const cropHistoryFuture = ref<CropEditSnapshot[]>([])
  const suppressCropHistory = ref(false)

  let cropHistoryTimer: number | undefined
  let pendingCropSnapshotApply: CropEditSnapshot | null = null
  let cropHistoryReadyTimer: number | undefined

  const canUndoCropEdit = computed(() => cropHistoryPast.value.length > 1)
  const canRedoCropEdit = computed(() => cropHistoryFuture.value.length > 0)

  const clearCropHistoryTimer = () => {
    if (cropHistoryTimer) {
      window.clearTimeout(cropHistoryTimer)
      cropHistoryTimer = undefined
    }
  }

  const clearCropHistoryReadyTimer = () => {
    if (cropHistoryReadyTimer) {
      window.clearTimeout(cropHistoryReadyTimer)
      cropHistoryReadyTimer = undefined
    }
  }

  const resetCropHistorySession = () => {
    clearCropHistoryTimer()
    clearCropHistoryReadyTimer()
    cropHistoryPast.value = []
    cropHistoryFuture.value = []
    suppressCropHistory.value = false
    pendingCropSnapshotApply = null
  }

  const cloneCropNumericState = (value: CropNumericState | null | undefined): CropNumericState | null => {
    if (!value) return null
    return { ...value }
  }

  const createCropEditSnapshot = (): CropEditSnapshot | null => {
    return {
      selectedAspectRatio: ctx.selectedAspectRatio.value,
      filterState: (() => {
        const src = ctx.filterState.value
        const next: any = {
          brightness: src.brightness,
          contrast: src.contrast,
          saturation: src.saturation,
          hslAdjustments: (() => {
            const def: any = {}
            const keys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple']
            for (const k of keys) {
              const entry = (src.hslAdjustments || {})[k] || { h: 0, s: 0, l: 0 }
              def[k] = { h: entry.h ?? 0, s: entry.s ?? 0, l: entry.l ?? 0 }
            }
            return def
          })(),
          rotation: src.rotation ?? 0,
          perspectiveHorizontal: src.perspectiveHorizontal ?? 0,
          perspectiveVertical: src.perspectiveVertical ?? 0,
        }
        return next
      })(),
      enableRoundedRect: ctx.enableRoundedRect.value,
      roundedRadius: ctx.roundedRadius.value,
      enableMargin: ctx.enableMargin.value,
      marginPercent: ctx.marginPercent.value,
      cropData: cloneCropNumericState(ctx.getCropperNumericState('getData')),
      cropBoxData: cloneCropNumericState(ctx.getCropperNumericState('getCropBoxData')),
      canvasData: cloneCropNumericState(ctx.getCropperNumericState('getCanvasData')),
    }
  }

  const commitCropHistorySnapshot = () => {
    if (!ctx.cropDialogVisible.value || suppressCropHistory.value) return

    const snapshot = createCropEditSnapshot()
    if (!snapshot) return

    const nextHistory = pushCropHistorySnapshot(
      {
        past: cropHistoryPast.value,
        future: cropHistoryFuture.value,
      },
      snapshot,
    )

    cropHistoryPast.value = nextHistory.past
    cropHistoryFuture.value = nextHistory.future
  }

  const scheduleCropHistorySnapshot = (delay = 180) => {
    if (!ctx.cropDialogVisible.value || suppressCropHistory.value) return
    clearCropHistoryTimer()
    cropHistoryTimer = window.setTimeout(() => {
      cropHistoryTimer = undefined
      commitCropHistorySnapshot()
    }, delay)
  }

  const finishCropSnapshotRestore = () => {
    clearCropHistoryTimer()
    clearCropHistoryReadyTimer()
    pendingCropSnapshotApply = null
    suppressCropHistory.value = false
  }

  const restoreCropEditSnapshot = async (snapshot: CropEditSnapshot) => {
    clearCropHistoryTimer()
    clearCropHistoryReadyTimer()
    suppressCropHistory.value = true
    pendingCropSnapshotApply = cloneCropSnapshot(snapshot)

    ctx.selectedAspectRatio.value = snapshot.selectedAspectRatio
    ctx.filterState.value = (() => {
      const src: any = snapshot.filterState as any
      const next: any = {
        brightness: src.brightness,
        contrast: src.contrast,
        saturation: src.saturation,
        hslAdjustments: (() => {
          const def: any = {}
          const keys = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple']
          for (const k of keys) {
            def[k] = { h: 0, s: 0, l: 0 }
          }
          return def
        })(),
        rotation: src.rotation ?? 0,
        perspectiveHorizontal: src.perspectiveHorizontal ?? 0,
        perspectiveVertical: src.perspectiveVertical ?? 0,
      }
      if (src.hslAdjustments) {
        for (const key of Object.keys(src.hslAdjustments)) {
          const entry = src.hslAdjustments[key] || { h: 0, s: 0, l: 0 }
          next.hslAdjustments[key] = {
            h: entry.h ?? 0,
            s: entry.s ?? 0,
            l: entry.l ?? 0,
          }
        }
      }
      return next
    })()
    ctx.enableRoundedRect.value = snapshot.enableRoundedRect
    ctx.roundedRadius.value = snapshot.roundedRadius
    ctx.enableMargin.value = snapshot.enableMargin
    ctx.marginPercent.value = snapshot.marginPercent

    await nextTick()

    if (pendingCropSnapshotApply && ctx.applyCropperStateFromSnapshot(pendingCropSnapshotApply)) {
      finishCropSnapshotRestore()
    }
  }

  const handleCropUndo = async () => {
    if (!canUndoCropEdit.value) return

    const nextHistory = moveCropHistoryBackward({
      past: cropHistoryPast.value,
      future: cropHistoryFuture.value,
    })

    cropHistoryPast.value = nextHistory.past
    cropHistoryFuture.value = nextHistory.future

    if (nextHistory.current) {
      await restoreCropEditSnapshot(nextHistory.current)
    }
  }

  const handleCropRedo = async () => {
    if (!canRedoCropEdit.value) return

    const nextHistory = moveCropHistoryForward({
      past: cropHistoryPast.value,
      future: cropHistoryFuture.value,
    })

    cropHistoryPast.value = nextHistory.past
    cropHistoryFuture.value = nextHistory.future

    if (nextHistory.current) {
      await restoreCropEditSnapshot(nextHistory.current)
    }
  }

  const handleCropperReady = () => {
    clearCropHistoryReadyTimer()

    const run = async () => {
      await nextTick()
      if (!ctx.cropDialogVisible.value) return

      if (pendingCropSnapshotApply) {
        if (ctx.applyCropperStateFromSnapshot(pendingCropSnapshotApply)) {
          finishCropSnapshotRestore()
        }
        return
      }

      if (!cropHistoryPast.value.length) {
        commitCropHistorySnapshot()
      } else {
        scheduleCropHistorySnapshot(120)
      }
    }

    cropHistoryReadyTimer = window.setTimeout(() => {
      cropHistoryReadyTimer = undefined
      void run()
    }, 30)
  }

  return {
    cropHistoryPast,
    cropHistoryFuture,
    canUndoCropEdit,
    canRedoCropEdit,
    clearCropHistoryTimer,
    clearCropHistoryReadyTimer,
    resetCropHistorySession,
    commitCropHistorySnapshot,
    scheduleCropHistorySnapshot,
    handleCropUndo,
    handleCropRedo,
    handleCropperReady,
  }
}
