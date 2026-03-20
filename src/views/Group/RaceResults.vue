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
            <h1 class="page-title">运动员比赛成绩</h1>
            <p class="page-subtitle">Race Results Management</p>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="main-content">
      <div class="content-container">

        <!-- 统计卡片 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card total">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statsLoading ? '—' : (statistics.totalCount ?? '—') }}</span>
                <span class="stat-label">总参赛人数</span>
              </div>
            </div>
            <div class="stat-card finished">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statsLoading ? '—' : (statistics.finishedCount ?? '—') }}</span>
                <span class="stat-label">完赛人数</span>
              </div>
            </div>
            <div class="stat-card unfinished">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ statsLoading ? '—' : (statistics.unfinishedCount ?? '—') }}</span>
                <span class="stat-label">未完赛人数</span>
              </div>
            </div>
            <div class="stat-card rate">
              <div class="stat-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ finishRate }}</span>
                <span class="stat-label">完赛率</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 筛选区域 -->
        <section class="filter-section">
          <div class="filter-header">
            <h3 class="filter-title">条件筛选</h3>
            <button class="reset-btn" @click="resetFilters">重置筛选</button>
          </div>
          <div class="filter-form">
            <div class="filter-row">
              <!-- 关键词 -->
              <div class="filter-group">
                <label class="filter-label">关键词</label>
                <input
                  v-model="filters.keyword"
                  type="text"
                  placeholder="学号或姓名"
                  class="filter-input"
                  @keyup.enter="handleSearch"
                />
              </div>
              <!-- 性别 -->
              <div class="filter-group">
                <label class="filter-label">性别</label>
                <select v-model="filters.gender" class="filter-select">
                  <option value="">全部</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
              <!-- 教师姓名 -->
              <div class="filter-group">
                <label class="filter-label">上传教师</label>
                <input
                  v-model="filters.teacherName"
                  type="text"
                  placeholder="教师姓名"
                  class="filter-input"
                  @keyup.enter="handleSearch"
                />
              </div>
              <!-- 学校（仅 super_admin 可见） -->
              <div v-if="isSuperAdmin" class="filter-group">
                <label class="filter-label">学校</label>
                <input
                  v-model="filters.school"
                  type="text"
                  placeholder="学校名称"
                  class="filter-input"
                  @keyup.enter="handleSearch"
                />
              </div>
            </div>
            <div class="filter-row">
              <!-- 上传日期范围 -->
              <div class="filter-group">
                <label class="filter-label">上传日期起</label>
                <input v-model="filters.startDate" type="date" class="filter-input" />
              </div>
              <div class="filter-group">
                <label class="filter-label">上传日期止</label>
                <input v-model="filters.endDate" type="date" class="filter-input" />
              </div>
              <!-- 操作按钮 -->
              <div class="filter-group filter-actions-group">
                <button class="search-btn" @click="handleSearch">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  查询
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 数据表格 -->
        <section class="table-section">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <span class="result-count">共 {{ pagination.total }} 条记录</span>
              <span v-if="selectedIds.length > 0" class="selected-hint">已选 {{ selectedIds.length }} 条</span>
            </div>
            <div class="toolbar-right">
              <button
                v-if="canDelete && selectedIds.length > 0"
                class="batch-delete-btn"
                @click="handleBatchDelete"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                批量删除
              </button>
            </div>
          </div>

          <div class="table-wrapper">
            <div v-if="listLoading" class="table-loading">
              <div class="loading-spinner"></div>
              <span>加载中...</span>
            </div>

            <table v-else class="data-table">
              <thead>
                <tr>
                  <th v-if="canDelete" class="col-check">
                    <input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
                  </th>
                  <th>学号</th>
                  <th>姓名</th>
                  <th v-if="isSuperAdmin">学校</th>
                  <th>性别</th>
                  <th>完成圈数</th>
                  <th>成绩</th>
                  <th>完赛状态</th>
                  <th>上传教师</th>
                  <th>上传时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="list.length === 0">
                  <td :colspan="canDelete ? (isSuperAdmin ? 11 : 10) : (isSuperAdmin ? 10 : 9)" class="empty-row">
                    <div class="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M9 9h.01M15 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <path d="M9 15a3 3 0 0 0 6 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      </svg>
                      暂无数据
                    </div>
                  </td>
                </tr>
                <tr v-for="row in list" :key="row.id" class="data-row">
                  <td v-if="canDelete" class="col-check">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(row.id)"
                      @change="toggleSelect(row.id)"
                    />
                  </td>
                  <td>{{ row.studentNumber }}</td>
                  <td class="name-cell">{{ row.name }}</td>
                  <td v-if="isSuperAdmin">{{ row.school }}</td>
                  <td>
                    <span :class="['gender-tag', row.gender === '男' ? 'male' : 'female']">
                      {{ row.gender }}
                    </span>
                  </td>
                  <td>{{ row.totalLaps }} 圈</td>
                  <td class="time-cell">
                    <span v-if="row.finalTime" class="time-value">{{ row.finalTime }}</span>
                    <span v-else class="no-time">—</span>
                  </td>
                  <td>
                    <span :class="['status-tag', row.finished ? 'finished' : 'unfinished']">
                      {{ row.finished ? '已完赛' : '未完赛' }}
                    </span>
                  </td>
                  <td>{{ row.teacherName }}</td>
                  <td class="date-cell">{{ formatDate(row.uploadedAt) }}</td>
                  <td>
                    <div class="action-btns">
                      <button class="action-btn view" @click="openDetail(row.id)">详情</button>
                      <button v-if="canDelete" class="action-btn delete" @click="handleDelete(row)">删除</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 分页 -->
          <div class="pagination">
            <button
              class="page-btn"
              :disabled="pagination.page <= 1"
              @click="changePage(pagination.page - 1)"
            >上一页</button>
            <span class="page-info">
              第 {{ pagination.page }} / {{ pagination.totalPages }} 页
            </span>
            <button
              class="page-btn"
              :disabled="pagination.page >= pagination.totalPages"
              @click="changePage(pagination.page + 1)"
            >下一页</button>
            <select v-model.number="pagination.pageSize" class="page-size-select" @change="handlePageSizeChange">
              <option :value="10">10条/页</option>
              <option :value="20">20条/页</option>
              <option :value="50">50条/页</option>
            </select>
          </div>
        </section>
      </div>
    </main>

    <!-- 详情弹窗 -->
    <div v-if="detailVisible" class="modal-overlay" @click.self="detailVisible = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">成绩详情</h3>
          <button class="modal-close" @click="detailVisible = false">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div v-if="detailLoading" class="modal-loading">
          <div class="loading-spinner"></div>
          加载中...
        </div>
        <div v-else-if="detail" class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">学号</span>
              <span class="detail-value">{{ detail.studentNumber }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">姓名</span>
              <span class="detail-value">{{ detail.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">学校</span>
              <span class="detail-value">{{ detail.school }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">性别</span>
              <span class="detail-value">
                <span :class="['gender-tag', detail.gender === '男' ? 'male' : 'female']">{{ detail.gender }}</span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完成圈数</span>
              <span class="detail-value">{{ detail.totalLaps }} 圈</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最终成绩</span>
              <span class="detail-value time-value">{{ detail.finalTime || '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">成绩(毫秒)</span>
              <span class="detail-value">{{ detail.finalTimeMs != null ? detail.finalTimeMs + ' ms' : '—' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">完赛状态</span>
              <span class="detail-value">
                <span :class="['status-tag', detail.finished ? 'finished' : 'unfinished']">
                  {{ detail.finished ? '已完赛' : '未完赛' }}
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上传教师</span>
              <span class="detail-value">{{ detail.teacherName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">上传者ID</span>
              <span class="detail-value mono">{{ detail.uploaderId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">比赛时间</span>
              <span class="detail-value">{{ formatDateTime(detail.uploadedAt) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">入库时间</span>
              <span class="detail-value">{{ formatDateTime(detail.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="deleteConfirmVisible" class="modal-overlay" @click.self="deleteConfirmVisible = false">
      <div class="confirm-card">
        <div class="confirm-icon danger">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h3 class="confirm-title">确认删除</h3>
        <p class="confirm-msg">{{ deleteConfirmMsg }}</p>
        <div class="confirm-actions">
          <button class="confirm-cancel" @click="deleteConfirmVisible = false">取消</button>
          <button class="confirm-ok danger" :disabled="deleteLoading" @click="confirmDelete">
            {{ deleteLoading ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 全局消息提示 -->
    <transition name="msg-fade">
      <div v-if="message.visible" :class="['message-toast', message.type]">
        {{ message.text }}
      </div>
    </transition>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'RaceResults',
  data() {
    return {
      // 用户角色信息
      userRole: '',
      userSchool: '',

      // 统计数据
      statistics: {},
      statsLoading: false,

      // 列表数据
      list: [],
      listLoading: false,

      // 筛选条件
      filters: {
        keyword: '',
        gender: '',
        teacherName: '',
        school: '',
        startDate: '',
        endDate: ''
      },

      // 分页
      pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 1
      },

      // 多选
      selectedIds: [],

      // 详情弹窗
      detailVisible: false,
      detailLoading: false,
      detail: null,

      // 删除相关
      deleteConfirmVisible: false,
      deleteConfirmMsg: '',
      deleteLoading: false,
      pendingDeleteIds: [],
      isBatchDelete: false,

      // 消息提示
      message: { visible: false, type: 'success', text: '' },
      messageTimer: null
    }
  },
  computed: {
    isSuperAdmin() {
      return this.userRole === 'super_admin'
    },
    canDelete() {
      return ['department_admin', 'school_admin', 'super_admin'].includes(this.userRole)
    },
    isAllSelected() {
      return this.list.length > 0 && this.list.every(r => this.selectedIds.includes(r.id))
    },
    finishRate() {
      const total = this.statistics.totalCount
      const finished = this.statistics.finishedCount
      if (!total || total === 0) return '—'
      return Math.round((finished / total) * 100) + '%'
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
          this.userRole = user.userType || user.role || ''
          this.userSchool = user.school || ''
        }
      } catch (e) {
        // ignore
      }
      this.loadStatistics()
      this.loadList()
    },

    async loadStatistics() {
      this.statsLoading = true
      try {
        const params = {}
        if (this.isSuperAdmin && this.filters.school) params.school = this.filters.school
        const res = await api.raceResults.getStatistics(params)
        this.statistics = res.data || {}
      } catch (e) {
        this.showMessage('加载统计数据失败：' + e.message, 'error')
      } finally {
        this.statsLoading = false
      }
    },

    async loadList() {
      this.listLoading = true
      this.selectedIds = []
      try {
        const params = {
          page: this.pagination.page,
          pageSize: this.pagination.pageSize
        }
        if (this.filters.keyword) params.keyword = this.filters.keyword
        if (this.filters.gender) params.gender = this.filters.gender
        if (this.filters.teacherName) params.teacherName = this.filters.teacherName
        if (this.filters.startDate) params.startDate = this.filters.startDate
        if (this.filters.endDate) params.endDate = this.filters.endDate
        if (this.isSuperAdmin && this.filters.school) params.school = this.filters.school

        const res = await api.raceResults.getList(params)
        const data = res.data || {}
        this.list = data.list || []
        this.pagination.total = data.total || 0
        this.pagination.totalPages = data.totalPages || 1
        this.pagination.page = data.page || 1
      } catch (e) {
        this.showMessage('加载成绩列表失败：' + e.message, 'error')
      } finally {
        this.listLoading = false
      }
    },

    handleSearch() {
      this.pagination.page = 1
      this.loadStatistics()
      this.loadList()
    },

    resetFilters() {
      this.filters = { keyword: '', gender: '', teacherName: '', school: '', startDate: '', endDate: '' }
      this.pagination.page = 1
      this.loadStatistics()
      this.loadList()
    },

    changePage(page) {
      if (page < 1 || page > this.pagination.totalPages) return
      this.pagination.page = page
      this.loadList()
    },

    handlePageSizeChange() {
      this.pagination.page = 1
      this.loadList()
    },

    toggleSelect(id) {
      const idx = this.selectedIds.indexOf(id)
      if (idx === -1) this.selectedIds.push(id)
      else this.selectedIds.splice(idx, 1)
    },

    toggleSelectAll(e) {
      if (e.target.checked) {
        this.selectedIds = this.list.map(r => r.id)
      } else {
        this.selectedIds = []
      }
    },

    async openDetail(id) {
      this.detailVisible = true
      this.detail = null
      this.detailLoading = true
      try {
        const res = await api.raceResults.getDetail(id)
        this.detail = res.data || null
      } catch (e) {
        this.showMessage('加载详情失败：' + e.message, 'error')
        this.detailVisible = false
      } finally {
        this.detailLoading = false
      }
    },

    handleDelete(row) {
      this.pendingDeleteIds = [row.id]
      this.isBatchDelete = false
      this.deleteConfirmMsg = `确定要删除「${row.name}（${row.studentNumber}）」的成绩记录吗？此操作不可撤销。`
      this.deleteConfirmVisible = true
    },

    handleBatchDelete() {
      this.pendingDeleteIds = [...this.selectedIds]
      this.isBatchDelete = true
      this.deleteConfirmMsg = `确定要批量删除选中的 ${this.selectedIds.length} 条成绩记录吗？此操作不可撤销。`
      this.deleteConfirmVisible = true
    },

    async confirmDelete() {
      this.deleteLoading = true
      try {
        if (this.isBatchDelete) {
          const res = await api.raceResults.deleteBatch(this.pendingDeleteIds)
          const deleted = res.data?.deletedCount ?? this.pendingDeleteIds.length
          this.showMessage(`批量删除成功，共删除 ${deleted} 条记录`, 'success')
        } else {
          await api.raceResults.deleteOne(this.pendingDeleteIds[0])
          this.showMessage('删除成功', 'success')
        }
        this.deleteConfirmVisible = false
        this.selectedIds = []
        this.loadList()
        this.loadStatistics()
      } catch (e) {
        this.showMessage('删除失败：' + e.message, 'error')
      } finally {
        this.deleteLoading = false
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      return dateStr.replace('T', ' ').slice(0, 10)
    },

    formatDateTime(dateStr) {
      if (!dateStr) return '—'
      return dateStr.replace('T', ' ').slice(0, 19)
    },

    showMessage(text, type = 'success') {
      if (this.messageTimer) clearTimeout(this.messageTimer)
      this.message = { visible: true, type, text }
      this.messageTimer = setTimeout(() => {
        this.message.visible = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
/* ===== 整体布局 ===== */
.race-results {
  min-height: 100vh;
  background: var(--bg-body);
}

/* ===== 顶部导航 ===== */
.page-header {
  background: #ffffff;
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-xl);
  display: flex;
  align-items: center;
  height: var(--header-height);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #000000d9;
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s, color 0.15s;
}
.back-btn:hover { border-color: #1677ff; color: #1677ff; }
.back-btn svg { width: 16px; height: 16px; }

.page-info { display: flex; flex-direction: column; }
.page-title { font-size: 18px; font-weight: 600; color: #000000d9; margin: 0; }
.page-subtitle { font-size: 12px; color: #00000073; margin-top: 2px; }

/* ===== 主内容 ===== */
.main-content { padding: var(--spacing-xl) 0; }
.content-container { max-width: 1400px; margin: 0 auto; padding: 0 var(--spacing-xl); }

/* ===== 统计卡片 ===== */
.stats-section { margin-bottom: var(--spacing-xl); }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spacing-lg); }

.stat-card {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon svg { width: 24px; height: 24px; }

.stat-card.total .stat-icon   { background: #e6f4ff; color: #1677ff; }
.stat-card.finished .stat-icon { background: #f6ffed; color: #52c41a; }
.stat-card.unfinished .stat-icon { background: #fff2e8; color: #fa8c16; }
.stat-card.rate .stat-icon    { background: #f9f0ff; color: #722ed1; }

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 28px; font-weight: 700; color: #000000d9; line-height: 1.2; }
.stat-label { font-size: 13px; color: #00000073; margin-top: 4px; }

/* ===== 筛选区域 ===== */
.filter-section {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-card);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.filter-title { font-size: 14px; font-weight: 600; color: #000000d9; margin: 0; }
.reset-btn {
  padding: 4px 12px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: #000000d9;
  cursor: pointer;
  font-size: 13px;
  transition: border-color 0.15s;
}
.reset-btn:hover { border-color: #1677ff; color: #1677ff; }

.filter-form { display: flex; flex-direction: column; gap: 12px; }
.filter-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }

.filter-group { display: flex; flex-direction: column; gap: 4px; min-width: 160px; }
.filter-label { font-size: 12px; color: #00000073; font-weight: 500; }

.filter-input,
.filter-select {
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: #000000d9;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
}
.filter-input:focus,
.filter-select:focus { border-color: #1677ff; }

.filter-actions-group { justify-content: flex-end; }

.search-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 16px;
  background: #1677ff;
  border: none;
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.search-btn:hover { background: #4096ff; }
.search-btn svg { width: 14px; height: 14px; }

/* ===== 表格区域 ===== */
.table-section {
  background: #ffffff;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.result-count { font-size: 13px; color: #00000073; }
.selected-hint { font-size: 13px; color: #1677ff; margin-left: 12px; }

.batch-delete-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #fff;
  border: 1px solid #ff4d4f;
  border-radius: var(--radius-sm);
  color: #ff4d4f;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.batch-delete-btn:hover { background: #fff1f0; }
.batch-delete-btn svg { width: 14px; height: 14px; }

/* ===== 表格 ===== */
.table-wrapper { overflow-x: auto; }

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 60px 0;
  color: #00000073;
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead th {
  background: #f8f9fa;
  color: #000000d9;
  font-weight: 600;
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
}

.data-table .col-check { width: 40px; text-align: center; }

.data-row td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  color: #000000d9;
  vertical-align: middle;
}
.data-row:last-child td { border-bottom: none; }
.data-row:hover td { background: #f5f7ff; }

.empty-row td {
  padding: 60px 0;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: #00000040;
  font-size: 14px;
}
.empty-state svg { width: 40px; height: 40px; }

.name-cell { font-weight: 500; }
.time-cell .time-value { font-family: monospace; font-size: 14px; font-weight: 600; color: #1677ff; }
.time-cell .no-time { color: #00000040; }
.date-cell { color: #00000073; white-space: nowrap; }

/* 性别标签 */
.gender-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}
.gender-tag.male   { background: #e6f4ff; color: #1677ff; }
.gender-tag.female { background: #fff0f6; color: #c41d7f; }

/* 状态标签 */
.status-tag {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.status-tag.finished   { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.status-tag.unfinished { background: #fff2e8; color: #fa8c16; border: 1px solid #ffd591; }

/* 操作按钮 */
.action-btns { display: flex; gap: 6px; }
.action-btn {
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  border: 1px solid;
}
.action-btn.view   { background: #e6f4ff; border-color: #91caff; color: #1677ff; }
.action-btn.view:hover { background: #bae0ff; }
.action-btn.delete { background: #fff1f0; border-color: #ffa39e; color: #ff4d4f; }
.action-btn.delete:hover { background: #ffccc7; }

/* ===== 分页 ===== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-light);
}

.page-btn {
  padding: 5px 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: #fff;
  color: #000000d9;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}
.page-btn:hover:not(:disabled) { border-color: #1677ff; color: #1677ff; }
.page-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.page-info { font-size: 13px; color: #00000073; }

.page-size-select {
  height: 30px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: #fff;
  cursor: pointer;
}

/* ===== 弹窗遮罩 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* ===== 详情弹窗 ===== */
.modal-card {
  background: #fff;
  border-radius: 10px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border-light);
}
.modal-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0; }
.modal-close {
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: none; background: transparent; cursor: pointer;
  border-radius: 4px; color: #00000073;
}
.modal-close:hover { background: #f5f5f5; color: #000000d9; }
.modal-close svg { width: 16px; height: 16px; }

.modal-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 40px; color: #00000073;
}

.modal-body { padding: 24px; }

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label { font-size: 12px; color: #00000073; }
.detail-value { font-size: 14px; color: #000000d9; font-weight: 500; }
.detail-value.mono { font-family: monospace; font-size: 13px; }

/* ===== 确认弹窗 ===== */
.confirm-card {
  background: #fff;
  border-radius: 10px;
  width: 400px;
  max-width: 90vw;
  padding: 32px 28px 24px;
  text-align: center;
  box-shadow: 0 12px 40px rgba(0,0,0,0.18);
}

.confirm-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.confirm-icon.danger { background: #fff1f0; color: #ff4d4f; }
.confirm-icon svg { width: 26px; height: 26px; }

.confirm-title { font-size: 16px; font-weight: 600; color: #000000d9; margin: 0 0 8px; }
.confirm-msg { font-size: 14px; color: #00000073; line-height: 1.6; margin: 0 0 24px; }

.confirm-actions { display: flex; gap: 10px; justify-content: center; }

.confirm-cancel {
  flex: 1; max-width: 140px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: #fff;
  color: #000000d9;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.15s;
}
.confirm-cancel:hover { border-color: #1677ff; }

.confirm-ok {
  flex: 1; max-width: 140px;
  height: 36px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.confirm-ok.danger { background: #ff4d4f; color: #fff; }
.confirm-ok.danger:hover { background: #ff7875; }
.confirm-ok:disabled { opacity: 0.5; cursor: not-allowed; }

/* ===== 加载动画 ===== */
.loading-spinner {
  width: 20px; height: 20px;
  border: 2px solid #e8e8e8;
  border-top-color: #1677ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ===== 消息提示 ===== */
.message-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.message-toast.success { background: #f6ffed; color: #52c41a; border: 1px solid #b7eb8f; }
.message-toast.error   { background: #fff1f0; color: #ff4d4f; border: 1px solid #ffa39e; }

.msg-fade-enter-active,
.msg-fade-leave-active { transition: opacity 0.3s, transform 0.3s; }
.msg-fade-enter-from,
.msg-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(-10px); }

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .header-container { padding: 0 var(--spacing-md); }
  .content-container { padding: 0 var(--spacing-md); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: var(--spacing-md); }
  .filter-row { flex-direction: column; }
  .filter-group { min-width: unset; width: 100%; }
  .detail-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .stat-value { font-size: 22px; }
}
</style>
