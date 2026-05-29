import { ref, computed, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { createGoods, updateGoods, getGoodsDetail, uploadMainPhoto } from '@/api/goods'
import type { GoodsCreateResponse, GoodsDetail, GoodsInput, GoodsStatus } from '@/api/types'

interface GoodsFormData {
  name: string
  ip: number | undefined
  characters: number[]
  category: number | undefined
  theme: number | string | undefined | null
  status: GoodsStatus
  location: number | undefined
  quantity: number
  price: number | undefined
  purchase_date: string
  is_official: boolean
  notes: string
  main_photo: string
}

export interface GoodsFormDeps {
  formData: Ref<GoodsFormData>
  mainPhotoFile: Ref<File | null>
  newAdditionalPhotoFiles: Ref<any[]>
  ensureThemeCreated: () => Promise<number | null>
  handleAdditionalPhotosUpload: (id: string) => Promise<void>
  onDuplicateDetected: (candidates: any[], payload: GoodsInput) => void
}

const createDefaultFormData = (): GoodsFormData => ({
  name: '',
  ip: undefined,
  characters: [],
  category: undefined,
  theme: undefined,
  status: 'in_cabinet',
  location: undefined,
  quantity: 1,
  price: undefined,
  purchase_date: '',
  is_official: false,
  notes: '',
  main_photo: '',
})

export function useGoodsForm(deps: GoodsFormDeps) {
  const router = useRouter()
  const route = useRoute()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const isEditMode = computed(() => Boolean(route.params.id))
  const formTitle = computed(() => (route.params.id ? '编辑谷子' : '新增谷子'))

  const { formData, mainPhotoFile, newAdditionalPhotoFiles, ensureThemeCreated, handleAdditionalPhotosUpload, onDuplicateDetected } = deps

  const rules: FormRules = {
    name: [{ required: true, message: '请输入谷子名称', trigger: 'blur' }],
    ip: [{ required: true, message: '请选择IP', trigger: 'change' }],
    characters: [
      { required: true, message: '请至少选择一个角色', trigger: 'change' },
      { type: 'array', min: 1, message: '请至少选择一个角色', trigger: 'change' },
    ],
    category: [{ required: true, message: '请选择品类', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  }

  const runDraftValidation = () => {
    if (!formData.value.name?.trim()) {
      ElMessage.warning('草稿至少需要填写谷子名称')
      return false
    }
    if (!formData.value.ip) {
      ElMessage.warning('草稿至少需要选择IP')
      return false
    }
    if (!formData.value.category) {
      ElMessage.warning('草稿至少需要选择品类')
      return false
    }
    return true
  }

  const buildSubmitData = async (mode: 'draft' | 'publish'): Promise<GoodsInput> => {
    const themeId = await ensureThemeCreated()
    const { main_photo, theme, ...restForm } = formData.value
    const effectiveStatus: GoodsStatus =
      mode === 'draft'
        ? 'draft'
        : (restForm.status === 'draft' ? 'in_cabinet' : restForm.status)
    const submitData: GoodsInput = {
      ...restForm,
      status: effectiveStatus,
      price: restForm.price?.toString(),
      ip_id: restForm.ip!,
      character_ids: restForm.characters,
      category_id: restForm.category!,
      theme_id: themeId,
    }
    if (!restForm.purchase_date) {
      delete (submitData as any).purchase_date
    }
    return submitData
  }

  const onCreateOrMergeSuccess = async (
    result: GoodsCreateResponse,
    mode: 'draft' | 'publish',
  ) => {
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

  const submitByMode = async (mode: 'draft' | 'publish') => {
    if (!formRef.value) return

    if (mode === 'publish') {
      const valid = await formRef.value.validate().catch(() => false)
      if (!valid) return
    } else if (!runDraftValidation()) {
      return
    }

    submitting.value = true
    let submitData: GoodsInput | null = null
    try {
      submitData = await buildSubmitData(mode)

      if (route.params.id) {
        const id = route.params.id as string
        await updateGoods(id, submitData)

        if (mainPhotoFile.value) {
          await uploadMainPhoto(id, mainPhotoFile.value)
        }
        await handleAdditionalPhotosUpload(id)

        ElMessage.success(mode === 'draft' ? '草稿已保存' : '更新成功')
        router.push({ name: 'CloudShowcase' })
      } else {
        const createPayload: GoodsInput =
          mode === 'publish'
            ? { ...submitData, merge_strategy: 'auto' }
            : submitData
        const result = await createGoods(createPayload)
        await onCreateOrMergeSuccess(result, mode)
      }
    } catch (err: any) {
      if (mode === 'publish' && err.response?.status === 409) {
        const data = err.response?.data
        if (data?.code === 'goods_duplicate' && Array.isArray(data?.candidates) && submitData) {
          onDuplicateDetected(data.candidates, { ...submitData })
        } else {
          ElMessage.error(data?.detail || err.message || '提交失败')
        }
      } else if (err.response?.status === 400) {
        const detail = err.response?.data?.detail
        ElMessage.warning(detail || err.message || '请求参数错误')
      } else {
        ElMessage.error(err.message || '提交失败')
      }
    } finally {
      submitting.value = false
    }
  }

  const handleReset = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要重置表单吗？当前填写内容将恢复为进入页面时的状态（未保存的修改会丢失）。',
        '重置表单',
        { type: 'warning', confirmButtonText: '重置', cancelButtonText: '取消' },
      )
      formRef.value?.resetFields()
    } catch {
      /* user cancelled */
    }
  }

  const handleCancel = async () => {
    try {
      await ElMessageBox.confirm(
        '确定要离开吗？未保存的修改将丢失。',
        '离开页面',
        { type: 'warning', confirmButtonText: '离开', cancelButtonText: '留在页面' },
      )
      router.back()
    } catch {
      /* user cancelled */
    }
  }

  const handleMobileMoreCommand = (command: string) => {
    if (command === 'cancel') void handleCancel()
    else if (command === 'reset') void handleReset()
  }

  const goDrafts = () => {
    router.push({ name: 'GoodsDrafts' })
  }

  const loadEditData = async (setFormData: (data: GoodsDetail) => void) => {
    if (!route.params.id) return
    try {
      const data = await getGoodsDetail(route.params.id as string)
      setFormData(data)
    } catch (err) {
      ElMessage.error('加载数据失败')
    }
  }

  return {
    formRef,
    submitting,
    isEditMode,
    formTitle,
    rules,
    submitByMode,
    handleReset,
    handleCancel,
    handleMobileMoreCommand,
    goDrafts,
    loadEditData,
    createDefaultFormData,
  }
}
