import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createGoods } from '@/api/goods'
import type { GoodsCreateResponse, GoodsDuplicateCandidate, GoodsInput } from '@/api/types'

export function useDuplicateHandler(options: {
  onSuccess: (result: GoodsCreateResponse, mode: 'draft' | 'publish') => Promise<void>
}) {
  const duplicateDialogVisible = ref(false)
  const duplicateCandidates = ref<GoodsDuplicateCandidate[]>([])
  const duplicateSelectedId = ref<string | null>(null)
  const pendingCreatePayload = ref<GoodsInput | null>(null)
  const submitting = ref(false)

  const setDuplicateSelectedId = (id: string | null) => {
    duplicateSelectedId.value = id
  }

  const formatCandidateCreatedAt = (createdAt: string) => {
    if (!createdAt) return '-'
    try {
      const d = new Date(createdAt)
      return d.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return createdAt
    }
  }

  const openDuplicateDialog = (candidates: GoodsDuplicateCandidate[], payload: GoodsInput) => {
    pendingCreatePayload.value = { ...payload }
    duplicateCandidates.value = candidates
    duplicateSelectedId.value = null
    duplicateDialogVisible.value = true
  }

  const handleDuplicateMerge = async () => {
    const targetId = duplicateSelectedId.value
    const payload = pendingCreatePayload.value
    if (!targetId || !payload) {
      ElMessage.warning('请先选择要合并到的谷子')
      return
    }
    submitting.value = true
    try {
      const result = await createGoods({
        ...payload,
        merge_strategy: 'merge',
        merge_target_id: targetId,
      })
      duplicateDialogVisible.value = false
      duplicateCandidates.value = []
      duplicateSelectedId.value = null
      pendingCreatePayload.value = null
      await options.onSuccess(result, 'publish')
    } catch (err: any) {
      if (err.response?.status === 400) {
        const detail = err.response?.data?.detail
        ElMessage.warning(detail || err.message || '请求参数错误')
      } else {
        ElMessage.error(err.message || '操作失败')
      }
    } finally {
      submitting.value = false
    }
  }

  const handleDuplicateNew = async () => {
    const payload = pendingCreatePayload.value
    if (!payload) return
    submitting.value = true
    try {
      const result = await createGoods({ ...payload, merge_strategy: 'new' })
      duplicateDialogVisible.value = false
      duplicateCandidates.value = []
      duplicateSelectedId.value = null
      pendingCreatePayload.value = null
      await options.onSuccess(result, 'publish')
    } catch (err: any) {
      ElMessage.error(err.message || '创建失败')
    } finally {
      submitting.value = false
    }
  }

  const closeDuplicateDialog = () => {
    duplicateDialogVisible.value = false
    duplicateCandidates.value = []
    duplicateSelectedId.value = null
    pendingCreatePayload.value = null
  }

  return {
    duplicateDialogVisible,
    duplicateCandidates,
    duplicateSelectedId,
    pendingCreatePayload,
    submitting,
    setDuplicateSelectedId,
    formatCandidateCreatedAt,
    openDuplicateDialog,
    handleDuplicateMerge,
    handleDuplicateNew,
    closeDuplicateDialog,
  }
}
