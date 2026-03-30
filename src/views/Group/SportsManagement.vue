<template>
  <div class="sports-management">
    <!-- ═══ Toast 通知 ═══ -->
    <transition-group name="toast-slide" tag="div" class="toast-container">
      <div v-for="t in toasts" :key="t.id" :class="['toast', 'toast-' + t.type]">
        <span class="toast-icon">{{ t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'i' }}</span>
        <span class="toast-msg">{{ t.message }}</span>
        <button class="toast-close" @click="removeToast(t.id)">&times;</button>
      </div>
    </transition-group>

    <!-- ═══ 确认弹窗 ═══ -->
    <transition name="dialog-fade">
      <div v-if="confirmDialog.visible" class="dialog-overlay" @click.self="cancelConfirm">
        <div class="dialog-box confirm-dialog">
          <div class="dialog-header"><h3>{{ confirmDialog.title }}</h3></div>
          <div class="dialog-body"><p class="confirm-message">{{ confirmDialog.message }}</p></div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="cancelConfirm">取消</button>
            <button class="btn-danger" @click="doConfirm">{{ confirmDialog.confirmText || '确定' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <header class="page-header">
      <div class="header-container">
        <div class="header-left">
          <button class="back-btn" @click="$router.push('/group')">
            <svg viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            返回
          </button>
          <div class="module-info">
            <h1 class="module-title">运动会管理</h1>
            <p class="module-subtitle">Sports Meeting Management</p>
          </div>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="openCreate">
            <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            新建运动会
          </button>
        </div>
      </div>
    </header>

    <main class="page-content">
      <!-- 统计卡片 -->
      <div class="stats-bar">
        <div class="stat-card" v-for="s in statCards" :key="s.label">
          <span class="stat-number" :style="{ color: s.color }">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="skeleton-grid">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="sk-line sk-title"></div>
          <div class="sk-line sk-desc"></div>
          <div class="sk-line sk-meta"></div>
          <div class="sk-line sk-actions"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="meetings.length === 0" class="empty-state">
        <div class="empty-illustration">
          <svg viewBox="0 0 120 100" fill="none" width="120" height="100">
            <rect x="20" y="20" width="80" height="60" rx="8" stroke="currentColor" stroke-width="2" stroke-dasharray="4 3" />
            <path d="M60 40v20M50 50h20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h3>还没有运动会</h3>
        <p>创建你的第一个运动会，开始在线编排和管理</p>
        <button class="btn-primary btn-lg" @click="openCreate">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          新建运动会
        </button>
      </div>

      <!-- 运动会列表 -->
      <div v-else class="meeting-cards">
        <div v-for="(meeting, idx) in meetings" :key="meeting.id"
             class="meeting-card" :style="{ animationDelay: idx * 50 + 'ms' }"
             @click="goToDetail(meeting.id)">
          <div class="card-top">
            <h3 class="meeting-name">{{ meeting.name }}</h3>
            <span :class="['status-badge', 'status-' + meeting.status]">{{ statusLabel(meeting.status) }}</span>
          </div>
          <p class="meeting-desc">{{ meeting.description || '暂无描述' }}</p>
          <div class="meeting-meta">
            <div class="meta-item" v-if="meeting.startDate">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" stroke-width="2"/></svg>
              {{ meeting.startDate }} ~ {{ meeting.endDate || '待定' }}
            </div>
            <div class="meta-item" v-if="meeting.location">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/></svg>
              {{ meeting.location }}
            </div>
            <div class="meta-item" v-if="meeting.school">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" stroke-width="2"/></svg>
              {{ meeting.school }}
            </div>
          </div>
          <div class="card-footer">
            <span class="card-time" v-if="meeting.createdAt">{{ formatDate(meeting.createdAt) }}</span>
            <div class="card-actions" @click.stop>
              <button class="btn-text" @click="editMeeting(meeting)">编辑</button>
              <button class="btn-text danger" @click="confirmRemove(meeting)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ═══ 创建/编辑对话框 ═══ -->
    <transition name="dialog-fade">
      <div v-if="showCreateDialog" class="dialog-overlay" @click.self="closeDialog">
        <div class="dialog-box">
          <div class="dialog-header">
            <h3>{{ editingMeeting ? '编辑运动会' : '新建运动会' }}</h3>
            <button class="close-btn" @click="closeDialog">&times;</button>
          </div>
          <div class="dialog-body">
            <div class="form-group">
              <label>运动会名称 <span class="required">*</span></label>
              <input v-model="form.name" placeholder="如：2026年春季运动会" @keydown.enter="submitForm" ref="nameInput" />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="form.description" placeholder="运动会描述信息" rows="3"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>开始日期</label>
                <input v-model="form.startDate" type="date" />
              </div>
              <div class="form-group">
                <label>结束日期</label>
                <input v-model="form.endDate" type="date" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>地点</label>
                <input v-model="form.location" placeholder="如：校田径场" />
              </div>
              <div class="form-group">
                <label>学校</label>
                <input v-model="form.school" placeholder="所属学校" />
              </div>
            </div>
            <div class="form-group">
              <label>每人最多参赛项数</label>
              <input v-model.number="form.maxEventsPerPerson" type="number" min="1" max="10" />
            </div>
          </div>
          <div class="dialog-footer">
            <button class="btn-cancel" @click="closeDialog">取消</button>
            <button class="btn-primary" @click="submitForm" :disabled="submitting">
              <span v-if="submitting" class="btn-spinner"></span>
              {{ submitting ? '提交中...' : (editingMeeting ? '保存' : '创建') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import api from '@/services/api'

export default {
  name: 'SportsManagement',
  data() {
    return {
      meetings: [],
      loading: true,
      showCreateDialog: false,
      editingMeeting: null,
      submitting: false,
      form: this.getEmptyForm(),
      toasts: [],
      toastIdCounter: 0,
      confirmDialog: { visible: false, title: '', message: '', confirmText: '', resolve: null }
    }
  },
  computed: {
    statCards() {
      return [
        { label: '全部运动会', value: this.meetings.length, color: 'var(--primary-color, #409eff)' },
        { label: '进行中', value: this.meetings.filter(m => m.status === 'in_progress').length, color: '#67c23a' },
        { label: '已完成', value: this.meetings.filter(m => m.status === 'completed').length, color: '#909399' },
        { label: '草稿', value: this.meetings.filter(m => m.status === 'draft').length, color: '#e6a23c' }
      ]
    }
  },
  mounted() {
    this.loadMeetings()
    document.addEventListener('keydown', this.handleKey)
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKey)
  },
  methods: {
    // ── Toast ──────────────────────────────────────
    toast(message, type = 'success') {
      const id = ++this.toastIdCounter
      this.toasts.push({ id, message, type })
      setTimeout(() => this.removeToast(id), 3500)
    },
    removeToast(id) { this.toasts = this.toasts.filter(t => t.id !== id) },

    // ── 确认弹窗 ──────────────────────────────────
    showConfirm(title, message, confirmText = '确定') {
      return new Promise(resolve => {
        this.confirmDialog = { visible: true, title, message, confirmText, resolve }
      })
    },
    doConfirm() { this.confirmDialog.visible = false; if (this.confirmDialog.resolve) this.confirmDialog.resolve(true) },
    cancelConfirm() { this.confirmDialog.visible = false; if (this.confirmDialog.resolve) this.confirmDialog.resolve(false) },

    handleKey(e) {
      if (e.key === 'Escape') {
        if (this.confirmDialog.visible) this.cancelConfirm()
        else if (this.showCreateDialog) this.closeDialog()
      }
    },

    getEmptyForm() {
      return { name: '', description: '', startDate: '', endDate: '', location: '', school: '', maxEventsPerPerson: 3 }
    },

    async loadMeetings() {
      this.loading = true
      try {
        const res = await api.sportsMeeting.list({ page: 1, pageSize: 100 })
        this.meetings = (res.data && res.data.list) || []
      } catch (e) {
        this.toast('加载失败：' + (e.message || ''), 'error')
      } finally {
        this.loading = false
      }
    },

    goToDetail(id) {
      this.$router.push(`/group/sports-management/${id}`)
    },

    openCreate() {
      this.editingMeeting = null
      this.form = this.getEmptyForm()
      this.showCreateDialog = true
      this.$nextTick(() => { if (this.$refs.nameInput) this.$refs.nameInput.focus() })
    },

    editMeeting(meeting) {
      this.editingMeeting = meeting
      this.form = {
        name: meeting.name || '', description: meeting.description || '',
        startDate: meeting.startDate || '', endDate: meeting.endDate || '',
        location: meeting.location || '', school: meeting.school || '',
        maxEventsPerPerson: meeting.maxEventsPerPerson || 3
      }
      this.showCreateDialog = true
      this.$nextTick(() => { if (this.$refs.nameInput) this.$refs.nameInput.focus() })
    },

    closeDialog() {
      this.showCreateDialog = false
      this.editingMeeting = null
    },

    async submitForm() {
      if (!this.form.name) return this.toast('请输入运动会名称', 'warning')
      this.submitting = true
      try {
        if (this.editingMeeting) {
          await api.sportsMeeting.update(this.editingMeeting.id, this.form)
          this.toast('运动会已更新')
        } else {
          await api.sportsMeeting.create(this.form)
          this.toast('运动会已创建')
        }
        this.closeDialog()
        this.form = this.getEmptyForm()
        await this.loadMeetings()
      } catch (e) {
        this.toast(e.message || '操作失败', 'error')
      } finally {
        this.submitting = false
      }
    },

    async confirmRemove(meeting) {
      const ok = await this.showConfirm('删除运动会', `确定要删除"${meeting.name}"吗？所有相关的项目、报名、成绩数据都将被删除，此操作不可恢复。`, '删除')
      if (!ok) return
      try {
        await api.sportsMeeting.remove(meeting.id)
        this.toast('运动会已删除')
        await this.loadMeetings()
      } catch (e) {
        this.toast(e.message || '删除失败', 'error')
      }
    },

    statusLabel(status) {
      return { draft: '草稿', registration: '报名中', scheduling: '编排中', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }[status] || status
    },

    formatDate(dt) {
      if (!dt) return ''
      try { return dt.substring(0, 10) } catch { return dt }
    }
  }
}
</script>

<style scoped>
.sports-management { min-height: 100vh; background: var(--bg-primary, #f5f7fa); }

/* ── Header ────────────────────────────────────────────── */
.page-header { background: var(--bg-card, #fff); border-bottom: 1px solid var(--border-color, #e4e7ed); padding: 14px 24px; position: sticky; top: 0; z-index: 10; }
.header-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 16px; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 7px 14px; cursor: pointer; font-size: 13px; color: var(--text-secondary, #606266); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.back-btn svg { width: 16px; height: 16px; }
.module-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #303133); margin: 0; }
.module-subtitle { font-size: 12px; color: var(--text-secondary, #909399); margin: 2px 0 0; }

/* ── Buttons ───────────────────────────────────────────── */
.btn-primary { display: inline-flex; align-items: center; gap: 6px; background: var(--primary-color, #409eff); color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.btn-primary.btn-lg { padding: 12px 24px; font-size: 15px; }
.btn-cancel { background: var(--bg-primary, #f5f7fa); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 9px 18px; font-size: 14px; cursor: pointer; color: var(--text-secondary, #606266); }
.btn-danger { background: #f56c6c; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; font-size: 14px; cursor: pointer; }
.btn-text { background: none; border: none; padding: 4px 8px; font-size: 13px; color: var(--primary-color, #409eff); cursor: pointer; border-radius: 4px; transition: background 0.15s; }
.btn-text:hover { background: rgba(64,158,255,0.1); }
.btn-text.danger { color: #f56c6c; }
.btn-text.danger:hover { background: rgba(245,108,108,0.1); }
.btn-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.page-content { max-width: 1200px; margin: 0 auto; padding: 24px; }

/* ── Stats ──────────────────────────────────────────────── */
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 18px; text-align: center; border: 1px solid var(--border-color, #e4e7ed); transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.stat-number { display: block; font-size: 28px; font-weight: 700; }
.stat-label { font-size: 13px; color: var(--text-secondary, #909399); margin-top: 4px; display: block; }

/* ── 骨架屏 ──────────────────────────────────────────────── */
.skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
.skeleton-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e4e7ed); }
.sk-line { border-radius: 4px; background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
.sk-title { height: 20px; width: 60%; margin-bottom: 12px; }
.sk-desc { height: 14px; width: 90%; margin-bottom: 10px; }
.sk-meta { height: 14px; width: 40%; margin-bottom: 16px; }
.sk-actions { height: 14px; width: 30%; }
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

/* ── 空状态 ──────────────────────────────────────────────── */
.empty-state { text-align: center; padding: 80px 20px; }
.empty-illustration { color: var(--text-placeholder, #c0c4cc); margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; color: var(--text-primary, #303133); margin: 0 0 8px; }
.empty-state p { font-size: 14px; color: var(--text-secondary, #909399); margin: 0 0 24px; }

/* ── 运动会卡片 ──────────────────────────────────────────── */
.meeting-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
.meeting-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e4e7ed); cursor: pointer; transition: all 0.25s; animation: cardIn 0.35s ease backwards; }
.meeting-card:hover { border-color: var(--primary-color, #409eff); box-shadow: 0 6px 20px rgba(64,158,255,0.1); transform: translateY(-3px); }
@keyframes cardIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.meeting-name { font-size: 16px; font-weight: 600; color: var(--text-primary, #303133); margin: 0; }
.status-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; flex-shrink: 0; }
.status-draft { background: #f0f0f0; color: #909399; }
.status-registration { background: #fdf6ec; color: #e6a23c; }
.status-scheduling { background: #ecf5ff; color: #409eff; }
.status-in_progress { background: #f0f9eb; color: #67c23a; }
.status-completed { background: #f4f4f5; color: #909399; }
.status-cancelled { background: #fef0f0; color: #f56c6c; }
.meeting-desc { font-size: 13px; color: var(--text-secondary, #606266); margin: 0 0 12px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meeting-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 12px; }
.meta-item { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-secondary, #909399); }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border-color, #f0f0f0); }
.card-time { font-size: 12px; color: var(--text-placeholder, #c0c4cc); }
.card-actions { display: flex; gap: 8px; }

/* ── 弹窗 ────────────────────────────────────────────────── */
.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-box { background: var(--bg-card, #fff); border-radius: 16px; width: 560px; max-width: 90vw; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.confirm-dialog { width: 420px; }
.confirm-message { font-size: 14px; color: var(--text-primary, #303133); line-height: 1.6; margin: 0; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.dialog-header h3 { margin: 0; font-size: 17px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--text-secondary, #909399); padding: 0; line-height: 1; transition: color 0.15s; }
.close-btn:hover { color: var(--text-primary, #303133); }
.dialog-body { padding: 18px 24px; }
.dialog-footer { padding: 14px 24px 20px; display: flex; justify-content: flex-end; gap: 10px; }
.dialog-fade-enter-active { animation: dialogIn 0.25s ease; }
.dialog-fade-leave-active { animation: dialogOut 0.2s ease; }
@keyframes dialogIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dialogOut { from { opacity: 1; } to { opacity: 0; } }
.dialog-fade-enter-active .dialog-box { animation: dialogBoxIn 0.25s ease; }
@keyframes dialogBoxIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* ── 表单 ────────────────────────────────────────────────── */
.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 5px; }
.required { color: #f56c6c; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 9px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 14px; background: var(--bg-primary, #fff); color: var(--text-primary, #303133); box-sizing: border-box; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--primary-color, #409eff); box-shadow: 0 0 0 2px rgba(64,158,255,0.08); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* ── Toast ────────────────────────────────────────────────── */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 10px; font-size: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); min-width: 260px; max-width: 420px; }
.toast-success { background: #f0f9eb; border: 1px solid #e1f3d8; color: #67c23a; }
.toast-error { background: #fef0f0; border: 1px solid #fde2e2; color: #f56c6c; }
.toast-warning { background: #fdf6ec; border: 1px solid #faecd8; color: #e6a23c; }
.toast-info { background: #ecf5ff; border: 1px solid #d9ecff; color: #409eff; }
.toast-icon { width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
.toast-success .toast-icon { background: #67c23a; color: #fff; }
.toast-error .toast-icon { background: #f56c6c; color: #fff; }
.toast-warning .toast-icon { background: #e6a23c; color: #fff; }
.toast-info .toast-icon { background: #409eff; color: #fff; }
.toast-msg { flex: 1; }
.toast-close { background: none; border: none; font-size: 16px; cursor: pointer; color: inherit; opacity: 0.6; }
.toast-close:hover { opacity: 1; }
.toast-slide-enter-active { animation: toastIn 0.3s ease; }
.toast-slide-leave-active { animation: toastOut 0.25s ease; }
@keyframes toastIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes toastOut { from { opacity: 1; } to { opacity: 0; transform: translateX(40px); } }

/* ── 响应式 ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .meeting-cards, .skeleton-grid { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
