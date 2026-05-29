import { ref } from 'vue'

export function useLivePreview() {
  const livePreviewUrl = ref<string>('')
  const livePreviewLoading = ref(false)
  let livePreviewTimer: number | undefined

  const clearUrl = () => {
    if (livePreviewUrl.value && livePreviewUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(livePreviewUrl.value)
    }
    livePreviewUrl.value = ''
  }

  const scheduleRefresh = (refreshFn: () => void, delay = 280) => {
    if (livePreviewTimer) {
      window.clearTimeout(livePreviewTimer)
    }
    livePreviewTimer = window.setTimeout(() => {
      refreshFn()
    }, delay)
  }

  const cancelRefresh = () => {
    if (livePreviewTimer) {
      window.clearTimeout(livePreviewTimer)
      livePreviewTimer = undefined
    }
  }

  return {
    livePreviewUrl,
    livePreviewLoading,
    clearUrl,
    scheduleRefresh,
    cancelRefresh,
  }
}
