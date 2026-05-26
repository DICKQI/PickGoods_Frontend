<template>
  <div class="goods-form" :class="{ 'goods-form--mobile-dock': isMobile }">
    <div class="goods-form-header" :class="{ 'goods-form-header--mobile': isMobile }">
      <div class="goods-form-title">
        {{ formTitle }}
      </div>
      <div v-if="isMobile" class="goods-form-header-actions">
        <el-button text type="primary" class="header-drafts-btn" @click="goDrafts">
          草稿箱
        </el-button>
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

    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        label-position="top"
        class="goods-el-form"
      >
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
                <el-select
                  v-model="formData.ip"
                  placeholder="选择IP"
                  filterable
                  @change="handleIpChange"
                  style="width: 100%"
                >
                  <el-option
                    v-for="ip in ipOptions"
                    :key="ip.id"
                    :label="ip.name"
                    :value="ip.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="角色" prop="characters" class="is-required">
                <el-select
                  v-model="formData.characters"
                  placeholder="选择角色（可多选）"
                  filterable
                  multiple
                  :disabled="!formData.ip"
                  style="width: 100%"
                >
                  <el-option
                    v-for="char in filteredCharacters"
                    :key="char.id"
                    :label="char.name"
                    :value="char.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="品类" prop="category" class="is-required">
                <el-tree-select
                  v-model="formData.category"
                  :data="categoryTreeOptions"
                  :props="{ label: 'name', value: 'id', children: 'children' }"
                  placeholder="选择品类"
                  style="width: 100%"
                  clearable
                  filterable
                  check-strictly
                />
                <div v-if="selectedCategory" class="category-chip">
                  <span
                    class="color-dot"
                    v-if="selectedCategory.color_tag"
                    :style="{ backgroundColor: selectedCategory.color_tag || '#a3a3a3' }"
                  ></span>
                  <span class="chip-text">{{ selectedCategory.path_name || selectedCategory.name }}</span>
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="主题">
                <el-select
                  v-model="formData.theme"
                  placeholder="选择或创建主题"
                  filterable
                  allow-create
                  default-first-option
                  :reserve-keyword="true"
                  @change="handleThemeChange"
                  @create="handleThemeCreate"
                  style="width: 100%"
                  clearable
                >
                  <el-option
                    v-for="theme in themeOptions"
                    :key="theme.id"
                    :label="theme.name"
                    :value="theme.id"
                  />
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
                <el-tree-select
                  v-model="formData.location"
                  :data="locationStore.treeData"
                  placeholder="选择位置"
                  clearable
                  style="width: 100%"
                  :props="{ label: 'label', value: 'id', children: 'children' }"
                  check-strictly
                />
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
                <div class="field-with-icon">
                  <span class="field-icon">📦</span>
                  <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="12" :sm="12">
              <el-form-item label="购入价格">
                <div class="field-with-icon">
                  <span class="field-icon">￥</span>
                  <el-input-number
                    v-model="formData.price"
                    :precision="2"
                    :min="0"
                    placeholder="请输入价格"
                    style="width: 100%"
                  />
                </div>
              </el-form-item>
            </el-col>

            <el-col :xs="12" :sm="12">
              <el-form-item label="入手日期">
                <div class="field-with-icon">
                  <span class="field-icon">📅</span>
                  <el-date-picker
                    v-model="formData.purchase_date"
                    type="date"
                    placeholder="选择日期"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </div>
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
                  <el-upload
                    v-model:file-list="mainPhotoList"
                    list-type="picture-card"
                    :auto-upload="false"
                    :limit="1"
                    :on-change="handleMainPhotoChange"
                    :on-remove="handleMainPhotoRemove"
                    :on-preview="handlePictureCardPreview"
                    :http-request="dummyUpload"
                    :show-file-list="true"
                    class="main-photo-uploader"
                    :class="{ 'hide-upload-trigger': mainPhotoList.length >= 1 }"
                    :open-file-dialog-on-click="!isMobileUploadActionSheet"
                    accept="image/*"
                  >
                    <template #trigger>
                      <!-- 移动端（APP/H5）：点击 + 弹出“拍照/相册”；桌面端保持原生文件选择 -->
                      <span
                        v-if="mainPhotoList.length < 1 && isMobileUploadActionSheet"
                        class="main-photo-trigger"
                        @click.stop.prevent="chooseMainPhotoSource"
                      >
                        <el-icon><Plus /></el-icon>
                      </span>
                      <el-icon v-else-if="mainPhotoList.length < 1"><Plus /></el-icon>
                    </template>
                  </el-upload>
                </div>

                <!-- 编辑模式：允许对原主图重新裁切/编辑 -->
                <div v-if="formData.main_photo || mainPhotoList.length" class="main-photo-actions">
                  <el-button size="small" :icon="Edit" @click="handleReEditMainPhoto">重新编辑主图</el-button>
                </div>

                <!-- H5：分别用 capture / 非 capture 触发“拍照/相册”（隐藏 input，通过 + 号触发） -->
                <input
                  v-if="isH5Mobile"
                  ref="cameraInputRef"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style="display: none"
                  @change="handleH5MainPhotoPicked"
                />
                <input
                  v-if="isH5Mobile"
                  ref="albumInputRef"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleH5MainPhotoPicked"
                />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="14" :md="16">
              <el-form-item label="附件图片">
                <div class="additional-photos-section">
                  <!-- 已有图片列表 -->
                  <div v-if="existingAdditionalPhotos.length > 0" class="existing-photos">
                    <div
                      v-for="(photo, index) in existingAdditionalPhotos"
                      :key="photo.id"
                      class="photo-item"
                    >
                      <el-image
                        :src="photo.image"
                        fit="cover"
                        class="photo-preview"
                        :preview-src-list="existingAdditionalPhotos.map(p => p.image)"
                        :initial-index="index"
                      >
                        <template #error>
                          <div class="image-error">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <div class="photo-actions">
                        <el-input
                          v-model="photo.label"
                          placeholder="图片标签（可选）"
                          size="small"
                          class="photo-label-input"
                          @blur="handlePhotoLabelChange(photo)"
                        />
                        <el-button
                          type="danger"
                          size="small"
                          :icon="Delete"
                          circle
                          @click="handleRemoveExistingPhoto(photo.id)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 新上传的图片列表 -->
                  <div v-if="newAdditionalPhotoFiles.length > 0" class="new-photos">
                    <div
                      v-for="(file, index) in newAdditionalPhotoFiles"
                      :key="index"
                      class="photo-item"
                    >
                      <el-image
                        :src="file.preview"
                        fit="cover"
                        class="photo-preview"
                        :preview-src-list="newAdditionalPhotoFiles.map(f => f.preview)"
                        :initial-index="index"
                      >
                        <template #error>
                          <div class="image-error">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                      <div class="photo-actions">
                        <el-input
                          v-model="file.label"
                          placeholder="图片标签（可选）"
                          size="small"
                          class="photo-label-input"
                        />
                        <el-button
                          type="danger"
                          size="small"
                          :icon="Delete"
                          circle
                          @click="handleRemoveNewPhoto(index)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 上传按钮 -->
                  <el-upload
                    v-model:file-list="additionalPhotoList"
                    list-type="picture-card"
                    :auto-upload="false"
                    :on-change="handleAdditionalPhotoChange"
                    :on-remove="handleAdditionalPhotoRemove"
                    :http-request="dummyUpload"
                    :show-file-list="false"
                    accept="image/*"
                    multiple
                    class="additional-photo-upload"
                  >
                    <template #trigger>
                      <el-icon><Plus /></el-icon>
                    </template>
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
                <el-input
                  v-model="formData.notes"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入备注信息"
                />
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
        <el-button class="sticky-btn sticky-btn--secondary" @click="goDrafts">
          草稿箱
        </el-button>
        <el-button class="sticky-btn sticky-btn--secondary" @click="submitByMode('draft')" :loading="submitting">
          保存草稿
        </el-button>
        <el-button
          type="primary"
          class="sticky-btn sticky-btn--primary"
          @click="submitByMode('publish')"
          :loading="submitting"
        >
          {{ isEditMode ? '保存修改' : '发布' }}
        </el-button>
      </div>
    </div>

    <!-- 移动端：底部渐变遮罩 + 双按钮直接悬浮（滑至页面底部附近时显示） -->
    <div
      v-if="isMobile"
      class="mobile-form-dock-wrap"
      :class="{ 'mobile-form-dock-wrap--visible': mobileFormDockVisible }"
      aria-label="表单主操作"
    >
      <div class="mobile-form-dock-stack">
        <!-- 全宽渐变铺在按钮背后，避免透出下方白色卡片形成「白条」 -->
        <div class="mobile-form-dock-fade" aria-hidden="true" />
        <div class="mobile-form-dock-actions">
          <el-button
            class="mobile-form-dock-btn mobile-form-dock-btn--draft"
            @click="submitByMode('draft')"
            :loading="submitting"
          >
            保存草稿
          </el-button>
          <el-button
            type="primary"
            class="mobile-form-dock-btn mobile-form-dock-btn--publish"
            @click="submitByMode('publish')"
            :loading="submitting"
          >
            {{ isEditMode ? '保存修改' : '发布' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 移动端主图选择抽屉 -->
    <el-drawer
      v-model="photoSourceDrawerVisible"
      direction="btt"
      :with-header="false"
      size="auto"
      class="photo-source-drawer"
    >
      <div class="action-sheet-content">
        <div class="sheet-header">
          选择主图
        </div>
        <div class="sheet-menu">
          <div class="sheet-item" @click="handlePhotoFromCamera">
            <el-icon><CameraIcon /></el-icon> 拍照
          </div>
          <div class="sheet-item" @click="handlePhotoFromAlbum">
            <el-icon><Picture /></el-icon> 相册选择
          </div>
        </div>
        <div class="sheet-cancel" @click="photoSourceDrawerVisible = false">取消</div>
      </div>
    </el-drawer>

    <!-- 图片裁切对话框 -->
    <el-dialog
      v-model="cropDialogVisible"
      :title="'编辑图片'"
      :width="isMobile ? '95%' : '1600px'"
      :close-on-click-modal="false"
      class="crop-dialog"
      @close="handleCropDialogClose"
    >
      <!-- 移动端：保持原有单列布局 -->
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

          <!-- 比例选择 -->
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

          <!-- 图像调整 -->
          <div class="image-filters">
            <div class="filters-header-row">
              <span class="filters-title">图像微调</span>
              <el-button
                class="filter-reset-btn"
                text
                circle
                :icon="RefreshLeft"
                @click="resetFilters"
              />
            </div>
            <div class="filter-item">
              <span class="filter-label">亮度</span>
              <el-slider
                v-model="filterState.brightness"
                :min="0"
                :max="200"
                :format-tooltip="(val: number) => val + '%'"
              />
              <span class="filter-value">{{ filterState.brightness }}%</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">对比度</span>
              <el-slider
                v-model="filterState.contrast"
                :min="0"
                :max="200"
                :format-tooltip="(val: number) => val + '%'"
              />
              <span class="filter-value">{{ filterState.contrast }}%</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">饱和度</span>
              <el-slider
                v-model="filterState.saturation"
                :min="0"
                :max="200"
                :format-tooltip="(val: number) => val + '%'"
              />
              <span class="filter-value">{{ filterState.saturation }}%</span>
            </div>
            <div class="filter-item">
              <span class="filter-label">旋转</span>
              <el-slider
                v-model="filterState.rotation"
                :min="-180"
                :max="180"
                :format-tooltip="(val: number) => `${val}°`"
              />
              <span class="filter-value">
                {{ filterState.rotation }}°
              </span>
            </div>
            <div class="perspective-panel">
              <div class="perspective-title">透视矫正</div>
              <div class="filter-item" style="margin-bottom: 10px;">
                <span class="filter-label">水平透视</span>
                <el-slider
                  v-model="filterState.perspectiveHorizontal"
                  :min="-100"
                  :max="100"
                  :format-tooltip="(val: number) => val + '%'"
                />
                <span class="filter-value">
                  {{ filterState.perspectiveHorizontal > 0 ? '+' : '' }}{{ filterState.perspectiveHorizontal }}%
                </span>
              </div>
              <div class="filter-item" style="margin-bottom: 0;">
                <span class="filter-label">垂直透视</span>
                <el-slider
                  v-model="filterState.perspectiveVertical"
                  :min="-100"
                  :max="100"
                  :format-tooltip="(val: number) => val + '%'"
                />
                <span class="filter-value">
                  {{ filterState.perspectiveVertical > 0 ? '+' : '' }}{{ filterState.perspectiveVertical }}%
                </span>
              </div>
            </div>
            <!-- HSL 调节 -->
            <div class="hsl-panel">
              <div class="hsl-header-row">
                <span class="hsl-title">HSL 调节</span>
              </div>
              <div class="hsl-color-tabs">
                <button
                  v-for="tab in hslColorTabs"
                  :key="tab.key"
                  type="button"
                  :class="['hsl-color-tab', `hsl-color-tab--${tab.key}`, { 'is-active': activeHslColor === tab.key }]"
                  @click="activeHslColor = tab.key"
                >
                  {{ tab.label }}
                </button>
                <el-button
                  class="hsl-color-reset-btn"
                  text
                  size="small"
                  @click="resetCurrentHslColor"
                >
                  重置当前色
                </el-button>
              </div>
              <div class="hsl-sliders">
                <div class="filter-item">
                  <span class="filter-label">色相 (°)</span>
                  <el-slider
                    v-model="filterState.hslAdjustments[activeHslColor].h"
                    :min="-180"
                    :max="180"
                    :format-tooltip="(val: number) => val + '°'"
                  />
                  <span class="filter-value">
                    {{ filterState.hslAdjustments[activeHslColor].h }}°
                  </span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">饱和度偏移</span>
                  <el-slider
                    v-model="filterState.hslAdjustments[activeHslColor].s"
                    :min="-100"
                    :max="100"
                    :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'"
                  />
                  <span class="filter-value">
                    {{ filterState.hslAdjustments[activeHslColor].s > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].s }}%
                  </span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">亮度偏移</span>
                  <el-slider
                    v-model="filterState.hslAdjustments[activeHslColor].l"
                    :min="-100"
                    :max="100"
                    :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'"
                  />
                  <span class="filter-value">
                    {{ filterState.hslAdjustments[activeHslColor].l > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].l }}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 圆角矩形设置（仅自由 / 1:1 比例可用） -->
          <div v-if="showRoundedControls" class="rounded-rect-settings">
            <div class="rounded-header-row">
              <span class="rounded-title">圆角矩形</span>
              <el-switch v-model="enableRoundedRect" size="small" />
            </div>
            <div class="rounded-radius-row" :class="{ 'is-disabled': !enableRoundedRect }">
              <span class="rounded-label">圆角大小</span>
              <el-slider
                v-model="roundedRadius"
                :min="0"
                :max="50"
                :disabled="!enableRoundedRect"
                :format-tooltip="(val: number) => val + '%'"
              />
              <span class="rounded-value">{{ roundedRadius }}%</span>
            </div>
          </div>

          <!-- 边距设置：输出尺寸不变，内容缩小居中，四周白色留边（所有比例可用） -->
          <div class="margin-settings">
            <div class="rounded-header-row">
              <span class="rounded-title">边距</span>
              <el-switch v-model="enableMargin" size="small" />
            </div>
            <div class="rounded-radius-row" :class="{ 'is-disabled': !enableMargin }">
              <span class="rounded-label">边距大小</span>
              <el-slider
                v-model="marginPercent"
                :min="0"
                :max="30"
                :disabled="!enableMargin"
                :format-tooltip="(val: number) => val + '%'"
              />
              <span class="rounded-value">{{ marginPercent }}%</span>
            </div>
          </div>

          <!-- 裁切组件 -->
          <div
            class="cropper-wrapper"
            :class="{
              'circle-crop':
                selectedAspectRatio === 'circle' || selectedAspectRatio.endsWith('-ellipse'),
              'rounded-rect-preview': showRoundedControls && enableRoundedRect
            }"
            :style="cropperWrapperStyle"
          >
            <vue-picture-cropper
              v-if="cropImageSrc"
              ref="pictureCropperRef"
              :key="`cropper-${selectedAspectRatio}`"
              :box-style="{
                width: '100%',
                height: '300px',
                backgroundColor: '#f8f8f8',
                margin: '0 auto'
              }"
              :img="cropImageSrc"
              :options="cropperOptions"
              :style="cropperStyle"
            />
          </div>

          <!-- 实时输出预览（低分辨率，尽量贴近最终导出顺序） -->
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

      <!-- PC 端：左右分栏布局 -->
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
            <!-- 左侧：编辑控制区 -->
            <div class="crop-left-panel">
              <!-- 比例选择 -->
              <div class="aspect-ratio-selector">
                <div class="ratio-label">选择比例</div>
                <div class="ratio-segmented">
                  <div class="ratio-segmented-track">
                    <div
                      class="ratio-segmented-thumb"
                      :style="{ '--active-index': aspectRatios.findIndex(r => r.value === selectedAspectRatio) }"
                    ></div>
                    <button
                      v-for="(ratio, idx) in aspectRatios"
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

              <!-- 图像调整 -->
              <div class="image-filters">
                <div class="filters-header-row">
                  <span class="filters-title">图像微调</span>
                  <el-button
                    class="filter-reset-btn"
                    text
                    circle
                    :icon="RefreshLeft"
                    @click="resetFilters"
                  />
                </div>
                <div class="filter-item">
                  <span class="filter-label">亮度</span>
                  <el-slider
                    v-model="filterState.brightness"
                    :min="0"
                    :max="200"
                    :format-tooltip="(val: number) => val + '%'"
                  />
                  <span class="filter-value">{{ filterState.brightness }}%</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">对比度</span>
                  <el-slider
                    v-model="filterState.contrast"
                    :min="0"
                    :max="200"
                    :format-tooltip="(val: number) => val + '%'"
                  />
                  <span class="filter-value">{{ filterState.contrast }}%</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">饱和度</span>
                  <el-slider
                    v-model="filterState.saturation"
                    :min="0"
                    :max="200"
                    :format-tooltip="(val: number) => val + '%'"
                  />
                  <span class="filter-value">{{ filterState.saturation }}%</span>
                </div>
                <div class="filter-item">
                  <span class="filter-label">旋转</span>
                  <el-slider
                    v-model="filterState.rotation"
                    :min="-180"
                    :max="180"
                    :format-tooltip="(val: number) => `${val}°`"
                  />
                  <span class="filter-value">
                    {{ filterState.rotation }}°
                  </span>
                </div>
                <div class="perspective-panel">
                  <div class="perspective-title">透视矫正</div>
                  <div class="filter-item" style="margin-bottom: 10px;">
                    <span class="filter-label">水平透视</span>
                    <el-slider
                      v-model="filterState.perspectiveHorizontal"
                      :min="-100"
                      :max="100"
                      :format-tooltip="(val: number) => val + '%'"
                    />
                    <span class="filter-value">
                      {{ filterState.perspectiveHorizontal > 0 ? '+' : '' }}{{ filterState.perspectiveHorizontal }}%
                    </span>
                  </div>
                  <div class="filter-item" style="margin-bottom: 0;">
                    <span class="filter-label">垂直透视</span>
                    <el-slider
                      v-model="filterState.perspectiveVertical"
                      :min="-100"
                      :max="100"
                      :format-tooltip="(val: number) => val + '%'"
                    />
                    <span class="filter-value">
                      {{ filterState.perspectiveVertical > 0 ? '+' : '' }}{{ filterState.perspectiveVertical }}%
                    </span>
                  </div>
                </div>
                <!-- HSL 调节 -->
                <div class="hsl-panel">
                  <div class="hsl-header-row">
                    <span class="hsl-title">HSL 调节</span>
                  </div>
                  <div class="hsl-color-tabs">
                    <button
                      v-for="tab in hslColorTabs"
                      :key="tab.key"
                      type="button"
                  :class="['hsl-color-tab', `hsl-color-tab--${tab.key}`, { 'is-active': activeHslColor === tab.key }]"
                      @click="activeHslColor = tab.key"
                    >
                      {{ tab.label }}
                    </button>
                    <el-button
                      class="hsl-color-reset-btn"
                      text
                      size="small"
                      @click="resetCurrentHslColor"
                    >
                      重置当前色
                    </el-button>
                  </div>
                  <div class="hsl-sliders">
                    <div class="filter-item">
                      <span class="filter-label">色相 (°)</span>
                      <el-slider
                        v-model="filterState.hslAdjustments[activeHslColor].h"
                        :min="-180"
                        :max="180"
                        :format-tooltip="(val: number) => val + '°'"
                      />
                      <span class="filter-value">
                        {{ filterState.hslAdjustments[activeHslColor].h }}°
                      </span>
                    </div>
                    <div class="filter-item">
                      <span class="filter-label">饱和度偏移</span>
                      <el-slider
                        v-model="filterState.hslAdjustments[activeHslColor].s"
                        :min="-100"
                        :max="100"
                        :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'"
                      />
                      <span class="filter-value">
                        {{ filterState.hslAdjustments[activeHslColor].s > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].s }}%
                      </span>
                    </div>
                    <div class="filter-item">
                      <span class="filter-label">亮度偏移</span>
                      <el-slider
                        v-model="filterState.hslAdjustments[activeHslColor].l"
                        :min="-100"
                        :max="100"
                        :format-tooltip="(val: number) => (val > 0 ? '+' : '') + val + '%'"
                      />
                      <span class="filter-value">
                        {{ filterState.hslAdjustments[activeHslColor].l > 0 ? '+' : '' }}{{ filterState.hslAdjustments[activeHslColor].l }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 圆角矩形设置（仅自由 / 1:1 比例可用） -->
              <div v-if="showRoundedControls" class="rounded-rect-settings">
                <div class="rounded-header-row">
                  <span class="rounded-title">圆角矩形</span>
                  <el-switch v-model="enableRoundedRect" size="small" />
                </div>
                <div class="rounded-radius-row" :class="{ 'is-disabled': !enableRoundedRect }">
                  <span class="rounded-label">圆角大小</span>
                  <el-slider
                    v-model="roundedRadius"
                    :min="0"
                    :max="50"
                    :disabled="!enableRoundedRect"
                    :format-tooltip="(val: number) => val + '%'"
                  />
                  <span class="rounded-value">{{ roundedRadius }}%</span>
                </div>
              </div>

              <!-- 边距设置：输出尺寸不变，内容缩小居中，四周白色留边（所有比例可用） -->
              <div class="margin-settings">
                <div class="rounded-header-row">
                  <span class="rounded-title">边距</span>
                  <el-switch v-model="enableMargin" size="small" />
                </div>
                <div class="rounded-radius-row" :class="{ 'is-disabled': !enableMargin }">
                  <span class="rounded-label">边距大小</span>
                  <el-slider
                    v-model="marginPercent"
                    :min="0"
                    :max="30"
                    :disabled="!enableMargin"
                    :format-tooltip="(val: number) => val + '%'"
                  />
                  <span class="rounded-value">{{ marginPercent }}%</span>
                </div>
              </div>
            </div>

            <!-- 右侧：裁切 + 预览 -->
            <div class="crop-right-panel">
              <div class="crop-main-view">
                <div
                  class="cropper-wrapper"
                  :class="{
                    'circle-crop':
                      selectedAspectRatio === 'circle' || selectedAspectRatio.endsWith('-ellipse'),
                    'rounded-rect-preview': showRoundedControls && enableRoundedRect
                  }"
                  :style="cropperWrapperStyle"
                >
                  <vue-picture-cropper
                    v-if="cropImageSrc"
                    ref="pictureCropperRef"
                    :key="`cropper-${selectedAspectRatio}`"
                    :box-style="{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#f8f8f8',
                      margin: '0 auto'
                    }"
                    :img="cropImageSrc"
                    :options="cropperOptions"
                    :style="cropperStyle"
                  />
                </div>
              </div>

              <!-- 实时输出预览（低分辨率，尽量贴近最终导出顺序） -->
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
          <el-button type="primary" @click="handleCropConfirm" :loading="cropping">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建去重：检测到可能重复的谷子时选择合并或新建 -->
    <el-dialog
      v-model="duplicateDialogVisible"
      width="min(92vw, 644px)"
      class="duplicate-dialog"
      :close-on-click-modal="false"
      @close="setDuplicateSelectedId(null)"
    >
      <template #header>
        <span class="duplicate-dialog-title">检测到库存中已存在相同项目</span>
      </template>
      <p class="duplicate-dialog-desc">以下谷子与当前填写信息可能重复，请选择合并到已有条目或仍然新建一条。</p>
      <div class="duplicate-candidates-list">
        <div
          v-for="c in duplicateCandidates"
          :key="c.id"
          class="duplicate-candidate-card"
          :class="{ 'is-selected': duplicateSelectedId === c.id }"
          @click="setDuplicateSelectedId(c.id)"
        >
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
          <el-button
            class="duplicate-merge-btn"
            :disabled="!duplicateSelectedId"
            :loading="submitting"
            @click="handleDuplicateMerge"
          >
            合并到此条(数量+N)
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 图片预览 (使用 el-image-viewer 以匹配附件图片预览效果) -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="[previewImage]"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { Plus, Delete, Picture, Camera as CameraIcon, Edit, RefreshLeft, MoreFilled } from '@element-plus/icons-vue'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'
import VuePictureCropper, { cropper } from 'vue-picture-cropper'
import { useLocationStore } from '@/stores/location'
import { createGoods, updateGoods, getGoodsDetail, uploadMainPhoto, uploadAdditionalPhotos, deleteAdditionalPhoto, updateAdditionalPhotoLabel } from '@/api/goods'
import { getIPList, getCharacterList, getCategoryList, getThemeList, createTheme } from '@/api/metadata'
import type { GoodsCreateResponse, GoodsDetail, GoodsDuplicateCandidate, GoodsInput, GoodsStatus, IP, Character, Category, GuziImage, Theme } from '@/api/types'
import {
  areCropSnapshotsEqual,
  cloneCropSnapshot,
  moveCropHistoryBackward,
  moveCropHistoryForward,
  pushCropHistorySnapshot,
  type CropEditSnapshot,
  type CropNumericState,
} from '@/views/goods-form/cropHistory'

const router = useRouter()
const route = useRoute()
const locationStore = useLocationStore()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const isEditMode = computed(() => Boolean(route.params.id))

// 新建去重：409 时弹窗状态与待重试请求体
const duplicateDialogVisible = ref(false)
const duplicateCandidates = ref<GoodsDuplicateCandidate[]>([])
const duplicateSelectedId = ref<string | null>(null)
const pendingCreatePayload = ref<GoodsInput | null>(null)

// 从API获取的数据
const ipOptions = ref<IP[]>([])
const characters = ref<Character[]>([])
const categoryOptions = ref<Category[]>([])
const themeOptions = ref<import('@/api/types').Theme[]>([])
const allThemes = ref<import('@/api/types').Theme[]>([])

const formData = ref({
  name: '',
  ip: undefined as number | undefined,
  characters: [] as number[],
  category: undefined as number | undefined,
  theme: undefined as number | string | undefined | null, // 允许字符串，用于新创建的主题名
  status: 'in_cabinet' as GoodsStatus,
  location: undefined as number | undefined,
  quantity: 1,
  price: undefined as number | undefined,
  purchase_date: '',
  is_official: false,
  notes: '',
  main_photo: '',
})

const mainPhotoFile = ref<File | null>(null)
const mainPhotoList = ref<UploadFile[]>([])
const previewVisible = ref(false)
const previewImage = ref('')

const handlePictureCardPreview = (uploadFile: UploadFile) => {
  previewImage.value = uploadFile.url!
  previewVisible.value = true
}

// 图片裁切相关状态
const cropDialogVisible = ref(false)
const cropImageSrc = ref<string>('')
const cropImageFile = ref<File | null>(null)
const pictureCropperRef = ref<any>(null)
const cropping = ref(false)
const selectedAspectRatio = ref<string>('free')
const aspectRatios = [
  { label: '自由', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '圆形', value: 'circle' },
  { label: '47:65 (椭圆)', value: '47:65-ellipse' },
  { label: '63:93 (椭圆)', value: '63:93-ellipse' },
]

// 圆角矩形相关状态（仅用于自由/1:1 比例）
const enableRoundedRect = ref(false)
// 使用百分比控制圆角半径（相对于最短边的一半），0-50%
const roundedRadius = ref(20)
const showRoundedControls = computed(() => {
  return selectedAspectRatio.value === 'free' || selectedAspectRatio.value === '1:1'
})

// 边距（类似 margin）：输出尺寸不变，内容缩小居中，四周白色留边
const enableMargin = ref(false)
// 0-30%，表示相对于输出边长的边距比例（四边一致）
const marginPercent = ref(8)

// 图像滤镜状态（基础三项 + 按颜色分组的 HSL 调整）
const createDefaultHslAdjustments = () => ({
  red: { h: 0, s: 0, l: 0 },
  orange: { h: 0, s: 0, l: 0 },
  yellow: { h: 0, s: 0, l: 0 },
  green: { h: 0, s: 0, l: 0 },
  cyan: { h: 0, s: 0, l: 0 },
  blue: { h: 0, s: 0, l: 0 },
  purple: { h: 0, s: 0, l: 0 },
})

const createDefaultFilterState = () => ({
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hslAdjustments: createDefaultHslAdjustments(),
  // 几何变换相关：透视 + 旋转
  rotation: 0,
  perspectiveHorizontal: 0,
  perspectiveVertical: 0,
})

const filterState = ref(createDefaultFilterState())

const resetFilters = () => {
  filterState.value = createDefaultFilterState()
}

const hslColorTabs = [
  { key: 'red', label: '红' },
  { key: 'orange', label: '橙' },
  { key: 'yellow', label: '黄' },
  { key: 'green', label: '绿' },
  { key: 'cyan', label: '青' },
  { key: 'blue', label: '蓝' },
  { key: 'purple', label: '紫' },
] as const

type HslColorKeyLocal = (typeof hslColorTabs)[number]['key']

const activeHslColor = ref<HslColorKeyLocal>('red')

const resetCurrentHslColor = () => {
  const key = activeHslColor.value
  const adj = (filterState.value.hslAdjustments as any)[key]
  if (!adj) return
  adj.h = 0
  adj.s = 0
  adj.l = 0
}

const cropHistoryPast = ref<CropEditSnapshot[]>([])
const cropHistoryFuture = ref<CropEditSnapshot[]>([])
const suppressCropHistory = ref(false)
const canUndoCropEdit = computed(() => cropHistoryPast.value.length > 1)
const canRedoCropEdit = computed(() => cropHistoryFuture.value.length > 0)
let cropHistoryTimer: number | undefined
let pendingCropSnapshotApply: CropEditSnapshot | null = null
let cropHistoryReadyTimer: number | undefined

const clearCropHistoryTimer = () => {
  if (typeof window === 'undefined') return
  if (cropHistoryTimer) {
    window.clearTimeout(cropHistoryTimer)
    cropHistoryTimer = undefined
  }
}

const clearCropHistoryReadyTimer = () => {
  if (typeof window === 'undefined') return
  if (cropHistoryReadyTimer) {
    window.clearTimeout(cropHistoryReadyTimer)
    cropHistoryReadyTimer = undefined
  }
}

const resetCropHistorySession = () => {
  clearCropHistoryTimer()
  clearCropHistoryReadyTimer()
  cropHistoryPast.value = []
  cropHistoryFuture.value = []
  suppressCropHistory.value = false
  pendingCropSnapshotApply = null
}

// 实时输出预览（低分辨率）
const livePreviewUrl = ref<string>('')
const livePreviewLoading = ref(false)
let livePreviewTimer: number | undefined
let livePreviewSeq = 0

const clearLivePreviewUrl = () => {
  if (livePreviewUrl.value && livePreviewUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(livePreviewUrl.value)
  }
  livePreviewUrl.value = ''
}

// 工具：HSL 辅助函数与按颜色分组的 HSL 应用（用于预览与导出）
const clamp01 = (v: number) => {
  if (Number.isNaN(v)) return 0
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

const normalizeHue = (h: number) => {
  if (!Number.isFinite(h)) return 0
  let x = h % 360
  if (x < 0) x += 360
  return x
}

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return {
    h: h * 360,
    s,
    l,
  }
}

const hslToRgb = (h: number, s: number, l: number) => {
  h = normalizeHue(h) / 360
  s = clamp01(s)
  l = clamp01(l)

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)

  return {
    r: Math.round(clamp01(r) * 255),
    g: Math.round(clamp01(g) * 255),
    b: Math.round(clamp01(b) * 255),
  }
}

const classifyHueToColorName = (h: number): keyof ReturnType<typeof createDefaultHslAdjustments> => {
  const hue = normalizeHue(h)
  if (hue >= 345 || hue < 15) return 'red'
  if (hue < 45) return 'orange'
  if (hue < 75) return 'yellow'
  if (hue < 150) return 'green'
  if (hue < 210) return 'cyan'
  if (hue < 270) return 'blue'
  return 'purple'
}

const isAllHslAdjustmentsZero = () => {
  const adj: any = filterState.value.hslAdjustments
  if (!adj) return true
  for (const key of Object.keys(adj)) {
    const entry = adj[key] || { h: 0, s: 0, l: 0 }
    if ((entry.h ?? 0) !== 0 || (entry.s ?? 0) !== 0 || (entry.l ?? 0) !== 0) {
      return false
    }
  }
  return true
}

const isFilterStateDefault = () => {
  return (
    filterState.value.brightness === 100 &&
    filterState.value.contrast === 100 &&
    filterState.value.saturation === 100 &&
    (filterState.value.rotation ?? 0) === 0 &&
    (filterState.value.perspectiveHorizontal ?? 0) === 0 &&
    (filterState.value.perspectiveVertical ?? 0) === 0 &&
    isAllHslAdjustmentsZero()
  )
}

const isTransformStateDefault = () => {
  return (
    (filterState.value.rotation ?? 0) === 0 &&
    (filterState.value.perspectiveHorizontal ?? 0) === 0 &&
    (filterState.value.perspectiveVertical ?? 0) === 0
  )
}

const applyHslPerColorToImageData = (imageData: ImageData): ImageData => {
  const { data } = imageData
  const hslAdjustments: any = filterState.value.hslAdjustments
  if (!hslAdjustments || isAllHslAdjustmentsZero()) {
    return imageData
  }

  const length = data.length
  for (let i = 0; i < length; i += 4) {
    const alpha = data[i + 3]
    if (alpha === 0) continue

    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const hsl = rgbToHsl(r || 0, g || 0, b || 0)
    const colorName = classifyHueToColorName(hsl.h)
    const adjust = hslAdjustments[colorName] || { h: 0, s: 0, l: 0 }

    if (!adjust || (!adjust.h && !adjust.s && !adjust.l)) {
      continue
    }

    const nextH = normalizeHue(hsl.h + (adjust.h ?? 0))
    let nextS = hsl.s * (1 + (adjust.s ?? 0) / 100)
    let nextL = hsl.l * (1 + (adjust.l ?? 0) / 100)

    nextS = clamp01(nextS)
    nextL = clamp01(nextL)

    const rgb = hslToRgb(nextH, nextS, nextL)
    data[i] = rgb.r
    data[i + 1] = rgb.g
    data[i + 2] = rgb.b
  }

  return imageData
}

const scheduleLivePreviewRefresh = () => {
  if (!cropDialogVisible.value) return
  if (typeof window === 'undefined') return
  if (livePreviewTimer) {
    window.clearTimeout(livePreviewTimer)
  }
  livePreviewTimer = window.setTimeout(() => {
    refreshLivePreview()
  }, 280)
}

// 圆角矩形：让“上方操作区的圆角”与“下方预览/最终导出”的半径算法一致
// 导出算法：radius = (p/100) * (min(w, h)/2)
// 操作区这里用当前 cropBox 的显示尺寸实时算出像素半径，再用 px 设置 cropper 的 view-box 圆角
const roundedRectPreviewPx = ref(0)
const updateRoundedRectPreviewRadius = () => {
  if (!showRoundedControls.value || !enableRoundedRect.value) {
    roundedRectPreviewPx.value = 0
    return
  }
  const cropBox = getCropperNumericState('getCropBoxData')
  const w = cropBox?.width
  const h = cropBox?.height
  if (!w || !h) return

  const p = Math.max(0, Math.min(roundedRadius.value, 50))
  const radius = (p / 100) * (Math.min(w, h) / 2)
  roundedRectPreviewPx.value = Number.isFinite(radius) ? radius : 0
}

const cropperWrapperStyle = computed(() => ({
  // 供 scoped CSS 读取
  '--rounded-radius-px': `${roundedRectPreviewPx.value}px`,
}))

const refreshLivePreview = async () => {
  if (!cropDialogVisible.value) return
  const seq = ++livePreviewSeq
  livePreviewLoading.value = true

  try {
    const cropperInstance = getCropperInstance()
    if (!cropperInstance) return

    // 同步一次操作区圆角半径（避免只动裁切框时圆角不刷新）
    updateRoundedRectPreviewRadius()

    // 取低分辨率裁切结果用于预览
    let baseBlob: Blob | null = null
    if (typeof cropperInstance.getBlob === 'function') {
      try {
        baseBlob = await cropperInstance.getBlob({
          width: 768,
          height: 768,
          mimeType: 'image/png',
          quality: 0.92,
        })
      } catch (e) {
        baseBlob = null
      }
    }
    if (!baseBlob && typeof cropperInstance.getDataURL === 'function') {
      try {
        const dataURL = cropperInstance.getDataURL({
          width: 768,
          height: 768,
          mimeType: 'image/png',
          quality: 0.92,
        })
        if (dataURL) {
          const resp = await fetch(dataURL)
          baseBlob = await resp.blob()
        }
      } catch (e) {
        baseBlob = null
      }
    }

    if (!baseBlob) return

    let workingFile = new File([baseBlob], `preview_${Date.now()}.png`, { type: 'image/png' })

    // 先应用几何变换：透视 + 旋转
    if (!isTransformStateDefault()) {
      try {
        const transformedBlob = await applyPerspectiveAndRotateToBlob(workingFile)
        workingFile = new File([transformedBlob], `preview_${Date.now()}.png`, { type: 'image/png' })
      } catch (e) {
        // 几何变换失败时忽略，不中断预览流程
      }
    }

    // 形状与补白/圆角顺序尽量贴近最终导出
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

    const filtered = await applyFiltersToImage(workingFile)

    if (seq !== livePreviewSeq) return

    const nextUrl = URL.createObjectURL(filtered)
    const prevUrl = livePreviewUrl.value
    livePreviewUrl.value = nextUrl
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl)
    }
  } catch (e) {
    // 预览失败不打断用户操作
  } finally {
    if (seq === livePreviewSeq) {
      livePreviewLoading.value = false
    }
  }
}

watch(
  () => [selectedAspectRatio.value, enableRoundedRect.value, roundedRadius.value, enableMargin.value, marginPercent.value],
  () => {
    scheduleLivePreviewRefresh()
    updateRoundedRectPreviewRadius()
    scheduleCropHistorySnapshot()
  }
)
watch(filterState, () => {
  scheduleLivePreviewRefresh()
  scheduleCropHistorySnapshot()
}, { deep: true })
watch(cropDialogVisible, (open) => {
  if (!open) {
    if (typeof window !== 'undefined' && livePreviewTimer) {
      window.clearTimeout(livePreviewTimer)
      livePreviewTimer = undefined
    }
    clearLivePreviewUrl()
  } else {
    scheduleLivePreviewRefresh()
  }
})

// 动态计算滤镜样式，用于裁切区域预览（这里只能做近似的整体效果）
const cropperStyle = computed(() => {
  const baseBrightness = filterState.value.brightness
  const baseContrast = filterState.value.contrast
  const baseSaturation = filterState.value.saturation
  const baseRotation = filterState.value.rotation ?? 0
  const perspectiveHorizontal = filterState.value.perspectiveHorizontal ?? 0
  const perspectiveVertical = filterState.value.perspectiveVertical ?? 0

  // 将按颜色分组的 HSL 调整，近似汇总成一个全局 H/S/L，用于 CSS filter 预览
  const hslAdj: any = filterState.value.hslAdjustments
  let sumH = 0
  let sumS = 0
  let sumL = 0
  let count = 0

  if (hslAdj) {
    for (const key of Object.keys(hslAdj)) {
      const entry = hslAdj[key]
      if (!entry) continue
      if ((entry.h ?? 0) !== 0 || (entry.s ?? 0) !== 0 || (entry.l ?? 0) !== 0) {
        sumH += entry.h ?? 0
        sumS += entry.s ?? 0
        sumL += entry.l ?? 0
        count++
      }
    }
  }

  const avgH = count ? sumH / count : 0
  const avgS = count ? sumS / count : 0
  const avgL = count ? sumL / count : 0

  const cssBrightness = Math.max(0, baseBrightness * (1 + avgL / 100))
  const cssSaturation = Math.max(0, baseSaturation * (1 + avgS / 100))
  const cssHueRotate = avgH

  const transformParts: string[] = []
  const rotateYDeg = (perspectiveHorizontal / 100) * 20
  const rotateXDeg = (perspectiveVertical / 100) * -20
  if (perspectiveHorizontal !== 0) {
    transformParts.push(`rotateY(${rotateYDeg}deg)`)
  }
  if (perspectiveVertical !== 0) {
    transformParts.push(`rotateX(${rotateXDeg}deg)`)
  }
  if (baseRotation) {
    transformParts.push(`rotate(${baseRotation}deg)`)
  }

  return {
    filter: `brightness(${cssBrightness}%) contrast(${baseContrast}%) saturate(${cssSaturation}%) hue-rotate(${cssHueRotate}deg)`,
    transform: transformParts.length ? `perspective(800px) ${transformParts.join(' ')}` : undefined,
  }
})

// 视口宽度（用于 isMobile 等，随 resize 更新）
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

const isMobile = computed(() => windowWidth.value < 768)

// 裁切器配置
const cropperOptions = computed(() => {
  const baseOptions: any = {
    img: cropImageSrc.value,
    outputSize: 1,
    outputType: 'png',
    canScale: true,
    autoCrop: true,
    centerBox: true,
    high: true,
    cropData: {},
    enlarge: 1,
    mode: 'contain',
    maxImgSize: 2000,
    limitMinSize: [100, 100],
    // 限制裁切框不能超出图片边界
    viewMode: 1, // 1: 限制裁切框不能超出画布（图片）范围
    dragMode: 'crop', // 'crop': 创建新的裁切框, 'move': 移动画布, 'none': 无操作
    cropBoxMovable: true, // 允许移动裁切框
    cropBoxResizable: true, // 允许调整裁切框大小（但仍受 viewMode 限制）
    // 确保裁切框始终在图片范围内
    strict: true, // 严格模式，确保裁切框不超出图片
    ready: () => handleCropperReady(),
    crop: () => {
      updateRoundedRectPreviewRadius()
      scheduleLivePreviewRefresh()
    },
    cropend: () => scheduleCropHistorySnapshot(120),
    zoom: () => {
      updateRoundedRectPreviewRadius()
      scheduleLivePreviewRefresh()
      scheduleCropHistorySnapshot(180)
    },
  }

  // 根据选择的比例设置 aspectRatio
  if (selectedAspectRatio.value === 'circle') {
    // 圆形裁切：本质上是 1:1 的固定比例 + CSS 把裁切框渲染成圆形
    baseOptions.aspectRatio = 1
    baseOptions.fixed = true
    baseOptions.fixedNumber = [1, 1]
  } else if (selectedAspectRatio.value.endsWith('-ellipse')) {
    // 椭圆裁切：解析比例 + CSS 把裁切框渲染成圆形（会被拉伸成椭圆）
    const ratioStr = selectedAspectRatio.value.replace('-ellipse', '')
    const parts = ratioStr.split(':').map(Number)
    const w = parts[0]
    const h = parts[1]
    if (w && h) {
      baseOptions.aspectRatio = w / h
      baseOptions.fixed = true
      baseOptions.fixedNumber = [w, h]
    }
  } else if (selectedAspectRatio.value !== 'free') {
    const parts = selectedAspectRatio.value.split(':').map(Number)
    const w = parts[0]
    const h = parts[1]
    if (w && h) {
      baseOptions.aspectRatio = w / h
      baseOptions.fixed = true
      baseOptions.fixedNumber = [w, h]
    } else {
      baseOptions.aspectRatio = NaN
      baseOptions.fixed = false
    }
  } else {
    baseOptions.aspectRatio = NaN
    baseOptions.fixed = false
  }

  return baseOptions
})

// 附件图片相关状态
interface NewPhotoFile {
  file: File
  preview: string
  label?: string
}
interface ExistingPhoto extends GuziImage {
  label?: string
  originalLabel?: string // 记录原始标签，用于判断是否修改
}
const existingAdditionalPhotos = ref<ExistingPhoto[]>([])
const newAdditionalPhotoFiles = ref<NewPhotoFile[]>([])
const additionalPhotoList = ref<UploadFile[]>([])

const formTitle = computed(() => {
  return route.params.id ? '编辑谷子' : '新增谷子'
})

// H5 移动端：用 input[file] + capture 实现“拍照/相册”（不同浏览器表现可能不同）
const isH5Mobile = computed(() => {
  return !Capacitor.isNativePlatform() && windowWidth.value < 768
})

// 原生移动端（Capacitor）环境：支持调用相机/相册
const isNativeMobile = computed(() => {
  return Capacitor.isNativePlatform() && windowWidth.value < 768
})

// 移动端上传：使用“拍照/相册”动作面板替代默认文件选择
const isMobileUploadActionSheet = computed(() => isNativeMobile.value || isH5Mobile.value)

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

const handleIpChange = () => {
  formData.value.characters = []
}

// 待创建的主题名（当用户输入新主题名但还未创建时）
const pendingThemeName = ref<string | null>(null)

// 主题变更处理
const handleThemeChange = (value: number | string | null) => {
  // value可能是数字（已有主题ID）、字符串（新创建的主题名）或null（清空）
  if (value === null) {
    formData.value.theme = null
    pendingThemeName.value = null
    return
  }
  if (typeof value === 'string') {
    // 这是新创建的主题名，先保存到pendingThemeName
    // 注意：这里不立即设置为null，让el-select显示用户输入的内容
    // 等待handleThemeCreate处理（用户按回车或选择创建选项时触发）
    pendingThemeName.value = value.trim()
    // 保持字符串值，让用户看到输入的内容
    // handleThemeCreate 会在创建成功后更新为ID
    return
  }
  // 数字ID，直接使用
  formData.value.theme = value
  pendingThemeName.value = null

  // 当选择已有主题时，自动将主题的description信息填入备注栏
  const selectedTheme = allThemes.value.find(theme => theme.id === value)
  if (selectedTheme && selectedTheme.description) {
    formData.value.notes = selectedTheme.description
  }
}

// 创建新主题（由el-select的@create事件触发，用户输入新名称后按回车或选择创建选项时触发）
const handleThemeCreate = async (themeName: string) => {
  if (!themeName || !themeName.trim()) {
    ElMessage.warning('主题名称不能为空')
    formData.value.theme = null
    pendingThemeName.value = null
    return
  }

  const trimmedName = themeName.trim()

  try {
    // 检查是否已存在同名主题
    const existingTheme = allThemes.value.find(t => t.name === trimmedName)
    if (existingTheme) {
      formData.value.theme = existingTheme.id
      pendingThemeName.value = null
      ElMessage.info('该主题已存在，已自动选择')
      return
    }

    // 创建新主题
    const newTheme = await createTheme({ name: trimmedName })
    allThemes.value.push(newTheme)
    themeOptions.value = allThemes.value
    // 更新为创建后的主题ID
    formData.value.theme = newTheme.id
    pendingThemeName.value = null
    ElMessage.success('主题创建成功')
  } catch (err: any) {
    ElMessage.error('创建主题失败：' + (err.message || '未知错误'))
    // 创建失败时，保持字符串值，让用户可以重新尝试
    // 不清空，这样用户可以看到输入的内容
    console.error('创建主题失败:', err)
  }
}

// 确保主题已创建（在提交前调用）
const ensureThemeCreated = async (): Promise<number | null> => {
  // 如果已经有theme_id（数字），直接返回
  if (typeof formData.value.theme === 'number') {
    return formData.value.theme
  }

  // 如果 theme 是字符串（新创建的主题名），或者 pendingThemeName 有值
  const themeNameToCreate = typeof formData.value.theme === 'string'
    ? formData.value.theme.trim()
    : (pendingThemeName.value ? pendingThemeName.value.trim() : null)

  if (themeNameToCreate) {
    try {
      // 再次检查是否已存在同名主题（可能在其他地方创建了）
      const existingTheme = allThemes.value.find(t => t.name === themeNameToCreate)
      if (existingTheme) {
        formData.value.theme = existingTheme.id
        pendingThemeName.value = null
        return existingTheme.id
      }

      // 创建新主题
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

  // 如果没有主题，返回null
  return null
}

const dummyUpload = () => Promise.resolve()

const handleMainPhotoChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
  const file = uploadFile.raw
  if (file) {
    // 打开裁切对话框
    openCropDialog(file)
    // 清空上传列表，等待裁切完成后再设置
    mainPhotoList.value = []
  }
}

const handleMainPhotoRemove = () => {
  mainPhotoFile.value = null
  mainPhotoList.value = []
  formData.value.main_photo = ''
}

const setMainPhotoFromFile = (file: File, previewUrl?: string) => {
  // 清理旧的预览URL（如果存在）
  const oldFile = mainPhotoList.value[0]
  if (oldFile && oldFile.url && oldFile.url.startsWith('blob:')) {
    URL.revokeObjectURL(oldFile.url)
  }

  mainPhotoFile.value = file
  formData.value.main_photo = ''
  mainPhotoList.value = [
    {
      name: file.name || 'main_photo',
      url: previewUrl,
      status: 'success',
    } as UploadFile,
  ]
}

const cameraInputRef = ref<HTMLInputElement | null>(null)
const albumInputRef = ref<HTMLInputElement | null>(null)

// 主图选择抽屉状态
const photoSourceDrawerVisible = ref(false)

const handleH5MainPhotoPicked = (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  // 打开裁切对话框
  openCropDialog(file)
  // 允许重复选择同一张图
  if (input) input.value = ''
}

const pickMainPhotoFromNative = async (source: CameraSource) => {
  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      resultType: CameraResultType.Uri,
      source,
      correctOrientation: true,
    })

    if (!photo.webPath) {
      throw new Error('未获取到图片路径')
    }

    const resp = await fetch(photo.webPath)
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const ext = mime.includes('/') ? mime.split('/')[1] : 'jpg'
    const file = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })

    // 打开裁切对话框
    openCropDialog(file, photo.webPath)
  } catch (err: any) {
    // 用户取消不提示错误
    const msg = err?.message || ''
    if (msg.includes('User cancelled') || msg.includes('canceled') || msg.includes('cancel')) return
    ElMessage.error('获取图片失败：' + (err?.message || '未知错误'))
  }
}

const chooseMainPhotoSource = () => {
  photoSourceDrawerVisible.value = true
}

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

// 打开裁切对话框
const openCropDialog = (file: File, previewUrl?: string) => {
  resetCropHistorySession()
  cropImageFile.value = file
  // 创建预览URL
  if (previewUrl) {
    cropImageSrc.value = previewUrl
  } else {
    cropImageSrc.value = URL.createObjectURL(file)
  }
  cropDialogVisible.value = true
  selectedAspectRatio.value = 'free' // 重置为自由比例
  resetFilters() // 重置滤镜
  // 重置圆角矩形设置
  enableRoundedRect.value = false
  roundedRadius.value = 20
  // 重置边距设置
  enableMargin.value = false
  marginPercent.value = 8

  clearLivePreviewUrl()
  scheduleLivePreviewRefresh()
}

// 编辑模式：把原主图拉进裁切器重新编辑
const handleReEditMainPhoto = async () => {
  try {
    // 优先取当前 UI/表单里的主图 URL（编辑模式下来自详情接口）
    const url = (formData.value.main_photo || mainPhotoList.value?.[0]?.url || '').toString()
    if (!url) {
      ElMessage.warning('当前没有可编辑的主图')
      return
    }

    const resp = await fetch(url)
    if (!resp.ok) {
      throw new Error(`拉取图片失败（HTTP ${resp.status}）`)
    }
    const blob = await resp.blob()
    const mime = blob.type || 'image/jpeg'
    const ext = mime.includes('/') ? mime.split('/')[1] : 'jpg'
    const file = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })

    openCropDialog(file, url)
  } catch (err: any) {
    ElMessage.error('重新编辑主图失败：' + (err?.message || '未知错误'))
  }
}

// 获取裁切器实例
// vue-picture-cropper 通过导入的 cropper 工具实例来调用方法
const getCropperInstance = () => {
  // 优先使用导入的 cropper 工具实例（这是推荐的方式）
  if (cropper && (typeof cropper.getDataURL === 'function' || typeof cropper.getBlob === 'function' || typeof cropper.getFile === 'function')) {
    return cropper
  }

  // 如果工具实例不可用，尝试从组件获取
  if (pictureCropperRef.value) {
    const component = pictureCropperRef.value

    // 尝试多种方式获取实例
    if (component.$refs && component.$refs.cropper) {
      return component.$refs.cropper
    }
    if (component.cropper) {
      return component.cropper
    }
    if ((component as any).setupState && (component as any).setupState.cropper) {
      return (component as any).setupState.cropper
    }
    if ((component as any).__cropper) {
      return (component as any).__cropper
    }
  }

  return null
}

const cloneCropNumericState = (value: CropNumericState | null | undefined): CropNumericState | null => {
  if (!value) return null
  return { ...value }
}

const getCropperNumericState = (methodName: 'getData' | 'getCropBoxData' | 'getCanvasData'): CropNumericState | null => {
  const cropperInstance = getCropperInstance()
  if (!cropperInstance || typeof cropperInstance[methodName] !== 'function') {
    return null
  }

  try {
    return cloneCropNumericState(cropperInstance[methodName]())
  } catch (err) {
    return null
  }
}

const createCropEditSnapshot = (): CropEditSnapshot | null => {
  const cropperInstance = getCropperInstance()
  if (!cropperInstance) return null

  return {
    selectedAspectRatio: selectedAspectRatio.value,
    filterState: (() => {
      const src = filterState.value
      const next: any = {
        brightness: src.brightness,
        contrast: src.contrast,
        saturation: src.saturation,
        hslAdjustments: createDefaultHslAdjustments(),
        rotation: src.rotation ?? 0,
        perspectiveHorizontal: src.perspectiveHorizontal ?? 0,
        perspectiveVertical: src.perspectiveVertical ?? 0,
      }
      if (src.hslAdjustments) {
        for (const key of Object.keys(src.hslAdjustments)) {
          const entry = (src.hslAdjustments as any)[key] || { h: 0, s: 0, l: 0 }
          ;(next.hslAdjustments as any)[key] = {
            h: entry.h ?? 0,
            s: entry.s ?? 0,
            l: entry.l ?? 0,
          }
        }
      }
      return next
    })(),
    enableRoundedRect: enableRoundedRect.value,
    roundedRadius: roundedRadius.value,
    enableMargin: enableMargin.value,
    marginPercent: marginPercent.value,
    cropData: getCropperNumericState('getData'),
    cropBoxData: getCropperNumericState('getCropBoxData'),
    canvasData: getCropperNumericState('getCanvasData'),
  }
}

const commitCropHistorySnapshot = () => {
  if (!cropDialogVisible.value || suppressCropHistory.value) return

  const snapshot = createCropEditSnapshot()
  if (!snapshot) return

  const nextHistory = pushCropHistorySnapshot(
    {
      past: cropHistoryPast.value,
      future: cropHistoryFuture.value,
    },
    snapshot,
  )

  cropHistoryPast.value = nextHistory.past
  cropHistoryFuture.value = nextHistory.future
}

const scheduleCropHistorySnapshot = (delay = 180) => {
  if (!cropDialogVisible.value || suppressCropHistory.value) return
  if (typeof window === 'undefined') {
    commitCropHistorySnapshot()
    return
  }

  clearCropHistoryTimer()
  cropHistoryTimer = window.setTimeout(() => {
    cropHistoryTimer = undefined
    commitCropHistorySnapshot()
  }, delay)
}

const applyCropperStateFromSnapshot = (snapshot: CropEditSnapshot) => {
  const cropperInstance = getCropperInstance()
  if (!cropperInstance) return false

  try {
    if (snapshot.canvasData && typeof cropperInstance.setCanvasData === 'function') {
      cropperInstance.setCanvasData(cloneCropNumericState(snapshot.canvasData))
    }
    if (snapshot.cropData && typeof cropperInstance.setData === 'function') {
      cropperInstance.setData(cloneCropNumericState(snapshot.cropData))
    }
    if (snapshot.cropBoxData && typeof cropperInstance.setCropBoxData === 'function') {
      cropperInstance.setCropBoxData(cloneCropNumericState(snapshot.cropBoxData))
    }
    return true
  } catch (err) {
    return false
  }
}

const finishCropSnapshotRestore = () => {
  clearCropHistoryTimer()
  clearCropHistoryReadyTimer()
  pendingCropSnapshotApply = null
  suppressCropHistory.value = false
  scheduleLivePreviewRefresh()
}

const restoreCropEditSnapshot = async (snapshot: CropEditSnapshot) => {
  clearCropHistoryTimer()
  clearCropHistoryReadyTimer()
  suppressCropHistory.value = true
  pendingCropSnapshotApply = cloneCropSnapshot(snapshot)

  selectedAspectRatio.value = snapshot.selectedAspectRatio
  filterState.value = (() => {
    const src: any = snapshot.filterState as any
    const next: any = {
      brightness: src.brightness,
      contrast: src.contrast,
      saturation: src.saturation,
      hslAdjustments: createDefaultHslAdjustments(),
      rotation: src.rotation ?? 0,
      perspectiveHorizontal: src.perspectiveHorizontal ?? 0,
      perspectiveVertical: src.perspectiveVertical ?? 0,
    }
    if (src.hslAdjustments) {
      for (const key of Object.keys(src.hslAdjustments)) {
        const entry = src.hslAdjustments[key] || { h: 0, s: 0, l: 0 }
        next.hslAdjustments[key] = {
          h: entry.h ?? 0,
          s: entry.s ?? 0,
          l: entry.l ?? 0,
        }
      }
    }
    return next
  })()
  enableRoundedRect.value = snapshot.enableRoundedRect
  roundedRadius.value = snapshot.roundedRadius
  enableMargin.value = snapshot.enableMargin
  marginPercent.value = snapshot.marginPercent

  await nextTick()

  if (pendingCropSnapshotApply && applyCropperStateFromSnapshot(pendingCropSnapshotApply)) {
    finishCropSnapshotRestore()
  }
}

const handleCropUndo = async () => {
  if (!canUndoCropEdit.value) return

  const nextHistory = moveCropHistoryBackward({
    past: cropHistoryPast.value,
    future: cropHistoryFuture.value,
  })

  cropHistoryPast.value = nextHistory.past
  cropHistoryFuture.value = nextHistory.future

  if (nextHistory.current) {
    await restoreCropEditSnapshot(nextHistory.current)
  }
}

const handleCropRedo = async () => {
  if (!canRedoCropEdit.value) return

  const nextHistory = moveCropHistoryForward({
    past: cropHistoryPast.value,
    future: cropHistoryFuture.value,
  })

  cropHistoryPast.value = nextHistory.past
  cropHistoryFuture.value = nextHistory.future

  if (nextHistory.current) {
    await restoreCropEditSnapshot(nextHistory.current)
  }
}

const handleCropperReady = () => {
  clearCropHistoryReadyTimer()

  const run = async () => {
    await nextTick()
    if (!cropDialogVisible.value) return

    updateRoundedRectPreviewRadius()

    if (pendingCropSnapshotApply) {
      if (applyCropperStateFromSnapshot(pendingCropSnapshotApply)) {
        finishCropSnapshotRestore()
      }
      return
    }

    if (!cropHistoryPast.value.length) {
      commitCropHistorySnapshot()
    } else {
      scheduleCropHistorySnapshot(120)
    }
    scheduleLivePreviewRefresh()
  }

  if (typeof window === 'undefined') {
    void run()
    return
  }

  cropHistoryReadyTimer = window.setTimeout(() => {
    cropHistoryReadyTimer = undefined
    void run()
  }, 30)
}

const blobToImageBitmap = async (blob: Blob) => {
  // createImageBitmap 在大多数现代浏览器可用；不行则回退到 HTMLImageElement
  if (typeof createImageBitmap === 'function') {
    return await createImageBitmap(blob)
  }
  const url = URL.createObjectURL(blob)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('图片解码失败'))
      el.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

const applyCircleMaskToBlob = async (input: Blob) => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height
  const size = Math.min(width, height)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  // 圆形裁切：圆外透明
  ctx.clearRect(0, 0, size, size)
  ctx.save()
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  // 如果不是正方形，居中裁成正方形
  const sx = Math.max(0, Math.floor((width - size) / 2))
  const sy = Math.max(0, Math.floor((height - size) / 2))
  ctx.drawImage(bitmapOrImg as any, sx, sy, size, size, 0, 0, size, size)
  ctx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出圆形图片失败'))), 'image/png', 0.92)
  })
  return outBlob
}

const applyEllipseMaskToBlob = async (input: Blob) => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  // 创建一个正方形画布，边长为椭圆长轴的长度
  const size = Math.max(width, height)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  // 清除背景 (透明)
  ctx.clearRect(0, 0, size, size)

  // 计算居中偏移量
  const offsetX = (size - width) / 2
  const offsetY = (size - height) / 2

  // 椭圆裁切：圆外透明
  ctx.save()
  ctx.beginPath()

  // 绘制椭圆：中心点 (size/2, size/2)，半径 (width/2, height/2)
  if (typeof ctx.ellipse === 'function') {
      ctx.ellipse(size / 2, size / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
  } else {
       // 兼容性处理
       ctx.translate(size/2, size/2)
       ctx.scale(width/2, height/2)
       ctx.arc(0, 0, 1, 0, Math.PI * 2)
  }
  ctx.closePath()
  ctx.clip()

  // 绘制图片，居中放置
  // 注意：如果使用了 translate/scale，需要先 restore 再 drawImage，或者在 transform 状态下正确绘制
  // 为了简单起见，如果走了兼容分支，translate/scale 会影响后续绘制
  // 所以这里建议：如果走了兼容分支，必须 restore 吗？
  // clip() 会受到当前 transform 的影响。clip 路径创建后，transform 可以 restore。
  // 但是 clip 区域是固定的。

  if (typeof ctx.ellipse !== 'function') {
      // 如果走了兼容分支，此时坐标系被变换了。
      // 我们需要恢复坐标系来绘制图片，但是 clip 效果要保留。
      // Canvas 的 clip() 是基于当前路径创建剪切区域。路径创建时的 transform 会被应用到路径上。
      // 一旦 clip() 被调用，剪切区域就固定了。
      // 所以我们可以 restore() 然后绘制图片。
      ctx.restore()
      ctx.save() // 重新 save 为了保持结构一致，虽然下面直接 drawImage 也可以
  }

  ctx.drawImage(bitmapOrImg as any, offsetX, offsetY, width, height)
  ctx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出椭圆图片失败'))), 'image/png', 0.92)
  })
  return outBlob
}

// 圆角矩形遮罩：用于自由 / 1:1 比例下的圆角矩形导出
const applyRoundedRectMaskToBlob = async (input: File, radiusPercent: number): Promise<File> => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.clearRect(0, 0, width, height)

  // 将 0-50% 的 UI 数值转换为像素半径（最大为最短边的一半）
  const clampedPercent = Math.max(0, Math.min(radiusPercent, 50))
  const maxRadius = Math.min(width, height) / 2
  const radius = (clampedPercent / 100) * maxRadius

  const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const rr = Math.min(r, w / 2, h / 2)
    context.beginPath()
    context.moveTo(x + rr, y)
    context.lineTo(x + w - rr, y)
    context.arcTo(x + w, y, x + w, y + rr, rr)
    context.lineTo(x + w, y + h - rr)
    context.arcTo(x + w, y + h, x + w - rr, y + h, rr)
    context.lineTo(x + rr, y + h)
    context.arcTo(x, y + h, x, y + h - rr, rr)
    context.lineTo(x, y + rr)
    context.arcTo(x, y, x + rr, y, rr)
    context.closePath()
  }

  // 应用圆角矩形剪裁
  drawRoundedRect(ctx, 0, 0, width, height, radius)
  ctx.clip()

  ctx.drawImage(bitmapOrImg as any, 0, 0, width, height)

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出圆角矩形图片失败'))), 'image/png', 0.92)
  })

  return new File([outBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
}

const applyFreeCropSquareBlob = async (input: Blob) => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const size = Math.max(width, height)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  const offsetX = (size - width) / 2
  const offsetY = (size - height) / 2
  ctx.drawImage(bitmapOrImg as any, offsetX, offsetY, width, height)

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出正方形图片失败'))), 'image/png', 0.92)
  })
  return outBlob
}

// 边距（类似 margin）：输出尺寸不变，内容缩小居中，四周白色留边
const applyMarginToBlob = async (input: Blob, marginPercent: number) => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  const clamped = Math.max(0, Math.min(marginPercent, 45))
  const m = clamped / 100
  const scale = Math.max(0.01, 1 - 2 * m)
  const drawW = width * scale
  const drawH = height * scale
  const dx = (width - drawW) / 2
  const dy = (height - drawH) / 2

  ctx.drawImage(bitmapOrImg as any, dx, dy, drawW, drawH)

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('导出边距图片失败'))), 'image/png', 0.92)
  })
  return outBlob
}

// 仅旋转几何变换：基于当前 filterState 中的旋转参数
const applyRotateToBlob = async (input: Blob): Promise<Blob> => {
  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  // 画布放大到对角线，避免旋转裁切内容
  const diag = Math.sqrt(width * width + height * height)
  const canvasSize = Math.ceil(diag)

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.clearRect(0, 0, canvasSize, canvasSize)

  const cx = canvasSize / 2
  const cy = canvasSize / 2

  const rotDeg = filterState.value.rotation ?? 0

  const rotRad = (rotDeg * Math.PI) / 180

  ctx.save()
  ctx.translate(cx, cy)
  if (rotRad !== 0) {
    ctx.rotate(rotRad)
  }

  ctx.drawImage(bitmapOrImg as any, -width / 2, -height / 2, width, height)
  ctx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('透视/旋转处理失败'))), 'image/png', 0.92)
  })

  return outBlob
}

type Affine2DMatrix = {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
}

const computeAffineFromTriangles = (
  src1: { x: number; y: number },
  src2: { x: number; y: number },
  src3: { x: number; y: number },
  dst1: { x: number; y: number },
  dst2: { x: number; y: number },
  dst3: { x: number; y: number },
): Affine2DMatrix => {
  // Canvas 2D transform: x' = a*x + c*y + e, y' = b*x + d*y + f
  const x1 = src1.x
  const y1 = src1.y
  const x2 = src2.x
  const y2 = src2.y
  const x3 = src3.x
  const y3 = src3.y

  const X1 = dst1.x
  const Y1 = dst1.y
  const X2 = dst2.x
  const Y2 = dst2.y
  const X3 = dst3.x
  const Y3 = dst3.y

  const den = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)
  if (!Number.isFinite(den) || Math.abs(den) < 1e-8) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  }

  const a = (X1 * (y2 - y3) + X2 * (y3 - y1) + X3 * (y1 - y2)) / den
  const b = (Y1 * (y2 - y3) + Y2 * (y3 - y1) + Y3 * (y1 - y2)) / den
  const c = (X1 * (x3 - x2) + X2 * (x1 - x3) + X3 * (x2 - x1)) / den
  const d = (Y1 * (x3 - x2) + Y2 * (x1 - x3) + Y3 * (x2 - x1)) / den
  const e =
    (X1 * (x2 * y3 - x3 * y2) + X2 * (x3 * y1 - x1 * y3) + X3 * (x1 * y2 - x2 * y1)) / den
  const f =
    (Y1 * (x2 * y3 - x3 * y2) + Y2 * (x3 * y1 - x1 * y3) + Y3 * (x1 * y2 - x2 * y1)) / den

  return { a, b, c, d, e, f }
}

const applyPerspectiveAndRotateToBlob = async (input: Blob): Promise<Blob> => {
  const hVal = filterState.value.perspectiveHorizontal ?? 0
  const vVal = filterState.value.perspectiveVertical ?? 0
  const rotDeg = filterState.value.rotation ?? 0

  // 纯旋转：保持现有实现，避免改变输出尺寸/观感
  if (!hVal && !vVal) {
    return await applyRotateToBlob(input)
  }

  const bitmapOrImg = await blobToImageBitmap(input)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  // 画布放大到对角线，尽量避免透视导致的裁切
  const diag = Math.sqrt(width * width + height * height)
  const canvasSize = Math.ceil(diag)

  const canvas = document.createElement('canvas')
  canvas.width = canvasSize
  canvas.height = canvasSize
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  ctx.clearRect(0, 0, canvasSize, canvasSize)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const srcCx = width / 2
  const srcCy = height / 2
  const dstCx = canvasSize / 2
  const dstCy = canvasSize / 2

  const focal = Math.max(width, height) * 1.25
  const maxAngleRad = (Math.PI * 45) / 180 // 45deg，数值更稳
  const angleY = (hVal / 100) * maxAngleRad
  const angleX = (vVal / 100) * maxAngleRad

  const cosY = Math.cos(angleY)
  const sinY = Math.sin(angleY)
  const cosX = Math.cos(angleX)
  const sinX = Math.sin(angleX)

  const projectPoint = (x: number, y: number) => {
    // 以源图中心为原点的 3D 点（z=0 的平面）
    const X = x - srcCx
    const Y = y - srcCy
    const Z = 0

    // 绕 Y 轴旋转（对应"水平透视"），取反以与 CSS rotateY 保持一致
    const X1 = X * cosY - Z * sinY
    const Z1 = X * sinY + Z * cosY

    // 绕 X 轴旋转（对应"垂直透视"），取反以与 CSS rotateX 保持一致
    const Y2 = Y * cosX + Z1 * sinX
    const Z2 = -Y * sinX + Z1 * cosX

    const denom = focal + Z2
    const safeDenom = Math.abs(denom) < 1e-4 ? (denom >= 0 ? 1e-4 : -1e-4) : denom
    const scale = focal / safeDenom

    return {
      x: dstCx + X1 * scale,
      y: dstCy + Y2 * scale,
    }
  }

  const stripCount = 64
  const stripW = width / stripCount

  // 网格近似：用细竖条上的两次三角形仿射，组合出透视映射
  for (let i = 0; i < stripCount; i++) {
    const x0 = i * stripW
    const x1 = (i + 1) * stripW
    const sw = x1 - x0
    if (sw <= 0) continue

    const p00 = projectPoint(x0, 0)
    const p10 = projectPoint(x1, 0)
    const p01 = projectPoint(x0, height)
    const p11 = projectPoint(x1, height)

    // triangle A: (x0,0) -> p00, (x1,0) -> p10, (x1,h) -> p11
    {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p10.x, p10.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.closePath()
      ctx.clip()

      const m = computeAffineFromTriangles(
        { x: x0, y: 0 },
        { x: x1, y: 0 },
        { x: x1, y: height },
        { x: p00.x, y: p00.y },
        { x: p10.x, y: p10.y },
        { x: p11.x, y: p11.y },
      )

      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
      ctx.drawImage(bitmapOrImg as any, x0, 0, sw, height, x0, 0, sw, height)
      ctx.restore()
    }

    // triangle B: (x0,0) -> p00, (x1,h) -> p11, (x0,h) -> p01
    {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y)
      ctx.lineTo(p11.x, p11.y)
      ctx.lineTo(p01.x, p01.y)
      ctx.closePath()
      ctx.clip()

      const m = computeAffineFromTriangles(
        { x: x0, y: 0 },
        { x: x1, y: height },
        { x: x0, y: height },
        { x: p00.x, y: p00.y },
        { x: p11.x, y: p11.y },
        { x: p01.x, y: p01.y },
      )

      ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
      ctx.drawImage(bitmapOrImg as any, x0, 0, sw, height, x0, 0, sw, height)
      ctx.restore()
    }
  }

  if (!rotDeg) {
    const outBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('导出透视图片失败'))),
        'image/png',
        0.92,
      )
    })
    return outBlob
  }

  // 先透视后旋转：旋转画布再次放大，避免旋转裁切
  const rotDiag = Math.sqrt(canvasSize * canvasSize + canvasSize * canvasSize)
  const finalSize = Math.ceil(rotDiag)
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = finalSize
  finalCanvas.height = finalSize
  const finalCtx = finalCanvas.getContext('2d')
  if (!finalCtx) throw new Error('Canvas 不可用')

  finalCtx.clearRect(0, 0, finalSize, finalSize)
  finalCtx.imageSmoothingEnabled = true
  finalCtx.imageSmoothingQuality = 'high'

  const cx = finalSize / 2
  const cy = finalSize / 2
  const rotRad = (rotDeg * Math.PI) / 180

  finalCtx.save()
  finalCtx.translate(cx, cy)
  finalCtx.rotate(rotRad)
  finalCtx.drawImage(canvas, -canvasSize / 2, -canvasSize / 2)
  finalCtx.restore()

  const outBlob = await new Promise<Blob>((resolve, reject) => {
    finalCanvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('导出透视/旋转图片失败'))),
      'image/png',
      0.92,
    )
  })

  return outBlob
}

// 确认裁切
const handleCropConfirm = async () => {
  if (!pictureCropperRef.value || !cropImageFile.value) {
    ElMessage.warning('裁切器未就绪')
    return
  }

  cropping.value = true
  try {
    // 获取裁切器实例
    const cropperInstance = getCropperInstance()
    if (!cropperInstance) {
      ElMessage.error('无法获取裁切器实例')
      cropping.value = false
      return
    }

    let croppedFile: File | null = null
    let previewUrl: string = ''

    // 方法1: 尝试使用 getFile (推荐，直接返回 File 对象)
    if (typeof cropperInstance.getFile === 'function') {
      try {
        croppedFile = await cropperInstance.getFile({
          width: 2000,
          height: 2000,
          mimeType: cropImageFile.value.type || 'image/png',
          quality: 0.9,
        })
        if (croppedFile) {
          previewUrl = URL.createObjectURL(croppedFile)
        }
      } catch (err) {
        // getFile 失败，继续尝试其他方法
      }
    }

    // 方法2: 尝试使用 getBlob
    if (!croppedFile && typeof cropperInstance.getBlob === 'function') {
      try {
        const blob = await cropperInstance.getBlob({
          width: 2000,
          height: 2000,
          // 圆形/椭圆裁切需要透明背景，强制 PNG
          mimeType: (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (cropImageFile.value.type || 'image/png'),
          quality: 0.9,
        })
        if (blob) {
          const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (cropImageFile.value?.type || 'image/png')
          const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
          croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
          previewUrl = URL.createObjectURL(blob)
        }
      } catch (err) {
        // getBlob 失败，继续尝试其他方法
      }
    }

    // 方法3: 使用 getDataURL 然后转换为 Blob
    if (!croppedFile && typeof cropperInstance.getDataURL === 'function') {
      try {
        const dataURL = cropperInstance.getDataURL({
          width: 2000,
          height: 2000,
          // 圆形/椭圆裁切需要透明背景，强制 PNG
          mimeType: (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (cropImageFile.value.type || 'image/png'),
          quality: 0.9,
        })
        if (dataURL) {
          // 将 dataURL 转换为 Blob
          const response = await fetch(dataURL)
          const blob = await response.blob()
          const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (cropImageFile.value?.type || 'image/png')
          const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
          croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
          previewUrl = dataURL
        }
      } catch (err) {
        // getDataURL 失败，继续尝试其他方法
      }
    }

    // 方法4: 尝试访问底层 cropper 实例的 getCroppedCanvas
    if (!croppedFile) {
      // 尝试从组件实例中获取底层 cropper
      const nativeCropper = pictureCropperRef.value.cropper ||
                           pictureCropperRef.value.$cropper ||
                           (cropperInstance.cropper ? cropperInstance.cropper : null)

      if (nativeCropper && typeof nativeCropper.getCroppedCanvas === 'function') {
        try {
          const canvas = nativeCropper.getCroppedCanvas({
            width: 2000,
            height: 2000,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
          })
          if (canvas) {
            const mime = (selectedAspectRatio.value === 'circle' || selectedAspectRatio.value.endsWith('-ellipse')) ? 'image/png' : (cropImageFile.value?.type || 'image/png')
            const blob = await new Promise<Blob>((resolve, reject) => {
              canvas.toBlob((blob: Blob | null) => {
                if (blob) {
                  resolve(blob)
                } else {
                  reject(new Error('Canvas toBlob failed'))
                }
              }, mime, 0.9)
            })
            const ext = mime.includes('/') ? mime.split('/')[1] : 'png'
            croppedFile = new File([blob], `main_photo_${Date.now()}.${ext}`, { type: mime })
            previewUrl = URL.createObjectURL(blob)
          }
        } catch (err) {
          // 底层 cropper 实例方法失败
        }
      }
    }

    if (!croppedFile) {
      ElMessage.error('无法获取裁切结果，请重试')
      cropping.value = false
      return
    }

    // 几何变换（在形状与边距处理之前）：透视 + 旋转
    if (!isTransformStateDefault()) {
      try {
        const transformedBlob = await applyPerspectiveAndRotateToBlob(croppedFile)
        const transformedFile = new File(
          [transformedBlob],
          `main_photo_${Date.now()}.png`,
          { type: 'image/png' },
        )
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = transformedFile
        previewUrl = URL.createObjectURL(transformedBlob)
      } catch (e: any) {
        ElMessage.error('透视/几何变换处理失败：' + (e?.message || '未知错误'))
        // 出错时继续后续流程，使用未变换结果
      }
    }

    // 圆形裁切：真正输出圆形区域（圆外透明 PNG）
    if (selectedAspectRatio.value === 'circle') {
      try {
        const maskedBlob = await applyCircleMaskToBlob(croppedFile)
        const maskedFile = new File([maskedBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        // 预览 URL：释放旧的预览，避免泄漏
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = maskedFile
        previewUrl = URL.createObjectURL(maskedBlob)
      } catch (e: any) {
        ElMessage.error('圆形裁切处理失败：' + (e?.message || '未知错误'))
        cropping.value = false
        return
      }
    } else if (selectedAspectRatio.value.endsWith('-ellipse')) {
      try {
        const maskedBlob = await applyEllipseMaskToBlob(croppedFile)
        const maskedFile = new File([maskedBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        // 预览 URL：释放旧的预览，避免泄漏
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = maskedFile
        previewUrl = URL.createObjectURL(maskedBlob)
      } catch (e: any) {
        ElMessage.error('椭圆裁切处理失败：' + (e?.message || '未知错误'))
        cropping.value = false
        return
      }
    } else if (selectedAspectRatio.value === 'free') {
      try {
        if (enableRoundedRect.value && roundedRadius.value > 0) {
          const roundedFile = await applyRoundedRectMaskToBlob(croppedFile, roundedRadius.value)
          if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
          }
          croppedFile = roundedFile
          previewUrl = URL.createObjectURL(roundedFile)
        }

        const squareBlob = await applyFreeCropSquareBlob(croppedFile)
        const squareFile = new File([squareBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = squareFile
        previewUrl = URL.createObjectURL(squareBlob)
      } catch (e: any) {
        ElMessage.error('自由裁切处理失败：' + (e?.message || '未知错误'))
        cropping.value = false
        return
      }
    }

    // 自由 / 1:1 比例下，按需应用圆角矩形遮罩（失败时回退为普通矩形，不中断流程）
    if (
      selectedAspectRatio.value === '1:1' &&
      enableRoundedRect.value &&
      roundedRadius.value > 0
    ) {
      try {
        const roundedFile = await applyRoundedRectMaskToBlob(croppedFile, roundedRadius.value)
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = roundedFile
        previewUrl = URL.createObjectURL(roundedFile)
      } catch (e: any) {
        ElMessage.error('圆角处理失败：' + (e?.message || '未知错误'))
        // 不中断，继续使用未圆角的矩形结果
      }
    }

    // 边距：输出尺寸不变，内容缩小居中，四周白色留边（所有比例可用）
    if (enableMargin.value && marginPercent.value > 0) {
      try {
        const marginBlob = await applyMarginToBlob(croppedFile, marginPercent.value)
        const marginFile = new File([marginBlob], `main_photo_${Date.now()}.png`, { type: 'image/png' })
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl)
        }
        croppedFile = marginFile
        previewUrl = URL.createObjectURL(marginBlob)
      } catch (e: any) {
        ElMessage.error('边距处理失败：' + (e?.message || '未知错误'))
        // 不中断，继续使用未加边距的结果
      }
    }

    // 应用滤镜到最终图片
    const filteredFile = await applyFiltersToImage(croppedFile)

    // 设置主图
    const finalPreviewUrl = URL.createObjectURL(filteredFile)
    setMainPhotoFromFile(filteredFile, finalPreviewUrl)

    // 释放旧的 cropFile 预览（如果有）
    if (previewUrl && previewUrl !== finalPreviewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    // 关闭对话框
    cropDialogVisible.value = false
    cropping.value = false

    ElMessage.success('图片裁切完成')
  } catch (err: any) {
    ElMessage.error('裁切失败：' + (err?.message || '未知错误'))
    cropping.value = false
  }

}

// 将滤镜应用到图片文件
const applyFiltersToImage = async (file: File): Promise<File> => {
  // 如果没有做任何修改，直接返回原文件
  if (isFilterStateDefault()) {
    return file
  }

  const bitmapOrImg = await blobToImageBitmap(file)
  const width = (bitmapOrImg as any).width
  const height = (bitmapOrImg as any).height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 不可用')

  // 应用滤镜
  ctx.filter = `brightness(${filterState.value.brightness}%) contrast(${filterState.value.contrast}%) saturate(${filterState.value.saturation}%)`

  ctx.drawImage(bitmapOrImg as any, 0, 0, width, height)

  // 按颜色分组应用 HSL 三色调节
  try {
    const imageData = ctx.getImageData(0, 0, width, height)
    const adjusted = applyHslPerColorToImageData(imageData)
    ctx.putImageData(adjusted, 0, 0)
  } catch {
    // 获取/写入像素失败时忽略 HSL 调整，保留基础滤镜效果
  }

  // 重置 filter 以免影响后续操作（虽然这里是一次性的）
  ctx.filter = 'none'

  const mime = file.type || 'image/png'
  const outBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('应用滤镜失败'))), mime, 0.92)
  })

  return new File([outBlob], file.name, { type: mime })
}

// 取消裁切
const handleCropCancel = () => {
  cropDialogVisible.value = false
}

// 关闭裁切对话框时清理
const handleCropDialogClose = () => {
  resetCropHistorySession()
  // 清理预览URL
  if (cropImageSrc.value && cropImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropImageSrc.value)
  }
  cropImageSrc.value = ''
  cropImageFile.value = null

  if (typeof window !== 'undefined' && livePreviewTimer) {
    window.clearTimeout(livePreviewTimer)
    livePreviewTimer = undefined
  }
  clearLivePreviewUrl()
}

// 附件图片处理函数
const handleAdditionalPhotoChange = (uploadFile: UploadFile, uploadFiles: UploadFile[]) => {
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
  // 如果是编辑模式，需要调用删除接口
  if (route.params.id) {
    try {
      await ElMessageBox.confirm('确定要删除这张图片吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      const goodsId = route.params.id as string
      await deleteAdditionalPhoto(goodsId, photoId)
      existingAdditionalPhotos.value = existingAdditionalPhotos.value.filter((p) => p.id !== photoId)
      ElMessage.success('删除成功')
    } catch (err: any) {
      // 用户取消删除或删除失败
      if (err !== 'cancel') {
        ElMessage.error('删除失败：' + (err.message || '未知错误'))
      }
    }
  } else {
    // 新建模式，只从UI中移除（因为还没有创建谷子，无法删除）
    // 理论上新建模式下不应该有已有图片，但为了代码健壮性保留此逻辑
    existingAdditionalPhotos.value = existingAdditionalPhotos.value.filter((p) => p.id !== photoId)
  }
}

// 处理已有图片标签修改
const handlePhotoLabelChange = async (photo: ExistingPhoto) => {
  // 如果是编辑模式，且标签确实发生了变化，调用更新接口
  if (route.params.id && photo.originalLabel !== photo.label) {
    try {
      const goodsId = route.params.id as string
      const label = photo.label?.trim() || ''
      await updateAdditionalPhotoLabel(goodsId, [photo.id], label)
      // 更新原始标签值
      photo.originalLabel = photo.label
      ElMessage.success('标签更新成功')
    } catch (err: any) {
      // 更新失败，恢复原始标签
      photo.label = photo.originalLabel
      ElMessage.error('标签更新失败：' + (err.message || '未知错误'))
    }
  }
}

/** 新建或合并成功后的统一处理：上传主图/附件、提示、跳转 */
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

const buildSubmitData = async (mode: 'draft' | 'publish') => {
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
    ip_id: restForm.ip,
    character_ids: restForm.characters,
    category_id: restForm.category,
    theme_id: themeId,
  }
  if (!restForm.purchase_date) {
    delete (submitData as any).purchase_date
  }
  return submitData
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
        pendingCreatePayload.value = { ...submitData }
        duplicateCandidates.value = data.candidates
        duplicateSelectedId.value = null
        duplicateDialogVisible.value = true
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

const setDuplicateSelectedId = (id: string | null) => {
  duplicateSelectedId.value = id
}

const formatCandidateCreatedAt = (createdAt: string) => {
  if (!createdAt) return '-'
  try {
    const d = new Date(createdAt)
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return createdAt
  }
}

/** 重复弹窗：合并到所选候选 */
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
    await onCreateOrMergeSuccess(result, 'publish')
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

/** 重复弹窗：仍然新建一条 */
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
    await onCreateOrMergeSuccess(result, 'publish')
  } catch (err: any) {
    ElMessage.error(err.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleReset = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置表单吗？当前填写内容将恢复为进入页面时的状态（未保存的修改会丢失）。',
      '重置表单',
      {
        type: 'warning',
        confirmButtonText: '重置',
        cancelButtonText: '取消',
      }
    )
    formRef.value?.resetFields()
  } catch {
    /* 用户取消 */
  }
}

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要离开吗？未保存的修改将丢失。',
      '离开页面',
      {
        type: 'warning',
        confirmButtonText: '离开',
        cancelButtonText: '留在页面',
      }
    )
    router.back()
  } catch {
    /* 用户取消 */
  }
}

const handleMobileMoreCommand = (command: string) => {
  if (command === 'cancel') void handleCancel()
  else if (command === 'reset') void handleReset()
}

const goDrafts = () => {
  router.push({ name: 'GoodsDrafts' })
}

// 处理附件图片上传
const handleAdditionalPhotosUpload = async (goodsId: string) => {
  // 如果没有新上传的图片，直接返回
  if (newAdditionalPhotoFiles.value.length === 0) {
    return
  }

  try {
    // 每张图片单独上传，以支持独立的标签
    for (const photo of newAdditionalPhotoFiles.value) {
      const label = photo.label?.trim() || ''
      await uploadAdditionalPhotos(goodsId, [photo.file], { label })
    }
  } catch (err: any) {
    ElMessage.error('上传附件图片失败：' + (err.message || '未知错误'))
    throw err
  }
}

const syncWindowWidth = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
  void nextTick(() => checkMobileFormDockScroll())
}

/** 移动端：滑至底部附近才显示底部渐变 + 双按钮（与 CloudShowcase 分页器逻辑一致） */
const mobileFormDockVisible = ref(false)
const MOBILE_FORM_DOCK_BOTTOM_THRESHOLD_PX = 100

const checkMobileFormDockScroll = () => {
  if (typeof window === 'undefined') return
  if (!isMobile.value) {
    mobileFormDockVisible.value = false
    return
  }
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  const distanceToBottom = documentHeight - (scrollTop + windowHeight)
  mobileFormDockVisible.value = distanceToBottom <= MOBILE_FORM_DOCK_BOTTOM_THRESHOLD_PX
}

const handleWindowScrollForDock = () => {
  checkMobileFormDockScroll()
}

onMounted(async () => {
  syncWindowWidth()
  window.addEventListener('resize', syncWindowWidth)
  window.addEventListener('scroll', handleWindowScrollForDock, { passive: true })
  // 加载基础数据
  try {
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
  } catch (err) {
    ElMessage.error('加载基础数据失败')
  }

  await locationStore.fetchNodes()

  // 如果是新增模式，预设备注模板
  if (!route.params.id) {
    formData.value.notes = '店铺：\n工艺：\n画师：\n主题：'
  }

  // 如果是编辑模式，加载数据
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

      // 加载附件图片
      if (data.additional_photos && data.additional_photos.length > 0) {
        existingAdditionalPhotos.value = data.additional_photos.map((photo) => ({
          ...photo,
          label: photo.label || '',
          originalLabel: photo.label || '', // 记录原始标签
        }))
      }
    } catch (err) {
      ElMessage.error('加载数据失败')
    }
  }

  await nextTick()
  checkMobileFormDockScroll()
})

// 组件卸载时清理预览URL
onUnmounted(() => {
  window.removeEventListener('resize', syncWindowWidth)
  window.removeEventListener('scroll', handleWindowScrollForDock)
  resetCropHistorySession()
  newAdditionalPhotoFiles.value.forEach((photo) => {
    if (photo.preview) {
      URL.revokeObjectURL(photo.preview)
    }
  })
  // 清理裁切预览URL
  if (cropImageSrc.value && cropImageSrc.value.startsWith('blob:')) {
    URL.revokeObjectURL(cropImageSrc.value)
  }
  // 清理实时输出预览URL
  if (typeof window !== 'undefined' && livePreviewTimer) {
    window.clearTimeout(livePreviewTimer)
    livePreviewTimer = undefined
  }
  clearLivePreviewUrl()
  // 清理主图预览URL
  mainPhotoList.value.forEach((file) => {
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
  })
})
</script>

<style scoped>
.goods-form {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 移动端：为底部渐变与按钮区预留滚动空间（与云展柜分页区类似） */
.goods-form--mobile-dock {
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

.goods-form-header {
  margin-bottom: 16px;
}

.goods-form-header--mobile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.goods-form-header--mobile .goods-form-title {
  flex: 1;
  min-width: 0;
}

.goods-form-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.header-drafts-btn {
  padding: 6px 10px;
  font-size: 14px;
}

.header-more-btn {
  font-size: 20px;
}

.goods-form-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-gold);
}

.goods-el-form {
  margin-top: 4px;
}

/* 底部操作栏：横向排列；窄屏换行时用居中对齐，避免最后一个按钮单独落在第二行时贴左 */
.sticky-action-bar {
  margin-top: 12px;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.sticky-action-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

.sticky-action-inner :deep(.el-button) {
  margin: 0;
}

@media (max-width: 768px) {
  .sticky-action-inner {
    justify-content: center;
  }

  .sticky-action-inner :deep(.el-button) {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* 移动端：底部渐变遮罩 + 按钮浮于其上（无白色胶囊底框） */
.mobile-form-dock-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px) + 8px);
  z-index: 999;
  pointer-events: none;
  background: transparent;
  transform: translateY(calc(100% + 24px));
  opacity: 0;
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.mobile-form-dock-wrap--visible {
  transform: translateY(0);
  opacity: 1;
}

.mobile-form-dock-stack {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px 10px;
  box-sizing: border-box;
  isolation: isolate;
}

/* 与页面底色 --secondary-gray / #F5F5F7 一致；自下而上过渡到透明，并与白卡片衔接 */
.mobile-form-dock-fade {
  position: absolute;
  z-index: 0;
  left: 50%;
  margin-left: -50vw;
  bottom: 0;
  width: 100vw;
  height: min(200px, 42vh);
  min-height: 140px;
  pointer-events: none;
  background: linear-gradient(
    to top,
    var(--secondary-gray) 0%,
    rgba(245, 245, 247, 0.92) 28%,
    rgba(245, 245, 247, 0.55) 55%,
    rgba(255, 255, 255, 0) 100%
  );
}

.mobile-form-dock-actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: stretch;
  gap: 10px;
  width: 100%;
  pointer-events: auto;
  background: transparent;
}

.mobile-form-dock-btn {
  flex: 1;
  min-height: 44px;
  margin: 0;
  border-radius: 999px !important;
  font-size: 14px;
  font-weight: 600;
}

/* 覆盖 .goods-form 内对 .el-button 的全局圆角，避免底部条被切成方角白条感 */
.goods-form .mobile-form-dock-wrap :deep(.mobile-form-dock-btn.el-button) {
  border-radius: 999px !important;
}

/* 次要：极浅紫底 + 品牌紫字，无描边 */
.mobile-form-dock-btn--draft {
  flex: 4;
  color: #a289ff !important;
  background: #f7f3ff !important;
  border: none !important;
  box-shadow: none !important;
}

.mobile-form-dock-btn--draft:hover,
.mobile-form-dock-btn--draft:focus {
  color: #a289ff !important;
  background: rgba(162, 137, 255, 0.12) !important;
  border: none !important;
}

/* 主 CTA：主题香槟金（与 variables / 全站 primary 一致）+ 白字 */
.mobile-form-dock-btn--publish {
  flex: 6;
  --el-button-bg-color: var(--primary-gold);
  --el-button-border-color: var(--primary-gold);
  --el-button-hover-bg-color: var(--primary-gold-dark);
  --el-button-hover-border-color: var(--primary-gold-dark);
  --el-button-active-bg-color: var(--primary-gold-dark);
  --el-button-active-border-color: var(--primary-gold-dark);
  color: #ffffff !important;
  background-color: var(--primary-gold) !important;
  border-color: var(--primary-gold) !important;
}

.mobile-form-dock-btn--publish:hover,
.mobile-form-dock-btn--publish:focus {
  color: #ffffff !important;
  background-color: var(--primary-gold-dark) !important;
  border-color: var(--primary-gold-dark) !important;
}

@supports not (bottom: env(safe-area-inset-bottom)) {
  .mobile-form-dock-wrap {
    bottom: 72px;
  }
}

/* 分区卡片布局 */
.form-section {
  margin-bottom: 20px;
  padding: 16px 18px 18px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(17, 24, 39, 0.04);
}

.form-section--images {
  background: radial-gradient(circle at top left, #ffffff, #fafbff);
}

.form-section-header {
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.form-section-title {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-section-subtitle {
  margin: 0;
  font-size: 12px;
  color: #909399;
}

.form-section-header::before {
  content: '';
  width: 3px;
  height: 20px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--primary-gold), #d9c18a);
  align-self: center;
}

.form-actions-inline {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-actions-inline :deep(.el-button) {
  border-radius: 999px;
}

/* 统一表单控件风格 */
.goods-form :deep(.el-form-item) {
  margin-bottom: 26px;
}

.goods-form :deep(.el-input__wrapper),
.goods-form :deep(.el-textarea__inner),
.goods-form :deep(.el-select .el-input__wrapper),
.goods-form :deep(.el-input-number__decrease),
.goods-form :deep(.el-input-number__increase),
.goods-form :deep(.el-date-editor.el-input__wrapper),
.goods-form :deep(.el-date-editor.el-input) {
  border-radius: 10px;
  border-color: #e5e5e5;
  background-color: #ffffff;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.goods-form :deep(.el-input__wrapper:hover),
.goods-form :deep(.el-textarea__inner:hover),
.goods-form :deep(.el-select .el-input__wrapper:hover),
.goods-form :deep(.el-date-editor.el-input__wrapper:hover) {
  border-color: #d0d0d7;
  box-shadow: 0 0 0 1px rgba(208, 208, 215, 0.3);
}

.goods-form :deep(.el-input.is-focus .el-input__wrapper),
.goods-form :deep(.el-select .el-input.is-focus .el-input__wrapper),
.goods-form :deep(.el-textarea__inner:focus),
.goods-form :deep(.el-date-editor.el-input__wrapper.is-active) {
  border-color: var(--primary-gold);
  box-shadow:
    0 0 0 1px rgba(195, 160, 80, 0.35),
    0 10px 18px rgba(0, 0, 0, 0.06);
}

.goods-form :deep(.el-button) {
  border-radius: 10px;
}

/* Label 与必填星号弱化 */
.goods-form :deep(.el-form-item__label) {
  color: #606266;
  font-weight: 500;
  font-size: 13px;
}

.goods-form :deep(.el-form-item__label .el-form-item__required-star) {
  color: #f56c6c;
  font-size: 12px;
  margin-left: 2px;
}

.goods-form :deep(.el-form-item.is-required .el-form-item__label) {
  position: relative;
}

/* 图标化表单项 */
.field-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-icon {
  flex-shrink: 0;
  font-size: 16px;
  color: #909399;
}

.category-chip {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: #f7f7fb;
  border: 1px solid #ebeef5;
  font-size: 12px;
  color: #606266;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px #e0e0e0;
}

.chip-text {
  white-space: nowrap;
}

.main-photo-preview {
  margin-top: 12px;
  width: 160px;
  height: 160px;
}

.main-photo-preview .el-image {
  width: 100%;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.main-photo-card-shell {
  display: block;
  width: 220px;
}

.hide-upload-trigger :deep(.el-upload--picture-card) {
  display: none;
}

.main-photo-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.main-photo-actions {
  width: 220px;
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.main-photo-preview .el-image {
  width: 100%;
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.main-photo-uploader :deep(.el-upload--picture-card) {
  width: 220px;
  height: 220px;
  border-radius: 16px;
  border: 1px dashed #e0e3f0;
  border-color: #e0e3f0;
  background: #fafbff;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background-color 0.16s ease,
    transform 0.16s ease;
}

.main-photo-uploader :deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-gold);
  background: #fdfaf3;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.main-photo-uploader :deep(.el-upload--picture-card .el-icon) {
  font-size: 26px;
  color: #b1b5c6;
}

.main-photo-uploader :deep(.el-upload-list--picture-card) {
  display: block;
  width: 220px;
}

.main-photo-uploader :deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 220px;
  height: 220px;
  margin: 0;
  border-radius: 16px;
}

.main-photo-uploader :deep(.el-upload-list--picture-card .el-upload-list__item-thumbnail) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 统一附件加号卡片的虚线更轻、更稀疏 */
.additional-photo-upload :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border-style: dashed;
  border-width: 1px;
  border-color: #e7e9f4;
  background-color: #fbfbff;
}

:deep(.el-upload--picture-card) {
  border-color: var(--border-color);
}

:deep(.el-upload--picture-card:hover) {
  border-color: var(--primary-gold);
}

/* 附件图片样式 */
.additional-photos-section {
  width: 100%;
}

.existing-photos,
.new-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .existing-photos,
  .new-photos {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}

.photo-item {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.photo-preview {
  width: 100%;
  height: 120px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

@media (max-width: 768px) {
  .photo-preview {
    height: 100px;
  }
}

.photo-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.photo-label-input {
  flex: 1;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
}

.additional-photo-upload {
  display: inline-block;
}

.additional-photo-upload :deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border-style: dashed;
}

/* 状态分段选择器视觉（基于 el-radio-button） */
.status-segmented {
  display: inline-flex;
  gap: 8px;
}

.status-segmented :deep(.el-radio-button__inner) {
  border-radius: 999px !important;
  border: none;
  background-color: transparent;
  box-shadow: none;
  padding: 8px 14px;
  font-size: 13px;
  color: #606266;
}

.status-segmented :deep(.el-radio-button:first-child .el-radio-button__inner),
.status-segmented :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 999px !important;
}

.status-segmented :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #a396ff 0%, var(--primary-gold) 100%);
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(163, 150, 255, 0.35);
}

.status-segmented :deep(.el-radio-button__inner:hover) {
  background-color: rgba(0, 0, 0, 0.03);
}

@media (max-width: 768px) {
  .additional-photo-upload :deep(.el-upload--picture-card) {
    width: 100px;
    height: 100px;
  }
}

/* 主图选择抽屉样式（参考品类管理页面） */
.action-sheet-content {
  background: #f8f8f8;
  padding-bottom: env(safe-area-inset-bottom);
}

.sheet-header {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: #909399;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.sheet-menu {
  background: #fff;
}

.sheet-item {
  padding: 16px;
  text-align: center;
  font-size: 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.sheet-item:active {
  background: #f5f5f5;
}

.sheet-cancel {
  margin-top: 8px;
  background: #fff;
  padding: 16px;
  text-align: center;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}

.sheet-cancel:active {
  background: #f5f5f5;
}

/* 图片裁切对话框样式 */
.crop-dialog {
  z-index: 3000;
}

.crop-container {
  width: 100%;
  padding-top: 4px;
}

.crop-layout-inner {
  display: flex;
  gap: 18px;
}

.crop-left-panel {
  flex: 0 0 360px;
  min-width: 0;
  max-height: 560px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding-right: 8px;
}

.crop-right-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  gap: 14px;
}

.crop-main-view,
.crop-preview-view {
  flex: 1;
  min-height: 0;
}

.crop-main-view {
  border-radius: 14px;
  overflow: hidden;
  background: #f8f8f8;
}

.crop-preview-view {
  display: flex;
  flex-direction: column;
}

.crop-preview-view .live-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.crop-preview-view .live-preview-card {
  flex: 1;
}

.crop-preview-view .live-preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 右侧并排时，让裁切框外层与预览卡片外层在视觉尺寸上尽量一致 */
.crop-right-panel .cropper-wrapper {
  height: 100%;
  margin: 0;
}

.crop-right-panel .live-preview-card {
  min-height: 0;
}

@media (max-width: 768px) {
  .crop-layout-inner {
    flex-direction: column;
  }

  .crop-left-panel {
    max-height: none;
    overflow: visible;
  }
}

.crop-glass-panel {
  position: relative;
  padding: 18px 20px 20px;
  border-radius: 18px;
  background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.32), rgba(255, 255, 255, 0.08));
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.22),
    0 0 0 1px rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.crop-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.hsl-panel {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}

.hsl-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.hsl-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.perspective-panel {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(0, 0, 0, 0.06);
}

.perspective-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.hsl-color-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 4px;
}

.hsl-color-tab {
  border: none;
  padding: 4px 10px;
  border-radius: 999px;
  background: #f4f4f5;
  font-size: 12px;
  color: #606266;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

.hsl-color-tab--red {
  color: #c45b5b;
}

.hsl-color-tab--orange {
  color: #c27a3b;
}

.hsl-color-tab--yellow {
  color: #b89b2f;
}

.hsl-color-tab--green {
  color: #4a9b6b;
}

.hsl-color-tab--cyan {
  color: #3a8f9c;
}

.hsl-color-tab--blue {
  color: #4a74c4;
}

.hsl-color-tab--purple {
  color: #7b63c4;
}

.hsl-color-tab.is-active {
  color: #fff;
  box-shadow: 0 4px 10px rgba(163, 150, 255, 0.25);
}

.hsl-color-tab--red.is-active {
  background: linear-gradient(135deg, #d87373 0%, #c13a3a 100%);
}

.hsl-color-tab--orange.is-active {
  background: linear-gradient(135deg, #e9a45b 0%, #cf7c2c 100%);
}

.hsl-color-tab--yellow.is-active {
  background: linear-gradient(135deg, #ecd47a 0%, #d4b23a 100%);
}

.hsl-color-tab--green.is-active {
  background: linear-gradient(135deg, #7bc193 0%, #45a264 100%);
}

.hsl-color-tab--cyan.is-active {
  background: linear-gradient(135deg, #65b9c7 0%, #3c90a0 100%);
}

.hsl-color-tab--blue.is-active {
  background: linear-gradient(135deg, #7d9ee0 0%, #496fbe 100%);
}

.hsl-color-tab--purple.is-active {
  background: linear-gradient(135deg, #a396ff 0%, #7f63d6 100%);
}

.hsl-color-reset-btn {
  margin-left: auto;
}

.hsl-sliders {
  margin-top: 4px;
}

.crop-header-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.crop-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.crop-subtitle {
  font-size: 12px;
  color: #909399;
}

.crop-history-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.crop-history-actions :deep(.el-button) {
  border-radius: 999px;
}

.aspect-ratio-selector {
  margin-bottom: 20px;
  padding: 14px 14px 12px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.ratio-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
}

.ratio-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ratio-buttons :deep(.el-button) {
  border-radius: 999px;
  border-color: transparent;
  background-color: rgba(255, 255, 255, 0.12);
  color: #606266;
  box-shadow: none;
}

.ratio-buttons :deep(.el-button.el-button--primary) {
  color: #fff;
  background-image: linear-gradient(135deg, var(--primary-gold), rgba(255, 255, 255, 0.9));
  border-color: var(--primary-gold);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.ratio-buttons :deep(.el-button:hover) {
  background-color: rgba(255, 255, 255, 0.24);
}

.image-filters {
  margin-bottom: 20px;
  padding: 14px 14px 10px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.filter-item .el-slider {
  flex: 1;
  margin-left: 12px;
  margin-right: 12px;
}

.filter-reset {
  text-align: right;
  margin-top: -5px;
}

/* 图像微调滑块：金色前景 + 灰色后段轨道 */
.image-filters :deep(.el-slider__runway) {
  background-color: #e4e7ed; /* 灰色基准轨道，形成“后面一段灰色” */
}

.image-filters :deep(.el-slider__bar) {
  background-color: var(--primary-gold); /* 已调节部分为金色 */
}

.image-filters :deep(.el-slider__button) {
  border-color: transparent;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.22);
}

/* 追加：比例分段选择器的胶囊容器与几何图标 */
.aspect-ratio-selector {
  margin-bottom: 14px;
  padding: 10px 10px 8px;
  background: transparent;
  border-radius: 14px;
}

.ratio-segmented {
  width: 100%;
}

.ratio-segmented-track {
  position: relative;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  padding: 2px;
}

.ratio-segmented-thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc((100% - 4px) / 5);
  border-radius: 999px;
  background-color: var(--primary-gold);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  transform: translateX(calc(var(--active-index, 0) * 100%));
  transition: transform 0.18s ease-out;
  pointer-events: none;
}

.ratio-segmented-item {
  position: relative;
  z-index: 1;
  border: none;
  background: transparent;
  color: #606266;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 4px;
  font-size: 12px;
  cursor: pointer;
}

.ratio-segmented-item.is-active {
  color: #fff;
}

.ratio-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid currentColor;
}

.ratio-icon--free {
  border-style: dashed;
}

.ratio-icon--1\:1 {
  border-radius: 2px;
}

.ratio-icon--circle {
  border-radius: 999px;
}

.ratio-icon--47\:65-ellipse,
.ratio-icon--63\:93-ellipse {
  border-radius: 999px;
  transform: scaleX(1.3);
}

/* 追加：滤镜区域标题、右上角重置图标与数值常显 */
.image-filters {
  margin-bottom: 12px;
  padding: 10px 10px 8px;
}

.filters-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.filters-title {
  font-size: 13px;
  color: #606266;
}

.filter-reset-btn {
  color: var(--primary-gold);
}

.filter-item {
  margin-bottom: 6px;
}

.filter-item .el-slider {
  margin-right: 8px;
}

.filter-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #909399;
}

.image-filters :deep(.el-slider__runway) {
  position: relative;
}

.image-filters :deep(.el-slider__runway::before) {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 50%;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.08);
  transform: translateX(-0.5px);
}

/* 让圆角大小滑块与图像微调滑块风格保持一致 */
.rounded-rect-settings :deep(.el-slider__runway),
.margin-settings :deep(.el-slider__runway) {
  position: relative;
}

.rounded-rect-settings :deep(.el-slider__runway::before),
.margin-settings :deep(.el-slider__runway::before) {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 50%;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.08);
  transform: translateX(-0.5px);
}

.rounded-rect-settings :deep(.el-slider__bar),
.margin-settings :deep(.el-slider__bar) {
  background-color: var(--primary-gold);
}

.rounded-rect-settings :deep(.el-slider__button),
.margin-settings :deep(.el-slider__button) {
  border-color: transparent;
  background-color: #ffffff;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.22);
}

/* 圆角矩形设置区域 */
.rounded-rect-settings {
  margin-bottom: 12px;
  padding: 10px 10px 8px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

/* 边距设置区域：复用圆角设置的布局风格 */
.margin-settings {
  margin-bottom: 12px;
  padding: 10px 10px 8px;
  background: rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.22);
}

/* 实时输出预览 */
.live-preview {
  margin-top: 12px;
}

.live-preview-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.live-preview-title {
  font-size: 13px;
  color: #606266;
}

.live-preview-hint {
  font-size: 12px;
  color: #909399;
}

.live-preview-card {
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background:
    linear-gradient(45deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(15, 23, 42, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(15, 23, 42, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(15, 23, 42, 0.05) 75%),
    #f7f8fa;
  background-size: 18px 18px;
  background-position: 0 0, 0 9px, 9px -9px, -9px 0px, 0 0;
  padding: 10px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.live-preview-img {
  width: 100%;
  height: 160px;
  object-fit: contain;
  display: block;
  border-radius: 10px;
  box-shadow:
    0 0 0 1px rgba(15, 23, 42, 0.18),
    0 12px 28px rgba(15, 23, 42, 0.18);
}

.live-preview-placeholder {
  font-size: 12px;
  color: #909399;
}

.rounded-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.rounded-title {
  font-size: 13px;
  color: #606266;
}

.rounded-radius-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rounded-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.rounded-radius-row .el-slider {
  flex: 1;
}

.rounded-value {
  width: 40px;
  text-align: right;
  font-size: 12px;
  color: #909399;
}

.rounded-radius-row.is-disabled {
  opacity: 0.5;
}

/* 强制应用 CSS filter 到 cropper 的预览图 */
/* 注意：vue-picture-cropper 内部结构可能比较复杂，通常需要作用于 img 元素 */
:deep(.vue-picture-cropper-wrap img),
:deep(.cropper-view-box img),
:deep(.cropper-canvas img) {
  transition: filter 0.2s;
  /* 这里使用 v-bind 绑定 CSS 变量或者直接通过 js 动态修改 style，
     上面的 :style="cropperStyle" 其实只能加到最外层容器，
     往往不能直接继承到内部 img。
     所以我们需要一个更强力的方法：使用 CSS 变量或者通过父级 class 渗透。
  */
  /* 由于 CSS 变量在 scoped 样式中绑定到 :style 可能有作用域问题，
     这里我们采用直接在 template 中给 vue-picture-cropper 绑 style 的方式，
     但是 vue-picture-cropper 根元素可能不是 img。

     修正方案：
     Vue Picture Cropper 接受 style 属性，会应用到根 div。
     我们需要利用 CSS 继承或者选中内部 img。
     Cropper.js 的 img 不会自动继承父级 filter。

     更好的做法是利用 CSS 变量。
  */
}

/* 尝试利用 CSS 变量穿透 */
.cropper-wrapper {
  --brightness: v-bind('filterState.brightness + "%"');
  --contrast: v-bind('filterState.contrast + "%"');
  --saturate: v-bind('filterState.saturation + "%"');
  /* 圆角矩形：导出时用“最短边的一半”为上限换算像素半径；
     操作区预览也用同一公式换算为 px（由 JS 写入 --rounded-radius-px） */
  --rounded-radius: v-bind('roundedRadius + "%"'); /* 兜底（旧逻辑/极端情况下） */
  width: 100%;
  margin: 12px auto 0;
  padding: 8px;
  border-radius: 18px;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow:
    0 20px 48px rgba(15, 23, 42, 0.28),
    0 0 0 1px rgba(255, 255, 255, 0.16);
}

:deep(.cropper-canvas img),
:deep(.cropper-view-box img) {
  filter: brightness(var(--brightness)) contrast(var(--contrast)) saturate(var(--saturate)) !important;
}

@media (max-width: 768px) {
  .ratio-buttons {
    gap: 6px;
  }

  .ratio-buttons .el-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}

/* 圆形裁切：仅改变裁切框的视觉形状（导出仍为方图，圆外透明） */
.cropper-wrapper.circle-crop :deep(.cropper-view-box),
.cropper-wrapper.circle-crop :deep(.cropper-face) {
  border-radius: 50%;
}

/* 自由 / 1:1 圆角矩形预览，仅改变裁切框视觉效果，不影响最终像素裁剪顺序 */
.cropper-wrapper.rounded-rect-preview :deep(.cropper-view-box),
.cropper-wrapper.rounded-rect-preview :deep(.cropper-face) {
  border-radius: var(--rounded-radius-px, var(--rounded-radius));
}

@media (max-width: 768px) {
  .crop-dialog :deep(.el-dialog) {
    margin: 5vh auto 0;
    max-height: 90vh;
  }

  .crop-dialog :deep(.el-dialog__body) {
    padding: 14px 14px 18px;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  .ratio-label {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .crop-glass-panel {
    padding: 14px 14px 16px;
    border-radius: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.26);
}

.dialog-footer :deep(.el-button) {
  border-radius: 999px;
}

.dialog-footer :deep(.el-button--primary) {
  background-color: var(--primary-gold);
  border-color: var(--primary-gold);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.25);
}

.dialog-footer :deep(.el-button:hover) {
  opacity: 0.96;
}

@media (max-width: 768px) {
  .crop-header-row {
    flex-direction: column;
    align-items: stretch;
  }

  .crop-history-actions {
    width: 100%;
  }

  .crop-history-actions :deep(.el-button) {
    flex: 1;
  }

  .dialog-footer {
    gap: 8px;
  }

  .dialog-footer .el-button {
    flex: 1;
  }
}

/* 新建去重弹窗 */
.duplicate-dialog :deep(.el-dialog__body) {
  padding-top: 12px;
}

.duplicate-dialog-title {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--el-text-color-primary);
}

.duplicate-dialog-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.duplicate-candidates-list {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.duplicate-candidate-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: var(--el-fill-color-blank);
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
}

.duplicate-candidate-card:hover {
  background: var(--el-fill-color-light);
}

.duplicate-candidate-card.is-selected {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.06);
}

.duplicate-candidate-thumb {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.duplicate-candidate-thumb .candidate-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.duplicate-candidate-thumb .candidate-thumb-placeholder {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.duplicate-candidate-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.duplicate-candidate-card .candidate-name {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.duplicate-candidate-card .candidate-meta {
  font-size: 12px;
  color: #909399;
}

.duplicate-candidate-time {
  flex-shrink: 0;
  font-size: 12px;
  color: #909399;
}

.duplicate-dialog-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}

.duplicate-dialog-footer .el-button:first-child {
  color: #606266;
  border-color: var(--el-border-color);
}

.duplicate-dialog-footer .el-button:nth-child(2) {
  border-color: var(--el-border-color);
}

.duplicate-dialog-footer .duplicate-merge-btn {
  background-color: #E2C04A;
  border-color: #E2C04A;
  color: #1a1a1a;
}

.duplicate-dialog-footer .duplicate-merge-btn:hover,
.duplicate-dialog-footer .duplicate-merge-btn:focus {
  background-color: #D9B83D;
  border-color: #D9B83D;
  color: #1a1a1a;
}

.duplicate-dialog-footer .duplicate-merge-btn:disabled {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color-lighter);
  color: var(--el-text-color-placeholder);
}

</style>
