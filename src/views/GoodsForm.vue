<template>
  <div class="goods-form" :class="{ 'goods-form--mobile-dock': isMobile }">
    <div class="goods-form-header" :class="{ 'goods-form-header--mobile': isMobile }">
      <div class="goods-form-title">{{ formTitle }}</div>
      <div v-if="isMobile" class="goods-form-header-actions">
        <el-button text type="primary" class="header-drafts-btn" @click="goDrafts">草稿箱</el-button>
        <el-dropdown trigger="click" @command="handleMobileMoreCommand">
          <el-button text class="header-more-btn" :icon="MoreFilled" circle aria-label="更多" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="cancel">取消</el-dropdown-item>
              <el-dropdown-item command="reset">重置</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="top" class="goods-el-form">
      <!-- 基础信息分区 -->
      <section class="form-section form-section--basic">
        <div class="form-section-header">
          <h3 class="form-section-title">基础信息</h3>
          <p class="form-section-subtitle">IP、角色与品类等核心信息</p>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12">
            <el-form-item label="谷子名称" prop="name" class="is-required">
              <el-input v-model="formData.name" placeholder="请输入谷子名称" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="IP作品" prop="ip" class="is-required">
              <el-select v-model="formData.ip" placeholder="选择IP" filterable @change="handleIpChange" style="width: 100%">
                <el-option v-for="ip in ipOptions" :key="ip.id" :label="ip.name" :value="ip.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="角色" prop="characters" class="is-required">
              <el-select v-model="formData.characters" placeholder="选择角色（可多选）" filterable multiple :disabled="!formData.ip" style="width: 100%">
                <el-option v-for="char in filteredCharacters" :key="char.id" :label="char.name" :value="char.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="品类" prop="category" class="is-required">
              <el-tree-select v-model="formData.category" :data="categoryTreeOptions" :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="选择品类" style="width: 100%" clearable filterable check-strictly />
              <div v-if="selectedCategory" class="category-chip">
                <span class="color-dot" v-if="selectedCategory.color_tag" :style="{ backgroundColor: selectedCategory.color_tag || '#a3a3a3' }"></span>
                <span class="chip-text">{{ selectedCategory.path_name || selectedCategory.name }}</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="主题">
              <el-select v-model="formData.theme" placeholder="选择或创建主题" filterable allow-create default-first-option :reserve-keyword="true" @change="handleThemeChange" @create="handleThemeCreate" style="width: 100%" clearable>
                <el-option v-for="theme in themeOptions" :key="theme.id" :label="theme.name" :value="theme.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="状态" prop="status" class="is-required">
              <el-radio-group v-model="formData.status" class="status-segmented">
                <el-radio-button label="draft">草稿</el-radio-button>
                <el-radio-button label="in_cabinet">在馆</el-radio-button>
                <el-radio-button label="outdoor">出街中</el-radio-button>
                <el-radio-button label="sold">已售出</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="位置" prop="location">
              <el-tree-select v-model="formData.location" :data="locationStore.treeData" placeholder="选择位置" clearable style="width: 100%" :props="{ label: 'label', value: 'id', children: 'children' }" check-strictly />
            </el-form-item>
          </el-col>
        </el-row>
      </section>

      <!-- 数量与购入信息分区 -->
      <section class="form-section form-section--meta">
        <div class="form-section-header">
          <h3 class="form-section-title">数量与购入</h3>
          <p class="form-section-subtitle">记录数量、价格与购买时间</p>
        </div>
        <el-row :gutter="20">
          <el-col :xs="12" :sm="12">
            <el-form-item label="数量" prop="quantity" class="is-required">
              <div class="field-with-icon"><span class="field-icon">📦</span><el-input-number v-model="formData.quantity" :min="1" style="width: 100%" /></div>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12">
            <el-form-item label="购入价格">
              <div class="field-with-icon"><span class="field-icon">￥</span><el-input-number v-model="formData.price" :precision="2" :min="0" placeholder="请输入价格" style="width: 100%" /></div>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12">
            <el-form-item label="入手日期">
              <div class="field-with-icon"><span class="field-icon">📅</span><el-date-picker v-model="formData.purchase_date" type="date" placeholder="选择日期" style="width: 100%" value-format="YYYY-MM-DD" /></div>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12">
            <el-form-item label="是否官谷">
              <el-switch v-model="formData.is_official" active-text="是" inactive-text="否" inline-prompt />
            </el-form-item>
          </el-col>
        </el-row>
      </section>

      <!-- 图片分区 -->
      <section class="form-section form-section--images">
        <div class="form-section-header">
          <h3 class="form-section-title">图片</h3>
          <p class="form-section-subtitle">主图与细节图会直接影响云展柜观感</p>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24" :sm="10" :md="8">
            <el-form-item label="主图">
              <div class="main-photo-card-shell">
                <el-upload v-model:file-list="mainPhotoList" list-type="picture-card" :auto-upload="false" :limit="1" :on-change="handleMainPhotoChange" :on-remove="handleMainPhotoRemove" :on-preview="handlePictureCardPreview" :http-request="dummyUpload" :show-file-list="true" class="main-photo-uploader" :class="{ 'hide-upload-trigger': mainPhotoList.length >= 1 }" :open-file-dialog-on-click="!isMobileUploadActionSheet" accept="image/*">
                  <template #trigger>
                    <span v-if="mainPhotoList.length < 1 && isMobileUploadActionSheet" class="main-photo-trigger" @click.stop.prevent="chooseMainPhotoSource"><el-icon><Plus /></el-icon></span>
                    <el-icon v-else-if="mainPhotoList.length < 1"><Plus /></el-icon>
                  </template>
                </el-upload>
              </div>
              <div v-if="formData.main_photo || mainPhotoList.length" class="main-photo-actions">
                <el-button size="small" :icon="Edit" @click="handleReEditMainPhoto">重新编辑主图</el-button>
              </div>
              <input v-if="isH5Mobile" ref="cameraInputRef" type="file" accept="image/*" capture="environment" style="display: none" @change="handleH5MainPhotoPicked" />
              <input v-if="isH5Mobile" ref="albumInputRef" type="file" accept="image/*" style="display: none" @change="handleH5MainPhotoPicked" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="14" :md="16">
            <el-form-item label="附件图片">
              <div class="additional-photos-section">
                <div v-if="existingAdditionalPhotos.length > 0" class="existing-photos">
                  <div v-for="(photo, index) in existingAdditionalPhotos" :key="photo.id" class="photo-item">
                    <el-image :src="photo.image" fit="cover" class="photo-preview" :preview-src-list="existingAdditionalPhotos.map(p => p.image)" :initial-index="index">
                      <template #error><div class="image-error"><el-icon><Picture /></el-icon></div></template>
                    </el-image>
                    <div class="photo-actions">
                      <el-input v-model="photo.label" placeholder="图片标签（可选）" size="small" class="photo-label-input" @blur="handlePhotoLabelChange(photo)" />
                      <el-button type="danger" size="small" :icon="Delete" circle @click="handleRemoveExistingPhoto(photo.id)" />
                    </div>
                  </div>
                </div>
                <div v-if="newAdditionalPhotoFiles.length > 0" class="new-photos">
                  <div v-for="(file, index) in newAdditionalPhotoFiles" :key="index" class="photo-item">
                    <el-image :src="file.preview" fit="cover" class="photo-preview" :preview-src-list="newAdditionalPhotoFiles.map(f => f.preview)" :initial-index="index">
                      <template #error><div class="image-error"><el-icon><Picture /></el-icon></div></template>
                    </el-image>
                    <div class="photo-actions">
                      <el-input v-model="file.label" placeholder="图片标签（可选）" size="small" class="photo-label-input" />
                      <el-button type="danger" size="small" :icon="Delete" circle @click="handleRemoveNewPhoto(index)" />
                    </div>
                  </div>
                </div>
                <el-upload ref="additionalUploadRef" v-model:file-list="additionalPhotoList" list-type="picture-card" :auto-upload="false" :on-change="handleAdditionalPhotoChange" :on-remove="handleAdditionalPhotoRemove" :http-request="dummyUpload" :show-file-list="false" accept="image/*" multiple class="additional-photo-upload">
                  <template #trigger><el-icon><Plus /></el-icon></template>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </section>

      <!-- 备注分区 -->
      <section class="form-section form-section--notes">
        <div class="form-section-header">
          <h3 class="form-section-title">备注</h3>
          <p class="form-section-subtitle">可以记录店铺、工艺、画师等细节</p>
        </div>
        <el-row :gutter="20">
          <el-col :xs="24">
            <el-form-item label="备注">
              <el-input v-model="formData.notes" type="textarea" :rows="4" placeholder="请输入备注信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </section>
    </el-form>

    <!-- 底部：桌面端五按钮 -->
    <div v-if="!isMobile" class="sticky-action-bar">
      <div class="sticky-action-inner">
        <el-button class="sticky-btn sticky-btn--secondary" @click="handleCancel">取消</el-button>
        <el-button class="sticky-btn sticky-btn--secondary" @click="handleReset">重置</el-button>
        <el-button class="sticky-btn sticky-btn--secondary" @click="goDrafts">草稿箱</el-button>
        <el-button class="sticky-btn sticky-btn--secondary" @click="submitByMode('draft')" :loading="submitting">保存草稿</el-button>
        <el-button type="primary" class="sticky-btn sticky-btn--primary" @click="submitByMode('publish')" :loading="submitting">{{ isEditMode ? '保存修改' : '发布' }}</el-button>
      </div>
    </div>

    <!-- 移动端：底部渐变遮罩 + 双按钮 -->
    <div v-if="isMobile" class="mobile-form-dock-wrap" :class="{ 'mobile-form-dock-wrap--visible': mobileFormDockVisible }" aria-label="表单主操作">
      <div class="mobile-form-dock-stack">
        <div class="mobile-form-dock-fade" aria-hidden="true" />
        <div class="mobile-form-dock-actions">
          <el-button class="mobile-form-dock-btn mobile-form-dock-btn--draft" @click="submitByMode('draft')" :loading="submitting">保存草稿</el-button>
          <el-button type="primary" class="mobile-form-dock-btn mobile-form-dock-btn--publish" @click="submitByMode('publish')" :loading="submitting">{{ isEditMode ? '保存修改' : '发布' }}</el-button>
        </div>
      </div>
    </div>

    <!-- 移动端主图选择抽屉 -->
    <el-drawer v-model="photoSourceDrawerVisible" direction="btt" :with-header="false" size="auto" class="photo-source-drawer">
      <div class="action-sheet-content">
        <div class="sheet-header">选择主图</div>
        <div class="sheet-menu">
          <div class="sheet-item" @click="handlePhotoFromCamera"><el-icon><CameraIcon /></el-icon> 拍照</div>
          <div class="sheet-item" @click="handlePhotoFromAlbum"><el-icon><Picture /></el-icon> 相册选择</div>
        </div>
        <div class="sheet-cancel" @click="photoSourceDrawerVisible = false">取消</div>
      </div>
    </el-drawer>

    <!-- 图片裁切组件 -->
    <ImageCropper
      v-if="cropDialogVisible && cropImageFile"
      :key="cropImageSrc"
      :visible="cropDialogVisible"
      :image-src="cropImageSrc"
      :image-file="cropImageFile"
      @confirm="handleCropDialogConfirm"
      @cancel="handleCropDialogCancel"
      @update:visible="onCropDialogVisibleChange"
    />

    <!-- 新建去重弹窗 -->
    <el-dialog v-model="duplicateDialogVisible" width="min(92vw, 644px)" class="duplicate-dialog" :close-on-click-modal="false" @close="setDuplicateSelectedId(null)">
      <template #header><span class="duplicate-dialog-title">检测到库存中已存在相同项目</span></template>
      <p class="duplicate-dialog-desc">以下谷子与当前填写信息可能重复，请选择合并到已有条目或仍然新建一条。</p>
      <div class="duplicate-candidates-list">
        <div v-for="c in duplicateCandidates" :key="c.id" class="duplicate-candidate-card" :class="{ 'is-selected': duplicateSelectedId === c.id }" @click="setDuplicateSelectedId(c.id)">
          <div class="duplicate-candidate-thumb">
            <img v-if="c.main_photo_url" :src="c.main_photo_url" :alt="c.name" class="candidate-thumb-img" />
            <span v-else class="candidate-thumb-placeholder">无图</span>
          </div>
          <div class="duplicate-candidate-main">
            <span class="candidate-name">{{ c.name }}</span>
            <span class="candidate-meta">当前库存 {{ c.quantity }}</span>
          </div>
          <div class="duplicate-candidate-time">{{ formatCandidateCreatedAt(c.created_at) }}</div>
        </div>
      </div>
      <template #footer>
        <div class="duplicate-dialog-footer">
          <el-button @click="duplicateDialogVisible = false">取消</el-button>
          <el-button @click="handleDuplicateNew" :loading="submitting">独立新建</el-button>
          <el-button class="duplicate-merge-btn" :disabled="!duplicateSelectedId" :loading="submitting" @click="handleDuplicateMerge">合并到此条(数量+N)</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览 -->
    <el-image-viewer v-if="previewVisible" :url-list="[previewImage]" @close="previewVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Plus, Delete, Picture, Camera as CameraIcon, Edit, MoreFilled } from '@element-plus/icons-vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import { useLocationStore } from '@/stores/location'
import { createGoods, updateGoods, getGoodsDetail, uploadMainPhoto } from '@/api/goods'
import type { GoodsCreateResponse, GoodsDetail, GoodsInput, GoodsStatus } from '@/api/types'

import ImageCropper from '@/views/goods-form/components/ImageCropper.vue'
import { useGoodsFormMetadata } from '@/views/goods-form/composables/useGoodsFormMetadata'
import { useAdditionalPhotos } from '@/views/goods-form/composables/useAdditionalPhotos'
import { useDuplicateHandler } from '@/views/goods-form/composables/useDuplicateHandler'
const router = useRouter()
const route = useRoute()
const locationStore = useLocationStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEditMode = computed(() => Boolean(route.params.id))
const formTitle = computed(() => (route.params.id ? '编辑谷子' : '新增谷子'))

const formData = ref({
  name: '',
  ip: undefined as number | undefined,
  characters: [] as number[],
  category: undefined as number | undefined,
  theme: undefined as number | string | undefined | null,
  status: 'in_cabinet' as GoodsStatus,
  location: undefined as number | undefined,
  quantity: 1,
  price: undefined as number | undefined,
  purchase_date: '',
  is_official: false,
  notes: '',
  main_photo: '',
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入谷子名称', trigger: 'blur' }],
  ip: [{ required: true, message: '请选择IP', trigger: 'change' }],
  characters: [{ required: true, message: '请至少选择一个角色', trigger: 'change' }, { type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' }],
  category: [{ required: true, message: '请选择品类', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

// ── Composables ──

const goodsId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

const metadata = useGoodsFormMetadata(formData)
const {
  ipOptions, characters, categoryOptions, themeOptions, filteredCharacters,
  categoryTreeOptions, selectedCategory,
  handleIpChange, handleThemeChange, handleThemeCreate, ensureThemeCreated, loadMetadata,
} = metadata

const additionalPhotos = useAdditionalPhotos(goodsId)
const {
  existingAdditionalPhotos, newAdditionalPhotoFiles, additionalPhotoList,
  handleAdditionalPhotoChange, handleAdditionalPhotoRemove,
  handleRemoveNewPhoto, handleRemoveExistingPhoto, handlePhotoLabelChange,
  handleAdditionalPhotosUpload, setExistingPhotos, cleanupNewPhotos,
} = additionalPhotos

const onCreateOrMergeSuccess = async (result: GoodsCreateResponse, mode: 'draft' | 'publish') => {
  const id = result.id
  if (mainPhotoFile.value) {
    await uploadMainPhoto(id, mainPhotoFile.value)
  }
  if (newAdditionalPhotoFiles.value.length > 0) {
    await handleAdditionalPhotosUpload(id)
  }
  if (result.merged) {
    ElMessage.success('已合并到已有谷子')
  } else if (result.saved_as_draft || mode === 'draft') {
    ElMessage.success('草稿已保存')
  } else {
    ElMessage.success('创建成功')
  }
  router.push({ name: 'CloudShowcase' })
}

const duplicateHandler = useDuplicateHandler({ onSuccess: onCreateOrMergeSuccess })
const {
  duplicateDialogVisible, duplicateCandidates, duplicateSelectedId,
  setDuplicateSelectedId, formatCandidateCreatedAt,
  openDuplicateDialog, handleDuplicateMerge, handleDuplicateNew,
} = duplicateHandler

// ── Main photo state ──

const mainPhotoFile = ref<File | null>(null)
const mainPhotoList = ref<UploadFile[]>([])
const previewVisible = ref(false)
const previewImage = ref('')

const handlePictureCardPreview = (uploadFile: UploadFile) => {
  previewImage.value = uploadFile.url!
  previewVisible.value = true
}

const dummyUpload = () => Promise.resolve()

const setMainPhotoFromFile = (file: File, previewUrl?: string) => {
  const oldFile = mainPhotoList.value[0]
  if (oldFile && oldFile.url && oldFile.url.startsWith('blob:')) {
    URL.revokeObjectURL(oldFile.url)
  }
  mainPhotoFile.value = file
  formData.value.main_photo = ''
  mainPhotoList.value = [{ name: file.name || 'main_photo', url: previewUrl, status: 'success' } as UploadFile]
}

const handleMainPhotoRemove = () => {
  mainPhotoFile.value = null
  mainPhotoList.value = []
  formData.value.main_photo = ''
}

// ── Crop dialog state ──

const cropDialogVisible = ref(false)
const cropImageSrc = ref('')
const cropImageFile = ref<File | null>(null)

const openCropDialog = (file: File, previewUrl?: string) => {
  cropImageFile.value = file
  if (previewUrl) {
    cropImageSrc.value = previewUrl
  } else {
    cropImageSrc.value = URL.createObjectURL(file)
  }
  cropDialogVisible.value = true
}

const handleMainPhotoChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw
  if (file) {
    openCropDialog(file)
    mainPhotoList.value = []
  }
}

const handleCropDialogConfirm = (file: File, previewUrl: string) => {
  setMainPhotoFromFile(file, previewUrl)
}

const handleCropDialogCancel = () => { cropDialogVisible.value = false }

const onCropDialogVisibleChange = (v: boolean) => { cropDialogVisible.value = v }

// ── Re-edit main photo ──

const handleReEditMainPhoto = async () => {
  try {
    const url = (formData.value.main_photo || mainPhotoList.value?.[0]?.url || '').toString()
    if (!url) { ElMessage.warning('当前没有可编辑的主图'); return }

    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`拉取图片失败（HTTP ${resp.status}）`)
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const ext = mime.includes('/') ? mime.split('/')[1] : 'jpg'
    const file = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
    openCropDialog(file, url)
  } catch (err: any) {
    ElMessage.error('重新编辑主图失败：' + (err?.message || '未知错误'))
  }
}

// ── Mobile / camera helpers ──

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isMobile = computed(() => windowWidth.value < 768)
const isH5Mobile = computed(() => !Capacitor.isNativePlatform() && windowWidth.value < 768)
const isNativeMobile = computed(() => Capacitor.isNativePlatform() && windowWidth.value < 768)
const isMobileUploadActionSheet = computed(() => isNativeMobile.value || isH5Mobile.value)

const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)
const photoSourceDrawerVisible = ref(false)

const chooseMainPhotoSource = () => { photoSourceDrawerVisible.value = true }

const handlePhotoFromCamera = async () => {
  photoSourceDrawerVisible.value = false
  if (isNativeMobile.value) {
    await pickMainPhotoFromNative(CameraSource.Camera)
  } else if (isH5Mobile.value) {
    cameraInputRef.value?.click()
  }
}

const handlePhotoFromAlbum = async () => {
  photoSourceDrawerVisible.value = false
  if (isNativeMobile.value) {
    await pickMainPhotoFromNative(CameraSource.Photos)
  } else if (isH5Mobile.value) {
    albumInputRef.value?.click()
  }
}

const handleH5MainPhotoPicked = (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  openCropDialog(file)
  if (input) input.value = ''
}

const pickMainPhotoFromNative = async (source: CameraSource) => {
  try {
    const photo = await Camera.getPhoto({ quality: 85, resultType: CameraResultType.Uri, source, correctOrientation: true })
    if (!photo.webPath) throw new Error('未获取到图片路径')
    const resp = await fetch(photo.webPath)
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const ext = mime.includes('/') ? mime.split('/')[1] : 'jpg'
    const file = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
    openCropDialog(file, photo.webPath)
  } catch (err: any) {
    const msg = err?.message || ''
    if (msg.includes('User cancelled') || msg.includes('canceled') || msg.includes('cancel')) return
    ElMessage.error('获取图片失败：' + (err?.message || '未知错误'))
  }
}

// ── Mobile dock scroll behavior ──

const mobileFormDockVisible = ref(false)
const MOBILE_FORM_DOCK_BOTTOM_THRESHOLD_PX = 100

const checkMobileFormDockScroll = () => {
  if (typeof window === 'undefined') return
  if (!isMobile.value) { mobileFormDockVisible.value = false; return }
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  mobileFormDockVisible.value = (documentHeight - (scrollTop + windowHeight)) <= MOBILE_FORM_DOCK_BOTTOM_THRESHOLD_PX
}

const syncWindowWidth = () => {
  if (typeof window !== 'undefined') windowWidth.value = window.innerWidth
  void nextTick(() => checkMobileFormDockScroll())
}

// ── Submit logic ──

const runDraftValidation = () => {
  if (!formData.value.name?.trim()) { ElMessage.warning('草稿至少需要填写谷子名称'); return false }
  if (!formData.value.ip) { ElMessage.warning('草稿至少需要选择IP'); return false }
  if (!formData.value.category) { ElMessage.warning('草稿至少需要选择品类'); return false }
  return true
}

const buildSubmitData = async (mode: 'draft' | 'publish'): Promise<GoodsInput> => {
  const themeId = await ensureThemeCreated()
  const { main_photo, theme, ...restForm } = formData.value
  const effectiveStatus: GoodsStatus = mode === 'draft' ? 'draft' : (restForm.status === 'draft' ? 'in_cabinet' : restForm.status)
  const submitData: GoodsInput = {
    ...restForm, status: effectiveStatus,
    price: restForm.price?.toString(),
    ip_id: restForm.ip!, character_ids: restForm.characters,
    category_id: restForm.category!, theme_id: themeId,
  }
  if (!restForm.purchase_date) delete (submitData as any).purchase_date
  return submitData
}

const submitByMode = async (mode: 'draft' | 'publish') => {
  if (!formRef.value) return
  if (mode === 'publish') {
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
  } else if (!runDraftValidation()) return

  submitting.value = true
  let submitData: GoodsInput | null = null
  try {
    submitData = await buildSubmitData(mode)

    if (route.params.id) {
      const id = route.params.id as string
      await updateGoods(id, submitData)
      if (mainPhotoFile.value) await uploadMainPhoto(id, mainPhotoFile.value)
      await handleAdditionalPhotosUpload(id)
      ElMessage.success(mode === 'draft' ? '草稿已保存' : '更新成功')
      router.push({ name: 'CloudShowcase' })
    } else {
      const createPayload: GoodsInput = mode === 'publish' ? { ...submitData, merge_strategy: 'auto' } : submitData
      const result = await createGoods(createPayload)
      await onCreateOrMergeSuccess(result, mode)
    }
  } catch (err: any) {
    if (mode === 'publish' && err.response?.status === 409) {
      const data = err.response?.data
      if (data?.code === 'goods_duplicate' && Array.isArray(data?.candidates) && submitData) {
        openDuplicateDialog(data.candidates, { ...submitData })
      } else {
        ElMessage.error(data?.detail || err.message || '提交失败')
      }
    } else if (err.response?.status === 400) {
      ElMessage.warning(err.response?.data?.detail || err.message || '请求参数错误')
    } else {
      ElMessage.error(err.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm('确定要重置表单吗？当前填写内容将恢复为进入页面时的状态（未保存的修改会丢失）。', '重置表单', { type: 'warning', confirmButtonText: '重置', cancelButtonText: '取消' })
    formRef.value?.resetFields()
  } catch { /* user cancelled */ }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要离开吗？未保存的修改将丢失。', '离开页面', { type: 'warning', confirmButtonText: '离开', cancelButtonText: '留在页面' })
    router.back()
  } catch { /* user cancelled */ }
}

const handleMobileMoreCommand = (command: string) => {
  if (command === 'cancel') void handleCancel()
  else if (command === 'reset') void handleReset()
}

const goDrafts = () => router.push({ name: 'GoodsDrafts' })

// ── Lifecycle ──

onMounted(async () => {
  syncWindowWidth()
  window.addEventListener('resize', syncWindowWidth)
  window.addEventListener('scroll', handleWindowScrollForDock, { passive: true })

  try { await loadMetadata() } catch { ElMessage.error('加载基础数据失败') }
  await locationStore.fetchNodes()

  if (!route.params.id) {
    formData.value.notes = '店铺：\n工艺：\n画师：\n主题：'
  }

  if (route.params.id) {
    try {
      const data = await getGoodsDetail(route.params.id as string)
      formData.value = {
        name: data.name,
        ip: data.ip.id,
        characters: data.characters.map(c => c.id),
        category: data.category.id,
        theme: data.theme?.id || null,
        status: data.status as GoodsStatus,
        location: data.location || undefined,
        quantity: data.quantity,
        price: data.price ? parseFloat(data.price) : undefined,
        purchase_date: data.purchase_date || '',
        is_official: data.is_official,
        notes: data.notes || '',
        main_photo: data.main_photo || '',
      }
      if (data.main_photo) {
        mainPhotoList.value = [{ url: data.main_photo, name: 'main_photo' } as UploadFile]
      }
      if (data.additional_photos && data.additional_photos.length > 0) {
        setExistingPhotos(data.additional_photos)
      }
    } catch { ElMessage.error('加载数据失败') }
  }

  await nextTick()
  checkMobileFormDockScroll()
})

const handleWindowScrollForDock = () => { checkMobileFormDockScroll() }

onUnmounted(() => {
  window.removeEventListener('resize', syncWindowWidth)
  window.removeEventListener('scroll', handleWindowScrollForDock)
  cleanupNewPhotos()
  if (cropImageSrc.value && cropImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropImageSrc.value)
  }
  mainPhotoList.value.forEach((file) => {
    if (file.url && file.url.startsWith('blob:')) URL.revokeObjectURL(file.url)
  })
})
</script>

<style scoped>
.goods-form { padding: 24px; max-width: 1200px; margin: 0 auto; }
.goods-form--mobile-dock { padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px)); }
.goods-form-header { margin-bottom: 16px; }
.goods-form-header--mobile { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.goods-form-header--mobile .goods-form-title { flex: 1; min-width: 0; }
.goods-form-header-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.header-drafts-btn { padding: 6px 10px; font-size: 14px; }
.header-more-btn { font-size: 20px; }
.goods-form-title { font-size: 20px; font-weight: 600; color: var(--primary-gold); }
.goods-el-form { margin-top: 4px; }
.sticky-action-bar { margin-top: 12px; padding-bottom: env(safe-area-inset-bottom, 0); }
.sticky-action-inner { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; align-items: center; }
.sticky-action-inner :deep(.el-button) { margin: 0; }
@media (max-width: 768px) {
  .sticky-action-inner { justify-content: center; }
  .sticky-action-inner :deep(.el-button) { padding: 8px 12px; font-size: 12px; }
}
.mobile-form-dock-wrap { position: fixed; left: 0; right: 0; bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 8px); z-index: 999; pointer-events: none; background: transparent; transform: translateY(calc(100% + 24px)); opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease; }
.mobile-form-dock-wrap--visible { transform: translateY(0); opacity: 1; }
.mobile-form-dock-stack { position: relative; display: flex; flex-direction: column; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 16px 10px; box-sizing: border-box; isolation: isolate; }
.mobile-form-dock-fade { position: absolute; z-index: 0; left: 50%; margin-left: -50vw; bottom: 0; width: 100vw; height: min(200px, 42vh); min-height: 140px; pointer-events: none; background: linear-gradient(to top, var(--secondary-gray) 0%, rgba(245,245,247,0.92) 28%, rgba(245,245,247,0.55) 55%, rgba(255,255,255,0) 100%); }
.mobile-form-dock-actions { position: relative; z-index: 1; display: flex; align-items: stretch; gap: 10px; width: 100%; pointer-events: auto; background: transparent; }
.mobile-form-dock-btn { flex: 1; min-height: 44px; margin: 0; border-radius: 999px !important; font-size: 14px; font-weight: 600; }
.goods-form .mobile-form-dock-wrap :deep(.mobile-form-dock-btn.el-button) { border-radius: 999px !important; }
.mobile-form-dock-btn--draft { flex: 4; color: #a289ff !important; background: #f7f3ff !important; border: none !important; box-shadow: none !important; }
.mobile-form-dock-btn--draft:hover, .mobile-form-dock-btn--draft:focus { color: #a289ff !important; background: rgba(162,137,255,0.12) !important; border: none !important; }
.mobile-form-dock-btn--publish { flex: 6; --el-button-bg-color: var(--primary-gold); --el-button-border-color: var(--primary-gold); --el-button-hover-bg-color: var(--primary-gold-dark); --el-button-hover-border-color: var(--primary-gold-dark); --el-button-active-bg-color: var(--primary-gold-dark); --el-button-active-border-color: var(--primary-gold-dark); color: #ffffff !important; background-color: var(--primary-gold) !important; border-color: var(--primary-gold) !important; }
.mobile-form-dock-btn--publish:hover, .mobile-form-dock-btn--publish:focus { color: #ffffff !important; background-color: var(--primary-gold-dark) !important; border-color: var(--primary-gold-dark) !important; }
@supports not (bottom: env(safe-area-inset-bottom)) { .mobile-form-dock-wrap { bottom: 72px; } }
.form-section { margin-bottom: 20px; padding: 16px 18px 18px; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.04); border: 1px solid rgba(17,24,39,0.04); }
.form-section--images { background: radial-gradient(circle at top left, #ffffff, #fafbff); }
.form-section-header { margin-bottom: 12px; display: flex; align-items: baseline; gap: 8px; }
.form-section-title { margin: 0 0 4px; font-size: 18px; font-weight: 600; color: #303133; }
.form-section-subtitle { margin: 0; font-size: 12px; color: #909399; }
.form-section-header::before { content: ''; width: 3px; height: 20px; border-radius: 999px; background: linear-gradient(180deg, var(--primary-gold), #d9c18a); align-self: center; }
.goods-form :deep(.el-form-item) { margin-bottom: 26px; }
.goods-form :deep(.el-input__wrapper), .goods-form :deep(.el-textarea__inner), .goods-form :deep(.el-select .el-input__wrapper), .goods-form :deep(.el-input-number__decrease), .goods-form :deep(.el-input-number__increase), .goods-form :deep(.el-date-editor.el-input__wrapper), .goods-form :deep(.el-date-editor.el-input) { border-radius: 10px; border-color: #e5e5e5; background-color: #ffffff; transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease; }
.goods-form :deep(.el-input__wrapper:hover), .goods-form :deep(.el-textarea__inner:hover), .goods-form :deep(.el-select .el-input__wrapper:hover), .goods-form :deep(.el-date-editor.el-input__wrapper:hover) { border-color: #d0d0d7; box-shadow: 0 0 0 1px rgba(208,208,215,0.3); }
.goods-form :deep(.el-input.is-focus .el-input__wrapper), .goods-form :deep(.el-select .el-input.is-focus .el-input__wrapper), .goods-form :deep(.el-textarea__inner:focus), .goods-form :deep(.el-date-editor.el-input__wrapper.is-active) { border-color: var(--primary-gold); box-shadow: 0 0 0 1px rgba(195,160,80,0.35), 0 10px 18px rgba(0,0,0,0.06); }
.goods-form :deep(.el-button) { border-radius: 10px; }
.goods-form :deep(.el-form-item__label) { color: #606266; font-weight: 500; font-size: 13px; }
.goods-form :deep(.el-form-item__label .el-form-item__required-star) { color: #f56c6c; font-size: 12px; margin-left: 2px; }
.goods-form :deep(.el-form-item.is-required .el-form-item__label) { position: relative; }
.field-with-icon { display: flex; align-items: center; gap: 8px; }
.field-icon { flex-shrink: 0; font-size: 16px; color: #909399; }
.category-chip { margin-top: 6px; display: inline-flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 8px; background: #f7f7fb; border: 1px solid #ebeef5; font-size: 12px; color: #606266; }
.color-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 1px #e0e0e0; }
.chip-text { white-space: nowrap; }
.main-photo-card-shell { display: block; width: 220px; }
.hide-upload-trigger :deep(.el-upload--picture-card) { display: none; }
.main-photo-trigger { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.main-photo-actions { width: 220px; margin-top: 14px; display: flex; justify-content: center; }
.main-photo-uploader :deep(.el-upload--picture-card) { width: 220px; height: 220px; border-radius: 16px; border: 1px dashed #e0e3f0; border-color: #e0e3f0; background: #fafbff; transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease, transform 0.16s ease; }
.main-photo-uploader :deep(.el-upload--picture-card:hover) { border-color: var(--primary-gold); background: #fdfaf3; box-shadow: 0 8px 18px rgba(0,0,0,0.06); transform: translateY(-1px); }
.main-photo-uploader :deep(.el-upload--picture-card .el-icon) { font-size: 26px; color: #b1b5c6; }
.main-photo-uploader :deep(.el-upload-list--picture-card) { display: block; width: 220px; }
.main-photo-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) { width: 220px; height: 220px; margin: 0; border-radius: 16px; }
.main-photo-uploader :deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) { width: 100%; height: 100%; object-fit: cover; }
.additional-photo-upload :deep(.el-upload--picture-card) { width: 120px; height: 120px; border-radius: 12px; border-style: dashed; border-width: 1px; border-color: #e7e9f4; background-color: #fbfbff; }
:deep(.el-upload--picture-card) { border-color: var(--border-color); }
:deep(.el-upload--picture-card:hover) { border-color: var(--primary-gold); }
.additional-photos-section { width: 100%; }
.existing-photos, .new-photos { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; margin-bottom: 16px; }
@media (max-width: 768px) { .existing-photos, .new-photos { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px; } }
.photo-item { position: relative; display: flex; flex-direction: column; gap: 8px; }
.photo-preview { width: 100%; height: 120px; border-radius: 10px; border: 1px solid var(--border-color); overflow: hidden; }
@media (max-width: 768px) { .photo-preview { height: 100px; } }
.photo-actions { display: flex; gap: 8px; align-items: center; }
.photo-label-input { flex: 1; }
.image-error { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: #f5f7fa; color: #909399; }
.additional-photo-upload { display: inline-block; }
.additional-photo-upload :deep(.el-upload--picture-card) { width: 120px; height: 120px; border-radius: 12px; border-style: dashed; }
.status-segmented { display: inline-flex; gap: 8px; }
.status-segmented :deep(.el-radio-button__inner) { border-radius: 999px !important; border: none; background-color: transparent; box-shadow: none; padding: 8px 14px; font-size: 13px; color: #606266; }
.status-segmented :deep(.el-radio-button:first-child .el-radio-button__inner), .status-segmented :deep(.el-radio-button:last-child .el-radio-button__inner) { border-radius: 999px !important; }
.status-segmented :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) { background: linear-gradient(135deg, #a396ff 0%, var(--primary-gold) 100%); color: #ffffff; box-shadow: 0 8px 18px rgba(163,150,255,0.35); }
.status-segmented :deep(.el-radio-button__inner:hover) { background-color: rgba(0,0,0,0.03); }
.action-sheet-content { background: #f8f8f8; padding-bottom: env(safe-area-inset-bottom); }
.sheet-header { padding: 12px; text-align: center; font-size: 12px; color: #909399; background: #fff; border-bottom: 1px solid #f0f0f0; }
.sheet-menu { background: #fff; }
.sheet-item { padding: 16px; text-align: center; font-size: 16px; border-bottom: 1px solid #f5f5f5; color: #333; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }
.sheet-item:active { background: #f5f5f5; }
.sheet-cancel { margin-top: 8px; background: #fff; padding: 16px; text-align: center; font-size: 16px; color: #333; cursor: pointer; }
.sheet-cancel:active { background: #f5f5f5; }

.duplicate-dialog :deep(.el-dialog__body) { padding-top: 12px; }
.duplicate-dialog-title { font-weight: 700; font-size: 1.125rem; color: var(--el-text-color-primary); }
.duplicate-dialog-desc { margin: 0 0 16px; font-size: 14px; color: #909399; line-height: 1.5; }
.duplicate-candidates-list { max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.duplicate-candidate-card { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; border: 2px solid transparent; background: var(--el-fill-color-blank); cursor: pointer; transition: border-color 0.2s, background-color 0.2s; }
.duplicate-candidate-card:hover { background: var(--el-fill-color-light); }
.duplicate-candidate-card.is-selected { border-color: #D4AF37; background: rgba(212,175,55,0.06); }
.duplicate-candidate-thumb { flex-shrink: 0; width: 40px; height: 40px; border-radius: 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); overflow: hidden; display: flex; align-items: center; justify-content: center; }
.duplicate-candidate-thumb .candidate-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.duplicate-candidate-thumb .candidate-thumb-placeholder { font-size: 11px; color: var(--el-text-color-placeholder); }
.duplicate-candidate-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.duplicate-candidate-card .candidate-name { font-size: 16px; font-weight: 500; color: #1a1a1a; }
.duplicate-candidate-card .candidate-meta { font-size: 12px; color: #909399; }
.duplicate-candidate-time { flex-shrink: 0; font-size: 12px; color: #909399; }
.duplicate-dialog-footer { display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.duplicate-dialog-footer .el-button:first-child { color: #606266; border-color: var(--el-border-color); }
.duplicate-dialog-footer .el-button:nth-child(2) { border-color: var(--el-border-color); }
.duplicate-dialog-footer .duplicate-merge-btn { background-color: #E2C04A; border-color: #E2C04A; color: #1a1a1a; }
.duplicate-dialog-footer .duplicate-merge-btn:hover, .duplicate-dialog-footer .duplicate-merge-btn:focus { background-color: #D9B83D; border-color: #D9B83D; color: #1a1a1a; }
.duplicate-dialog-footer .duplicate-merge-btn:disabled { background-color: var(--el-fill-color); border-color: var(--el-border-color-lighter); color: var(--el-text-color-placeholder); }
</style>
