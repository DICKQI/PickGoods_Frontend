import { ref, computed, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getIPList, getCharacterList, getCategoryList, getThemeList, createTheme } from '@/api/metadata'
import type { IP, Character, Category, Theme } from '@/api/types'

interface FormDataShape {
  ip: number | undefined
  characters: number[]
  category: number | undefined
  theme: number | string | undefined | null
  notes: string
}

export function useGoodsFormMetadata(formData: Ref<FormDataShape>) {
  const ipOptions = ref<IP[]>([])
  const characters = ref<Character[]>([])
  const categoryOptions = ref<Category[]>([])
  const allThemes = ref<Theme[]>([])
  const themeOptions = ref<Theme[]>([])

  const filteredCharacters = computed(() => {
    if (!formData.value.ip) return []
    return characters.value.filter((char) => char.ip.id === formData.value.ip)
  })

  const buildCategoryTree = (list: Category[]) => {
    const map = new Map<number, Category & { children: Category[] }>()
    list.forEach((item) => map.set(item.id, { ...item, children: [] }))
    const roots: Category[] = []
    map.forEach((node) => {
      if (node.parent !== null && map.has(node.parent)) {
        map.get(node.parent)!.children!.push(node)
      } else {
        roots.push(node)
      }
    })
    const sortTree = (nodes: Category[]) => {
      nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
      nodes.forEach((n) => n.children && sortTree(n.children))
    }
    sortTree(roots)
    return roots
  }

  const categoryTreeOptions = computed(() => buildCategoryTree(categoryOptions.value))
  const selectedCategory = computed(() => categoryOptions.value.find((c) => c.id === formData.value.category))

  const handleIpChange = () => {
    formData.value.characters = []
  }

  // ── Theme management ──
  const pendingThemeName = ref<string | null>(null)

  const handleThemeChange = (value: number | string | null) => {
    if (value === null) {
      formData.value.theme = null
      pendingThemeName.value = null
      return
    }
    if (typeof value === 'string') {
      pendingThemeName.value = value.trim()
      return
    }
    formData.value.theme = value
    pendingThemeName.value = null

    const selectedTheme = allThemes.value.find(theme => theme.id === value)
    if (selectedTheme && selectedTheme.description) {
      formData.value.notes = selectedTheme.description
    }
  }

  const handleThemeCreate = async (themeName: string) => {
    if (!themeName || !themeName.trim()) {
      ElMessage.warning('主题名称不能为空')
      formData.value.theme = null
      pendingThemeName.value = null
      return
    }

    const trimmedName = themeName.trim()

    try {
      const existingTheme = allThemes.value.find(t => t.name === trimmedName)
      if (existingTheme) {
        formData.value.theme = existingTheme.id
        pendingThemeName.value = null
        ElMessage.info('该主题已存在，已自动选择')
        return
      }

      const newTheme = await createTheme({ name: trimmedName })
      allThemes.value.push(newTheme)
      themeOptions.value = allThemes.value
      formData.value.theme = newTheme.id
      pendingThemeName.value = null
      ElMessage.success('主题创建成功')
    } catch (err: any) {
      ElMessage.error('创建主题失败：' + (err.message || '未知错误'))
      console.error('创建主题失败:', err)
    }
  }

  const ensureThemeCreated = async (): Promise<number | null> => {
    if (typeof formData.value.theme === 'number') {
      return formData.value.theme
    }

    const themeNameToCreate = typeof formData.value.theme === 'string'
      ? formData.value.theme.trim()
      : (pendingThemeName.value ? pendingThemeName.value.trim() : null)

    if (themeNameToCreate) {
      try {
        const existingTheme = allThemes.value.find(t => t.name === themeNameToCreate)
        if (existingTheme) {
          formData.value.theme = existingTheme.id
          pendingThemeName.value = null
          return existingTheme.id
        }

        const newTheme = await createTheme({ name: themeNameToCreate })
        allThemes.value.push(newTheme)
        themeOptions.value = allThemes.value
        formData.value.theme = newTheme.id
        pendingThemeName.value = null
        return newTheme.id
      } catch (err: any) {
        ElMessage.error('创建主题失败：' + (err.message || '未知错误'))
        throw err
      }
    }

    return null
  }

  const loadMetadata = async () => {
    const [ipList, characterList, categoryList, themeList] = await Promise.all([
      getIPList(),
      getCharacterList(),
      getCategoryList(),
      getThemeList(),
    ])
    ipOptions.value = ipList
    characters.value = characterList
    categoryOptions.value = categoryList
    allThemes.value = themeList
    themeOptions.value = themeList
  }

  return {
    ipOptions,
    characters,
    categoryOptions,
    themeOptions,
    allThemes,
    filteredCharacters,
    categoryTreeOptions,
    selectedCategory,
    pendingThemeName,
    handleIpChange,
    handleThemeChange,
    handleThemeCreate,
    ensureThemeCreated,
    loadMetadata,
  }
}
