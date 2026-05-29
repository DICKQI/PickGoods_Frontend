import { ref, type Ref } from 'vue'
import { ElMessage, ElMessageBox, type UploadFile } from 'element-plus'
import { deleteAdditionalPhoto, updateAdditionalPhotoLabel, uploadAdditionalPhotos } from '@/api/goods'
import type { GuziImage } from '@/api/types'

export interface NewPhotoFile {
  file: File
  preview: string
  label?: string
}

export interface ExistingPhoto extends GuziImage {
  label?: string
  originalLabel?: string
}

export function useAdditionalPhotos(goodsId: Ref<string | undefined>) {
  const existingAdditionalPhotos = ref<ExistingPhoto[]>([])
  const newAdditionalPhotoFiles = ref<NewPhotoFile[]>([])
  const additionalPhotoList = ref<UploadFile[]>([])

  const handleAdditionalPhotoChange = (uploadFile: UploadFile) => {
    const file = uploadFile.raw
    if (file) {
      const preview = URL.createObjectURL(file)
      newAdditionalPhotoFiles.value.push({
        file,
        preview,
        label: '',
      })
    }
    additionalPhotoList.value = []
  }

  const handleAdditionalPhotoRemove = () => {
    additionalPhotoList.value = []
  }

  const handleRemoveNewPhoto = (index: number) => {
    const removed = newAdditionalPhotoFiles.value[index]
    if (removed && removed.preview) {
      URL.revokeObjectURL(removed.preview)
    }
    newAdditionalPhotoFiles.value.splice(index, 1)
  }

  const handleRemoveExistingPhoto = async (photoId: number) => {
    if (goodsId.value) {
      try {
        await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })

        await deleteAdditionalPhoto(goodsId.value, photoId)
        existingAdditionalPhotos.value = existingAdditionalPhotos.value.filter((p) => p.id !== photoId)
        ElMessage.success('删除成功')
      } catch (err: any) {
        if (err !== 'cancel') {
          ElMessage.error('删除失败：' + (err.message || '未知错误'))
        }
      }
    } else {
      existingAdditionalPhotos.value = existingAdditionalPhotos.value.filter((p) => p.id !== photoId)
    }
  }

  const handlePhotoLabelChange = async (photo: ExistingPhoto) => {
    if (goodsId.value && photo.originalLabel !== photo.label) {
      try {
        const label = photo.label?.trim() || ''
        await updateAdditionalPhotoLabel(goodsId.value, [photo.id], label)
        photo.originalLabel = photo.label
        ElMessage.success('标签更新成功')
      } catch (err: any) {
        photo.label = photo.originalLabel
        ElMessage.error('标签更新失败：' + (err.message || '未知错误'))
      }
    }
  }

  const handleAdditionalPhotosUpload = async (id: string) => {
    if (newAdditionalPhotoFiles.value.length === 0) return

    try {
      for (const photo of newAdditionalPhotoFiles.value) {
        const label = photo.label?.trim() || ''
        await uploadAdditionalPhotos(id, [photo.file], { label })
      }
    } catch (err: any) {
      ElMessage.error('上传附件图片失败：' + (err.message || '未知错误'))
      throw err
    }
  }

  const setExistingPhotos = (photos: GuziImage[]) => {
    existingAdditionalPhotos.value = photos.map((photo) => ({
      ...photo,
      label: photo.label || '',
      originalLabel: photo.label || '',
    }))
  }

  const resetNewPhotos = () => {
    newAdditionalPhotoFiles.value.forEach((photo) => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })
    newAdditionalPhotoFiles.value = []
    additionalPhotoList.value = []
  }

  const cleanupNewPhotos = () => {
    newAdditionalPhotoFiles.value.forEach((photo) => {
      if (photo.preview && photo.preview.startsWith('blob:')) {
        URL.revokeObjectURL(photo.preview)
      }
    })
  }

  return {
    existingAdditionalPhotos,
    newAdditionalPhotoFiles,
    additionalPhotoList,
    handleAdditionalPhotoChange,
    handleAdditionalPhotoRemove,
    handleRemoveNewPhoto,
    handleRemoveExistingPhoto,
    handlePhotoLabelChange,
    handleAdditionalPhotosUpload,
    setExistingPhotos,
    resetNewPhotos,
    cleanupNewPhotos,
  }
}
