<template>
  <div class="sports-management">
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
          <button class="btn-primary" @click="showCreateDialog = true">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            新建运动会
          </button>
        </div>
      </div>
    </header>

    <main class="page-content">
      <div class="stats-bar">
        <div class="stat-card">
          <span class="stat-number">{{ meetings.length }}</span>
          <span class="stat-label">全部运动会</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ meetings.filter(m => m.status === 'in_progress').length }}</span>
          <span class="stat-label">进行中</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ meetings.filter(m => m.status === 'completed').length }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ meetings.filter(m => m.status === 'draft').length }}</span>
          <span class="stat-label">草稿</span>
        </div>
      </div>

      <div class="meetings-list">
        <div v-if="loading" class="loading-state">加载中...</div>
        <div v-else-if="meetings.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" width="48" height="48"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <p>暂无运动会，点击上方按钮新建</p>
        </div>
        <div v-else class="meeting-cards">
          <div v-for="meeting in meetings" :key="meeting.id" class="meeting-card" @click="goToDetail(meeting.id)">
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
            </div>
            <div class="card-actions">
              <button class="btn-text" @click.stop="editMeeting(meeting)">编辑</button>
              <button class="btn-text danger" @click.stop="removeMeeting(meeting)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 创建/编辑对话框 -->
    <div v-if="showCreateDialog" class="dialog-overlay" @click.self="showCreateDialog = false">
      <div class="dialog-box">
        <div class="dialog-header">
          <h3>{{ editingMeeting ? '编辑运动会' : '新建运动会' }}</h3>
          <button class="close-btn" @click="showCreateDialog = false">&times;</button>
        </div>
        <div class="dialog-body">
          <div class="form-group">
            <label>运动会名称 <span class="required">*</span></label>
            <input v-model="form.name" placeholder="如：2026年春季运动会" />
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
          <button class="btn-cancel" @click="showCreateDialog = false">取消</button>
          <button class="btn-primary" @click="submitForm" :disabled="submitting">
            {{ submitting ? '提交中...' : (editingMeeting ? '保存' : '创建') }}
          </button>
        </div>
      </div>
    </div>
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
      form: this.getEmptyForm()
    }
  },
  mounted() {
    this.loadMeetings()
  },
  methods: {
    getEmptyForm() {
      return { name: '', description: '', startDate: '', endDate: '', location: '', school: '', maxEventsPerPerson: 3 }
    },
    async loadMeetings() {
      this.loading = true
      try {
        const res = await api.sportsMeeting.list({ page: 1, pageSize: 100 })
        this.meetings = (res.data && res.data.list) || []
      } catch (e) {
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    goToDetail(id) {
      this.$router.push(`/group/sports-management/${id}`)
    },
    editMeeting(meeting) {
      this.editingMeeting = meeting
      this.form = {
        name: meeting.name || '',
        description: meeting.description || '',
        startDate: meeting.startDate || '',
        endDate: meeting.endDate || '',
        location: meeting.location || '',
        school: meeting.school || '',
        maxEventsPerPerson: meeting.maxEventsPerPerson || 3
      }
      this.showCreateDialog = true
    },
    async submitForm() {
      if (!this.form.name) return alert('请输入运动会名称')
      this.submitting = true
      try {
        if (this.editingMeeting) {
          await api.sportsMeeting.update(this.editingMeeting.id, this.form)
        } else {
          await api.sportsMeeting.create(this.form)
        }
        this.showCreateDialog = false
        this.editingMeeting = null
        this.form = this.getEmptyForm()
        await this.loadMeetings()
      } catch (e) {
        alert(e.message || '操作失败')
      } finally {
        this.submitting = false
      }
    },
    async removeMeeting(meeting) {
      if (!confirm(`确定要删除"${meeting.name}"吗？此操作将删除所有相关数据。`)) return
      try {
        await api.sportsMeeting.remove(meeting.id)
        await this.loadMeetings()
      } catch (e) {
        alert(e.message || '删除失败')
      }
    },
    statusLabel(status) {
      const map = { draft: '草稿', registration: '报名中', scheduling: '编排中', in_progress: '进行中', completed: '已完成', cancelled: '已取消' }
      return map[status] || status
    }
  }
}
</script>

<style scoped>
.sports-management { min-height: 100vh; background: var(--bg-primary, #f5f7fa); }
.page-header { background: var(--bg-card, #fff); border-bottom: 1px solid var(--border-color, #e4e7ed); padding: 16px 24px; position: sticky; top: 0; z-index: 10; }
.header-container { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 16px; }
.back-btn { display: flex; align-items: center; gap: 6px; background: none; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 8px 14px; cursor: pointer; font-size: 14px; color: var(--text-secondary, #606266); transition: all 0.2s; }
.back-btn:hover { border-color: var(--primary-color, #409eff); color: var(--primary-color, #409eff); }
.back-btn svg { width: 16px; height: 16px; }
.module-title { font-size: 20px; font-weight: 700; color: var(--text-primary, #303133); margin: 0; }
.module-subtitle { font-size: 12px; color: var(--text-secondary, #909399); margin: 2px 0 0; }
.btn-primary { display: flex; align-items: center; gap: 6px; background: var(--primary-color, #409eff); color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.page-content { max-width: 1200px; margin: 0 auto; padding: 24px; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--border-color, #e4e7ed); }
.stat-number { display: block; font-size: 28px; font-weight: 700; color: var(--primary-color, #409eff); }
.stat-label { font-size: 13px; color: var(--text-secondary, #909399); margin-top: 4px; display: block; }
.loading-state, .empty-state { text-align: center; padding: 80px 20px; color: var(--text-secondary, #909399); }
.empty-state svg { margin-bottom: 16px; color: var(--text-placeholder, #c0c4cc); }
.meeting-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
.meeting-card { background: var(--bg-card, #fff); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color, #e4e7ed); cursor: pointer; transition: all 0.2s; }
.meeting-card:hover { border-color: var(--primary-color, #409eff); box-shadow: 0 4px 12px rgba(64,158,255,0.1); transform: translateY(-2px); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.meeting-name { font-size: 16px; font-weight: 600; color: var(--text-primary, #303133); margin: 0; }
.status-badge { padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
.status-draft { background: #f0f0f0; color: #909399; }
.status-registration { background: #fdf6ec; color: #e6a23c; }
.status-scheduling { background: #ecf5ff; color: #409eff; }
.status-in_progress { background: #f0f9eb; color: #67c23a; }
.status-completed { background: #f4f4f5; color: #909399; }
.status-cancelled { background: #fef0f0; color: #f56c6c; }
.meeting-desc { font-size: 13px; color: var(--text-secondary, #606266); margin: 0 0 12px; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meeting-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 12px; }
.meta-item { display: flex; align-items: center; gap: 4px; font-size: 13px; color: var(--text-secondary, #909399); }
.card-actions { display: flex; gap: 12px; padding-top: 12px; border-top: 1px solid var(--border-color, #f0f0f0); }
.btn-text { background: none; border: none; padding: 4px 8px; font-size: 13px; color: var(--primary-color, #409eff); cursor: pointer; border-radius: 4px; }
.btn-text:hover { background: rgba(64,158,255,0.1); }
.btn-text.danger { color: #f56c6c; }
.btn-text.danger:hover { background: rgba(245,108,108,0.1); }

.dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dialog-box { background: var(--bg-card, #fff); border-radius: 16px; width: 560px; max-width: 90vw; max-height: 85vh; overflow-y: auto; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 0; }
.dialog-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary, #909399); padding: 0; line-height: 1; }
.dialog-body { padding: 20px 24px; }
.dialog-footer { padding: 16px 24px 20px; display: flex; justify-content: flex-end; gap: 12px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 14px; font-weight: 500; color: var(--text-primary, #303133); margin-bottom: 6px; }
.required { color: #f56c6c; }
.form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; font-size: 14px; background: var(--bg-primary, #fff); color: var(--text-primary, #303133); box-sizing: border-box; outline: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus, .form-group select:focus { border-color: var(--primary-color, #409eff); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.btn-cancel { background: var(--bg-primary, #f5f7fa); border: 1px solid var(--border-color, #dcdfe6); border-radius: 8px; padding: 10px 20px; font-size: 14px; cursor: pointer; color: var(--text-secondary, #606266); }

@media (max-width: 768px) {
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .meeting-cards { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
