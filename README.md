# 拾谷 PickGoods 前端

<div align="center">

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![Vue](https://img.shields.io/badge/Vue-3.5.26-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**专业的二次元收藏品数字化资产管理平台前端实现**

[快速开始](#-快速开始) • [功能特性](docs/FEATURES.md) • [开发指南](docs/DEVELOPMENT.md) • [部署说明](docs/DEPLOYMENT.md)

</div>

---

## 📖 项目简介

**拾谷 PickGoods** 是一个面向二次元收藏爱好者（谷子玩家）的专业数字化资产管理平台。系统致力于将物理收藏品转化为数字化资产，提供"云展柜式"的检索体验与高效的收纳管理能力。

### 核心定位

- **数字化收纳**：将实体手办、周边等收藏品完整数字化，建立个人收藏档案
- **智能检索**：300ms 防抖搜索 + 多维筛选，快速定位目标藏品
- **数据导入**：支持从 Bangumi 批量导入 IP 作品与角色信息，大幅提升录入效率
- **跨端适配**：完整支持 PC 端与移动端，随时随地管理收藏

### 核心价值

| 价值点 | 说明 |
|--------|------|
| 🎯 **精准检索** | 支持 IP、角色、品类、状态、位置等多维度筛选，300ms 防抖优化搜索体验 |
| 📦 **层级管理** | 树形结构管理收纳位置，清晰展示藏品分布情况 |
| 🚀 **高效录入** | BGM 批量导入、表单联动校验、图片上传一体化，提升录入效率 80%+ |
| 🔄 **灵活排序** | 支持谷子前移/后移排序，品类/IP 拖拽排序，自定义展示顺序 |
| � **多维分类** | 支持品类（树形）与主题（集合）双重分类，灵活管理不同维度的收藏 |
| � **视觉体验** | 香槟镭射主题设计，支持主题图片展示，精致的交互细节，流畅的动画效果 |
| 📱 **响应式设计** | PC 端表格展示，移动端卡片展示，完美适配不同设备 |

### 界面总览

<div align="center">

<div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">

<div>

![PC端首页展示](screenshot/PC端首页展示.jpeg)

*PC 端云展柜主界面*

</div>

<div>

![移动端首页展示](screenshot/移动端首页展示.jpeg)

*移动端云展柜主界面*

</div>

</div>

</div>

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 20.19.0 或 ≥ 22.12.0 | 推荐使用 LTS 版本 |
| pnpm | ≥ 9.0.0 | 项目已锁定 packageManager: pnpm@9.0.0 |
| 浏览器 | 支持 ES2020+ | Chrome 90+、Firefox 88+、Safari 14+、Edge 90+ |

### 安装与运行

```bash
# 1. 克隆项目
git clone <repository-url>
cd PickGoods_Frontend

# 2. 安装依赖
pnpm install

# 3. 配置环境变量（如需要）
# 创建 .env 文件，配置后端 API 地址
# VITE_API_BASE_URL=http://127.0.0.1:8000

# 4. 启动开发服务器
pnpm dev
# 访问 http://localhost:5173
```

### 开发命令

```bash
# 开发
pnpm dev              # 启动开发服务器（热更新）

# 构建
pnpm build            # 生产环境构建（包含类型检查）
pnpm build-only       # 仅构建，不进行类型检查
pnpm preview          # 预览生产构建结果

# 代码质量
pnpm type-check       # TypeScript 类型检查
pnpm lint             # ESLint 代码检查与自动修复

# 测试
pnpm test:unit        # 运行单元测试（Vitest）

# 部署
pnpm run deploy       # 构建并使用 deploy.cjs 一键上传 dist 到预配置服务器
```

### 项目配置

#### 环境变量

创建 `.env` 文件：

```env
# 后端 API 基础地址
VITE_API_BASE_URL=http://127.0.0.1:8000
```

> **注意**：开发环境下，`vite.config.ts` 已配置代理，将 `/api` 请求转发至 `http://127.0.0.1:8000`。生产环境请配置实际的后端服务地址。

---

## 📁 项目结构

```
PickGoods_Frontend/
├── public/              # 静态资源目录
├── src/
│   ├── api/            # API 接口层
│   ├── components/     # 公共组件库
│   ├── stores/         # Pinia 状态管理
│   ├── styles/         # 样式与主题
│   ├── utils/          # 工具函数
│   ├── views/          # 业务页面视图
│   ├── router/         # 路由配置
│   ├── __tests__/      # 单元测试
│   ├── App.vue         # 应用根组件
│   └── main.ts         # 应用入口文件
├── docs/               # 项目文档
├── dist/               # 构建输出目录
└── README.md           # 项目说明文档（本文件）
```

### 目录说明

| 目录 | 职责 | 说明 |
|------|------|------|
| `api/` | API 层 | 统一封装后端接口，提供类型安全的调用方式 |
| `components/` | 组件库 | 可复用的 UI 组件，遵循单一职责原则 |
| `stores/` | 状态管理 | Pinia stores，管理全局状态（搜索、筛选、位置树等） |
| `views/` | 页面视图 | 业务页面组件，组合使用公共组件 |
| `utils/` | 工具函数 | 通用工具函数（HTTP 请求封装、树结构转换等） |
| `styles/` | 样式文件 | 主题变量、全局样式、Element Plus 主题定制 |
| `router/` | 路由配置 | Vue Router 路由定义与导航守卫 |

---

## ✨ 功能特性概览

| 功能模块 | 说明 | 详细文档 |
|---------|------|----------|
| 🎨 **云展柜** | 整合「展柜」「谷仓」「统计看板」三大子模块的核心首页 | [功能特性文档](docs/FEATURES.md#-云展柜cloud-showcase) |
| ├─ 展柜 | 云展柜展示与编排，支持多展柜管理与自定义布局 | - |
| ├─ 谷仓 | 智能搜索、多维筛选、响应式列表、排序功能 | - |
| └─ 统计看板 | 资产规模与结构可视化统计（状态/官谷/IP/品类等分布） | [统计看板](docs/FEATURES.md#-统计看板stats-dashboard) |
| 📍 **位置管理** | 树形导航、位置 CRUD、层级管理 | [功能特性文档](docs/FEATURES.md#-位置管理location-management) |
| 📝 **资产录入** | 表单校验、图片上传、联动选择、主题关联 | [功能特性文档](docs/FEATURES.md#-资产录入goods-form) |
| 🎭 **IP与角色管理** | BGM 批量导入、关键词管理、拖拽排序 | [功能特性文档](docs/FEATURES.md#-ip作品与角色管理ip--character-management) |
| 📦 **品类管理** | 品类 CRUD、搜索功能、拖拽排序 | [功能特性文档](docs/FEATURES.md#-品类管理category-management) |
| 🌈 **主题管理** | 主题 CRUD、附加图片展示 | [功能特性文档](docs/FEATURES.md#-主题管理theme-management) |
| ⚙️ **设置** | 后端地址配置、持久化存储、身份认证 | [功能特性文档](docs/FEATURES.md#️-设置settings) |
| 📱 **移动端优化** | 原生相机、手势优化、安全区域适配 | [移动端开发文档](docs/MOBILE_DEVELOPMENT.md) |

> 完整的功能特性说明请查看：[功能特性文档](docs/FEATURES.md)

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| **Vue** | 3.5.26 | 渐进式 JavaScript 框架，采用 Composition API |
| **TypeScript** | 5.9.3 | 类型安全的 JavaScript 超集 |
| **Vite** | 7.3.0 | 新一代前端构建工具 |

### 主要依赖

| 技术 | 版本 | 用途 |
|------|------|------|
| **Pinia** | 3.0.4 | Vue 官方推荐的状态管理库 |
| **Vue Router** | 4.6.4 | Vue 官方路由管理器 |
| **Element Plus** | 2.8.8 | 企业级 UI 组件库 |
| **Axios** | 1.7.7 | HTTP 客户端 |
| **lodash-es** | 4.17.21 | 实用工具库（防抖、节流等） |
| **vue-picture-cropper** | 0.7.0 | 图片裁剪组件 |
| **sortablejs** | 1.15.3 | 拖拽排序库（品类管理） |

### 技术特点

- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **组件化设计**：高度可复用的组件
- ✅ **性能优化**：防抖搜索、懒加载、响应式设计
- ✅ **错误处理**：统一的错误处理机制（429 限流、409 冲突等）
- ✅ **开发体验**：热更新、类型提示、代码检查

---

## 📚 项目文档

| 文档 | 说明 |
|------|------|
| [功能特性](docs/FEATURES.md) | 详细的功能特性说明和使用指南 |
| [开发指南](docs/DEVELOPMENT.md) | 面向不同角色的开发指导 |
| [部署说明](docs/DEPLOYMENT.md) | 构建和部署指南 |
| [移动端开发](docs/MOBILE_DEVELOPMENT.md) | Capacitor 移动端开发完整指南 |
| [API 接口](docs/API.md) | API 接口文档和类型定义 |
| [设计规范](docs/STYLING.md) | 主题配置和样式定制 |
| [常见问题](docs/TROUBLESHOOTING.md) | 故障排除和问题解答 |

---

## 📊 性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| **首屏加载** | ≤ 1.5s | 内网环境，位置树 + 首屏列表 |
| **搜索响应** | ≤ 300ms | 防抖延迟 + API 响应时间 |
| **页面切换** | ≤ 500ms | 路由切换 + 数据加载 |
| **图片加载** | 懒加载 | 滚动时加载图片，优化首屏性能 |

---

## 🐛 常见问题

### Q1: 开发环境下 API 请求跨域？

**A**: 开发服务器已配置代理，无需手动处理跨域。如仍有问题，检查 `vite.config.ts` 中的代理配置。

### Q2: 生产环境 API 请求失败？

**A**: 检查环境变量 `VITE_API_BASE_URL` 是否正确配置，或检查后端 CORS 配置。

### Q3: 构建失败，类型检查错误？

**A**: 运行 `pnpm type-check` 查看具体错误，修复类型问题后再构建。或使用 `pnpm build-only` 跳过类型检查。

> 更多常见问题请查看：[常见问题文档](docs/TROUBLESHOOTING.md)

---

## 🔗 相关链接

- **后端仓库**：`ShiGu_backend` - Django REST 后端实现
  - 仓库地址：`https://github.com/DICKQI/ShiGu_backend`

### 技术文档

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/zh/)
- [Vite 官方文档](https://cn.vitejs.dev/)
- [Element Plus 官方文档](https://element-plus.org/zh-CN/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [Vue Router 官方文档](https://router.vuejs.org/zh/)
- [Capacitor 官方文档](https://capacitorjs.com/docs)

---

## 📄 License

本项目采用 [MIT License](LICENSE) 开源协议。

---

<div align="center">

**拾谷 PickGoods** - 让收藏管理更简单、更高效 🎯

Made with ❤️ by PickGoods Team

</div>