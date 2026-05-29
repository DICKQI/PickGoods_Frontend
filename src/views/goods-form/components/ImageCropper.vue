<template>
  <el-dialog
    v-model="dialogVisible"
    :title="'编辑图片'"
    :width="isMobile ? '95%' : '1600px'"
    :close-on-click-modal="false"
    class="crop-dialog"
    @close="handleCropDialogClose"
  >
    <div v-if="isMobile" class="crop-container">
      <div class="crop-glass-panel">
        <div class="crop-header-row">
          <div class="crop-header-copy">
            <div class="crop-title">主图编辑</div>
            <div class="crop-subtitle">调整比例与滤镜，让画面更契合主题</div>
          </div>
          <div class="crop-history-actions">
            <el-button size="small" :disabled="!canUndoCropEdit" @click="handleCropUndo">撤回</el-button>
            <el-button size="small" :disabled="!canRedoCropEdit" @click="handleCropRedo">恢复</el-button>
          </div>
        </div>

        <div class="aspect-ratio-selector">
          <div class="ratio-label">选择比例</div>
          <div class="ratio-segmented">
            <div class="ratio-segmented-track">
              <div
                class="ratio-segmented-thumb"
                :style="{ '--active-index': aspectRatios.findIndex(r => r.value === selectedAspectRatio) }"
              ></div>
              <button
                v-for="ratio in aspectRatios"
                :key="ratio.value"
                type="button"
                class="ratio-segmented-item"
                :class="{ 'is-active': selectedAspectRatio === ratio.value }"
                @click="selectedAspectRatio = ratio.value"
              >
                <span class="ratio-icon" :class="`ratio-icon--${ratio.value}`"></span>
                <span class="ratio-text">{{ ratio.label }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="image-filters">
          <div class="filters-header-row">
            <span class="filters-title">图像微调</span>
            <el-button class="filter-reset-btn" text circle :icon="RefreshLeft" @click="resetFilters" />
          </div>
          <div class="filter-item">
            <span class="filter-label">亮度</span>
            <el-slider v-model="filterState.brightness" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
            <span class="filter-value">{{ filterState.brightness }}%</span>
          </div>
          <div class="filter-item">
            <span class="filter-label">对比度</span>
            <el-slider v-model="filterState.contrast" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
            <span class="filter-value">{{ filterState.contrast }}%</span>
          </div>
          <div class="filter-item">
            <span class="filter-label">饱和度</span>
            <el-slider v-model="filterState.saturation" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
            <span class="filter-value">{{ filterState.saturation }}%</span>
          </div>
          <div class="filter-item">
            <span class="filter-label">旋转</span>
            <el-slider v-model="filterState.rotation" :min="-180" :max="180" :format-tooltip="(val: number) => `${val}°`" />
            <span class="filter-value">{{ filterState.rotation }}°</span>
          </div>
          <div class="perspective-panel">
            <div class="perspective-title">透视矫正</div>
            <div class="filter-item" style="margin-bottom: 10px;">
              <span class="filter-label">水平透视</span>
              <el-slider v-model="filterState.perspectiveHorizontal" :min="-100" :max="100" :format-tooltip="(val: number) => val + '%'" />
              <span class="filter-value">{{ filterState.perspectiveHorizontal > 0 ? '+' : '' }}{{ filterState.perspectiveHorizontal }}%</span>
            </div>
            <div class="filter-item" style="margin-bottom: 0;">
              <span class="filter-label">垂直透视</span>
              <el-slider v-model="filterState.perspectiveVertical" :min="-100" :max="100" :format-tooltip="(val: number) => val + '%'" />
              <span class="filter-value">{{ filterState.perspectiveVertical > 0 ? '+' : '' }}{{ filterState.perspectiveVertical }}%</span>
            </div>
          </div>
          <div class="hsl-panel">
            <div class="hsl-header-row">
              <span class="hsl-title">HSL 调节</span>
            </div>
            <div class="hsl-color-tabs">
              <button
                v-for="tab in hslColorTabs" :key="tab.key" type="button"
                :class="['hsl-color-tab', `hsl-color-tab--${tab.key}`, { 'is-active': activeHslColor === tab.key }]"
                @click="activeHslColor = tab.key"
              >{{ tab.label }}</button>
              <el-button class="hsl-color-reset-btn" text size="small" @click="resetCurrentHslColor">重置当前色</el-button>
            </div>
            <div class="hsl-sliders">
              <div class="filter-item">
                <span class="filter-label">色相 (°)</span>
                <el-slider v-model="filterState.hslAdjustments[activeHslColor].h" :min="-180" :max="180" :format-tooltip="(val: number) => val + '°'" />
                <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].h }}°</span>
              </div>
              <div class="filter-item">
                <span class="filter-label">饱和度偏移</span>
                <el-slider v-model="filterState.hslAdjustments[activeHslColor].s" :min="-100" :max="100" :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'" />
                <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].s > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].s }}%</span>
              </div>
              <div class="filter-item">
                <span class="filter-label">亮度偏移</span>
                <el-slider v-model="filterState.hslAdjustments[activeHslColor].l" :min="-100" :max="100" :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'" />
                <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].l > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].l }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="showRoundedControls" class="rounded-rect-settings">
          <div class="rounded-header-row">
            <span class="rounded-title">圆角矩形</span>
            <el-switch v-model="enableRoundedRect" size="small" />
          </div>
          <div class="rounded-radius-row" :class="{ 'is-disabled': !enableRoundedRect }">
            <span class="rounded-label">圆角大小</span>
            <el-slider v-model="roundedRadius" :min="0" :max="50" :disabled="!enableRoundedRect" :format-tooltip="(val: number) => val + '%'" />
            <span class="rounded-value">{{ roundedRadius }}%</span>
          </div>
        </div>

        <div class="margin-settings">
          <div class="rounded-header-row">
            <span class="rounded-title">边距</span>
            <el-switch v-model="enableMargin" size="small" />
          </div>
          <div class="rounded-radius-row" :class="{ 'is-disabled': !enableMargin }">
            <span class="rounded-label">边距大小</span>
            <el-slider v-model="marginPercent" :min="0" :max="30" :disabled="!enableMargin" :format-tooltip="(val: number) => val + '%'" />
            <span class="rounded-value">{{ marginPercent }}%</span>
          </div>
        </div>

        <div
          class="cropper-wrapper"
          :class="{
            'circle-crop': selectedAspectRatio === 'circle' || selectedAspectRatio.endsWith('-ellipse'),
            'rounded-rect-preview': showRoundedControls && enableRoundedRect
          }"
          :style="cropperWrapperStyle"
        >
          <vue-picture-cropper
            v-if="cropImageSrc"
            ref="pictureCropperRef"
            :key="`cropper-${selectedAspectRatio}`"
            :box-style="{ width: '100%', height: '300px', backgroundColor: '#f8f8f8', margin: '0 auto' }"
            :img="cropImageSrc"
            :options="cropperOptions"
            :style="cropperStyle"
          />
        </div>

        <div class="live-preview">
          <div class="live-preview-header">
            <span class="live-preview-title">输出预览</span>
            <span class="live-preview-hint">低清预览</span>
          </div>
          <div class="live-preview-card" :class="{ 'is-loading': livePreviewLoading }">
            <img v-if="livePreviewUrl" :src="livePreviewUrl" class="live-preview-img" />
            <div v-else class="live-preview-placeholder">
              {{ livePreviewLoading ? '预览生成中...' : '调整裁切框或参数以生成预览' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="crop-container crop-layout">
      <div class="crop-glass-panel">
        <div class="crop-header-row">
          <div class="crop-header-copy">
            <div class="crop-title">主图编辑</div>
            <div class="crop-subtitle">调整比例与滤镜，让画面更契合主题</div>
          </div>
          <div class="crop-history-actions">
            <el-button size="small" :disabled="!canUndoCropEdit" @click="handleCropUndo">撤回</el-button>
            <el-button size="small" :disabled="!canRedoCropEdit" @click="handleCropRedo">恢复</el-button>
          </div>
        </div>

        <div class="crop-layout-inner">
          <div class="crop-left-panel">
            <div class="aspect-ratio-selector">
              <div class="ratio-label">选择比例</div>
              <div class="ratio-segmented">
                <div class="ratio-segmented-track">
                  <div
                    class="ratio-segmented-thumb"
                    :style="{ '--active-index': aspectRatios.findIndex(r => r.value === selectedAspectRatio) }"
                  ></div>
                  <button
                    v-for="ratio in aspectRatios" :key="ratio.value" type="button"
                    class="ratio-segmented-item"
                    :class="{ 'is-active': selectedAspectRatio === ratio.value }"
                    @click="selectedAspectRatio = ratio.value"
                  >
                    <span class="ratio-icon" :class="`ratio-icon--${ratio.value}`"></span>
                    <span class="ratio-text">{{ ratio.label }}</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="image-filters">
              <div class="filters-header-row">
                <span class="filters-title">图像微调</span>
                <el-button class="filter-reset-btn" text circle :icon="RefreshLeft" @click="resetFilters" />
              </div>
              <div class="filter-item">
                <span class="filter-label">亮度</span>
                <el-slider v-model="filterState.brightness" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
                <span class="filter-value">{{ filterState.brightness }}%</span>
              </div>
              <div class="filter-item">
                <span class="filter-label">对比度</span>
                <el-slider v-model="filterState.contrast" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
                <span class="filter-value">{{ filterState.contrast }}%</span>
              </div>
              <div class="filter-item">
                <span class="filter-label">饱和度</span>
                <el-slider v-model="filterState.saturation" :min="0" :max="200" :format-tooltip="(val: number) => val + '%'" />
                <span class="filter-value">{{ filterState.saturation }}%</span>
              </div>
              <div class="filter-item">
                <span class="filter-label">旋转</span>
                <el-slider v-model="filterState.rotation" :min="-180" :max="180" :format-tooltip="(val: number) => `${val}°`" />
                <span class="filter-value">{{ filterState.rotation }}°</span>
              </div>
              <div class="perspective-panel">
                <div class="perspective-title">透视矫正</div>
                <div class="filter-item" style="margin-bottom: 10px;">
                  <span class="filter-label">水平透视</span>
                  <el-slider v-model="filterState.perspectiveHorizontal" :min="-100" :max="100" :format-tooltip="(val: number) => val + '%'" />
                  <span class="filter-value">{{ filterState.perspectiveHorizontal > 0 ? '+' : '' }}{{ filterState.perspectiveHorizontal }}%</span>
                </div>
                <div class="filter-item" style="margin-bottom: 0;">
                  <span class="filter-label">垂直透视</span>
                  <el-slider v-model="filterState.perspectiveVertical" :min="-100" :max="100" :format-tooltip="(val: number) => val + '%'" />
                  <span class="filter-value">{{ filterState.perspectiveVertical > 0 ? '+' : '' }}{{ filterState.perspectiveVertical }}%</span>
                </div>
              </div>
              <div class="hsl-panel">
                <div class="hsl-header-row"><span class="hsl-title">HSL 调节</span></div>
                <div class="hsl-color-tabs">
                  <button v-for="tab in hslColorTabs" :key="tab.key" type="button"
                    :class="['hsl-color-tab', `hsl-color-tab--${tab.key}`, { 'is-active': activeHslColor === tab.key }]"
                    @click="activeHslColor = tab.key">{{ tab.label }}</button>
                  <el-button class="hsl-color-reset-btn" text size="small" @click="resetCurrentHslColor">重置当前色</el-button>
                </div>
                <div class="hsl-sliders">
                  <div class="filter-item">
                    <span class="filter-label">色相 (°)</span>
                    <el-slider v-model="filterState.hslAdjustments[activeHslColor].h" :min="-180" :max="180" :format-tooltip="(val: number) => val + '°'" />
                    <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].h }}°</span>
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">饱和度偏移</span>
                    <el-slider v-model="filterState.hslAdjustments[activeHslColor].s" :min="-100" :max="100" />
                    <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].s > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].s }}%</span>
                  </div>
                  <div class="filter-item">
                    <span class="filter-label">亮度偏移</span>
                    <el-slider v-model="filterState.hslAdjustments[activeHslColor].l" :min="-100" :max="100" />
                    <span class="filter-value">{{ filterState.hslAdjustments[activeHslColor].l > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].l }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showRoundedControls" class="rounded-rect-settings">
              <div class="rounded-header-row">
                <span class="rounded-title">圆角矩形</span>
                <el-switch v-model="enableRoundedRect" size="small" />
              </div>
              <div class="rounded-radius-row" :class="{ 'is-disabled': !enableRoundedRect }">
                <span class="rounded-label">圆角大小</span>
                <el-slider v-model="roundedRadius" :min="0" :max="50" :disabled="!enableRoundedRect" />
                <span class="rounded-value">{{ roundedRadius }}%</span>
              </div>
            </div>

            <div class="margin-settings">
              <div class="rounded-header-row">
                <span class="rounded-title">边距</span>
                <el-switch v-model="enableMargin" size="small" />
              </div>
              <div class="rounded-radius-row" :class="{ 'is-disabled': !enableMargin }">
                <span class="rounded-label">边距大小</span>
                <el-slider v-model="marginPercent" :min="0" :max="30" :disabled="!enableMargin" />
                <span class="rounded-value">{{ marginPercent }}%</span>
              </div>
            </div>
          </div>

          <div class="crop-right-panel">
            <div class="crop-main-view">
              <div
                class="cropper-wrapper"
                :class="{
                  'circle-crop': selectedAspectRatio === 'circle' || selectedAspectRatio.endsWith('-ellipse'),
                  'rounded-rect-preview': showRoundedControls && enableRoundedRect
                }"
                :style="cropperWrapperStyle"
              >
                <vue-picture-cropper
                  v-if="cropImageSrc"
                  ref="pictureCropperRef"
                  :key="`cropper-${selectedAspectRatio}`"
                  :box-style="{ width: '100%', height: '100%', backgroundColor: '#f8f8f8', margin: '0 auto' }"
                  :img="cropImageSrc"
                  :options="cropperOptions"
                  :style="cropperStyle"
                />
              </div>
            </div>

            <div class="crop-preview-view">
              <div class="live-preview">
                <div class="live-preview-header">
                  <span class="live-preview-title">输出预览</span>
                  <span class="live-preview-hint">低清预览</span>
                </div>
                <div class="live-preview-card" :class="{ 'is-loading': livePreviewLoading }">
                  <img v-if="livePreviewUrl" :src="livePreviewUrl" class="live-preview-img" />
                  <div v-else class="live-preview-placeholder">
                    {{ livePreviewLoading ? '预览生成中...' : '调整裁切框或参数以生成预览' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCropCancel">取消</el-button>
        <el-button type="primary" @click="handleCropConfirm" :loading="cropping">确认</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { RefreshLeft } from '@element-plus/icons-vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import type { CropEditSnapshot, CropNumericState } from '@/views/goods-form/cropHistory'
import { createDefaultFilterState, isFilterStateDefault, isTransformStateDefault, applyFiltersToImage, computeCropperStyle, blobToImageBitmap } from '@/views/goods-form/imageUtils'
import { applyCircleMaskToBlob, applyEllipseMaskToBlob, applyRoundedRectMaskToBlob, applyFreeCropSquareBlob, applyMarginToBlob } from '@/views/goods-form/imageMask'
import { applyPerspectiveAndRotateToBlob } from '@/views/goods-form/imageTransform'
import { useCropHistory } from '@/views/goods-form/composables/useCropHistory'
import { useLivePreview } from '@/views/goods-form/composables/useLivePreview'

const props = defineProps<{
  visible: boolean
  imageSrc: string
  imageFile: File
}>()

const emit = defineEmits<{
  confirm: [file: File, previewUrl: string]
  cancel: []
  'update:visible': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v),
})

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value < 768)

const syncWindowWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('resize', syncWindowWidth)
}

const cropImageSrc = computed(() => props.imageSrc)
const cropImageFile = computed(() => props.imageFile)

const pictureCropperRef = ref<any>(null)
const cropping = ref(false)

const aspectRatios = [
  { label: '自由', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '圆形', value: 'circle' },
  { label: '47:65 (椭圆)', value: '47:65-ellipse' },
  { label: '63:93 (椭圆)', value: '63:93-ellipse' },
]

const selectedAspectRatio = ref('free')
const enableRoundedRect = ref(false)
const roundedRadius = ref(20)
const showRoundedControls = computed(() => selectedAspectRatio.value === 'free' || selectedAspectRatio.value === '1:1')
const enableMargin = ref(false)
const marginPercent = ref(8)

const filterState = ref(createDefaultFilterState())
const resetFilters = () => { filterState.value = createDefaultFilterState() }

const hslColorTabs = [
  { key: 'red', label: '红' }, { key: 'orange', label: '橙' }, { key: 'yellow', label: '黄' },
  { key: 'green', label: '绿' }, { key: 'cyan', label: '青' }, { key: 'blue', label: '蓝' },
  { key: 'purple', label: '紫' },
] as const
type HslColorKeyLocal = (typeof hslColorTabs)[number]['key']
const activeHslColor = ref<HslColorKeyLocal>('red')

const resetCurrentHslColor = () => {
  const key = activeHslColor.value
  const adj = filterState.value.hslAdjustments[key]
  if (!adj) return
  adj.h = 0; adj.s = 0; adj.l = 0
}

const getCropperInstance = (): any => {
  if (cropper && (typeof cropper.getDataURL === 'function' || typeof cropper.getBlob === 'function' || typeof cropper.getFile === 'function')) {
    return cropper
  }
  if (pictureCropperRef.value) {
    const c = pictureCropperRef.value
    if (c.$refs?.cropper) return c.$refs.cropper
    if (c.cropper) return c.cropper
    if ((c as any).setupState?.cropper) return (c as any).setupState.cropper
    if ((c as any).__cropper) return (c as any).__cropper
  }
  return null
}

const getCropperNumericState = (method: 'getData' | 'getCropBoxData' | 'getCanvasData'): CropNumericState | null => {
  const instance = getCropperInstance()
  if (!instance || typeof instance[method] !== 'function') return null
  try {
    const val = instance[method]()
    return val ? { ...val } : null
  } catch { return null }
}

const applyCropperStateFromSnapshot = (snapshot: CropEditSnapshot): boolean => {
  const instance = getCropperInstance()
  if (!instance) return false
  try {
    if (snapshot.canvasData && typeof instance.setCanvasData === 'function') {
      instance.setCanvasData({ ...snapshot.canvasData })
    }
    if (snapshot.cropData && typeof instance.setData === 'function') {
      instance.setData({ ...snapshot.cropData })
    }
    if (snapshot.cropBoxData && typeof instance.setCropBoxData === 'function') {
      instance.setCropBoxData({ ...snapshot.cropBoxData })
    }
    return true
  } catch { return false }
}

const cropHistory = useCropHistory({
  cropDialogVisible: dialogVisible,
  selectedAspectRatio,
  filterState,
  enableRoundedRect,
  roundedRadius,
  enableMargin,
  marginPercent,
  getCropperNumericState,
  applyCropperStateFromSnapshot,
})

const { canUndoCropEdit, canRedoCropEdit, handleCropUndo, handleCropRedo, handleCropperReady, resetCropHistorySession, scheduleCropHistorySnapshot } = cropHistory

const roundedRectPreviewPx = ref(0)
const updateRoundedRectPreviewRadius = () => {
  if (!showRoundedControls.value || !enableRoundedRect.value) {
    roundedRectPreviewPx.value = 0; return
  }
  const cropBox = getCropperNumericState('getCropBoxData')
  const w = cropBox?.width; const h = cropBox?.height
  if (!w || !h) return
  const p = Math.max(0, Math.min(roundedRadius.value, 50))
  const radius = (p / 100) * (Math.min(w, h) / 2)
  roundedRectPreviewPx.value = Number.isFinite(radius) ? radius : 0
}

const cropperWrapperStyle = computed(() => ({
  '--rounded-radius-px': `${roundedRectPreviewPx.value}px`,
}))

const cropperOptions = computed(() => {
  const base: any = {
    outputSize: 1, outputType: 'png', canScale: true, autoCrop: true,
    centerBox: true, high: true, cropData: {}, enlarge: 1, mode: 'contain',
    maxImgSize: 2000, limitMinSize: [100, 100], viewMode: 1,
    dragMode: 'crop', cropBoxMovable: true, cropBoxResizable: true, strict: true,
    ready: () => handleCropperReady(),
    crop: () => { updateRoundedRectPreviewRadius(); scheduleLivePreviewRefresh() },
    cropend: () => scheduleCropHistorySnapshot(120),
    zoom: () => { updateRoundedRectPreviewRadius(); scheduleLivePreviewRefresh(); scheduleCropHistorySnapshot(180) },
  }
  if (selectedAspectRatio.value === 'circle') {
    base.aspectRatio = 1; base.fixed = true; base.fixedNumber = [1, 1]
  } else if (selectedAspectRatio.value.endsWith('-ellipse')) {
    const parts = selectedAspectRatio.value.replace('-ellipse', '').split(':').map(Number)
    if (parts[0] && parts[1]) { base.aspectRatio = parts[0] / parts[1]; base.fixed = true; base.fixedNumber = parts }
  } else if (selectedAspectRatio.value !== 'free') {
    const parts = selectedAspectRatio.value.split(':').map(Number)
    if (parts[0] && parts[1]) { base.aspectRatio = parts[0] / parts[1]; base.fixed = true; base.fixedNumber = parts }
    else { base.aspectRatio = NaN; base.fixed = false }
  } else {
    base.aspectRatio = NaN; base.fixed = false
  }
  return base
})

const cropperStyle = computed(() => computeCropperStyle(filterState.value))

const livePreview = useLivePreview()
const { livePreviewUrl, livePreviewLoading } = livePreview

let livePreviewSeq = 0
const clearLivePreviewUrl = livePreview.clearUrl

const scheduleLivePreviewRefresh = () => {
  if (!dialogVisible.value) return
  livePreview.scheduleRefresh(refreshLivePreview, 280)
}

const refreshLivePreview = async () => {
  if (!dialogVisible.value) return
  const seq = ++livePreviewSeq
  livePreviewLoading.value = true

  try {
    const instance = getCropperInstance()
    if (!instance) return
    updateRoundedRectPreviewRadius()

    let baseBlob: Blob | null = null
    if (typeof instance.getBlob === 'function') {
      try { baseBlob = await instance.getBlob({ width: 768, height: 768, mimeType: 'image/png', quality: 0.92 }) } catch { baseBlob = null }
    }
    if (!baseBlob && typeof instance.getDataURL === 'function') {
      try {
        const dataURL = instance.getDataURL({ width: 768, height: 768, mimeType: 'image/png', quality: 0.92 })
        if (dataURL) { const resp = await fetch(dataURL); baseBlob = await resp.blob() }
      } catch { baseBlob = null }
    }
    if (!baseBlob) return

    let workingFile = new File([baseBlob], `preview_${Date.now()}.png`, { type: 'image/png' })

    if (!isTransformStateDefault(filterState.value)) {
      try {
        const transformedBlob = await applyPerspectiveAndRotateToBlob(workingFile, {
          rotation: filterState.value.rotation,
          perspectiveHorizontal: filterState.value.perspectiveHorizontal,
          perspectiveVertical: filterState.value.perspectiveVertical,
        })
        workingFile = new File([transformedBlob], `preview_${Date.now()}.png`, { type: 'image/png' })
      } catch { /* ignore */ }
    }

    if (selectedAspectRatio.value === 'circle') {
      const masked = await applyCircleMaskToBlob(workingFile)
      workingFile = new File([masked], `preview_${Date.now()}.png`, { type: 'image/png' })
    } else if (selectedAspectRatio.value.endsWith('-ellipse')) {
      const masked = await applyEllipseMaskToBlob(workingFile)
      workingFile = new File([masked], `preview_${Date.now()}.png`, { type: 'image/png' })
    } else if (selectedAspectRatio.value === 'free') {
      if (enableRoundedRect.value && roundedRadius.value > 0) {
        workingFile = await applyRoundedRectMaskToBlob(workingFile, roundedRadius.value)
      }
      const square = await applyFreeCropSquareBlob(workingFile)
      workingFile = new File([square], `preview_${Date.now()}.png`, { type: 'image/png' })
    } else if (selectedAspectRatio.value === '1:1') {
      if (enableRoundedRect.value && roundedRadius.value > 0) {
        workingFile = await applyRoundedRectMaskToBlob(workingFile, roundedRadius.value)
      }
    }

    if (enableMargin.value && marginPercent.value > 0) {
      const marginBlob = await applyMarginToBlob(workingFile, marginPercent.value)
      workingFile = new File([marginBlob], `preview_${Date.now()}.png`, { type: 'image/png' })
    }

    const filtered = await applyFiltersToImage(workingFile, filterState.value)

    if (seq !== livePreviewSeq) return
    const nextUrl = URL.createObjectURL(filtered)
    const prevUrl = livePreviewUrl.value
    livePreviewUrl.value = nextUrl
    if (prevUrl?.startsWith('blob:')) URL.revokeObjectURL(prevUrl)
  } catch { /* preview errors silently ignored */ }
  finally { if (seq === livePreviewSeq) livePreviewLoading.value = false }
}

watch(
  () => [selectedAspectRatio.value, enableRoundedRect.value, roundedRadius.value, enableMargin.value, marginPercent.value],
  () => { scheduleLivePreviewRefresh(); updateRoundedRectPreviewRadius(); scheduleCropHistorySnapshot() },
)
watch(filterState, () => { scheduleLivePreviewRefresh(); scheduleCropHistorySnapshot() }, { deep: true })
watch(dialogVisible, (open) => {
  if (!open) { livePreview.cancelRefresh(); clearLivePreviewUrl() }
  else { scheduleLivePreviewRefresh() }
})

const handleCropConfirm = async () => {
  if (!pictureCropperRef.value || !props.imageFile) { return }

  cropping.value = true
  try {
    const cropperInstance = getCropperInstance()
    if (!cropperInstance) { cropping.value = false; return }

    let croppedFile: File | null = null
    let previewUrl: string = ''

    if (typeof cropperInstance.getFile === 'function') {
      try {
        croppedFile = await cropperInstance.getFile({ width: 2000, height: 2000, mimeType: props.imageFile.type || 'image/png', quality: 0.9 })
        if (croppedFile) previewUrl = URL.createObjectURL(croppedFile)
      } catch { /* fall through */ }
    }

    if (!croppedFile && typeof cropperInstance.getBlob === 'function') {
      try {
        const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (props.imageFile.type || 'image/png')
        const blob = await cropperInstance.getBlob({ width: 2000, height: 2000, mimeType: mime, quality: 0.9 })
        if (blob) {
          const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
          croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
          previewUrl = URL.createObjectURL(blob)
        }
      } catch { /* fall through */ }
    }

    if (!croppedFile && typeof cropperInstance.getDataURL === 'function') {
      try {
        const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (props.imageFile.type || 'image/png')
        const dataURL = cropperInstance.getDataURL({ width: 2000, height: 2000, mimeType: mime, quality: 0.9 })
        if (dataURL) {
          const response = await fetch(dataURL)
          const blob = await response.blob()
          const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
          croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
          previewUrl = dataURL
        }
      } catch { /* fall through */ }
    }

    if (!croppedFile) {
      const nativeCropper = pictureCropperRef.value.cropper || pictureCropperRef.value.$cropper || (cropperInstance.cropper || null)
      if (nativeCropper && typeof nativeCropper.getCroppedCanvas === 'function') {
        try {
          const canvas = nativeCropper.getCroppedCanvas({ width: 2000, height: 2000, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' })
          if (canvas) {
            const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (props.imageFile.type || 'image/png')
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((b: Blob | null) => b ? resolve(b) : reject(new Error('Canvas toBlob failed')), mime, 0.9)
            })
            const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
            croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
            previewUrl = URL.createObjectURL(blob)
          }
        } catch { /* fall through */ }
      }
    }

    if (!croppedFile) { cropping.value = false; return }

    if (!isTransformStateDefault(filterState.value)) {
      try {
        const transformedBlob = await applyPerspectiveAndRotateToBlob(croppedFile, {
          rotation: filterState.value.rotation,
          perspectiveHorizontal: filterState.value.perspectiveHorizontal,
          perspectiveVertical: filterState.value.perspectiveVertical,
        })
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = new File([transformedBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        previewUrl = URL.createObjectURL(transformedBlob)
      } catch (e: any) { /* ignore */ }
    }

    if (selectedAspectRatio.value === 'circle') {
      try {
        const maskedBlob = await applyCircleMaskToBlob(croppedFile)
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = new File([maskedBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        previewUrl = URL.createObjectURL(maskedBlob)
      } catch { cropping.value = false; return }
    } else if (selectedAspectRatio.value.endsWith('-ellipse')) {
      try {
        const maskedBlob = await applyEllipseMaskToBlob(croppedFile)
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = new File([maskedBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        previewUrl = URL.createObjectURL(maskedBlob)
      } catch { cropping.value = false; return }
    } else if (selectedAspectRatio.value === 'free') {
      try {
        if (enableRoundedRect.value && roundedRadius.value > 0) {
          const roundedFile = await applyRoundedRectMaskToBlob(croppedFile, roundedRadius.value)
          if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
          croppedFile = roundedFile; previewUrl = URL.createObjectURL(roundedFile)
        }
        const squareBlob = await applyFreeCropSquareBlob(croppedFile)
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = new File([squareBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        previewUrl = URL.createObjectURL(squareBlob)
      } catch { cropping.value = false; return }
    }

    if (selectedAspectRatio.value === '1:1' && enableRoundedRect.value && roundedRadius.value > 0) {
      try {
        const roundedFile = await applyRoundedRectMaskToBlob(croppedFile, roundedRadius.value)
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = roundedFile; previewUrl = URL.createObjectURL(roundedFile)
      } catch { /* ignore */ }
    }

    if (enableMargin.value && marginPercent.value > 0) {
      try {
        const marginBlob = await applyMarginToBlob(croppedFile, marginPercent.value)
        if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
        croppedFile = new File([marginBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        previewUrl = URL.createObjectURL(marginBlob)
      } catch { /* ignore */ }
    }

    const filteredFile = await applyFiltersToImage(croppedFile, filterState.value)
    const finalPreviewUrl = URL.createObjectURL(filteredFile)

    if (previewUrl && previewUrl !== finalPreviewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    emit('confirm', filteredFile, finalPreviewUrl)
    emit('update:visible', false)
    cropping.value = false
  } catch { cropping.value = false }
}

const handleCropCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleCropDialogClose = () => {
  resetCropHistorySession()
  if (cropImageSrc.value && cropImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropImageSrc.value)
  }
  livePreview.cancelRefresh()
  clearLivePreviewUrl()
}
</script>

<style scoped>
.crop-dialog { z-index: 3000; }
.crop-container { width: 100%; padding-top: 4px; }
.crop-layout-inner { display: flex; gap: 18px; max-height: calc(100vh - 260px); }
.crop-left-panel { flex: 0 0 360px; min-width: 0; min-height: 0; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; padding-right: 8px; }
.crop-right-panel { flex: 1; min-width: 0; min-height: 0; display: flex; flex-direction: row; gap: 14px; }
.crop-main-view, .crop-preview-view { flex: 1; min-height: 0; }
.crop-main-view { border-radius: 14px; overflow: hidden; background: #f8f8f8; }
.crop-preview-view { display: flex; flex-direction: column; }
.crop-preview-view .live-preview { flex: 1; display: flex; flex-direction: column; }
.crop-preview-view .live-preview-card { flex: 1; }
.crop-preview-view .live-preview-img { width: 100%; height: 100%; object-fit: contain; }
.crop-right-panel .cropper-wrapper { height: 100%; margin: 0; }
.crop-right-panel .live-preview-card { min-height: 0; }

@media (max-width: 768px) {
  .crop-layout-inner { flex-direction: column; }
  .crop-left-panel { max-height: none; overflow: visible; }
}

.crop-glass-panel { position: relative; padding: 18px 20px 20px; border-radius: 18px; background: radial-gradient(circle at top left, rgba(255,255,255,0.32), rgba(255,255,255,0.08)); border: 1px solid rgba(255,255,255,0.22); box-shadow: 0 18px 45px rgba(15,23,42,0.22), 0 0 0 1px rgba(255,255,255,0.12); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
.crop-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
.hsl-panel { margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.06); }
.hsl-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.hsl-title { font-size: 13px; font-weight: 500; color: #606266; }
.perspective-panel { margin-top: 10px; padding-top: 8px; border-top: 1px dashed rgba(0,0,0,0.06); }
.perspective-title { font-size: 13px; font-weight: 500; color: #606266; margin-bottom: 6px; }
.hsl-color-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }
.hsl-color-tab { border: none; padding: 4px 10px; border-radius: 999px; background: #f4f4f5; font-size: 12px; color: #606266; cursor: pointer; transition: background-color 0.15s, color 0.15s, box-shadow 0.15s; }
.hsl-color-tab--red { color: #c45b5b; }
.hsl-color-tab--orange { color: #c27a3b; }
.hsl-color-tab--yellow { color: #b89b2f; }
.hsl-color-tab--green { color: #4a9b6b; }
.hsl-color-tab--cyan { color: #3a8f9c; }
.hsl-color-tab--blue { color: #4a74c4; }
.hsl-color-tab--purple { color: #7b63c4; }
.hsl-color-tab.is-active { color: #fff; box-shadow: 0 4px 10px rgba(163,150,255,0.25); }
.hsl-color-tab--red.is-active { background: linear-gradient(135deg,#d87373 0%,#c13a3a 100%); }
.hsl-color-tab--orange.is-active { background: linear-gradient(135deg,#e9a45b 0%,#cf7c2c 100%); }
.hsl-color-tab--yellow.is-active { background: linear-gradient(135deg,#ecd47a 0%,#d4b23a 100%); }
.hsl-color-tab--green.is-active { background: linear-gradient(135deg,#7bc193 0%,#45a264 100%); }
.hsl-color-tab--cyan.is-active { background: linear-gradient(135deg,#65b9c7 0%,#3c90a0 100%); }
.hsl-color-tab--blue.is-active { background: linear-gradient(135deg,#7d9ee0 0%,#496fbe 100%); }
.hsl-color-tab--purple.is-active { background: linear-gradient(135deg,#a396ff 0%,#7f63d6 100%); }
.hsl-color-reset-btn { margin-left: auto; }
.hsl-sliders { margin-top: 4px; }
.crop-header-copy { display: flex; flex-direction: column; gap: 4px; }
.crop-title { font-size: 15px; font-weight: 600; color: #303133; }
.crop-subtitle { font-size: 12px; color: #909399; }
.crop-history-actions { display: inline-flex; align-items: center; gap: 8px; }
.crop-history-actions :deep(.el-button) { border-radius: 999px; }

.aspect-ratio-selector { margin-bottom: 14px; padding: 10px 10px 8px; background: transparent; border-radius: 14px; }
.ratio-label { font-size: 14px; color: #606266; margin-bottom: 12px; font-weight: 500; }
.ratio-segmented { width: 100%; }
.ratio-segmented-track { position: relative; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; background-color: rgba(0,0,0,0.04); border-radius: 999px; padding: 2px; }
.ratio-segmented-thumb { position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc((100% - 4px) / 5); border-radius: 999px; background-color: var(--primary-gold); box-shadow: 0 10px 24px rgba(0,0,0,0.18); transform: translateX(calc(var(--active-index, 0) * 100%)); transition: transform 0.18s ease-out; pointer-events: none; }
.ratio-segmented-item { position: relative; z-index: 1; border: none; background: transparent; color: #606266; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 6px 4px; font-size: 12px; cursor: pointer; }
.ratio-segmented-item.is-active { color: #fff; }
.ratio-icon { display: inline-block; width: 14px; height: 14px; border-radius: 3px; border: 1px solid currentColor; }
.ratio-icon--free { border-style: dashed; }
.ratio-icon--1\:1 { border-radius: 2px; }
.ratio-icon--circle { border-radius: 999px; }
.ratio-icon--47\:65-ellipse, .ratio-icon--63\:93-ellipse { border-radius: 999px; transform: scaleX(1.3); }

.image-filters { margin-bottom: 12px; padding: 10px 10px 8px; background: rgba(255,255,255,0.16); border-radius: 14px; border: 1px solid rgba(255,255,255,0.22); }
.filters-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.filters-title { font-size: 13px; color: #606266; }
.filter-reset-btn { color: var(--primary-gold); }
.filter-item { display: flex; align-items: center; margin-bottom: 6px; }
.filter-label { width: 60px; font-size: 14px; color: #606266; white-space: nowrap; }
.filter-item .el-slider { flex: 1; margin-left: 12px; margin-right: 12px; }
.filter-value { width: 40px; text-align: right; font-size: 12px; color: #909399; }
.image-filters :deep(.el-slider__runway) { background-color: #e4e7ed; }
.image-filters :deep(.el-slider__bar) { background-color: var(--primary-gold); }
.image-filters :deep(.el-slider__button) { border-color: transparent; background-color: #fff; box-shadow: 0 4px 10px rgba(15,23,42,0.22); }
.image-filters :deep(.el-slider__runway::before) { content: ''; position: absolute; top: 2px; bottom: 2px; left: 50%; width: 1px; background-color: rgba(0,0,0,0.08); transform: translateX(-0.5px); }

.rounded-rect-settings, .margin-settings { margin-bottom: 12px; padding: 10px 10px 8px; background: rgba(255,255,255,0.16); border-radius: 14px; border: 1px solid rgba(255,255,255,0.22); }
.rounded-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.rounded-title { font-size: 13px; color: #606266; }
.rounded-radius-row { display: flex; align-items: center; gap: 8px; }
.rounded-label { width: 60px; font-size: 14px; color: #606266; white-space: nowrap; }
.rounded-radius-row .el-slider { flex: 1; }
.rounded-value { width: 40px; text-align: right; font-size: 12px; color: #909399; }
.rounded-radius-row.is-disabled { opacity: 0.5; }
.rounded-rect-settings :deep(.el-slider__runway), .margin-settings :deep(.el-slider__runway) { position: relative; }
.rounded-rect-settings :deep(.el-slider__runway::before), .margin-settings :deep(.el-slider__runway::before) { content: ''; position: absolute; top: 2px; bottom: 2px; left: 50%; width: 1px; background-color: rgba(0,0,0,0.08); transform: translateX(-0.5px); }
.rounded-rect-settings :deep(.el-slider__bar), .margin-settings :deep(.el-slider__bar) { background-color: var(--primary-gold); }
.rounded-rect-settings :deep(.el-slider__button), .margin-settings :deep(.el-slider__button) { border-color: transparent; background-color: #fff; box-shadow: 0 4px 10px rgba(15,23,42,0.22); }

.live-preview { margin-top: 12px; }
.live-preview-header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
.live-preview-title { font-size: 13px; color: #606266; }
.live-preview-hint { font-size: 12px; color: #909399; }
.live-preview-card { border-radius: 14px; border: 1px solid rgba(15,23,42,0.12); background: linear-gradient(45deg,rgba(15,23,42,0.05) 25%,transparent 25%),linear-gradient(-45deg,rgba(15,23,42,0.05) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,rgba(15,23,42,0.05) 75%),linear-gradient(-45deg,transparent 75%,rgba(15,23,42,0.05) 75%),#f7f8fa; background-size: 18px 18px; background-position: 0 0,0 9px,9px -9px,-9px 0px,0 0; padding: 10px; min-height: 160px; display: flex; align-items: center; justify-content: center; }
.live-preview-img { width: 100%; height: 160px; object-fit: contain; display: block; border-radius: 10px; box-shadow: 0 0 0 1px rgba(15,23,42,0.18), 0 12px 28px rgba(15,23,42,0.18); }
.live-preview-placeholder { font-size: 12px; color: #909399; }

.cropper-wrapper { --rounded-radius: v-bind('roundedRadius + "%"'); width: 100%; margin: 12px auto 0; padding: 8px; border-radius: 18px; background: radial-gradient(circle at top, rgba(255,255,255,0.26), rgba(255,255,255,0.06)); border: 1px solid rgba(255,255,255,0.24); box-shadow: 0 20px 48px rgba(15,23,42,0.28), 0 0 0 1px rgba(255,255,255,0.16); }
:deep(.cropper-canvas img), :deep(.cropper-view-box img) { filter: brightness(var(--brightness)) contrast(var(--contrast)) saturate(var(--saturate)) !important; }

.cropper-wrapper.circle-crop :deep(.cropper-view-box), .cropper-wrapper.circle-crop :deep(.cropper-face) { border-radius: 50%; }
.cropper-wrapper.rounded-rect-preview :deep(.cropper-view-box), .cropper-wrapper.rounded-rect-preview :deep(.cropper-face) { border-radius: var(--rounded-radius-px, var(--rounded-radius)); }

@media (max-width: 768px) {
  .crop-dialog :deep(.el-dialog) { margin: 5vh auto 0; max-height: 90vh; }
  .crop-dialog :deep(.el-dialog__body) { padding: 14px 14px 18px; max-height: calc(90vh - 120px); overflow-y: auto; }
  .ratio-label { font-size: 13px; margin-bottom: 10px; }
  .crop-glass-panel { padding: 14px 14px 16px; border-radius: 16px; }
  .crop-header-row { flex-direction: column; align-items: stretch; }
  .crop-history-actions { width: 100%; }
  .crop-history-actions :deep(.el-button) { flex: 1; }
  .dialog-footer { gap: 8px; }
  .dialog-footer :deep(.el-button) { flex: 1; }
}

.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.26); }
.dialog-footer :deep(.el-button) { border-radius: 999px; }
.dialog-footer :deep(.el-button--primary) { background-color: var(--primary-gold); border-color: var(--primary-gold); box-shadow: 0 10px 26px rgba(15,23,42,0.25); }
</style>
