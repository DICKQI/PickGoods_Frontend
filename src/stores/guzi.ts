import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getGoodsList, getGoodsDetail, getSimilarRandomGoodsList } from '@/api/goods'
import type { GoodsListItem, GoodsDetail, GoodsSearchParams } from '@/api/types'
import { debounce } from 'lodash-es'

export const useGuziStore = defineStore('guzi', () => {
  // 状态
  const guziList = ref<GoodsListItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<GoodsSearchParams>({})
  const viewMode = ref<'standard' | 'similar'>('standard')
  const pagination = ref({
    count: 0,
    page: 1,
    page_size: 18, // 与后端 API 默认值保持一致
    next: null as number | null,
    previous: null as number | null,
  })

  // 内部搜索函数（不带防抖）
  const _searchGuzi = async (params?: GoodsSearchParams, keepPage?: boolean) => {
    if (loading.value) return

    loading.value = true
    error.value = null

    // 检查是否有除 page 之外的筛选条件变化
    const hasFilterChange = params && Object.keys(params).some(key => key !== 'page')
    
    // 如果筛选条件改变（非页码改变），重置到第一页
    if (hasFilterChange && !keepPage) {
      pagination.value.page = 1
    }

    // 更新筛选条件（排除 page，page 由分页逻辑单独处理）
    if (params) {
      const { page, ...filterParams } = params
      filters.value = { ...filters.value, ...filterParams }
    }

    try {
      const response = viewMode.value === 'similar'
        ? await getSimilarRandomGoodsList({
            ...filters.value,
            page: pagination.value.page,
            page_size: pagination.value.page_size,
          })
        : await getGoodsList({
            ...filters.value,
            page: pagination.value.page,
            page_size: pagination.value.page_size,
          })

      // 统一处理为扁平列表格式
      let results: GoodsListItem[] = []
      let count = 0
      let page = pagination.value.page
      let page_size = pagination.value.page_size
      let next: number | null = null
      let previous: number | null = null

      // 如果响应本身就是数组（某些情况下可能直接返回数组，向后兼容）
      if (Array.isArray(response)) {
        results = response
        count = response.length
      }
      // 如果响应是分页对象
      else if (response && typeof response === 'object') {
        const responseObj = response as any
        // 检查是否有 results 字段（新格式）
        if ('results' in responseObj) {
          results = Array.isArray(responseObj.results) ? responseObj.results : []
          count = typeof responseObj.count === 'number' ? responseObj.count : results.length
          // 新格式：page、page_size、next、previous 都是数字或 null
          page = typeof responseObj.page === 'number' ? responseObj.page : pagination.value.page
          // page_size 以本地为准（后端可能不回传正确的值），不信任响应
          page_size = pagination.value.page_size
          next = typeof responseObj.next === 'number' ? responseObj.next : (responseObj.next === null ? null : pagination.value.next)
          previous = typeof responseObj.previous === 'number' ? responseObj.previous : (responseObj.previous === null ? null : pagination.value.previous)
        }
        // 如果没有 results 字段，但响应是对象，可能是直接返回的数据
        else {
          // 如果对象有 id 字段，可能是单个对象，包装成数组
          if (responseObj.id) {
            results = [responseObj]
            count = 1
          } else {
            results = []
            count = 0
          }
        }
      }
      // 其他情况
      else {
        results = []
        count = 0
      }

      // 更新数据
      guziList.value = results
      pagination.value = {
        count,
        page,
        page_size,
        next,
        previous,
      }

      // 如果结果为空，清除错误信息（可能是正常的空结果）
      if (guziList.value.length === 0 && !error.value) {
        // 空结果不是错误，不需要设置错误信息
      }
    } catch (err: any) {
      error.value = err.message || '搜索失败'
      guziList.value = []
    } finally {
      loading.value = false
    }
  }

  // 搜索谷子（带防抖，用于用户交互）
  const searchGuzi = debounce(_searchGuzi, 300)

  // 获取谷子详情
  async function fetchGoodsDetail(id: string): Promise<GoodsDetail | null> {
    try {
      const data = await getGoodsDetail(id)
      return data
    } catch (err: any) {
      error.value = err.message || '获取详情失败'
      return null
    }
  }

  // 重置筛选条件
  function resetFilters() {
    filters.value = {}
    pagination.value.page = 1
    _searchGuzi()
  }

  // 设置页码
  function setPage(page: number) {
    pagination.value.page = page
    _searchGuzi(undefined, true) // keepPage = true，保持当前页码
  }

  // 设置每页数量
  function setPageSize(size: number) {
    pagination.value.page_size = size
    pagination.value.page = 1
    _searchGuzi()
  }

  // 立即搜索（用于首次加载）
  function searchGuziImmediate(params?: GoodsSearchParams) {
    return _searchGuzi(params)
  }

  // 设置视图模式
  function setViewMode(mode: 'standard' | 'similar') {
    viewMode.value = mode
    pagination.value.page = 1  // 切换视图时重置到第一页
    _searchGuzi()
  }

  return {
    guziList,
    loading,
    error,
    filters,
    viewMode,
    pagination,
    searchGuzi,
    searchGuziImmediate,
    fetchGoodsDetail,
    resetFilters,
    setPage,
    setPageSize,
    setViewMode,
  }
})

