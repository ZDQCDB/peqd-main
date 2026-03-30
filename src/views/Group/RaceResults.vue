<template>
  <div class="race-results">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/group')">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回群体管理
          </button>
          <div class="page-info">
            <h1 class="page-title">比赛成绩管理</h1>
            <p class="page-subtitle">Race Results Management</p>
          </div>
        </div>
        <div class="header-right">
          <button v-if="activeTab === 'files'" class="upload-trigger-btn" @click="openUpload">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            上传成绩文件
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <div class="content-container">

        <!-- Tab 切换 -->
        <div class="tab-bar">
          <button :class="['tab-btn', activeTab === 'files' && 'active']" @click="switchTab('files')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>
            Excel 文件
          </button>
          <button :class="['tab-btn', activeTab === 'records' && 'active']" @click="switchTab('records')">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1.8"/><line x1="3" y1="15" x2="21" y2="15" stroke="currentColor" stroke-width="1.8"/><line x1="9" y1="9" x2="9" y2="21" stroke="currentColor" stroke-width="1.8"/></svg>
            数据库成绩
          </button>
        </div>

        <!-- ─────────── TAB 1：Excel 文件 ─────────── -->
        <template v-if="activeTab === 'files'">

        <!-- 筛选区域 -->
        <section class="filter-section">
          <div class="filter-form">
            <div class="filter-group">
              <label class="filter-label">教师姓名</label>
              <input v-model="filters.teacherName" type="text" placeholder="教师姓名" class="filter-input" @keyup.enter="handleSearch" />
            </div>
            <div v-if="isSuperAdmin" class="filter-group">
              <label class="filter-label">学校</label>
              <input v-model="filters.school" type="text" placeholder="学校名称" class="filter-input" @keyup.enter="handleSearch" />
            </div>
            <div class="filter-group filter-actions-group">
              <button class="search-btn" @click="handleSearch">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                查询
              </button>
              <button class="reset-btn" @click="resetFilters">重置</button>
            </div>
          </div>
        </section>

        <!-- 文件列表 -->
        <section class="table-section">
          <div class="table-toolbar">
            <span class="result-count">共 {{ pagination.total }} 个文件</span>
          </div>

          <div class="table-wrapper">
            <div v-if="listLoading" class="table-loading">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <table v-else class="data-table">
              <thead>
                <tr>
                  <th>文件名</th>
                  <th v-if="isSuperAdmin">学校</th>
                  <th>上传教师</th>
                  <th>比赛时间</th>
                  <th>文件大小</th>
                  <th>入库时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="list.length === 0">
                  <td :colspan="isSuperAdmin ? 7 : 6" class="empty-row">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      </svg>
                      暂无成绩文件
                    </div>
                  </td>
                </tr>
                <tr v-for="row in list" :key="row.id" class="data-row">
                  <td>
                    <div class="filename-cell">
                      <svg class="file-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      </svg>
                      <span class="filename-text filename-link" @click="openPreview(row)">{{ row.originalFilename }}</span>
                    </div>
                  </td>
                  <td v-if="isSuperAdmin">{{ row.school }}</td>
                  <td>{{ row.teacherName }}</td>
                  <td class="date-cell">{{ formatDateTime(row.uploadedAt) }}</td>
                  <td class="size-cell">{{ formatSize(row.fileSize) }}</td>
                  <td class="date-cell">{{ formatDateTime(row.createdAt) }}</td>
                  <td>
                    <div class="action-btns">
                      <button
                        class="action-btn preview"
                        :class="{ 'parsed': row.parsed }"
                        :disabled="previewingId === row.id"
                        @click="openPreview(row)"
                      >
                        <span v-if="previewingId === row.id">加载中...</span>
                        <span v-else-if="row.parsed">已解析 ✓</span>
                        <span v-else>预览/解析</span>
                      </button>
                      <button class="action-btn download" :disabled="downloadingId === row.id" @click="handleDownload(row)">
                        <span v-if="downloadingId === row.id">下载中...</span>
                        <span v-else>下载</span>
                      </button>
                      <button v-if="canDelete" class="action-btn delete" @click="confirmDelete(row)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <button class="page-btn" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">上一页</button>
            <span class="page-info-text">第 {{ pagination.page }} / {{ pagination.totalPages }} 页</span>
            <button class="page-btn" :disabled="pagination.page >= pagination.totalPages" @click="changePage(pagination.page + 1)">下一页</button>
            <select v-model.number="pagination.pageSize" class="page-size-select" @change="handlePageSizeChange">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </div>
        </section>

        </template>
        <!-- ─────────── TAB 1 结束 ─────────── -->

        <!-- ─────────── TAB 2：数据库成绩 ─────────── -->
        <template v-if="activeTab === 'records'">

        <!-- 筛选区域 -->
        <section class="filter-section">
          <div class="filter-form">
            <div class="filter-group">
              <label class="filter-label">关键词</label>
              <input v-model="rFilters.keyword" type="text" placeholder="姓名 / 学号" class="filter-input" @keyup.enter="loadRecords" />
            </div>
            <div class="filter-group">
              <label class="filter-label">性别</label>
              <select v-model="rFilters.gender" class="filter-input">
                <option value="">全部</option>
                <option value="男">男</option>
                <option value="女">女</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">教师姓名</label>
              <input v-model="rFilters.teacherName" type="text" placeholder="教师姓名" class="filter-input" @keyup.enter="loadRecords" />
            </div>
            <div v-if="isSuperAdmin" class="filter-group">
              <label class="filter-label">学校</label>
              <input v-model="rFilters.school" type="text" placeholder="学校名称" class="filter-input" @keyup.enter="loadRecords" />
            </div>
            <div class="filter-group">
              <label class="filter-label">上传日期起</label>
              <input v-model="rFilters.startDate" type="date" class="filter-input" />
            </div>
            <div class="filter-group">
              <label class="filter-label">上传日期止</label>
              <input v-model="rFilters.endDate" type="date" class="filter-input" />
            </div>
            <div class="filter-group filter-actions-group">
              <button class="search-btn" @click="handleRecordSearch">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                查询
              </button>
              <button class="reset-btn" @click="resetRecordFilters">重置</button>
            </div>
          </div>
        </section>

        <!-- 统计卡片 -->
        <div v-if="rStats" class="stats-row">
          <div class="stat-card">
            <div class="stat-value">{{ rStats.totalCount }}</div>
            <div class="stat-label">总记录数</div>
          </div>
          <div class="stat-card finished">
            <div class="stat-value">{{ rStats.finishedCount }}</div>
            <div class="stat-label">已完赛</div>
          </div>
          <div class="stat-card unfinished">
            <div class="stat-value">{{ rStats.unfinishedCount }}</div>
            <div class="stat-label">未完赛</div>
          </div>
          <div v-if="rStats.school" class="stat-card school">
            <div class="stat-value school-name">{{ rStats.school }}</div>
            <div class="stat-label">当前学校范围</div>
          </div>
        </div>

        <!-- 成绩列表 -->
        <section class="table-section">
          <div class="table-toolbar">
            <span class="result-count">共 {{ rPagination.total }} 条成绩</span>
          </div>
          <div class="table-wrapper">
            <div v-if="rLoading" class="table-loading">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>
            <table v-else class="data-table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>学号</th>
                  <th>性别</th>
                  <th v-if="isSuperAdmin">学校</th>
                  <th>完成圈数</th>
                  <th>最终成绩</th>
                  <th>完赛状态</th>
                  <th>上传教师</th>
                  <th>上传时间</th>
                  <th>入库时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="records.length === 0">
                  <td :colspan="isSuperAdmin ? 10 : 9" class="empty-row">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" stroke-width="1.5"/><line x1="9" y1="9" x2="9" y2="21" stroke="currentColor" stroke-width="1.5"/></svg>
                      暂无成绩数据
                    </div>
                  </td>
                </tr>
                <tr v-for="r in records" :key="r.id" class="data-row" :class="{ 'row-dnf': !r.finished }">
                  <td class="name-cell">{{ r.name }}</td>
                  <td class="mono-cell">{{ r.studentNumber || '—' }}</td>
                  <td>
                    <span :class="['gender-badge', r.gender === '男' ? 'male' : 'female']">{{ r.gender }}</span>
                  </td>
                  <td v-if="isSuperAdmin" class="school-cell">{{ r.school }}</td>
                  <td class="center-cell">{{ r.totalLaps }}</td>
                  <td class="time-cell">{{ r.finalTime || '—' }}</td>
                  <td>
                    <span :class="['status-badge', r.finished ? 'finished' : 'dnf']">{{ r.finished ? '完赛' : '未完赛' }}</span>
                  </td>
                  <td>{{ r.teacherName }}</td>
                  <td class="date-cell">{{ formatDateTime(r.uploadedAt) }}</td>
                  <td class="date-cell">{{ formatDateTime(r.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination">
            <button class="page-btn" :disabled="rPagination.page <= 1" @click="changeRecordPage(rPagination.page - 1)">上一页</button>
            <span class="page-info-text">第 {{ rPagination.page }} / {{ rPagination.totalPages }} 页</span>
            <button class="page-btn" :disabled="rPagination.page >= rPagination.totalPages" @click="changeRecordPage(rPagination.page + 1)">下一页</button>
            <select v-model.number="rPagination.pageSize" class="page-size-select" @change="handleRecordPageSizeChange">
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
              <option :value="100">100条/页</option>
            </select>
          </div>
        </section>

        </template>
        <!-- ─────────── TAB 2 结束 ─────────── -->

      </div>
    </main>

    <!-- 上传弹窗 -->
    <div v-if="uploadVisible" class="modal-overlay" @click.self="closeUpload">
      <div class="upload-card">
        <div class="modal-header">
          <h3 class="modal-title">上传成绩文件</h3>
          <button class="modal-close" @click="closeUpload">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="upload-body">
          <!-- 拖拽 / 点击选文件区域 -->
          <div
            class="drop-zone"
            :class="{ 'drag-over': isDragOver, 'has-file': !!uploadFile }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="onDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" accept=".xlsx" style="display:none" @change="onFileSelect" />
            <template v-if="!uploadFile">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <p class="drop-hint">点击或拖拽 <strong>.xlsx</strong> 文件到此处</p>
            </template>
            <template v-else>
              <svg class="file-ok-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
              </svg>
              <p class="selected-filename">{{ uploadFile.name }}</p>
              <p class="selected-size">{{ formatSize(uploadFile.size) }}</p>
              <button class="reselect-btn" @click.stop="$refs.fileInput.click()">重新选择</button>
            </template>
          </div>

          <!-- 元信息字段 -->
          <div class="upload-fields">
            <div class="field-group">
              <label class="field-label">学校 <span class="required">*</span></label>
              <input v-model="uploadForm.school" type="text" class="field-input" placeholder="学校名称" />
            </div>
            <div class="field-group">
              <label class="field-label">上传教师</label>
              <input v-model="uploadForm.teacherName" type="text" class="field-input" placeholder="教师姓名" />
            </div>
          </div>

          <!-- 错误提示 -->
          <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>

          <!-- 成功提示 -->
          <div v-if="uploadSuccess" class="upload-success">
            ✓ 上传成功！文件已保存。
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="closeUpload">关闭</button>
          <button
            class="submit-btn"
            :disabled="uploading || !uploadFile"
            @click="doUpload"
          >
            {{ uploading ? '上传中...' : '确认上传' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 预览 / 编辑 / 解析入库弹窗 -->
    <div v-if="previewVisible" class="modal-overlay" @click.self="closePreview">
      <div class="preview-card">
        <div class="modal-header">
          <div class="preview-header-left">
            <h3 class="modal-title">Excel 预览 · 解析入库</h3>
            <span v-if="previewMeta.school" class="preview-badge">{{ previewMeta.school }}</span>
            <span v-if="previewMeta.teacherName" class="preview-badge secondary">{{ previewMeta.teacherName }}</span>
          </div>
          <button class="modal-close" @click="closePreview">
            <svg viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>

        <!-- 工具栏 -->
        <div class="preview-toolbar">
          <span class="preview-count">共 {{ previewRows.length }} 条记录</span>
          <div class="preview-toolbar-right">
            <button class="add-row-btn" @click="addPreviewRow">+ 新增一行</button>
          </div>
        </div>

        <!-- 可编辑表格 -->
        <div class="preview-table-wrapper">
          <table class="preview-table">
            <thead>
              <tr>
                <th style="width:32px">#</th>
                <th>姓名 *</th>
                <th>学号</th>
                <th>性别 *</th>
                <th>完成圈数 *</th>
                <th>最终成绩</th>
                <th style="width:48px">删行</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="previewRows.length === 0">
                <td colspan="7" class="empty-row">
                  <div class="empty-state">暂无数据</div>
                </td>
              </tr>
              <tr v-for="(r, idx) in previewRows" :key="idx" :class="{ 'row-unfinished': r.finalTime === '--' || !r.finalTime }">
                <td class="row-num">{{ idx + 1 }}</td>
                <td><input v-model="r.name" class="cell-input" placeholder="姓名" /></td>
                <td><input v-model="r.studentNumber" class="cell-input" placeholder="--" /></td>
                <td>
                  <select v-model="r.gender" class="cell-select">
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </td>
                <td><input v-model.number="r.totalLaps" type="number" min="0" class="cell-input number-input" /></td>
                <td><input v-model="r.finalTime" class="cell-input" placeholder="mm:ss.ff 或 --" /></td>
                <td>
                  <button class="del-row-btn" @click="removePreviewRow(idx)" title="删除此行">×</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 解析结果提示 -->
        <div v-if="parseResult" class="parse-result" :class="parseResult.failedCount > 0 ? 'partial' : 'all-ok'">
          <span>✓ 成功入库 {{ parseResult.uploadedCount }} 条</span>
          <span v-if="parseResult.failedCount > 0" class="parse-fail-count">，失败 {{ parseResult.failedCount }} 条</span>
          <ul v-if="parseResult.failedItems && parseResult.failedItems.length" class="parse-fail-list">
            <li v-for="(f, i) in parseResult.failedItems" :key="i">{{ f.name || f.studentNumber }}：{{ f.reason }}</li>
          </ul>
        </div>
        <div v-if="parseError" class="parse-error">{{ parseError }}</div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closePreview">关闭</button>
          <div v-if="previewFileRow && previewFileRow.parsed" class="parsed-notice">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            已于 {{ formatDateTime(previewFileRow.parsedAt) }} 解析入库，不可重复操作
          </div>
          <button
            v-else
            class="submit-btn parse-btn"
            :disabled="parsing || previewRows.length === 0"
            @click="doParseToDb"
          >
            {{ parsing ? '解析入库中...' : '确认解析入库' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteVisible" class="modal-overlay" @click.self="deleteVisible = false">
      <div class="confirm-card">
        <div class="confirm-icon danger">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="confirm-title">确认删除</h3>
        <p class="confirm-msg">确定要删除文件「{{ pendingDeleteRow && pendingDeleteRow.originalFilename }}」吗？此操作不可撤销。</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="deleteVisible = false">取消</button>
          <button class="confirm-ok danger" :disabled="deleteLoading" @click="doDelete">
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 全局消息提示 -->
    <transition name="msg-fade">
      <div v-if="message.visible" :class="['message-toast', message.type]">{{ message.text }}</div>
    </transition>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RaceResults',
  data() {
    return {
      activeTab: 'files',

      userRole: '',
      userSchool: '',

      list: [],
      listLoading: false,

      filters: { teacherName: '', school: '' },

      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },

      // ── Tab2：数据库成绩 ──
      records: [],
      rLoading: false,
      rStats: null,
      rFilters: { keyword: '', gender: '', teacherName: '', school: '', startDate: '', endDate: '' },
      rPagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 },

      // 上传弹窗
      uploadVisible: false,
      uploadFile: null,
      isDragOver: false,
      uploading: false,
      uploadError: '',
      uploadSuccess: false,
      uploadForm: { school: '', teacherName: '' },

      // 下载
      downloadingId: null,

      // 预览/解析
      previewingId: null,
      previewVisible: false,
      previewFileRow: null,
      previewMeta: { school: '', teacherName: '', uploadedAt: '' },
      previewRows: [],
      parsing: false,
      parseResult: null,
      parseError: '',

      // 删除
      deleteVisible: false,
      deleteLoading: false,
      pendingDeleteRow: null,

      message: { visible: false, type: 'success', text: '' },
      messageTimer: null
    }
  },
  computed: {
    isSuperAdmin() { return this.userRole === 'super_admin' },
    canDelete() {
      return ['department_admin', 'school_admin', 'super_admin'].includes(this.userRole)
    }
  },
  mounted() {
    this.initUserInfo()
  },
  methods: {
    initUserInfo() {
      try {
        const raw = localStorage.getItem('userInfo')
        if (raw) {
          const user = JSON.parse(raw)
          this.userRole    = user.userType || user.role || ''
          this.userSchool  = user.school   || ''
          // 非超管默认填入本校
          if (this.userRole !== 'super_admin') {
            this.uploadForm.school = this.userSchool
          }
          // 教师名默认填入
          if (user.realName) this.uploadForm.teacherName = user.realName
        }
      } catch (e) { /* ignore */ }
      this.loadList()
    },

    async loadList() {
      this.listLoading = true
      try {
        const params = { page: this.pagination.page, pageSize: this.pagination.pageSize }
        if (this.filters.teacherName) params.teacherName = this.filters.teacherName
        if (this.isSuperAdmin && this.filters.school) params.school = this.filters.school
        else if (!this.isSuperAdmin && this.userSchool) params.school = this.userSchool

        const res = await api.raceExcel.getList(params)
        const data = res.data || {}
        this.list               = data.list       || []
        this.pagination.total      = data.total      || 0
        this.pagination.totalPages = data.totalPages || 1
        this.pagination.page       = data.page       || 1
      } catch (e) {
        this.showMessage('加载文件列表失败：' + e.message, 'error')
      } finally {
        this.listLoading = false
      }
    },

    handleSearch() { this.pagination.page = 1; this.loadList() },
    resetFilters()  { this.filters = { teacherName: '', school: '' }; this.pagination.page = 1; this.loadList() },
    changePage(p)   { if (p < 1 || p > this.pagination.totalPages) return; this.pagination.page = p; this.loadList() },
    handlePageSizeChange() { this.pagination.page = 1; this.loadList() },

    // ── Tab 切换 ─────────────────────────────────────────────────────────
    switchTab(tab) {
      this.activeTab = tab
      if (tab === 'records' && this.records.length === 0) {
        this.loadStats()
        this.loadRecords()
      }
    },

    // ── Tab2：数据库成绩 ─────────────────────────────────────────────────
    async loadStats() {
      try {
        const res = await api.raceExcel.getStats()
        const d = (res && res.data) ? res.data : res
        this.rStats = d
      } catch (e) { /* 统计失败不阻断列表 */ }
    },
    async loadRecords() {
      this.rLoading = true
      try {
        const params = { page: this.rPagination.page, pageSize: this.rPagination.pageSize }
        if (this.rFilters.keyword)     params.keyword     = this.rFilters.keyword
        if (this.rFilters.gender)      params.gender      = this.rFilters.gender
        if (this.rFilters.teacherName) params.teacherName = this.rFilters.teacherName
        if (this.rFilters.startDate)   params.startDate   = this.rFilters.startDate
        if (this.rFilters.endDate)     params.endDate     = this.rFilters.endDate
        if (this.isSuperAdmin && this.rFilters.school) params.school = this.rFilters.school

        const res = await api.raceExcel.getRecords(params)
        const d = (res && res.data) ? res.data : res
        this.records               = d.list       || []
        this.rPagination.total     = d.total      || 0
        this.rPagination.totalPages = d.totalPages || 1
        this.rPagination.page      = d.page       || 1
      } catch (e) {
        this.showMessage('加载成绩数据失败：' + e.message, 'error')
      } finally {
        this.rLoading = false
      }
    },
    handleRecordSearch() { this.rPagination.page = 1; this.loadStats(); this.loadRecords() },
    resetRecordFilters() {
      this.rFilters = { keyword: '', gender: '', teacherName: '', school: '', startDate: '', endDate: '' }
      this.rPagination.page = 1
      this.loadStats()
      this.loadRecords()
    },
    changeRecordPage(p) {
      if (p < 1 || p > this.rPagination.totalPages) return
      this.rPagination.page = p
      this.loadRecords()
    },
    handleRecordPageSizeChange() { this.rPagination.page = 1; this.loadRecords() },

    // ── 上传 ────────────────────────────────────────────────────────────
    openUpload() {
      this.uploadFile    = null
      this.uploadError   = ''
      this.uploadSuccess = false
      this.uploading     = false
      this.uploadVisible = true
    },
    closeUpload() {
      if (this.uploading) return
      this.uploadVisible = false
    },
    onFileSelect(e) {
      const f = e.target.files[0]
      if (f) this.setFile(f)
      e.target.value = ''
    },
    onDrop(e) {
      this.isDragOver = false
      const f = e.dataTransfer.files[0]
      if (f) this.setFile(f)
    },
    setFile(f) {
      if (!f.name.toLowerCase().endsWith('.xlsx')) {
        this.uploadError = '仅支持 .xlsx 格式文件'
        return
      }
      this.uploadFile  = f
      this.uploadError = ''
    },
    async doUpload() {
      if (!this.uploadFile) return
      if (!this.uploadForm.school.trim()) { this.uploadError = '请填写学校名称'; return }
      this.uploading     = true
      this.uploadError   = ''
      this.uploadSuccess = false
      try {
        const fd = new FormData()
        fd.append('file',        this.uploadFile)
        fd.append('school',      this.uploadForm.school.trim())
        fd.append('teacherName', this.uploadForm.teacherName.trim())
        fd.append('uploadedAt',  new Date().toISOString())
        await api.raceExcel.upload(fd)
        this.uploadSuccess = true
        this.loadList()
      } catch (e) {
        this.uploadError = '上传失败：' + (e.message || '未知错误')
      } finally {
        this.uploading = false
      }
    },

    // ── 预览 / 解析 ─────────────────────────────────────────────────────
    async openPreview(row) {
      this.previewingId = row.id
      this.parseResult  = null
      this.parseError   = ''
      try {
        const res = await api.raceExcel.preview(row.id)
        const data = (res && res.data) ? res.data : res
        this.previewMeta    = data.meta  || {}
        this.previewRows    = (data.rows || []).map(r => ({ ...r }))
        this.previewFileRow = row
        this.previewVisible = true
      } catch (e) {
        this.showMessage('获取预览失败：' + e.message, 'error')
      } finally {
        this.previewingId = null
      }
    },
    closePreview() {
      if (this.parsing) return
      this.previewVisible = false
      this.previewRows    = []
      this.parseResult    = null
      this.parseError     = ''
    },
    addPreviewRow() {
      this.previewRows.push({ name: '', studentNumber: '', gender: '男', totalLaps: 0, finalTime: '' })
    },
    removePreviewRow(idx) {
      this.previewRows.splice(idx, 1)
    },
    async doParseToDb() {
      if (!this.previewFileRow || this.previewRows.length === 0) return
      this.parsing     = true
      this.parseResult = null
      this.parseError  = ''
      try {
        const res = await api.raceExcel.parse(this.previewFileRow.id, this.previewRows)
        const data = (res && res.data) ? res.data : res
        this.parseResult = data
        // 刷新列表，使文件行的 parsed 状态同步更新
        await this.loadList()
        // 同步弹窗内的文件行信息
        const updated = this.list.find(r => r.id === this.previewFileRow.id)
        if (updated) this.previewFileRow = updated
        this.showMessage(`解析完成，成功入库 ${data.uploadedCount} 条`, data.failedCount > 0 ? 'error' : 'success')
      } catch (e) {
        this.parseError = '解析失败：' + e.message
      } finally {
        this.parsing = false
      }
    },

    // ── 下载 ────────────────────────────────────────────────────────────
    async handleDownload(row) {
      this.downloadingId = row.id
      try {
        const res = await api.raceExcel.download(row.id)
        const blob = new Blob([res], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = row.originalFilename
        a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        this.showMessage('下载失败：' + e.message, 'error')
      } finally {
        this.downloadingId = null
      }
    },

    // ── 删除 ────────────────────────────────────────────────────────────
    confirmDelete(row) { this.pendingDeleteRow = row; this.deleteVisible = true },
    async doDelete() {
      if (!this.pendingDeleteRow) return
      this.deleteLoading = true
      try {
        await api.raceExcel.deleteOne(this.pendingDeleteRow.id)
        this.showMessage('删除成功', 'success')
        this.deleteVisible = false
        this.loadList()
      } catch (e) {
        this.showMessage('删除失败：' + e.message, 'error')
      } finally {
        this.deleteLoading = false
      }
    },

    // ── 工具 ────────────────────────────────────────────────────────────
    formatDateTime(s) {
      if (!s) return '—'
      return String(s).replace('T', ' ').slice(0, 19)
    },
    formatSize(bytes) {
      if (bytes == null) return '—'
      if (bytes < 1024)        return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / 1024 / 1024).toFixed(2) + ' MB'
    },
    showMessage(text, type = 'success') {
      if (this.messageTimer) clearTimeout(this.messageTimer)
      this.message = { visible: true, type, text }
      this.messageTimer = setTimeout(() => { this.message.visible = false }, 3000)
    }
  }
}
</script>

<style scoped>
/* ===== 整体布局 ===== */
.race-results { min-height: 100vh; background: var(--bg-body); }

/* ===== 顶部导航 ===== */
.page-header {
  background: #fff;
  border-bottom: 1px solid var(--border-light);
  position: sticky; top: 0; z-index: 100;
  box-shadow: var(--shadow-sm);
}
.header-container {
  max-width: 1400px; margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex; align-items: center; justify-content: space-between;
  height: var(--header-height);
}
.header-left  { display: flex; align-items: center; gap: var(--spacing-lg); }
.header-right { display: flex; align-items: center; gap: 10px; }

.back-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 12px; background: #fff;
  border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  color: #000000d9; cursor: pointer; font-size: 14px; font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.back-btn:hover { border-color: #1677ff; color: #1677ff; }
.back-btn svg { width: 16px; height: 16px; }

.page-info { display: flex; flex-direction: column; }
.page-title { font-size: 18px; font-weight: 600; color: #000000d9; margin: 0; }
.page-subtitle { font-size: 12px; color: #00000073; margin-top: 2px; }

.upload-trigger-btn {
  display: flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 16px;
  background: #1677ff; border: none; border-radius: var(--radius-sm);
  color: #fff; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.upload-trigger-btn:hover { background: #4096ff; }
.upload-trigger-btn svg { width: 16px; height: 16px; }

/* ===== 主内容 ===== */
.main-content { padding: var(--spacing-xl) 0; }
.content-container { max-width: 1400px; margin: 0 auto; padding: 0 var(--spacing-xl); }

/* ===== 筛选 ===== */
.filter-section {
  background: #fff; border: 1px solid var(--border-light); border-radius: 8px;
  padding: 16px 20px; margin-bottom: var(--spacing-xl); box-shadow: var(--shadow-card);
}
.filter-form { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
.filter-label { font-size: 12px; color: #00000073; font-weight: 500; }
.filter-input {
  height: 32px; padding: 0 10px;
  border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  font-size: 13px; color: #000000d9; background: #fff; outline: none;
  transition: border-color 0.15s; font-family: inherit;
}
.filter-input:focus { border-color: #1677ff; }
.filter-actions-group { flex-direction: row; gap: 8px; min-width: unset; align-items: flex-end; }
.search-btn {
  display: flex; align-items: center; gap: 6px;
  height: 32px; padding: 0 14px; background: #1677ff; border: none;
  border-radius: var(--radius-sm); color: #fff; font-size: 13px;
  cursor: pointer; font-family: inherit; transition: background 0.15s;
}
.search-btn:hover { background: #4096ff; }
.search-btn svg { width: 14px; height: 14px; }
.reset-btn {
  height: 32px; padding: 0 14px;
  background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  color: #000000d9; font-size: 13px; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.reset-btn:hover { border-color: #1677ff; color: #1677ff; }

/* ===== 表格区域 ===== */
.table-section {
  background: #fff; border: 1px solid var(--border-light);
  border-radius: 8px; overflow: hidden; box-shadow: var(--shadow-card);
}
.table-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid var(--border-light);
}
.result-count { font-size: 13px; color: #00000073; }
.table-wrapper { overflow-x: auto; }
.table-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 60px 0; color: #00000073; font-size: 14px;
}
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.data-table thead th {
  background: #f8f9fa; color: #000000d9; font-weight: 600;
  padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}
.data-row td {
  padding: 12px 14px; border-bottom: 1px solid var(--border-light);
  color: #000000d9; vertical-align: middle;
}
.data-row:last-child td { border-bottom: none; }
.data-row:hover td { background: #f5f7ff; }

.empty-row td { padding: 60px 0; }
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; color: #00000040; font-size: 14px;
}
.empty-state svg { width: 40px; height: 40px; }

.filename-cell { display: flex; align-items: center; gap: 8px; }
.file-icon { width: 18px; height: 18px; color: #52c41a; flex-shrink: 0; }
.filename-text { font-weight: 500; color: #000000d9; word-break: break-all; }
.filename-link { color: #1677ff; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
.filename-link:hover { color: #4096ff; }

.date-cell { color: #00000073; white-space: nowrap; }
.size-cell { color: #00000073; }

.action-btns { display: flex; gap: 6px; }
.action-btn {
  padding: 3px 10px; border-radius: var(--radius-sm); font-size: 12px;
  cursor: pointer; font-family: inherit; transition: background 0.15s; border: 1px solid;
}
.action-btn.preview { background: #f0f5ff; border-color: #adc6ff; color: #2f54eb; }
.action-btn.preview:hover:not(:disabled) { background: #d6e4ff; }
.action-btn.preview:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.preview.parsed { background: #f6ffed; border-color: #b7eb8f; color: #52c41a; cursor: default; }
.action-btn.download { background: #e6f4ff; border-color: #91caff; color: #1677ff; }
.action-btn.download:hover:not(:disabled) { background: #bae0ff; }
.action-btn.download:disabled { opacity: 0.5; cursor: not-allowed; }
.action-btn.delete  { background: #fff1f0; border-color: #ffa39e; color: #ff4d4f; }
.action-btn.delete:hover { background: #ffccc7; }

/* ===== 分页 ===== */
.pagination {
  display: flex; align-items: center; justify-content: flex-end;
  gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border-light);
}
.page-btn {
  padding: 5px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  background: #fff; color: #000000d9; font-size: 13px; cursor: pointer;
  font-family: inherit; transition: border-color 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.page-info-text { font-size: 13px; color: #00000073; }
.page-size-select {
  height: 30px; padding: 0 8px; border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); font-size: 13px; background: #fff; cursor: pointer;
}

/* ===== 弹窗遮罩 ===== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}

/* ===== 上传弹窗 ===== */
.upload-card {
  background: #fff; border-radius: 10px; width: 520px; max-width: 92vw;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18); display: flex; flex-direction: column;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px; border-bottom: 1px solid var(--border-light);
}
.modal-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0; }
.modal-close {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; cursor: pointer; border-radius: 4px; color: #00000073;
}
.modal-close:hover { background: #f5f5f5; color: #000000d9; }
.modal-close svg { width: 16px; height: 16px; }

.upload-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

.drop-zone {
  border: 2px dashed var(--border-color); border-radius: 8px;
  padding: 32px 20px; text-align: center; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 10px; color: #00000073;
}
.drop-zone svg { width: 36px; height: 36px; }
.drop-zone:hover, .drop-zone.drag-over { border-color: #1677ff; background: #e6f4ff22; }
.drop-zone.has-file { border-color: #52c41a; background: #f6ffed33; }
.drop-hint { font-size: 14px; margin: 0; }
.drop-hint strong { color: #1677ff; }
.file-ok-icon { width: 36px; height: 36px; color: #52c41a; }
.selected-filename { font-size: 14px; font-weight: 600; color: #000000d9; margin: 0; word-break: break-all; }
.selected-size { font-size: 12px; color: #00000073; margin: 0; }
.reselect-btn {
  padding: 3px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  background: #fff; color: #000000d9; font-size: 12px; cursor: pointer; font-family: inherit;
}
.reselect-btn:hover { border-color: #1677ff; color: #1677ff; }

.upload-fields { display: flex; flex-direction: column; gap: 12px; }
.field-group { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 12px; color: #00000073; font-weight: 500; }
.required { color: #ff4d4f; }
.field-input {
  height: 34px; padding: 0 10px;
  border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  font-size: 13px; color: #000000d9; outline: none; font-family: inherit;
  transition: border-color 0.15s;
}
.field-input:focus { border-color: #1677ff; }

.upload-error   { font-size: 13px; color: #ff4d4f; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 6px; padding: 8px 12px; }
.upload-success { font-size: 13px; color: #52c41a; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 6px; padding: 8px 12px; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 14px 24px; border-top: 1px solid var(--border-light);
}
.cancel-btn {
  padding: 6px 18px; border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  background: #fff; color: #000000d9; font-size: 14px; cursor: pointer; font-family: inherit;
}
.cancel-btn:hover { border-color: #1677ff; }
.submit-btn {
  padding: 6px 18px; border: none; border-radius: var(--radius-sm);
  background: #1677ff; color: #fff; font-size: 14px; cursor: pointer; font-family: inherit;
  transition: background 0.15s;
}
.submit-btn:hover:not(:disabled) { background: #4096ff; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 确认弹窗 ===== */
.confirm-card {
  background: #fff; border-radius: 10px; width: 400px; max-width: 90vw;
  padding: 32px 28px 24px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}
.confirm-icon { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.confirm-icon.danger { background: #fff1f0; color: #ff4d4f; }
.confirm-icon svg { width: 26px; height: 26px; }
.confirm-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0 0 8px; }
.confirm-msg { font-size: 14px; color: #00000073; line-height: 1.6; margin: 0 0 24px; word-break: break-all; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.confirm-cancel {
  flex: 1; max-width: 140px; height: 36px;
  border: 1px solid var(--border-color); border-radius: var(--radius-sm);
  background: #fff; color: #000000d9; font-size: 14px; cursor: pointer; font-family: inherit;
}
.confirm-cancel:hover { border-color: #1677ff; }
.confirm-ok { flex: 1; max-width: 140px; height: 36px; border: none; border-radius: var(--radius-sm); font-size: 14px; cursor: pointer; font-family: inherit; }
.confirm-ok.danger { background: #ff4d4f; color: #fff; }
.confirm-ok.danger:hover { background: #ff7875; }
.confirm-ok:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 加载动画 ===== */
.loading-spinner {
  width: 20px; height: 20px; border: 2px solid #e8e8e8;
  border-top-color: #1677ff; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 消息提示 ===== */
.message-toast {
  position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
  padding: 10px 20px; border-radius: 6px; font-size: 14px;
  z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.message-toast.success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.message-toast.error   { background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e; }
.msg-fade-enter-active, .msg-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.msg-fade-enter-from, .msg-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .header-container { padding: 0 var(--spacing-md); }
  .content-container { padding: 0 var(--spacing-md); }
  .filter-form { flex-direction: column; }
  .filter-group { min-width: unset; width: 100%; }
}

/* ===== Tab 切换 ===== */
.tab-bar {
  display: flex; gap: 2px; margin-bottom: var(--spacing-xl);
  background: #fff; border: 1px solid var(--border-light); border-radius: 8px;
  padding: 4px; box-shadow: var(--shadow-card); width: fit-content;
}
.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 20px; border: none; border-radius: 6px;
  background: transparent; color: #00000073; font-size: 13px; font-weight: 500;
  cursor: pointer; font-family: inherit; transition: background 0.15s, color 0.15s;
}
.tab-btn svg { width: 15px; height: 15px; }
.tab-btn:hover { background: #f5f5f5; color: #000000d9; }
.tab-btn.active { background: #1677ff; color: #fff; }

/* ===== 统计卡片 ===== */
.stats-row {
  display: flex; gap: 12px; margin-bottom: var(--spacing-xl); flex-wrap: wrap;
}
.stat-card {
  background: #fff; border: 1px solid var(--border-light); border-radius: 8px;
  padding: 16px 24px; box-shadow: var(--shadow-card); min-width: 130px;
}
.stat-value { font-size: 28px; font-weight: 700; color: #1677ff; line-height: 1; }
.stat-value.school-name { font-size: 16px; }
.stat-label { font-size: 12px; color: #00000073; margin-top: 6px; }
.stat-card.finished .stat-value { color: #52c41a; }
.stat-card.unfinished .stat-value { color: #ff4d4f; }
.stat-card.school .stat-value { color: #722ed1; }

/* ===== 成绩表格特有样式 ===== */
.name-cell { font-weight: 600; }
.mono-cell { font-family: 'Courier New', monospace; font-size: 12px; color: #00000073; }
.time-cell { font-family: 'Courier New', monospace; color: #1677ff; font-weight: 600; }
.center-cell { text-align: center; }
.school-cell { font-size: 12px; color: #00000073; }
.data-row.row-dnf td { color: #00000073; }
.data-row.row-dnf .time-cell { color: #00000040; }

.gender-badge {
  padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;
}
.gender-badge.male   { background: #e6f4ff; color: #1677ff; }
.gender-badge.female { background: #fff0f6; color: #eb2f96; }

.status-badge {
  padding: 2px 8px; border-radius: 10px; font-size: 12px; font-weight: 500;
}
.status-badge.finished  { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-badge.dnf       { background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e; }

/* ===== 预览弹窗 ===== */
.preview-card {
  background: #fff; border-radius: 10px;
  width: 900px; max-width: 96vw; max-height: 88vh;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
  display: flex; flex-direction: column; overflow: hidden;
}
.preview-header-left { display: flex; align-items: center; gap: 10px; }
.preview-badge {
  padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500;
  background: #e6f4ff; color: #1677ff; border: 1px solid #91caff;
}
.preview-badge.secondary { background: #f6ffed; color: #52c41a; border-color: #b7eb8f; }

.preview-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; border-bottom: 1px solid var(--border-light);
  background: #fafafa;
}
.preview-count { font-size: 13px; color: #00000073; }
.preview-toolbar-right { display: flex; gap: 8px; }
.add-row-btn {
  padding: 4px 14px; border: 1px solid #91caff; border-radius: var(--radius-sm);
  background: #e6f4ff; color: #1677ff; font-size: 13px; cursor: pointer; font-family: inherit;
}
.add-row-btn:hover { background: #bae0ff; }

.preview-table-wrapper { flex: 1; overflow: auto; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.preview-table thead th {
  background: #f8f9fa; color: #000000d9; font-weight: 600;
  padding: 10px 8px; text-align: left;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap; position: sticky; top: 0; z-index: 1;
}
.preview-table tbody tr td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
.preview-table tbody tr:hover td { background: #f5f7ff; }
.preview-table tbody tr.row-unfinished td { background: #fffbe6; }
.preview-table tbody tr.row-unfinished:hover td { background: #fff1b8; }

.row-num { color: #00000040; font-size: 12px; text-align: center; }
.cell-input {
  width: 100%; height: 28px; padding: 0 8px;
  border: 1px solid transparent; border-radius: 4px;
  font-size: 13px; color: #000000d9; background: transparent;
  outline: none; font-family: inherit; box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
}
.cell-input:focus { border-color: #1677ff; background: #fff; }
.cell-input:hover { border-color: #d9d9d9; }
.number-input { width: 72px; }
.cell-select {
  height: 28px; padding: 0 6px;
  border: 1px solid transparent; border-radius: 4px;
  font-size: 13px; background: transparent; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.cell-select:focus, .cell-select:hover { border-color: #1677ff; background: #fff; outline: none; }
.del-row-btn {
  width: 24px; height: 24px; border-radius: 4px; border: none;
  background: transparent; color: #ff4d4f; font-size: 16px; line-height: 1;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.del-row-btn:hover { background: #fff1f0; }

.parse-result {
  margin: 0 20px 4px; padding: 10px 14px; border-radius: 6px; font-size: 13px;
}
.parse-result.all-ok { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.parse-result.partial { background: #fffbe6; color: #d48806; border: 1px solid #ffe58f; }
.parse-fail-count { color: #ff4d4f; }
.parse-fail-list { margin: 6px 0 0 16px; padding: 0; color: #ff4d4f; }
.parse-error {
  margin: 0 20px 4px; padding: 10px 14px; border-radius: 6px; font-size: 13px;
  background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e;
}
.parse-btn { background: #52c41a !important; }
.parse-btn:hover:not(:disabled) { background: #73d13d !important; }

.parsed-notice {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 6px;
  background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f;
  font-size: 13px; font-weight: 500;
}
</style>
