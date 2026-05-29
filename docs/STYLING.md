# 设计规范与主题配置

本文档介绍了拾谷 PickGoods 的设计规范、主题配置和样式定制方法。

## 主题风格：香槟镭射（Champagne Laser）

| 颜色 | 色值 | 用途 |
|------|------|------|
| **主色** | `#D4AF37`（香槟金） | 边框高亮、图标、激活态指示器、标题 |
| **辅助色** | `#F5F5F7`（明亮灰） | 页面 & 卡片背景、输入框底色 |
| **点缀色** | `#A29BFE`（镭射紫） | 主要按钮（Element Plus primary）、渐变效果、悬浮操作 |

### 色彩衍生

每种主题色提供 light / dark 衍生色用于 hover、active 等交互态：

| 变量 | 值 | 说明 |
|------|------|------|
| `--primary-gold-light` | `#EACDA3` | 金色浅色衍生 |
| `--primary-gold-dark` | `#B8941F` | 金色深色衍生 |
| `--accent-purple-light` | `#C4B5FD` | 紫色浅色衍生 |
| `--accent-purple-dark` | `#9980FA` | 紫色深色衍生 |

---

## 样式文件结构

样式文件集中在 `src/styles/` 下，入口为 `src/main.ts`：

```
src/
├── main.ts                          # 导入 index.css 和 element-plus-theme.css
└── styles/
    ├── variables.css                # CSS 自定义属性（设计令牌）
    ├── index.css                    # 全局重置 + 滚动条 + 通用工具类
    └── element-plus-theme.css       # Element Plus 组件主题覆盖
```

**导入顺序（`src/main.ts:13-14`）：**

```ts
import './styles/index.css'
import './styles/element-plus-theme.css'
```

`index.css` 通过 `@import './variables.css'` 引入变量，所有变量在全局生效。

---

## CSS 自定义属性参考

以下为 `src/styles/variables.css` 中定义的全部设计令牌：

### 颜色

| 变量名 | 值 | 说明 |
|--------|------|------|
| `--primary-gold` | `#D4AF37` | 主色 - 香槟金 |
| `--primary-gold-light` | `#EACDA3` | 主色浅色 |
| `--primary-gold-dark` | `#B8941F` | 主色深色 |
| `--secondary-gray` | `#F5F5F7` | 辅助色 - 明亮灰 |
| `--secondary-gray-dark` | `#E5E5E7` | 辅助色深色 |
| `--accent-purple` | `#A29BFE` | 点缀色 - 镭射紫 |
| `--accent-purple-light` | `#C4B5FD` | 点缀色浅色 |
| `--accent-purple-dark` | `#9980FA` | 点缀色深色 |
| `--bg-white` | `#FFFFFF` | 白色背景 |
| `--bg-gray` | `var(--secondary-gray)` | 灰色背景（引用辅助色） |
| `--text-dark` | `#333333` | 主要正文 |
| `--text-light` | `#888888` | 次要文字 |
| `--text-lighter` | `#CCCCCC` | 浅色/禁用文字 |
| `--border-color` | `rgba(212, 175, 55, 0.3)` | 默认边框（金色半透明） |
| `--border-color-active` | `var(--primary-gold)` | 激活态边框 |

### 圆角

| 变量名 | 值 | 说明 |
|--------|------|------|
| `--card-radius` | `20px` | 通用卡片圆角（`.card` 类使用） |
| `--button-radius` | `8px` | 按钮 / 输入框圆角 |

> 组件中实际使用的圆角值还包括 `4px`（标签/滚动条）、`6px`（标签标签）、`10px`（预览区）、`12px`（二级卡片）、`16px`（商品卡片）、`50px`（Toast 胶囊）、`999px`（状态分段/胶囊按钮）。这些值目前通过组件 scoped 样式硬编码。

### 阴影

| 变量名 | 值 | 说明 |
|--------|------|------|
| `--shadow-sm` | `0 2px 10px rgba(0, 0, 0, 0.05)` | 默认卡片阴影 |
| `--shadow-md` | `0 4px 15px rgba(212, 175, 55, 0.15)` | 悬停态阴影（金色调） |
| `--shadow-lg` | `0 8px 20px rgba(212, 175, 55, 0.25)` | 强阴影（金色调） |
| `--shadow-purple` | `0 4px 15px rgba(162, 155, 254, 0.5)` | 紫色阴影（强调元素） |

### 过渡动画

| 变量名 | 值 | 说明 |
|--------|------|------|
| `--transition-fast` | `0.2s ease` | 快速过渡（hover 状态） |
| `--transition-normal` | `0.3s ease` | 常规过渡（卡片展开等） |
| `--transition-slow` | `0.5s ease` | 慢速过渡（面板出入等） |

---

## 全局样式（`src/styles/index.css`）

### 全局重置

- 全局 `box-sizing: border-box`
- `<html>` / `<body>` 禁用移动端弹性滚动（`overscroll-behavior: none`）
- 全站链接去掉默认下划线

### 自定义滚动条

- 宽度 `8px`，轨道颜色 `--bg-gray`，滑块颜色 `--border-color`（半透明金），hover 变为 `--primary-gold`
- 滑块圆角 `4px`

### 通用工具类

| 类名 | 说明 |
|------|------|
| `.card` | 通用卡片：白色背景 + `--card-radius` + 金色边框 + 轻微阴影。悬停时阴影加深、上浮 2px |
| `.gold-gradient-text` | 香槟金渐变文字（45deg，`--primary-gold` → `--primary-gold-light`） |
| `.laser-gradient` | 镭射紫渐变背景（135deg，`--accent-purple` → `--accent-purple-light`） |
| `.metal-border` | 金属边框：金色半透明边框 + `::before` 伪元素顶部金色渐变发丝线 |

### 焦点轮廓重置

全局移除 Element Plus 组件（el-button、el-menu-item、el-pagination、el-tree-node 等）和其他可点击元素的 `outline` 和 `-webkit-tap-highlight-color`，实现无焦点环的洁净视觉风格。

---

## Element Plus 主题定制（`src/styles/element-plus-theme.css`）

### 主色覆盖

```css
--el-color-primary: #D4AF37;        /* 香槟金 */
--el-color-primary-light-3: #EACDA3;
--el-color-primary-light-5: #F0D9B8;
--el-color-primary-light-7: #F5E6CC;
--el-color-primary-light-8: #F8EED9;
--el-color-primary-light-9: #FBF5E6;
--el-color-primary-dark-2: #B8941F;
```

> 注意：Element Plus 的 `el-color-primary` 设为金色，但 **主要按钮（`el-button--primary`）实际使用镭射紫 `--accent-purple`** 作为背景色，金色作为边框/文字激活色。这是有意为之的两层色彩体系。

### 组件定制清单

| 组件 | 定制要点 |
|------|----------|
| **Button** | 主按钮用 `--accent-purple` 背景，hover/focus 用 `--accent-purple-dark` |
| **Input** | 聚焦态 `box-shadow` 用 `--primary-gold` 内阴影 |
| **Card** | 边框改为 `--border-color`（半透明金色），标题改为金色加粗 |
| **Menu** | `is-active` 文字色改为 `--primary-gold` |
| **Tabs** | 激活条和激活标签文字色改为 `--primary-gold` |
| **Pagination** | 激活页码用 `--primary-gold` 背景 + 白色文字 |
| **Drawer** | 标题改为金色加粗 |
| **Tree** | 当前节点用 `rgba(212, 175, 55, 0.1)` 背景 |

### Toast（ElMessage）美化

Element Plus 的 ElMessage 全局定制为胶囊型通知：

- `border-radius: 50px` — 全圆角胶囊状
- `width: fit-content` + `max-width: 85vw` — 自适应宽度
- `backdrop-filter: blur(8px)` — 毛玻璃效果
- 阴影含金色调 + 通用阴影
- 各类型消息（info/success/warning/error）保持香槟风格配色
- 移动端（≤768px）顶部位置避让状态栏：`top: calc(70px + env(safe-area-inset-top))`

---

## 响应式设计

### 断点体系

| 断点 | 典型用途 |
|------|----------|
| `max-width: 768px` | 主要移动端适配（触摸区域、间距、字号调整） |
| `max-width: 480px` | 小屏手机（登录页面、统计仪表盘） |
| `max-width: 900px` | 统计图表布局折叠 |
| `min-width: 769px` | 桌面端布局展开 |
| `min-width: 1280px` | 筛选控件高度增加至 36px |

> 注意：断点值在全项目中有微小差异（`768px` vs `767px`），建议新代码统一使用 `768px` 作为移动/桌面分界。

### 移动端特性

- `touch-action: pan-y` — 仅允许垂直滚动
- `env(safe-area-inset-top)` — iOS 刘海屏安全区适配（状态栏、顶部 Toast）
- `env(safe-area-inset-bottom)` — iOS 底部安全区适配（底部导航、表单固定栏）
- `-webkit-tap-highlight-color: transparent` — 移除点击高亮
- 底部导航栏固定定位，z-index 1000

### 容器 / 视口布局模式

项目使用滚动区域（overflow-y: auto）+ 固定元素（sticky / fixed）组合实现多区域独立滚动：
- 顶部导航栏：sticky 定位
- 底部移动端导航：fixed 定位，`z-index: 1000`
- 内容区域：`height: calc(100% - ...)` 或 flex 布局自适应剩余高度

---

## 组件样式规范

### Scoped CSS

所有 `.vue` 组件的样式均使用 `<style scoped>` 作用域隔离，避免样式污染。

### 穿透选择器 `:deep()`

Element Plus 组件内部样式穿透统一使用 `:deep()` 语法（Vue 3 标准写法），全项目约 197 处。例如：

```css
.goods-form :deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}
```

> 注意：`FilterPanel.vue` 中有 4 处使用了旧版 `::v-deep` 语法，建议统一为 `:deep()`。

### JavaScript 读取 CSS 变量

部分组件通过 JavaScript 读取全局 CSS 变量用于图表等非 DOM 元素的主题化：

```ts
// StatsDashboard.vue — 用于 ECharts 主题配置
function getCssVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}
```

### Vue v-bind() 绑定 CSS

部分组件将 Vue 响应式数据直接绑定到 CSS 值：

```css
/* ImageCropper.vue */
.live-preview-wrap {
  --rounded-radius: v-bind('roundedRadius + "%"');
  border-radius: var(--rounded-radius);
}
```

---

## 组件内的局部 CSS 变量

部分组件定义了作用域内的独立 CSS 变量体系：

### ShowcaseManager.vue

使用 `--c-` 前缀的独立变量命名空间：

| 变量 | 值 | 对应全局变量 |
|------|------|------------|
| `--c-brand` | `#d4af37` | `--primary-gold` |
| `--c-accent` | `#a29bfe` | `--accent-purple` |
| `--c-accent-hover` | `#8e86fa` | — |
| `--c-bg` | `#f5f5f7` | `--secondary-gray` |
| `--c-text-main` | `#2c3e50` | 不同于全局 `--text-dark: #333333` |
| `--c-text-sub` | `#909399` | — |
| `--radius-lg` | `16px` | — |

### FilterPanel.vue

筛选控件和状态标签颜色：

| 变量 | 值 | 说明 |
|------|------|------|
| `--filter-control-height` | `32px`（桌面 36px） | 筛选控件高度 |
| `--filter-control-radius` | `8px` | 筛选控件圆角 |
| `--status-in-cabinet` | `#0ea371` | 柜内状态（翠绿） |
| `--status-outdoor` | `#d4a017` | 携带中状态（香槟金/橙黄） |
| `--status-sold` | `#6b7280` | 已售出状态（中性灰） |
| `--status-chip-bg` | `#f3f4f6` | 状态标签背景 |
| `--status-chip-border` | `#d1d5db` | 状态标签边框 |
| `--status-chip-text` | `#374151` | 状态标签文字 |

### Login.vue / GoodsCard.vue / LocationManagement.vue

这些组件在 scoped 样式中重新声明了颜色变量（`--color-brand`、`--primary-gold` 等），实际值与全局变量基本一致或仅有微小偏差。建议后续重构时统一引用全局变量。

---

## 动画

### 过渡变量

使用 `--transition-fast` / `--transition-normal` / `--transition-slow` 控制过渡时长和缓动函数。

### 关键帧动画

项目内 `@keyframes` 定义分散在各个组件中，无集中管理：

| 动画名 | 文件 | 说明 |
|--------|------|------|
| `rotate` | `Layout.vue`, `ThemeManagement.vue`, `IPCharacterManagement.vue` | 旋转动画（加载指示器、图标） |
| `statusDotPulse` | `FilterPanel.vue` | 状态点脉冲 |
| `slideIn` | `Login.vue` | 登录面板滑入 |
| `shimmer` | `ShowcasePreviewMosaic.vue` | 骨架屏闪烁 |
| `fadeIn` | `MobileBottomNav.vue` | 淡入 |

### 用户偏好

`FilterPanel.vue` 中有一处 `prefers-reduced-motion: reduce` 检查，建议在其他动画组件中同步添加。

---

## Z-Index 层级约定

| 层级 | z-index 值 | 典型用途 |
|------|-----------|----------|
| 默认 | `0` - `10` | 普通文档流元素、局部交互层 |
| 悬浮/遮罩下层 | `50` - `100` | 云展馆背景、浮层下层 |
| 固定元素 | `999` - `1000` | 固定操作栏、底部导航、sticky 工具栏 |
| 弹窗/浮层 | `2000` - `3000` | Drawer 背景遮罩、ImageCropper 弹窗 |
| 最高级 | `9999` | 水印图片全屏遮罩 |

> 这些 z-index 值分散在各组件中硬编码，未通过 CSS 变量集中管理。新增组件时参考上表选择合适的层级范围。

---

## 排版

### 字体族

`src/styles/index.css:19` 中定义全局字体族：

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

`Settings.vue` 中有局部 `font-family: monospace` 用于等宽文本展示。

### 字号

项目使用的字号范围为 `11px` - `28px`，无集中化的字体排版变量。常用字号：

| 字号 | 典型用途 |
|------|----------|
| `11px` - `12px` | 辅助文字、标签、占位符、元数据 |
| `13px` - `14px` | 正文、表单标签、按钮文字、列表项 |
| `16px` | 子标题、抽屉商品名、设置项主文字 |
| `18px` - `20px` | 区域标题、表单标题 |
| `22px` - `24px` | 页面标题、仪表盘主数值 |
| `26px` - `28px` | 主上传图标、少量特殊强调 |

> 后续可引入 `--font-size-xs` / `--font-size-sm` / `--font-size-base` / `--font-size-lg` / `--font-size-xl` 等变量统一管理。

### 字重

- 正文默认 `400`（浏览器默认）
- 标题/激活态 `500` - `600`
- 强调/价格 `600` - `700`（bold）

---

## 静态资源

| 目录 | 说明 |
|------|------|
| `public/` | 静态资源目录（图片、图标等），构建时直接复制到 `dist/` |
| `src/assets/` | 可通过模块系统导入的资源（建议使用相对路径） |

---

## 自定义主题

### 修改设计令牌

编辑 `src/styles/variables.css` 中的 CSS 变量即可更改全站主题色、圆角、阴影等。修改后全局自动生效。

### 定制 Element Plus 组件

编辑 `src/styles/element-plus-theme.css`，按组件类别覆盖 Element Plus 的 CSS 变量或组件样式类。

### 示例：更换主题色

```css
/* src/styles/variables.css */
:root {
  --primary-gold: #E07B39;         /* 改为暖橙 */
  --accent-purple: #5B8DEF;       /* 改为蓝色 */
}

/* src/styles/element-plus-theme.css */
:root {
  --el-color-primary: #E07B39;    /* 同步 EP 主色 */
}
```

---

## 已知注意事项

1. **变量命名不统一**：全局使用 `--text-dark` 风格，`ShowcaseManager.vue` 使用 `--c-text-main` 风格，`Login.vue` 使用 `--color-text-main` 风格。建议新代码统一使用全局变量名。
2. **断点边界值差异**：大部分组件使用 `768px`，个别组件使用 `767px`。当前两者在实践中等效，但建议统一为 `768px`。
3. **`::v-deep` 残留**：`FilterPanel.vue` 中 4 处 `::v-deep` 应迁移为 `:deep()`。
4. **无深色模式**：项目目前未实现深色主题，但全部使用 CSS 变量使得未来引入深色模式改造量较小。
5. **无排版/间距变量**：字体大小、行高、padding/margin 间距等目前硬编码在各组件中，建议后续统一抽取为 CSS 变量。
6. **z-index 无集中管理**：各组件自行定义 z-index 值，建议后续抽取到 `variables.css` 中统一维护。
7. **`.laser-gradient` 工具类未被使用**：已定义但未被任何模板引用，可根据需要删除或使用。
